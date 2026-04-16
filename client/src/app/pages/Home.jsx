import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/RecordsContext";
import { PlusCircle, Flag, Search, Clock, Trash2 } from "lucide-react";
import { UserCircle } from 'lucide-react';


export default function Home() {
  const navigate = useNavigate();
  const { records, loading, deleteRecord } = useRecords();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const myRecords = records.filter(r => r.user_id === currentUser?.id);

  // Summary stats
  const stats = {
    total: myRecords.length,
    redFlags: myRecords.filter(r => r.type === "red flag").length,
    investigating: myRecords.filter(r => r.status === "investigating" || r.status === "under investigation").length,
    resolved: myRecords.filter(r => r.status === "resolved").length,
  };

  // Detailed stats: type + status
  const typeStatusMap = {
    "red flag": {
      pending: 0,
      "under investigation": 0,
      rejected: 0,
      resolved: 0,
    },
    intervention: {
      pending: 0,
      "under investigation": 0,
      rejected: 0,
      resolved: 0,
    },
  };

  myRecords.forEach(record => {
    const type = record.type;
    const status = record.status;
    if (typeStatusMap[type] && typeStatusMap[type][status] !== undefined) {
      typeStatusMap[type][status]++;
    }
  });

  const statusConfig = {
    pending: { label: "Pending", color: "border-b-orange-500", textColor: "text-orange-500" },
    "under investigation": { label: "Under Investigation", color: "border-b-purple-500", textColor: "text-purple-500" },
    rejected: { label: "Rejected", color: "border-b-red-600", textColor: "text-red-600" },
    resolved: { label: "Resolved", color: "border-b-emerald-500", textColor: "text-emerald-500" },
  };

  const statusColor = (status) => {
    if (status === "pending") return "bg-red-500/10 text-red-500 dark:text-red-400";
    if (status === "investigating" || status === "under investigation") return "bg-orange-500/10 text-orange-500 dark:text-orange-400";
    if (status === "resolved") return "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400";
    if (status === "rejected") return "bg-slate-500/10 text-slate-500";
    return "bg-slate-500/10 text-slate-500";
  };

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

  if (loading) return (
    <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
      Loading...
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* GREETING */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {currentUser?.profile_pic_url ? (
          <img
            src={currentUser.profile_pic_url}
            alt={currentUser.username}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <UserCircle size={48} className="text-slate-400" />
        )}
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Welcome, {currentUser?.username || "Citizen"} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 uppercase tracking-widest">
            Your reporting dashboard
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/home/report")}
        className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-500/20"
      >
        <PlusCircle size={18}/> File Report
      </button>
    </div>

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 border-b-[4px] border-b-blue-500 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total Reports</p>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(stats.total).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 border-b-[4px] border-b-red-500 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Red Flags</p>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(stats.redFlags).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 border-b-[4px] border-b-orange-500 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Investigating</p>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(stats.investigating).padStart(2, '0')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 border-b-[4px] border-b-emerald-500 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Resolved</p>
          <p className="text-4xl font-black italic text-slate-900 dark:text-white">{String(stats.resolved).padStart(2, '0')}</p>
        </div>
      </div>

      {/* DETAILED STATS CARDS (type + status) - only show if count > 0 */}
      {Object.keys(typeStatusMap).map(type => (
        <div key={type} className="space-y-3">
          <h3 className="text-md font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {type === "red flag" ? "🚩 Red Flag Reports" : "🛠️ Intervention Reports"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(typeStatusMap[type]).map(([status, count]) => {
              if (count === 0) return null;
              const config = statusConfig[status];
              return (
                <div
                  key={`${type}-${status}`}
                  className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 border-b-[3px] ${config.color} shadow-sm`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {config.label}
                  </p>
                  <p className={`text-2xl font-black italic ${config.textColor}`}>
                    {String(count).padStart(2, '0')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* MY REPORTS */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">My Reports</h2>

        {myRecords.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center space-y-4">
            <Flag size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">You haven't filed any reports yet.</p>
            <button
              onClick={() => navigate("/home/report")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all"
            >
              File Your First Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myRecords.map(record => (
              <div
                key={record.id}
                onClick={() => navigate(`/home/incident/${record.id}`)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-blue-500 transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white truncate">{record.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(record.created_at).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    record.type === "red flag"
                      ? "bg-red-500/10 text-red-500 dark:text-red-400"
                      : "bg-blue-500/10 text-blue-500 dark:text-blue-400"
                  }`}>
                    {record.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColor(record.status)}`}>
                    {record.status}
                  </span>

                  {/* DELETE — only when pending */}
                  {record.status === "pending" && (
                    <button
                      onClick={(e) => handleDeleteClick(e, record)}
                      className="p-2 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete report"
                    >
                      <Trash2 size={14}/>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK LINKS */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/home/map")}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left hover:border-blue-500 transition-all space-y-2"
        >
          <Search size={24} className="text-blue-500" />
          <p className="font-black text-slate-900 dark:text-white">Live Map</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">View all incidents on the map</p>
        </button>
        <button
          onClick={() => navigate("/home/activity")}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left hover:border-blue-500 transition-all space-y-2"
        >
          <Clock size={24} className="text-orange-500" />
          <p className="font-black text-slate-900 dark:text-white">Activity Feed</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Browse all community reports</p>
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
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