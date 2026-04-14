import React from "react";

interface SyncStatusIndicatorProps {
  isAuthenticated: boolean;
  syncInProgress: boolean;
  lastSyncTime?: number | null;
  pendingCount?: number;
  conflictCount?: number;
  syncErrors?: string[];
}

/**
 * Visual indicator of cloud sync status
 * Shows authentication state, pending entries, conflicts, and last sync time
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isAuthenticated,
  syncInProgress,
  lastSyncTime,
  pendingCount = 0,
  conflictCount = 0,
  syncErrors = [],
}) => {
  const getStatusColor = () => {
    if (syncErrors.length > 0) return "bg-red-500";
    if (conflictCount > 0) return "bg-yellow-500";
    if (pendingCount > 0) return "bg-blue-500";
    if (isAuthenticated) return "bg-green-500";
    return "bg-gray-400";
  };

  const getStatusText = () => {
    if (!isAuthenticated) return "Not authenticated";
    if (syncErrors.length > 0) return "Sync error";
    if (conflictCount > 0) return `${conflictCount} conflict${conflictCount !== 1 ? "s" : ""}`;
    if (pendingCount > 0) return `${pendingCount} pending`;
    if (syncInProgress) return "Syncing...";
    return "Synced";
  };

  const formatSyncTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = now - timestamp;

    if (diffSeconds < 60) return "Just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Status indicator dot */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${getStatusColor()} ${
            syncInProgress ? "animate-pulse" : ""
          }`}
        />
        <span className="text-sm font-medium text-gray-900">
          {getStatusText()}
        </span>
      </div>

      {/* Last sync time */}
      {lastSyncTime && (
        <span className="text-xs text-gray-600">
          Last sync: {formatSyncTime(lastSyncTime)}
        </span>
      )}

      {/* Error message */}
      {syncErrors.length > 0 && (
        <div className="text-xs text-red-600 flex-1">
          {syncErrors[0]}
        </div>
      )}

      {/* Status details */}
      <div className="flex gap-2 text-xs text-gray-600">
        {pendingCount > 0 && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {pendingCount} pending
          </span>
        )}
        {conflictCount > 0 && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {conflictCount} conflicts
          </span>
        )}
      </div>
    </div>
  );
};
