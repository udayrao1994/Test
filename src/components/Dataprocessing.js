import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileUp, 
  Play, 
  Table as TableIcon, 
  Plus, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings2,
  Info,
  ChevronRight,
  Database,
  Type,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';

// --- External Library Loader Hook ---
function useScript(src) {
  const [status, setStatus] = useState(src ? "loading" : "idle");
  useEffect(() => {
    if (!src) return;
    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      const setAttributeFromEvent = (event) => setStatus(event.type === "load" ? "ready" : "error");
      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      setStatus(script.getAttribute("data-status") || "ready");
    }
  }, [src]);
  return status;
}

// --- Core Application ---
export default function DataProcessing() {
  const [rawData, setRawData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState({ type: 'info', message: 'Ready for processing' });

  // Libraries for Excel and CSV
  const xlsxStatus = useScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
  const papaStatus = useScript("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js");

  const [config, setConfig] = useState([
    { id: '1', type: 'RENAME_COLUMN', params: { from: '', to: '' } }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();

    setStatus({ type: 'info', message: 'Reading file...' });

    if (extension === 'csv') {
      if (typeof window.Papa === 'undefined') {
        setStatus({ type: 'error', message: 'CSV parser not loaded' });
        return;
      }
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const cols = Object.keys(results.data[0]);
            setRawData(results.data);
            setProcessedData(results.data);
            setHeaders(cols);
            setStatus({ type: 'success', message: `Loaded ${results.data.length} rows successfully` });
          }
        },
        error: (err) => setStatus({ type: 'error', message: 'CSV Error: ' + err.message })
      });
    } else if (['xlsx', 'xls'].includes(extension)) {
      if (typeof window.XLSX === 'undefined') {
        setStatus({ type: 'error', message: 'Excel parser not loaded' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = window.XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = window.XLSX.utils.sheet_to_json(ws);
          if (data && data.length > 0) {
            const cols = Object.keys(data[0]);
            setRawData(data);
            setProcessedData(data);
            setHeaders(cols);
            setStatus({ type: 'success', message: `Loaded ${data.length} rows successfully` });
          }
        } catch (err) {
          setStatus({ type: 'error', message: 'Excel Error: ' + err.message });
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const runPipeline = () => {
    if (rawData.length === 0) {
      setStatus({ type: 'error', message: 'Please upload a data file first' });
      return;
    }
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Processing pipeline steps...' });
    
    setTimeout(() => {
      try {
        let result = JSON.parse(JSON.stringify(rawData));
        
        config.forEach(step => {
          if (step.type === 'RENAME_COLUMN' && step.params.from && step.params.to) {
            const { from, to } = step.params;
            result = result.map(row => {
              const newRow = { ...row };
              if (from in newRow) {
                newRow[to] = newRow[from];
                delete newRow[from];
              }
              return newRow;
            });
          } else if (step.type === 'UPPERCASE' && step.params.column) {
            const col = step.params.column;
            result = result.map(row => ({
              ...row,
              [col]: row[col] ? String(row[col]).toUpperCase() : ''
            }));
          }
        });

        setProcessedData(result);
        if (result.length > 0) {
          setHeaders(Object.keys(result[0]));
        }
        setStatus({ type: 'success', message: 'Pipeline executed successfully!' });
      } catch (err) {
        setStatus({ type: 'error', message: 'Execution Error: ' + err.message });
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  const addConfigStep = () => {
    setConfig([...config, { id: Date.now().toString(), type: 'RENAME_COLUMN', params: { from: '', to: '' } }]);
  };
  
  const removeConfigStep = (id) => {
    setConfig(config.filter(c => c.id !== id));
  };

  const updateStep = (id, field, value) => {
    setConfig(prev => prev.map(c => {
      if (c.id === id) {
        if (field === 'type') {
          return { ...c, type: value, params: {} };
        }
        return { ...c, params: { ...c.params, [field]: value } };
      }
      return c;
    }));
  };

  return (
    <div className="app-container">
      <style dangerouslySetInnerHTML={{ __html: `
        :root { 
          --p: #6366f1; 
          --p-dark: #4f46e5;
          --bg: #f8fafc; 
          --c: #ffffff; 
          --b: #e2e8f0; 
          --t: #0f172a; 
          --t-light: #64748b;
          --s: #10b981; 
          --e: #ef4444; 
          --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        body { margin: 0; font-family: 'Inter', -apple-system, sans-serif; background: var(--bg); color: var(--t); -webkit-font-smoothing: antialiased; }
        .app-container { max-width: 1400px; margin: 0 auto; padding: 1.5rem; min-height: 100vh; }
        
        /* Layout */
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2rem; 
          background: var(--c); 
          padding: 1rem 2rem; 
          border-radius: 16px; 
          border: 1px solid var(--b); 
          box-shadow: var(--shadow);
        }
        
        .logo-section { display: flex; align-items: center; gap: 12px; }
        .logo-icon { background: var(--p); color: white; padding: 8px; border-radius: 10px; display: flex; align-items: center; }
        .logo-text h1 { margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.025em; }
        .logo-text p { margin: 0; font-size: 0.75rem; color: var(--t-light); font-weight: 500; }
        
        .main-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.5rem; align-items: start; }
        @media (max-width: 1024px) { .main-grid { grid-template-columns: 1fr; } }
        
        /* Cards */
        .card { 
          background: var(--c); 
          border-radius: 16px; 
          border: 1px solid var(--b); 
          box-shadow: var(--shadow);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }
        .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--b); display: flex; justify-content: space-between; align-items: center; }
        .card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 10px; color: #334155; }
        .card-body { padding: 1.5rem; }

        /* Upload Area */
        .upload-area { 
          border: 2px dashed var(--b); 
          padding: 2.5rem 1rem; 
          text-align: center; 
          cursor: pointer; 
          position: relative; 
          border-radius: 12px; 
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          background: #fdfdff;
        }
        .upload-area:hover { border-color: var(--p); background: #f5f3ff; transform: translateY(-2px); }
        .upload-area input { position: absolute; opacity: 0; inset: 0; cursor: pointer; }
        .upload-area-icon { margin-bottom: 12px; color: var(--p); opacity: 0.8; transition: transform 0.2s; }
        .upload-area:hover .upload-area-icon { transform: scale(1.1); }
        .upload-area p { margin: 0; font-size: 0.85rem; color: var(--t-light); font-weight: 500; }
        .file-badge { background: #ecfdf5; color: #059669; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; margin-top: 12px; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #d1fae5; }

        /* Steps & Inputs */
        .step-item { 
          background: #f8fafc; 
          border: 1px solid var(--b); 
          border-radius: 12px; 
          margin-bottom: 1rem; 
          position: relative; 
          transition: border-color 0.2s;
        }
        .step-item:hover { border-color: #cbd5e1; }
        .step-header { display: flex; align-items: center; gap: 8px; padding: 0.75rem 1rem; border-bottom: 1px solid var(--b); background: #ffffff; border-radius: 12px 12px 0 0; }
        .step-number { width: 20px; height: 20px; background: var(--p); color: white; font-size: 0.7rem; font-weight: 700; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .step-content { padding: 1rem; }
        
        select, input { 
          width: 100%; 
          padding: 0.65rem; 
          border: 1px solid var(--b); 
          border-radius: 8px; 
          font-size: 0.85rem; 
          background: white; 
          font-weight: 500;
          transition: all 0.2s;
        }
        select:focus, input:focus { border-color: var(--p); outline: none; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
        .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.75rem; }

        /* Buttons */
        .btn-primary { 
          width: 100%; 
          padding: 0.875rem; 
          background: var(--p); 
          color: white; 
          border: none; 
          border-radius: 10px; 
          cursor: pointer; 
          font-weight: 700; 
          font-size: 0.9rem;
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
          transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { background: var(--p-dark); transform: translateY(-1px); box-shadow: 0 6px 15px rgba(99, 102, 241, 0.35); }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

        .btn-ghost { 
          padding: 6px 12px; 
          background: #f1f5f9; 
          border: 1px solid var(--b); 
          border-radius: 8px; 
          color: var(--t-light); 
          font-size: 0.75rem; 
          font-weight: 600; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: #e2e8f0; color: var(--t); }

        .btn-delete { 
          background: #fff; 
          border: 1px solid #fee2e2; 
          color: var(--e); 
          width: 28px; 
          height: 28px; 
          border-radius: 8px; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          transition: all 0.2s;
          margin-left: auto;
        }
        .btn-delete:hover { background: var(--e); color: white; border-color: var(--e); }

        /* Table */
        .table-view { height: 750px; display: flex; flex-direction: column; }
        .table-stats { font-size: 0.75rem; color: var(--t-light); font-weight: 600; background: #f1f5f9; padding: 4px 10px; border-radius: 20px; }
        .table-container { flex: 1; overflow: auto; background: #ffffff; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.8rem; }
        th { 
          background: #f8fafc; 
          padding: 1rem; 
          text-align: left; 
          font-weight: 700; 
          color: #475569; 
          border-bottom: 2px solid var(--b); 
          position: sticky; 
          top: 0; 
          z-index: 10; 
          white-space: nowrap; 
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        td { padding: 0.875rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; white-space: nowrap; transition: background 0.1s; }
        tr:hover td { background: #f9fafb; }
        
        .empty-state { height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; flex-direction: column; gap: 1rem; opacity: 0.8; }
        
        /* Status Pill */
        .status-pill { padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .status-success { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
        .status-error { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
        .status-info { background: #eff6ff; color: #1e40af; border: 1px solid #dbeafe; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />

      <header className="header">
        <div className="logo-section">
          <div className="logo-icon"><Database size={24} strokeWidth={2.5} /></div>
          <div className="logo-text">
            <h1>DataForge</h1>
            <p>ADVANCED DATA TRANSFORMATION ENGINE</p>
          </div>
        </div>
        <div className={`status-pill status-${status.type}`}>
          {status.type === 'success' ? <CheckCircle2 size={16} /> : status.type === 'error' ? <AlertCircle size={16} /> : <RefreshCw size={16} className={isProcessing ? "spin" : ""} />}
          {status.message}
        </div>
      </header>

      <div className="main-grid">
        <aside>
          <div className="card">
            <div className="card-header">
              <h3><FileSpreadsheet size={18} /> Source File</h3>
            </div>
            <div className="card-body">
              <div className="upload-area">
                <FileUp className="upload-area-icon" size={36} strokeWidth={1.5} />
                <p>Click or drag your data file here</p>
                <span style={{fontSize: '0.7rem', display: 'block', marginTop: '6px', opacity: 0.6}}>Supported: .csv, .xlsx, .xls</span>
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
              </div>
              {rawData.length > 0 && (
                <div style={{textAlign: 'center'}}>
                  <div className="file-badge">
                    <CheckCircle2 size={14} /> {rawData.length} Records Loaded
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><Settings2 size={18} /> Processing Pipeline</h3>
              <button onClick={addConfigStep} className="btn-ghost"><Plus size={14} /> New Step</button>
            </div>
            <div className="card-body">
              {config.length === 0 && (
                <div style={{textAlign: 'center', padding: '1rem', color: 'var(--t-light)', fontSize: '0.85rem'}}>
                  No steps added to the pipeline.
                </div>
              )}
              {config.map((step, index) => (
                <div key={step.id} className="step-item">
                  <div className="step-header">
                    <div className="step-number">{index + 1}</div>
                    <span style={{fontSize: '0.75rem', fontWeight: 700, color: '#475569'}}>
                      {step.type === 'RENAME_COLUMN' ? 'Column Renaming' : 'Uppercase Transform'}
                    </span>
                    <button onClick={() => removeConfigStep(step.id)} className="btn-delete" title="Remove step">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="step-content">
                    <select value={step.type} onChange={e => updateStep(step.id, 'type', e.target.value)}>
                      <option value="RENAME_COLUMN">Rename Column</option>
                      <option value="UPPERCASE">Make Uppercase</option>
                    </select>
                    <div className="input-grid">
                      {step.type === 'RENAME_COLUMN' ? (
                        <>
                          <div>
                            <label style={{fontSize: '0.65rem', fontWeight: 700, color: 'var(--t-light)', marginBottom: '4px', display: 'block'}}>SOURCE</label>
                            <input 
                              placeholder="Column Name" 
                              value={step.params.from || ''} 
                              onChange={e => updateStep(step.id, 'from', e.target.value)} 
                            />
                          </div>
                          <div>
                            <label style={{fontSize: '0.65rem', fontWeight: 700, color: 'var(--t-light)', marginBottom: '4px', display: 'block'}}>TARGET</label>
                            <input 
                              placeholder="New Name" 
                              value={step.params.to || ''} 
                              onChange={e => updateStep(step.id, 'to', e.target.value)} 
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{gridColumn: 'span 2'}}>
                          <label style={{fontSize: '0.65rem', fontWeight: 700, color: 'var(--t-light)', marginBottom: '4px', display: 'block'}}>TARGET COLUMN</label>
                          <input 
                            placeholder="Target Column Name" 
                            value={step.params.column || ''} 
                            onChange={e => updateStep(step.id, 'column', e.target.value)} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                className="btn-primary" 
                onClick={runPipeline} 
                disabled={isProcessing || rawData.length === 0}
                style={{marginTop: '1rem'}}
              >
                {isProcessing ? <Loader2 size={18} className="spin" /> : <Play size={18} fill="currentColor"/>} 
                <span>Execute Pipeline</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="card table-view">
          <div className="card-header">
            <h3><TableIcon size={18} /> Data Preview</h3>
            {processedData.length > 0 && (
              <div className="table-stats">
                {processedData.length} records processed
              </div>
            )}
          </div>
          <div className="table-container">
            {processedData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    {headers.map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {processedData.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      {headers.map(h => <td key={`${i}-${h}`}>{String(row[h] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <Database size={64} strokeWidth={1} style={{color: '#e2e8f0'}} />
                <h4 style={{margin: 0, color: '#475569'}}>No active dataset</h4>
                <p style={{margin: 0, fontSize: '0.85rem', maxWidth: '300px'}}>Upload a file and execute your processing pipeline to see results here.</p>
              </div>
            )}
          </div>
          {processedData.length > 50 && (
            <div style={{padding: '0.75rem', textAlign: 'center', background: '#f8fafc', borderTop: '1px solid var(--b)', fontSize: '0.75rem', color: 'var(--t-light)', fontWeight: 600}}>
              Displaying first 50 records only for preview.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}