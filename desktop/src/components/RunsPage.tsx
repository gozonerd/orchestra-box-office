import React, { useEffect, useState } from "react";
import { useDatabase, PipelineRun, Pipeline } from "../hooks/useDatabase";
import { formatCurrency } from "../utils/metrics";

export const RunsPage: React.FC = () => {
  const {
    listPipelines,
    listAllPipelineRuns,
    createPipelineRun,
    updatePipelineRunStatus,
    completePipelineRun,
  } = useDatabase();

  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState("");
  const [outcomesCount, setOutcomesCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [pipelinesList, runsList] = await Promise.all([
      listPipelines(),
      listAllPipelineRuns(),
    ]);
    setPipelines(pipelinesList);
    setRuns(runsList);
    if (pipelinesList.length > 0) {
      setSelectedPipelineId(pipelinesList[0].id);
    }
    setIsLoading(false);
  };

  const handleCreateRun = async () => {
    if (!selectedPipelineId || outcomesCount <= 0) return;

    const result = await createPipelineRun(
      selectedPipelineId,
      "in_progress",
      outcomesCount
    );

    if (result) {
      setOutcomesCount(0);
      setShowCreateForm(false);
      await loadData();
    }
  };

  const handleStatusChange = async (runId: string, newStatus: string) => {
    const success = await updatePipelineRunStatus(runId, newStatus);
    if (success) {
      await loadData();
    }
  };

  const handleCompleteRun = async (runId: string) => {
    const success = await completePipelineRun(runId);
    if (success) {
      await loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline runs...</p>
        </div>
      </div>
    );
  }

  const getPipelineName = (pipelineId: string): string => {
    const pipeline = pipelines.find((p) => p.id === pipelineId);
    return pipeline?.name || "Unknown Pipeline";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const calculateDuration = (startedAt: number, endedAt?: number): string => {
    const end = endedAt || Math.floor(Date.now() / 1000);
    const durationSeconds = end - startedAt;
    const minutes = Math.floor(durationSeconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Pipeline Runs</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {showCreateForm ? "Cancel" : "New Run"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Run
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
                Outcomes Count
              </label>
              <input
                type="number"
                min="1"
                value={outcomesCount}
                onChange={(e) => setOutcomesCount(parseInt(e.target.value) || 0)}
                placeholder="Number of outcomes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateRun}
                disabled={!selectedPipelineId || outcomesCount <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Run
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setOutcomesCount(0);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Runs List */}
      <div className="space-y-4">
        {runs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No pipeline runs yet</p>
          </div>
        ) : (
          runs.map((run) => (
            <div
              key={run.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getPipelineName(run.pipeline_id)}
                  </h3>
                  <p className="text-sm text-gray-500">Run ID: {run.id}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(run.status)}`}
                >
                  {getStatusLabel(run.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Outcomes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {run.outcomes_count}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateDuration(run.started_at, run.ended_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Started</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(run.started_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {run.ended_at ? "Ended" : "Last Update"}
                  </p>
                  <p className="text-sm text-gray-900">
                    {run.ended_at
                      ? formatDate(run.ended_at)
                      : formatDate(run.started_at)}
                  </p>
                </div>
              </div>

              {/* Status Transitions */}
              <div className="flex gap-2">
                {run.status === "in_progress" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(run.id, "paused")}
                      className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleCompleteRun(run.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange(run.id, "failed")}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition"
                    >
                      Mark Failed
                    </button>
                  </>
                )}
                {run.status === "paused" && (
                  <button
                    onClick={() => handleStatusChange(run.id, "in_progress")}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition"
                  >
                    Resume
                  </button>
                )}
                {(run.status === "completed" || run.status === "failed") && (
                  <span className="text-sm text-gray-500">No actions available</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
