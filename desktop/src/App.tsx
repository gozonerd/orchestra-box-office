import React, { useEffect, useState } from "react";
import { useDatabase } from "./hooks/useDatabase";
import { PipelineList, Dashboard, RunsPage } from "./components";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ErrorBanner } from "./components/ErrorBanner";

type Page = "dashboard" | "pipelines" | "runs" | "budgets" | "settings";

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { error, setError } = useDatabase();

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      console.log("App initialized");
      setAppReady(true);
    }, 300);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header onPageChange={setCurrentPage} currentPage={currentPage} />

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {appReady ? (
            <div className="p-8">
              {currentPage === "dashboard" && <Dashboard />}
              {currentPage === "pipelines" && <PipelineList />}
              {currentPage === "runs" && <RunsPage />}
              {currentPage === "budgets" && <BudgetsPage />}
              {currentPage === "settings" && <SettingsPage />}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-500">Initializing Orchestra Box Office...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Placeholder pages
const BudgetsPage: React.FC = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Budget Tracking</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Budget information will be displayed here</p>
    </div>
  </div>
);

const SettingsPage: React.FC = () => (
  <div>
    <h2 className="text-3xl font-bold text-gray-900 mb-6">Settings</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-gray-600">Settings will be available here</p>
    </div>
  </div>
);

export default App;
