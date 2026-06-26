const BASE = import.meta.env.VITE_API || "http://localhost:5000/api/v1";

const authHeaders = (isFormData = false) => {
  const token = localStorage.getItem("token");
  const h = { Authorization: `Bearer ${token}` };
  if (!isFormData) h["Content-Type"] = "application/json";
  return h;
};

export const api = {
  login: (email, password) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  register: (username, email, password, phone_number) =>
    fetch(`${BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, phone_number }),
    }),

  updateUser: (userData) =>
    fetch(`${BASE}/auth/me`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(userData),
    }),

  uploadProfilePic: (formData) =>
    fetch(`${BASE}/auth/me/profile-pic`, {
      method: "POST",
      headers: authHeaders(true),
      body: formData,
    }),

  me: () => fetch(`${BASE}/auth/me`, { headers: authHeaders() }),

  logout: () =>
    fetch(`${BASE}/auth/logout`, {
      method: "POST",
      headers: authHeaders(),
    }),

  forgotPassword: (email) =>
    fetch(`${BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  verifyResetCode: (email, code) =>
    fetch(`${BASE}/auth/verify-reset-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    }),

  resetPassword: (email, reset_token, password) =>
    fetch(`${BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, reset_token, password }),
    }),

  getRecords: () =>
    fetch(`${BASE}/records?per_page=100`, { headers: authHeaders() })
      .then(res=>res.ok?res.json():Promise.reject())
      .then(data=>data.data),

  getRecord: (id) =>
    fetch(`${BASE}/records/${id}`, { headers: authHeaders() }),

  getRecentReports:()=>
    fetch(`${BASE}/public/recent-reports`)
      .then(res=>res.ok?res.json():Promise.reject())
      .then(data=>data.data),

  createRecord: (body) =>
    fetch(`${BASE}/records/create`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  updateRecord: (id, body) =>
    fetch(`${BASE}/records/me/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    }),

  deleteRecord: (id) =>
    fetch(`${BASE}/records/me/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  updateStatus: (id, status) =>
    fetch(`${BASE}/admin/records/${id}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }),

  uploadImage: (record_id, imageFile) => {
    const form = new FormData();
    form.append("record_id", record_id);
    form.append("image", imageFile);
    return fetch(`${BASE}/images/upload`, {
      method: "POST",
      headers: authHeaders(true),
      body: form,
    });
  },

  deleteImage: (id) =>
    fetch(`${BASE}/images/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),

  uploadVideo: (record_id, videoFile) => {
    const form = new FormData();
    form.append("record_id", record_id);
    form.append("video", videoFile);
    return fetch(`${BASE}/videos/upload`, {
      method: "POST",
      headers: authHeaders(true),
      body: form,
    });
  },

  deleteVideo: (id) =>
    fetch(`${BASE}/videos/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }),
};