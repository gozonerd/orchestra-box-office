import React, { useEffect, useState } from "react";
import { useDatabase, SyncStatus } from "../hooks/useDatabase";

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onPageChange, currentPage }) => {
  const { getSyncStatus } = useDatabase();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    // Poll sync status every 5 seconds
    const interval = setInterval(async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    }, 5000);

    // Initial fetch
    getSyncStatus().then(setSyncStatus);

    return () => clearInterval(interval);
  }, [getSyncStatus]);

  const isOffline = false; // TODO: detect offline status
  const hasPendingSync = (syncStatus?.pending_count ?? 0) > 0;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Orchestra Box Office</h1>
          <span className="text-sm text-gray-500">ROI Tracking for AI Pipelines</span>
        </div>

        <div className="flex items-center space-x-6">
          {/* Sync Status */}
          <div className="flex items-center space-x-2">
            {isOffline ? (
              <>
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span className="text-sm text-gray-600">Offline</span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Online</span>
              </>
            )}
          </div>

          {/* Pending Syncs */}
          {hasPendingSync && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
              <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-sm text-yellow-800">
                {syncStatus?.pending_count} pending
              </span>
            </div>
          )}

          {/* User Menu Placeholder */}
          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </header>
  );
};
