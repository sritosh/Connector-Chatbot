import React from "react";
import { Search, History, Bookmark, Settings, Zap, Home } from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onGoHome: () => void;
}

export function Sidebar({ activeTab, setActiveTab, onGoHome }: SidebarProps) {
  const menuItems = [
    { id: "search", icon: Search, label: "Discovery" },
    { id: "saved", icon: Bookmark, label: "Saved Contacts" },
    { id: "history", icon: History, label: "Search History" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="w-64 h-screen bg-sidebar-bg border-r border-border-subtle flex flex-col">
      <button 
        onClick={onGoHome}
        className="p-6 flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-left cursor-pointer group"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
          <Zap className="text-white w-5 h-5 fill-current" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-white">Connector</span>
      </button>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium",
              activeTab === item.id
                ? "bg-white/5 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              activeTab === item.id ? "text-blue-500 opacity-100" : "opacity-80"
            )} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={onGoHome}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors group text-sm font-medium"
        >
          <Home className="w-5 h-5 group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
