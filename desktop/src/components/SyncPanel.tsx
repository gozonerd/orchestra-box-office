import React, { useState } from "react";
import { useSync } from "../hooks/useSync";
import { formatSyncAge } from "../utils/sync";
import { ChevronDown, ChevronUp, RefreshCw, AlertCircle } from "lucide-react";

export const SyncPanel: React.FC = () => {
  const { syncStatus, lastError, triggerSync } = useSync();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    const success = await triggerSync();
    setIsSyncing(false);

    if (!success && lastError) {
      console.error("Sync failed:", lastError);
    }
  };

  const isPending = syncStatus.pending_count > 0;
  const hasError = lastError !== null;

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Sync Panel Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className={`w-3 h-3 rounded-full ${
              hasError
                ? "bg-red-500"
                : isPending
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-green-500"
            }`}
          ></div>

          {/* Status Text */}
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {syncStatus.in_progress
                ? "Syncing..."
                : isPending
                  ? `${syncStatus.pending_count} pending change${syncStatus.pending_count !== 1 ? "s" : ""}`
                  : "Synced"}
            </p>
            {syncStatus.last_sync && !isPending && (
              <p className="text-xs text-gray-500">
                Last sync: {formatSyncAge(syncStatus.last_sync)}
              </p>
            )}
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="text-gray-400">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {/* Error Display */}
          {hasError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">Sync Error</p>
                <p className="text-sm text-red-700">{lastError}</p>
              </div>
            </div>
          )}

          {/* Status Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending Changes</span>
              <span className="font-semibold text-gray-900">
                {syncStatus.pending_count}
              </span>
            </div>
            {syncStatus.last_sync && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Sync</span>
                <span className="text-gray-900">
                  {formatSyncAge(syncStatus.last_sync)}
                </span>
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
            <p>
              {isPending
                ? "Your changes are saved locally and will sync automatically when online."
                : "All changes are synced to the cloud."}
            </p>
          </div>

          {/* Manual Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing || (!isPending && !hasError)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={18}
              className={isSyncing ? "animate-spin" : ""}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-3 text-center">
            {isPending
              ? "Click 'Sync Now' to upload pending changes"
              : "No pending changes to sync"}
          </p>
        </div>
      )}
    </div>
  );
};
