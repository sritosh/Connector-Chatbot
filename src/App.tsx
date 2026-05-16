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
    console.log("App mounted, view:", view);
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session check:", session?.user ? "User present" : "No user");
      setUser(session?.user ?? null);
      if (session?.user) {
        setView("dashboard");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event, session?.user ? "User present" : "No user");
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        setView("dashboard");
      } else if (event === 'SIGNED_OUT') {
        setView("landing");
        setIsGuest(false);
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

  // Primary rendering logic based on 'view' state
  if (view === "auth") {
    return (
      <Auth 
        onGuestAccess={() => {
          console.log("Auth -> Guest Access");
          setIsGuest(true);
          setView("dashboard");
        }} 
      />
    );
  }

  if (view === "dashboard") {
    // If trying to access dashboard, check if authorized (user or guest)
    if (user || isGuest) {
      return <Dashboard onGoHome={() => setView("landing")} />;
    }
    // If not authorized, redirect to auth (or landing)
    // The user wants login to be optional, so maybe allow dashboard as guest by default?
    // Let's default to guest if they just click "Start Searching"
    console.log("Dashboard requested but not logged in. Defaulting to Guest.");
    setIsGuest(true);
    return <Dashboard onGoHome={() => setView("landing")} />;
  }

  // Default: Landing Page
  return (
    <LandingPage 
      onStart={() => {
        console.log("Landing -> Dashboard");
        setView("dashboard");
      }} 
      onLogin={() => {
        console.log("Landing -> Auth");
        setView("auth");
      }} 
    />
  );
}
