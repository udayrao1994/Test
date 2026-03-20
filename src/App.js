import React, { useState } from "react";
import RouteOptimizer from "./components/RouteOptimizer";
import DataProcessing from "./components/Dataprocessing";
import SocialMediaPlatform from "./components/SocialMediaPlatform";

export default function App() {
  const [view, setView] = useState("route");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <div
        style={{
          maxWidth: 1152,
          margin: "0 auto",
          padding: 24,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontWeight: 800, color: "#0f172a" }}>Delivery Route App</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => setView("route")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: view === "route" ? "#2563eb" : "white",
              color: view === "route" ? "white" : "#334155",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Route Optimizer
          </button>
          <button
            type="button"
            onClick={() => setView("data")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: view === "data" ? "#2563eb" : "white",
              color: view === "data" ? "white" : "#334155",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Data Processing
          </button>
          <button
            type="button"
            onClick={() => setView("social")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: view === "social" ? "#2563eb" : "white",
              color: view === "social" ? "white" : "#334155",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Social Media Platform
          </button>
        </div>
      </div>

      {view === "route" ? (
        <RouteOptimizer />
      ) : view === "data" ? (
        <DataProcessing />
      ) : (
        <SocialMediaPlatform />
      )}
    </div>
  );
}