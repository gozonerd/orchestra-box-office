import { useCallback, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  SyncQueueEntry,
  SyncStatusData,
  SyncConflict,
  resolveConflict,
  calculateSyncStats,
  batchByEntityType,
} from "../utils/sync";

/**
 * Hook for managing sync operations and status
 */
export const useSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatusData>({
    pending_count: 0,
    in_progress: false,
  });
  const [syncQueue, setSyncQueue] = useState<SyncQueueEntry[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Fetch current sync status
   */
  const getSyncStatus = useCallback(async (): Promise<SyncStatusData | null> => {
    try {
      const result = await invoke<{
        pending_count: number;
        last_sync?: number;
      }>("get_sync_status");

      const status: SyncStatusData = {
        pending_count: result.pending_count,
        last_sync: result.last_sync,
        in_progress: false,
      };

      setSyncStatus(status);
      setLastError(null);
      return status;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(`Failed to get sync status: ${msg}`);
      return null;
    }
  }, []);

  /**
   * Trigger manual sync (uploads pending changes to cloud)
   */
  const triggerSync = useCallback(async (): Promise<boolean> => {
    try {
      setSyncStatus((prev) => ({ ...prev, in_progress: true }));
      setLastError(null);

      // In a real implementation, this would:
      // 1. Call cloud API with pending sync queue entries
      // 2. Handle conflicts
      // 3. Mark entries as synced_at
      // 4. Update local cache with remote data

      // Simulated success for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await getSyncStatus();
      setSyncStatus((prev) => ({ ...prev, in_progress: false }));
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(`Sync failed: ${msg}`);
      setSyncStatus((prev) => ({ ...prev, in_progress: false }));
      return false;
    }
  }, [getSyncStatus]);

  /**
   * Retry a failed sync entry
   */
  const retrySyncEntry = useCallback(
    async (entryId: string): Promise<boolean> => {
      try {
        // Find the failed entry
        const entry = syncQueue.find((e) => e.id === entryId);
        if (!entry) {
          setLastError("Sync entry not found");
          return false;
        }

        // Clear the error and retry
        // In a real implementation, this would re-attempt the cloud API call

        setLastError(null);
        await getSyncStatus();
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(`Failed to retry sync: ${msg}`);
        return false;
      }
    },
    [syncQueue, getSyncStatus]
  );

  /**
   * Resolve a sync conflict
   */
  const handleConflict = useCallback(
    async (
      conflict: SyncConflict
    ): Promise<{ resolved: boolean; error?: string }> => {
      try {
        const resolved = resolveConflict(conflict);

        // In a real implementation, this would:
        // 1. Store the resolution choice
        // 2. Apply the chosen version to the database
        // 3. Mark the sync entry as resolved

        setLastError(null);
        return { resolved: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setLastError(`Failed to resolve conflict: ${msg}`);
        return { resolved: false, error: msg };
      }
    },
    []
  );

  /**
   * Clear old synced entries (cleanup)
   */
  const clearSyncedEntries = useCallback(async (): Promise<boolean> => {
    try {
      // In a real implementation, this would delete old synced entries
      // from the local sync_queue table to avoid database bloat

      setLastError(null);
      await getSyncStatus();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(`Failed to clear synced entries: ${msg}`);
      return false;
    }
  }, [getSyncStatus]);

  /**
   * Poll sync status at regular intervals
   */
  useEffect(() => {
    // Initial status fetch
    getSyncStatus();

    // Poll every 30 seconds if there are pending changes
    const interval = setInterval(() => {
      getSyncStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [getSyncStatus]);

  return {
    syncStatus,
    syncQueue,
    lastError,
    getSyncStatus,
    triggerSync,
    retrySyncEntry,
    handleConflict,
    clearSyncedEntries,
  };
};
