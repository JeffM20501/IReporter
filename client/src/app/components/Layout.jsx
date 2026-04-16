import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Map, List, ShieldCheck, Settings, PlusCircle,
  LogOut, ChevronLeft, Sun, Moon, LayoutDashboard,
} from "lucide-react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    document.documentElement.classList.toggle("dark", isDark);
    return isDark;
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const toggleTheme = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-lg"
        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">

      <aside className={`hidden md:flex flex-col p-4 border-r transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}>

        {/* Clickable Logo */}
        <div 
          onClick={() => navigate("/")}
          className="flex items-center gap-3 mb-10 px-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="bg-blue-600 p-2 rounded-lg font-black text-white flex-shrink-0">IR</div>
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">IReporter</h1>
          )}
        </div>

        <nav className="flex-1 space-y-1">

        <NavLink to="/home" end className={linkClass}>
          <Map size={20} className="flex-shrink-0" />
          {!collapsed && "Dashboard"}
        </NavLink>
        <NavLink to="/home/map" className={linkClass}>
          <Map size={20} className="flex-shrink-0" />
          {!collapsed && "Live Map"}
        </NavLink>
        <NavLink to="/home/report" className={linkClass}>
          <PlusCircle size={20} className="flex-shrink-0" />
          {!collapsed && "File Report"}
        </NavLink>
        <NavLink to="/home/activity" className={linkClass}>
          <List size={20} className="flex-shrink-0" />
          {!collapsed && "Activity Feed"}
        </NavLink>
        {user?.is_admin && (
          <NavLink to="/home/admin" className={linkClass}>
            <ShieldCheck size={20} className="flex-shrink-0" />
            {!collapsed && "Admin Panel"}
          </NavLink>
        )}
      </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 p-3 rounded-xl w-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {dark ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
            {!collapsed && (dark ? "Light Mode" : "Dark Mode")}
          </button>
          <NavLink to="/home/settings" className={linkClass}>
            <Settings size={20} className="flex-shrink-0" />
            {!collapsed && "Settings"}
          </NavLink>
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="flex items-center gap-3 p-3 text-red-400 w-full hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
          <div className="md:hidden font-black text-blue-600 text-xl">iR</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Expose. Don't Suppress</div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </section>

        <nav className="md:hidden fixed bottom-0 w-full h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center">
        <NavLink to="/home" end className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
          <LayoutDashboard size={22} />
        </NavLink>
        <NavLink to="/home/map" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
          <Map size={22} />
        </NavLink>
        <NavLink to="/home/report" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
          <PlusCircle size={22} />
        </NavLink>
        <NavLink to="/home/activity" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
          <List size={22} />
        </NavLink>
        <NavLink to="/home/settings" className={({ isActive }) => isActive ? "text-blue-600" : "text-slate-400"}>
          <Settings size={22} />
        </NavLink>
      </nav>
      </main>
    </div>
  );
}