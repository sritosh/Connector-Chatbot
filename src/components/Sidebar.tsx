import React from "react";
import { Search, History, Bookmark, Settings, LogOut, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: "search", icon: Search, label: "Discovery" },
    { id: "saved", icon: Bookmark, label: "Saved Contacts" },
    { id: "history", icon: History, label: "Search History" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <div className="w-64 h-screen bg-sidebar-bg border-r border-border-subtle flex flex-col">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Zap className="text-white w-5 h-5 fill-current" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-white">Connector</span>
      </div>

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

      <div className="p-6 border-t border-border-faint">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-red-400 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-xs">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
