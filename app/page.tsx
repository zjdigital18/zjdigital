"use client";

import { useEffect, useState, useRef } from "react";

const CONTACT_EMAIL = "jzmarketing1808@gmail.com";
const CALENDLY_LINK = "https://calendly.com/jocazilavac11/30min";

function useCountUp(target: number, duration: number = 2000, suffix: string = "") {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  const display = count >= 1000000 ? (count / 1000000).toFixed(1) + "M" :
    count >= 1000 ? (count / 1000).toFixed(0) + "K" : count.toString();

  return { display: display + suffix, ref };
}

function StatCard({ icon, label, target, suffix, color, delay }: { icon: string; label: string; target: number; suffix: string; color: string; delay: number }) {
  const { display, ref } = useCountUp(target, 2200, suffix);
  return (
    <div ref={ref} className="stat-card zj-animate" style={{ animationDelay: `${delay}s` }}>
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-num" style={{ background: color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{display}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}


// ── MAKEOVER CARD COMPONENT ───────────────────────────────────────────────
function MakeoverCard({ before, after, index }: { before:string; after:string; index:number }) {
  const [hovered, setHovered] = useState(false);
  const [sliderX, setSliderX] = useState(50);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
    setSliderX(pct);
  };

  return (
    <div
      ref={cardRef}
      className="makeover-card"
      style={{ transitionDelay: `${(index % 4) * 0.1}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setSliderX(50); }}
      onMouseMove={(e) => hovered && handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* Before */}
      <img src={before} alt="Before" className="makeover-img makeover-before" />
      {/* After - clip to slider */}
      <div className="makeover-after-wrap" style={{ clipPath:`inset(0 0 0 ${sliderX}%)` }}>
        <img src={after} alt="After" className="makeover-img" />
      </div>
      {/* Divider line */}
      <div className="makeover-divider" style={{ left:`${sliderX}%` }}>
        <div className="makeover-handle">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4l-4 6 4 6M13 4l4 6-4 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {/* Labels */}
      <span className="makeover-label makeover-label-before">Before</span>
      <span className="makeover-label makeover-label-after">After</span>
    </div>
  );
}

// ── BRAND AUDIT COMPONENT ──────────────────────────────────────────────────
function BrandAudit() {
  const [platform, setPlatform] = useState<string|null>(null);
  const [handle, setHandle] = useState("");
  const [phase, setPhase] = useState<"idle"|"input"|"loading"|"results">("idle");
  const [loadStep, setLoadStep] = useState(0);
  const [loadPct, setLoadPct] = useState(0);
  const [visibleResults, setVisibleResults] = useState(0);
  const [showCTA, setShowCTA] = useState(false);
  const [score, setScore] = useState(0);
  const [resultFills, setResultFills] = useState([22, 18, 30]);

  const platforms = [
    {
      id: "website", label: "Website",
      logo: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#7c3aed" strokeWidth="2"/>
          <ellipse cx="16" cy="16" rx="6" ry="14" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="2" y1="16" x2="30" y2="16" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="4" y1="9" x2="28" y2="9" stroke="#7c3aed" strokeWidth="1.5"/>
          <line x1="4" y1="23" x2="28" y2="23" stroke="#7c3aed" strokeWidth="1.5"/>
        </svg>
      )
    },
    {
      id: "instagram", label: "Instagram",
      logo: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="28" height="28" rx="8" stroke="url(#igGrad)" strokeWidth="2.2"/>
          <circle cx="16" cy="16" r="6.5" stroke="url(#igGrad)" strokeWidth="2.2"/>
          <circle cx="23.5" cy="8.5" r="1.5" fill="#dc2743"/>
        </svg>
      )
    },
    {
      id: "tiktok", label: "TikTok",
      logo: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M21 2h-4v19a4 4 0 1 1-4-4v-4a8 8 0 1 0 8 8V10a10 10 0 0 0 6 2V8a6 6 0 0 1-6-6z" fill="#010101"/>
          <path d="M21 2h-4v19a4 4 0 1 1-4-4v-4a8 8 0 1 0 8 8V10a10 10 0 0 0 6 2V8a6 6 0 0 1-6-6z" fill="none" stroke="#fe2c55" strokeWidth="1" opacity="0.6"/>
          <path d="M20 1h-4v19a4 4 0 1 1-4-4v-4a8 8 0 1 0 8 8V9a10 10 0 0 0 6 2V7a6 6 0 0 1-6-6z" fill="none" stroke="#25f4ee" strokeWidth="1" opacity="0.6"/>
        </svg>
      )
    },
    {
      id: "facebook", label: "Facebook",
      logo: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="1" y="1" width="30" height="30" rx="8" fill="#1877f2"/>
          <path d="M22 16h-4v12h-4V16h-3v-4h3v-2.5C14 7.36 15.36 6 17.5 6H22v4h-3c-.55 0-1 .45-1 1V12h4l-.5 4z" fill="white"/>
        </svg>
      )
    },
  ];

  const placeholders: Record<string,string> = {
    website:   "Paste your website URL (e.g. yourbrand.com)",
    instagram: "Paste your Instagram link or @handle",
    tiktok:    "Paste your TikTok link or @handle",
    facebook:  "Paste your Facebook page link",
  };

  const loadingSteps = [
    { icon: "🔍", text: "Scanning profile...",                   detail: "Fetching public data and metadata" },
    { icon: "🖼️", text: "Analysing content quality...",          detail: "Reviewing visual consistency and production value" },
    { icon: "📊", text: "Reviewing engagement structure...",     detail: "Comparing interaction rates against industry benchmarks" },
    { icon: "🧠", text: "Evaluating conversion potential...",    detail: "Identifying gaps in your sales funnel visuals" },
    { icon: "⚡", text: "Generating your brand audit report...", detail: "Compiling findings and scoring your brand" },
  ];

  const auditResults = [
    { icon: "📉", label: "Low Engagement Detected",            detail: "Your content is generating below-average interaction for your niche. Visual quality is the #1 driver of engagement.",            color: "#ef4444" },
    { icon: "🎨", label: "Lacks Premium Visual Identity",      detail: "Your brand visuals don't communicate the value of what you offer. First impressions are costing you conversions.",               color: "#f59e0b" },
    { icon: "💸", label: "Conversion Potential Not Optimised", detail: "Browsers aren't becoming buyers. AI-enhanced visuals could increase your conversion rate significantly.",                        color: "#8b5cf6" },
  ];

  const selectPlatform = (id: string) => {
    setPlatform(id);
    setHandle("");
    setPhase("input");
  };

  const runAudit = () => {
    if (!handle.trim()) return;
    // Randomise score 45–62
    const newScore = Math.floor(Math.random() * 18) + 45;
    setScore(newScore);
    // Randomise fill bars a bit
    setResultFills([
      Math.floor(Math.random() * 20) + 12,
      Math.floor(Math.random() * 20) + 10,
      Math.floor(Math.random() * 25) + 18,
    ]);
    setPhase("loading");
    setLoadStep(0);
    setLoadPct(0);
    setVisibleResults(0);
    setShowCTA(false);

    // Step through loading states over 10 seconds
    // Steps at: 0s, 2s, 4s, 6s, 8s — results at 10s
    const stepTimes = [0, 2000, 4000, 6500, 8500];
    stepTimes.forEach((t, i) => setTimeout(() => setLoadStep(i), t));

    // Smooth progress bar: tick every 200ms for 10 seconds
    let pct = 0;
    const ticker = setInterval(() => {
      pct += Math.random() * 1.8 + 0.8;
      if (pct >= 99) { pct = 99; clearInterval(ticker); }
      setLoadPct(Math.min(Math.round(pct), 99));
    }, 200);

    // Show results after 10s
    setTimeout(() => {
      clearInterval(ticker);
      setLoadPct(100);
      setTimeout(() => {
        setPhase("results");
        [0,1,2].forEach((i) => setTimeout(() => setVisibleResults(i + 1), i * 700 + 300));
        setTimeout(() => setShowCTA(true), 3 * 700 + 800);
      }, 400);
    }, 10000);
  };

  const reset = () => {
    setPlatform(null);
    setHandle("");
    setPhase("idle");
    setLoadStep(0);
    setLoadPct(0);
    setVisibleResults(0);
    setShowCTA(false);
  };

  const scoreColor = score >= 60 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreTag   = score >= 60 ? "✓ Average"  : score >= 50 ? "⚠ Needs Work" : "⚠ Critical";

  const auditCSS = `
    .audit-wrap { background:white; border-radius:28px; padding:56px 48px; box-shadow:0 20px 60px rgba(124,58,237,0.08),0 4px 20px rgba(0,0,0,0.04); border:1px solid rgba(124,58,237,0.1); position:relative; overflow:hidden; margin-top:64px; }
    .audit-wrap::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#7c3aed,#0891b2,#7c3aed); background-size:200%; animation:gradShift 3s linear infinite; }
    @keyframes gradShift { 0%{background-position:0%}100%{background-position:200%} }
    .audit-header { text-align:center; margin-bottom:36px; }
    .audit-chip { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(8,145,178,0.08)); color:#7c3aed; padding:7px 18px; border-radius:100px; font-size:11px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px; border:1px solid rgba(124,58,237,0.15); }
    .audit-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(32px,4vw,52px); color:#1a1520; letter-spacing:0.04em; line-height:1; }
    .audit-title span { background:linear-gradient(135deg,#7c3aed,#0891b2); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .audit-sub { font-size:15px; color:#4a4458; margin-top:10px; font-weight:500; line-height:1.6; }
    .audit-step-label { text-align:center; font-size:12px; font-weight:800; color:#9ca3af; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:20px; }
    .audit-step-label span { color:#7c3aed; }
    /* Platform cards */
    .audit-platforms { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; margin-bottom:8px; }
    .audit-platform-btn { display:flex; flex-direction:column; align-items:center; gap:10px; padding:22px 28px; border:2px solid rgba(124,58,237,0.12); border-radius:20px; background:white; cursor:pointer; transition:all 0.3s; min-width:110px; box-shadow:0 2px 12px rgba(0,0,0,0.04); }
    .audit-platform-btn:hover { border-color:#7c3aed; background:rgba(124,58,237,0.03); transform:translateY(-4px); box-shadow:0 10px 28px rgba(124,58,237,0.12); }
    .audit-platform-btn.selected { border-color:#7c3aed; background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(8,145,178,0.04)); box-shadow:0 8px 24px rgba(124,58,237,0.16); transform:translateY(-4px); }
    .audit-platform-label { font-size:13px; font-weight:800; color:#1a1520; }
    /* Input step */
    .audit-input-step { animation:fadeSlideInUp 0.45s cubic-bezier(0.16,1,0.3,1) both; margin-top:28px; }
    @keyframes fadeSlideInUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
    .audit-selected-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(124,58,237,0.07); color:#7c3aed; padding:6px 14px; border-radius:100px; font-size:12px; font-weight:800; margin-bottom:18px; cursor:pointer; transition:background 0.2s; border:1px solid rgba(124,58,237,0.15); }
    .audit-selected-badge:hover { background:rgba(124,58,237,0.14); }
    .audit-input-row { display:flex; gap:12px; max-width:580px; margin:0 auto; }
    .audit-input { flex:1; padding:16px 22px; border:1.5px solid rgba(124,58,237,0.2); border-radius:100px; font-size:15px; font-family:'Satoshi',sans-serif; font-weight:500; color:#1a1520; outline:none; background:white; transition:all 0.3s; box-shadow:0 2px 12px rgba(124,58,237,0.06); }
    .audit-input:focus { border-color:#7c3aed; box-shadow:0 0 0 4px rgba(124,58,237,0.08); }
    .audit-input::placeholder { color:#bbb; }
    .audit-btn { background:linear-gradient(135deg,#7c3aed,#0891b2); color:white; padding:16px 28px; border-radius:100px; font-size:14px; font-weight:800; border:none; cursor:pointer; font-family:'Satoshi',sans-serif; white-space:nowrap; box-shadow:0 6px 20px rgba(124,58,237,0.35); transition:all 0.3s; }
    .audit-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(124,58,237,0.45); }
    .audit-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
    /* Loading */
    .audit-loading { animation:fadeSlideInUp 0.4s both; max-width:560px; margin:0 auto; }
    .audit-load-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
    .audit-load-title { font-size:13px; font-weight:800; color:#7c3aed; letter-spacing:0.06em; }
    .audit-load-pct { font-family:'Bebas Neue',sans-serif; font-size:22px; color:#7c3aed; letter-spacing:0.06em; }
    .audit-load-bar { height:6px; background:rgba(124,58,237,0.1); border-radius:100px; overflow:hidden; margin-bottom:28px; }
    .audit-load-fill { height:100%; background:linear-gradient(90deg,#7c3aed,#0891b2); border-radius:100px; transition:width 0.3s ease; }
    .audit-steps-list { display:flex; flex-direction:column; gap:12px; }
    .audit-load-step { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:14px; background:#faf9ff; border:1px solid rgba(124,58,237,0.08); transition:all 0.4s; opacity:0.35; }
    .audit-load-step.active { opacity:1; background:linear-gradient(135deg,rgba(124,58,237,0.06),rgba(8,145,178,0.04)); border-color:rgba(124,58,237,0.2); box-shadow:0 4px 16px rgba(124,58,237,0.08); }
    .audit-load-step.done { opacity:0.6; }
    .audit-load-step-icon { font-size:20px; flex-shrink:0; }
    .audit-load-step-body { flex:1; }
    .audit-load-step-text { font-size:14px; font-weight:800; color:#1a1520; }
    .audit-load-step-detail { font-size:12px; color:#9ca3af; margin-top:2px; font-weight:500; }
    .audit-load-step-status { font-size:11px; font-weight:800; letter-spacing:0.06em; padding:3px 10px; border-radius:100px; }
    .audit-load-step.active .audit-load-step-status { background:rgba(124,58,237,0.1); color:#7c3aed; }
    .audit-load-step.done .audit-load-step-status { background:rgba(34,197,94,0.1); color:#22c55e; }
    .audit-load-step-spinner { width:16px; height:16px; border:2px solid rgba(124,58,237,0.2); border-top-color:#7c3aed; border-radius:50%; animation:spin 0.8s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    /* Results */
    .audit-results-wrap { animation:fadeSlideInUp 0.4s both; }
    .audit-score-row { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:linear-gradient(135deg,rgba(124,58,237,0.04),rgba(8,145,178,0.04)); border-radius:16px; border:1px solid rgba(124,58,237,0.1); margin-bottom:20px; }
    .audit-score-label { font-size:12px; font-weight:800; color:#4a4458; letter-spacing:0.08em; text-transform:uppercase; }
    .audit-score-val { font-family:'Bebas Neue',sans-serif; font-size:40px; letter-spacing:0.04em; }
    .audit-score-tag { font-size:12px; font-weight:800; padding:4px 12px; border-radius:100px; }
    .audit-results { display:flex; flex-direction:column; gap:14px; margin-bottom:28px; }
    .audit-result-card { display:flex; align-items:flex-start; gap:18px; padding:20px 24px; border-radius:16px; border:1.5px solid rgba(0,0,0,0.06); background:#faf9ff; opacity:0; transform:translateY(16px); transition:opacity 0.5s ease,transform 0.5s ease; }
    .audit-result-card.visible { opacity:1; transform:translateY(0); }
    .audit-result-card:hover { box-shadow:0 8px 24px rgba(124,58,237,0.08); transform:translateY(-2px); }
    .audit-result-icon { font-size:28px; flex-shrink:0; margin-top:2px; }
    .audit-result-body { flex:1; }
    .audit-result-label { font-size:15px; font-weight:800; color:#1a1520; margin-bottom:5px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .audit-result-badge { font-size:10px; padding:3px 10px; border-radius:100px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:white; }
    .audit-result-detail { font-size:13px; color:#6b6880; line-height:1.65; font-weight:500; }
    .audit-result-bar { height:3px; border-radius:100px; background:rgba(0,0,0,0.06); margin-top:10px; overflow:hidden; }
    .audit-result-fill { height:100%; border-radius:100px; animation:barGrow 0.8s ease-out 0.2s both; }
    @keyframes barGrow { from{width:0%} }
    .audit-fix-cta { text-align:center; opacity:0; transform:translateY(12px); transition:opacity 0.5s ease,transform 0.5s ease; }
    .audit-fix-cta.visible { opacity:1; transform:translateY(0); }
    .audit-fix-title { font-size:16px; font-weight:700; color:#1a1520; margin-bottom:16px; }
    .audit-fix-btn { background:linear-gradient(135deg,#7c3aed,#0891b2); color:white; padding:18px 48px; border-radius:100px; font-size:16px; font-weight:900; text-decoration:none; display:inline-block; box-shadow:0 10px 32px rgba(124,58,237,0.4); transition:all 0.3s; font-family:'Satoshi',sans-serif; letter-spacing:0.02em; animation:fixGlow 2.5s ease-in-out infinite; }
    .audit-fix-btn:hover { transform:translateY(-3px); box-shadow:0 18px 44px rgba(124,58,237,0.55); }
    @keyframes fixGlow { 0%,100%{box-shadow:0 10px 32px rgba(124,58,237,0.4)}50%{box-shadow:0 10px 48px rgba(124,58,237,0.65),0 0 0 8px rgba(124,58,237,0.06)} }
    .audit-disclaimer { font-size:11px; color:#bbb; margin-top:12px; font-weight:600; }
    .audit-restart { background:none; border:none; color:#9ca3af; font-size:12px; font-weight:700; cursor:pointer; margin-top:16px; text-decoration:underline; font-family:'Satoshi',sans-serif; display:block; margin-left:auto; margin-right:auto; }
    .audit-restart:hover { color:#7c3aed; }
    @media(max-width:600px){
      .audit-wrap{padding:32px 16px;}
      .audit-input-row{flex-direction:column;}
      .audit-btn{width:100%;text-align:center;}
      .audit-platforms{gap:10px;}
      .audit-platform-btn{min-width:72px;padding:16px 14px;}
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: auditCSS }} />
      <div className="audit-wrap zj-animate zj-delay-2">
        <div className="audit-header">
          <div className="audit-chip">✦ Free Brand Audit</div>
          <div className="audit-title">Is Your Brand <span>Losing Money</span> Online?</div>
          <p className="audit-sub">Select your platform and get a free instant audit in seconds.</p>
        </div>

        {/* STEP 1 — Platform */}
        {(phase === "idle" || phase === "input") && (
          <>
            <p className="audit-step-label"><span>Step 1</span> — Choose your platform</p>
            <div className="audit-platforms">
              {platforms.map((p) => (
                <button key={p.id} className={`audit-platform-btn${platform === p.id ? " selected" : ""}`} onClick={() => selectPlatform(p.id)}>
                  {p.logo}
                  <span className="audit-platform-label">{p.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 2 — Input */}
        {phase === "input" && platform && (
          <div className="audit-input-step">
            <p className="audit-step-label" style={{ marginBottom: 14 }}>
              <span>Step 2</span> — Enter your {platforms.find(p=>p.id===platform)?.label} details
            </p>
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <span className="audit-selected-badge" onClick={reset}>
                {platforms.find(p=>p.id===platform)?.label} &nbsp;·&nbsp; ✕ Change
              </span>
            </div>
            <div className="audit-input-row">
              <input className="audit-input" placeholder={placeholders[platform]} value={handle}
                onChange={(e) => setHandle(e.target.value)} onKeyDown={(e) => e.key==="Enter" && runAudit()} autoFocus />
              <button className="audit-btn" onClick={runAudit} disabled={!handle.trim()}>Run My Audit →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Loading (10 seconds) */}
        {phase === "loading" && (
          <div className="audit-loading">
            <div className="audit-load-header">
              <span className="audit-load-title">SCANNING {handle.toUpperCase()}</span>
              <span className="audit-load-pct">{loadPct}%</span>
            </div>
            <div className="audit-load-bar">
              <div className="audit-load-fill" style={{ width: `${loadPct}%` }} />
            </div>
            <div className="audit-steps-list">
              {loadingSteps.map((s, i) => {
                const isDone   = i < loadStep;
                const isActive = i === loadStep;
                return (
                  <div key={i} className={`audit-load-step${isActive?" active":isDone?" done":""}`}>
                    <span className="audit-load-step-icon">{s.icon}</span>
                    <div className="audit-load-step-body">
                      <div className="audit-load-step-text">{s.text}</div>
                      {(isActive || isDone) && <div className="audit-load-step-detail">{s.detail}</div>}
                    </div>
                    {isActive && <div className="audit-load-step-spinner" />}
                    {isDone   && <span className="audit-load-step-status">✓ Done</span>}
                    {!isActive && !isDone && <span className="audit-load-step-status" style={{ color:"#ddd", background:"rgba(0,0,0,0.04)" }}>Pending</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — Results */}
        {phase === "results" && (
          <div className="audit-results-wrap">
            <div className="audit-score-row">
              <span className="audit-score-label">Brand Health Score</span>
              <span className="audit-score-val" style={{ color: scoreColor }}>{score}/100</span>
              <span className="audit-score-tag" style={{ background:`${scoreColor}18`, color:scoreColor }}>{scoreTag}</span>
            </div>
            <div className="audit-results">
              {auditResults.map((r, i) => (
                <div className={`audit-result-card${visibleResults > i ? " visible" : ""}`} key={r.label}>
                  <div className="audit-result-icon">{r.icon}</div>
                  <div className="audit-result-body">
                    <div className="audit-result-label">
                      {r.label}
                      <span className="audit-result-badge" style={{ background:r.color }}>Issue Found</span>
                    </div>
                    <p className="audit-result-detail">{r.detail}</p>
                    <div className="audit-result-bar">
                      <div className="audit-result-fill" style={{ width:`${resultFills[i]}%`, background:r.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`audit-fix-cta${showCTA ? " visible" : ""}`}>
              <p className="audit-fix-title">Your brand is leaving money on the table. Let us fix that.</p>
              <a href="#contact" className="audit-fix-btn">🚀 Fix My Brand Now</a>
              <p className="audit-disclaimer">Free consultation · No commitment · Results in days</p>
              <button className="audit-restart" onClick={reset}>← Run another audit</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<"home"|"makeovers"|"pricing"|"intake">("home");
  const [scrollY, setScrollY] = useState(0);
  const [makeoverOpen, setMakeoverOpen] = useState(false);
  const makeoverRef = useRef<HTMLElement>(null);

  const [pricingTab, setPricingTab] = useState<"onetime"|"monthly">("onetime");
  const [intakeStep, setIntakeStep] = useState(1);
  const [intakeSubmitted, setIntakeSubmitted] = useState(false);
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);
  const [intakeError, setIntakeError] = useState("");
  const [intakeForm, setIntakeForm] = useState({
    fullName:"", email:"", website:"", package:"", brandType:"",
    linkedin:"", products:"", usedFor:[] as string[], style:"",
    communicate:[] as string[], background:"", references:"",
    urgency:"", howFound:"", notes:""
  });

  const goTo = (page: "home"|"makeovers"|"pricing"|"intake") => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIntakeSubmit = async () => {
    setIntakeSubmitting(true);
    setIntakeError("");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `New Project Brief from ${intakeForm.fullName}`,
          name: intakeForm.fullName, email: intakeForm.email,
          website: intakeForm.website, package: intakeForm.package,
          brand_type: intakeForm.brandType, linkedin: intakeForm.linkedin,
          products: intakeForm.products, used_for: intakeForm.usedFor.join(", "),
          style: intakeForm.style, communicate: intakeForm.communicate.join(", "),
          background: intakeForm.background, references: intakeForm.references,
          urgency: intakeForm.urgency, how_found: intakeForm.howFound, notes: intakeForm.notes,
        }),
      });
      if (res.ok) setIntakeSubmitted(true);
      else setIntakeError("Something went wrong. Please email us at " + CONTACT_EMAIL);
    } catch { setIntakeError("Something went wrong. Please email us at " + CONTACT_EMAIL); }
    setIntakeSubmitting(false);
  };

  const makeoverPairs = [
    { id:1,  before:"/makeovers/old1.png",  after:"/makeovers/new1.png" },
    { id:2,  before:"/makeovers/old2.png",  after:"/makeovers/new2.jpeg" },
    { id:3,  before:"/makeovers/old3.png",  after:"/makeovers/new3.jpeg" },
    { id:4,  before:"/makeovers/old4.png",  after:"/makeovers/new4.jpeg" },
    { id:5,  before:"/makeovers/old5.png",  after:"/makeovers/new5.png" },
    { id:6,  before:"/makeovers/old6.png",  after:"/makeovers/new6.jpeg" },
    { id:7,  before:"/makeovers/old7.png",  after:"/makeovers/new7.jpeg" },
    { id:8,  before:"/makeovers/old8.png",  after:"/makeovers/new8.png" },
    { id:9,  before:"/makeovers/old9.png",  after:"/makeovers/new9.png" },
    { id:10, before:"/makeovers/old10.png", after:"/makeovers/new10.png" },
    { id:11, before:"/makeovers/old11.png", after:"/makeovers/new11.png" },
    { id:12, before:"/makeovers/old12.png", after:"/makeovers/new12.png" },
    { id:13, before:"/makeovers/old13.png", after:"/makeovers/new13.png" },
    { id:14, before:"/makeovers/old14.png", after:"/makeovers/new14.jpeg" },
    { id:15, before:"/makeovers/old15.png", after:"/makeovers/new15.png" },
    { id:16, before:"/makeovers/old16.png", after:"/makeovers/new16.jpeg" },
    { id:17, before:"/makeovers/old17.png", after:"/makeovers/new17.jpeg" },
    { id:18, before:"/makeovers/old18.png", after:"/makeovers/new18.jpeg" },
    { id:19, before:"/makeovers/old19.png", after:"/makeovers/new19.jpeg" },
  ];
  const [windowHeight, setWindowHeight] = useState(900);
  // Parallax: bg=slow, cards=medium, rockets=fast
  const parallaxBg      = scrollY * 0.08;
  const parallaxRockets = scrollY * 0.45;
  const [menuOpen, setMenuOpen] = useState(false);
  const [phoneShaking, setPhoneShaking] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [meshAngle, setMeshAngle] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    const meshTimer = setInterval(() => setMeshAngle(a => (a + 0.3) % 360), 50);
    return () => { window.removeEventListener("scroll", handleScroll); clearInterval(meshTimer); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("zj-visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".zj-animate").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLinks = ["Services", "Makeovers", "Industries", "Reviews", "Contact"];

  const services = [
    { icon: "✦", title: "Product Visual Makeovers", desc: "Transform ordinary product shots into stunning, conversion-driving AI visuals that make your brand impossible to ignore on any platform." },
    { icon: "✧", title: "Service Visual Makeovers", desc: "Give your coaching or consulting business the visual identity it deserves — polished, professional, and built to attract premium clients." },
    { icon: "◈", title: "Ad Creatives", desc: "High-converting ad visuals for Instagram, Facebook, TikTok, and beyond. Stop the scroll. Start the sale." },
    { icon: "◉", title: "Promotional Videos", desc: "Short-form video content that moves — dynamic AI-enhanced promos built for reels, stories, and paid campaigns." },
    { icon: "❋", title: "Branded Social Content", desc: "A complete visual library for your website, Instagram, Facebook, and TikTok. Consistent, premium, on-brand — every post, every platform." },
  ];

  const industries = [
    { label: "Supplement Brands", icon: "💊" },
    { label: "Fitness Trainers", icon: "🏋️" },
    { label: "Online Coaching Programs", icon: "🎯" },
    { label: "E-Commerce Stores", icon: "🛍️" },
    { label: "Course Creators", icon: "📚" },
    { label: "Online Businesses", icon: "🌐" },
  ];

  const whyUs = [
    { number: "01", title: "Premium Quality, Fast", desc: "No long waiting periods. Get premium AI-enhanced visuals that rival top agency work, delivered at a pace your business can actually use." },
    { number: "02", title: "Cross-Platform Ready", desc: "Every visual is optimized for Instagram, TikTok, Facebook, websites, and paid ads. One investment, unlimited reach." },
    { number: "03", title: "Brand Elevation That Sells", desc: "We craft visuals engineered to build trust, command attention, and drive real results. Not just pretty — powerful." },
    { number: "04", title: "Affordable Custom Solutions", desc: "Premium results should not require an agency budget. ZJ Digital makes high-end visual production accessible to ambitious brands." },
  ];

  const reviews = [
    { name: "Marcus T.", role: "Supplement Brand Founder", text: "ZJ Digital completely transformed how my brand looks online. Within weeks of updating our product visuals, we saw a noticeable jump in conversions. The quality is honestly agency-level.", stars: 5, date: "March 2025" },
    { name: "Leila R.", role: "Online Fitness Coach", text: "I was skeptical about AI visuals but the results blew me away. My Instagram now looks like a premium fitness brand and my DMs have never been busier. Worth every penny.", stars: 5, date: "February 2025" },
    { name: "Jordan K.", role: "E-Commerce Store Owner", text: "Fast, professional, and the visuals look incredible. My product pages went from looking amateur to premium overnight. I wish I had found ZJ Digital sooner.", stars: 5, date: "January 2025" },
    { name: "Priya M.", role: "Coaching Program Creator", text: "The ad creatives they built for my program launch performed better than anything I had run before. Absolutely incredible work and super fast delivery.", stars: 5, date: "March 2025" },
    { name: "Sam D.", role: "Brand Strategist", text: "The turnaround time and quality are unmatched. ZJ Digital gave my client brand a complete visual overhaul and the feedback was immediate and overwhelmingly positive.", stars: 5, date: "December 2024" },
    { name: "Alex W.", role: "Online Course Creator", text: "My course launch visuals looked so good that students were commenting on the branding before even starting the content. ZJ Digital is the real deal.", stars: 5, date: "February 2025" },
  ];



  const css = `
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #faf8f5; --bg2: #f3f0eb; --bg3: #ede9e2; --white: #ffffff;
      --text: #1a1520; --text2: #4a4458; --muted: #8b829a;
      --border: rgba(100,80,140,0.12); --border2: rgba(100,80,140,0.22);
      --purple: #7c3aed; --purple2: #9d5cf6; --purple3: #c4b5fd;
      --purple-light: rgba(124,58,237,0.08);
      --cyan: #0891b2; --cyan2: #22d3ee; --cyan3: #a5f3fc;
      --cyan-light: rgba(8,145,178,0.08);
      --grad: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
      --grad2: linear-gradient(135deg, #0891b2 0%, #7c3aed 100%);
      --grad3: linear-gradient(135deg, #9d5cf6 0%, #22d3ee 100%);
    }
    html { scroll-behavior: smooth; }
    body { background: var(--bg); color: var(--text); font-family: 'Satoshi', sans-serif; font-weight: 500; line-height: 1.6; overflow-x: hidden; -webkit-font-smoothing: antialiased; }

    .zj-animate { opacity: 0; transform: translateY(36px); transition: opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1); }
    .zj-animate.zj-visible { opacity: 1; transform: translateY(0); }
    .zj-delay-1 { transition-delay: 0.1s; } .zj-delay-2 { transition-delay: 0.2s; }
    .zj-delay-3 { transition-delay: 0.3s; } .zj-delay-4 { transition-delay: 0.4s; }
    .zj-delay-5 { transition-delay: 0.5s; } .zj-delay-6 { transition-delay: 0.6s; }

    /* NAV */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 0 48px; height: 76px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; transition: all 0.4s ease; }
    nav.scrolled { background: rgba(250,248,245,0.93); border-bottom: 1px solid var(--border); backdrop-filter: blur(20px); box-shadow: 0 4px 24px rgba(124,58,237,0.07); }
    .nav-left { display: flex; align-items: center; justify-content: flex-start; }
    .nav-center { display: flex; align-items: center; justify-content: center; }
    .nav-right { display: flex; align-items: center; justify-content: flex-end; }
    .nav-brand { font-family: 'Satoshi', sans-serif; font-size: 26px; font-weight: 800; text-decoration: none; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.02em; }
    .nav-menu-btn { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: white; border: 1.5px solid var(--border2); padding: 10px 12px; border-radius: 12px; box-shadow: 0 2px 12px rgba(124,58,237,0.08); transition: all 0.3s; }
    .nav-menu-btn:hover { border-color: var(--purple2); box-shadow: 0 4px 16px rgba(124,58,237,0.15); }
    .nav-menu-btn span { display: block; width: 20px; height: 2px; background: var(--text); border-radius: 2px; transition: all 0.3s; }
    .nav-cta { background: var(--grad); color: white; padding: 11px 28px; font-size: 13px; font-weight: 800; border: none; cursor: pointer; text-decoration: none; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; box-shadow: 0 4px 16px rgba(124,58,237,0.3); letter-spacing: 0.02em; }
    .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.45); }
    .dropdown-menu { display: none; position: fixed; top: 76px; left: 40px; z-index: 998; background: white; border: 1.5px solid var(--border2); border-radius: 20px; padding: 12px; box-shadow: 0 16px 48px rgba(124,58,237,0.15); min-width: 220px; flex-direction: column; gap: 4px; }
    .dropdown-menu.open { display: flex; animation: dropIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
    .dropdown-menu a { color: var(--text2); text-decoration: none; font-size: 15px; font-weight: 700; padding: 12px 18px; border-radius: 12px; transition: all 0.2s; display: block; }
    .dropdown-menu a:hover { color: var(--purple); background: var(--purple-light); }
    .dropdown-menu .dropdown-cta { background: var(--grad); color: white; border-radius: 12px; text-align: center; margin-top: 8px; box-shadow: 0 4px 16px rgba(124,58,237,0.3); }
    .dropdown-menu .dropdown-cta:hover { color: white; background: var(--grad); opacity: 0.9; }
    @keyframes dropIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* HERO */
    #hero { position: relative; min-height: 110vh; display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; padding: 140px 24px 80px; transform: translateZ(0); }
    .hero-scroll-layer { position: absolute; left: 0; right: 0; top: 0; height: 100%; z-index: 1; pointer-events: none; overflow: hidden; will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .hero-mesh { position: absolute; inset: 0; pointer-events: none; }
    .hero-content { position: relative; z-index: 5; width: 100%; max-width: 900px; padding: 40px 20px; background: transparent; }

    .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(64px, 10vw, 130px); font-weight: 400; line-height: 0.88; color: #22d3ee; margin-bottom: 12px; text-shadow: 0 0 40px rgba(34,211,238,0.5); animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s both; letter-spacing: 0.06em; width: 100%; }
    @keyframes colorCycleAll { 0%{color:#22d3ee;text-shadow:0 0 40px rgba(34,211,238,0.5);} 25%{color:#0891b2;text-shadow:0 0 40px rgba(8,145,178,0.5);} 50%{color:#7c3aed;text-shadow:0 0 40px rgba(124,58,237,0.5);} 75%{color:#22d3ee;text-shadow:0 0 40px rgba(34,211,238,0.5);} 100%{color:#22d3ee;text-shadow:0 0 40px rgba(34,211,238,0.5);}}
    .hero-title-grad { display: block; margin-top: 4px; animation: colorCycleAll 4s linear infinite; }
    .hero-tagline { font-family: 'Satoshi', sans-serif; font-size: clamp(15px, 1.6vw, 18px); color: var(--text2); font-weight: 600; line-height: 1.65; margin: 18px auto 0; max-width: 600px; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.5s both; letter-spacing: 0.01em; }
    @keyframes colorCycle {
      0%   { color: #22d3ee; text-shadow: 0 0 40px rgba(34,211,238,0.5); }
      25%  { color: #0891b2; text-shadow: 0 0 40px rgba(8,145,178,0.5); }
      50%  { color: #7c3aed; text-shadow: 0 0 40px rgba(124,58,237,0.5); }
      75%  { color: #22d3ee; text-shadow: 0 0 40px rgba(34,211,238,0.5); }
      100% { color: #22d3ee; text-shadow: 0 0 40px rgba(34,211,238,0.5); }
    }

    .hero-buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.5s both; margin-top: 40px; }

    /* SOCIAL STATS - floating behind hero text */
    .social-stats { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
    .stat-card { background: rgba(255,220,230,0.75); backdrop-filter: blur(14px); border-radius: 28px; padding: 28px 32px; display: flex; flex-direction: column; align-items: center; gap: 10px; border: 1.5px solid rgba(255,182,210,0.7); box-shadow: 0 12px 40px rgba(255,100,150,0.12); position: absolute; pointer-events: auto; transition: all 0.4s; animation: floatCard 6s ease-in-out infinite; }
    .stat-card:hover { transform: translateY(-8px) scale(1.04); box-shadow: 0 24px 56px rgba(255,100,150,0.2); }
    .stat-card:nth-child(1) { top: 16%; left: 14%; animation-delay: 0s; }
    .stat-card:nth-child(2) { top: 56%; left: 12%; animation-delay: 1.2s; }
    .stat-card:nth-child(3) { top: 16%; right: 14%; animation-delay: 0.6s; }
    .stat-card:nth-child(4) { top: 56%; right: 12%; animation-delay: 1.8s; }
    .stat-card:nth-child(5) { bottom: 2%; left: 50%; transform: translateX(-50%); animation-delay: 2.4s; }
    .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .stat-num { font-family: 'Satoshi', sans-serif; font-size: 36px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
    .stat-label { font-size: 11px; font-weight: 800; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; text-align: center; }
    @keyframes floatCard { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    .stat-card:nth-child(5) { animation: floatCard5 6s ease-in-out infinite; animation-delay: 2.4s; }
    @keyframes floatCard5 { 0%, 100% { transform: translateX(-50%) translateY(0px); } 50% { transform: translateX(-50%) translateY(-10px); } }

    /* BUTTONS */
    .btn-primary { background: var(--grad); color: white; padding: 18px 44px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; text-decoration: none; display: inline-block; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; box-shadow: 0 8px 32px rgba(124,58,237,0.35); letter-spacing: 0.02em; }
    .btn-hero { padding: 22px 52px !important; font-size: 17px !important; }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(124,58,237,0.5); }
    .btn-secondary { background: white; color: var(--purple); padding: 17px 44px; font-size: 15px; font-weight: 800; border: 2px solid var(--border2); cursor: pointer; text-decoration: none; display: inline-block; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; letter-spacing: 0.02em; }
    .btn-secondary:hover { border-color: var(--purple); background: var(--purple-light); transform: translateY(-2px); }

    /* FLOATING CTA */
    .floating-cta { position: fixed; right: 24px; bottom: 32px; z-index: 900; background: var(--grad); color: white; padding: 14px 24px; border-radius: 100px; font-size: 13px; font-weight: 800; text-decoration: none; box-shadow: 0 8px 32px rgba(124,58,237,0.4); transition: all 0.3s; font-family: 'Satoshi', sans-serif; letter-spacing: 0.02em; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 1.2s both; }
    .floating-cta:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 16px 40px rgba(124,58,237,0.5); }

    /* SECTION CTA BANNER */
    .cta-banner { background: var(--grad); border-radius: 28px; padding: 56px 64px; text-align: center; margin-top: 64px; position: relative; overflow: hidden; }
    .cta-banner::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }
    .cta-banner h3 { font-family: 'Satoshi', sans-serif; font-size: clamp(24px, 4vw, 40px); font-weight: 800; color: white; margin-bottom: 12px; position: relative; letter-spacing: -0.02em; }
    .cta-banner p { color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 32px; font-weight: 600; position: relative; }
    .btn-white { background: white; color: var(--purple); padding: 16px 40px; font-size: 14px; font-weight: 800; border: none; cursor: pointer; text-decoration: none; display: inline-block; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    /* IPHONE CTA */
    .iphone-cta { display: flex; align-items: center; justify-content: center; gap: 80px; margin-top: 80px; flex-wrap: wrap; }
    .iphone-text { max-width: 380px; }
    .iphone-text h3 { font-family: 'Satoshi', sans-serif; font-size: clamp(24px,3vw,38px); font-weight: 800; color: var(--text); margin-bottom: 16px; letter-spacing: -0.02em; line-height: 1.2; }
    .iphone-text p { font-size: 16px; color: var(--text2); line-height: 1.8; font-weight: 600; }
    .iphone-wrap { position: relative; flex-shrink: 0; }
    /* Soft ambient glow */
    .iphone-glow { position: absolute; inset: -40px; background: radial-gradient(ellipse at 50% 60%, rgba(124,58,237,0.22) 0%, rgba(8,145,178,0.1) 50%, transparent 75%); border-radius: 50%; z-index: 0; animation: glowPulse 4s ease-in-out infinite; filter: blur(30px); pointer-events: none; }
    @keyframes glowPulse { 0%,100%{opacity:0.38;} 50%{opacity:0.62;} }
    /* Phone outer shell - matches reference exactly */
    .iphone-shell {
      position: relative; z-index: 1;
      width: 300px;
      background: linear-gradient(175deg, #3d3d3f 0%, #242426 30%, #18181a 70%, #0f0f10 100%);
      border-radius: 52px;
      padding: 14px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.13),
        0 0 0 2.5px #0a0a0b,
        inset 0 0 0 1px rgba(255,255,255,0.04),
        0 50px 100px rgba(0,0,0,0.55),
        0 20px 40px rgba(0,0,0,0.3),
        0 8px 16px rgba(0,0,0,0.2);
      animation: phoneFloat 5s ease-in-out infinite;
    }
    @keyframes phoneFloat {
      0%,100% { transform: translateY(0px) rotate(-1deg); }
      50% { transform: translateY(-16px) rotate(1deg); }
    }
    @keyframes phoneShake {
      0%   { transform: translateX(0) rotate(-1deg); }
      10%  { transform: translateX(-8px) rotate(-3deg); }
      20%  { transform: translateX(8px) rotate(3deg); }
      30%  { transform: translateX(-7px) rotate(-2deg); }
      40%  { transform: translateX(7px) rotate(2deg); }
      50%  { transform: translateX(-5px) rotate(-1.5deg); }
      60%  { transform: translateX(5px) rotate(1.5deg); }
      70%  { transform: translateX(-3px) rotate(-1deg); }
      80%  { transform: translateX(3px) rotate(1deg); }
      90%  { transform: translateX(-1px) rotate(-0.5deg); }
      100% { transform: translateX(0) rotate(-1deg); }
    }
    .phone-shaking { animation: phoneShake 0.9s ease-in-out forwards !important; }
    /* Left buttons */
    .iphone-vol-up { position:absolute; left:-3.5px; top:108px; width:3.5px; height:34px; background:linear-gradient(to right,#4a4a4c,#2c2c2e); border-radius:2px 0 0 2px; }
    .iphone-vol-down { position:absolute; left:-3.5px; top:152px; width:3.5px; height:34px; background:linear-gradient(to right,#4a4a4c,#2c2c2e); border-radius:2px 0 0 2px; }
    .iphone-mute { position:absolute; left:-3.5px; top:76px; width:3.5px; height:24px; background:linear-gradient(to right,#4a4a4c,#2c2c2e); border-radius:2px 0 0 2px; }
    /* Right power button */
    .iphone-power { position:absolute; right:-3.5px; top:138px; width:3.5px; height:68px; background:linear-gradient(to left,#4a4a4c,#2c2c2e); border-radius:0 2px 2px 0; }
    /* Inner screen area */
    .iphone-inner { background: #000; border-radius: 40px; overflow: hidden; }
    /* Dynamic island */
    .iphone-island { width: 120px; height: 34px; background: #000; border-radius: 22px; margin: 0 auto; position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 14px; }
    .iphone-island-cam { width: 12px; height: 12px; border-radius: 50%; background: #0d0d14; border: 1.5px solid #1a1a2e; box-shadow: 0 0 0 2px rgba(0,120,255,0.12); }
    .iphone-island-sensor { width: 5px; height: 5px; border-radius: 50%; background: #1a1a1a; }
    /* Screen content */
    .iphone-screen { background: linear-gradient(160deg, #f2efff 0%, #eaf3ff 60%, #f0f8ff 100%); min-height: 510px; position: relative; padding: 0; }
    .iphone-screen-inner { padding: 14px 22px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    /* Status bar */
    .iphone-status { display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 2px 0 6px; }
    .iphone-time { font-family: 'Satoshi', sans-serif; font-size: 15px; font-weight: 800; color: #111; letter-spacing: -0.02em; }
    .iphone-icons { display: flex; align-items: center; gap: 5px; }
    .iphone-signal { display:flex; align-items:flex-end; gap:1.5px; height:12px; }
    .iphone-signal span { display:block; background:#111; border-radius:1px; width:3px; }
    .iphone-signal span:nth-child(1){height:4px;}
    .iphone-signal span:nth-child(2){height:6px;}
    .iphone-signal span:nth-child(3){height:9px;}
    .iphone-signal span:nth-child(4){height:12px;}
    .iphone-wifi { font-size:12px; color:#111; }
    .iphone-batt { display:flex; align-items:center; gap:1px; }
    .iphone-batt-body { width:22px; height:11px; border:1.5px solid #111; border-radius:3px; padding:1.5px 1.5px; display:flex; }
    .iphone-batt-fill { width:65%; background:#111; border-radius:1.5px; }
    .iphone-batt-tip { width:2px; height:5px; background:#111; border-radius:0 1px 1px 0; margin-left:1px; align-self:center; }
    /* App content */
    .iphone-app-icon { width: 80px; height: 80px; background: var(--grad); border-radius: 22px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; box-shadow: 0 12px 32px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.25); }
    .iphone-app-name { font-family: 'Satoshi', sans-serif; font-size: 21px; font-weight: 800; color: #111; }
    .iphone-app-sub { font-size: 13px; color: #555; line-height: 1.65; font-weight: 600; max-width: 210px; text-align: center; }
    /* CTA - matches site gradient */
    .iphone-btn { background: var(--grad); color: white; padding: 20px 28px; border-radius: 100px; font-size: 17px; font-weight: 900; text-decoration: none; display: block; box-shadow: 0 10px 32px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.2); transition: all 0.3s; font-family: 'Satoshi', sans-serif; width: 100%; text-align: center; letter-spacing: 0.01em; }
    .iphone-btn:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(124,58,237,0.6); }
    /* Dots & home bar */
    .iphone-dots { display: flex; gap: 6px; align-items: center; justify-content: center; }
    .iphone-dots span { width: 6px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.15); }
    .iphone-dots span.active { width: 22px; border-radius: 3px; background: var(--grad); }
    .iphone-home-bar { width: 110px; height: 5px; background: rgba(0,0,0,0.18); border-radius: 3px; margin: 8px auto 2px; }
    .btn-white:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }

    /* MARQUEE */
    .marquee-section { padding: 26px 0; overflow: hidden; background: #ffffff; border-top: 2px solid rgba(0,0,0,0.06); border-bottom: 2px solid rgba(0,0,0,0.06); }
    .marquee-track { display: flex; gap: 0; animation: marquee 28s linear infinite; white-space: nowrap; }
    .marquee-item { display: flex; align-items: center; gap: 16px; font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; flex-shrink: 0; font-weight: 900; padding: 0 36px; font-family: 'Satoshi', sans-serif; }
    .marquee-item:nth-child(10n+1)  { color: #ff4757; }
    .marquee-item:nth-child(10n+2)  { color: #ff6b35; }
    .marquee-item:nth-child(10n+3)  { color: #ffa502; }
    .marquee-item:nth-child(10n+4)  { color: #2ed573; }
    .marquee-item:nth-child(10n+5)  { color: #1e90ff; }
    .marquee-item:nth-child(10n+6)  { color: #a855f7; }
    .marquee-item:nth-child(10n+7)  { color: #ff6b81; }
    .marquee-item:nth-child(10n+8)  { color: #00d2d3; }
    .marquee-item:nth-child(10n+9)  { color: #ff9f43; }
    .marquee-item:nth-child(10n+10) { color: #48dbfb; }
    .marquee-star { font-size: 10px; opacity: 0.6; }

    /* SECTION COMMONS */
    section { padding: 120px 40px; }
    .section-inner { max-width: 1160px; margin: 0 auto; }
    .section-chip { display: inline-flex; align-items: center; gap: 8px; background: var(--purple-light); color: var(--purple); padding: 7px 18px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; border: 1px solid rgba(124,58,237,0.15); }
    .section-chip.cyan { background: var(--cyan-light); color: var(--cyan); border-color: rgba(8,145,178,0.15); }
    .section-title { font-family: 'Satoshi', sans-serif; font-size: clamp(36px,5vw,58px); font-weight: 800; line-height: 1.1; color: var(--text); letter-spacing: -0.025em; }
    .section-title em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .section-title .cyan-em { font-style: normal; background: var(--grad2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    /* SERVICES */
    #services { background: var(--white); }
    .services-header { text-align: center; margin-bottom: 48px; }
    .services-header p { font-size: 16px; color: var(--text2); max-width: 560px; line-height: 1.75; font-weight: 600; margin: 16px auto 0; }
    /* Service name list */
    .services-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 64px; }
    .services-list-item { display: flex; align-items: center; gap: 10px; padding: 10px 22px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 100px; font-size: 14px; font-weight: 700; color: var(--text2); }
    .services-list-item span { font-size: 16px; }
    /* Flip cards */
    .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; perspective: 1200px; }
    .flip-card:nth-last-child(2):nth-child(3n+1) { grid-column: 1; }
    .flip-card:last-child:nth-child(3n+2) { grid-column: 2; }
    .services-grid-wrap { display: flex; flex-direction: column; gap: 28px; }
    .services-row { display: flex; justify-content: center; gap: 28px; perspective: 1200px; }
    .services-row .flip-card { width: calc(33.333% - 19px); max-width: 340px; flex-shrink: 0; }
    .flip-card { height: 300px; cursor: pointer; -webkit-tap-highlight-color: transparent; }
    .flip-card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.7s cubic-bezier(0.4,0.2,0.2,1); transform-style: preserve-3d; }
    .flip-card:hover .flip-card-inner { transform: rotateY(180deg); }
    @media (hover: none) { .flip-card:active .flip-card-inner { transform: rotateY(180deg); } }
    .flip-card-front, .flip-card-back { position: absolute; inset: 0; border-radius: 24px; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 32px; text-align: center; }
    .flip-card-front { background: var(--bg); border: 1.5px solid var(--border); }
    .flip-card-back { background: var(--grad); border: none; transform: rotateY(180deg); }
    .flip-front-icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; background: var(--purple-light); }
    .flip-card:nth-child(even) .flip-front-icon { background: var(--cyan-light); }
    .flip-front-title { font-family: 'Satoshi', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); line-height: 1.25; }
    .flip-front-hint { font-size: 12px; color: var(--muted); font-weight: 600; margin-top: 12px; letter-spacing: 0.06em; }
    .flip-back-desc { font-size: 15px; color: rgba(255,255,255,0.92); line-height: 1.75; font-weight: 600; }
    .flip-back-icon { font-size: 36px; margin-bottom: 20px; }

    /* INDUSTRIES */
    #industries { background: var(--bg2); }
    .industries-header { text-align: center; margin-bottom: 48px; }
    .industries-header p { font-size: 16px; color: var(--text2); max-width: 560px; line-height: 1.75; font-weight: 600; margin: 16px auto 0; }
    /* pill list */
    .industries-pill-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 56px; }
    .industry-pill { display: flex; align-items: center; gap: 10px; padding: 10px 22px; background: var(--white); border: 1.5px solid var(--border); border-radius: 100px; font-size: 14px; font-weight: 700; color: var(--text2); transition: all 0.3s; cursor: default; }
    .industry-pill:hover { border-color: var(--cyan); background: var(--cyan-light); color: var(--cyan); transform: translateY(-2px); }
    .industry-emoji { font-size: 18px; }
    /* hover cards */
    .industries-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .industry-card { background: var(--white); border: 1.5px solid var(--border); border-radius: 24px; padding: 36px 28px; text-align: center; transition: all 0.4s; cursor: default; position: relative; overflow: hidden; }
    .industry-card::before { content: ''; position: absolute; inset: 0; background: var(--grad2); opacity: 0; transition: opacity 0.4s; border-radius: 24px; }
    .industry-card:hover::before { opacity: 1; }
    .industry-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(8,145,178,0.18); border-color: transparent; }
    .industry-card-icon { font-size: 40px; margin-bottom: 16px; display: block; position: relative; z-index: 1; transition: transform 0.4s; }
    .industry-card:hover .industry-card-icon { transform: scale(1.2); }
    .industry-card-label { font-family: 'Satoshi', sans-serif; font-size: 16px; font-weight: 800; color: var(--text); position: relative; z-index: 1; transition: color 0.4s; }
    .industry-card:hover .industry-card-label { color: white; }
    .industry-card-desc { font-size: 13px; color: var(--text2); line-height: 1.7; font-weight: 600; margin-top: 10px; position: relative; z-index: 1; opacity: 0; transform: translateY(8px); transition: all 0.4s; }
    .industry-card:hover .industry-card-desc { opacity: 1; transform: translateY(0); color: rgba(255,255,255,0.88); }



    /* REVIEWS */
    #reviews { background: var(--bg2); }
    .reviews-header { text-align: center; margin-bottom: 64px; }
    .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .review-card { background: var(--white); border-radius: 24px; padding: 40px 36px; border: 1.5px solid var(--border); transition: all 0.4s; display: flex; flex-direction: column; gap: 20px; }
    .review-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(124,58,237,0.1); border-color: var(--border2); }
    .review-stars { display: flex; gap: 3px; }
    .review-star { font-size: 16px; color: #f59e0b; }
    .review-text { font-size: 15px; color: var(--text2); line-height: 1.8; font-weight: 600; font-style: italic; flex: 1; }
    .review-footer { display: flex; align-items: center; gap: 14px; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }
    .review-avatar { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Satoshi', sans-serif; font-size: 16px; font-weight: 800; color: white; background: var(--grad); }
    .review-card:nth-child(even) .review-avatar { background: var(--grad2); }
    .review-name { font-family: 'Satoshi', sans-serif; font-size: 15px; font-weight: 800; color: var(--text); }
    .review-role { font-size: 12px; color: var(--muted); font-weight: 700; margin-top: 2px; }
    .review-date { font-size: 11px; color: var(--muted); margin-left: auto; font-weight: 700; }

    /* CONTACT */
    #contact { background: var(--white); position: relative; overflow: hidden; }
    .contact-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.06) 0%, transparent 60%); pointer-events: none; }
    .contact-inner { max-width: 800px; margin: 0 auto; text-align: center; position: relative; }
    .contact-sub { font-size: 17px; color: var(--text2); line-height: 1.8; margin: 24px auto 56px; max-width: 520px; font-weight: 600; }
    .contact-options { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px; }
    .contact-option { padding: 44px 40px; border: 1.5px solid var(--border); border-radius: 24px; text-align: left; transition: all 0.4s; text-decoration: none; display: block; background: var(--bg); }
    .contact-option:hover { border-color: var(--purple2); background: var(--purple-light); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(124,58,237,0.1); }
    .contact-option-icon { width: 52px; height: 52px; border-radius: 14px; background: var(--purple-light); display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 24px; }
    .contact-option:last-child .contact-option-icon { background: var(--cyan-light); }
    .contact-option-label { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--purple); margin-bottom: 8px; font-weight: 800; }
    .contact-option:last-child .contact-option-label { color: var(--cyan); }
    .contact-option-title { font-family: 'Satoshi', sans-serif; font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
    .contact-option-desc { font-size: 13px; color: var(--text2); line-height: 1.7; font-weight: 600; }
    .contact-note { font-size: 13px; color: var(--muted); font-weight: 700; }
    .contact-note strong { color: var(--text2); }

    /* FOOTER */
    footer { background: var(--text); color: rgba(255,255,255,0.45); padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .footer-brand { font-family: 'Satoshi', sans-serif; font-size: 20px; font-weight: 800; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .footer-copy { font-size: 12px; font-weight: 700; }
    .footer-links { display: flex; gap: 28px; }
    .footer-links a { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; font-weight: 700; transition: color 0.3s; }
    .footer-links a:hover { color: var(--purple3); }

    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }

    /* MAKEOVER CTA SECTION */
    .makeover-cta-section { background: var(--white); padding: 100px 40px; overflow: hidden; }
    .makeover-cta-inner { display: flex; flex-direction: column; align-items: center; gap: 0; }
    .makeover-preview-strip { display: flex; gap: 12px; margin-bottom: 56px; overflow: hidden; width: 100%; max-width: 960px; mask-image: linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%); -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%); }
    .makeover-preview-thumb { position: relative; flex-shrink: 0; width: 148px; height: 110px; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.1); transition: transform 0.3s; }
    .makeover-preview-thumb:hover { transform: scale(1.05); }
    .thumb-before, .thumb-after { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .thumb-before { filter: grayscale(0.4) brightness(0.85); }
    .thumb-after { clip-path: inset(0 50% 0 0); transition: clip-path 0.4s ease; }
    .makeover-preview-thumb:hover .thumb-after { clip-path: inset(0 0% 0 0); }
    .makeover-cta-text { text-align: center; max-width: 620px; }
    .makeover-cta-sub { font-size: 16px; color: var(--text2); line-height: 1.8; font-weight: 600; margin: 20px auto 36px; max-width: 520px; }
    .makeover-open-btn { background: var(--grad); color: white; padding: 20px 52px; border-radius: 100px; font-size: 17px; font-weight: 900; border: none; cursor: pointer; font-family: 'Satoshi', sans-serif; box-shadow: 0 10px 36px rgba(124,58,237,0.4); transition: all 0.3s; letter-spacing: 0.02em; animation: fixGlow 2.5s ease-in-out infinite; }
    .makeover-open-btn:hover { transform: translateY(-3px); box-shadow: 0 18px 48px rgba(124,58,237,0.55); }
    /* MAKEOVER GRID */
    .makeover-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .makeover-card { position: relative; border-radius: 20px; overflow: hidden; aspect-ratio: 4/5; cursor: col-resize; box-shadow: 0 8px 32px rgba(0,0,0,0.12); transition: box-shadow 0.3s, transform 0.3s; background: #eee; user-select: none; }
    .makeover-card:hover { box-shadow: 0 20px 56px rgba(124,58,237,0.2); transform: translateY(-4px); }
    .makeover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
    .makeover-after-wrap { position: absolute; inset: 0; transition: clip-path 0.05s linear; }
    .makeover-divider { position: absolute; top: 0; bottom: 0; width: 3px; background: white; box-shadow: 0 0 12px rgba(0,0,0,0.3); transform: translateX(-50%); transition: left 0.05s linear; pointer-events: none; }
    .makeover-handle { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 40px; height: 40px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.25); }
    .makeover-label { position: absolute; bottom: 12px; font-size: 11px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; pointer-events: none; }
    .makeover-label-before { left: 12px; background: rgba(0,0,0,0.5); color: white; }
    .makeover-label-after { right: 12px; background: linear-gradient(135deg,#7c3aed,#0891b2); color: white; }

    /* ── TABLET (max 900px) ── */
    @media (max-width: 900px) {
      nav { padding: 0 20px; }
      .nav-links { display: none; }
      .nav-cta { display: none; }
      .nav-menu-btn { display: flex; }
      section { padding: 72px 20px; }
      .section-inner { padding: 0; }
      /* Hero */
      #hero { padding: 120px 20px 60px; min-height: 100vh; }
      .hero-content { padding: 32px 16px; }
      .hero-scroll-layer { display: none; }
      .social-stats { display: none; }
      /* Services */
      .services-header { flex-direction: column; align-items: flex-start; }
      .services-row { flex-wrap: wrap; }
      .services-row .flip-card { width: calc(50% - 14px); }
      .services-list { gap: 8px; }
      /* Industries */
      .industries-grid { grid-template-columns: 1fr 1fr; }
      .iphone-cta { flex-direction: column; align-items: center; gap: 48px; }
      .iphone-text { text-align: center; }
      /* Reviews */
      .reviews-grid { grid-template-columns: 1fr 1fr; }
      /* Contact */
      .contact-options { grid-template-columns: 1fr; }
      .makeover-grid { grid-template-columns: repeat(2, 1fr); }
      .makeover-preview-strip { gap: 8px; }
      .makeover-preview-thumb { width: 120px; height: 90px; }
      /* Footer */
      footer { flex-direction: column; text-align: center; align-items: center; gap: 12px; }
      .footer-links { justify-content: center; }
      /* Misc */
      .cta-banner { padding: 40px 24px; }
      .floating-cta { right: 14px; bottom: 18px; font-size: 12px; padding: 11px 16px; }
      .dropdown-menu { left: 0; right: 0; border-radius: 0; }
      /* Pricing */
      .pricing-grid { grid-template-columns: 1fr; }
      .pricing-partner-box { grid-template-columns: 1fr; padding: 32px 24px; gap: 24px; }
      .pricing-page { padding: 60px 20px 80px; }
      /* Intake */
      .intake-card { padding: 36px 24px; }
      .intake-page { padding: 60px 20px 80px; }
    }

    /* ── MOBILE (max 600px) ── */
    @media (max-width: 600px) {
      /* Nav */
      nav { padding: 0 16px; height: 64px; }
      .nav-brand { font-size: 20px; }
      /* Hero */
      #hero { padding: 100px 16px 48px; }
      .hero-title { font-size: clamp(52px, 14vw, 80px); letter-spacing: 0.04em; }
      .hero-title-grad { font-size: inherit; }
      .hero-tagline { font-size: 14px; margin-top: 14px; }
      .hero-buttons { flex-direction: column; align-items: center; gap: 12px; width: 100%; }
      .btn-hero { width: 100% !important; padding: 18px 24px !important; font-size: 15px !important; text-align: center; }
      .hero-scroll-layer { display: none; }
      .social-stats { display: none; }
      /* Marquee */
      .marquee-item { font-size: 13px; padding: 0 20px; }
      /* Services */
      .services-header { text-align: center; }
      .services-list { gap: 8px; }
      .services-list-item { font-size: 13px; padding: 8px 14px; }
      .services-grid-wrap { gap: 16px; }
      .services-row { flex-direction: column; align-items: center; gap: 16px; }
      .services-row .flip-card { width: 100%; max-width: 100%; }
      .flip-card { height: 260px; }
      /* iPhone */
      .iphone-cta { flex-direction: column; gap: 40px; }
      .iphone-text { text-align: center; }
      .iphone-shell { width: 260px; }
      .iphone-screen { min-height: 440px; }
      /* Industries */
      .industries-pill-list { gap: 8px; }
      .industry-pill { font-size: 13px; padding: 8px 14px; }
      .industries-grid { grid-template-columns: 1fr; }
      .industry-card { padding: 28px 20px; }
      /* Reviews */
      .reviews-grid { grid-template-columns: 1fr; gap: 16px; }
      .review-card { padding: 28px 22px; }
      /* CTA banner */
      .cta-banner { padding: 36px 20px; border-radius: 20px; }
      .cta-banner h3 { font-size: 22px; }
      /* Contact */
      .contact-options { grid-template-columns: 1fr; gap: 16px; }
      .contact-option { padding: 32px 24px; }
      /* Floating CTA */
      .floating-cta { right: 12px; bottom: 16px; font-size: 12px; padding: 10px 14px; }
      /* Section typography */
      .section-title { font-size: clamp(28px, 7vw, 42px); }
      .makeover-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .makeover-open-btn { width: 100%; padding: 18px 24px; font-size: 15px; }
      .makeover-preview-thumb { width: 95px; height: 72px; }
      /* Footer */
      footer { padding: 28px 20px; gap: 10px; }
      .footer-links { gap: 20px; }
    }

    /* ── SMALL MOBILE (max 380px) ── */
    @media (max-width: 380px) {
      .hero-title { font-size: 48px; }
      .iphone-shell { width: 240px; }
      .nav-brand { font-size: 18px; }
    }

    /* ── APOLLO NAV OVERRIDE ── */
    nav { padding: 0 48px; height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .nav-left, .nav-center, .nav-right { display: contents; }
    .nav-links { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
    .nav-link { font-size: 14px; font-weight: 700; color: var(--text2); text-decoration: none; padding: 8px 13px; border-radius: 10px; transition: all 0.2s; white-space: nowrap; font-family: 'Satoshi', sans-serif; background: none; border: none; cursor: pointer; }
    .nav-link:hover { color: var(--purple); background: var(--purple-light); }
    .nav-link.active { color: var(--purple); background: var(--purple-light); }
    @media (max-width: 900px) { .nav-links { display: none; } }

    /* ── PRICING PAGE ── */
    .pricing-page { padding: 80px 40px 120px; background: var(--bg); min-height: 80vh; }
    .pricing-toggle { display: flex; align-items: center; justify-content: center; margin: 36px auto 56px; background: var(--bg2); border: 1.5px solid var(--border); border-radius: 100px; padding: 5px; width: fit-content; }
    .pricing-toggle-btn { padding: 12px 32px; border-radius: 100px; font-size: 15px; font-weight: 800; cursor: pointer; border: none; background: transparent; color: var(--muted); font-family: 'Satoshi', sans-serif; transition: all 0.3s; }
    .pricing-toggle-btn.active { background: var(--grad); color: white; box-shadow: 0 4px 16px rgba(124,58,237,0.3); }
    .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 48px; }
    .pricing-card { background: var(--white); border: 1.5px solid var(--border); border-radius: 28px; padding: 44px 38px; display: flex; flex-direction: column; transition: all 0.4s; position: relative; overflow: hidden; }
    .pricing-card:hover { transform: translateY(-6px); box-shadow: 0 24px 56px rgba(124,58,237,0.12); }
    .pricing-card.featured { border-color: var(--purple); box-shadow: 0 8px 40px rgba(124,58,237,0.15); }
    .pricing-card.featured::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--grad); }
    .pricing-badge { display:inline-flex; align-items:center; gap:6px; background:var(--grad); color:white; padding:5px 16px; border-radius:100px; font-size:12px; font-weight:800; margin-bottom:20px; width:fit-content; }
    .pricing-name { font-size:22px; font-weight:800; color:var(--text); margin-bottom:8px; font-family:'Satoshi',sans-serif; }
    .pricing-price { font-size:56px; font-weight:900; line-height:1; color:var(--text); margin-bottom:4px; letter-spacing:-0.03em; font-family:'Satoshi',sans-serif; }
    .pricing-price span { font-size:24px; font-weight:700; color:var(--muted); vertical-align:super; }
    .pricing-period { font-size:13px; color:var(--muted); font-weight:700; margin-bottom:28px; }
    .pricing-divider { height:1px; background:var(--border); margin-bottom:28px; }
    .pricing-features { list-style:none; display:flex; flex-direction:column; gap:14px; flex:1; margin-bottom:32px; }
    .pricing-features li { display:flex; align-items:flex-start; gap:12px; font-size:15px; color:var(--text2); font-weight:600; line-height:1.5; }
    .pricing-check { width:22px; height:22px; border-radius:50%; background:var(--grad); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:12px; color:white; margin-top:1px; }
    .pricing-cta { display:block; text-align:center; padding:18px 28px; border-radius:100px; font-size:15px; font-weight:800; text-decoration:none; transition:all 0.3s; font-family:'Satoshi',sans-serif; margin-top:auto; cursor:pointer; border:none; }
    .pricing-cta-grad { background:var(--grad); color:white; box-shadow:0 6px 20px rgba(124,58,237,0.35); }
    .pricing-cta-grad:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(124,58,237,0.5); }
    .pricing-cta-outline { background:transparent; color:var(--purple); border:1.5px solid var(--purple) !important; }
    .pricing-cta-outline:hover { background:var(--purple-light); transform:translateY(-2px); }
    .pricing-partner-box { background:linear-gradient(135deg,rgba(124,58,237,0.05),rgba(8,145,178,0.05)); border:1.5px solid var(--border2); border-radius:28px; padding:48px 56px; display:grid; grid-template-columns:1fr auto; align-items:center; gap:40px; position:relative; overflow:hidden; margin-bottom:40px; }
    .pricing-partner-box::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--grad); }
    .pricing-partner-title { font-size:26px; font-weight:800; color:var(--text); margin-bottom:12px; font-family:'Satoshi',sans-serif; }
    .pricing-partner-desc { font-size:15px; color:var(--text2); line-height:1.75; font-weight:600; }
    .pricing-partner-stats { display:flex; gap:36px; margin-top:24px; }
    .pricing-partner-stat-num { font-size:28px; font-weight:900; background:var(--grad); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-family:'Satoshi',sans-serif; }
    .pricing-partner-stat-label { font-size:12px; color:var(--muted); font-weight:700; }
    .pricing-custom { text-align:center; padding:28px; background:var(--white); border:1.5px solid var(--border); border-radius:20px; font-size:15px; color:var(--text2); font-weight:600; }
    .pricing-custom a { color:var(--purple); font-weight:800; text-decoration:none; }
    @media(max-width:900px){ .pricing-grid{grid-template-columns:1fr;} .pricing-partner-box{grid-template-columns:1fr;padding:32px 24px;} }

    /* ── INTAKE PAGE ── */
    .intake-page { padding: 80px 40px 120px; background: var(--bg2); min-height: 80vh; }
    .intake-card { background:var(--white); border:1.5px solid var(--border); border-radius:28px; padding:52px 56px; position:relative; overflow:hidden; max-width:680px; margin:0 auto; }
    .intake-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--grad); }
    .intake-field { margin-bottom:24px; }
    .intake-field label { display:block; font-size:12px; font-weight:800; color:var(--text); letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px; }
    .intake-field input, .intake-field textarea { width:100%; padding:14px 18px; border:1.5px solid var(--border2); border-radius:14px; font-size:15px; font-family:'Satoshi',sans-serif; font-weight:500; color:var(--text); background:var(--bg); outline:none; transition:all 0.3s; resize:none; }
    .intake-field input:focus, .intake-field textarea:focus { border-color:var(--purple); box-shadow:0 0 0 4px var(--purple-light); background:white; }
    .intake-field input::placeholder, .intake-field textarea::placeholder { color:var(--muted); }
    .intake-choice-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .intake-choice { padding:12px 16px; border:1.5px solid var(--border2); border-radius:12px; font-size:13px; font-weight:700; color:var(--text2); cursor:pointer; background:var(--bg); transition:all 0.25s; text-align:left; font-family:'Satoshi',sans-serif; }
    .intake-choice:hover { border-color:var(--purple2); color:var(--purple); background:var(--purple-light); }
    .intake-choice.selected { border-color:var(--purple); background:var(--purple-light); color:var(--purple); font-weight:800; }
    .intake-next { padding:14px 36px; border-radius:100px; font-size:14px; font-weight:800; cursor:pointer; border:none; background:var(--grad); color:white; font-family:'Satoshi',sans-serif; box-shadow:0 6px 20px rgba(124,58,237,0.3); transition:all 0.3s; }
    .intake-next:hover { transform:translateY(-2px); }
    .intake-next:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
    .intake-back { padding:13px 24px; border-radius:100px; font-size:14px; font-weight:800; cursor:pointer; border:1.5px solid var(--border2); background:transparent; color:var(--text2); font-family:'Satoshi',sans-serif; transition:all 0.3s; }
    .intake-back:hover { border-color:var(--purple); color:var(--purple); }
    @media(max-width:640px){ .intake-card{padding:36px 24px;} .intake-choice-grid{grid-template-columns:1fr;} }

    /* ── MAKEOVERS PAGE ── */
    .makeovers-page { padding: 80px 40px 120px; background: var(--bg); min-height: 80vh; }
    .makeovers-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
    @media(max-width:900px){ .makeovers-grid{grid-template-columns:repeat(2,1fr); gap:12px;} }
  `;

  // 0 = sitting still, 1 = fully launched (rockets gone)
  const launchProgress = windowHeight > 0 ? Math.min(scrollY / (windowHeight * 0.6), 1) : 0;
  const rocketY    = launchProgress * -320;   // fly upward px
  const rocketOp   = 1 - launchProgress * 1.2; // fade out
  const rocketScale = 1 + launchProgress * 0.4; // scale up slightly as they accelerate

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* FLOATING CTA */}
      <button onClick={() => goTo("intake")} className="floating-cta">✦ Start Your Project</button>

      {/* MOBILE DROPDOWN */}
      <div className={`dropdown-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => { goTo("home"); setMenuOpen(false); }} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>🏠 Home</button>
        <button onClick={() => { goTo("makeovers"); setMenuOpen(false); }} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>🎨 Makeovers</button>
        <button onClick={() => { goTo("pricing"); setMenuOpen(false); }} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>💰 Pricing</button>
        <button onClick={() => { goTo("intake"); setMenuOpen(false); }} className="dropdown-cta">✦ Start Your Project</button>
      </div>

      {/* APOLLO NAV */}
      <nav className={scrollY > 60 ? "scrolled" : ""}>
        <button onClick={() => goTo("home")} className="nav-brand" style={{ background:"none", border:"none", cursor:"pointer" }}>ZJ Digital</button>
        <div className="nav-links">
          <button onClick={() => goTo("home")} className={`nav-link${currentPage === "home" ? " active" : ""}`}>Home</button>
          <button onClick={() => goTo("makeovers")} className={`nav-link${currentPage === "makeovers" ? " active" : ""}`}>Makeovers</button>
          <button onClick={() => goTo("pricing")} className={`nav-link${currentPage === "pricing" ? " active" : ""}`}>Pricing</button>
          <button onClick={() => goTo("intake")} className={`nav-link${currentPage === "intake" ? " active" : ""}`}>Start Project</button>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => goTo("intake")} className="nav-cta">Start Your Project</button>
          <button className="nav-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── HOME PAGE ── */}
      {currentPage === "home" && <>

      {/* HERO */}
      <section id="hero">
        {/* static dot grid background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(124,58,237,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px", transform: `translateY(${parallaxBg}px)` }} />

        {/* ROCKETS - scrolling upward infinitely */}
        <div className="hero-scroll-layer" style={{
          transform: `translateY(${rocketY - parallaxRockets}px) scale(${rocketScale}) translateZ(0)`,
          opacity: Math.max(rocketOp, 0),
          transition: scrollY === 0 ? "transform 0.5s ease, opacity 0.5s ease" : "none",
          willChange: "transform, opacity",
        }}>
          <svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }} viewBox="0 0 1200 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="flame1" cx="50%" cy="0%" r="100%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="25%" stopColor="#FFD700" stopOpacity="0.9" />
                <stop offset="55%" stopColor="#FF6600" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FF2800" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="flame2" cx="50%" cy="0%" r="100%">
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop offset="20%" stopColor="#FFE066" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#FF8800" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FF2800" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ROCKET A — FAR LEFT TOP — clear of left widget */}
            <g style={{ animation: "rocketFloat1 3.2s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "60px 170px" }}>
              <ellipse cx="60" cy="235" rx="13" ry="60" fill="url(#flame1)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="60" cy="235" rx="7" ry="40" fill="url(#flame2)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="60" cy="228" rx="3" ry="20" fill="white" opacity="0.9" />
              <ellipse cx="60" cy="170" rx="15" ry="40" fill="#c4b5fd" />
              <ellipse cx="60" cy="170" rx="10" ry="36" fill="#7c3aed" />
              <path d="M46,133 Q60,104 74,133 Z" fill="#5b21b6" />
              <circle cx="60" cy="161" r="8" fill="#e0f2fe" opacity="0.9" />
              <circle cx="60" cy="161" r="5" fill="#0891b2" opacity="0.7" />
              <path d="M46,198 L32,224 L46,212 Z" fill="#5b21b6" />
              <path d="M74,198 L88,224 L74,212 Z" fill="#5b21b6" />
            </g>

            {/* ROCKET B — FAR LEFT MID — between left widgets */}
            <g style={{ animation: "rocketFloat3 3.8s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "55px 420px" }}>
              <ellipse cx="55" cy="478" rx="10" ry="50" fill="url(#flame2)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="55" cy="478" rx="6" ry="32" fill="url(#flame1)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="55" cy="420" rx="12" ry="34" fill="#a5f3fc" />
              <ellipse cx="55" cy="420" rx="8" ry="30" fill="#0891b2" />
              <path d="M44,390 Q55,366 66,390 Z" fill="#0e7490" />
              <circle cx="55" cy="412" r="7" fill="#e0f2fe" opacity="0.9" />
              <circle cx="55" cy="412" r="4" fill="#7c3aed" opacity="0.8" />
              <path d="M44,444 L31,466 L44,456 Z" fill="#0e7490" />
              <path d="M66,444 L79,466 L66,456 Z" fill="#0e7490" />
            </g>

            {/* ROCKET C — FAR LEFT BOTTOM — below left widgets */}
            <g style={{ animation: "rocketFloat2 4.2s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "58px 720px" }}>
              <ellipse cx="58" cy="782" rx="11" ry="56" fill="url(#flame1)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="58" cy="782" rx="6" ry="36" fill="url(#flame2)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="58" cy="720" rx="13" ry="36" fill="#c4b5fd" />
              <ellipse cx="58" cy="720" rx="9" ry="32" fill="#7c3aed" />
              <path d="M46,688 Q58,663 70,688 Z" fill="#4c1d95" />
              <circle cx="58" cy="712" r="7" fill="#e0f2fe" opacity="0.9" />
              <circle cx="58" cy="712" r="4" fill="#0891b2" opacity="0.8" />
              <path d="M46,746 L33,768 L46,757 Z" fill="#4c1d95" />
              <path d="M70,746 L83,768 L70,757 Z" fill="#4c1d95" />
            </g>

            {/* ROCKET D — FAR RIGHT TOP — clear of right widget */}
            <g style={{ animation: "rocketFloat2 2.9s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "1140px 170px" }}>
              <ellipse cx="1140" cy="235" rx="13" ry="60" fill="url(#flame1)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="1140" cy="235" rx="7" ry="40" fill="url(#flame2)" style={{ filter: "blur(3px)" }} />
              <ellipse cx="1140" cy="228" rx="3" ry="20" fill="white" opacity="0.9" />
              <ellipse cx="1140" cy="170" rx="15" ry="40" fill="#a5f3fc" />
              <ellipse cx="1140" cy="170" rx="10" ry="36" fill="#0891b2" />
              <path d="M1126,133 Q1140,104 1154,133 Z" fill="#0e7490" />
              <circle cx="1140" cy="161" r="8" fill="#e0f2fe" opacity="0.9" />
              <circle cx="1140" cy="161" r="5" fill="#7c3aed" opacity="0.7" />
              <path d="M1126,198 L1112,224 L1126,212 Z" fill="#0e7490" />
              <path d="M1154,198 L1168,224 L1154,212 Z" fill="#0e7490" />
            </g>

            {/* ROCKET E — FAR RIGHT MID — between right widgets */}
            <g style={{ animation: "rocketFloat1 3.5s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "1145px 420px" }}>
              <ellipse cx="1145" cy="478" rx="10" ry="50" fill="url(#flame2)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="1145" cy="478" rx="6" ry="32" fill="url(#flame1)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="1145" cy="420" rx="12" ry="34" fill="#c4b5fd" />
              <ellipse cx="1145" cy="420" rx="8" ry="30" fill="#7c3aed" />
              <path d="M1134,390 Q1145,366 1156,390 Z" fill="#5b21b6" />
              <circle cx="1145" cy="412" r="7" fill="#e0f2fe" opacity="0.9" />
              <circle cx="1145" cy="412" r="4" fill="#0891b2" opacity="0.8" />
              <path d="M1134,444 L1121,466 L1134,456 Z" fill="#5b21b6" />
              <path d="M1156,444 L1169,466 L1156,456 Z" fill="#5b21b6" />
            </g>

            {/* ROCKET F — FAR RIGHT BOTTOM — below right widgets */}
            <g style={{ animation: "rocketFloat3 3.1s ease-in-out infinite", transform: "scale(1.4)", transformOrigin: "1142px 720px" }}>
              <ellipse cx="1142" cy="782" rx="11" ry="56" fill="url(#flame1)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="1142" cy="782" rx="6" ry="36" fill="url(#flame2)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="1142" cy="720" rx="13" ry="36" fill="#a5f3fc" />
              <ellipse cx="1142" cy="720" rx="9" ry="32" fill="#0891b2" />
              <path d="M1130,688 Q1142,663 1154,688 Z" fill="#0e7490" />
              <circle cx="1142" cy="712" r="7" fill="#e0f2fe" opacity="0.9" />
              <circle cx="1142" cy="712" r="4" fill="#7c3aed" opacity="0.8" />
              <path d="M1130,746 L1117,768 L1130,757 Z" fill="#0e7490" />
              <path d="M1154,746 L1167,768 L1154,757 Z" fill="#0e7490" />
            </g>

            {/* ROCKET G — TOP CENTER — above headline */}
            <g style={{ animation: "rocketFloat2 3.6s ease-in-out infinite", transform: "scale(1.5)", transformOrigin: "600px 80px" }}>
              <ellipse cx="600" cy="140" rx="9" ry="46" fill="url(#flame1)" style={{ filter: "blur(4px)" }} />
              <ellipse cx="600" cy="140" rx="5" ry="30" fill="url(#flame2)" style={{ filter: "blur(2px)" }} />
              <ellipse cx="600" cy="80" rx="11" ry="30" fill="#c4b5fd" />
              <ellipse cx="600" cy="80" rx="7" ry="26" fill="#7c3aed" />
              <path d="M590,54 Q600,34 610,54 Z" fill="#4c1d95" />
              <circle cx="600" cy="73" r="6" fill="#e0f2fe" opacity="0.9" />
              <circle cx="600" cy="73" r="3" fill="#0891b2" opacity="0.8" />
              <path d="M591,100 L580,118 L591,110 Z" fill="#4c1d95" />
              <path d="M609,100 L620,118 L609,110 Z" fill="#4c1d95" />
            </g>

            <style>{`
              @keyframes rocketFloat1 { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-16px);} }
              @keyframes rocketFloat2 { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-20px);} }
              @keyframes rocketFloat3 { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-13px);} }
            `}</style>
          </svg>
        </div>

        {/* STAT CARDS - always visible, stay in place */}
        <div className="social-stats" style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
          <StatCard icon="❤️" label="Likes Generated"  target={4800000} suffix="+" color="linear-gradient(135deg,#f472b6,#e879f9)" delay={0} />
          <StatCard icon="👥" label="Followers Gained" target={3200000} suffix="+" color="linear-gradient(135deg,#7c3aed,#9d5cf6)" delay={0} />
          <StatCard icon="📈" label="Brands Elevated"  target={500}     suffix="+" color="linear-gradient(135deg,#d97706,#fbbf24)" delay={0} />
          <StatCard icon="👁️" label="Views Driven"     target={12000000} suffix="+" color="linear-gradient(135deg,#059669,#34d399)" delay={0} />
        </div>

        {/* HERO TEXT - fixed in center, always readable */}
        <div className="hero-content">
          <h1 className="hero-title">
            Make Your Brand
            <span className="hero-title-grad">Impossible to Ignore</span>
          </h1>
          <p className="hero-tagline">We create viral short-form content using AI that drives views, followers, and sales.</p>
          <div className="hero-buttons">
            <a href="#contact" className="btn-primary btn-hero">🚀 Claim My FREE Visual Makeover</a>
            <a href="#services" className="btn-secondary btn-hero">See What We Do</a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-section">
        <div className="marquee-track">
          {[
            "4.8M+ Likes Generated", "12M+ Views Driven", "3.2M+ Followers Gained", "500+ Brands Elevated",
            "Stop The Scroll ✦", "Look Premium. Sell More.", "AI Visuals That Convert",
            "Product Makeovers", "Ad Creatives That Hit", "Brand Elevation Fast",
            "4.8M+ Likes Generated", "12M+ Views Driven", "3.2M+ Followers Gained", "500+ Brands Elevated",
            "Stop The Scroll ✦", "Look Premium. Sell More.", "AI Visuals That Convert",
            "Product Makeovers", "Ad Creatives That Hit", "Brand Elevation Fast",
          ].map((item, i) => (
            <div className="marquee-item" key={i}><span className="marquee-star">✦</span>{item}</div>
          ))}
        </div>
      </div>


      {/* FREE AUDIT */}
      <section style={{ background: "var(--white)", padding: "80px 40px" }}>
        <div className="section-inner">
          <BrandAudit />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services">
        <div className="section-inner">
          <div className="services-header zj-animate">
            <div className="section-chip" style={{ margin: "0 auto 20px" }}>What We Do</div>
            <h2 className="section-title">AI Visuals <em>Built</em> to Sell</h2>
            <p>Every service is designed to make your brand look premium, professional, and impossible to scroll past.</p>
          </div>

          {/* Service name pills */}
          <div className="services-list zj-animate zj-delay-1">
            {services.map((s) => (
              <div className="services-list-item" key={s.title}>
                <span>{s.icon}</span>{s.title}
              </div>
            ))}
          </div>

          {/* Flip cards - top row 3, bottom row 2 centered */}
          <div className="services-grid-wrap">
            <div className="services-row">
              {services.slice(0, 3).map((s, i) => (
                <div className={`flip-card zj-animate zj-delay-${i + 1}`} key={s.title}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div className="flip-front-icon">{s.icon}</div>
                      <div className="flip-front-title">{s.title}</div>
                      <div className="flip-front-hint">Hover to learn more ↗</div>
                    </div>
                    <div className="flip-card-back">
                      <div className="flip-back-icon">{s.icon}</div>
                      <p className="flip-back-desc">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="services-row">
              {services.slice(3).map((s, i) => (
                <div className={`flip-card zj-animate zj-delay-${i + 4}`} key={s.title}>
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <div className="flip-front-icon">{s.icon}</div>
                      <div className="flip-front-title">{s.title}</div>
                      <div className="flip-front-hint">Hover to learn more ↗</div>
                    </div>
                    <div className="flip-card-back">
                      <div className="flip-back-icon">{s.icon}</div>
                      <p className="flip-back-desc">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="iphone-cta zj-animate zj-delay-2">
            <div className="iphone-wrap">
              {/* iPhone shell */}
            <div ref={phoneRef} className={`iphone-shell${phoneShaking ? " phone-shaking" : ""}`}>
              <div className="iphone-mute" />
              <div className="iphone-vol-up" />
              <div className="iphone-vol-down" />
              <div className="iphone-power" />
              <div className="iphone-inner">
                <div className="iphone-island">
                  <div className="iphone-island-sensor" />
                  <div className="iphone-island-cam" />
                </div>
                <div className="iphone-screen">
                  <div className="iphone-screen-inner">
                    <div className="iphone-status">
                      <span className="iphone-time">9:41</span>
                      <div className="iphone-icons">
                        <div className="iphone-signal">
                          <span/><span/><span/><span/>
                        </div>
                        <span className="iphone-wifi">WiFi</span>
                        <div className="iphone-batt">
                          <div className="iphone-batt-body"><div className="iphone-batt-fill"/></div>
                          <div className="iphone-batt-tip"/>
                        </div>
                      </div>
                    </div>
                    <div className="iphone-app-icon">✦</div>
                    <div className="iphone-app-name">ZJ Digital</div>
                    <p className="iphone-app-sub">Your brand deserves to look premium. Let's build something extraordinary together.</p>
                    <a href="#contact" className="iphone-btn">🚀 Claim My Free Visual Makeover</a>
                    <div className="iphone-dots">
                      <span /><span className="active" /><span />
                    </div>
                  </div>
                </div>
                <div className="iphone-home-bar" />
              </div>
            </div>
                            {/* Glow behind phone */}
              <div className="iphone-glow" />
            </div>
            <div className="iphone-text">
              <h3>Turn Your Content Into a Growth Machine</h3>
              <p>Join 500+ brands that already look premium online. Tap to get started.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAKEOVER CTA */}
      <section className="makeover-cta-section zj-animate">
        <div className="section-inner">
          <div className="makeover-cta-inner">
            {/* Teaser preview strip */}
            <div className="makeover-preview-strip">
              {makeoverPairs.slice(0,6).map((p) => (
                <div className="makeover-preview-thumb" key={p.id}>
                  <img src={p.before} alt="before" className="thumb-before" />
                  <img src={p.after}  alt="after"  className="thumb-after"  />
                </div>
              ))}
            </div>
            <div className="makeover-cta-text zj-animate zj-delay-1">
              <div className="section-chip" style={{ margin:"0 auto 20px" }}>✦ Real Transformations</div>
              <h2 className="section-title" style={{ textAlign:"center" }}>
                See What We Did For<br /><em>Brands Like Yours</em>
              </h2>
              <p className="makeover-cta-sub">
                These are real AI visual makeovers — same brand, same product, completely transformed. Scroll through and see the difference premium visuals make.
              </p>
              <button className="makeover-open-btn" onClick={() => goTo("makeovers")}>
                🎨 Explore All Makeovers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAKEOVER SECTION */}
      <section id="makeovers" ref={makeoverRef} style={{ background:"var(--bg2)", padding:"80px 40px" }}>
        <div className="section-inner">
          <div className="zj-animate" style={{ textAlign:"center", marginBottom:56 }}>
            <div className="section-chip" style={{ margin:"0 auto 20px" }}>Before &amp; After</div>
            <h2 className="section-title">Our <em>Makeovers</em></h2>
            <p style={{ fontSize:16, color:"var(--text2)", marginTop:16, fontWeight:600, maxWidth:520, margin:"16px auto 0" }}>
              Hover over each card to reveal the transformation. Every visual was created with AI.
            </p>
          </div>
          <div className="makeover-grid">
            {makeoverPairs.map((p) => (
              <MakeoverCard key={p.id} before={p.before} after={p.after} index={p.id} />
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:56 }}>
            <button onClick={() => goTo("intake")} className="btn-primary" style={{ fontSize:16, padding:"18px 48px" }}>
              🚀 Get My Own Makeover
            </button>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section id="industries">
        <div className="section-inner">
          <div className="industries-header zj-animate">
            <div className="section-chip cyan" style={{ margin: "0 auto 20px" }}>Who We Help</div>
            <h2 className="section-title">Built for Brands That <span className="cyan-em">Sell Online</span></h2>
            <p>Whether you are launching a supplement line, scaling an e-commerce store, or growing a coaching business — your visuals are your first impression.</p>
          </div>

          {/* Pill list */}
          <div className="industries-pill-list zj-animate zj-delay-1">
            {industries.map((ind) => (
              <div className="industry-pill" key={ind.label}>
                <span className="industry-emoji">{ind.icon}</span>
                <span>{ind.label}</span>
              </div>
            ))}
          </div>

          {/* Hover cards - 3 top, 3 bottom centered */}
          <div className="industries-grid">
            {[
              { icon: "💊", label: "Supplement Brands", desc: "Make your products stand out on shelves and screens with premium AI visuals that drive real sales." },
              { icon: "🏋️", label: "Fitness Trainers", desc: "Build a brand that looks as powerful as your training. Attract more clients with elite visuals." },
              { icon: "🎯", label: "Online Coaching", desc: "Position yourself as the premium choice with visuals that communicate authority and results." },
              { icon: "🛍️", label: "E-Commerce Stores", desc: "Product visuals that convert browsers into buyers. Look premium, sell more, scale faster." },
              { icon: "📚", label: "Course Creators", desc: "Launch your course with visuals so polished that students sign up before they even read the details." },
              { icon: "🌐", label: "Online Businesses", desc: "Any business with an online presence deserves to look elite. We make that happen fast." },
            ].map((ind, i) => (
              <div className={`industry-card zj-animate zj-delay-${Math.min(i + 1, 6)}`} key={ind.label}>
                <span className="industry-card-icon">{ind.icon}</span>
                <div className="industry-card-label">{ind.label}</div>
                <p className="industry-card-desc">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* REVIEWS */}
      <section id="reviews">
        <div className="section-inner">
          <div className="reviews-header zj-animate">
            <div className="section-chip" style={{ margin: "0 auto 20px" }}>Client Reviews</div>
            <h2 className="section-title">Real Results, <em>Real Brands</em></h2>
            <p style={{ fontSize: 16, color: "var(--text2)", marginTop: 16, fontWeight: 600 }}>Don't just take our word for it — here's what our clients say.</p>
          </div>
          <div className="reviews-grid">
            {reviews.map((r, i) => (
              <div className={`review-card zj-animate zj-delay-${Math.min(i + 1, 6)}`} key={r.name}>
                <div className="review-stars">{Array.from({ length: r.stars }).map((_, j) => <span className="review-star" key={j}>★</span>)}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="review-footer">
                  <div className="review-avatar">{r.name.charAt(0)}</div>
                  <div>
                    <div className="review-name">{r.name}</div>
                    <div className="review-role">{r.role}</div>
                  </div>
                  <div className="review-date">{r.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="contact-bg" />
        <div className="section-inner">
          <div className="contact-inner">
            <div className="zj-animate">
              <div className="section-chip" style={{ margin: "0 auto 20px" }}>Get In Touch</div>
              <h2 className="section-title">Ready to Look <em>Premium Online?</em></h2>
            </div>
            <p className="contact-sub zj-animate zj-delay-1">Your brand visual identity is your most powerful sales tool. Let us build something exceptional together.</p>
            <div className="contact-options zj-animate zj-delay-2">
              <a href={`mailto:${CONTACT_EMAIL}`} className="contact-option">
                <div className="contact-option-icon">✉️</div>
                <div className="contact-option-label">Send a Message</div>
                <div className="contact-option-title">Email Us Directly</div>
                <div className="contact-option-desc">{CONTACT_EMAIL}</div>
              </a>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="contact-option">
                <div className="contact-option-icon">📅</div>
                <div className="contact-option-label">Book a Call</div>
                <div className="contact-option-title">Schedule a Strategy Call</div>
                <div className="contact-option-desc">Pick a time that works for you and let us discuss your brand.</div>
              </a>
            </div>
            <p className="contact-note zj-animate zj-delay-3"><strong>No pressure. No obligation.</strong> — Just a conversation about what is possible for your brand.</p>
          </div>
        </div>
      </section>

      </> /* end home page */}

      {/* ── MAKEOVERS PAGE ── */}
      {currentPage === "makeovers" && (
        <div style={{ background:"var(--bg)", minHeight:"80vh", padding:"80px 40px 120px" }}>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <div className="section-chip" style={{ margin:"0 auto 20px" }}>Before &amp; After</div>
              <h1 className="section-title">Real AI <em>Makeovers</em></h1>
              <p style={{ fontSize:16, color:"var(--text2)", fontWeight:600, maxWidth:520, margin:"16px auto 0", lineHeight:1.75 }}>Hover over each card to reveal the transformation. Every visual was created with AI — same brand, completely elevated.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:20 }}>
              {makeoverPairs.map((p) => (
                <MakeoverCard key={p.id} before={p.before} after={p.after} index={p.id} />
              ))}
            </div>
            <div style={{ textAlign:"center", marginTop:72, padding:"48px 40px", background:"white", border:"1.5px solid rgba(100,80,140,0.12)", borderRadius:28, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(135deg,#7c3aed,#0891b2)" }} />
              <h2 className="section-title" style={{ marginBottom:12 }}>Ready for Your Own <em>Makeover?</em></h2>
              <p style={{ fontSize:16, color:"var(--text2)", fontWeight:600, marginBottom:32, maxWidth:480, margin:"0 auto 32px" }}>Delivered within 48 hours. Unlimited revisions until you love it.</p>
              <button onClick={() => goTo("intake")} className="btn-primary" style={{ fontSize:16, padding:"18px 44px" }}>🚀 Start Your Project</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRICING PAGE ── */}
      {currentPage === "pricing" && (
        <div className="pricing-page">
          <div className="section-inner">
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div className="section-chip" style={{ margin:"0 auto 20px" }}>💰 Pricing</div>
              <h1 className="section-title">Simple, <em>Transparent</em> Pricing</h1>
              <p style={{ fontSize:16, color:"var(--text2)", maxWidth:540, margin:"16px auto 0", fontWeight:600, lineHeight:1.75 }}>No hidden fees. No long contracts. Every package includes unlimited revisions and 48h delivery. Payment via bank transfer.</p>
            </div>
            <div className="pricing-toggle">
              <button className={`pricing-toggle-btn${pricingTab==="onetime"?" active":""}`} onClick={()=>setPricingTab("onetime")}>One-Time</button>
              <button className={`pricing-toggle-btn${pricingTab==="monthly"?" active":""}`} onClick={()=>setPricingTab("monthly")}>Monthly Retainer</button>
            </div>
            {pricingTab === "onetime" && (
              <div className="pricing-grid">
                <div className="pricing-card">
                  <div className="pricing-name">Starter</div>
                  <div className="pricing-price"><span>€</span>197</div>
                  <div className="pricing-period">one-time payment</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>20 premium AI visuals</li>
                    <li><div className="pricing-check">✓</div>Optimised for Instagram, TikTok &amp; ads</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Delivered within 48 hours</li>
                    <li><div className="pricing-check">✓</div>High-resolution files included</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-outline">Start Your Project →</button>
                </div>
                <div className="pricing-card featured">
                  <div className="pricing-badge">⚡ Most Popular</div>
                  <div className="pricing-name">Brand Kit</div>
                  <div className="pricing-price"><span>€</span>397</div>
                  <div className="pricing-period">one-time payment</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>35 premium AI visuals</li>
                    <li><div className="pricing-check">✓</div>4 short video reels (15–30s)</li>
                    <li><div className="pricing-check">✓</div>Full ad creative set (Meta + TikTok)</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Delivered within 48 hours</li>
                    <li><div className="pricing-check">✓</div>All formats &amp; sizes included</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-grad">Start Your Project →</button>
                </div>
                <div className="pricing-card">
                  <div className="pricing-name">Full Launch</div>
                  <div className="pricing-price"><span>€</span>697</div>
                  <div className="pricing-period">one-time payment</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>50+ premium AI visuals</li>
                    <li><div className="pricing-check">✓</div>6 short video reels</li>
                    <li><div className="pricing-check">✓</div>Complete ad creative suite</li>
                    <li><div className="pricing-check">✓</div>Website banner &amp; hero visuals</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Priority 48h delivery</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-outline">Start Your Project →</button>
                </div>
              </div>
            )}
            {pricingTab === "monthly" && (
              <div className="pricing-grid">
                <div className="pricing-card">
                  <div className="pricing-name">Essential</div>
                  <div className="pricing-price"><span>€</span>297</div>
                  <div className="pricing-period">per month · cancel anytime</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>20 fresh AI visuals per month</li>
                    <li><div className="pricing-check">✓</div>10 short video reels per month</li>
                    <li><div className="pricing-check">✓</div>Optimised for all platforms</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Monthly strategy check-in</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-outline">Start Your Project →</button>
                </div>
                <div className="pricing-card featured">
                  <div className="pricing-badge">⚡ Most Popular</div>
                  <div className="pricing-name">Growth</div>
                  <div className="pricing-price"><span>€</span>497</div>
                  <div className="pricing-period">per month · cancel anytime</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>35 fresh AI visuals per month</li>
                    <li><div className="pricing-check">✓</div>20 short video reels per month</li>
                    <li><div className="pricing-check">✓</div>Monthly ad creative refresh</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Bi-weekly check-in call</li>
                    <li><div className="pricing-check">✓</div>Priority 48h turnaround</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-grad">Start Your Project →</button>
                </div>
                <div className="pricing-card">
                  <div className="pricing-name">Elite</div>
                  <div className="pricing-price"><span>€</span>897</div>
                  <div className="pricing-period">per month · cancel anytime</div>
                  <div className="pricing-divider" />
                  <ul className="pricing-features">
                    <li><div className="pricing-check">✓</div>50+ fresh AI visuals per month</li>
                    <li><div className="pricing-check">✓</div>30+ short video reels per month</li>
                    <li><div className="pricing-check">✓</div>Full ad creative suite every month</li>
                    <li><div className="pricing-check">✓</div>Unlimited revisions until you love it</li>
                    <li><div className="pricing-check">✓</div>Weekly strategy call</li>
                    <li><div className="pricing-check">✓</div>Fastest priority turnaround</li>
                  </ul>
                  <button onClick={()=>goTo("intake")} className="pricing-cta pricing-cta-outline">Start Your Project →</button>
                </div>
              </div>
            )}
            <div className="pricing-partner-box">
              <div>
                <div className="section-chip" style={{ marginBottom:16 }}>💼 LinkedIn Coaches</div>
                <div className="pricing-partner-title">Offer AI Makeovers to Your Clients — We Do the Work</div>
                <div className="pricing-partner-desc">Partner with ZJ Digital and add a premium AI visual upgrade to your coaching packages. You charge your clients, we deliver.</div>
                <div className="pricing-partner-stats">
                  <div><div className="pricing-partner-stat-num">€100–€330</div><div className="pricing-partner-stat-label">profit per client</div></div>
                  <div><div className="pricing-partner-stat-num">48h</div><div className="pricing-partner-stat-label">turnaround</div></div>
                  <div><div className="pricing-partner-stat-num">100%</div><div className="pricing-partner-stat-label">white-label</div></div>
                </div>
              </div>
              <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="pricing-cta pricing-cta-grad" style={{ whiteSpace:"nowrap", padding:"18px 36px" }}>Let's Partner Up →</a>
            </div>
            <div className="pricing-custom">
              Need something bigger? <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">Book a free call</a> and we'll build a package around your exact needs.
            </div>
          </div>
        </div>
      )}

      {/* ── INTAKE PAGE ── */}
      {currentPage === "intake" && (
        <div className="intake-page">
          <div className="section-inner">
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div className="section-chip" style={{ margin:"0 auto 20px" }}>📋 Start Your Project</div>
              <h1 className="section-title">Tell Us About <em>Your Brand</em></h1>
              <p style={{ fontSize:16, color:"var(--text2)", maxWidth:520, margin:"16px auto 0", fontWeight:600, lineHeight:1.75 }}>Fill out this brief and we'll get back to you within 24 hours. The more detail you give us, the better your results.</p>
            </div>
            <div className="intake-card">
              {/* Step dots */}
              <div style={{ display:"flex", gap:8, marginBottom:40 }}>
                {["Your Info","Your Brand","Final Details"].map((label,i)=>(
                  <div key={label} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", margin:"0 auto 8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, background: intakeStep>i+1?"var(--grad)": intakeStep===i+1?"var(--white)":"var(--bg2)", border: intakeStep===i+1?"2px solid var(--purple)":"2px solid var(--border2)", color: intakeStep>i+1?"white": intakeStep===i+1?"var(--purple)":"var(--muted)" }}>{intakeStep>i+1?"✓":i+1}</div>
                    <div style={{ fontSize:11, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.06em", color: intakeStep===i+1?"var(--purple)":"var(--muted)" }}>{label}</div>
                  </div>
                ))}
              </div>

              {intakeSubmitted ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:56, marginBottom:20 }}>🎉</div>
                  <div style={{ fontSize:26, fontWeight:800, color:"var(--text)", marginBottom:12 }}>You're all set!</div>
                  <p style={{ fontSize:15, color:"var(--text2)", fontWeight:600, lineHeight:1.75, marginBottom:32 }}>We've received your brief and will be in touch within 24 hours at <strong>{intakeForm.email}</strong>.</p>
                  <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize:15, padding:"16px 36px" }}>📅 Book a Strategy Call</a>
                </div>
              ) : intakeStep === 1 ? (
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:"var(--text)", marginBottom:8 }}>Let's start with the basics</div>
                  <p style={{ fontSize:15, color:"var(--text2)", fontWeight:600, marginBottom:32 }}>Tell us about you and what you're looking for.</p>
                  <div className="intake-field"><label>Full Name <span style={{color:"var(--purple)"}}>*</span></label><input value={intakeForm.fullName} onChange={e=>setIntakeForm(f=>({...f,fullName:e.target.value}))} placeholder="e.g. John Smith" /></div>
                  <div className="intake-field"><label>Email Address <span style={{color:"var(--purple)"}}>*</span></label><input type="email" value={intakeForm.email} onChange={e=>setIntakeForm(f=>({...f,email:e.target.value}))} placeholder="you@yourbrand.com" /></div>
                  <div className="intake-field"><label>Website or Social URL</label><input value={intakeForm.website} onChange={e=>setIntakeForm(f=>({...f,website:e.target.value}))} placeholder="https://yourbrand.com" /></div>
                  <div className="intake-field">
                    <label>Package <span style={{color:"var(--purple)"}}>*</span></label>
                    <div className="intake-choice-grid">
                      {["Starter — 20 visuals (€197)","Brand Kit — 35 visuals + 4 videos (€397)","Full Launch — 50+ visuals + 6 videos (€697)","Essential Monthly (€297/mo)","Growth Monthly (€497/mo)","Elite Monthly (€897/mo)","Not sure yet"].map(p=>(
                        <button key={p} className={`intake-choice${intakeForm.package===p?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,package:p}))}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="intake-field">
                    <label>Brand Type <span style={{color:"var(--purple)"}}>*</span></label>
                    <div className="intake-choice-grid">
                      {["E-Commerce / Product Brand","LinkedIn Coach / Personal Brand","Fitness / Supplement Brand","Course Creator","Online Coaching","Other"].map(t=>(
                        <button key={t} className={`intake-choice${intakeForm.brandType===t?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,brandType:t}))}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:32 }}>
                    <button className="intake-next" disabled={!intakeForm.fullName||!intakeForm.email||!intakeForm.package||!intakeForm.brandType} onClick={()=>setIntakeStep(2)}>Continue →</button>
                  </div>
                </div>
              ) : intakeStep === 2 ? (
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:"var(--text)", marginBottom:8 }}>Tell us about your brand</div>
                  <p style={{ fontSize:15, color:"var(--text2)", fontWeight:600, marginBottom:32 }}>The more detail, the better your results.</p>
                  {intakeForm.brandType === "LinkedIn Coach / Personal Brand" ? (<>
                    <div className="intake-field"><label>LinkedIn Profile URL <span style={{color:"var(--purple)"}}>*</span></label><input value={intakeForm.linkedin} onChange={e=>setIntakeForm(f=>({...f,linkedin:e.target.value}))} placeholder="https://linkedin.com/in/yourname" /></div>
                    <div className="intake-field"><label>What should your visuals communicate?</label><div className="intake-choice-grid">{["Authority & expertise","Approachable & warm","Premium & high-end","Energetic & bold","Trust & professionalism"].map(o=>(<button key={o} className={`intake-choice${intakeForm.communicate.includes(o)?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,communicate:f.communicate.includes(o)?f.communicate.filter(x=>x!==o):[...f.communicate,o]}))}>{o}</button>))}</div></div>
                    <div className="intake-field"><label>Background preference</label><div className="intake-choice-grid">{["Clean studio / neutral","Modern office","Outdoor / natural light","You decide"].map(o=>(<button key={o} className={`intake-choice${intakeForm.background===o?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,background:o}))}>{o}</button>))}</div></div>
                  </>) : (<>
                    <div className="intake-field"><label>What products need visuals? <span style={{color:"var(--purple)"}}>*</span></label><textarea rows={3} value={intakeForm.products} onChange={e=>setIntakeForm(f=>({...f,products:e.target.value}))} placeholder='e.g. "Protein powder, 3 flavours — need lifestyle + product shots"' /></div>
                    <div className="intake-field"><label>Where will visuals be used?</label><div className="intake-choice-grid">{["Instagram","TikTok","Meta Ads","Website","All platforms"].map(o=>(<button key={o} className={`intake-choice${intakeForm.usedFor.includes(o)?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,usedFor:f.usedFor.includes(o)?f.usedFor.filter(x=>x!==o):[...f.usedFor,o]}))}>{o}</button>))}</div></div>
                    <div className="intake-field"><label>Brand style</label><div className="intake-choice-grid">{["Dark & moody","Clean & minimal","Bold & colourful","Natural & organic","Surprise me"].map(o=>(<button key={o} className={`intake-choice${intakeForm.style===o?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,style:o}))}>{o}</button>))}</div></div>
                  </>)}
                  <div className="intake-field"><label>Style references (optional)</label><textarea rows={2} value={intakeForm.references} onChange={e=>setIntakeForm(f=>({...f,references:e.target.value}))} placeholder="Paste links or describe what you like..." /></div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:32 }}>
                    <button className="intake-back" onClick={()=>setIntakeStep(1)}>← Back</button>
                    <button className="intake-next" onClick={()=>setIntakeStep(3)}>Continue →</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:"var(--text)", marginBottom:8 }}>Almost done!</div>
                  <p style={{ fontSize:15, color:"var(--text2)", fontWeight:600, marginBottom:32 }}>Just a couple more things.</p>
                  <div className="intake-field"><label>How urgent is this?</label><div className="intake-choice-grid">{["ASAP — within 48h","This week","Within 2 weeks","No rush"].map(o=>(<button key={o} className={`intake-choice${intakeForm.urgency===o?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,urgency:o}))}>{o}</button>))}</div></div>
                  <div className="intake-field"><label>How did you find us?</label><div className="intake-choice-grid">{["Instagram","LinkedIn","Google","Referral","Other"].map(o=>(<button key={o} className={`intake-choice${intakeForm.howFound===o?" selected":""}`} onClick={()=>setIntakeForm(f=>({...f,howFound:o}))}>{o}</button>))}</div></div>
                  <div className="intake-field"><label>Anything else? (optional)</label><textarea rows={3} value={intakeForm.notes} onChange={e=>setIntakeForm(f=>({...f,notes:e.target.value}))} placeholder="Deadlines, special requests, questions..." /></div>
                  {intakeError && <p style={{ color:"#dc2626", fontSize:14, fontWeight:700, marginBottom:16 }}>{intakeError}</p>}
                  <div style={{ display:"flex", justifyContent:"space-between", marginTop:32 }}>
                    <button className="intake-back" onClick={()=>setIntakeStep(2)}>← Back</button>
                    <button className="intake-next" disabled={intakeSubmitting} onClick={handleIntakeSubmit}>{intakeSubmitting?"Sending...":"Submit Brief 🚀"}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">ZJ Digital</div>
        <div className="footer-copy">© {new Date().getFullYear()} ZJ Digital. All rights reserved.</div>
        <div className="footer-links">
          <button onClick={() => goTo("home")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:700 }}>Home</button>
          <button onClick={() => goTo("makeovers")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:700 }}>Makeovers</button>
          <button onClick={() => goTo("pricing")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:700 }}>Pricing</button>
          <button onClick={() => goTo("intake")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:700 }}>Start Project</button>
        </div>
      </footer>
    </>
  );
}
