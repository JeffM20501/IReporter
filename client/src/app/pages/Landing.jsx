import { useNavigate } from "react-router-dom";
import { Shield, Eye, Users, Flag, Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const fancyFont = "font-serif font-extrabold tracking-wide";
  const cardHover =
    "transition duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1";

  const heroImage =
    "https://cdn.tuko.co.ke/images/1120/2c4815b51bab6749.jpeg?v=1";

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-12 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">
            iR
          </div>
          <span className="font-semibold text-lg text-slate-800">iReporter</span>
        </div>

        <nav className="hidden md:flex gap-8 text-slate-500">
          <a href="#about" className="hover:text-blue-600 transition">About</a>
          <a href="#how" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#why" className="hover:text-blue-600 transition">Why iReporter</a>
        </nav>

        <button
          onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          {isLoggedIn ? "Go to Dashboard" : "Submit Report"}
        </button>
      </header>

      {/* HERO / ABOUT */}
      <section id="about" className="px-12 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-slate-500 mb-3 flex items-center gap-2">
            <Flag size={16} className="text-blue-600" /> For a Better Kenya
          </p>

          <h1 className="text-5xl leading-tight">
            <span
              className={`text-blue-600 ${fancyFont} italic transition-all duration-700 ease-out
              ${showTitle ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              Expose Corruption.
            </span>
            <br />
            <span className={`text-slate-900 ${fancyFont}`}>Defend Our Nation.</span>
          </h1>

          <p className="mt-5 text-slate-600 max-w-md">
            iReporter is a secure, citizen‑driven platform where every Kenyan can
            report corruption, demand accountability, and help build the transparent
            Kenya we deserve.
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              {isLoggedIn ? "Go to Dashboard" : "File a Report"}
            </button>
            <button
              onClick={() => navigate(isLoggedIn ? "/home" : "/signup")}
              className="px-5 py-3 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
            >
              {isLoggedIn ? "Dashboard" : "Join the Movement"}
            </button>
          </div>
        </div>

        {/* RIGHT DIAGONAL IMAGE */}
        <div className="relative h-96 md:h-[500px] lg:h-[600px]">
          <div className="absolute -bottom-5 -right-5 w-full h-full bg-blue-50 border border-slate-200 rounded-2xl" />
          <div className="absolute inset-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={heroImage}
              alt="Nairobi news scene"
              className="w-full h-full object-contain bg-slate-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
          </div>
          <div className="absolute -top-3 -left-3 w-full h-full bg-white border border-slate-200 rounded-2xl opacity-30" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-12 py-20 bg-slate-50">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
            Your Role, Our Process
          </span>
          <h2 className={`text-4xl text-slate-900 ${fancyFont}`}>
            How iReporter Works
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mt-2">
            From your report to real action – every step counts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-black text-xl">1</span>
            </div>
            <h3 className="text-blue-600 font-semibold mb-2">Submit Report</h3>
            <p className="text-slate-600">
              Share corruption incidents, upload evidence, and pin the exact location
              – anonymously if you wish.
            </p>
          </div>

          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-black text-xl">2</span>
            </div>
            <h3 className="text-blue-600 font-semibold mb-2">Investigation</h3>
            <p className="text-slate-600">
              Our team and relevant authorities verify the claims, review evidence,
              and classify the report for action.
            </p>
          </div>

          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-blue-600 font-black text-xl">3</span>
            </div>
            <h3 className="text-blue-600 font-semibold mb-2">Justice & Reform</h3>
            <p className="text-slate-600">
              Cases are escalated until justice is served – and systemic changes
              are demanded.
            </p>
          </div>
        </div>
      </section>

      {/* WHY iReporter */}
      <section id="why" className="px-12 py-16 bg-white">
        <div className="text-center mb-12">
          <Heart size={28} className="text-blue-600 mx-auto mb-2" />
          <h2 className={`text-4xl text-slate-900 ${fancyFont}`}>
            Why Every Kenyan Should Use iReporter
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mt-2">
            Because silence enables corruption – together we build a nation of
            integrity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-6 bg-slate-50 border rounded-2xl ${cardHover}`}>
            <Shield className="text-blue-600" size={32} />
            <h3 className="mt-3 font-semibold text-lg">Secure & Anonymous</h3>
            <p className="text-slate-500 text-sm">
              Your identity is protected. Report without fear of retaliation.
            </p>
          </div>

          <div className={`p-6 bg-slate-50 border rounded-2xl ${cardHover}`}>
            <Eye className="text-blue-600" size={32} />
            <h3 className="mt-3 font-semibold text-lg">Total Transparency</h3>
            <p className="text-slate-500 text-sm">
              Track your report’s status – from “pending” to “resolved” – in real time.
            </p>
          </div>

          <div className={`p-6 bg-slate-50 border rounded-2xl ${cardHover}`}>
            <Users className="text-blue-600" size={32} />
            <h3 className="mt-3 font-semibold text-lg">Community Powered</h3>
            <p className="text-slate-500 text-sm">
              Thousands of Kenyans already speak up. Your voice adds weight.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION – Patriotic */}
      <section
        className="relative px-12 py-28 text-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />

        <div className="relative z-20 max-w-3xl mx-auto">
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-6xl">🇰🇪</span>
          </div>
          <h2 className={`text-5xl ${fancyFont} text-white`}>
            <span className="block">Silence Enables Corruption.</span>
            <span className="block text-blue-300 mt-2">Speak for Kenya.</span>
          </h2>

          <p className="mt-6 mb-10 text-lg font-semibold leading-relaxed text-slate-200">
            Every report is a brick in the wall of justice. Don't wait – be the
            whistleblower your country needs.
          </p>

          <button
            onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
            className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl transition transform hover:scale-105"
          >
            {isLoggedIn ? "Go to Dashboard" : "File Your Report Now"}
          </button>
          <p className="text-xs text-slate-300 mt-4">
            ✨ Your identity stays protected. No personal data is shared.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white px-12 py-16">
        <div className="grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                iR
              </div>
              <span className="text-lg font-semibold">iReporter</span>
            </div>
            <p className="text-slate-400">
              Empowering Kenyan citizens to expose corruption and demand
              accountability.
            </p>
          </div>

          <div>
            <p className="text-blue-400 font-bold mb-2">Platform</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition">How It Works</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">Submit Report</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">View Reports</p>
          </div>

          <div>
            <p className="text-blue-400 font-bold mb-2">Resources</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition">Legal Support</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">Safety Guide</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">FAQs</p>
          </div>

          <div>
            <p className="text-blue-400 font-bold mb-2">Connect</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition">Twitter</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">Instagram</p>
            <p className="text-slate-400 hover:text-white cursor-pointer transition mt-1">Facebook</p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
          <p>© 2026 iReporter – A citizen‑led initiative for a corruption‑free Kenya.</p>
          <p className="mt-2 flex justify-center gap-2 items-center">
            <span>🇰🇪</span> <span>Integrity • Transparency • Justice</span> <span>🇰🇪</span>
          </p>
        </div>
      </footer>
    </div>
  );
}