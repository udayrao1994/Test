import React, { useState } from "react";
import RouteOptimizer from "./components/RouteOptimizer";
import DataProcessing from "./components/Dataprocessing";
import SocialMediaPlatform from "./components/SocialMediaPlatform";

export default function App() {
  const [view, setView] = useState("route");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <style>{`
        .app-header {
          max-width: 1152px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .app-header-brand {
          font-weight: 800;
          color: #0f172a;
          border: 1px solid #2563eb;
          background: #ffffff;
          padding: 10px 14px;
          border-radius: 12px;
        }
        .app-header-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        @media (max-width: 640px) {
          .app-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .app-header-buttons {
            width: 100%;
            justify-content: flex-start;
          }
          .app-header-buttons button {
            width: 100%;
          }
        }
      `}</style>
      <div className="app-header">
        <div className="app-header-brand">Test Applications</div>
        <div className="app-header-buttons">
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