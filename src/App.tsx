import React, { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  const [view, setView] = useState<"landing" | "dashboard">("landing");

  if (view === "landing") {
    return <LandingPage onStart={() => setView("dashboard")} />;
  }

  return <Dashboard onGoHome={() => setView("landing")} />;
}
