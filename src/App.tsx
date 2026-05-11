import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { AuthPage } from "./components/AuthPage";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function App() {
  const [view, setView] = useState<"landing" | "auth" | "dashboard">("landing");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setView("dashboard");
      } else {
        // Only reset to landing if we are currently on the dashboard
        setView(prev => prev === "dashboard" ? "landing" : prev);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (view === "landing") {
    return <LandingPage onStart={() => setView("auth")} />;
  }

  if (view === "auth") {
    return <AuthPage onAuthComplete={() => setView("dashboard")} />;
  }

  return <Dashboard />;
}
