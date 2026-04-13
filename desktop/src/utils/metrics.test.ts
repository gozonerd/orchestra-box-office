import { describe, it, expect } from "vitest";
import {
  calculateROI,
  calculateCostPerOutcome,
  calculateBudgetUtilization,
  aggregateMetrics,
  getPipelineMetrics,
  getBudgetMetrics,
  formatCurrency,
} from "./metrics";
import { Pipeline, PipelineRun, Budget } from "../hooks/useDatabase";

describe("Metrics Utilities", () => {
  describe("calculateROI", () => {
    it("should calculate ROI correctly", () => {
      const roi = calculateROI(100, 5000); // 100 outcomes / $50 cost
      expect(roi).toBe(2);
    });

    it("should return 0 when cost is 0", () => {
      const roi = calculateROI(100, 0);
      expect(roi).toBe(0);
    });

    it("should handle fractional ROI", () => {
      const roi = calculateROI(333, 10000); // 333 / 100 * 100 = 333%
      expect(roi).toBe(333);
    });
  });

  describe("calculateCostPerOutcome", () => {
    it("should calculate cost per outcome correctly", () => {
      const cost = calculateCostPerOutcome(5000, 100); // $50 / 100 outcomes
      expect(cost).toBe(50);
    });

    it("should return 0 when outcomes is 0", () => {
      const cost = calculateCostPerOutcome(5000, 0);
      expect(cost).toBe(0);
    });

    it("should handle fractional costs", () => {
      const cost = calculateCostPerOutcome(1000, 3); // $10 / 3 = $3.33
      expect(cost).toBeCloseTo(333.33, 1);
    });
  });

  describe("calculateBudgetUtilization", () => {
    it("should calculate budget utilization correctly", () => {
      const util = calculateBudgetUtilization(5000, 10000); // 50%
      expect(util).toBe(50);
    });

    it("should return 0 when allocated is 0", () => {
      const util = calculateBudgetUtilization(5000, 0);
      expect(util).toBe(0);
    });

    it("should handle over-utilization", () => {
      const util = calculateBudgetUtilization(15000, 10000); // 150%
      expect(util).toBe(150);
    });
  });

  describe("aggregateMetrics", () => {
    it("should aggregate metrics from pipelines, runs, and budgets", () => {
      const pipelines: Pipeline[] = [
        { id: "p1", name: "Pipeline 1", description: "Test" },
      ];

      const runs: PipelineRun[] = [
        {
          id: "r1",
          pipeline_id: "p1",
          status: "completed",
          started_at: 1000,
          outcomes_count: 100,
        },
        {
          id: "r2",
          pipeline_id: "p1",
          status: "in_progress",
          started_at: 2000,
          outcomes_count: 50,
        },
      ];

      const budgets: Budget[] = [
        {
          id: "b1",
          pipeline_id: "p1",
          period: "2024-01",
          allocated_cents: 100000,
          spent_cents: 50000,
        },
      ];

      const metrics = aggregateMetrics(pipelines, runs, budgets);

      expect(metrics.totalPipelines).toBe(1);
      expect(metrics.totalOutcomes).toBe(150);
      expect(metrics.activeRunsCount).toBe(1);
      expect(metrics.budgetUtilization).toBe(50);
    });
  });

  describe("getPipelineMetrics", () => {
    it("should calculate per-pipeline metrics", () => {
      const pipelines: Pipeline[] = [
        { id: "p1", name: "Pipeline 1" },
        { id: "p2", name: "Pipeline 2" },
      ];

      const runs: PipelineRun[] = [
        {
          id: "r1",
          pipeline_id: "p1",
          status: "completed",
          started_at: 1000,
          outcomes_count: 100,
        },
        {
          id: "r2",
          pipeline_id: "p2",
          status: "completed",
          started_at: 2000,
          outcomes_count: 50,
        },
      ];

      const budgets: Budget[] = [
        {
          id: "b1",
          pipeline_id: "p1",
          period: "2024-01",
          allocated_cents: 100000,
          spent_cents: 50000,
        },
        {
          id: "b2",
          pipeline_id: "p2",
          period: "2024-01",
          allocated_cents: 100000,
          spent_cents: 25000,
        },
      ];

      const metrics = getPipelineMetrics(pipelines, runs, budgets);

      expect(metrics).toHaveLength(2);
      expect(metrics[0].pipelineId).toBe("p1");
      expect(metrics[0].outcomesCount).toBe(100);
      expect(metrics[0].costCents).toBe(50000);
      expect(metrics[1].pipelineId).toBe("p2");
      expect(metrics[1].outcomesCount).toBe(50);
    });
  });

  describe("getBudgetMetrics", () => {
    it("should calculate per-pipeline budget metrics", () => {
      const pipelines: Pipeline[] = [
        { id: "p1", name: "Pipeline 1" },
      ];

      const budgets: Budget[] = [
        {
          id: "b1",
          pipeline_id: "p1",
          period: "2024-01",
          allocated_cents: 100000,
          spent_cents: 60000,
        },
        {
          id: "b2",
          pipeline_id: "p1",
          period: "2024-02",
          allocated_cents: 50000,
          spent_cents: 40000,
        },
      ];

      const metrics = getBudgetMetrics(pipelines, budgets);

      expect(metrics).toHaveLength(1);
      expect(metrics[0].pipelineId).toBe("p1");
      expect(metrics[0].allocatedCents).toBe(150000);
      expect(metrics[0].spentCents).toBe(100000);
      expect(metrics[0].utilizationPercent).toBeCloseTo(66.67, 1);
    });
  });

  describe("formatCurrency", () => {
    it("should format cents as currency", () => {
      expect(formatCurrency(10000)).toBe("$100.00");
      expect(formatCurrency(5050)).toBe("$50.50");
      expect(formatCurrency(1)).toBe("$0.01");
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });
});
