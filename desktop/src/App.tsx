import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

const App: React.FC = () => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize the app
    invoke("initialize_app")
      .then(() => {
        console.log("App initialized");
        setAppReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize app:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Orchestra Box Office</h1>
        <p className="text-gray-600 mt-2">
          ROI Tracking & Financial Reporting for AI Pipelines
        </p>
      </header>

      {appReady ? (
        <main className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700">
            Welcome to Orchestra Box Office. This application will be completed in Stage 08.
          </p>
        </main>
      ) : (
        <div className="text-center">
          <p className="text-gray-500">Initializing...</p>
        </div>
      )}
    </div>
  );
};

export default App;
