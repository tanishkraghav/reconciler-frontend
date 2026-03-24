import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import api from '../utils/api';

export default function Import() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [source, setSource] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();
  const navigate = useNavigate();

  const handleFile = (f) => {
    setFile(f); setResult(null); setError('');
    Papa.parse(f, {
      header: true, skipEmptyLines: true, preview: 5,
      complete: (res) => setPreview(res.data)
    });
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('source', source);
      const { data } = await api.post('/transactions/import', fd);
      setResult(data);
      setFile(null); setPreview([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="px-8 py-5 border-b border-border flex items-center gap-4 sticky top-0 bg-bg/90 backdrop-blur z-10">
        <button onClick={() => navigate('/dashboard')} className="text-muted hover:text-white transition-colors text-sm">← Back</button>
        <h1 className="text-base font-bold text-white">Import Transactions</h1>
      </header>

      <div className="max-w-2xl mx-auto px-8 py-10">
        {/* Source selector */}
        <div className="mb-6">
          <label className="block text-xs text-muted uppercase tracking-widest mb-3">Transaction Source</label>
          <div className="flex gap-3">
            {['bank', 'internal'].map(s => (
              <button key={s} onClick={() => setSource(s)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${source === s ? 'border-accent text-accent bg-[#0d2620]' : 'border-border text-muted bg-surface'}`}>
                {s === 'bank' ? '🏦 Bank' : '📒 Internal'}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div onClick={() => inputRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          className="border-2 border-dashed border-border rounded-2xl p-12 text-center cursor-pointer hover:border-accent transition-colors mb-6">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-white font-semibold mb-1">{file ? file.name : 'Drop your CSV here'}</p>
          <p className="text-muted text-sm">or click to browse</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>

        {/* CSV format guide */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-6">
          <p className="text-xs text-muted uppercase tracking-widest mb-2 font-mono">Expected CSV columns</p>
          <code className="text-xs text-accent font-mono">date, description, amount, currency, reference, category</code>
          <p className="text-xs text-muted mt-2">Negative amounts = debits. Currency, reference and category are optional.</p>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-white">Preview (first 5 rows)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {Object.keys(preview[0]).map(k => (
                      <th key={k} className="px-3 py-2 text-left text-muted uppercase tracking-wider">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="px-3 py-2 text-[#d8dde6] font-mono">{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && <div className="bg-[#2a1316] border border-[#3d1a1e] text-danger text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        {result && (
          <div className="bg-[#0d2620] border border-[#1a4a38] text-accent text-sm rounded-lg px-4 py-3 mb-4">
            ✓ Successfully imported {result.imported} {result.source} transactions
          </div>
        )}

        <button onClick={submit} disabled={!file || loading}
          className="w-full bg-accent hover:bg-[#00fdb5] text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-40 text-sm">
          {loading ? 'Importing…' : `Import ${source === 'bank' ? 'Bank' : 'Internal'} Transactions`}
        </button>
      </div>
    </div>
  );
}
