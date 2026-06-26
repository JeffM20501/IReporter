import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import { Shield, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import logoFallback from '../../assets/breaking.jpg'; // 👈 import logo

const PER_PAGE = 10;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { records, updateStatus } = useRecords();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const typeStats = {
    redFlags: records.filter(r => r.type === "red flag").length,
    interventions: records.filter(r => r.type === "intervention").length,
  };

  const statusStats = {
    pending: records.filter(r => r.status === "pending").length,
    underInvestigation: records.filter(r => r.status === "under investigation").length,
    rejected: records.filter(r => r.status === "rejected").length,
    resolved: records.filter(r => r.status === "resolved").length,
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / PER_PAGE);
  const paginated = filteredRecords.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = () => setPage(1);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 dark:text-white">ADMIN CONTROL</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-widest">Investigation Management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 transition"
          >
            <Filter size={18} />
          </button>
          <div className="bg-blue-600/10 text-blue-600 dark:text-blue-400 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
            <Shield size={18}/> AUTHORIZED ACCESS
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-red-500">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Red‑Flags</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(typeStats.redFlags).padStart(2, '0')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-blue-500">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Interventions</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(typeStats.interventions).padStart(2, '0')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-orange-500">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Pending</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(statusStats.pending).padStart(2, '0')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-purple-500">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Under Investigation</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(statusStats.underInvestigation).padStart(2, '0')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-red-600">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Rejected</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(statusStats.rejected).padStart(2, '0')}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-b-4 border-emerald-500">
          <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-2">Resolved</h4>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(statusStats.resolved).padStart(2, '0')}</p>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); handleFilterChange(); }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="red flag">Red Flag</option>
              <option value="intervention">Intervention</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange(); }}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under investigation">Under Investigation</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {filteredRecords.length} record{filteredRecords.length !== 1 && 's'} found
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <th className="p-4">Incident</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {paginated.map((record) => {
              const thumbnail = record.images?.[0]?.image_url || logoFallback;
              return (
                <tr
                  key={record.id}
                  onClick={() => navigate(`/home/incident/${record.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={thumbnail}
                        alt={record.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{record.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      record.type === "red flag"
                        ? "bg-red-500/10 text-red-500 dark:text-red-400"
                        : "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                    }`}>
                      {record.type}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={record.status}
                      onChange={e => updateStatus(record.id, e.target.value)}
                      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white p-2 rounded-lg text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="under investigation">Under Investigation</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredRecords.length)} of {filteredRecords.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:border-blue-500 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let n = i + 1;
                if (totalPages > 7) {
                  if (i === 0) n = 1;
                  else if (i === 1) n = page > 3 ? '…' : 2;
                  else if (i === totalPages - 1) n = totalPages;
                  else if (i === totalPages - 2) n = page < totalPages - 3 ? '…' : totalPages - 1;
                  else n = page + (i - 2);
                }
                if (typeof n === 'number') {
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                        page === n
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500"
                      }`}
                    >
                      {n}
                    </button>
                  );
                }
                return (
                  <span key={i} className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500">…</span>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:border-blue-500 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}