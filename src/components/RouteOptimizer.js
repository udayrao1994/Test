import React, { useState, useCallback, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Play, 
  RotateCcw, 
  Plus, 
  Info, 
  Navigation,
  Trash2,
  BarChart3
} from 'lucide-react';

/**
 * UTILITY FUNCTIONS
 */
const calculateDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const INITIAL_DEPOT = { id: 'depot', x: 50, y: 50, label: 'Central Depot' };

const RouteOptimizer = () => {
  const [locations, setLocations] = useState([]);
  const [truckCount, setTruckCount] = useState(2);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [results, setResults] = useState(null);
  const containerRef = useRef(null);

  const handleMapClick = (e) => {
    if (isOptimizing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newLoc = {
      id: Date.now(),
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      label: `Stop #${locations.length + 1}`
    };
    
    setLocations([...locations, newLoc]);
    setResults(null);
  };

  const clearLocations = () => {
    setLocations([]);
    setResults(null);
  };

  const optimizeRoutes = useCallback(() => {
    if (locations.length === 0) return;
    setIsOptimizing(true);

    setTimeout(() => {
      let unvisited = [...locations];
      let routes = Array.from({ length: truckCount }, () => [INITIAL_DEPOT]);
      let totalDistance = 0;

      while (unvisited.length > 0) {
        for (let i = 0; i < truckCount && unvisited.length > 0; i++) {
          let currentPos = routes[i][routes[i].length - 1];
          let closestIdx = 0;
          let minDist = calculateDistance(currentPos, unvisited[0]);

          for (let j = 1; j < unvisited.length; j++) {
            const d = calculateDistance(currentPos, unvisited[j]);
            if (d < minDist) {
              minDist = d;
              closestIdx = j;
            }
          }

          const nextStop = unvisited.splice(closestIdx, 1)[0];
          routes[i].push(nextStop);
          totalDistance += minDist;
        }
      }

      routes.forEach((route) => {
        const lastStop = route[route.length - 1];
        totalDistance += calculateDistance(lastStop, INITIAL_DEPOT);
        route.push(INITIAL_DEPOT);
      });

      setResults({
        routes,
        totalDistance: Math.round(totalDistance * 10) / 10,
        avgPerTruck: Math.round((totalDistance / truckCount) * 10) / 10
      });
      setIsOptimizing(false);
    }, 800);
  }, [locations, truckCount]);

  const routeColors = ['#3b82f6', '#a855f7', '#f97316', '#10b981', '#ec4899'];

  return (
    <div className="app-container">
      <style>{`
        .app-container {
          min-height: 100vh;
          background-color: #f8fafc;
          color: #0f172a;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 32px;
        }
        .app-grid {
          max-width: 1152px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 32px;
        }
        @media (max-width: 850px) {
          .app-grid { grid-template-columns: 1fr; }
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .logo-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .icon-wrapper {
          padding: 8px;
          background-color: #2563eb;
          border-radius: 8px;
          color: white;
          display: flex;
        }
        .card {
          background-color: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        .btn-primary {
          width: 100%;
          padding: 12px;
          background-color: #2563eb;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          transition: background-color 0.2s;
        }
        .btn-primary:hover { background-color: #1d4ed8; }
        .btn-primary:disabled {
          background-color: #cbd5e1;
          cursor: not-allowed;
        }
        .btn-secondary {
          width: 100%;
          padding: 12px;
          background-color: white;
          border: 1px solid #e2e8f0;
          color: #475569;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
        }
        .map-area {
          position: relative;
          min-height: 500px;
          background-color: white;
          border-radius: 32px;
          border: 4px solid white;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          overflow: hidden;
          cursor: crosshair;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .legend {
          position: absolute;
          top: 24px;
          left: 24px;
          z-index: 10;
          background-color: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 9999px;
          display: flex;
          gap: 16px;
          font-size: 12px;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .analytic-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .analytic-box {
          padding: 12px;
          background-color: #f8fafc;
          border-radius: 12px;
        }
        .info-banner {
          padding: 16px;
          background-color: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          display: flex;
          gap: 12px;
          color: #1e40af;
          font-size: 12px;
        }
        .location-badge {
          flex-shrink: 0;
          background-color: white;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .empty-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
      `}</style>

      <div className="app-grid">
        {/* Left Panel */}
        <div className="sidebar">
          <header>
            <div className="logo-box">
              <div className="icon-wrapper"><Navigation size={24} /></div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>RouteMaster</h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Advanced Logistics Optimizer</p>
          </header>

          <section className="card">
            <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
              <Truck size={18} color="#2563eb" /> Fleet Configuration
            </h2>
            
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
              Number of Trucks: {truckCount}
            </label>
            <input 
              type="range" min="1" max="5" value={truckCount}
              onChange={(e) => setTruckCount(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />

            <button className="btn-primary" onClick={optimizeRoutes} disabled={locations.length === 0 || isOptimizing}>
              {isOptimizing ? "Optimizing..." : <><Play size={18} /> Calculate Route</>}
            </button>
            <button className="btn-secondary" onClick={clearLocations}>
              <RotateCcw size={18} /> Reset Map
            </button>
          </section>

          {results && (
            <section className="card">
              <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BarChart3 size={18} color="#2563eb" /> Efficiency Report
              </h2>
              <div className="analytic-grid">
                <div className="analytic-box">
                  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 4px 0' }}>TOTAL DIST.</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{results.totalDistance} km</p>
                </div>
                <div className="analytic-box">
                  <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', margin: '0 0 4px 0' }}>AVG / TRUCK</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{results.avgPerTruck} km</p>
                </div>
              </div>
            </section>
          )}

          <div className="info-banner">
            <Info size={20} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}>
              Click on the map to add delivery stops. The algorithm will partition space to minimize travel.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div ref={containerRef} onClick={handleMapClick} className="map-area">
            <div className="legend">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Depot
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Stop
              </div>
            </div>

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {results && results.routes.map((route, routeIdx) => (
                <g key={`route-${routeIdx}`}>
                  {route.map((loc, i) => {
                    if (i === 0) return null;
                    const prev = route[i - 1];
                    return (
                      <line 
                        key={`line-${routeIdx}-${i}`}
                        x1={`${prev.x}%`} y1={`${prev.y}%`}
                        x2={`${loc.x}%`} y2={`${loc.y}%`}
                        stroke={routeColors[routeIdx]}
                        strokeWidth="3"
                        strokeOpacity="0.6"
                        strokeLinecap="round"
                        strokeDasharray={loc.id === 'depot' || prev.id === 'depot' ? "4 4" : "0"}
                      />
                    );
                  })}
                </g>
              ))}

              <circle cx={`${INITIAL_DEPOT.x}%`} cy={`${INITIAL_DEPOT.y}%`} r="10" fill="#ef4444" />
              <text x={`${INITIAL_DEPOT.x}%`} y={`${INITIAL_DEPOT.y - 3}%`} textAnchor="middle" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#b91c1c' }}>DEPOT</text>

              {locations.map((loc) => (
                <circle key={loc.id} cx={`${loc.x}%`} cy={`${loc.y}%`} r="6" fill="#10b981" stroke="white" strokeWidth="2" />
              ))}
            </svg>

            {locations.length === 0 && !isOptimizing && (
              <div className="empty-state">
                <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.6)', padding: '32px', borderRadius: '24px' }}>
                  <Plus size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
                  <h3 style={{ margin: 0, color: '#475569' }}>Click map to add stops</h3>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {locations.map((loc, idx) => (
              <div key={loc.id} className="location-badge">
                <MapPin size={12} color="#10b981" />
                <span style={{ fontWeight: '500' }}>Stop {idx + 1}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setLocations(locations.filter(l => l.id !== loc.id)); }}
                  style={{ border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RouteOptimizer;