import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../utils/api";
import { useRecords } from "../context/RecordsContext";
import LoadingOverlay from "../components/LoadingOverlay";
import { Eye, EyeOff } from 'lucide-react';

const validate = (email, password) => {
  const errors = {};
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
  if (!password) errors.password = "Password is required";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters";
  return errors;
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const { refreshRecords } = useRecords();

  // Visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError("");
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await api.login(email, password);
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setIsRedirecting(true);
      setOverlayMessage("Authenticating user...");
      await new Promise((resolve) => setTimeout(resolve, 600));

      setOverlayMessage("Loading your data...");
      try {
        await refreshRecords();
      } catch (refreshErr) {
        console.error("Failed to load user records:", refreshErr);
        setServerError("We had trouble loading your data. Please try refreshing the page.");
        setIsRedirecting(false);
        setLoading(false);
        return;
      }

      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setServerError("Could not connect to the server. Please check your internet connection and try again.");
      setLoading(false);
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border ${
      errors[field] ? "border-red-500 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 focus:ring-blue-500"
    } text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 outline-none transition-all`;

  return (
    <>
      {isRedirecting && <LoadingOverlay message={overlayMessage} />}
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020c1b] text-white p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl font-black text-2xl mb-4">IR</div>
            <h1 className="text-4xl font-black tracking-tight">IReporter</h1>
            <p className="text-slate-400 mt-2">Civic Justice & Whistleblower Platform</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4">
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <input type="email" placeholder="Email" value={email}
                  className={inputClass("email")}
                  onChange={e => { setEmail(e.target.value); setErrors({...errors, email: ""}); }}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1 pl-1">{errors.email}</p>}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  className={inputClass("password") + " pr-12"}
                  onChange={e => { setPassword(e.target.value); setErrors({...errors, password: ""}); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="text-red-400 text-xs mt-1 pl-1">{errors.password}</p>}
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black text-white transition-all">
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="text-center space-y-2 pt-2">
              <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Forgot Password?
              </Link>
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}