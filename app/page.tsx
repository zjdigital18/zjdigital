"use client";

import { useEffect, useState, useRef } from "react";

const CONTACT_EMAIL = "jovan@getjovan.com";
const CALENDLY_LINK = "https://calendly.com/jovan-getjovan/30min";

// Clean line-icon set — 24x24, inherits color via currentColor
function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    drain: <><path d="M4 5h16M6 5l1.5 9a3 3 0 0 0 3 2.6h3a3 3 0 0 0 3-2.6L21 5" /><path d="M12 17v3" /></>,
    snail: <><path d="M3 17a5 5 0 0 1 5-5 4 4 0 0 1 4 4 3 3 0 0 1-3 3H3z" /><circle cx="15" cy="12" r="5.5" /><path d="M19 7l2-2" /></>,
    robot: <><rect x="5" y="8" width="14" height="10" rx="2.5" /><path d="M12 4v4M9 13h.01M15 13h.01M9 8V6M15 8V6" /></>,
    bolt: <><path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" /></>,
    chat: <><path d="M4 5h16v11H8l-4 3V5z" /><path d="M8 9h8M8 12h5" /></>,
    voice: <><path d="M8 4h8M9 4v6a3 3 0 0 0 6 0V4M6 20h12M12 15v5" /></>,
    convert: <><path d="M4 8h11l-3-3M20 16H9l3 3" /></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2.5" /><path d="M4 9h16M8 3v4M16 3v4" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></>,
    rocket: <><path d="M12 3c3 1 5 4 5 8l-2 3H9l-2-3c0-4 2-7 5-8z" /><path d="M9 14l-2 5 4-2M15 14l2 5-4-2M12 9v.01" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
    x: <><path d="M6 6l12 12M18 6L6 18" /></>,
    play: <><circle cx="12" cy="12" r="9" /><path d="M10 8.5l6 3.5-6 3.5v-7z" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    down: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M4 7l8 6 8-6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  );
}

