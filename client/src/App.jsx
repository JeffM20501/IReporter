import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { RecordsProvider } from './app/context/RecordsContext';
import Layout from './app/components/Layout';
import Login from './app/pages/Login';
import ForgotPassword from './app/pages/ForgotPassword';
import SignUp from './app/pages/SignUp';
import LiveMap from './app/pages/LiveMap';
import Home from './app/pages/Home';
import Activity from './app/pages/Activity';
import AdminDashboard from './app/pages/AdminDashboard';
import ReportSubmission from './app/pages/ReportSubmission';
import Settings from './app/pages/Settings'; 
import Landing from './app/pages/Landing';
import IncidentDetail from './app/pages/IncidentDetail';
import { useEffect } from 'react';
import { api } from "./app/utils/api"; 


const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && !user.is_admin) return <Navigate to="/home" />;
  return children;
};

function AuthSync() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "demo-token") return;
    api.me()
      .then(res => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then(data => {
        localStorage.setItem("user", JSON.stringify(data.user || data));
      })
      .catch(() => {
        localStorage.clear();
        window.location.href = "/login";
      });
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthSync />
      <RecordsProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="map" element={<LiveMap />} />
            <Route path="report" element={<ReportSubmission />} />
            <Route path="activity" element={<Activity />} />
            <Route path="incident/:id" element={<IncidentDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </RecordsProvider>
    </BrowserRouter>
  );
}