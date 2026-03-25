import { useState, useRef } from 'react';
import Papa from 'papaparse';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

export default function Import() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [source, setSource] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    setFile(f); setResult(null); setError('');
    Papa.parse(f, { header:true, skipEmptyLines:true, preview:5, complete: r => setPreview(r.data) });
  };

  const submit = async () => {
    if (!file) return;
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('source', source);
      const { data } = await api.post('/transactions/import', fd);
      setResult(data); setFile(null); setPreview([]);
    } catch (err) { setError(err.response?.data?.message||'Import failed'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="px-8 py-7 max-w-2xl">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-white">Import CSV</h1>
          <p className="text-sm text-[#5a6270] mt-1">Upload your bank statement or internal records</p>
        </div>

        {/* Source */}
        <div className="mb-5">
          <label className="block text-xs text-[#5a6270] uppercase tracking-widest mb-3">Transaction Source</label>
          <div className="flex gap-3">
            {['bank','internal'].map(s=>(
              <button key={s} onClick={()=>setSource(s)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${source===s?'border-[#00e5a0] text-[#00e5a0] bg-[#0d2620]':'border-[#252a32] text-[#5a6270] bg-[#13161a]'}`}>
                {s==='bank'?'🏦 Bank':'📒 Internal'}
              </button>
            ))}
          </div>
        </div>

        {/* Drop zone */}
        <div onClick={()=>inputRef.current.click()}
          onDragOver={e=>e.preventDefault()}
          onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
          className="border-2 border-dashed border-[#252a32] rounded-2xl p-12 text-center cursor-pointer hover:border-[#00e5a0] transition-colors mb-5">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-white font-semibold mb-1">{file?file.name:'Drop your CSV here'}</p>
          <p className="text-[#5a6270] text-sm">or click to browse</p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e=>handleFile(e.target.files[0])}/>
        </div>

        {/* Format */}
        <div className="bg-[#13161a] border border-[#252a32] rounded-xl p-4 mb-5">
          <p className="text-xs text-[#5a6270] uppercase tracking-widest mb-2 font-mono">Expected columns</p>
          <code className="text-xs text-[#00e5a0] font-mono">date, description, amount, currency, reference, category</code>
          <p className="text-xs text-[#5a6270] mt-2">Negative amounts = debits. Currency, reference, category are optional.</p>
        </div>

        {/* Preview */}
        {preview.length>0&&(
          <div className="bg-[#191d22] border border-[#252a32] rounded-xl overflow-hidden mb-5">
            <div className="px-4 py-3 border-b border-[#252a32]"><p className="text-sm font-semibold text-white">Preview (first 5 rows)</p></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#252a32]">{Object.keys(preview[0]).map(k=><th key={k} className="px-3 py-2 text-left text-[#5a6270] uppercase tracking-wider">{k}</th>)}</tr></thead>
                <tbody>{preview.map((row,i)=><tr key={i} className="border-b border-[#252a32] last:border-0">{Object.values(row).map((v,j)=><td key={j} className="px-3 py-2 text-[#d8dde6] font-mono">{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {error&&<div className="bg-[#2a1316] border border-[#3d1a1e] text-[#ff5c6a] text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        {result&&<div className="bg-[#0d2620] border border-[#1a4a38] text-[#00e5a0] text-sm rounded-lg px-4 py-3 mb-4">✓ Imported {result.imported} {result.source} transactions</div>}

        <button onClick={submit} disabled={!file||loading}
          className="w-full bg-[#00e5a0] hover:bg-[#00fdb5] text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-40 text-sm">
          {loading?'Importing…':`Import ${source==='bank'?'Bank':'Internal'} Transactions`}
        </button>
      </div>
    </Layout>
  );
}
