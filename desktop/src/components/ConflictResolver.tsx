import React, { useState } from "react";
import { SyncConflict } from "../utils/sync";

interface ConflictResolverProps {
  conflict: SyncConflict;
  onResolve: (choice: "local_wins" | "remote_wins") => Promise<void>;
  isLoading?: boolean;
}

/**
 * UI component for resolving sync conflicts
 * Shows diff between local and remote data
 * Allows user to choose which version to keep
 */
export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  conflict,
  onResolve,
  isLoading = false,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<
    "local_wins" | "remote_wins" | null
  >(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async (choice: "local_wins" | "remote_wins") => {
    setIsResolving(true);
    setSelectedChoice(choice);
    try {
      await onResolve(choice);
    } finally {
      setIsResolving(false);
    }
  };

  const formatData = (data: any): string => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-yellow-500">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Conflict: {conflict.entity_type} {conflict.entity_id}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Local version */}
        <div className="bg-blue-50 rounded p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Your Version</h4>
          <p className="text-sm text-blue-700 mb-3">
            Changes on your device that haven't synced to cloud
          </p>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 border border-blue-100">
            {formatData(conflict.local_data)}
          </pre>
          <button
            onClick={() => handleResolve("local_wins")}
            disabled={isLoading || isResolving}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition"
          >
            {isResolving && selectedChoice === "local_wins"
              ? "Resolving..."
              : "Keep Your Version"}
          </button>
        </div>

        {/* Remote version */}
        <div className="bg-green-50 rounded p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Cloud Version</h4>
          <p className="text-sm text-green-700 mb-3">
            Latest version from cloud (may include other changes)
          </p>
          <pre className="bg-white p-3 rounded text-xs overflow-auto max-h-64 border border-green-100">
            {formatData(conflict.remote_data)}
          </pre>
          <button
            onClick={() => handleResolve("remote_wins")}
            disabled={isLoading || isResolving}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition"
          >
            {isResolving && selectedChoice === "remote_wins"
              ? "Resolving..."
              : "Use Cloud Version"}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Financial data (budgets, outcomes) requires
          careful review. Choose the version with the most recent accurate
          information.
        </p>
      </div>
    </div>
  );
};
