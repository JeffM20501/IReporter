import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import { ChevronLeft, ChevronRight, Search, Clock, Flag, Filter } from "lucide-react";
import logoFallback from '../../assets/breaking.jpg'; // 👈 replace with your logo file

const PER_PAGE = 12;

export default function Activity() {
  const navigate = useNavigate();
  const { records, loading } = useRecords();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const allIncidents = records.map((record) => ({
    id: record.id,
    title: record.title,
    description: record.description || "No description provided.",
    status: record.status,
    type: record.type,
    timestamp: new Date(record.created_at).toLocaleString(),
    thumbnail: record.images?.[0]?.image_url || logoFallback, // fallback = logo
  }));

  const filteredIncidents = allIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || incident.type === typeFilter;
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIncidents.length / PER_PAGE);
  const paginated = filteredIncidents.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = () => setPage(1);

  const stats = {
    total: records.length,
    redFlags: records.filter(r => r.type === "red flag").length,
    interventions: records.filter(r => r.type === "intervention").length,
    pending: records.filter(r => r.status === "pending").length,
    resolved: records.filter(r => r.status === "resolved").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading incidents...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex-1">Activity Feed</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 transition"
        >
          <Filter size={18} />
        </button>
      </div>

      {/* Filters – expandable */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-5 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange(); }}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); handleFilterChange(); }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="red flag">Red Flag</option>
              <option value="intervention">Intervention</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); handleFilterChange(); }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under investigation">Under Investigation</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {filteredIncidents.length} report{filteredIncidents.length !== 1 && 's'} found
          </div>
        </div>
      )}

      {/* Stats strip */}
      <div className="flex flex-wrap gap-2 mb-5 text-xs bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
        <span className="font-bold text-slate-900 dark:text-white">{stats.total} <span className="font-normal text-slate-500 dark:text-slate-400">total</span></span>
        <span className="text-red-500 font-bold">{stats.redFlags} <span className="font-normal text-slate-500 dark:text-slate-400">red‑flags</span></span>
        <span className="text-blue-500 font-bold">{stats.interventions} <span className="font-normal text-slate-500 dark:text-slate-400">interventions</span></span>
        <span className="text-orange-500 font-bold">{stats.pending} <span className="font-normal text-slate-500 dark:text-slate-400">pending</span></span>
        <span className="text-emerald-500 font-bold">{stats.resolved} <span className="font-normal text-slate-500 dark:text-slate-400">resolved</span></span>
      </div>

      {/* Feed – 3‑column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginated.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <Flag size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 mt-3 font-bold">No reports found</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Try adjusting your filters</p>
          </div>
        ) : (
          paginated.map((incident) => (
            <div
              key={incident.id}
              onClick={() => navigate(`/home/incident/${incident.id}`)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden cursor-pointer hover:border-blue-500 transition-all shadow-sm hover:shadow-md flex flex-col"
            >
              {/* Always show image container – logo will display as placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                <img
                  src={incident.thumbnail}
                  alt={incident.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 flex-1 flex flex-col space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                  {incident.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 flex-1">
                  {incident.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {incident.timestamp}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    incident.type === "red flag"
                      ? "bg-red-500/10 text-red-500 dark:text-red-400"
                      : "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                  }`}>
                    {incident.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    incident.status === "pending" || incident.status === "red flag"
                      ? "bg-red-500/10 text-red-500 dark:text-red-400"
                      : incident.status === "under investigation"
                      ? "bg-orange-500/10 text-orange-500 dark:text-orange-400"
                      : incident.status === "rejected"
                      ? "bg-red-500/10 text-red-500 dark:text-red-400"
                      : "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                  }`}>
                    {incident.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:border-blue-500 transition-all"
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
                    className={`w-7 h-7 rounded-xl text-xs font-black transition-all ${
                      page === n ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-500"
                    }`}
                  >
                    {n}
                  </button>
                );
              }
              return (
                <span key={i} className="w-7 h-7 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs">…</span>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 disabled:opacity-30 hover:border-blue-500 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}