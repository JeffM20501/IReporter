import { useState, useEffect } from "react";
import { User, Mail, Phone, Save, Sun, Moon, Camera, UserCircle, LogOut } from 'lucide-react';
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.me();
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handler = () => {
      setDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('themechange', handler);
    return () => window.removeEventListener('themechange', handler);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('themechange'));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadProfilePic = async () => {
    if (!profilePicFile) return null;
    const formData = new FormData();
    formData.append('profile_pic', profilePicFile);
    try {
      const res = await api.uploadProfilePic(formData);
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.profile_pic_url;
    } catch (err) {
      setMessage({ type: 'error', text: 'Profile picture upload failed' });
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    let newProfilePicUrl = user.profile_pic_url;
    if (profilePicFile) {
      const uploadedUrl = await uploadProfilePic();
      if (uploadedUrl) {
        newProfilePicUrl = uploadedUrl;
        setUser(prev => ({ ...prev, profile_pic_url: uploadedUrl }));
      }
    }

    try {
      const res = await api.updateUser({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Update failed');
      }
      const updatedUser = await res.json();
      setUser(updatedUser.user);
      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfilePicFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 dark:text-red-400">
        Unable to load user data.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-black italic text-slate-900 dark:text-white">SETTINGS</h1>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 space-y-6">

          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : user.profile_pic_url ? (
                  <img src={user.profile_pic_url} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={64} className="text-slate-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={16} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click the camera to change profile picture</p>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                value={user.username}
                onChange={e => setUser({ ...user, username: e.target.value })}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Phone Number (for SMS alerts)
            </label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="+254712345678"
                value={user.phone_number || ''}
                onChange={e => setUser({ ...user, phone_number: e.target.value })}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Format: +254XXXXXXXXX</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <Save size={18} />
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full py-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all hover:border-blue-500"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>

          {/* Message */}
          {message.text && (
            <div className={`text-center text-sm font-bold p-3 rounded-xl ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}