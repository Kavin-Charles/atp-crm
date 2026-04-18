import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Table2, ChevronRight, Search, Copy, RefreshCw, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { dataApi } from '@/api/data';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';

export default function DataViewerPage() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const { data: collections = [], isLoading: colLoading } = useQuery({
    queryKey: ['data-collections'],
    queryFn: dataApi.collections,
  });

  const {
    data: docs = [],
    isLoading: docsLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['data-collection', selected],
    queryFn: () => dataApi.collection(selected),
    enabled: !!selected,
  });

  const headers = docs.length > 0 ? Object.keys(docs[0]) : [];

  const filtered = search
    ? docs.filter((doc) =>
        Object.values(doc).some((v) =>
          String(v ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : docs;

  function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
    toast.success('JSON copied to clipboard');
  }

  function exportCsv() {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selected);
    XLSX.writeFile(wb, `${selected}_export.xlsx`);
    toast.success(`Exported ${filtered.length} rows`);
  }

  function formatCellValue(value) {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Data Viewer"
        description="Browse raw database collections (admin only)"
      />

      <div className="flex gap-6 items-start">
        {/* Collection Sidebar */}
        <div className="card w-56 flex-shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Collections</h3>
          </div>
          {colLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : collections.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">No collections</div>
          ) : (
            <nav className="py-1">
              {collections.map((name) => (
                <button
                  key={name}
                  onClick={() => { setSelected(name); setSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    selected === name
                      ? 'bg-brand-50 text-brand-900 border-r-2 border-brand-900'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Table2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate capitalize">{name}</span>
                  {selected === name && <ChevronRight className="h-3.5 w-3.5 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Data Panel */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="card">
              <EmptyState
                title="Select a collection"
                description="Choose a collection from the sidebar to view its documents"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Database className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 capitalize">{selected}</h2>
                    <p className="text-xs text-slate-400">
                      {filtered.length}{filtered.length !== docs.length ? ` of ${docs.length}` : ''} document{docs.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search..."
                      className="pl-8 w-52 h-8 text-xs"
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={copyJson} disabled={!filtered.length}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={exportCsv} disabled={!filtered.length}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Export
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="card overflow-hidden">
                {docsLoading ? (
                  <div className="flex justify-center py-16"><Spinner /></div>
                ) : filtered.length === 0 ? (
                  <EmptyState
                    title={search ? 'No matching documents' : 'Collection is empty'}
                    description={search ? 'Try a different search term' : undefined}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          {headers.map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filtered.slice(0, 100).map((doc, idx) => (
                          <tr key={doc._id || idx} className="hover:bg-slate-50 transition-colors">
                            {headers.map((h) => (
                              <td
                                key={h}
                                className="px-4 py-3 text-slate-700 max-w-[220px] truncate font-mono text-xs"
                                title={formatCellValue(doc[h])}
                              >
                                {formatCellValue(doc[h])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length > 100 && (
                      <div className="px-4 py-3 text-center border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                          Showing first 100 of {filtered.length} documents
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