// Count-up stat when scrolled into view
function useCountUp(target: number, duration = 1800) {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) setGo(true); }, { threshold: 0.4 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!go) return;
    let s = 0; const step = target / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= target) { setN(target); clearInterval(t); } else setN(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [go, target, duration]);
  return { n, ref };
}

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { n, ref } = useCountUp(value);
  return (
    <div ref={ref} className="stat">
      <div className="stat-num">{n}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [form, setForm] = useState({ name: "", email: "", business: "", sells: "", platform: "", volume: "", challenge: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    if (!form.name || !form.email) { setError("Please add your name and email."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New free-trial request from ${form.name}`,
          name: form.name, email: form.email, business: form.business,
          what_they_sell: form.sells, platform: form.platform,
          messages_per_day: form.volume, biggest_challenge: form.challenge,
        }),
      });
      if (res.ok) setSubmitted(true);
      else setError("Something went wrong. Please email us at " + CONTACT_EMAIL);
    } catch { setError("Something went wrong. Please email us at " + CONTACT_EMAIL); }
    setSubmitting(false);
  };

  const steps = [
    { icon: "calendar", n: "01", title: "Book a quick call", desc: "We learn your offer, your voice, and where your messages come in. 20 minutes, no pitch-slap." },
    { icon: "search", n: "02", title: "We build your playbook", desc: "We study your best replies and objections, then map exactly how we'll answer like you would." },
    { icon: "chat", n: "03", title: "We handle your inbox — free", desc: "For 14 full days we reply to your incoming messages, qualify them, and turn them into booked calls." },
    { icon: "rocket", n: "04", title: "You watch conversions climb", desc: "See more replies answered and more leads booked. Love it? Continue. If not, you've lost nothing." },
  ];

  const compare = [
    { label: "Doing it yourself", bad: true, points: ["Steals hours every day", "Replies get slow as you get busy", "You burn out on repetitive chats"] },
    { label: "Hiring in-house", bad: true, points: ["Expensive salary + training", "Weeks to onboard and manage", "Quality drops the moment you look away"] },
    { label: "AI chatbots", bad: true, points: ["Reply like a robot", "Kill trust and the sale", "Can't handle real objections"] },
    { label: "ZJ Digital", bad: false, points: ["Trained humans reply in your voice", "Fast, on-brand, built to convert", "Fully done-for-you — you just show up to the calls"] },
  ];

  const faqs = [
    { q: "What exactly do you do?", a: "We manage your incoming messages for you. Real, trained people reply to the DMs and messages you get across your platforms — quickly, in your tone, and built to move the conversation toward a booked call or sale." },
    { q: "Is it really free for 14 days?", a: "Yes. You get a full 14-day trial so you can see the results before paying anything. No card up front, no commitment. We only talk pricing if you want to continue after you've seen it work." },
    { q: "Won't it sound like it isn't me?", a: "That's exactly what the setup call and playbook are for. We study how you already talk and reply, so your leads get answers that sound like you — just faster and more consistent." },
    { q: "Which platforms do you cover?", a: "Wherever your leads message you — Instagram DMs, WhatsApp, Facebook, email, and more. Tell us where your messages come in and we handle it." },
    { q: "What happens after the 14 days?", a: "If you're getting more booked calls and sales, you continue on a simple plan. If it's not for you, you walk away — no strings, and you keep everything we set up during the trial." },
    { q: "How fast do you reply?", a: "Fast. Speed is where most sales are won or lost — leads that get a quick, human reply are far more likely to book. That's the whole point of the service." },
  ];

  const css = `
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      /* Black + gold — modeled on aleksajovanovic.net */
      --bg: #0a0a0a; --bg2: #0f1115; --panel: #14161a; --panel2: #17181d;
      --text: #f6f3ec; --text2: #a8a49a; --muted: #6f6b60;
      --border: rgba(212,175,55,0.12); --border2: rgba(212,175,55,0.24);
      --accent: #d4af37; --accent2: #f0cf6b; --accent3: #fbe9a6;
      --accent-soft: rgba(212,175,55,0.10);
      --grad: linear-gradient(135deg, #fbe9a6 0%, #e6c35c 40%, #d4af37 70%, #b8860b 100%);
      --gold-text: #14100a;
      --ok: #25d366; --bad: #f87171;
    }
    html { scroll-behavior: smooth; }
    body { background-color: var(--bg); background-image: radial-gradient(rgba(212,175,55,0.16) 1.5px, transparent 1.6px); background-size: 24px 24px; color: var(--text); font-family: 'Satoshi', sans-serif; font-weight: 500; line-height: 1.6; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
    /* alternating dark sections keep the dot texture instead of a flat fill */
    .sec-alt { background-color: var(--bg2); background-image: radial-gradient(rgba(212,175,55,0.15) 1.5px, transparent 1.6px); background-size: 24px 24px; }
    ::selection { background: rgba(240,207,107,0.3); }

    .reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
    .reveal.in { opacity: 1; transform: none; }
    .d1 { transition-delay: .08s; } .d2 { transition-delay: .16s; } .d3 { transition-delay: .24s; } .d4 { transition-delay: .32s; }

    .wrap { max-width: 1120px; margin: 0 auto; padding: 0 28px; }
    section { position: relative; }
    .eyebrow { display: inline-flex; align-items: center; gap: 9px; padding: 8px 18px; border-radius: 100px; border: 1px solid var(--border2); background: rgba(255,255,255,0.03); color: var(--accent2); font-size: 11.5px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; }
    .eyebrow.dot::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--accent2); box-shadow: 0 0 10px var(--accent2); }
    h2.h { font-family: 'Satoshi', sans-serif; font-size: clamp(30px, 4.4vw, 52px); font-weight: 800; line-height: 1.06; letter-spacing: -0.025em; }
    h2.h em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .lead { color: var(--text2); font-size: clamp(15px, 1.6vw, 18px); font-weight: 500; line-height: 1.7; }

    /* buttons */
    .btn { display: inline-flex; align-items: center; gap: 10px; font-family: 'Satoshi', sans-serif; font-weight: 800; border: none; cursor: pointer; text-decoration: none; border-radius: 100px; transition: all 0.28s cubic-bezier(0.16,1,0.3,1); letter-spacing: 0.01em; }
    .btn-primary { background: var(--grad); color: var(--gold-text); padding: 17px 34px; font-size: 15.5px; box-shadow: 0 10px 30px rgba(212,175,55,0.4); }
    .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 18px 44px rgba(212,175,55,0.55); }
    .btn-lg { padding: 20px 44px; font-size: 17px; }
    .btn-ghost { background: rgba(255,255,255,0.04); color: var(--text); padding: 16px 32px; font-size: 15px; border: 1px solid var(--border2); backdrop-filter: blur(8px); }
    .btn-ghost:hover { border-color: var(--accent2); color: var(--accent3); transform: translateY(-2px); }

    /* nav */
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: 74px; display: flex; align-items: center; transition: all 0.4s ease; }
    nav.scrolled { background: rgba(8,8,12,0.72); border-bottom: 1px solid var(--border); backdrop-filter: blur(20px); }
    .nav-in { max-width: 1120px; margin: 0 auto; padding: 0 28px; width: 100%; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-family: 'Satoshi', sans-serif; font-size: 23px; font-weight: 800; letter-spacing: -0.02em; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; cursor: pointer; border: none; }
    .nav-links { display: flex; align-items: center; gap: 6px; }
    .nav-links button { background: none; border: none; color: var(--accent2); font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 14.5px; padding: 8px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
    .nav-links button:hover { color: var(--accent3); background: rgba(212,175,55,0.08); }
    .nav-cta { background: var(--grad) !important; color: var(--gold-text) !important; padding: 11px 22px !important; border-radius: 100px !important; font-weight: 800 !important; box-shadow: 0 6px 20px rgba(212,175,55,0.35); }
    .nav-cta:hover { color: var(--gold-text) !important; background: var(--grad) !important; transform: translateY(-1px); }
    .burger { display: none; flex-direction: column; gap: 5px; background: rgba(255,255,255,0.05); border: 1px solid var(--border2); padding: 11px 12px; border-radius: 11px; cursor: pointer; }
    .burger span { width: 20px; height: 2px; background: var(--text); border-radius: 2px; }
    .mobile-menu { display: none; }

    /* HERO */
    #hero { padding: 150px 0 90px; text-align: center; overflow: hidden; }
    #hero::before { content: ''; position: absolute; top: -10%; left: 50%; transform: translateX(-50%); width: 900px; height: 600px; background: radial-gradient(ellipse at center, rgba(212,175,55,0.28), transparent 62%); filter: blur(30px); pointer-events: none; z-index: 0; }
    #hero .wrap { position: relative; z-index: 1; }
    .hero-h1 { font-family: 'Bebas Neue', sans-serif; font-weight: 400; font-size: clamp(52px, 8vw, 108px); line-height: 0.92; letter-spacing: 0.01em; margin: 26px auto 0; max-width: 15ch; }
    .hero-h1 span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero-sub { color: var(--text2); font-size: clamp(16px, 1.8vw, 20px); line-height: 1.6; max-width: 620px; margin: 24px auto 0; font-weight: 500; }
    .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 38px; }
    .hero-trust { margin-top: 20px; color: var(--muted); font-size: 13.5px; font-weight: 600; display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; }
    .hero-trust span { display: inline-flex; align-items: center; gap: 7px; }
    .hero-trust svg { color: var(--accent2); }

    /* VSL */
    .vsl-cue { display: inline-flex; align-items: center; gap: 9px; margin-top: 46px; color: var(--accent2); font-weight: 800; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; }
    .vsl-cue svg { animation: nudge 1.6s ease-in-out infinite; }
    @keyframes nudge { 0%,100%{ transform: translateY(0); } 50%{ transform: translateY(4px); } }
    .vsl { position: relative; max-width: 860px; margin: 18px auto 0; aspect-ratio: 16/9; border-radius: 20px; overflow: hidden; border: 1px solid var(--border2); background: linear-gradient(160deg, #1a160c, #0c0a06); box-shadow: 0 40px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,175,55,0.14); display: flex; align-items: center; justify-content: center; }
    .vsl::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(212,175,55,0.18), transparent 70%); }
    .vsl-inner { position: relative; text-align: center; }
    .vsl-play { width: 84px; height: 84px; border-radius: 50%; background: var(--grad); display: flex; align-items: center; justify-content: center; color: var(--gold-text); margin: 0 auto 18px; box-shadow: 0 16px 40px rgba(212,175,55,0.5); animation: pulse 2.4s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{ box-shadow: 0 16px 40px rgba(212,175,55,0.4); } 50%{ box-shadow: 0 16px 60px rgba(212,175,55,0.7); } }
    .vsl-label { color: var(--text); font-weight: 700; font-size: 16px; }
    .vsl-note { color: var(--muted); font-size: 13px; margin-top: 4px; }

    /* marquee */
    .marquee { margin-top: 70px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 22px 0; overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }
    .marquee-track { display: flex; gap: 0; white-space: nowrap; animation: scroll 26s linear infinite; }
    .marquee-item { display: inline-flex; align-items: center; gap: 14px; padding: 0 30px; font-weight: 800; font-size: 15px; color: var(--text2); letter-spacing: 0.02em; }
    .marquee-item::after { content: '✦'; color: var(--accent); margin-left: 30px; font-size: 11px; }
    @keyframes scroll { to { transform: translateX(-50%); } }

    /* section header */
    .sec { padding: 100px 0; }
    .sec-head { text-align: center; max-width: 680px; margin: 0 auto 60px; }
    .sec-head .lead { margin: 18px auto 0; }

    /* problem cards */
    .grid { display: grid; gap: 18px; }
    .g4 { grid-template-columns: repeat(4, 1fr); }
    .g3 { grid-template-columns: repeat(3, 1fr); }
    .g2 { grid-template-columns: repeat(2, 1fr); }
    .card { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; padding: 30px 26px; transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
    .card:hover { transform: translateY(-5px); border-color: var(--border2); background: #16161f; }
    .card-ico { width: 52px; height: 52px; border-radius: 14px; background: var(--accent-soft); color: var(--accent2); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
    .card-ico.red { background: rgba(248,113,113,0.1); color: var(--bad); }
    .card h3 { font-size: 18px; font-weight: 800; letter-spacing: -0.01em; }
    .card p { color: var(--text2); font-size: 14.5px; line-height: 1.65; margin-top: 8px; font-weight: 500; }

    /* solution split */
    .split { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; }
    .sol-list { list-style: none; margin-top: 26px; display: flex; flex-direction: column; gap: 16px; }
    .sol-list li { display: flex; gap: 14px; align-items: flex-start; }
    .sol-check { flex-shrink: 0; width: 26px; height: 26px; border-radius: 8px; background: var(--accent-soft); color: var(--accent2); display: flex; align-items: center; justify-content: center; margin-top: 1px; }
    .sol-list b { font-weight: 800; }
    .sol-list p { color: var(--text2); font-size: 14.5px; margin-top: 2px; font-weight: 500; }
    .sol-visual { background: linear-gradient(160deg, #17121f, #0e0c15); border: 1px solid var(--border); border-radius: 24px; padding: 30px; }
    .chat-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 16px; }
    .chat-av { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; background: #24202e; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: var(--text2); }
    .chat-av.us { background: var(--grad); color: var(--gold-text); }
    .bubble { background: #1c1b26; border: 1px solid var(--border); border-radius: 4px 16px 16px 16px; padding: 12px 15px; font-size: 14px; color: var(--text); max-width: 82%; }
    .bubble.us { background: linear-gradient(135deg, rgba(212,175,55,0.16), rgba(212,175,55,0.07)); border-color: rgba(212,175,55,0.32); border-radius: 16px 4px 16px 16px; margin-left: auto; }
    .chat-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 11px; font-weight: 800; color: var(--ok); letter-spacing: 0.04em; }

    /* steps */
    .steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .step { position: relative; background: var(--panel); border: 1px solid var(--border); border-radius: 20px; padding: 30px 24px; }
    .step-n { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: transparent; -webkit-text-stroke: 1.4px var(--accent); letter-spacing: 0.04em; line-height: 1; }
    .step-ico { width: 46px; height: 46px; border-radius: 12px; background: var(--accent-soft); color: var(--accent2); display: flex; align-items: center; justify-content: center; margin: 16px 0 16px; }
    .step h3 { font-size: 17px; font-weight: 800; }
    .step p { color: var(--text2); font-size: 14px; margin-top: 8px; line-height: 1.6; font-weight: 500; }

    /* compare */
    .compare { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .comp { background: var(--panel); border: 1px solid var(--border); border-radius: 20px; padding: 28px 24px; }
    .comp.win { background: linear-gradient(170deg, rgba(240,207,107,0.16), rgba(212,175,55,0.05)); border-color: rgba(240,207,107,0.4); box-shadow: 0 20px 50px rgba(212,175,55,0.14); }
    .comp-label { font-size: 16px; font-weight: 800; margin-bottom: 18px; letter-spacing: -0.01em; }
    .comp.win .comp-label { color: var(--accent3); }
    .comp ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .comp li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: var(--text2); font-weight: 500; line-height: 1.5; }
    .comp li svg { flex-shrink: 0; margin-top: 1px; }
    .ic-bad { color: var(--bad); } .ic-ok { color: var(--ok); }
    .comp.win li { color: var(--text); }

    /* stats band */
    .stats-band { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 46px; background: linear-gradient(150deg, #16130b, #0c0a07); border: 1px solid var(--border2); border-radius: 26px; box-shadow: 0 30px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1); }
    .stats-band.four { grid-template-columns: repeat(4, 1fr); }
    .stat { text-align: center; }
    .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: clamp(44px, 6vw, 72px); line-height: 1; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .stat-label { color: var(--text2); font-weight: 600; font-size: 14px; margin-top: 8px; }

    /* proof */
    .proof-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .proof-card { aspect-ratio: 9/13; border-radius: 18px; border: 1px solid var(--border2); background: linear-gradient(165deg, #16111f, #0d0b13); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; position: relative; overflow: hidden; }
    .proof-card::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.14), transparent 65%); }
    .proof-play { width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; color: var(--accent2); position: relative; }
    .proof-text { color: var(--muted); font-size: 12.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; position: relative; }

    /* guarantee */
    .guarantee { display: flex; gap: 30px; align-items: center; background: linear-gradient(150deg, rgba(240,207,107,0.14), rgba(212,175,55,0.04)); border: 1px solid rgba(240,207,107,0.3); border-radius: 26px; padding: 44px 48px; }
    .guarantee-ico { flex-shrink: 0; width: 84px; height: 84px; border-radius: 22px; background: var(--grad); display: flex; align-items: center; justify-content: center; color: var(--gold-text); box-shadow: 0 16px 40px rgba(212,175,55,0.4); }
    .guarantee h3 { font-size: clamp(22px, 3vw, 32px); font-weight: 800; letter-spacing: -0.02em; }
    .guarantee p { color: var(--text2); font-size: 15.5px; margin-top: 8px; font-weight: 500; }

    /* form / CTA */
    #apply { padding: 100px 0 110px; }
    .apply-card { max-width: 720px; margin: 0 auto; background: linear-gradient(165deg, #13111d, #0b0a11); border: 1px solid var(--border2); border-radius: 28px; padding: 52px; position: relative; overflow: hidden; }
    .apply-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--grad); }
    .apply-head { text-align: center; margin-bottom: 34px; }
    .field { margin-bottom: 16px; }
    .field label { display: block; font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text2); margin-bottom: 8px; }
    .field input, .field textarea, .field select { width: 100%; background: #0c0b12; border: 1px solid var(--border2); border-radius: 13px; padding: 14px 16px; color: var(--text); font-family: 'Satoshi', sans-serif; font-weight: 500; font-size: 15px; outline: none; transition: all 0.25s; }
    .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
    .field input::placeholder, .field textarea::placeholder { color: var(--muted); }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .apply-note { text-align: center; color: var(--muted); font-size: 13px; margin-top: 18px; }
    .form-err { color: var(--bad); font-size: 14px; text-align: center; margin-top: 14px; font-weight: 600; }
    .success { text-align: center; padding: 20px 0; }
    .success-ico { width: 68px; height: 68px; border-radius: 50%; background: var(--accent-soft); color: var(--accent2); display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; }

    /* faq */
    .faq-item { border-bottom: 1px solid var(--border); }
    .faq-q { width: 100%; background: none; border: none; color: var(--text); font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 17px; text-align: left; padding: 24px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .faq-q span.plus { flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px; background: var(--accent-soft); color: var(--accent2); display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.3s; }
    .faq-item.open .faq-q span.plus { transform: rotate(45deg); }
    .faq-a { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
    .faq-item.open .faq-a { max-height: 320px; }
    .faq-a p { color: var(--text2); font-size: 15px; line-height: 1.7; padding: 0 0 24px; font-weight: 500; max-width: 90%; }

    /* footer */
    footer { border-top: 1px solid var(--border); padding: 50px 0 40px; }
    .foot-in { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
    .foot-links { display: flex; gap: 24px; }
    .foot-links a { color: var(--text2); text-decoration: none; font-weight: 600; font-size: 14px; }
    .foot-links a:hover { color: var(--text); }
    .foot-copy { color: var(--muted); font-size: 13px; }

    /* floating cta */
    .float-cta { position: fixed; right: 22px; bottom: 24px; z-index: 900; background: var(--grad); color: var(--gold-text); border: none; cursor: pointer; padding: 15px 26px; border-radius: 100px; font-family: 'Satoshi', sans-serif; font-weight: 800; font-size: 14px; box-shadow: 0 12px 34px rgba(212,175,55,0.5); animation: floatIn 0.6s cubic-bezier(0.16,1,0.3,1) 1s both; }
    .float-cta:hover { transform: translateY(-3px); }
    @keyframes floatIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }

    @media (max-width: 900px) {
      .nav-links { display: none; }
      .burger { display: flex; }
      .mobile-menu { display: none; position: fixed; top: 74px; left: 16px; right: 16px; z-index: 999; background: rgba(14,14,21,0.97); border: 1px solid var(--border2); border-radius: 18px; padding: 14px; backdrop-filter: blur(20px); flex-direction: column; gap: 4px; }
      .mobile-menu.open { display: flex; }
      .mobile-menu button { background: none; border: none; color: var(--accent2); text-align: left; font-family: 'Satoshi', sans-serif; font-weight: 700; font-size: 15px; padding: 13px 16px; border-radius: 11px; cursor: pointer; }
      .mobile-menu .m-cta { background: var(--grad); color: var(--gold-text); text-align: center; font-weight: 800; margin-top: 6px; }
      .g4, .g3, .steps, .compare, .proof-grid { grid-template-columns: 1fr 1fr; }
      .split { grid-template-columns: 1fr; gap: 36px; }
      .stats-band, .stats-band.four { grid-template-columns: 1fr 1fr; gap: 30px 20px; padding: 36px; }
      .guarantee { flex-direction: column; text-align: center; padding: 36px 26px; }
      .apply-card { padding: 36px 24px; }
      .sec { padding: 76px 0; }
    }
    @media (max-width: 560px) {
      .wrap { padding: 0 18px; }
      .g4, .g3, .g2, .steps, .compare, .proof-grid { grid-template-columns: 1fr; }
      .field-row { grid-template-columns: 1fr; }
      #hero { padding: 124px 0 70px; }
      .hero-cta { flex-direction: column; }
      .hero-cta .btn { width: 100%; justify-content: center; }
      .float-cta { right: 14px; bottom: 16px; padding: 13px 20px; font-size: 13px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <button className="float-cta" onClick={() => scrollTo("apply")}>Start Free 14-Day Trial</button>

      {/* NAV */}
      <nav className={scrollY > 40 ? "scrolled" : ""}>
        <div className="nav-in">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>ZJ Digital</button>
          <div className="nav-links">
            <button onClick={() => scrollTo("how")}>How it works</button>
            <button onClick={() => scrollTo("why")}>Why us</button>
            <button onClick={() => scrollTo("faq")}>FAQ</button>
            <button className="nav-cta" onClick={() => scrollTo("apply")}>Start Free Trial</button>
          </div>
          <button className="burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><span /><span /><span /></button>
        </div>
      </nav>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <button onClick={() => scrollTo("how")}>How it works</button>
        <button onClick={() => scrollTo("why")}>Why us</button>
        <button onClick={() => scrollTo("faq")}>FAQ</button>
        <button className="m-cta" onClick={() => scrollTo("apply")}>Start Free 14-Day Trial</button>
      </div>

      {/* HERO */}
      <section id="hero">
        <div className="wrap">
          <div className="reveal"><span className="eyebrow dot">Done-for-you inbox • Free 14-day trial</span></div>
          <h1 className="hero-h1 reveal d1">Turn the Messages You&apos;re Ignoring Into <span>Paying Clients</span></h1>
          <p className="hero-sub reveal d2">Your next client is in your messages. We make sure they don&apos;t stay there.</p>
          <div className="hero-cta reveal d3">
            <button className="btn btn-primary btn-lg" onClick={() => scrollTo("apply")}>Start Your Free 14-Day Trial <Icon name="arrow" size={18} /></button>
            <button className="btn btn-ghost btn-lg" onClick={() => scrollTo("how")}>See how it works</button>
          </div>
          <div className="hero-trust reveal d4">
            <span><Icon name="check" size={16} /> No card required</span>
            <span><Icon name="check" size={16} /> No commitment</span>
            <span><Icon name="check" size={16} /> See results first</span>
          </div>

          {/* video cue + VSL placeholder */}
          <div className="vsl-cue reveal d4">Click play on the video below to see how everything works <Icon name="down" size={17} /></div>
          <div className="vsl reveal d4">
            <div className="vsl-inner">
              <div className="vsl-play"><Icon name="play" size={34} /></div>
              <div className="vsl-label">Watch how it works</div>
              <div className="vsl-note">Video coming soon</div>
            </div>
          </div>

          {/* marquee */}
          <div className="marquee reveal">
            <div className="marquee-track">
              {[...Array(2)].map((_, k) => (
                <div style={{ display: "flex" }} key={k}>
                  {["More booked calls", "Faster replies", "In your voice", "No robotic AI", "Done for you", "Free for 14 days", "More sales closed"].map((t) => (
                    <span className="marquee-item" key={t + k}>{t}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div className="reveal"><span className="eyebrow">The problem</span></div>
            <h2 className="h reveal d1" style={{ marginTop: 18 }}>Your inbox is a <em>leaking bucket</em></h2>
            <p className="lead reveal d2">Every day, leads message you ready to buy — and most of them slip away before they ever get a good reply.</p>
          </div>
          <div className="grid g4">
            {[
              { i: "drain", t: "Too many messages", d: "You&apos;re flooded with DMs every day and physically can&apos;t keep up with all of them." },
              { i: "clock", t: "It eats your time", d: "Answering every message steals hours you should spend on higher-value work." },
              { i: "snail", t: "Leads go cold", d: "People expect fast answers. A slow reply and the sale is already gone to someone else." },
              { i: "robot", t: "AI replies like trash", d: "Bots sound robotic, fumble real objections, and quietly kill the trust you need to close." },
            ].map((c, k) => (
              <div className={`card reveal d${k + 1}`} key={c.t}>
                <div className="card-ico red"><Icon name={c.i} size={24} /></div>
                <h3 dangerouslySetInnerHTML={{ __html: c.t }} />
                <p dangerouslySetInnerHTML={{ __html: c.d }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="sec sec-alt">
        <div className="wrap">
          <div className="split">
            <div>
              <div className="reveal"><span className="eyebrow">What we do</span></div>
              <h2 className="h reveal d1" style={{ marginTop: 18 }}>We turn your inbox into a <em>sales machine</em></h2>
              <p className="lead reveal d2" style={{ marginTop: 16 }}>Real, trained people reply to your incoming messages for you — quickly, in your voice, and built to move every conversation toward a booked call or sale.</p>
              <ul className="sol-list">
                {[
                  { b: "Fast, human replies", p: "Leads get answered in minutes, not hours — by a person, not a bot." },
                  { b: "Sounds exactly like you", p: "We learn your tone and offer so every reply feels on-brand." },
                  { b: "Built to convert", p: "We qualify, handle objections, and push toward the booked call." },
                  { b: "Completely done-for-you", p: "You stop babysitting your inbox and just show up to the calls." },
                ].map((s, k) => (
                  <li className={`reveal d${k + 1}`} key={s.b}>
                    <span className="sol-check"><Icon name="check" size={16} /></span>
                    <div><b>{s.b}</b><p>{s.p}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sol-visual reveal d2">
              <div className="chat-row">
                <div className="chat-av">L</div>
                <div className="bubble">Hey, is this still available? How much?</div>
              </div>
              <div className="chat-row">
                <div className="bubble us">Hey! Yes it is. Quick question so I point you the right way — what are you trying to achieve with it?</div>
                <div className="chat-av us">ZJ</div>
              </div>
              <div className="chat-row">
                <div className="chat-av">L</div>
                <div className="bubble">Mostly want more clients honestly</div>
              </div>
              <div className="chat-row">
                <div className="bubble us">Perfect — that&apos;s exactly what we do. Grab a quick call here and we&apos;ll map it out for you.</div>
                <div className="chat-av us">ZJ</div>
              </div>
              <div className="chat-tag"><Icon name="check" size={13} /> BOOKED IN UNDER 3 MINUTES</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sec" id="how">
        <div className="wrap">
          <div className="sec-head">
            <div className="reveal"><span className="eyebrow">How the free 14 days works</span></div>
            <h2 className="h reveal d1" style={{ marginTop: 18 }}>See it work <em>before you pay anything</em></h2>
            <p className="lead reveal d2">No risk, no card, no commitment. We prove it first — you decide after.</p>
          </div>
          <div className="steps">
            {steps.map((s, k) => (
              <div className={`step reveal d${k + 1}`} key={s.n}>
                <div className="step-n">{s.n}</div>
                <div className="step-ico"><Icon name={s.icon} size={22} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 44 }} className="reveal">
            <button className="btn btn-primary btn-lg" onClick={() => scrollTo("apply")}>Claim My Free 14 Days <Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </section>

      {/* WHY US / COMPARE */}
      <section className="sec sec-alt" id="why">
        <div className="wrap">
          <div className="sec-head">
            <div className="reveal"><span className="eyebrow">Why us</span></div>
            <h2 className="h reveal d1" style={{ marginTop: 18 }}>The other options <em>cost you sales</em></h2>
            <p className="lead reveal d2">There are only a few ways to handle your inbox. Here&apos;s how they really compare.</p>
          </div>
          <div className="compare">
            {compare.map((c, k) => (
              <div className={`comp ${c.bad ? "" : "win"} reveal d${k + 1}`} key={c.label}>
                <div className="comp-label">{c.label}</div>
                <ul>
                  {c.points.map((p) => (
                    <li key={p}>
                      <span className={c.bad ? "ic-bad" : "ic-ok"}><Icon name={c.bad ? "x" : "check"} size={17} /></span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS band */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="stats-band four reveal">
            <div className="stat"><div className="stat-num">$0</div><div className="stat-label">Upfront — nothing to pay to start</div></div>
            <Stat value={14} suffix="-day" label="Free trial before you decide" />
            <div className="stat"><div className="stat-num">24/7</div><div className="stat-label">Coverage on your inbox</div></div>
            <Stat value={100} suffix="%" label="Done-for-you — you just take the calls" />
          </div>
        </div>
      </section>

      {/* PROOF placeholder */}
      <section className="sec sec-alt">
        <div className="wrap">
          <div className="sec-head">
            <div className="reveal"><span className="eyebrow">Real results</span></div>
            <h2 className="h reveal d1" style={{ marginTop: 18 }}>Watch it work for <em>real businesses</em></h2>
            <p className="lead reveal d2">Real client walkthroughs and results — dropping here shortly.</p>
          </div>
          <div className="proof-grid">
            {[0, 1, 2].map((k) => (
              <div className={`proof-card reveal d${k + 1}`} key={k}>
                <div className="proof-play"><Icon name="play" size={24} /></div>
                <div className="proof-text">Coming soon</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="sec">
        <div className="wrap">
          <div className="guarantee reveal">
            <div className="guarantee-ico"><Icon name="shield" size={40} /></div>
            <div>
              <h3>14 days, completely free.</h3>
              <p>You see more of your messages answered and more leads booked — for two full weeks — before you pay a cent. If it&apos;s not for you, you walk away and keep everything we set up. That&apos;s the whole risk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLY / FORM */}
      <section id="apply">
        <div className="wrap">
          <div className="apply-card">
            {submitted ? (
              <div className="success">
                <div className="success-ico"><Icon name="check" size={34} /></div>
                <h2 className="h" style={{ fontSize: 30 }}>You&apos;re in.</h2>
                <p className="lead" style={{ margin: "14px auto 28px", maxWidth: 460 }}>We&apos;ve got your details. The last step is a quick call so we can set up your free 14 days — grab a time that works for you.</p>
                <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg"><Icon name="calendar" size={18} /> Book My Call</a>
              </div>
            ) : (
              <>
                <div className="apply-head">
                  <div className="reveal"><span className="eyebrow dot">Last step</span></div>
                  <h2 className="h" style={{ marginTop: 16 }}>Start your <em>free 14-day trial</em></h2>
                  <p className="lead" style={{ marginTop: 14 }}>Tell us a little about your business and book your setup call. Spots are limited — we onboard a handful of clients at a time.</p>
                </div>
                <div className="field-row">
                  <div className="field"><label>Your name</label><input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="John Smith" /></div>
                  <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@business.com" /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Business / website</label><input value={form.business} onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))} placeholder="@yourbrand or website" /></div>
                  <div className="field"><label>What do you sell?</label><input value={form.sells} onChange={(e) => setForm((f) => ({ ...f, sells: e.target.value }))} placeholder="e.g. coaching, a service…" /></div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Where do messages come in?</label>
                    <select value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                      <option value="">Select platform</option>
                      <option>Instagram DMs</option>
                      <option>WhatsApp</option>
                      <option>Facebook / Messenger</option>
                      <option>Email</option>
                      <option>Multiple platforms</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Messages per day (roughly)</label>
                    <select value={form.volume} onChange={(e) => setForm((f) => ({ ...f, volume: e.target.value }))}>
                      <option value="">Select range</option>
                      <option>Under 20</option>
                      <option>20–50</option>
                      <option>50–150</option>
                      <option>150+</option>
                    </select>
                  </div>
                </div>
                <div className="field"><label>Biggest challenge with your inbox? (optional)</label><textarea rows={3} value={form.challenge} onChange={(e) => setForm((f) => ({ ...f, challenge: e.target.value }))} placeholder="e.g. I can't keep up and leads go cold…" /></div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={submitting} onClick={submit}>
                  {submitting ? "Sending…" : "Start My Free 14-Day Trial"} {!submitting && <Icon name="arrow" size={18} />}
                </button>
                {error && <div className="form-err">{error}</div>}
                <div className="apply-note">No card required · No commitment · We reply within 24 hours</div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec sec-alt" id="faq" style={{ paddingTop: 40 }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <div className="sec-head">
            <div className="reveal"><span className="eyebrow">FAQ</span></div>
            <h2 className="h reveal d1" style={{ marginTop: 18 }}>Questions, answered</h2>
          </div>
          <div className="reveal">
            {faqs.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={f.q}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}<span className="plus">+</span>
                </button>
                <div className="faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 46 }} className="reveal">
            <button className="btn btn-primary btn-lg" onClick={() => scrollTo("apply")}>Start Your Free 14-Day Trial <Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap foot-in">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>ZJ Digital</button>
          <div className="foot-links">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer">Book a call</a>
            <button onClick={() => scrollTo("apply")} style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", fontWeight: 600, fontSize: 14, fontFamily: "Satoshi, sans-serif" }}>Free trial</button>
          </div>
          <div className="foot-copy">© {new Date().getFullYear()} ZJ Digital. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
