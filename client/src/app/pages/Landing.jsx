import { useNavigate } from "react-router-dom";
import { Shield, Eye, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTitle(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const fancyFont = "font-serif font-extrabold tracking-wide";
  const cardHover =
    "transition duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1";

  const heroImage =
    "https://cdn.tuko.co.ke/images/1120/2c4815b51bab6749.jpeg?v=1";

  return (
    <div className="min-h-screen bg-white text-black">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-12 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600"></div>
          <span className="font-semibold text-lg text-blue-600">iR</span>
        </div>

        <nav className="hidden md:flex gap-8 text-gray-500">
          <a href="#about" className="hover:text-blue-600">About</a>
          <a href="#how" className="hover:text-blue-600">How It Works</a>
          <a href="#why" className="hover:text-blue-600">Why iReporter</a>
        </nav>

        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white"
        >
          Submit Report
        </button>
      </header>

      {/* HERO / ABOUT */}
      <section
        id="about"
        className="px-12 py-24 grid md:grid-cols-2 gap-12 items-center"
      >

        <div>
          <p className="text-gray-500 mb-3">Empowering Citizens</p>

          <h1 className="text-5xl leading-tight">

            <span
              className={`text-blue-600 ${fancyFont} italic transition-all duration-700 ease-out
              ${showTitle ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              Expose Corruption.
            </span>

            <br />

            <span className={`text-black ${fancyFont}`}>
              Demand Justice.
            </span>

          </h1>

          <p className="mt-5 text-gray-500 max-w-md">
            iReporter is a secure platform where citizens report corruption, fraud,
            and wrongdoing to hold those in power accountable.
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white"
            >
              File a Report
            </button>

            
          </div>
        </div>

        {/* RIGHT DIAGONAL IMAGE */}
        <div className="relative h-105">

          <div className="absolute -bottom-5 -right-5 w-full h-full bg-blue-50 border border-gray-200 rounded-2xl" />

          <div className="absolute inset-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">

            <img
              src={heroImage}
              alt="Nairobi news scene"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-blue-900/50" />
          </div>

          <div className="absolute -top-3 -left-3 w-full h-full bg-white border border-gray-200 rounded-2xl opacity-30" />

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-12 py-20 bg-white">

        <h2 className={`text-4xl text-black text-center ${fancyFont} mb-12`}>
          How iReporter Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <h3 className="text-blue-600 font-semibold mb-3">Submit Report</h3>
            <p className="text-gray-600">
              File detailed reports with evidence, documents, and witnesses.
            </p>
          </div>

          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <h3 className="text-blue-600 font-semibold mb-3">Investigation</h3>
            <p className="text-gray-600">
              Journalists and investigators verify and build cases.
            </p>
          </div>

          <div className={`p-8 rounded-2xl border bg-white ${cardHover}`}>
            <h3 className="text-blue-600 font-semibold mb-3">Justice</h3>
            <p className="text-gray-600">
              Cases are escalated until justice is achieved.
            </p>
          </div>

        </div>
      </section>

      {/* WHY */}
      <section id="why" className="px-12 py-16 bg-gray-50">

        <h2 className={`text-4xl text-black text-center ${fancyFont} mb-10`}>
          Why iReporter 
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div className={`p-6 bg-white border rounded-2xl ${cardHover}`}>
            <Shield className="text-blue-600" />
            <h3 className="mt-3 font-semibold">Security</h3>
            <p className="text-gray-500 text-sm">Your identity is protected.</p>
          </div>

          <div className={`p-6 bg-white border rounded-2xl ${cardHover}`}>
            <Eye className="text-blue-600" />
            <h3 className="mt-3 font-semibold">Transparency</h3>
            <p className="text-gray-500 text-sm">Reports are tracked openly.</p>
          </div>

          <div className={`p-6 bg-white border rounded-2xl ${cardHover}`}>
            <Users className="text-blue-600" />
            <h3 className="mt-3 font-semibold">Community</h3>
            <p className="text-gray-500 text-sm">Powered by citizens.</p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section
        className="relative px-12 py-28 text-center text-white overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >

        <div className="absolute inset-0 bg-blue-900/80" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-20 max-w-3xl mx-auto">

          <h2 className={`text-5xl ${fancyFont}`}>
            <span className="text-white">Silence Enables</span>{" "}
            <span className="text-white">Corruption.</span>
          </h2>

          <p className="mt-6 mb-10 text-lg font-semibold leading-relaxed">
            <span className="text-white font-bold text-xl block mb-2">
              Speak Up Today.
            </span>

            <span className="text-blue-200">Report injustice.</span>{" "}
            <span className="text-white">
              Demand accountability. Your voice can change the system.
            </span>
          </p>

          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 rounded-xl bg-white text-blue-700 font-semibold"
          >
            File Your Report Now
          </button>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-blue-950 text-white px-12 py-16">
        <div className="grid md:grid-cols-4 gap-10 text-sm">

          <div>
            <h3 className="text-lg font-semibold">iR</h3>
            <p className="text-blue-200 mt-2">
              Empowering citizens to fight corruption.
            </p>
          </div>

          <div>
            <p className="text-blue-200">Platform</p>
            <p className="text-blue-200">How It Works</p>
            <p className="text-blue-200">Submit Report</p>
          </div>

          <div>
            <p className="text-blue-200">Resources</p>
            <p className="text-blue-200">Legal Support</p>
            <p className="text-blue-200">Safety Guide</p>
          </div>

          <div>
            <p className="text-blue-200">Connect</p>
            <p className="text-blue-200">Twitter</p>
            <p className="text-blue-200">Instagram</p>
          </div>

        </div>

        <p className="text-center text-blue-200 mt-10 text-sm">
          © 2026 iReporter
        </p>
      </footer>

    </div>
  );
}