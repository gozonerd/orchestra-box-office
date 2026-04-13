import React from "react";

interface ErrorBannerProps {
  message: string;
  onClose: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-red-400">⚠️</div>
          <p className="text-red-800">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-400 hover:text-red-600 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};
