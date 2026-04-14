import React from "react";

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pipelines", label: "Pipelines", icon: "⚙️" },
    { id: "runs", label: "Runs", icon: "▶️" },
    { id: "budgets", label: "Budgets", icon: "💰" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const devItems = [
    { id: "design-system", label: "Design System", icon: "🎨" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
              currentPage === item.id
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="pt-4 mt-2 border-t border-gray-100">
          <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dev Tools</p>
          {devItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                currentPage === item.id
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-t border-gray-200 mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Cost</span>
            <span className="font-semibold text-gray-900">-</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ROI</span>
            <span className="font-semibold text-gray-900">-</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Outcomes</span>
            <span className="font-semibold text-gray-900">-</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
