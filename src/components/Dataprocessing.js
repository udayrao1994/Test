import React, { useState, useEffect } from 'react';
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
  Database,
  FileSpreadsheet,
  RefreshCw,
  FileJson,
  FileType,
  Zap,
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
  const [status, setStatus] = useState({ type: 'info', message: 'Ready' });

  // Libraries for Excel and CSV
  // Hook returns a status string, but we don't need to store it.
  useScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
  useScript("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js");

  const [config, setConfig] = useState([
    { id: '1', type: 'RENAME_COLUMN', params: { from: '', to: '' } }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const extension = file.name.split('.').pop().toLowerCase();

    setStatus({ type: 'info', message: 'Reading file...' });

    const processResults = (data) => {
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]);
        setRawData(data);
        setProcessedData(data);
        setHeaders(cols);
        setStatus({ type: 'success', message: `Loaded ${data.length.toLocaleString()} records` });
      } else {
        setStatus({ type: 'error', message: 'The file appears to be empty.' });
      }
    };

    if (extension === 'csv') {
      if (typeof window.Papa === 'undefined') return;
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processResults(results.data),
        error: (err) => setStatus({ type: 'error', message: err.message })
      });
    } else if (['xlsx', 'xls'].includes(extension)) {
      if (typeof window.XLSX === 'undefined') return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
          const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          processResults(data);
        } catch (err) {
          setStatus({ type: 'error', message: err.message });
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const runPipeline = () => {
    if (rawData.length === 0) return;
    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Executing pipeline...' });
    
    setTimeout(() => {
      try {
        let result = JSON.parse(JSON.stringify(rawData));
        
        config.forEach(step => {
          const { type, params } = step;
          
          switch (type) {
            case 'RENAME_COLUMN':
              if (params.from && params.to) {
                result = result.map(row => {
                  if (params.from in row) {
                    row[params.to] = row[params.from];
                    delete row[params.from];
                  }
                  return row;
                });
              }
              break;
            case 'UPPERCASE':
              if (params.column) {
                result = result.map(row => ({
                  ...row,
                  [params.column]: row[params.column] ? String(row[params.column]).toUpperCase() : ''
                }));
              }
              break;
            case 'FIND_REPLACE':
              if (params.column && params.find !== undefined) {
                result = result.map(row => ({
                  ...row,
                  [params.column]: String(row[params.column] || '').replace(new RegExp(params.find, 'g'), params.replace || '')
                }));
              }
              break;
            case 'DELETE_COLUMN':
              if (params.column) {
                result = result.map(row => {
                  const newRow = { ...row };
                  delete newRow[params.column];
                  return newRow;
                });
              }
              break;
            case 'PREFIX_SUFFIX':
              if (params.column) {
                result = result.map(row => ({
                  ...row,
                  [params.column]: `${params.prefix || ''}${row[params.column] || ''}${params.suffix || ''}`
                }));
              }
              break;
            default: break;
          }
        });

        setProcessedData(result);
        setHeaders(result.length > 0 ? Object.keys(result[0]) : []);
        setStatus({ type: 'success', message: 'Pipeline executed!' });
      } catch (err) {
        setStatus({ type: 'error', message: err.message });
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  const downloadFile = (format) => {
    if (processedData.length === 0) return;
    
    let blob;
    let fileName = `dataforge_export_${new Date().getTime()}`;

    if (format === 'csv') {
      if (typeof window.Papa === 'undefined') return;
      const csv = window.Papa.unparse(processedData);
      blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      fileName += '.csv';
    } else if (format === 'json') {
      const json = JSON.stringify(processedData, null, 2);
      blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      fileName += '.json';
    }

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addConfigStep = () => setConfig([...config, { id: Date.now().toString(), type: 'RENAME_COLUMN', params: {} }]);
  const removeConfigStep = (id) => setConfig(config.filter(c => c.id !== id));
  const updateStep = (id, field, value) => {
    setConfig(prev => prev.map(c => c.id === id ? (field === 'type' ? { ...c, type: value, params: {} } : { ...c, params: { ...c.params, [field]: value } }) : c));
  };

  return (
    <div className="app-container">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root { 
          --p: #6366f1; 
          --p-h: #4f46e5; 
          --bg: #f8fafc; 
          --panel: #ffffff; 
          --border: #e2e8f0; 
          --text: #0f172a; 
          --text-muted: #64748b; 
          --success: #10b981; 
          --error: #ef4444; 
          --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }

        body { 
          margin: 0; 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          background: var(--bg); 
          color: var(--text);
          -webkit-font-smoothing: antialiased;
        }

        .app-container { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 2rem; 
          min-height: 100vh; 
        }
        
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2.5rem; 
          background: var(--panel); 
          padding: 1.25rem 2.5rem; 
          border-radius: 24px; 
          border: 1px solid var(--border); 
          box-shadow: var(--shadow);
        }
        
        .logo { display: flex; align-items: center; gap: 14px; }
        .logo-box { 
          background: linear-gradient(135deg, var(--p), var(--p-h)); 
          color: white; 
          padding: 10px; 
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
        }
        .logo h1 { margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.02em; }
        
        .grid { display: grid; grid-template-columns: 380px 1fr; gap: 2rem; align-items: start; }
        @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } }
        
        .card { 
          background: var(--panel); 
          border-radius: 24px; 
          border: 1px solid var(--border); 
          overflow: hidden; 
          box-shadow: var(--shadow);
          transition: transform 0.2s;
        }
        .card-h { 
          padding: 1.25rem 1.5rem; 
          border-bottom: 1px solid var(--border); 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          font-weight: 700; 
          font-size: 0.9rem;
          background: #fcfdfe;
        }
        .card-b { padding: 1.5rem; }

        .upload-zone { 
          border: 2px dashed var(--border); 
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center; 
          cursor: pointer; 
          border-radius: 16px; 
          transition: all 0.2s ease; 
          background: #fafbff; 
          position: relative; 
          padding: 1rem;
        }
        .upload-zone:hover { border-color: var(--p); background: #f5f7ff; }
        .upload-zone input { position: absolute; opacity: 0; inset: 0; cursor: pointer; width: 100%; height: 100%; }

        .step-item { 
          background: #f8fafc; 
          border: 1px solid var(--border); 
          border-radius: 16px; 
          margin-bottom: 1.25rem; 
          overflow: hidden; 
          transition: border-color 0.2s;
        }
        .step-item:hover { border-color: #cbd5e1; }
        .step-item-h { 
          padding: 0.85rem 1.25rem; 
          border-bottom: 1px solid var(--border); 
          background: white; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          font-size: 0.75rem; 
          font-weight: 800; 
          color: var(--text-muted); 
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .step-item-b { padding: 1.25rem; }
        
        select, input { 
          width: 100%; 
          padding: 0.75rem 1rem; 
          border: 1px solid var(--border); 
          border-radius: 12px; 
          font-size: 0.85rem; 
          outline: none; 
          transition: all 0.2s; 
          box-sizing: border-box; 
          background: #fff;
          font-family: inherit;
        }
        select:focus, input:focus { 
          border-color: var(--p); 
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); 
        }
        .input-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.75rem; }

        .btn { 
          padding: 0.85rem 1.25rem; 
          border-radius: 14px; 
          font-weight: 700; 
          font-size: 0.9rem; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          transition: all 0.2s; 
          border: none; 
          font-family: inherit;
        }
        .btn-primary { 
          background: linear-gradient(135deg, var(--p), var(--p-h)); 
          color: white; 
          width: 100%; 
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .btn-primary:hover:not(:disabled) { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-secondary { 
          background: #f1f5f9; 
          color: var(--text-muted); 
          font-size: 0.75rem; 
          padding: 6px 14px; 
          border-radius: 10px; 
        }
        .btn-secondary:hover { background: #e2e8f0; color: var(--text); }
        
        .export-group { display: flex; gap: 8px; }
        .btn-csv { background: #ecfdf5; color: #059669; border: 1px solid #d1fae5; }
        .btn-json { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }

        .pill { 
          padding: 8px 16px; 
          border-radius: 14px; 
          font-size: 0.8rem; 
          font-weight: 700; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          box-shadow: var(--shadow);
        }
        .pill-success { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
        .pill-info { background: #f0f9ff; color: #0369a1; border: 1px solid #e0f2fe; }
        .pill-error { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

        .table-container { height: 750px; display: flex; flex-direction: column; }
        .table-viewport { flex: 1; overflow: auto; background: #fff; border-radius: 0 0 24px 24px; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        th { 
          background: #f8fafc; 
          padding: 1.15rem 1.25rem; 
          text-align: left; 
          border-bottom: 2px solid var(--border); 
          position: sticky; 
          top: 0; 
          z-index: 10; 
          white-space: nowrap; 
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          font-size: 0.7rem;
          letter-spacing: 0.05em;
        }
        td { 
          padding: 1rem 1.25rem; 
          border-bottom: 1px solid #f1f5f9; 
          white-space: nowrap; 
          font-size: 0.85rem;
          color: var(--text);
        }
        tr:hover td { background: #f8fafc; }
        
        .empty-state {
          height: 100%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-direction: column; 
          gap: 16px;
          color: var(--text-muted);
          background: linear-gradient(to bottom, #fff, #f8fafc);
        }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .badge {
          background: var(--p);
          color: #fff;
          font-size: 0.65rem;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 800;
        }

        .trash-btn {
          color: var(--text-muted);
          transition: color 0.2s;
          cursor: pointer;
        }
        .trash-btn:hover { color: var(--error); }
      `}} />

      <header className="header">
        <div className="logo">
          <div className="logo-box"><Zap size={24} fill="white" /></div>
          <div><h1>DataForge Local</h1></div>
        </div>
        <div className={`pill pill-${status.type}`}>
          {status.type === 'success' ? <CheckCircle2 size={16}/> : status.type === 'error' ? <AlertCircle size={16}/> : <RefreshCw size={16} className={isProcessing ? "spin":""}/>}
          {status.message}
        </div>
      </header>

      <div className="grid">
        <aside>
          <div className="card" style={{marginBottom: '1.5rem'}}>
            <div className="card-h">
              <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
                <FileSpreadsheet size={18} />
                <span>Import Data</span>
              </div>
            </div>
            <div className="card-b">
              <div className="upload-zone">
                <FileUp size={40} color="var(--p)" style={{marginBottom:'12px', opacity: 0.8}}/>
                <p style={{margin:0, fontWeight: 700, fontSize: '0.9rem'}}>Drop CSV or Excel</p>
                <p style={{margin:'4px 0 0', fontSize:'0.75rem', color:'var(--text-muted)'}}>All processing stays in your browser</p>
                <input type="file" accept=".csv, .xlsx, .xls" onChange={handleFileUpload} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
                <Settings2 size={18} />
                <span>Pipeline Builder</span>
              </div>
              <button className="btn-secondary" onClick={addConfigStep}>
                <Plus size={14}/> Step
              </button>
            </div>
            <div className="card-b" style={{maxHeight: '520px', overflowY: 'auto'}}>
              {config.map((step, idx) => (
                <div key={step.id} className="step-item">
                  <div className="step-item-h">
                    <span style={{background:'var(--p)', color:'white', width:20, height:20, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight: 900}}>{idx+1}</span>
                    <span style={{flex: 1}}>{step.type.replace(/_/g,' ')}</span>
                    <Trash2 size={16} className="trash-btn" onClick={() => removeConfigStep(step.id)}/>
                  </div>
                  <div className="step-item-b">
                    <select 
                      style={{marginBottom: '0.75rem'}}
                      value={step.type} 
                      onChange={e => updateStep(step.id, 'type', e.target.value)}
                    >
                      <option value="RENAME_COLUMN">Rename Column</option>
                      <option value="UPPERCASE">Uppercase Transform</option>
                      <option value="FIND_REPLACE">Find & Replace</option>
                      <option value="DELETE_COLUMN">Remove Column</option>
                      <option value="PREFIX_SUFFIX">Add Prefix/Suffix</option>
                    </select>
                    
                    <div className="input-pair">
                      {step.type === 'RENAME_COLUMN' && (
                        <>
                          <input placeholder="Source" value={step.params.from || ''} onChange={e => updateStep(step.id, 'from', e.target.value)}/>
                          <input placeholder="New Name" value={step.params.to || ''} onChange={e => updateStep(step.id, 'to', e.target.value)}/>
                        </>
                      )}
                      {step.type === 'FIND_REPLACE' && (
                        <>
                          <input style={{gridColumn:'span 2', marginBottom:'5px'}} placeholder="Column Name" value={step.params.column || ''} onChange={e => updateStep(step.id, 'column', e.target.value)}/>
                          <input placeholder="Find" value={step.params.find || ''} onChange={e => updateStep(step.id, 'find', e.target.value)}/>
                          <input placeholder="Replace" value={step.params.replace || ''} onChange={e => updateStep(step.id, 'replace', e.target.value)}/>
                        </>
                      )}
                      {(step.type === 'UPPERCASE' || step.type === 'DELETE_COLUMN') && (
                        <input style={{gridColumn:'span 2'}} placeholder="Column Name" value={step.params.column || ''} onChange={e => updateStep(step.id, 'column', e.target.value)}/>
                      )}
                      {step.type === 'PREFIX_SUFFIX' && (
                        <>
                          <input style={{gridColumn:'span 2', marginBottom:'5px'}} placeholder="Column Name" value={step.params.column || ''} onChange={e => updateStep(step.id, 'column', e.target.value)}/>
                          <input placeholder="Prefix" value={step.params.prefix || ''} onChange={e => updateStep(step.id, 'prefix', e.target.value)}/>
                          <input placeholder="Suffix" value={step.params.suffix || ''} onChange={e => updateStep(step.id, 'suffix', e.target.value)}/>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" onClick={runPipeline} disabled={isProcessing || rawData.length === 0}>
                {isProcessing ? <Loader2 size={18} className="spin"/> : <Play size={18} fill="currentColor"/>}
                Process Pipeline
              </button>
            </div>
          </div>
        </aside>

        <section className="card table-container">
          <div className="card-h">
            <div style={{display:'flex', alignItems:'center', gap: '8px'}}>
              <TableIcon size={18} style={{color: 'var(--text-muted)'}}/> 
              <span>Data Workbench</span>
              {processedData.length > 0 && <span className="badge">{processedData.length.toLocaleString()} Rows</span>}
            </div>
            {processedData.length > 0 && (
              <div className="export-group">
                <button className="btn btn-secondary btn-csv" onClick={() => downloadFile('csv')}>
                  <FileType size={14}/> CSV
                </button>
                <button className="btn btn-secondary btn-json" onClick={() => downloadFile('json')}>
                  <FileJson size={14}/> JSON
                </button>
              </div>
            )}
          </div>
          <div className="table-viewport">
            {processedData.length > 0 ? (
              <table>
                <thead>
                  <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {processedData.slice(0, 100).map((row, i) => (
                    <tr key={i}>{headers.map(h => <td key={h}>{String(row[h] ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div style={{background: '#f1f5f9', padding: '32px', borderRadius: '50%', marginBottom: '12px'}}>
                  <Database size={56} strokeWidth={1} style={{opacity:0.4}}/>
                </div>
                <h3 style={{margin:0, fontSize:'1.1rem', fontWeight: 800}}>Workbench Ready</h3>
                <p style={{margin: 0, fontSize:'0.85rem', maxWidth: '280px', textAlign:'center'}}>
                  Upload a dataset to start building your automated transformation pipeline.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}