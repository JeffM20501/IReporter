import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import { PlusCircle, Flag, Search, Clock, Trash2, FileText, MapPin, Activity } from "lucide-react";
import { UserCircle } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import logoFallback from '../../assets/breaking.jpg';

const COLORS = {
  pending: '#F97316',      
  underInvestigation: '#8B5CF6', 
  rejected: '#EF4444',     
  resolved: '#10B981',     
  redFlag: '#EF4444',
  intervention: '#3B82F6', 
};

export default function Home() {
  const navigate = useNavigate();
  const { records, loading, deleteRecord } = useRecords();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [timeRange, setTimeRange] = useState(30); 

  const myRecords = records.filter(r => r.user_id === currentUser?.id);

  
  const stats = {
    total: myRecords.length,
    redFlags: myRecords.filter(r => r.type === "red flag").length,
    investigating: myRecords.filter(r => r.status === "investigating" || r.status === "under investigation").length,
    resolved: myRecords.filter(r => r.status === "resolved").length,
    rejected: myRecords.filter(r => r.status === "rejected").length,
    pending: myRecords.filter(r => r.status === "pending").length,
    interventions: myRecords.filter(r => r.type === "intervention").length,
    underInvestigation: myRecords.filter(r => r.status === "under investigation").length,
  };

  
  const trendData = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - timeRange);
    const filtered = myRecords.filter(r => new Date(r.created_at) >= start);
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
  }, [myRecords, timeRange]);

  
  const statusData = useMemo(() => {
    const map = {
      pending: stats.pending,
      'under investigation': stats.underInvestigation,
      rejected: stats.rejected,
      resolved: stats.resolved,
    };
    return Object.entries(map)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [stats]);

  
  
  
  
  

  const statusLabelMap = {
    pending: 'Pending',
    'under investigation': 'Under Investigation',
    rejected: 'Rejected',
    resolved: 'Resolved',
  };

  const getStatusColor = (status) => COLORS[status] || '#64748B';

  
  const handleDeleteClick = (e, record) => {
    e.stopPropagation();
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete) {
      await deleteRecord(recordToDelete.id);
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  const getThumbnail = (record) => {
    if (record.images && record.images.length > 0) {
      return record.images[0].image_url;
    }
    return logoFallback;
  };

  const statusColor = (status) => {
    if (status === "pending") return "bg-orange-500/10 text-orange-500 dark:text-orange-400";
    if (status === "investigating" || status === "under investigation") return "bg-purple-500/10 text-purple-500 dark:text-purple-400";
    if (status === "resolved") return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400";
    if (status === "rejected") return "bg-red-500/10 text-red-500 dark:text-red-400";
    return "bg-slate-500/10 text-slate-500";
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
      Loading your dashboard...
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* WELCOME HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          {currentUser?.profile_pic_url ? (
            <img
              src={currentUser.profile_pic_url}
              alt={currentUser.username}
              className="w-16 h-16 rounded-full object-cover border-4 border-white/40"
            />
          ) : (
            <UserCircle size={64} className="text-white/80" />
          )}
          <div>
            <h1 className="text-3xl font-black">
              Good to see you, {currentUser?.username || "Citizen"} 👋
            </h1>
            <p className="text-blue-100 text-sm mt-0.5">
              {stats.total === 0 
                ? "You haven't filed any reports yet. Ready to speak up?" 
                : `You've filed ${stats.total} report${stats.total > 1 ? 's' : ''}. Keep up the great work.`}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/home/report")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-black rounded-xl hover:bg-blue-50 transition-all shadow-md"
          >
            <PlusCircle size={18}/> File a Report
          </button>
          <button
            onClick={() => navigate("/home/activity")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all"
          >
            <Activity size={18}/> View Activity
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-blue-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Total Reports</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(stats.total).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-red-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Red Flags</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(stats.redFlags).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-orange-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Investigating</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(stats.investigating).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm border-b-4 border-b-emerald-500">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Resolved</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{String(stats.resolved).padStart(2, '0')}</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      {myRecords.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line chart: reports over time with filter */}
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
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart: status distribution */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${statusLabelMap[name] || name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={getStatusColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} reports`, statusLabelMap[name] || name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TWO‑COLUMN LAYOUT: Reports + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">My Reports</h2>
            <button
              onClick={() => navigate("/home/activity")}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
            >
              View all →
            </button>
          </div>
          {myRecords.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Flag size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-bold">No reports yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">File your first report to start tracking.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {myRecords.slice(0, 10).map(record => {
                const thumbnail = getThumbnail(record);
                return (
                  <div
                    key={record.id}
                    onClick={() => navigate(`/home/incident/${record.id}`)}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                      <img
                        src={thumbnail}
                        alt={record.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{record.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(record.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        record.type === "red flag"
                          ? "bg-red-500/10 text-red-500 dark:text-red-400"
                          : "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                      }`}>
                        {record.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${statusColor(record.status)}`}>
                        {record.status}
                      </span>
                      {record.status === "pending" && (
                        <button
                          onClick={(e) => handleDeleteClick(e, record)}
                          className="p-1.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete report"
                        >
                          <Trash2 size={12}/>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {myRecords.length > 10 && (
                <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Showing 10 of {myRecords.length} reports. View all in Activity Feed.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">Quick Actions</h3>
            <button
              onClick={() => navigate("/home/report")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
            >
              <PlusCircle size={18}/> New Report
            </button>
            <button
              onClick={() => navigate("/home/map")}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all mt-2"
            >
              <MapPin size={18} className="text-slate-500 dark:text-slate-400"/>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Map</span>
            </button>
            <button
              onClick={() => navigate("/home/activity")}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all mt-2"
            >
              <FileText size={18} className="text-slate-500 dark:text-slate-400"/>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All Reports</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">💡 Tip</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You can edit or delete your reports while they are <span className="font-bold text-orange-500">pending</span>. 
              Once reviewed, they become read‑only.
            </p>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && recordToDelete && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Report</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <strong>"{recordToDelete.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}