import { useState } from 'react';
import Map from '../components/Map';
import { Camera, Video, Send, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLocation } from "react-router-dom";
import { api } from "../utils/api";
import { useRecords } from "../context/RecordsContext";

const validate = (formData, location) => {
  const errors = {};
  if (!formData.title.trim()) errors.title = "Title is required";
  else if (formData.title.trim().length < 5) errors.title = "Title must be at least 5 characters";
  if (!formData.description.trim()) errors.description = "Description is required";
  else if (formData.description.trim().length < 20) errors.description = "Description must be at least 20 characters";
  if (!location) errors.location = "Please pin the incident location on the map";
  return errors;
};

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export default function ReportSubmission() {
  const routerState = useLocation();
  const [formData, setFormData] = useState({ title: '', description: '', type: 'red flag' });
  const [location, setLocation] = useState(routerState.state?.location || null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [timestamp] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { addRecord } = useRecords();

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearVideo = () => setVideo(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const oversized = [];

    for (const file of files) {
      if (file.size <= MAX_IMAGE_SIZE) validFiles.push(file);
      else oversized.push(file.name);
    }

    if (oversized.length > 0) {
      setSubmitError(`${oversized.length} image(s) exceed 8MB limit and were not added.`);
      setTimeout(() => setSubmitError(""), 5000);
    }

    if (validFiles.length > 0) {
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size <= MAX_VIDEO_SIZE) setVideo(file);
    else {
      setSubmitError(`Video "${file.name}" exceeds 100MB limit.`);
      setTimeout(() => setSubmitError(""), 5000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const errs = validate(formData, location);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);

    try {
      const res = await api.createRecord({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        latitude: location[0],
        longitude: location[1],
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit report");
      }

      const json = await res.json();
      const newRec = json.data;
      addRecord(newRec);
      const record_id = json.data?.id || json.id;

      for (const img of images) {
        await api.uploadImage(record_id, img);
      }
      if (video) await api.uploadVideo(record_id, video);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
    } text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 outline-none transition-all`;

  if (submitted) return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-4">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white">Report Submitted!</h2>
      <p className="text-slate-500 dark:text-slate-400">Your report has been sent and will be reviewed by authorities. You'll receive an email update.</p>
      <button
        onClick={() => {
          setSubmitted(false);
          setFormData({ title: '', description: '', type: 'red flag' });
          setLocation(null);
          setImages([]);
          setVideo(null);
        }}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all"
      >
        Submit Another
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">File a Report</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Provide details, location, and evidence for your incident.</p>
      </header>

      <div className="space-y-6">
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">
            <span>🕒</span>
            <span>Report time: <span className="font-bold text-slate-900 dark:text-white">
              {timestamp.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })}
            </span></span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
              Report Type
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option value="red flag"> Red‑Flag (Corruption)</option>
              <option value="intervention"> Intervention (Infrastructure)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
              Title
            </label>
            <input
              placeholder="Brief title (min 5 characters)"
              value={formData.title}
              className={inputClass("title")}
              onChange={e => { setFormData({...formData, title: e.target.value}); setErrors({...errors, title: ""}); }}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
              Description
            </label>
            <textarea
              placeholder="Detailed description (min 20 characters)"
              value={formData.description}
              className={`${inputClass("description")} min-h-[120px] resize-y`}
              onChange={e => { setFormData({...formData, description: e.target.value}); setErrors({...errors, description: ""}); }}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.description}</p>}
          </div>

          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                Images (optional)
              </label>
              <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                <Camera size={20}/>
                <span className="text-sm font-medium">{images.length > 0 ? `${images.length} image(s) selected` : 'Select images'}</span>
                <input type="file" multiple hidden accept="image/*" onChange={handleImageChange} />
              </label>
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={URL.createObjectURL(img)} alt={`preview ${idx}`} className="w-full h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-80 hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                Video (optional)
              </label>
              <label className="flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                <Video size={20}/>
                <span className="text-sm font-medium">{video ? 'Video selected' : 'Select video'}</span>
                <input type="file" hidden accept="video/*" onChange={handleVideoChange} />
              </label>
              {video && (
                <div className="mt-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                  <span className="text-sm truncate">{video.name}</span>
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              <AlertCircle size={14}/> {submitError}
            </div>
          )}
        </div>

        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Pin Location
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Click on the map to set the incident location.</p>
            </div>
            {location && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                ✓ Pinned
              </span>
            )}
          </div>
          
          <div className={`h-64 relative z-0 overflow-hidden ${errors.location ? 'ring-4 ring-red-500' : ''}`}>
            <Map
              onLocationSelect={(coords) => { setLocation(coords); setErrors({...errors, location: ""}); }}
              selectedLocation={location}
              className="z-0"
              style={{ zIndex: 0 }}
            />
          </div>
          {errors.location && (
            <div className="p-3 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={14}/> {errors.location}
            </div>
          )}
          {location && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 text-center border-t border-slate-200 dark:border-slate-700">
              📍 {location[0].toFixed(5)}, {location[1].toFixed(5)}
            </div>
          )}
        </div>

        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={20}/>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}