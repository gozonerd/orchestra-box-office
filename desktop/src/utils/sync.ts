import Decimal from "decimal.js";
import { Pipeline, PipelineRun, Budget } from "../hooks/useDatabase";

/**
 * Sync operation types
 */
export type SyncOperation = "create" | "update" | "delete";

/**
 * Entity types that can be synced
 */
export type EntityType = "Pipeline" | "PipelineRun" | "Budget";

/**
 * Sync queue entry representing a pending operation
 */
export interface SyncQueueEntry {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: string; // JSON string
  created_at: number; // unix timestamp
  synced_at?: number; // null until synced
  error_message?: string; // null unless sync failed
}

/**
 * Sync conflict when local and remote data diverge
 */
export interface SyncConflict {
  entity_type: EntityType;
  entity_id: string;
  local_data: Record<string, any>;
  remote_data: Record<string, any>;
  resolution_strategy: "local_wins" | "remote_wins" | "manual";
}

/**
 * Sync status tracking
 */
export interface SyncStatusData {
  pending_count: number;
  last_sync?: number;
  last_sync_error?: string;
  in_progress: boolean;
}

/**
 * Conflict resolution strategy for financial data
 *
 * Rule: Never auto-merge financial data (budgets, costs).
 * For financial conflicts, always require manual resolution.
 * For other data, local changes take precedence during offline operation.
 */
export const resolveConflict = (conflict: SyncConflict): SyncConflict => {
  // Financial data always requires manual resolution
  if (
    conflict.entity_type === "Budget" ||
    (conflict.entity_type === "PipelineRun" &&
      "outcomes_count" in conflict.local_data &&
      "outcomes_count" in conflict.remote_data &&
      conflict.local_data.outcomes_count !== conflict.remote_data.outcomes_count)
  ) {
    conflict.resolution_strategy = "manual";
    return conflict;
  }

  // For non-financial conflicts, prefer local (user's offline work)
  conflict.resolution_strategy = "local_wins";
  return conflict;
};

/**
 * Prepare entity for sync: validate financial data integrity
 */
export const validateFinancialData = (
  entity_type: EntityType,
  data: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (entity_type === "Budget") {
    if (data.allocated_cents === undefined || data.allocated_cents < 0) {
      errors.push("Budget allocated_cents must be non-negative");
    }
    if (data.spent_cents === undefined || data.spent_cents < 0) {
      errors.push("Budget spent_cents must be non-negative");
    }
    if (data.spent_cents > data.allocated_cents) {
      errors.push(
        "Budget spent_cents cannot exceed allocated_cents (will be flagged for review)"
      );
    }
  }

  if (entity_type === "PipelineRun") {
    if (data.outcomes_count === undefined || data.outcomes_count < 0) {
      errors.push("PipelineRun outcomes_count must be non-negative");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate sync statistics for display
 */
export const calculateSyncStats = (
  entries: SyncQueueEntry[]
): {
  pending: number;
  synced: number;
  failed: number;
  oldest_pending?: number;
} => {
  const pending = entries.filter((e) => !e.synced_at && !e.error_message);
  const synced = entries.filter((e) => e.synced_at && !e.error_message);
  const failed = entries.filter((e) => e.error_message);

  const oldest_pending =
    pending.length > 0
      ? Math.min(...pending.map((e) => e.created_at))
      : undefined;

  return {
    pending: pending.length,
    synced: synced.length,
    failed: failed.length,
    oldest_pending,
  };
};

/**
 * Format sync age for display (e.g., "2 hours ago")
 */
export const formatSyncAge = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const ageSeconds = now - timestamp;

  if (ageSeconds < 60) {
    return "just now";
  }

  const ageMinutes = Math.floor(ageSeconds / 60);
  if (ageMinutes < 60) {
    return `${ageMinutes}m ago`;
  }

  const ageHours = Math.floor(ageMinutes / 60);
  if (ageHours < 24) {
    return `${ageHours}h ago`;
  }

  const ageDays = Math.floor(ageHours / 24);
  return `${ageDays}d ago`;
};

/**
 * Batch sync entries by entity type for efficient cloud API calls
 */
export const batchByEntityType = (
  entries: SyncQueueEntry[]
): Record<EntityType, SyncQueueEntry[]> => {
  const batches: Record<EntityType, SyncQueueEntry[]> = {
    Pipeline: [],
    PipelineRun: [],
    Budget: [],
  };

  for (const entry of entries) {
    batches[entry.entity_type].push(entry);
  }

  return batches;
};

/**
 * Calculate total pending changes for dashboard display
 */
export const getTotalPendingChanges = (entries: SyncQueueEntry[]): number => {
  return entries.filter((e) => !e.synced_at && !e.error_message).length;
};
