import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient, DEFAULT_API_CONFIG, SyncPayload } from "./api-client";
import { SyncQueueEntry } from "./sync";

// Mock fetch globally
global.fetch = vi.fn();

describe("ApiClient", () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient(DEFAULT_API_CONFIG);
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default config", () => {
      expect(client).toBeDefined();
    });

    it("should accept custom config", () => {
      const customConfig = {
        baseUrl: "https://custom.api.com",
        timeout: 60000,
        maxRetries: 5,
      };
      const customClient = new ApiClient(customConfig);
      expect(customClient).toBeDefined();
    });
  });

  describe("setAuthToken", () => {
    it("should set auth token", () => {
      const token = "test_token_12345";
      client.setAuthToken(token);
      expect(client).toBeDefined();
    });
  });

  describe("batchSync", () => {
    it("should send batch sync request to cloud", async () => {
      const mockResponse = {
        synced_count: 2,
        failed_count: 0,
        conflict_count: 0,
        responses: [
          { entity_id: "p1", synced: true },
          { entity_id: "b1", synced: true },
        ],
        server_timestamp: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const entries: SyncQueueEntry[] = [
        {
          id: "1",
          entity_type: "Pipeline",
          entity_id: "p1",
          operation: "create",
          payload: '{"name":"Pipeline"}',
          created_at: 1000,
        },
        {
          id: "2",
          entity_type: "Budget",
          entity_id: "b1",
          operation: "update",
          payload: '{"spent_cents":5000}',
          created_at: 1500,
        },
      ];

      const result = await client.batchSync(entries);

      expect(result.response.synced_count).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle sync errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(
        new Error("Network error")
      );

      const entries: SyncQueueEntry[] = [];
      const result = await client.batchSync(entries);

      expect(result.response.failed_count).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle conflicts in response", async () => {
      const mockResponse = {
        synced_count: 1,
        failed_count: 0,
        conflict_count: 1,
        responses: [
          {
            entity_id: "b1",
            synced: false,
            conflict: {
              entity_type: "Budget" as const,
              entity_id: "b1",
              local_data: { allocated_cents: 10000 },
              remote_data: { allocated_cents: 15000 },
              resolution_strategy: "manual" as const,
            },
          },
        ],
        server_timestamp: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const entries: SyncQueueEntry[] = [
        {
          id: "1",
          entity_type: "Budget",
          entity_id: "b1",
          operation: "update",
          payload: '{"allocated_cents":10000}',
          created_at: 1000,
        },
      ];

      const result = await client.batchSync(entries);

      expect(result.response.conflict_count).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("uploadEntry", () => {
    it("should upload single entry", async () => {
      const mockResponse = {
        entity_id: "p1",
        synced: true,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const entry: SyncQueueEntry = {
        id: "1",
        entity_type: "Pipeline",
        entity_id: "p1",
        operation: "create",
        payload: '{"name":"Pipeline"}',
        created_at: 1000,
      };

      const result = await client.uploadEntry(entry);

      expect(result?.synced).toBe(true);
    });
  });

  describe("checkAuth", () => {
    it("should check authentication status", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const isAuth = await client.checkAuth();

      expect(isAuth).toBe(true);
    });

    it("should handle auth check failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const isAuth = await client.checkAuth();

      expect(isAuth).toBe(false);
    });
  });

  describe("authenticate", () => {
    it("should authenticate user", async () => {
      const mockToken = "auth_token_xyz";
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: mockToken }),
      });

      const result = await client.authenticate("user@example.com", "password");

      expect(result?.token).toBe(mockToken);
    });

    it("should handle authentication failure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const result = await client.authenticate("user@example.com", "wrong");

      expect(result).toBeNull();
    });
  });

  describe("resolveConflict", () => {
    it("should resolve conflict with local_wins", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const conflict = {
        entity_type: "Budget" as const,
        entity_id: "b1",
        local_data: { allocated_cents: 10000 },
        remote_data: { allocated_cents: 15000 },
        resolution_strategy: "manual" as const,
      };

      const success = await client.resolveConflict(conflict, "local_wins");

      expect(success).toBe(true);
    });

    it("should resolve conflict with remote_wins", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const conflict = {
        entity_type: "Pipeline" as const,
        entity_id: "p1",
        local_data: { name: "Local" },
        remote_data: { name: "Remote" },
        resolution_strategy: "manual" as const,
      };

      const success = await client.resolveConflict(conflict, "remote_wins");

      expect(success).toBe(true);
    });
  });
});
