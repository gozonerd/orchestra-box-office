import { describe, it, expect } from "vitest";
import {
  resolveConflict,
  validateFinancialData,
  calculateSyncStats,
  formatSyncAge,
  batchByEntityType,
  getTotalPendingChanges,
  SyncQueueEntry,
  SyncConflict,
} from "./sync";

describe("Sync Utilities", () => {
  describe("resolveConflict", () => {
    it("should require manual resolution for budget conflicts", () => {
      const conflict: SyncConflict = {
        entity_type: "Budget",
        entity_id: "b1",
        local_data: { allocated_cents: 10000, spent_cents: 5000 },
        remote_data: { allocated_cents: 10000, spent_cents: 6000 },
        resolution_strategy: "local_wins",
      };

      const resolved = resolveConflict(conflict);
      expect(resolved.resolution_strategy).toBe("manual");
    });

    it("should require manual resolution for outcomes count conflicts", () => {
      const conflict: SyncConflict = {
        entity_type: "PipelineRun",
        entity_id: "r1",
        local_data: { outcomes_count: 100 },
        remote_data: { outcomes_count: 120 },
        resolution_strategy: "local_wins",
      };

      const resolved = resolveConflict(conflict);
      expect(resolved.resolution_strategy).toBe("manual");
    });

    it("should prefer local for non-financial conflicts", () => {
      const conflict: SyncConflict = {
        entity_type: "Pipeline",
        entity_id: "p1",
        local_data: { name: "Local Name" },
        remote_data: { name: "Remote Name" },
        resolution_strategy: "local_wins",
      };

      const resolved = resolveConflict(conflict);
      expect(resolved.resolution_strategy).toBe("local_wins");
    });
  });

  describe("validateFinancialData", () => {
    it("should validate budget data correctly", () => {
      const data = {
        allocated_cents: 10000,
        spent_cents: 5000,
      };

      const result = validateFinancialData("Budget", data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject budget with spent > allocated", () => {
      const data = {
        allocated_cents: 10000,
        spent_cents: 15000,
      };

      const result = validateFinancialData("Budget", data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject negative budget amounts", () => {
      const data = {
        allocated_cents: -1000,
        spent_cents: 5000,
      };

      const result = validateFinancialData("Budget", data);
      expect(result.valid).toBe(false);
    });

    it("should validate pipeline run outcomes", () => {
      const data = { outcomes_count: 50 };

      const result = validateFinancialData("PipelineRun", data);
      expect(result.valid).toBe(true);
    });
  });

  describe("calculateSyncStats", () => {
    it("should calculate sync statistics correctly", () => {
      const entries: SyncQueueEntry[] = [
        {
          id: "1",
          entity_type: "Pipeline",
          entity_id: "p1",
          operation: "create",
          payload: "{}",
          created_at: 1000,
          synced_at: 2000,
        },
        {
          id: "2",
          entity_type: "Budget",
          entity_id: "b1",
          operation: "update",
          payload: "{}",
          created_at: 1500,
        },
        {
          id: "3",
          entity_type: "PipelineRun",
          entity_id: "r1",
          operation: "create",
          payload: "{}",
          created_at: 1200,
          error_message: "Network error",
        },
      ];

      const stats = calculateSyncStats(entries);

      expect(stats.synced).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.oldest_pending).toBe(1500);
    });
  });

  describe("formatSyncAge", () => {
    it("should format recent sync correctly", () => {
      const now = Math.floor(Date.now() / 1000);
      const recentTime = now - 30; // 30 seconds ago

      const formatted = formatSyncAge(recentTime);
      expect(formatted).toBe("just now");
    });

    it("should format minutes correctly", () => {
      const now = Math.floor(Date.now() / 1000);
      const minutesAgo = now - 300; // 5 minutes ago

      const formatted = formatSyncAge(minutesAgo);
      expect(formatted).toContain("m ago");
    });

    it("should format hours correctly", () => {
      const now = Math.floor(Date.now() / 1000);
      const hoursAgo = now - 7200; // 2 hours ago

      const formatted = formatSyncAge(hoursAgo);
      expect(formatted).toContain("h ago");
    });
  });

  describe("batchByEntityType", () => {
    it("should batch entries by entity type", () => {
      const entries: SyncQueueEntry[] = [
        {
          id: "1",
          entity_type: "Pipeline",
          entity_id: "p1",
          operation: "create",
          payload: "{}",
          created_at: 1000,
        },
        {
          id: "2",
          entity_type: "Budget",
          entity_id: "b1",
          operation: "update",
          payload: "{}",
          created_at: 1500,
        },
        {
          id: "3",
          entity_type: "Pipeline",
          entity_id: "p2",
          operation: "delete",
          payload: "{}",
          created_at: 1200,
        },
      ];

      const batches = batchByEntityType(entries);

      expect(batches.Pipeline).toHaveLength(2);
      expect(batches.Budget).toHaveLength(1);
      expect(batches.PipelineRun).toHaveLength(0);
    });
  });

  describe("getTotalPendingChanges", () => {
    it("should count only pending changes", () => {
      const entries: SyncQueueEntry[] = [
        {
          id: "1",
          entity_type: "Pipeline",
          entity_id: "p1",
          operation: "create",
          payload: "{}",
          created_at: 1000,
        },
        {
          id: "2",
          entity_type: "Budget",
          entity_id: "b1",
          operation: "update",
          payload: "{}",
          created_at: 1500,
          synced_at: 2000,
        },
        {
          id: "3",
          entity_type: "PipelineRun",
          entity_id: "r1",
          operation: "create",
          payload: "{}",
          created_at: 1200,
          error_message: "Network error",
        },
      ];

      const total = getTotalPendingChanges(entries);
      expect(total).toBe(1);
    });
  });
});
