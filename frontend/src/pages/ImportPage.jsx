import React, { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { jobsApi } from '@/api/jobs';
import { enquiriesApi } from '@/api/enquiries';
import PageHeader from '@/components/shared/PageHeader';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const IMPORT_TYPES = [
  { value: 'jobs', label: 'Jobs', api: jobsApi.bulk },
  { value: 'enquiries', label: 'Enquiries', api: enquiriesApi.bulk },
];

export default function ImportPage() {
  const qc = useQueryClient();
  const [importType, setImportType] = useState('jobs');
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState('');

  const importConfig = IMPORT_TYPES.find((t) => t.value === importType);

  const importMutation = useMutation({
    mutationFn: (data) => importConfig.api(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: [importType] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      toast.success(`Imported ${result.count} ${importType} successfully`);
      clearFile();
    },
    onError: (err) => toast.error(typeof err === 'string' ? err : 'Import failed'),
  });

  const parseFile = useCallback((f) => {
    setParseError('');
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!jsonData.length) {
          setParseError('No data rows found in the file');
          return;
        }

        setHeaders(Object.keys(jsonData[0]));
        setRows(jsonData);
      } catch (err) {
        setParseError('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
        setRows([]);
        setHeaders([]);
      }
    };
    reader.readAsArrayBuffer(f);
  }, []);

  function clearFile() {
    setFile(null);
    setRows([]);
    setHeaders([]);
    setParseError('');
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) parseFile(f);
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  }

  function handleImport() {
    if (!rows.length) return;
    importMutation.mutate(rows);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Import Data"
        description="Bulk import jobs or enquiries from Excel / CSV files"
      />

      {/* Import Type Selector */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-48">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Import Type
            </label>
            <Select value={importType} onChange={(e) => { setImportType(e.target.value); clearFile(); }}>
              {IMPORT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 mt-5">
              Upload a <span className="font-medium text-slate-600">.xlsx</span>,{' '}
              <span className="font-medium text-slate-600">.xls</span>, or{' '}
              <span className="font-medium text-slate-600">.csv</span> file. The first row should contain column headers.
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      {!file && (
        <label
          className={`card flex flex-col items-center justify-center py-16 px-6 cursor-pointer border-2 border-dashed transition-colors ${
            dragOver
              ? 'border-brand-900 bg-brand-50/30'
              : 'border-slate-200 hover:border-brand-900/40 hover:bg-slate-50'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="p-4 bg-slate-100 rounded-2xl mb-4">
            <Upload className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Drop your file here, or click to browse
          </p>
          <p className="text-xs text-slate-400">
            Supports Excel (.xlsx, .xls) and CSV files
          </p>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* Parse Error */}
      {parseError && (
        <div className="card p-4 mt-6 flex items-start gap-3 border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Parse Error</p>
            <p className="text-sm text-red-600 mt-0.5">{parseError}</p>
          </div>
        </div>
      )}

      {/* Preview */}
      {file && rows.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* File Info Bar */}
          <div className="card px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-400">
                  {rows.length} row{rows.length !== 1 ? 's' : ''} • {headers.length} column{headers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={clearFile}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
              </Button>
              <Button size="sm" onClick={handleImport} loading={importMutation.isPending}>
                <ArrowRight className="h-3.5 w-3.5 mr-1" />
                Import {rows.length} {importType}
              </Button>
            </div>
          </div>

          {/* Success indicator */}
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-emerald-700 font-medium">
              File parsed successfully — preview below
            </span>
          </div>

          {/* Data Preview Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Data Preview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Showing first {Math.min(rows.length, 50)} rows</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      #
                    </th>
                    {headers.map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                      {headers.map((h) => (
                        <td key={h} className="px-4 py-3 text-slate-700 max-w-[200px] truncate" title={String(row[h] ?? '')}>
                          {String(row[h] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
