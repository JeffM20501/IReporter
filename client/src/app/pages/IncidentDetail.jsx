import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecords } from '../context/RecordsContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Clock, User, MapPin, Pencil, Trash2, Save, X } from 'lucide-react';
import { api } from "../utils/api";
import { reverseGeocode } from '../utils/geocode';
import LoadingOverlay from '../components/LoadingOverlay';

const STATUS_ORDER = ['pending', 'under investigation', 'resolved'];
const TIMELINE = [
  { key: 'pending', label: 'Report Submitted' },
  { key: 'under investigation', label: 'Under Investigation' },
  { key: 'resolved', label: 'Resolved' },
];

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const { deleteRecord, editRecord, updateStatus } = useRecords();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [record, setRecord] = useState(null);
  const [placeName, setPlaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [deleting, setDeleting] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: '', visible: false, exiting: false });
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true, exiting: false });
    setTimeout(() => {
      setToast(prev => ({ ...prev, exiting: true }));
      setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false, exiting: false }));
      }, 300);
    }, 4000);
  };
  const closeToast = () => {
    setToast(prev => ({ ...prev, exiting: true }));
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false, exiting: false }));
    }, 300);
  };

  // Loading states for async actions
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    api.getRecord(id)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRecord(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch record:", err);
        setRecord(null);
        setLoading(false);
        showToast("Failed to load incident details", "error");
      });
  }, [id]);

  useEffect(() => {
    if (record?.latitude && record?.longitude) {
      reverseGeocode(record.latitude, record.longitude).then(setPlaceName);
    }
  }, [record]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">
        Incident not found.
      </div>
    );
  }

  const isPending = record.status === "pending";
  const isOwner = currentUser?.id === record?.user_id;
  const canEdit = isPending && isOwner;
  const isAdmin = currentUser?.is_admin === true;

  let currentIndex = STATUS_ORDER.indexOf(record.status);
  if (currentIndex === -1 && record.status === 'rejected') {
    currentIndex = STATUS_ORDER.length - 1;
  }

  const handleEdit = () => {
    setEditData({ title: record.title, description: record.description });
    setNewImages([]);
    setNewVideo(null);
    setPreviewUrls([]);
    setEditing(true);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await editRecord(record.id, editData);
      
      // Upload new images
      for (const img of newImages) {
        await api.uploadImage(record.id, img);
      }
      
      if (newVideo) {
        await api.uploadVideo(record.id, newVideo);
      }
      
      // Refresh record
      const refreshed = await api.getRecord(record.id);
      const data = await refreshed.json();
      setRecord(data.data);
      
      setEditing(false);
      setNewImages([]);
      setNewVideo(null);
      setPreviewUrls([]);
      showToast("Incident updated successfully!", "success");
    } catch (err) {
      console.error("Save failed", err);
      showToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setDeleting(true);
    try {
      await deleteRecord(record.id);
      showToast("Incident deleted successfully", "success");
      navigate(-1);
    } catch (err) {
      console.error("Delete failed", err);
      showToast("Failed to delete incident", "error");
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (statusUpdating) return;
    const oldStatus = record.status;
    setRecord({ ...record, status: newStatus });
    setStatusUpdating(true);
    try {
      await updateStatus(record.id, newStatus);
      showToast(`Status updated to "${newStatus}"`, "success");
    } catch (err) {
      setRecord({ ...record, status: oldStatus });
      console.error("Status update failed", err);
      showToast("Failed to update status", "error");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <>
      {/* Toast Notification – top‑centered */}
      {toast.visible && (
        <div className={`fixed top-4 left-0 right-0 mx-auto z-[9999] w-full max-w-md transition-all duration-300 ease-in-out ${
          toast.exiting ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
        }`}>
          <div className={`rounded-xl shadow-2xl border p-4 flex items-start gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex-1">
              <p className={`text-sm font-bold ${
                toast.type === 'success'
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={closeToast}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Incident Details</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Admin status changer */}
            {isAdmin && !editing && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</label>
                <select
                  value={record.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusUpdating}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="under investigation">Under Investigation</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            )}

            {/* Owner edit/delete buttons */}
            {canEdit && !editing && (
              <div className="flex gap-2">
                <button onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600/20 transition-all disabled:opacity-50"
                  disabled={deleting || saving}
                >
                  <Pencil size={14}/> Edit
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50"
                >
                  <Trash2 size={14}/> Delete
                </button>
              </div>
            )}

            {/* Edit mode save/cancel */}
            {editing && (
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Save size={14}/> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  <X size={14}/> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains unchanged, but we'll use the toast instead of alert() etc. */}
        
        {record.images?.[0]?.image_url && (
          <div className="relative rounded-3xl overflow-hidden h-64">
            <img src={record.images[0].image_url} alt={record.title} className="w-full h-full object-cover" />
            <span className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-black uppercase text-white ${
              record.type === 'red flag' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {record.type}
            </span>
            {isPending && isOwner && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase bg-amber-500 text-white">
                Pending — Editable
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          {editing ? (
            <input
              value={editData.title}
              onChange={e => setEditData({...editData, title: e.target.value})}
              className="w-full text-2xl font-black bg-white dark:bg-slate-800 border border-blue-500 rounded-xl px-4 py-2 text-slate-900 dark:text-white outline-none"
              disabled={saving}
            />
          ) : (
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">{record.title}</h2>
          )}
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-base">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {new Date(record.created_at).toLocaleString()}
            </span>
            <span className="flex items-center gap-2">
              {record.user?.profile_pic_url ? (
                <img 
                  src={record.user.profile_pic_url} 
                  alt={record.user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {record.user?.username || 'Unknown'}
              </span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</h3>
          {editing ? (
            <textarea
              value={editData.description}
              onChange={e => setEditData({...editData, description: e.target.value})}
              className="w-full bg-white dark:bg-slate-900 border border-blue-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none h-32 resize-none"
              disabled={saving}
            />
          ) : (
            <p className="text-slate-900 dark:text-white leading-relaxed">{record.description}</p>
          )}
        </div>

        {editing && (
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Add Images (optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setNewImages(prev => [...prev, ...files]);
                  const urls = files.map(f => URL.createObjectURL(f));
                  setPreviewUrls(prev => [...prev, ...urls]);
                }}
                disabled={saving}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative">
                      <img src={url} alt="preview" className="w-full h-20 object-cover rounded-lg" />
                      <button
                        onClick={() => {
                          setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                          setNewImages(prev => prev.filter((_, i) => i !== idx));
                        }}
                        disabled={saving}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
                Add Video (optional, max 100MB)
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setNewVideo(file);
                }}
                disabled={saving}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {newVideo && (
                <div className="mt-2 flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">
                  <span className="text-xs truncate">{newVideo.name}</span>
                  <button
                    onClick={() => setNewVideo(null)}
                    disabled={saving}
                    className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {record.latitude && record.longitude && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
              <MapPin size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Location</h3>
            </div>
            <p className="text-slate-900 dark:text-white font-mono text-sm">
              {placeName || (record.latitude && record.longitude ? "Loading location..." : "No location provided")}
            </p>
            <div className="h-48 rounded-xl overflow-hidden">
              <MapContainer center={[record.latitude, record.longitude]} zoom={14} className="h-full w-full" zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[record.latitude, record.longitude]} />
              </MapContainer>
            </div>
          </div>
        )}

        {(record.images?.length > 0 || record.videos?.length > 0) && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Media</h3>
            {record.images?.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {record.images.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden">
                    <img src={img.image_url} className="w-full h-24 object-cover" />
                    {canEdit && !editing && (
                      <button
                        onClick={async () => {
                          await api.deleteImage(img.id);
                          setRecord({ ...record, images: record.images.filter(i => i.id !== img.id) });
                          showToast("Image removed", "success");
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {record.videos?.map((vid) => (
              <div key={vid.id} className="relative">
                <video src={vid.video_url} controls className="w-full rounded-xl" />
                {canEdit && !editing && (
                  <button
                    onClick={async () => {
                      await api.deleteVideo(vid.id);
                      setRecord({ ...record, videos: record.videos.filter(v => v.id !== vid.id) });
                      showToast("Video removed", "success");
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                  >
                    Delete Video
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timeline</h3>
          <div className="space-y-0">
            {TIMELINE.map((step, index) => {
              const isCompleted = index <= currentIndex;
              const isLast = index === TIMELINE.length - 1;
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      isCompleted ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                    }`}>
                      {isCompleted && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {!isLast && <div className={`w-0.5 h-10 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                  </div>
                  <div className="pb-2 pt-1">
                    <p className={`font-bold text-sm ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {isCompleted ? new Date(record.created_at).toLocaleString() : 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {record.status === 'rejected' && (
              <div className="flex gap-4 mt-2">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-red-500 border-red-500">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="pb-2 pt-1">
                  <p className="font-bold text-sm text-red-600 dark:text-red-400">Rejected</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(record.updated_at || record.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Report</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Are you sure you want to delete this report? This action cannot be undone.
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
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}