import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDatabase } from "../hooks/useDatabase";
import {
  aggregateMetrics,
  getPipelineMetrics,
  getBudgetMetrics,
  formatCurrency,
  MetricsData,
  PipelineMetrics,
  BudgetMetrics,
} from "../utils/metrics";

export const Dashboard: React.FC = () => {
  const { listPipelines, listAllPipelineRuns, listAllBudgets } = useDatabase();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics[]>([]);
  const [budgetMetrics, setBudgetMetrics] = useState<BudgetMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const [pipelines, runs, budgets] = await Promise.all([
        listPipelines(),
        listAllPipelineRuns(),
        listAllBudgets(),
      ]);

      const aggregated = aggregateMetrics(pipelines, runs, budgets);
      setMetrics(aggregated);
      setPipelineMetrics(getPipelineMetrics(pipelines, runs, budgets));
      setBudgetMetrics(getBudgetMetrics(pipelines, budgets));
    } catch (err) {
      console.error("Failed to load metrics:", err);
    }
    setIsLoading(false);
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare data for ROI trend chart
  const roiTrendData = pipelineMetrics.map((p) => ({
    name: p.pipelineName,
    ROI: p.costPerOutcome > 0 ? (1 / p.costPerOutcome) * 100 : 0,
  }));

  // Prepare data for cost per outcome chart
  const costPerOutcomeData = pipelineMetrics.map((p) => ({
    name: p.pipelineName,
    "Cost per Outcome": Math.round(p.costPerOutcome),
  }));

  // Prepare data for budget utilization chart
  const budgetUtilData = budgetMetrics.map((b) => ({
    name: b.pipelineName,
    Allocated: Math.round(b.allocatedCents / 100),
    Spent: Math.round(b.spentCents / 100),
  }));

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Pipelines"
          value={metrics.totalPipelines}
          unit=""
          color="blue"
        />
        <MetricCard
          title="Total Cost"
          value={formatCurrency(metrics.totalCostCents)}
          unit=""
          color="red"
        />
        <MetricCard
          title="Total Outcomes"
          value={metrics.totalOutcomes}
          unit=""
          color="green"
        />
        <MetricCard
          title="Active Runs"
          value={metrics.activeRunsCount}
          unit=""
          color="purple"
        />
      </div>

      {/* ROI and Budget Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <MetricCard
            title="ROI"
            value={metrics.roiPercent.toFixed(2)}
            unit="%"
            color="green"
            large
          />
        </div>
        <MetricCard
          title="Avg Cost per Outcome"
          value={formatCurrency(Math.round(metrics.averageCostPerOutcome * 100))}
          unit=""
          color="orange"
          large
        />
      </div>

      {/* Charts */}
      <div className="space-y-8">
        {/* ROI by Pipeline */}
        {roiTrendData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              ROI by Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ROI" fill="#3b82f6" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cost per Outcome */}
        {costPerOutcomeData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cost per Outcome by Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costPerOutcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Cost per Outcome" fill="#ef4444" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget Utilization */}
        {budgetUtilData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget Utilization by Pipeline
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetUtilData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Allocated" fill="#10b981" name="Allocated ($)" />
                <Bar dataKey="Spent" fill="#f59e0b" name="Spent ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Budget Utilization Percentage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Budget Utilization %
          </h3>
          <div className="space-y-4">
            {budgetMetrics.length > 0 ? (
              budgetMetrics.map((metric) => (
                <div key={metric.pipelineId} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {metric.pipelineName}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(metric.utilizationPercent, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {metric.utilizationPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No budget data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  color: "blue" | "red" | "green" | "purple" | "orange";
  large?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  color,
  large = false,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    red: "bg-red-50 border-red-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    orange: "bg-orange-50 border-orange-200",
  };

  const textColorClasses = {
    blue: "text-blue-900",
    red: "text-red-900",
    green: "text-green-900",
    purple: "text-purple-900",
    orange: "text-orange-900",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className={`${textColorClasses[color]} ${large ? "text-4xl" : "text-3xl"} font-bold`}>
        {value}
        {unit && <span className={`text-lg ml-1 ${textColorClasses[color]}`}>{unit}</span>}
      </p>
    </div>
  );
};
