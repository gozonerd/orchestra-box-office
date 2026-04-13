import {
  SyncQueueEntry,
  SyncConflict,
  EntityType,
  SyncOperation,
} from "./sync";

/**
 * Cloud API client for Orchestra Box Office
 *
 * Handles communication with cloud backend for sync operations.
 * Implements exponential backoff, conflict resolution, and batch uploads.
 */

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  authToken?: string;
  timeout: number; // milliseconds
  maxRetries: number;
}

/**
 * Sync payload sent to cloud
 */
export interface SyncPayload {
  entity_type: EntityType;
  entity_id: string;
  operation: SyncOperation;
  data: Record<string, any>;
  local_version: number; // For conflict detection
  timestamp: number;
}

/**
 * Cloud response for synced entry
 */
export interface SyncResponse {
  entity_id: string;
  synced: boolean;
  remote_version?: number;
  conflict?: SyncConflict;
  error?: string;
}

/**
 * Batch sync request
 */
export interface BatchSyncRequest {
  entries: SyncPayload[];
  client_id: string; // For deduplication
}

/**
 * Batch sync response
 */
export interface BatchSyncResponse {
  synced_count: number;
  failed_count: number;
  conflict_count: number;
  responses: SyncResponse[];
  server_timestamp: number;
}

/**
 * API Client for cloud operations
 */
export class ApiClient {
  private config: ApiConfig;
  private retryCount: Map<string, number> = new Map();

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.config.authToken = token;
  }

  /**
   * Batch sync multiple entries to cloud
   */
  async batchSync(
    entries: SyncQueueEntry[]
  ): Promise<{ response: BatchSyncResponse; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Convert queue entries to sync payloads
      const payloads = entries.map((entry) => ({
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        operation: entry.operation as SyncOperation,
        data: JSON.parse(entry.payload),
        local_version: 1, // TODO: track versions in local DB
        timestamp: entry.created_at,
      }));

      const request: BatchSyncRequest = {
        entries: payloads,
        client_id: this.generateClientId(),
      };

      const response = await this.makeRequest<BatchSyncResponse>(
        "POST",
        "/api/v1/sync/batch",
        request
      );

      // Process responses for conflicts
      for (const syncResp of response.responses) {
        if (syncResp.conflict) {
          errors.push(
            `Conflict on ${syncResp.entity_id}: requires manual resolution`
          );
        }
      }

      return { response, errors };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Batch sync failed: ${msg}`);
      return {
        response: {
          synced_count: 0,
          failed_count: entries.length,
          conflict_count: 0,
          responses: [],
          server_timestamp: Math.floor(Date.now() / 1000),
        },
        errors,
      };
    }
  }

  /**
   * Upload a single entry (used for retries)
   */
  async uploadEntry(entry: SyncQueueEntry): Promise<SyncResponse | null> {
    try {
      const payload: SyncPayload = {
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        operation: entry.operation as SyncOperation,
        data: JSON.parse(entry.payload),
        local_version: 1,
        timestamp: entry.created_at,
      };

      const response = await this.makeRequest<SyncResponse>(
        "POST",
        `/api/v1/sync/entry/${entry.entity_type}`,
        payload
      );

      return response;
    } catch (err) {
      const retries = this.retryCount.get(entry.id) || 0;
      if (retries < this.config.maxRetries) {
        this.retryCount.set(entry.id, retries + 1);
        // Exponential backoff
        await this.delay(1000 * Math.pow(2, retries));
        return this.uploadEntry(entry);
      }
      return null;
    }
  }

  /**
   * Fetch remote data for conflict resolution
   */
  async fetchRemoteEntity(
    entityType: EntityType,
    entityId: string
  ): Promise<Record<string, any> | null> {
    try {
      const response = await this.makeRequest<{ data: Record<string, any> }>(
        "GET",
        `/api/v1/entities/${entityType}/${entityId}`
      );

      return response.data;
    } catch (err) {
      console.error(`Failed to fetch remote entity: ${err}`);
      return null;
    }
  }

  /**
   * Resolve a conflict on the cloud
   */
  async resolveConflict(
    conflict: SyncConflict,
    resolution: "local_wins" | "remote_wins"
  ): Promise<boolean> {
    try {
      await this.makeRequest(
        "POST",
        `/api/v1/conflicts/resolve`,
        {
          entity_type: conflict.entity_type,
          entity_id: conflict.entity_id,
          resolution,
        }
      );

      return true;
    } catch (err) {
      console.error(`Failed to resolve conflict: ${err}`);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<boolean> {
    try {
      await this.makeRequest("GET", "/api/v1/auth/status");
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Authenticate with email/password
   */
  async authenticate(
    email: string,
    password: string
  ): Promise<{ token: string } | null> {
    try {
      const response = await this.makeRequest<{ token: string }>(
        "POST",
        "/api/v1/auth/login",
        { email, password }
      );

      if (response.token) {
        this.setAuthToken(response.token);
      }

      return response;
    } catch (err) {
      console.error(`Authentication failed: ${err}`);
      return null;
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.authToken) {
      headers["Authorization"] = `Bearer ${this.config.authToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
      timeout: this.config.timeout,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(
          `API error ${response.status}: ${response.statusText}`
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Helper: delay for exponential backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

/**
 * Default API client configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: "https://api.orchestraboxoffice.com",
  timeout: 30000, // 30 seconds
  maxRetries: 3,
};
