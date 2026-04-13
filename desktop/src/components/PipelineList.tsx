import React, { useEffect, useState } from "react";
import { useDatabase, Pipeline } from "../hooks/useDatabase";

export const PipelineList: React.FC = () => {
  const { listPipelines, createPipeline, deletePipeline } = useDatabase();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPipelineName, setNewPipelineName] = useState("");
  const [newPipelineDesc, setNewPipelineDesc] = useState("");

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    setIsLoading(true);
    const result = await listPipelines();
    setPipelines(result);
    setIsLoading(false);
  };

  const handleCreate = async () => {
    if (!newPipelineName.trim()) return;

    const result = await createPipeline(
      newPipelineName,
      newPipelineDesc || undefined
    );

    if (result) {
      setNewPipelineName("");
      setNewPipelineDesc("");
      setShowCreateForm(false);
      await loadPipelines();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this pipeline?")) {
      const success = await deletePipeline(id);
      if (success) {
        await loadPipelines();
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Pipelines</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Pipeline"}
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Pipeline</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pipeline Name
              </label>
              <input
                type="text"
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Document Processing Pipeline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newPipelineDesc}
                onChange={(e) => setNewPipelineDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Pipeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading pipelines...</p>
        </div>
      ) : pipelines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">No pipelines yet</p>
          <p className="text-gray-500 text-sm">
            Create your first pipeline to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="bg-white rounded-lg shadow p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {pipeline.name}
                </h3>
                {pipeline.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {pipeline.description}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-2">{pipeline.id}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(pipeline.id)}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
