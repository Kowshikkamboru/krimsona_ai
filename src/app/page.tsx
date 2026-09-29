"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const tabContentData: Record<string, any> = {
  managers: {
    title: "Your personal secretary for standups.",
    text: "Get a clear picture of your day before your team meeting. Krimsona aggregates all your voice notes into a concise daily report.",
    list: [
      "Automated Daily Summaries",
      "Team Velocity Tracking",
      "Export to PDF for stakeholders",
    ],
    img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Deep Work Mode",
  },
  fitness: {
    title: "The gym partner that counts for you.",
    text: "Don't fumble with your phone between sets. 'Logged 3 sets of bench press at 80kg.' Krimsona tracks your volume, rest times, and PRs while you catch your breath.",
    list: [
      "Hands-free workout logging",
      "Rest timer auto-start",
      "Nutrition & macro dictation",
    ],
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Workout Complete",
  },
  journal: {
    title: "A searchable history of your life.",
    text: "Capture memories, daily wins, or just vent. With Premium, travel back to any 'beautiful day' and see exactly what you accomplished and how you felt.",
    list: [
      "Mood & thought tracking",
      "Memory Lane (History Recall)",
      "Voice-to-text diary entries",
    ],
    img: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Memory Saved",
  },
  professionals_v5: {
    title: "For Developers & Managers",
    text: "Stay in flow state. 'Log bug in auth module' or 'Note for standup: deployed API fix'. Krimsona timestamps it and prepares it for Jira.",
    list: ["Voice-to-Ticket generation", "Automated Standup Summaries", "Track billable hours effortlessly"],
    img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Meeting Notes Saved"
  },
  entrepreneurs_v5: {
    title: "For Freelancers & Founders",
    text: "Wearing multiple hats? Keep track of client work, marketing ideas, and admin tasks without typing a single word.",
    list: ["Client billing tracking", "Idea capture on the go", "Task switching made instant"],
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Idea Logged"
  },
  students_v5: {
    title: "For Students",
    text: "Crush assignments without the clutter. Tell Krimsona what chapter you're studying or dictate essay outlines while walking to class.",
    list: ["Track study duration", "Dictate essay outlines", "Export study logs"],
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Study Session Logged"
  },
  lifestyle_v5: {
    title: "For Personal Growth",
    text: "From gym sets to gratitude journaling. Use your voice to track workouts, mental health, and daily wins effortlessly.",
    list: ["Hands-free workout logging", "Mood & thought tracking", "Memory Lane history recall"],
    img: "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    badge: "Workout/Memory Saved"
  }
};

const headings = [
  "Built for those who value flow state.",
  "From coding marathons to marathon training.",
  "Designed for your lifestyle."
];

const heroHeadings = [
  <>Don't manage tasks.<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">Just say them.</span></>,
  <>Cognitive Offloading<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">via Voice Intelligence.</span></>
];

