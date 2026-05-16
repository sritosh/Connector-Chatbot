import React, { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { Auth } from "./components/Auth";
import { supabase } from "./lib/supabase";
import { User } from "@supabase/supabase-js";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard" | "auth">("landing");
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setView("dashboard");
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        setView("dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === "auth") {
    return <Auth onGuestAccess={() => setView("landing")} />;
  }

  if (view === "landing" && !user && !isGuest) {
    return <LandingPage onStart={() => setView("dashboard")} onLogin={() => setView("auth")} />;
  }

  // If logged in or guest, or in dashboard view
  if (view === "dashboard" || user || isGuest) {
    return <Dashboard onGoHome={() => setView("landing")} />;
  }

  return <LandingPage onStart={() => setView("dashboard")} onLogin={() => setView("auth")} />;
}
