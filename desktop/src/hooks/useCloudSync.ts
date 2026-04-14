import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  ApiClient,
  DEFAULT_API_CONFIG,
  BatchSyncResponse,
} from "../utils/api-client";
import { SyncQueueEntry, SyncConflict } from "../utils/sync";
import { tracing } from "console";

/**
 * Hook for managing cloud sync operations
 *
 * Integrates Tauri IPC backend with cloud API client
 * Handles pending entries, conflicts, and authentication
 */
export const useCloudSync = () => {
  const [apiClient] = useState(() => new ApiClient(DEFAULT_API_CONFIG));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Auto-sync every 5 minutes if authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      syncToCloud();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Check if user is authenticated with cloud
   */
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      const authenticated = await apiClient.checkAuth();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Fetch pending count from Rust backend
        const count = await invoke<number>("get_pending_sync_count");
        setPendingCount(count);
      }

      return authenticated;
    } catch (err) {
      setIsAuthenticated(false);
      return false;
    }
  }, [apiClient]);

  /**
   * Authenticate with cloud API
   */
  const authenticate = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await apiClient.authenticate(email, password);
        if (result?.token) {
          // Store token in Rust backend secure storage
          await invoke("store_auth_token", { token: result.token });
          setIsAuthenticated(true);
          setSyncErrors([]);
          return true;
        }
        setIsAuthenticated(false);
        setSyncErrors(["Authentication failed"]);
        return false;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setSyncErrors([`Authentication error: ${msg}`]);
        setIsAuthenticated(false);
        return false;
      }
    },
    [apiClient]
  );

  /**
   * Sync pending entries to cloud
   */
  const syncToCloud = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      setSyncErrors(["Not authenticated with cloud"]);
      return false;
    }

    setSyncInProgress(true);
    setSyncErrors([]);

    try {
      // Fetch pending sync entries from Tauri backend
      const pendingEntries = await invoke<SyncQueueEntry[]>(
        "get_pending_sync_entries"
      );

      if (pendingEntries.length === 0) {
        setSyncInProgress(false);
        setLastSyncTime(Math.floor(Date.now() / 1000));
        setPendingCount(0);
        return true;
      }

      // Send to cloud API
      const { response, errors } = await apiClient.batchSync(pendingEntries);

      setSyncErrors(errors);

      // Process responses and update local database
      const conflictingEntries: SyncConflict[] = [];
      const failedEntries: SyncQueueEntry[] = [];
      const syncedIds: string[] = [];

      for (const syncResp of response.responses) {
        if (syncResp.conflict) {
          conflictingEntries.push(syncResp.conflict);
          // Mark as conflict in local DB
          await invoke("mark_sync_entry_conflict", {
            entityId: syncResp.entity_id,
            conflict: syncResp.conflict,
          });
        } else if (syncResp.synced && !syncResp.error) {
          syncedIds.push(syncResp.entity_id);
        } else if (!syncResp.synced && syncResp.error) {
          failedEntries.push(
            pendingEntries.find((e) => e.entity_id === syncResp.entity_id)!
          );
        }
      }

      // Mark successfully synced entries in local database
      if (syncedIds.length > 0) {
        await invoke("mark_sync_entries_synced", {
          entityIds: syncedIds,
          serverTimestamp: response.server_timestamp,
        });
      }

      // Update state
      setLastSyncTime(response.server_timestamp);
      setPendingCount(pendingEntries.length - syncedIds.length);
      setConflictCount(conflictingEntries.length);
      setSyncInProgress(false);

      return conflictingEntries.length === 0 && failedEntries.length === 0;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncErrors([`Sync failed: ${msg}`]);
      setSyncInProgress(false);
      return false;
    }
  }, [isAuthenticated, apiClient]);

  /**
   * Handle conflict resolution
   */
  const resolveConflict = useCallback(
    async (
      conflict: SyncConflict,
      resolution: "local_wins" | "remote_wins"
    ): Promise<boolean> => {
      try {
        // Notify cloud API of resolution
        const success = await apiClient.resolveConflict(conflict, resolution);

        if (success) {
          // Update local database
          const choice = resolution === "local_wins" ? "local" : "remote";
          await invoke("record_conflict_resolution", {
            entityId: conflict.entity_id,
            entityType: conflict.entity_type,
            choice,
          });

          setSyncErrors([]);
          setConflictCount((c) => Math.max(0, c - 1));
          return true;
        } else {
          setSyncErrors(["Failed to resolve conflict"]);
          return false;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setSyncErrors([`Resolution error: ${msg}`]);
        return false;
      }
    },
    [apiClient]
  );

  /**
   * Retry failed sync entries
   */
  const retryFailedSync = useCallback(async (): Promise<boolean> => {
    try {
      const failedEntries = await invoke<SyncQueueEntry[]>(
        "get_failed_sync_entries"
      );

      if (failedEntries.length === 0) {
        return true;
      }

      // Retry with exponential backoff
      for (const entry of failedEntries) {
        try {
          await apiClient.uploadEntry(entry);
          await invoke("mark_sync_entry_synced", {
            entityId: entry.entity_id,
          });
        } catch (err) {
          // Continue with next entry on retry failure
        }
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncErrors([`Retry failed: ${msg}`]);
      return false;
    }
  }, [apiClient]);

  /**
   * Trigger authentication modal/flow
   */
  const initiateAuth = useCallback(async (): Promise<void> => {
    setSyncErrors(["Please authenticate with your cloud account"]);
  }, []);

  return {
    isAuthenticated,
    lastSyncTime,
    syncInProgress,
    syncErrors,
    pendingCount,
    conflictCount,
    checkAuthStatus,
    authenticate,
    syncToCloud,
    resolveConflict,
    retryFailedSync,
    initiateAuth,
  };
};
