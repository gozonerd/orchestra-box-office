import React, { useEffect, useState } from "react";
import { useDatabase, Budget, Pipeline } from "../hooks/useDatabase";
import { formatCurrency, getBudgetMetrics, BudgetMetrics } from "../utils/metrics";

export const BudgetPage: React.FC = () => {
  const {
    listPipelines,
    listAllBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useDatabase();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetMetrics, setBudgetMetrics] = useState<BudgetMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [allocatedAmount, setAllocatedAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [pipelinesList, budgetsList] = await Promise.all([
      listPipelines(),
      listAllBudgets(),
    ]);

    setPipelines(pipelinesList);
    setBudgets(budgetsList);

    // Calculate metrics
    const metrics = getBudgetMetrics(pipelinesList, budgetsList);
    setBudgetMetrics(metrics);

    if (pipelinesList.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelinesList[0].id);
    }

    setIsLoading(false);
  };

  const handleCreateBudget = async () => {
    if (!selectedPipelineId || allocatedAmount <= 0) return;

    const allocatedCents = Math.round(allocatedAmount * 100);
    const result = await createBudget(
      selectedPipelineId,
      period,
      allocatedCents,
      0 // spent_cents starts at 0
    );

    if (result) {
      setAllocatedAmount(0);
      setPeriod(new Date().toISOString().slice(0, 7));
      setShowCreateForm(false);
      await loadData();
    }
  };

  const handleUpdateSpent = async (budgetId: string, spentDollars: number) => {
    const spentCents = Math.round(spentDollars * 100);
    const success = await updateBudget(budgetId, spentCents);
    if (success) {
      await loadData();
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (confirm("Delete this budget? This cannot be undone.")) {
      const success = await deleteBudget(budgetId);
      if (success) {
        await loadData();
      }
    }
  };

  const getPipelineName = (pipelineId: string): string => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    return pipeline?.name || "Unknown Pipeline";
  };

  const getBudgetsByPipeline = (pipelineId: string): Budget[] => {
    return budgets.filter((b) => b.pipeline_id === pipelineId);
  };

  const getUtilizationColor = (utilization: number): string => {
    if (utilization >= 100) return "bg-red-500";
    if (utilization >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Budget Tracking</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showCreateForm ? "Cancel" : "New Budget"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create Budget
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pipeline
              </label>
              <select
                value={selectedPipelineId}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period (YYYY-MM)
              </label>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allocated Amount ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={allocatedAmount}
                onChange={(e) => setAllocatedAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateBudget}
                disabled={!selectedPipelineId || allocatedAmount <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setAllocatedAmount(0);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {budgetMetrics.map((metric) => (
          <div key={metric.pipelineId} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {metric.pipelineName}
            </h3>

            <div className="space-y-4">
              {/* Allocation */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Allocated</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(metric.allocatedCents)}
                  </span>
                </div>
              </div>

              {/* Spent */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(metric.spentCents)}
                  </span>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Utilization</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metric.utilizationPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${getUtilizationColor(metric.utilizationPercent)} h-3 rounded-full transition-all`}
                    style={{
                      width: `${Math.min(metric.utilizationPercent, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Remaining */}
              <div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span
                    className={`text-sm font-semibold ${
                      metric.utilizationPercent > 100
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      metric.allocatedCents - metric.spentCents
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Budget List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          All Budgets
        </h3>

        {budgets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No budgets created yet</p>
        ) : (
          <div className="space-y-4">
            {pipelines.map((pipeline) => {
              const pipelineBudgets = getBudgetsByPipeline(pipeline.id);
              if (pipelineBudgets.length === 0) return null;

              return (
                <div key={pipeline.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="text-md font-medium text-gray-900 mb-3">
                    {pipeline.name}
                  </h4>

                  <div className="space-y-3">
                    {pipelineBudgets.map((budget) => {
                      const utilization = (budget.spent_cents / budget.allocated_cents) * 100;
                      const spentDollars = budget.spent_cents / 100;

                      return (
                        <div
                          key={budget.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {budget.period}
                            </p>
                            <div className="flex gap-4 mt-1 text-xs text-gray-600">
                              <span>
                                Allocated: {formatCurrency(budget.allocated_cents)}
                              </span>
                              <span>
                                Spent: {formatCurrency(budget.spent_cents)}
                              </span>
                              <span
                                className={
                                  utilization > 100 ? "text-red-600" : ""
                                }
                              >
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleUpdateSpent(
                                  budget.id,
                                  spentDollars + 100
                                )
                              }
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                            >
                              +$100
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
