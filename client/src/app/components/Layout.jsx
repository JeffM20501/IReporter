import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Map, List, ShieldCheck, Settings, PlusCircle,
  LogOut, ChevronLeft, Sun, Moon, LayoutDashboard, Menu, X,
} from "lucide-react";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all ${
      isActive
        ? "bg-blue-600 text-white shadow-lg"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
    }`;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">

      
      <aside className={`hidden md:flex flex-col p-4 border-r transition-all duration-200 ${
        collapsed ? "w-20" : "w-64"
      } bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800`}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-blue-600 p-2 rounded-lg font-black text-white flex-shrink-0">IR</div>
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">IReporter</h1>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink to="/home" end className={linkClass}>
            <LayoutDashboard size={20} className="flex-shrink-0" />
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
            className="flex items-center gap-3 p-3 rounded-xl w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
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
            className="flex items-center gap-3 p-3 text-red-500 w-full hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-[110] p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-all"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      
      <aside
        className={`fixed top-0 left-0 z-[100] h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-4">
          
          <div className="flex justify-end mb-6">
            <button onClick={closeMobileMenu} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X size={24} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="bg-blue-600 p-2 rounded-lg font-black text-white flex-shrink-0">IR</div>
            <h1 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">IReporter</h1>
          </div>

          
          <nav className="flex-1 space-y-1">
            <NavLink to="/home" end className={mobileLinkClass} onClick={closeMobileMenu}>
              <LayoutDashboard size={20} className="flex-shrink-0" />
              Dashboard
            </NavLink>
            <NavLink to="/home/map" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Map size={20} className="flex-shrink-0" />
              Live Map
            </NavLink>
            <NavLink to="/home/report" className={mobileLinkClass} onClick={closeMobileMenu}>
              <PlusCircle size={20} className="flex-shrink-0" />
              File Report
            </NavLink>
            <NavLink to="/home/activity" className={mobileLinkClass} onClick={closeMobileMenu}>
              <List size={20} className="flex-shrink-0" />
              Activity Feed
            </NavLink>
            {user?.is_admin && (
              <NavLink to="/home/admin" className={mobileLinkClass} onClick={closeMobileMenu}>
                <ShieldCheck size={20} className="flex-shrink-0" />
                Admin Panel
              </NavLink>
            )}
          </nav>

          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => { toggleTheme(); closeMobileMenu(); }}
              className="flex items-center gap-3 p-3 rounded-xl w-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              {dark ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <NavLink to="/home/settings" className={mobileLinkClass} onClick={closeMobileMenu}>
              <Settings size={20} className="flex-shrink-0" />
              Settings
            </NavLink>
            <button
              onClick={() => { localStorage.clear(); navigate("/login"); closeMobileMenu(); }}
              className="flex items-center gap-3 p-3 text-red-500 w-full hover:bg-red-500/10 rounded-xl transition-all"
            >
              <LogOut size={20} className="flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`} />
          </button>
          <div className="md:hidden font-black text-blue-600 text-xl">iR</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Expose. Don't Suppress</div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-white dark:bg-slate-950">
          <Outlet />
        </section>
      </main>
    </div>
  );
}