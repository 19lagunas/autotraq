import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

export function CsvPage() {
  const { isManager } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [result, setResult] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await api.exportCsv();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autotraq-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setCsvContent(text);
      const lines = text.trim().split('\n');
      setPreview(lines.slice(0, 6)); // header + 5 rows
      setResult(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!csvContent) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await api.importCsv(csvContent);
      setResult(res);
      if (res.errors.length === 0) {
        toast.success(`Imported: ${res.created} created, ${res.updated} updated`);
      } else {
        toast(`${res.created + res.updated} processed, ${res.errors.length} errors`, { icon: '⚠️' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
          <FileSpreadsheet className="text-amber-400" size={28} />
          Bulk CSV Import / Export
        </h1>
        {/* Export Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
            <Download size={20} className="text-emerald-400" />
            Export Inventory
          </h2>
          <p className="text-sm text-slate-400 mb-4">
            Download all parts with SKU, name, condition, cost, on-hand quantities, and vehicle fitments as a CSV file.
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Exporting…' : 'Download CSV'}
          </button>
        </section>

        {/* Import Section */}
        {isManager && (
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Upload size={20} className="text-amber-400" />
              Import Parts
            </h2>
            <p className="text-sm text-slate-400 mb-1">
              Upload a CSV to bulk create or update parts. Required columns: <code className="text-amber-300">SKU</code>, <code className="text-amber-300">Name</code>.
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Optional: Description, Condition, Min Stock, Cost ($). Existing SKUs will be updated; new SKUs will be created.
            </p>

            <input type="file" accept=".csv,text/csv" ref={fileRef} className="hidden" onChange={handleFileSelect} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors mb-4"
            >
              <FileSpreadsheet size={16} />
              Choose CSV File
            </button>

            {/* Preview */}
            {preview && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Preview ({csvContent.trim().split('\n').length - 1} data rows)</h3>
                <div className="overflow-x-auto bg-slate-900/60 rounded-lg border border-slate-700/50">
                  <table className="text-xs text-slate-300 w-full">
                    <tbody>
                      {preview.map((line, i) => (
                        <tr key={i} className={i === 0 ? 'bg-slate-700/50 font-semibold text-amber-300' : 'border-t border-slate-700/30'}>
                          {line.split(',').slice(0, 7).map((cell, j) => (
                            <td key={j} className="px-3 py-1.5 whitespace-nowrap max-w-[200px] truncate">{cell.replace(/^"|"$/g, '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvContent.trim().split('\n').length > 6 && (
                  <p className="text-xs text-slate-500 mt-1">… and {csvContent.trim().split('\n').length - 6} more rows</p>
                )}

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="mt-3 flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {importing ? 'Importing…' : 'Import Now'}
                </button>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-3">
                <div className="flex gap-4">
                  {result.created > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                      <CheckCircle size={16} /> {result.created} created
                    </div>
                  )}
                  {result.updated > 0 && (
                    <div className="flex items-center gap-1.5 text-sm text-blue-400">
                      <CheckCircle size={16} /> {result.updated} updated
                    </div>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-sm text-red-400 font-medium mb-2">
                      <AlertTriangle size={16} /> {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}
                    </div>
                    <ul className="text-xs text-red-300/80 space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((e, i) => <li key={i}>• {e}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}
