"use client";

import { useEffect, useState, useRef } from "react";

const CONTACT_EMAIL = "jzmarketing1808@gmail.com";
const CALENDLY_LINK = "https://calendly.com/jocazilavac11/30min";
// Hero scrub track: user scrolls this many viewport-heights while the hero stage stays pinned
const HERO_SCRUB_DISTANCE = 1.25;
// Services pin: viewport-heights of scroll travel while the services stage stays pinned
const SERVICES_PIN = 1.7;
// Industries pin: scroll travel that drives the rotating globe + orbiting cards
const INDUSTRIES_PIN = 1.8;
// Makeover showcase: scroll-scrub distance for the makeover product video entrance
const SHOW_SCRUB = 1.5;

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
    window.scrollTo({ top: 0 });
    // Reset all animations so they replay on return
    document.querySelectorAll(".zj-animate").forEach((el) => el.classList.remove("zj-visible"));
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

  const [windowHeight, setWindowHeight] = useState(900);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phoneShaking, setPhoneShaking] = useState(false);
  const phoneRef = useRef<HTMLDivElement>(null);

  // Hero scroll-scrub video
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const [heroVideoReady, setHeroVideoReady] = useState(false);

  // Makeover showcase — scroll-scrubbed product makeover video (entrance)
  const mkShowRef = useRef<HTMLVideoElement>(null);
  const [mkShowReady, setMkShowReady] = useState(false);
  const showSectionRef = useRef<HTMLElement>(null);
  const [showTop, setShowTop] = useState(0);

  // Pinned services section — scroll-driven card reveal
  const servicesRef = useRef<HTMLElement>(null);
  const [servicesTop, setServicesTop] = useState(0);

  // Pinned industries section — scroll-driven rotating globe + orbiting cards
  const industriesRef = useRef<HTMLElement>(null);
  const [industriesTop, setIndustriesTop] = useState(0);


  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => { if (window.innerHeight > 0) setWindowHeight(window.innerHeight); };
    handleResize();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", handleResize); };
  }, []);

  // Track pinned-section offsets so we can map scroll → reveal/rotation progress
  useEffect(() => {
    const measure = () => {
      if (servicesRef.current) setServicesTop(servicesRef.current.offsetTop);
      if (industriesRef.current) setIndustriesTop(industriesRef.current.offsetTop);
      if (showSectionRef.current) setShowTop(showSectionRef.current.offsetTop);
    };
    measure();
    const t = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, [currentPage]);

  // Buzz the phone like an incoming notification while it's on screen
  useEffect(() => {
    const el = phoneRef.current;
    if (!el || currentPage !== "home") return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        interval = setInterval(() => {
          setPhoneShaking(true);
          timeout = setTimeout(() => setPhoneShaking(false), 850);
        }, 4500);
      } else if (interval) {
        clearInterval(interval);
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); if (interval) clearInterval(interval); if (timeout) clearTimeout(timeout); };
  }, [currentPage]);

  // The metadata event can fire before hydration attaches the listener — catch up here
  useEffect(() => {
    const v = heroVideoRef.current;
    if (v && v.readyState >= 1) setHeroVideoReady(true);
  }, [currentPage]);

  // Scrub the hero video in sync with scroll, smoothed with rAF so the pill rotation feels buttery.
  // The loop sleeps once the video catches up with the scroll position and is re-kicked by scroll events.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v || !heroVideoReady || currentPage !== "home") return;
    let raf = 0;
    let active = false;
    let t = v.currentTime || 0;
    const settle = () => {
      const dur = v.duration;
      if (!dur || isNaN(dur)) { active = false; return; }
      const progress = Math.min(Math.max(window.scrollY / (window.innerHeight * HERO_SCRUB_DISTANCE), 0), 1);
      const target = progress * Math.max(dur - 0.05, 0);
      t += (target - t) * 0.18;
      if (Math.abs(target - t) > 0.002) {
        if (v.readyState >= 2) v.currentTime = t;
        raf = requestAnimationFrame(settle);
      } else {
        active = false;
      }
    };
    const kick = () => { if (!active) { active = true; raf = requestAnimationFrame(settle); } };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    return () => { window.removeEventListener("scroll", kick); cancelAnimationFrame(raf); };
  }, [heroVideoReady, currentPage]);

  // Makeover showcase: scrub the product video as you scroll through its pinned section
  useEffect(() => {
    const v = mkShowRef.current;
    if (v && v.readyState >= 1) setMkShowReady(true);
  }, [currentPage]);

  useEffect(() => {
    const v = mkShowRef.current;
    if (!v || !mkShowReady || currentPage !== "makeovers") return;
    let raf = 0;
    let active = false;
    let t = v.currentTime || 0;
    const settle = () => {
      const dur = v.duration;
      if (!dur || isNaN(dur)) { active = false; return; }
      const progress = Math.min(Math.max((window.scrollY - showTop) / (window.innerHeight * SHOW_SCRUB), 0), 1);
      const target = progress * Math.max(dur - 0.05, 0);
      t += (target - t) * 0.18;
      if (Math.abs(target - t) > 0.002) {
        if (v.readyState >= 2) v.currentTime = t;
        raf = requestAnimationFrame(settle);
      } else {
        active = false;
      }
    };
    const kick = () => { if (!active) { active = true; raf = requestAnimationFrame(settle); } };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    return () => { window.removeEventListener("scroll", kick); cancelAnimationFrame(raf); };
  }, [mkShowReady, currentPage, showTop]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("zj-visible"); }),
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      document.querySelectorAll(".zj-animate").forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    }, 100);
    return () => clearTimeout(timer);
  }, [currentPage]);

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
    nav.scrolled { background: rgba(255,255,255,0.72); border-bottom: 1px solid rgba(0,0,0,0.05); backdrop-filter: blur(22px) saturate(1.1); -webkit-backdrop-filter: blur(22px) saturate(1.1); box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
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

    /* HERO — full-bleed scroll-scrubbed video (light studio look) */
    /* hero-video.mp4 is encoded with its background clipped to pure white (ffmpeg colorlevels) — stage must stay #ffffff to match */
    #hero { position: relative; height: ${100 + HERO_SCRUB_DISTANCE * 100}vh; padding: 0; background: #ffffff; }
    .hero-stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; padding: 108px 24px 48px; background: #ffffff; }
    /* the box matches the drawn video column exactly so the mask feathers the video's REAL edges */
    .hero-video-box { position: absolute; left: 50%; top: 50%; height: 100%; aspect-ratio: 800 / 1440; z-index: 1; transition: opacity 0.6s ease; will-change: transform; }
    .hero-video { width: 100%; height: 100%; object-fit: cover; display: block; mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 58%, transparent 98%); -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, black 58%, transparent 98%); }
    .hero-vignette { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: radial-gradient(ellipse 110% 85% at 50% 45%, transparent 55%, rgba(255,255,255,0.35) 85%, rgba(255,255,255,0.7) 100%), linear-gradient(to top, rgba(255,255,255,0.85) 0%, transparent 16%), linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 12%); }

    .hero-content { position: relative; z-index: 5; width: 100%; max-width: 980px; will-change: transform, opacity; }
    .hero-kicker { display: inline-flex; align-items: center; gap: 10px; padding: 9px 22px; border-radius: 100px; border: 1px solid rgba(26,21,32,0.14); background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); color: rgba(26,21,32,0.55); font-size: 11px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; margin-bottom: 26px; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
    .hero-kicker::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: rgba(26,21,32,0.45); }
    .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(54px, 7.5vw, 104px); font-weight: 400; line-height: 0.92; color: var(--text); letter-spacing: 0.05em; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.35s both; }
    .hero-title-grad { display: block; margin-top: 4px; color: transparent; -webkit-text-stroke: 2px rgba(26,21,32,0.34); }
    .hero-tagline { font-family: 'Satoshi', sans-serif; font-size: clamp(14px, 1.4vw, 17px); color: var(--muted); font-weight: 600; line-height: 1.6; margin: 18px auto 0; max-width: 540px; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
    .hero-cta { position: relative; z-index: 5; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; will-change: transform, opacity; }
    .hero-cta a { animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.65s both; }
    .btn-dark { background: #1a1520; color: #ffffff; padding: 18px 44px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; text-decoration: none; display: inline-block; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; letter-spacing: 0.02em; box-shadow: 0 10px 32px rgba(26,21,32,0.25); }
    .btn-dark:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(26,21,32,0.35); background: #2a2233; }
    .btn-ghost { background: rgba(255,255,255,0.6); color: var(--text); padding: 17px 44px; font-size: 15px; font-weight: 800; border: 1.5px solid rgba(26,21,32,0.2); cursor: pointer; text-decoration: none; display: inline-block; border-radius: 100px; transition: all 0.3s; font-family: 'Satoshi', sans-serif; letter-spacing: 0.02em; backdrop-filter: blur(10px); }
    .btn-ghost:hover { border-color: var(--text); background: rgba(255,255,255,0.9); transform: translateY(-2px); }

    /* scroll cue — bottom-right corner, clear of the CTAs */
    .hero-scroll-cue { position: absolute; bottom: 40px; right: 48px; z-index: 7; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; pointer-events: none; }
    .hero-scroll-cue span { display: block; width: 1.5px; height: 44px; background: linear-gradient(to bottom, transparent, #7c3aed); animation: scrollCue 1.8s ease-in-out infinite; }
    @keyframes scrollCue { 0%{transform:scaleY(0);transform-origin:top;} 45%{transform:scaleY(1);transform-origin:top;} 55%{transform:scaleY(1);transform-origin:bottom;} 100%{transform:scaleY(0);transform-origin:bottom;} }

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
    /* PHONE CTA — realistic retina device */
    .phone-cta { max-width: 1160px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 72px; }
    .phone-copy { max-width: 460px; }
    .phone-copy h3 { font-family: 'Satoshi', sans-serif; font-size: clamp(30px, 4vw, 50px); font-weight: 800; color: var(--text); line-height: 1.08; letter-spacing: -0.025em; margin-top: 18px; }
    .phone-copy h3 em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .phone-copy p { font-size: 16.5px; color: var(--text2); line-height: 1.7; font-weight: 600; margin-top: 20px; }
    .phone-copy-actions { display: flex; gap: 14px; margin-top: 34px; flex-wrap: wrap; }

    /* stage + ambient glow */
    .phone-stage { position: relative; flex-shrink: 0; justify-self: center; }
    .phone-glow { position: absolute; inset: -70px; background: radial-gradient(ellipse at 50% 55%, rgba(124,58,237,0.26), rgba(8,145,178,0.12) 45%, transparent 72%); filter: blur(44px); z-index: 0; animation: glowPulse 5s ease-in-out infinite; pointer-events: none; }
    @keyframes glowPulse { 0%,100%{opacity:0.4;} 50%{opacity:0.72;} }

    /* titanium frame */
    .phone-device { position: relative; z-index: 1; width: 384px; padding: 15px; border-radius: 66px;
      background: linear-gradient(135deg, #8c8c90 0%, #3a3a3d 20%, #1b1b1e 50%, #2f2f33 80%, #76767a 100%);
      box-shadow:
        inset 0 0 0 2px rgba(255,255,255,0.10),
        inset 0 2px 4px rgba(255,255,255,0.28),
        inset 0 -3px 5px rgba(0,0,0,0.55),
        0 1px 0 rgba(0,0,0,0.5),
        0 60px 120px rgba(20,10,40,0.42),
        0 28px 56px rgba(0,0,0,0.32);
      animation: phoneFloat 6s ease-in-out infinite; }
    @keyframes phoneFloat { 0%,100%{ transform: translateY(0) rotate(-1deg); } 50%{ transform: translateY(-18px) rotate(1deg); } }
    @keyframes phoneBuzz {
      0%,100%{ transform: translateX(0) rotate(-1deg); }
      15%{ transform: translateX(-6px) rotate(-2.4deg); } 30%{ transform: translateX(6px) rotate(2.4deg); }
      45%{ transform: translateX(-5px) rotate(-1.8deg); } 60%{ transform: translateX(5px) rotate(1.8deg); }
      75%{ transform: translateX(-3px) rotate(-1deg); } 88%{ transform: translateX(2px) rotate(0.6deg); } }
    .phone-buzz { animation: phoneBuzz 0.85s ease-in-out !important; }

    /* side buttons */
    .phone-btn-mute, .phone-btn-volup, .phone-btn-voldown { position:absolute; left:-3px; width:3px; background:linear-gradient(to right,#55555a,#28282b); border-radius:2px 0 0 2px; box-shadow:-1px 0 1px rgba(0,0,0,0.3); }
    .phone-btn-mute { top:118px; height:30px; }
    .phone-btn-volup { top:166px; height:48px; }
    .phone-btn-voldown { top:226px; height:48px; }
    .phone-btn-power { position:absolute; right:-3px; top:182px; width:3px; height:82px; background:linear-gradient(to left,#55555a,#28282b); border-radius:0 2px 2px 0; box-shadow:1px 0 1px rgba(0,0,0,0.3); }

    /* retina screen */
    .phone-screen { position: relative; width: 354px; aspect-ratio: 354 / 766; border-radius: 52px; overflow: hidden;
      background: linear-gradient(165deg, #2a1b54 0%, #3a2a78 26%, #245a82 68%, #0e7490 100%);
      box-shadow: inset 0 0 0 2px #050509; }
    /* iOS-style wallpaper orbs */
    .phone-screen::before { content:''; position:absolute; width:240px; height:240px; left:-60px; top:60px; border-radius:50%; background:radial-gradient(circle, rgba(196,181,253,0.55), transparent 65%); filter:blur(20px); }
    .phone-screen::after { content:''; position:absolute; width:220px; height:220px; right:-50px; bottom:90px; border-radius:50%; background:radial-gradient(circle, rgba(34,211,238,0.45), transparent 65%); filter:blur(22px); }
    /* dynamic island */
    .phone-island { position:absolute; top:14px; left:50%; transform:translateX(-50%); width:108px; height:32px; background:#000; border-radius:20px; z-index:8; display:flex; align-items:center; justify-content:flex-end; padding-right:12px; }
    .phone-island-cam { width:11px; height:11px; border-radius:50%; background:#0a0a12; box-shadow:inset 0 0 0 2px #1c1c2e, 0 0 3px rgba(60,130,255,0.4); }
    /* glass reflection */
    .phone-glass { position:absolute; inset:0; z-index:7; pointer-events:none; border-radius:52px; background:linear-gradient(125deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 16%, transparent 36%); overflow:hidden; }
    .phone-glass::after { content:''; position:absolute; top:-40%; left:-70%; width:45%; height:180%; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); transform:rotate(16deg); animation:glassSweep 7s ease-in-out infinite; }
    @keyframes glassSweep { 0%,68%{ left:-70%; } 100%{ left:150%; } }

    /* screen UI */
    .phone-ui { position:relative; z-index:6; height:100%; display:flex; flex-direction:column; padding:16px 22px 14px; }
    .phone-status { display:flex; justify-content:space-between; align-items:center; padding:2px 8px 0; }
    .phone-time { font-family:'Satoshi',sans-serif; font-size:15px; font-weight:800; color:#fff; letter-spacing:-0.01em; }
    .phone-status-icons { display:flex; align-items:center; gap:6px; }
    .phone-signal { display:flex; align-items:flex-end; gap:2px; height:11px; }
    .phone-signal span { width:3px; background:#fff; border-radius:1px; }
    .phone-signal span:nth-child(1){height:4px;} .phone-signal span:nth-child(2){height:6px;} .phone-signal span:nth-child(3){height:9px;} .phone-signal span:nth-child(4){height:11px;}
    .phone-wifi { width:16px; height:12px; border-radius:2px; background:conic-gradient(from 225deg at 50% 100%, #fff 0deg, #fff 90deg, transparent 90deg); -webkit-mask:radial-gradient(circle at 50% 100%, transparent 2px, #000 2.5px); mask:radial-gradient(circle at 50% 100%, transparent 2px, #000 2.5px); }
    .phone-batt { width:24px; height:12px; border:1.5px solid rgba(255,255,255,0.7); border-radius:3px; padding:1.5px; position:relative; }
    .phone-batt::after { content:''; position:absolute; right:-3px; top:50%; transform:translateY(-50%); width:2px; height:5px; background:rgba(255,255,255,0.7); border-radius:0 1px 1px 0; }
    .phone-batt-fill { height:100%; width:72%; background:#fff; border-radius:1.5px; }
    /* app card */
    .phone-app { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:0 6px; }
    .phone-app-icon { width:78px; height:78px; border-radius:22px; background:var(--grad); display:flex; align-items:center; justify-content:center; font-size:38px; color:#fff; box-shadow:0 14px 34px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.4); animation:appIconPop 0.7s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes appIconPop { from{ transform:scale(0.6); opacity:0; } to{ transform:scale(1); opacity:1; } }
    .phone-app-name { font-family:'Satoshi',sans-serif; font-size:23px; font-weight:800; color:#fff; }
    .phone-app-sub { font-size:13.5px; color:rgba(255,255,255,0.78); line-height:1.6; font-weight:600; text-align:center; max-width:210px; margin-top:-4px; }
    .phone-app-cta { margin-top:8px; background:#fff; color:#1a1520; font-family:'Satoshi',sans-serif; font-size:15px; font-weight:800; padding:15px 30px; border-radius:100px; text-decoration:none; box-shadow:0 10px 28px rgba(0,0,0,0.28); transition:transform 0.3s; }
    .phone-app-cta:hover { transform:translateY(-2px); }
    .phone-app-trust { display:flex; flex-direction:column; align-items:center; gap:4px; margin-top:6px; }
    .phone-app-stars { color:#fbbf24; font-size:14px; letter-spacing:2px; }
    .phone-app-trust span { font-size:11px; color:rgba(255,255,255,0.7); font-weight:700; letter-spacing:0.04em; }
    .phone-homebar { width:128px; height:5px; background:rgba(255,255,255,0.55); border-radius:3px; margin:6px auto 2px; }
    .btn-white:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.2); }


    /* SECTION COMMONS */
    section { padding: 120px 40px; }
    .section-inner { max-width: 1160px; margin: 0 auto; }
    .section-chip { display: inline-flex; align-items: center; gap: 8px; background: var(--purple-light); color: var(--purple); padding: 7px 18px; border-radius: 100px; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px; border: 1px solid rgba(124,58,237,0.15); }
    .section-chip.cyan { background: var(--cyan-light); color: var(--cyan); border-color: rgba(8,145,178,0.15); }
    .section-title { font-family: 'Satoshi', sans-serif; font-size: clamp(36px,5vw,58px); font-weight: 800; line-height: 1.1; color: var(--text); letter-spacing: -0.025em; }
    .section-title em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .section-title .cyan-em { font-style: normal; background: var(--grad2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    /* SERVICES — pinned scroll-reveal */
    .services-pin { position: relative; height: ${100 + SERVICES_PIN * 100}vh; background: var(--white); padding: 0; }
    .services-stage { position: sticky; top: 0; height: 100vh; height: 100svh; display: flex; align-items: center; overflow: hidden; }
    .services-stage-inner { width: 100%; max-width: 1160px; margin: 0 auto; padding: 0 40px; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 64px; align-items: center; }
    .services-title-col { position: relative; }
    .services-title-col .section-chip { margin-bottom: 22px; }
    .services-title-col .section-title { font-size: clamp(34px, 4vw, 54px); }
    .services-title-sub { font-size: 16px; color: var(--text2); line-height: 1.75; font-weight: 600; margin-top: 20px; max-width: 420px; }
    .services-progress { display: flex; gap: 9px; margin-top: 36px; }
    .services-dot { width: 28px; height: 4px; border-radius: 100px; background: var(--border2); transition: background 0.4s ease, transform 0.4s ease; }
    .services-dot.on { background: var(--grad); transform: scaleY(1.5); }
    /* card stack */
    .services-cards-col { display: flex; flex-direction: column; gap: 16px; }
    .service-card { display: flex; align-items: center; gap: 22px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 22px; padding: 22px 26px; will-change: transform, opacity; box-shadow: 0 10px 30px rgba(124,58,237,0.04); }
    .service-card-icon { width: 58px; height: 58px; flex-shrink: 0; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; background: var(--purple-light); }
    .service-card:nth-child(even) .service-card-icon { background: var(--cyan-light); }
    .service-card-body { flex: 1; }
    .service-card-title { font-family: 'Satoshi', sans-serif; font-size: 19px; font-weight: 800; color: var(--text); line-height: 1.25; }
    .service-card-desc { font-size: 14.5px; color: var(--text2); line-height: 1.6; font-weight: 600; margin-top: 6px; }
    .service-card-num { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: var(--border2); letter-spacing: 0.04em; flex-shrink: 0; }
    /* CTA section that follows the pin */
    .services-cta-section { background: var(--white); padding: 40px 40px 120px; }

    /* INDUSTRIES — pinned rotating digital globe + orbiting cards */
    .industries-pin { position: relative; height: ${100 + INDUSTRIES_PIN * 100}vh; background: var(--bg2); padding: 0; }
    .industries-stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: flex; flex-direction: column; align-items: center; background: radial-gradient(ellipse 80% 60% at 50% 60%, #ffffff 0%, var(--bg2) 70%); }
    .industries-heading { text-align: center; padding: 92px 24px 0; position: relative; z-index: 3; }
    .industries-heading .section-title { font-size: clamp(32px, 4.5vw, 54px); }
    /* orbit field */
    .orbit { position: relative; flex: 1; width: 100%; max-width: 760px; }
    .orbit-glow { position: absolute; left: 50%; top: 50%; width: 360px; height: 360px; transform: translate(-50%,-50%); background: radial-gradient(circle, rgba(34,211,238,0.18), rgba(124,58,237,0.08) 50%, transparent 72%); filter: blur(30px); pointer-events: none; }
    .globe { position: absolute; left: 50%; top: 50%; width: 250px; height: 250px; will-change: transform; filter: drop-shadow(0 20px 50px rgba(8,145,178,0.22)); }
    .globe svg { width: 100%; height: 100%; display: block; }
    .globe-ring { position: absolute; left: 50%; top: 50%; width: 330px; height: 330px; border: 1.5px dashed rgba(8,145,178,0.3); border-radius: 50%; will-change: transform; }
    .orbit-card { position: absolute; left: 50%; top: 50%; width: 158px; display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 18px 14px; background: rgba(255,255,255,0.85); backdrop-filter: blur(10px); border: 1.5px solid var(--border); border-radius: 20px; box-shadow: 0 14px 34px rgba(8,145,178,0.1); will-change: transform, opacity; }
    .orbit-card-icon { font-size: 28px; }
    .orbit-card-label { font-family: 'Satoshi', sans-serif; font-size: 13.5px; font-weight: 800; color: var(--text); text-align: center; line-height: 1.3; }
    /* mobile fallback hidden on desktop */
    .industries-fallback { display: none; }
    .orbit-card-static { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 20px 14px; background: var(--white); border: 1.5px solid var(--border); border-radius: 20px; box-shadow: 0 12px 30px rgba(8,145,178,0.08); }



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
      #hero { padding: 0; }
      .hero-stage { padding-bottom: 40px; }
      /* Services — unpin and stack on tablet/mobile */
      .services-pin { height: auto; }
      .services-stage { position: static; height: auto; padding: 72px 0; }
      .services-stage-inner { grid-template-columns: 1fr; gap: 32px; padding: 0 20px; }
      .services-title-sub { max-width: 100%; }
      .service-card { opacity: 1 !important; transform: none !important; }
      /* Industries — unpin, static globe + grid */
      .industries-pin { height: auto; }
      .industries-stage { position: static; height: auto; padding-bottom: 72px; }
      .orbit { display: none; }
      .industries-fallback { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: 100%; max-width: 520px; margin: 40px auto 0; padding: 0 20px; }
      .phone-cta { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 48px; }
      /* Makeover entrance video on mobile */
      .mk-show-copy { top: 80px; padding: 0 16px; }
      .mk-show-media { height: auto; width: 94vw; }
      .mk-show-video { height: auto; width: 100%; }
      .phone-copy { max-width: 560px; }
      .phone-copy-actions { justify-content: center; }
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
      .hero-stage { padding: 92px 16px 36px; }
      .hero-title { font-size: clamp(42px, 12vw, 64px); letter-spacing: 0.04em; }
      .hero-title-grad { font-size: inherit; -webkit-text-stroke-width: 1.5px; }
      .hero-tagline { font-size: 14px; margin-top: 14px; }
      .hero-cta { flex-direction: column; align-items: center; gap: 12px; width: 100%; }
      .btn-hero { width: 100% !important; padding: 17px 24px !important; font-size: 15px !important; text-align: center; }
      .hero-kicker { font-size: 10px; letter-spacing: 0.16em; padding: 8px 16px; }
      .hero-scroll-cue { display: none; }
      /* Services */
      .service-card { padding: 18px 18px; gap: 16px; }
      .service-card-icon { width: 50px; height: 50px; font-size: 22px; }
      .service-card-title { font-size: 17px; }
      .service-card-num { font-size: 24px; }
      /* Phone */
      .phone-cta { gap: 40px; }
      .phone-device { width: 300px; padding: 12px; border-radius: 52px; }
      .phone-screen { width: 276px; border-radius: 42px; }
      /* Industries */
      .industries-fallback { grid-template-columns: 1fr 1fr; }
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
      .phone-device { width: 270px; }
      .phone-screen { width: 246px; }
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

    /* ── MAKEOVERS PAGE — large scroll-scrubbed makeover video ── */
    .mk-page { background: #f9f9ed; }
    .mk-show-pin { position: relative; height: ${100 + SHOW_SCRUB * 100}vh; background: #f9f9ed; padding: 0; }
    .mk-show-stage { position: sticky; top: 0; height: 100vh; height: 100svh; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #f9f9ed; }
    /* title overlaid at the top, fades out as you scroll into the video */
    .mk-show-copy { position: absolute; top: 96px; left: 0; right: 0; z-index: 5; text-align: center; pointer-events: none; animation: fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
    .mk-show-chip { display: inline-flex; align-items: center; gap: 9px; padding: 8px 20px; border-radius: 100px; background: var(--grad); color: #fff; font-size: 11px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 16px; box-shadow: 0 8px 24px rgba(124,58,237,0.3); }
    .mk-show-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(44px, 6vw, 92px); line-height: 0.9; letter-spacing: 0.03em; color: var(--text); }
    .mk-show-title em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    /* BIG video, centered, matched cream bg with feathered edges so it reads seamless and high-res */
    .mk-show-media { position: relative; z-index: 2; height: min(92vh, 980px); display: flex; align-items: center; justify-content: center; }
    .mk-show-video { height: 100%; width: auto; max-width: 94vw; display: block; transition: opacity 0.6s ease; -webkit-mask-image: radial-gradient(ellipse 86% 86% at 50% 50%, #000 70%, transparent 97%); mask-image: radial-gradient(ellipse 86% 86% at 50% 50%, #000 70%, transparent 97%); }
    .mk-scroll-cue { position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 6; display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--muted); font-size: 10px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; pointer-events: none; }
    .mk-scroll-cue span { display: block; width: 1.5px; height: 42px; background: linear-gradient(to bottom, transparent, var(--purple)); animation: scrollCue 1.8s ease-in-out infinite; }

    /* CTA */
    .mk-cta-section { background: #f9f9ed; padding: 30px 40px 120px; }
    .mk-cta { text-align: center; max-width: 560px; margin: 0 auto; background: var(--white); border: 1.5px solid var(--border); border-radius: 28px; padding: 52px 40px; position: relative; overflow: hidden; }
    .mk-cta::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--grad); }
    .mk-cta-title { font-family: 'Satoshi', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
    .mk-cta-title em { font-style: normal; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .mk-cta p { font-size: 16px; color: var(--text2); font-weight: 600; margin: 14px auto 28px; }
  `;

  // Hero scrub: 0 = top of page, 1 = sticky stage about to release
  const heroProgress = windowHeight > 0 ? Math.min(Math.max(scrollY / (windowHeight * HERO_SCRUB_DISTANCE), 0), 1) : 0;
  // Scroll choreography: headline exits first, CTAs linger, video slowly zooms; the moment the
  // scrub completes the stage unpins and the next section scrolls straight in (white-on-white, no seam)
  const heroContentFade = Math.max(0, 1 - Math.max(0, heroProgress - 0.18) * 3.2);
  const heroCtaFade = Math.max(0, 1 - Math.max(0, heroProgress - 0.55) * 4);
  const heroVideoScale = 1 + heroProgress * 0.015;

  // Pinned services: scroll travel through the section drives the card reveal
  const servicesProgress = windowHeight > 0
    ? Math.min(Math.max((scrollY - servicesTop) / (windowHeight * SERVICES_PIN), 0), 1)
    : 0;
  // Each card eases in one after another across the pinned scroll
  const cardReveal = (i: number) => {
    const start = 0.06 + i * 0.15;
    return Math.min(Math.max((servicesProgress - start) / 0.22, 0), 1);
  };

  // Pinned industries: scroll drives the globe spin and the orbiting card ring
  const industriesProgress = windowHeight > 0
    ? Math.min(Math.max((scrollY - industriesTop) / (windowHeight * INDUSTRIES_PIN), 0), 1)
    : 0;
  const globeSpin = industriesProgress * 300;        // digital globe rotates as you scroll
  const ringSpin = -26 + industriesProgress * 52;    // the orbit of cards rotates around it
  // Each industry card pops + spins in, one after another, in sync with the rotation
  const orbitReveal = (i: number) => {
    const start = i * 0.12;
    return Math.min(Math.max((industriesProgress - start) / 0.26, 0), 1);
  };

  // makeover showcase scrub progress (entrance video sits at top of the page)
  const showProgress = windowHeight > 0 ? Math.min(Math.max((scrollY - showTop) / (windowHeight * SHOW_SCRUB), 0), 1) : 0;

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
      <nav className={currentPage === "makeovers" ? "" : scrollY > 60 ? "scrolled" : ""}>
        <button onClick={() => goTo("home")} className="nav-brand" style={{ border:"none", cursor:"pointer", padding:0 }}>ZJ Digital</button>
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

      {/* HERO — full-bleed scroll-scrubbed video */}
      <section id="hero">
        <div className="hero-stage">
          {/* the video IS the hero — scrubbing it with scroll rotates the pill */}
          <div
            className="hero-video-box"
            style={{ opacity: heroVideoReady ? 1 : 0, transform: `translate(-50%, -50%) scale(${heroVideoScale})` }}
          >
            <video
              ref={heroVideoRef}
              className="hero-video"
              src="/hero-video.mp4"
              muted
              playsInline
              preload="auto"
              onLoadedMetadata={() => setHeroVideoReady(true)}
            />
          </div>
          <div className="hero-vignette" />

          {/* headline pinned to the top — recedes as you scroll, keeping the animation clear */}
          <div
            className="hero-content"
            style={{
              transform: `translate3d(0, ${heroProgress * -70}px, 0)`,
              opacity: heroContentFade,
              pointerEvents: heroContentFade < 0.3 ? "none" : "auto",
            }}
          >
            <div className="hero-kicker">AI-Powered Brand Studio</div>
            <h1 className="hero-title">
              Make Your Brand
              <span className="hero-title-grad">Impossible to Ignore</span>
            </h1>
            <p className="hero-tagline">We create viral short-form content using AI that drives views, followers, and sales.</p>
          </div>

          {/* CTAs anchored low so the animation stays in view */}
          <div
            className="hero-cta"
            style={{
              transform: `translate3d(0, ${heroProgress * 30}px, 0)`,
              opacity: heroCtaFade,
              pointerEvents: heroCtaFade < 0.3 ? "none" : "auto",
            }}
          >
            <a href="#contact" className="btn-dark btn-hero">Claim My FREE Visual Makeover</a>
            <a href="#services" className="btn-ghost btn-hero">See What We Do</a>
          </div>

          {/* scroll cue */}
          <div className="hero-scroll-cue" style={{ opacity: Math.max(0, 1 - heroProgress * 7) }}>
            Scroll
            <span />
          </div>
        </div>
      </section>

      {/* SERVICES — pinned scroll-reveal: sticky title, cards stack in one by one */}
      <section id="services" ref={servicesRef} className="services-pin">
        <div className="services-stage">
          <div className="services-stage-inner">
            <div className="services-title-col">
              <div className="section-chip">What We Do</div>
              <h2 className="section-title">AI Visuals <em>Built</em> to Sell</h2>
              <p className="services-title-sub">Every service is designed to make your brand look premium, professional, and impossible to scroll past.</p>
              <div className="services-progress">
                {services.map((_, i) => (
                  <span key={i} className={`services-dot${cardReveal(i) > 0.5 ? " on" : ""}`} />
                ))}
              </div>
            </div>
            <div className="services-cards-col">
              {services.map((s, i) => {
                const r = cardReveal(i);
                return (
                  <div
                    key={s.title}
                    className="service-card"
                    style={{
                      opacity: r,
                      transform: `translateY(${(1 - r) * 46}px)`,
                    }}
                  >
                    <div className="service-card-icon">{s.icon}</div>
                    <div className="service-card-body">
                      <div className="service-card-title">{s.title}</div>
                      <p className="service-card-desc">{s.desc}</p>
                    </div>
                    <div className="service-card-num">{String(i + 1).padStart(2, "0")}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES CTA */}
      <section className="services-cta-section">
        <div className="section-inner">
          <div className="phone-cta">
            {/* Left: clean call-to-action */}
            <div className="phone-copy zj-animate">
              <div className="section-chip">Get Started</div>
              <h3>Turn Your Content Into a <em>Growth Machine</em></h3>
              <p>Join 500+ brands that already look premium online. Premium AI visuals, delivered in days — not months.</p>
              <div className="phone-copy-actions">
                <button onClick={() => goTo("intake")} className="btn-dark btn-hero">Start Your Project</button>
                <a href={CALENDLY_LINK} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-hero">Book a Call</a>
              </div>
            </div>

            {/* Right: realistic retina phone */}
            <div className="phone-stage zj-animate zj-delay-2">
              <div className="phone-glow" />
              <div ref={phoneRef} className={`phone-device${phoneShaking ? " phone-buzz" : ""}`}>
                <span className="phone-btn-mute" />
                <span className="phone-btn-volup" />
                <span className="phone-btn-voldown" />
                <span className="phone-btn-power" />
                <div className="phone-screen">
                  <div className="phone-island"><span className="phone-island-cam" /></div>
                  <div className="phone-glass" />
                  <div className="phone-ui">
                    <div className="phone-status">
                      <span className="phone-time">9:41</span>
                      <div className="phone-status-icons">
                        <div className="phone-signal"><span/><span/><span/><span/></div>
                        <span className="phone-wifi" />
                        <div className="phone-batt"><div className="phone-batt-fill" /></div>
                      </div>
                    </div>
                    <div className="phone-app">
                      <div className="phone-app-icon">✦</div>
                      <div className="phone-app-name">ZJ Digital</div>
                      <p className="phone-app-sub">Your brand, premium — on every platform.</p>
                      <a href="#contact" className="phone-app-cta">Claim Free Makeover</a>
                      <div className="phone-app-trust">
                        <span className="phone-app-stars">★★★★★</span>
                        <span>Trusted by 500+ brands</span>
                      </div>
                    </div>
                    <div className="phone-homebar" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES — pinned: rotating digital globe with orbiting "who it's for" cards */}
      <section id="industries" ref={industriesRef} className="industries-pin">
        <div className="industries-stage">
          <div className="industries-heading">
            <div className="section-chip cyan">Who We Help</div>
            <h2 className="section-title">Built for Brands That <span className="cyan-em">Sell Online</span></h2>
          </div>

          {/* desktop: rotating globe + orbiting cards */}
          <div className="orbit">
            <div className="orbit-glow" />
            <div className="globe-ring" style={{ transform: `translate(-50%,-50%) rotate(${-globeSpin * 0.6}deg)` }} />
            <div className="globe" style={{ transform: `translate(-50%,-50%) rotate(${globeSpin}deg)` }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="globeFill" cx="42%" cy="38%" r="68%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="62%" stopColor="#eafdff" />
                    <stop offset="100%" stopColor="#dcf5fb" />
                  </radialGradient>
                  <linearGradient id="globeLine" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="90" fill="url(#globeFill)" stroke="url(#globeLine)" strokeWidth="1.5" opacity="0.9" />
                {/* latitude lines */}
                <ellipse cx="100" cy="100" rx="90" ry="30" fill="none" stroke="url(#globeLine)" strokeWidth="1" opacity="0.45" />
                <ellipse cx="100" cy="100" rx="90" ry="62" fill="none" stroke="url(#globeLine)" strokeWidth="1" opacity="0.35" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="url(#globeLine)" strokeWidth="1" opacity="0.45" />
                {/* meridian lines */}
                <ellipse cx="100" cy="100" rx="30" ry="90" fill="none" stroke="url(#globeLine)" strokeWidth="1" opacity="0.45" />
                <ellipse cx="100" cy="100" rx="62" ry="90" fill="none" stroke="url(#globeLine)" strokeWidth="1" opacity="0.35" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="url(#globeLine)" strokeWidth="1" opacity="0.45" />
                {/* digital nodes */}
                {[[100,10],[100,190],[10,100],[190,100],[38,46],[162,46],[38,154],[162,154],[100,100]].map((p,i)=>(
                  <circle key={i} cx={p[0]} cy={p[1]} r={i===8?4:3} fill="#22d3ee">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (i % 4) * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                ))}
              </svg>
            </div>

            {industries.map((ind, i) => {
              const baseAngle = i * 60;
              const pop = orbitReveal(i);
              const a = baseAngle + ringSpin;
              return (
                <div
                  key={ind.label}
                  className="orbit-card"
                  style={{
                    transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-230px) rotate(${-a + (1 - pop) * -50}deg) scale(${0.5 + pop * 0.5})`,
                    opacity: pop,
                  }}
                >
                  <span className="orbit-card-icon">{ind.icon}</span>
                  <span className="orbit-card-label">{ind.label}</span>
                </div>
              );
            })}
          </div>

          {/* mobile fallback: static globe + grid */}
          <div className="industries-fallback">
            {industries.map((ind) => (
              <div className="orbit-card-static" key={ind.label}>
                <span className="orbit-card-icon">{ind.icon}</span>
                <span className="orbit-card-label">{ind.label}</span>
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

      {/* ── MAKEOVERS PAGE — large scroll-scrubbed makeover video ── */}
      {currentPage === "makeovers" && (
        <div className="mk-page">
          <section className="mk-show-pin" ref={showSectionRef}>
            <div className="mk-show-stage">
              <div className="mk-show-copy" style={{ opacity: Math.max(0, 1 - showProgress * 2.2) }}>
                <div className="mk-show-chip">This is a makeover</div>
                <h1 className="mk-show-title">A Brand, <em>In Motion</em></h1>
              </div>
              <div className="mk-show-media">
                <video
                  ref={mkShowRef}
                  className="mk-show-video"
                  src="/makeover-dense.mp4"
                  muted
                  playsInline
                  preload="auto"
                  onLoadedMetadata={() => setMkShowReady(true)}
                  style={{ opacity: mkShowReady ? 1 : 0 }}
                />
              </div>
              <div className="mk-scroll-cue" style={{ opacity: Math.max(0, 1 - showProgress * 7) }}>
                Scroll<span />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mk-cta-section">
            <div className="mk-cta">
              <h2 className="mk-cta-title">Ready for Your Own <em>Makeover?</em></h2>
              <p>Delivered within 48 hours. Unlimited revisions until you love it.</p>
              <button onClick={() => goTo("intake")} className="btn-dark btn-hero">Start Your Project</button>
            </div>
          </section>
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