export default function LandingPage() {
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pricingCategory, setPricingCategory] = useState<"individual" | "business">("individual");
  const [isYearlyPricing, setIsYearlyPricing] = useState(false);
  const [activeTab, setActiveTab] = useState("professionals_v5");
  
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0);
  const [currentHeroHeadingIndex, setCurrentHeroHeadingIndex] = useState(0);

  const [fadeHeading, setFadeHeading] = useState(true);
  const [fadeHeroHeading, setFadeHeroHeading] = useState(true);

  useEffect(() => {
    const headingInterval = setInterval(() => {
      setFadeHeading(false);
      setTimeout(() => {
        setCurrentHeadingIndex((prev) => (prev + 1) % headings.length);
        setFadeHeading(true);
      }, 500);
    }, 4000);

    const heroHeadingInterval = setInterval(() => {
      setFadeHeroHeading(false);
      setTimeout(() => {
        setCurrentHeroHeadingIndex((prev) => (prev + 1) % heroHeadings.length);
        setFadeHeroHeading(true);
      }, 500);
    }, 4500);

    return () => {
      clearInterval(headingInterval);
      clearInterval(heroHeadingInterval);
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-active");
    } else {
      document.body.classList.remove("modal-active");
    }
    
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isModalOpen]);

  const activeTabData = tabContentData[activeTab];

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <div className="antialiased bg-white text-slate-800">
      {/* NAVIGATION */}
      <nav className="fixed w-full z-50 glass-nav border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <i className="fas fa-wave-square"></i>
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-slate-900">Krimsona</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex space-x-8 items-center">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">How it Works</a>
              <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">Use Cases</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition">Pricing</a>
              <button onClick={toggleModal} className="bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">
                Get Started Free
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-brand-600 focus:outline-none">
                <i className="fas fa-bars text-2xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 absolute w-full shadow-xl">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600">How it Works</a>
              <a href="#use-cases" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600">Use Cases</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-600">Pricing</a>
              <button onClick={() => { setIsMobileMenuOpen(false); toggleModal(); }} className="block w-full text-center mt-4 bg-brand-600 text-white px-5 py-3 rounded-lg font-bold">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* LOGIN MODAL */}
      <div className={`modal fixed w-full h-full top-0 left-0 flex items-center justify-center z-50 transition-all duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="modal-overlay absolute w-full h-full bg-slate-900 opacity-50" onClick={toggleModal}></div>

        <div className={`modal-container bg-white w-11/12 md:max-w-md mx-auto rounded-2xl shadow-2xl z-50 overflow-y-auto transform transition-all duration-300 ${isModalOpen ? 'scale-100' : 'scale-95'}`}>
          <div className="modal-content py-4 text-left px-6">
            <div className="flex justify-between items-center pb-3">
              <p className="text-2xl font-display font-bold text-slate-900">Welcome Back</p>
              <div className="cursor-pointer z-50" onClick={toggleModal}>
                <i className="fas fa-times text-slate-500 hover:text-brand-600"></i>
              </div>
            </div>

            <div className="my-5">
              <p className="text-slate-500 mb-6">Enter your details to access your Krimsona workspace.</p>

              <form onSubmit={(e) => { e.preventDefault(); toggleModal(); router.push('/dashboard'); }}>
                <div className="mb-4">
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                  <input className="shadow appearance-none border rounded w-full py-3 px-3 text-slate-700 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-500" id="email" type="email" placeholder="you@company.com" required />
                </div>
                <div className="mb-6">
                  <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                  <input className="shadow appearance-none border rounded w-full py-3 px-3 text-slate-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-500" id="password" type="password" placeholder="******************" required />
                </div>

                <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline transition duration-200">
                  Continue
                </button>
                <button type="button" onClick={() => { toggleModal(); router.push('/dashboard'); }} className="mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg w-full focus:outline-none focus:shadow-outline transition duration-200">
                  Continue as Guest
                </button>
              </form>

              <div className="mt-4 text-center">
                <span className="text-xs text-slate-400">Or continue with</span>
                <div className="flex justify-center gap-4 mt-3">
                  <button className="p-2 bg-slate-100 rounded-full w-10 h-10 hover:bg-slate-200"><i className="fab fa-google"></i></button>
                  <button className="p-2 bg-slate-100 rounded-full w-10 h-10 hover:bg-slate-200"><i className="fab fa-github"></i></button>
                  <button className="p-2 bg-slate-100 rounded-full w-10 h-10 hover:bg-slate-200"><i className="fab fa-microsoft"></i></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 hero-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wide mb-6 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
              v2.0 Now Available with Excel Export
            </div>
            <h1 className={`text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.1] mb-6 transition-opacity duration-500 ${fadeHeroHeading ? 'opacity-100' : 'opacity-0'}`}>
              {heroHeadings[currentHeroHeadingIndex]}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-4xl mx-auto leading-relaxed">
              Krimsona is an AI-native workspace that listens, understands, and acts.
              It captures your voice, parses intent, organizes tasks, preserves context, and automatically
              logs your work eliminating repetitive manual data entry. Built on a local-first architecture,
              Krimsona keeps your data close while intelligently orchestrating your entire workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button onClick={toggleModal} className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Try Krimsona Free
              </button>
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2">
                <i className="fas fa-play-circle text-brand-600"></i> Watch Demo
              </button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 bg-white px-3 py-1 rounded text-xs text-slate-400 border border-slate-200 flex-1 max-w-xs flex items-center gap-2">
                  <i className="fas fa-lock text-[10px] text-green-500"></i> app.krimsona.ai
                </div>
              </div>
              <div className="p-0 grid grid-cols-12 h-[500px]">
                {/* Sidebar */}
                <div className="col-span-1 md:col-span-2 bg-slate-900 text-slate-300 p-4 hidden md:block border-r border-slate-800">
                  <div className="space-y-6">
                    <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white"><i className="fas fa-wave-square"></i></div>
                    <div className="space-y-4 text-xs font-mono tracking-wide">
                      <div className="text-white font-bold"><i className="fas fa-layer-group mr-2"></i> DASHBOARD</div>
                      <div className="hover:text-white"><i className="fas fa-stream mr-2"></i> TIMELINE</div>
                      <div className="hover:text-white"><i className="fas fa-brain mr-2"></i> MEMORY LANE</div>
                      <div className="hover:text-white"><i className="fas fa-code-branch mr-2"></i> EXPORTS</div>
                    </div>
                  </div>
                </div>
                {/* Main Area */}
                <div className="col-span-12 md:col-span-7 bg-slate-50 p-8 border-r border-slate-200">
                  <div className="mb-6 flex justify-between items-end">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Good afternoon.</h3>
                      <p className="text-slate-500 text-sm">System Status: <span className="text-green-600 font-mono">ONLINE</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-mono font-bold text-brand-600">02:14:00</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Deep Work Duration</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-500 mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded text-[10px] font-bold tracking-wider uppercase">Active Context</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono">ID: #8821</span>
                        <i className="fas fa-microphone text-brand-600 animate-pulse"></i>
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">Frontend Architecture Refactor</h4>
                    <p className="text-sm text-slate-500 mt-2 italic font-mono bg-slate-50 p-2 rounded border border-slate-100">
                      "Command received: Initialize refactor of component library. Log start time."</p>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between opacity-60 items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="font-medium text-sm">Auth API Debugging</span>
                      </div>
                      <span className="text-slate-400 text-xs font-mono">42m 12s</span>
                    </div>
                  </div>
                </div>
                {/* Right Panel */}
                <div className="col-span-3 bg-white p-6 hidden lg:block">
                  <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-widest mb-4">Export Protocol</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded hover:bg-slate-50 cursor-pointer flex items-center gap-3 group transition-all">
                      <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-file-excel"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold">EXCEL</div>
                        <div className="text-[10px] text-slate-400">Structured Data</div>
                      </div>
                    </div>
                    <div className="p-3 border rounded hover:bg-slate-50 cursor-pointer flex items-center gap-3 group transition-all">
                      <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      <div>
                        <div className="text-sm font-bold">PDF</div>
                        <div className="text-[10px] text-slate-400">Executive Summary</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by High-Performance Teams</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              <i className="fab fa-aws text-4xl hover:text-[#FF9900]"></i>
              <i className="fab fa-google text-4xl hover:text-[#4285F4]"></i>
              <i className="fab fa-spotify text-4xl hover:text-[#1DB954]"></i>
              <i className="fab fa-stripe text-4xl hover:text-[#008CDD]"></i>
              <i className="fab fa-airbnb text-4xl hover:text-[#FF5A5F]"></i>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP DIVE FEATURES */}
      <section id="features" className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-900 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-brand-500 font-mono text-sm font-bold uppercase tracking-widest mb-3">Under the Hood</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">The Krimsona Engine.</h3>
            <p className="text-lg text-slate-400 leading-relaxed">
              We didn't just build a to-do list. We engineered a cognitive architecture designed to handle high-velocity inputs with zero friction.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-brand-500 text-xl mb-6 shadow-lg shadow-brand-900/20">
                <i className="fas fa-brain"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">Context-Aware NLU</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our Natural Language Understanding engine doesn't just transcribe; it parses intent. It distinguishes between a "Note to self", a "Bug Report", and a "Critical Task", routing data to logical buckets automatically.
              </p>
            </div>
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500 text-xl mb-6 shadow-lg shadow-indigo-900/20">
                <i className="fas fa-database"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">Local-First Architecture</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Latency kills flow. Krimsona operates on a "Local-First" principle. All CRUD operations happen instantly on-device using IndexedDB, syncing to the cloud only when necessary. Zero loading spinners.
              </p>
            </div>
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-500 text-xl mb-6 shadow-lg shadow-emerald-900/20">
                <i className="fas fa-history"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">Temporal Recall</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Human memory is fallible; Krimsona is not. The "Memory Lane" feature creates an immutable ledger of every session. Query past states—"What did I deploy last Tuesday?"—to reconstruct context instantly.
              </p>
            </div>
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-500 text-xl mb-6 shadow-lg shadow-amber-900/20">
                <i className="fas fa-file-export"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">Multi-Modal Export</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your data is portable by design. Generate executive-level PDF summaries for stakeholders or raw JSON/CSV dumps for your data warehouse. We ensure full data sovereignty.
              </p>
            </div>
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-500 text-xl mb-6 shadow-lg shadow-cyan-900/20">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">Enterprise-Grade Security</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Built on AES-256 encryption standards. Whether you are a solo founder or a Fortune 500 entity, your intellectual property remains encrypted at rest and in transit.
              </p>
            </div>
            <div className="tech-card p-8 rounded-2xl border border-slate-800 transition-all duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xl mb-6 shadow-lg">
                <i className="fas fa-bolt"></i>
              </div>
              <h4 className="text-xl font-bold mb-3 font-display">REST API Access</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Don't let data rot in a silo. Use our robust API to pipe Krimsona logs directly into Jira tickets, Slack channels, or custom dashboards. Programmable productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
              Your voice is the command line.
            </h2>
            <p className="text-lg text-slate-600">
              Forget clicking through endless menus. Krimsona runs in the
              background and responds to natural language.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 feature-card transition-all duration-300">
              <div className="icon-bg w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300">
                <i className="fas fa-microphone-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">1. Wake & Speak</h3>
              <p className="text-slate-600 leading-relaxed">
                Just say <strong>"Hey Krimsona"</strong>. The AI wakes up instantly. Tell it what you're working on, log a bug, or dictate a quick note.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 feature-card transition-all duration-300">
              <div className="icon-bg w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">2. Auto-Organization</h3>
              <p className="text-slate-600 leading-relaxed">
                Krimsona parses your voice, creates a ticket, starts the timer, and categorizes the task. No manual typing required.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 feature-card transition-all duration-300">
              <div className="icon-bg w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-6 transition-transform duration-300">
                <i className="fas fa-file-export"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">3. Analyze & Export</h3>
              <p className="text-slate-600 leading-relaxed">
                End of the day? Ask Krimsona to "Close my day." It generates an Excel or PDF report ready to email to your manager.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
            <div className="lg:w-1/2 min-w-0">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">
                Krimsona adapts to the way you work, learn, and live.
              </h2>
              <div className="min-h-[40px] md:min-h-[48px] mb-6 flex items-center">
                <h3 className={`text-xl md:text-2xl font-display font-bold text-brand-600 transition-opacity duration-500 ${fadeHeading ? 'opacity-100' : 'opacity-0'}`}>
                  {headings[currentHeadingIndex]}
                </h3>
              </div>
              <p className="text-slate-600 mb-6 text-lg">
                Whether you're pushing code, pushing weights, studying for finals, or pushing your boundaries, just speak naturally. Krimsona understands your intent, adapts to your workflow, and automatically organizes your tasks, logs, and context in the background.
              </p>
              <p className="text-slate-600 mb-6 text-lg font-medium">
                No app switching. No manual data entry. No breaking your flow.
              </p>
              <p className="text-slate-600 mb-8 text-lg">
                Just say it. <span className="font-bold text-slate-900">Krimsona gets it logged.</span>
              </p>

              <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg mb-8 overflow-x-auto no-scrollbar w-full max-w-full">
                {[
                  { id: "professionals_v5", label: "Corporate" },
                  { id: "entrepreneurs_v5", label: "Entrepreneurs" },
                  { id: "students_v5", label: "Students" },
                  { id: "lifestyle_v5", label: "Lifestyle" },
                  { id: "managers", label: "Managers" },
                  { id: "fitness", label: "Fitness" },
                  { id: "journal", label: "Journaling" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-btn px-4 py-2 rounded-md text-sm font-bold whitespace-nowrap transition ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="animate-fade-in" key={activeTab}>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">{activeTabData.title}</h3>
                <p className="text-slate-600 mb-6">{activeTabData.text}</p>
                <ul className="check-list space-y-3 text-slate-700">
                  {activeTabData.list.map((item: string, i: number) => <li key={i}>{item}</li>)}
                </ul>
              </div>

              <a href="#pricing" className="inline-flex items-center gap-2 text-brand-600 font-bold mt-8 hover:gap-3 transition-all">
                See how it fits your workflow <i className="fas fa-arrow-right"></i>
              </a>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-brand-100 rounded-full blur-3xl opacity-50"></div>
              <img
                src={activeTabData.img}
                alt="Workflow"
                className="relative rounded-2xl shadow-2xl border border-white transform rotate-1 hover:rotate-0 transition duration-500 object-cover h-[400px] w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-pulse-slow">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Logged</div>
                  <div className="font-bold text-slate-800">{activeTabData.badge}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-900 opacity-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Plans for every stage.</h2>
            <p className="text-lg text-slate-400">Scale your productivity from personal use to enterprise orchestration.</p>

            <div className="mt-8 mb-6 flex justify-center">
              <div className="bg-slate-800 p-1 rounded-xl inline-flex relative border border-slate-700">
                <button
                  onClick={() => setPricingCategory("individual")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${pricingCategory === 'individual' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Individual
                </button>
                <button
                  onClick={() => setPricingCategory("business")}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${pricingCategory === 'business' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Business
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 select-none">
              <span className="text-sm font-medium text-slate-300">Monthly</span>
              <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  id="price-toggle"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-700 transition-all duration-300"
                  checked={isYearlyPricing}
                  onChange={(e) => setIsYearlyPricing(e.target.checked)}
                />
                <label htmlFor="price-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-700 cursor-pointer border border-slate-600"></label>
              </div>
              <span className="text-sm font-medium text-white">Yearly <span className="text-brand-400 text-xs font-bold">(Save 20%)</span></span>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            {pricingCategory === "individual" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-fade-in">
                {/* Plan 1 */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 hover:bg-slate-800 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Starter</h3>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Individual</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">Essential tools for students and hobbyists.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold">$0</span>
                    <span className="text-slate-400 text-sm">/mo</span>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center font-bold transition">Get Started</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> 1 User</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Basic Voice Commands</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Local Storage (Secure)</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Excel Export</li>
                  </ul>
                </div>

                {/* Plan 2 */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 hover:bg-slate-800 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Creator/Professional</h3>
                    <span className="bg-brand-900 text-brand-300 text-xs px-2 py-1 rounded">Popular</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">For power users and freelancers.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold">${isYearlyPricing ? "9" : "12"}</span>
                    <span className="text-slate-400 text-sm">/mo</span>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 rounded-lg text-center font-bold transition">Start Free Trial</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Everything in Starter</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> PDF & CSV Exports</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Priority Voice Parsing</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Cloud Sync</li>
                  </ul>
                </div>

                {/* Plan 3 */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 hover:bg-slate-800 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Power User</h3>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Individual</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">Advanced analytics and integrations for pros.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold">${isYearlyPricing ? "24" : "29"}</span>
                    <span className="text-slate-400 text-sm">/mo</span>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center font-bold transition">Subscribe</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> API Access (Personal)</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Multi-device Sync</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Memory Lane Feature</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 animate-fade-in">
                {/* Plan 4 */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 hover:bg-slate-800 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Team</h3>
                    <span className="bg-indigo-900 text-indigo-300 text-xs px-2 py-1 rounded">Collaborative</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">For agile teams and agencies.</p>
                  <div className="mb-6">
                    <span className="text-4xl font-display font-bold">${isYearlyPricing ? "39" : "49"}</span>
                    <span className="text-slate-400 text-sm">/mo</span>
                    <div className="text-xs text-slate-500 mt-1">Includes 5 seats</div>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center font-bold transition">Create Team</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Team Dashboards</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Shared Projects</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Admin Roles</li>
                  </ul>
                </div>

                {/* Plan 5 */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 hover:bg-slate-800 transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Enterprise</h3>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Organization</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">Security, compliance, and scale for large orgs.</p>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold">Contact</span>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 bg-white text-slate-900 hover:bg-slate-200 rounded-lg text-center font-bold transition">Contact Sales</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> SSO (SAML/OIDC)</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Audit Logs</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Dedicated Success Mgr</li>
                  </ul>
                </div>

                {/* Plan 6 */}
                <div className="bg-gradient-to-br from-slate-800 to-brand-900/30 p-8 rounded-2xl border border-slate-700 hover:border-brand-500 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600 blur-[80px] opacity-20"></div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Custom</h3>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">Bespoke</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-6 h-10">Tailored integrations and feature development.</p>
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="text-3xl font-display font-bold">Let's Talk</span>
                  </div>
                  <button onClick={toggleModal} className="block w-full py-3 px-4 border border-brand-500 text-brand-400 hover:bg-brand-900/50 rounded-lg text-center font-bold transition">Get a Quote</button>
                  <ul className="mt-8 space-y-4 text-sm text-slate-300">
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> Custom Feature Requests</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> On-Premise Deployment</li>
                    <li className="flex items-center gap-3"><i className="fas fa-check text-brand-500"></i> White Labeling</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-16 pb-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-brand-600 rounded flex items-center justify-center text-white text-xs">
                  <i className="fas fa-wave-square"></i>
                </div>
                <span className="font-display font-bold text-xl text-slate-900">Krimsona</span>
              </div>
              <p className="text-sm text-slate-500">
                The first voice-native project management tool designed for the modern era.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-600">Features</a></li>
                <li><a href="#" className="hover:text-brand-600">Integrations</a></li>
                <li><a href="#" className="hover:text-brand-600">Pricing</a></li>
                <li><a href="#" className="hover:text-brand-600">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-600">Documentation</a></li>
                <li><a href="#" className="hover:text-brand-600">API</a></li>
                <li><a href="#" className="hover:text-brand-600">Community</a></li>
                <li><a href="#" className="hover:text-brand-600">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-brand-600">About</a></li>
                <li><a href="#" className="hover:text-brand-600">Careers</a></li>
                <li><a href="#" className="hover:text-brand-600">Legal</a></li>
                <li><a href="#" className="hover:text-brand-600">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              &copy; 2025 Krimsona Inc. All rights reserved.
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-brand-600"><i className="fab fa-twitter"></i></a>
              <a href="#" className="hover:text-brand-600"><i className="fab fa-github"></i></a>
              <a href="#" className="hover:text-brand-600"><i className="fab fa-discord"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
