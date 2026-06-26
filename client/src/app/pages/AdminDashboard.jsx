import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import { Shield, ChevronLeft, ChevronRight, Search, Filter } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import logoFallback from '../../assets/breaking.jpg';

const PER_PAGE = 10;

const STATUS_COLORS = {
  pending: '#F97316',      // orange
  underInvestigation: '#8B5CF6', // purple
  rejected: '#EF4444',     // red
  resolved: '#10B981',     // emerald
};

const TYPE_COLORS = {
  'red flag': '#EF4444',
  'intervention': '#3B82F6',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { records, updateStatus } = useRecords();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState(30);

  // --- Stats ---
  const total = records.length;
  const redFlags = records.filter(r => r.type === "red flag").length;
  const interventions = records.filter(r => r.type === "intervention").length;
  const pending = records.filter(r => r.status === "pending").length;
  const underInvestigation = records.filter(r => r.status === "under investigation").length;
  const rejected = records.filter(r => r.status === "rejected").length;
  const resolved = records.filter(r => r.status === "resolved").length;

  const statusStats = { pending, underInvestigation, rejected, resolved };

  // --- Trend data (last N days) ---
  const trendData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - timeRange);
    const filtered = records.filter(r => new Date(r.created_at) >= start);
    const map = {};
    for (let d = 0; d < timeRange; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const key = date.toISOString().slice(0,10);
      map[key] = { date: key, count: 0 };
    }
    filtered.forEach(r => {
      const key = new Date(r.created_at).toISOString().slice(0,10);
      if (map[key]) map[key].count++;
    });
    return Object.values(map).reverse();
  }, [records, timeRange]);

  // --- Status distribution (donut) ---
  const statusChartData = useMemo(() => {
    const statuses = ['pending', 'under investigation', 'rejected', 'resolved'];
    return statuses.map(s => ({
      name: s,
      value: statusStats[s] || 0,
    })).filter(d => d.value > 0);
  }, [statusStats]);

  // --- Type distribution (donut) – kept for overview ---
  const typeChartData = useMemo(() => [
    { name: 'Red Flags', value: redFlags },
    { name: 'Interventions', value: interventions },
  ], [redFlags, interventions]);

  // --- Type breakdown bar chart (explicit comparison) ---
  const typeBreakdownData = useMemo(() => [
    { type: 'Red Flags', count: redFlags },
    { type: 'Interventions', count: interventions },
  ], [redFlags, interventions]);

  const statusLabelMap = {
    pending: 'Pending',
    'under investigation': 'Under Investigation',
    rejected: 'Rejected',
    resolved: 'Resolved',
  };

  const getStatusColor = (status) => STATUS_COLORS[status] || '#64748B';

  // --- Table filters ---
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-blue-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Total Reports</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(total).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-red-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Red Flags</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(redFlags).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-orange-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Pending</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(pending).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Resolved</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(resolved).padStart(2, '0')}</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend chart */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Reports Over Time (Last {timeRange} Days)
              </h3>
              <div className="flex gap-1">
                {[7, 14, 30, 90].map(days => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                      timeRange === days
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="adminColorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#adminColorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${statusLabelMap[name] || name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.name} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} reports`, statusLabelMap[name] || name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type Distribution (Donut) – kept for quick glance */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Type Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  <Cell fill={TYPE_COLORS['red flag']} />
                  <Cell fill={TYPE_COLORS['intervention']} />
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} reports`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Type Breakdown Bar Chart – explicit comparison */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Red Flags vs Interventions</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeBreakdownData} layout="vertical" margin={{ top: 5, right: 5, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 12, fontWeight: 'bold' }} width={100} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                  {typeBreakdownData.map((entry, index) => (
                    <Cell key={entry.type} fill={entry.type === 'Red Flags' ? '#EF4444' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Bar – toggle */}
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

      {/* Records Table */}
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