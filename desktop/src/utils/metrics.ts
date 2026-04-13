import Decimal from "decimal.js";
import { Pipeline, PipelineRun, Budget } from "../hooks/useDatabase";

export interface MetricsData {
  totalPipelines: number;
  totalCostCents: number;
  totalOutcomes: number;
  roiPercent: number;
  averageCostPerOutcome: number;
  budgetUtilization: number;
  activeRunsCount: number;
}

export interface PipelineMetrics {
  pipelineId: string;
  pipelineName: string;
  costCents: number;
  outcomesCount: number;
  costPerOutcome: number;
  runsCount: number;
}

export interface BudgetMetrics {
  pipelineId: string;
  pipelineName: string;
  allocatedCents: number;
  spentCents: number;
  utilizationPercent: number;
}

/**
 * Calculate ROI percentage (outcomes / cost * 100)
 * Outcomes are treated as "return" for ROI calculation
 */
export const calculateROI = (outcomesCount: number, costCents: number): number => {
  if (costCents === 0) return 0;
  const roi = new Decimal(outcomesCount)
    .dividedBy(new Decimal(costCents))
    .times(100)
    .toNumber();
  return Math.round(roi * 100) / 100;
};

/**
 * Calculate average cost per outcome
 */
export const calculateCostPerOutcome = (
  costCents: number,
  outcomesCount: number
): number => {
  if (outcomesCount === 0) return 0;
  const cost = new Decimal(costCents)
    .dividedBy(new Decimal(outcomesCount))
    .toNumber();
  return Math.round(cost * 100) / 100;
};

/**
 * Calculate budget utilization percentage
 */
export const calculateBudgetUtilization = (
  spentCents: number,
  allocatedCents: number
): number => {
  if (allocatedCents === 0) return 0;
  const utilization = new Decimal(spentCents)
    .dividedBy(new Decimal(allocatedCents))
    .times(100)
    .toNumber();
  return Math.round(utilization * 100) / 100;
};

/**
 * Aggregate metrics from pipelines, runs, and budgets
 */
export const aggregateMetrics = (
  pipelines: Pipeline[],
  runs: PipelineRun[],
  budgets: Budget[]
): MetricsData => {
  // Calculate total cost from runs
  const totalCost = runs.reduce((sum, run) => {
    // Cost per run = (budget spent for that pipeline) / (runs for that pipeline)
    const pipelineBudgets = budgets.filter((b) => b.pipeline_id === run.pipeline_id);
    const pipelineSpent = pipelineBudgets.reduce((s, b) => s + b.spent_cents, 0);
    const pipelineRuns = runs.filter((r) => r.pipeline_id === run.pipeline_id).length;
    if (pipelineRuns === 0) return sum;
    return sum + Math.ceil(pipelineSpent / pipelineRuns);
  }, 0);

  // Calculate total outcomes
  const totalOutcomes = runs.reduce((sum, run) => sum + run.outcomes_count, 0);

  // Active runs (not completed)
  const activeRuns = runs.filter((r) => r.status !== "completed").length;

  // Total budget allocated
  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated_cents, 0);

  // Total budget spent
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_cents, 0);

  const roi = calculateROI(totalOutcomes, totalCost);
  const costPerOutcome = calculateCostPerOutcome(totalCost, totalOutcomes);
  const budgetUtil = calculateBudgetUtilization(totalSpent, totalAllocated);

  return {
    totalPipelines: pipelines.length,
    totalCostCents: totalCost,
    totalOutcomes,
    roiPercent: roi,
    averageCostPerOutcome: costPerOutcome,
    budgetUtilization: budgetUtil,
    activeRunsCount: activeRuns,
  };
};

/**
 * Calculate per-pipeline metrics
 */
export const getPipelineMetrics = (
  pipelines: Pipeline[],
  runs: PipelineRun[],
  budgets: Budget[]
): PipelineMetrics[] => {
  return pipelines.map((pipeline) => {
    const pipelineRuns = runs.filter((r) => r.pipeline_id === pipeline.id);
    const pipelineBudgets = budgets.filter((b) => b.pipeline_id === pipeline.id);

    const totalCost = pipelineBudgets.reduce((sum, b) => sum + b.spent_cents, 0);
    const totalOutcomes = pipelineRuns.reduce((sum, r) => sum + r.outcomes_count, 0);
    const costPerOutcome = calculateCostPerOutcome(totalCost, totalOutcomes);

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      costCents: totalCost,
      outcomesCount: totalOutcomes,
      costPerOutcome,
      runsCount: pipelineRuns.length,
    };
  });
};

/**
 * Calculate per-pipeline budget metrics
 */
export const getBudgetMetrics = (
  pipelines: Pipeline[],
  budgets: Budget[]
): BudgetMetrics[] => {
  return pipelines.map((pipeline) => {
    const pipelineBudgets = budgets.filter((b) => b.pipeline_id === pipeline.id);
    const allocated = pipelineBudgets.reduce((sum, b) => sum + b.allocated_cents, 0);
    const spent = pipelineBudgets.reduce((sum, b) => sum + b.spent_cents, 0);

    return {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      allocatedCents: allocated,
      spentCents: spent,
      utilizationPercent: calculateBudgetUtilization(spent, allocated),
    };
  });
};

/**
 * Format cents as currency string
 */
export const formatCurrency = (cents: number): string => {
  const dollars = new Decimal(cents).dividedBy(100).toNumber();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
};
