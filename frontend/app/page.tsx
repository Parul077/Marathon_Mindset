"use client";

import SmartCTA from "./components/SmartCTA";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [scrolled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 },
    );
    document
      .querySelectorAll("[data-animate]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const POEM_STANZAS = [
    [
      "I watch the moon in quiet skies,",
      "A silver dream where wonder lies,",
      "It never asks to always shine,",
      "Yet still, its beauty feels divine.",
    ],
    [
      "Some nights it glows so full, so bright,",
      "Some nights it fades into the night,",
      "Yet never once does it pretend,",
      "To be complete from end to end.",
    ],
    [
      "And in that glow, I came to see,",
      "A truth it softly gave to me —",
      "If even the moon can lose its light,",
      "Why must I win each single fight?",
    ],
    [
      "Why must I always stand so tall,",
      "Never stumble, never fall?",
      "When even stars will dim and rest,",
      "Why must I always be my best?",
    ],
    [
      "Life isn't meant to rush or race,",
      "Or chase another's hurried pace,",
      "Each soul has roads it walks alone,",
      "Each seed has time to be full-grown.",
    ],
    [
      "So I will grow, but at my speed,",
      "Not driven by another's need,",
      "No more comparing, no more fear,",
      "My path is mine, my way is clear.",
    ],
    [
      "Like the moon, I'll softly be —",
      "Not perfect, just beautifully me. 🌙✨",
    ],
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #F5F0E8;
          --cream-dark: #EDE5D4;
          --forest: #1E3A2F;
          --forest-mid: #2D5240;
          --forest-light: #4A7C5F;
          --sage: #8BAF8D;
          --sage-light: #B8D4BA;
          --amber: #C4793A;
          --amber-light: #E8A96A;
          --text-primary: #1A2E24;
          --text-muted: #5A7A65;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: var(--cream);
          color: var(--text-primary);
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 2.5rem;
          transition: all 0.4s ease;
        }
        .nav.scrolled {
          background: rgba(245, 240, 232, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(139, 175, 141, 0.3);
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 700;
          color: var(--forest); letter-spacing: -0.02em;
          display: flex; align-items: center; gap: 0.5rem;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .nav-logo-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); flex-shrink: 0; }

        /* Desktop nav links */
        .nav-links {
          display: flex; align-items: center; gap: 2rem; list-style: none;
        }
        .nav-links a {
          font-size: 0.875rem; font-weight: 400;
          color: var(--text-muted); text-decoration: none;
          letter-spacing: 0.01em; transition: color 0.2s;
          white-space: nowrap;
        }
        .nav-links a:hover { color: var(--forest); }

        /* Desktop CTA */
        .nav-cta-wrap { flex-shrink: 0; }

        /* Hamburger button — hidden on desktop */
        .nav-hamburger {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; width: 40px; height: 40px;
          background: transparent; border: 1px solid rgba(30,58,47,0.15);
          border-radius: 10px; cursor: pointer; padding: 0;
          flex-shrink: 0;
        }
        .nav-hamburger span {
          display: block; width: 18px; height: 1.5px;
          background: var(--forest); border-radius: 2px;
          transition: all 0.3s ease;
        }
        .nav-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .nav-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile dropdown menu */
        .nav-mobile-menu {
          position: fixed; top: 0; left: 0; right: 0;
          background: rgba(245, 240, 232, 0.98);
          backdrop-filter: blur(16px);
          padding: 5rem 2rem 2rem;
          z-index: 90;
          transform: translateY(-110%);
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid rgba(139,175,141,0.2);
          box-shadow: 0 8px 32px rgba(30,58,47,0.08);
        }
        .nav-mobile-menu.open { transform: translateY(0); }
        .nav-mobile-links { list-style: none; display: flex; flex-direction: column; gap: 0; margin-bottom: 1.5rem; }
        .nav-mobile-links li a {
          display: block; padding: 1rem 0;
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem; font-weight: 700;
          color: var(--forest); text-decoration: none;
          border-bottom: 1px solid rgba(30,58,47,0.06);
          transition: color 0.2s, padding-left 0.2s;
        }
        .nav-mobile-links li a:hover { color: var(--amber); padding-left: 4px; }
        .nav-mobile-cta { margin-top: 0.5rem; }

        /* ── RESPONSIVE BREAKPOINTS ── */
        @media (max-width: 768px) {
          .nav { padding: 1rem 1.25rem; }
          .nav-links { display: none; }
          .nav-cta-wrap { display: none; }
          .nav-hamburger { display: flex; }
        }
        @media (min-width: 769px) {
          .nav-mobile-menu { display: none !important; }
        }

        /* ── HERO ── */
        .hero {
          min-height: 100vh; display: flex; align-items: center;
          position: relative; overflow: hidden; padding: 8rem 2.5rem 5rem;
        }
        .hero-bg-circle { position: absolute; border-radius: 50%; pointer-events: none; }
        .hero-bg-circle-1 {
          width: 600px; height: 600px; top: -100px; right: -150px;
          background: radial-gradient(circle, rgba(139,175,141,0.18) 0%, transparent 70%);
          animation: float1 8s ease-in-out infinite;
        }
        .hero-bg-circle-2 {
          width: 400px; height: 400px; bottom: -50px; left: -100px;
          background: radial-gradient(circle, rgba(196,121,58,0.1) 0%, transparent 70%);
          animation: float2 10s ease-in-out infinite;
        }
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,-20px)} }
        .hero-inner {
          max-width: 1200px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
        }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--forest-light);
          background: rgba(74, 124, 95, 0.1); border: 1px solid rgba(74, 124, 95, 0.2);
          padding: 0.35rem 0.9rem; border-radius: 100px; margin-bottom: 1.75rem;
        }
        .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:var(--sage); }
        .hero-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 5vw, 4.2rem); font-weight: 700;
          line-height: 1.1; color: var(--forest); letter-spacing: -0.03em; margin-bottom: 1.5rem;
        }
        .hero-heading em { font-style: italic; color: var(--amber); }
        .hero-sub {
          font-size: 1.1rem; font-weight: 300; line-height: 1.7;
          color: var(--text-muted); max-width: 480px; margin-bottom: 2.5rem;
        }
        .hero-actions { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.6rem;
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 500;
          color: var(--cream); background: var(--forest);
          padding: 0.85rem 2rem; border-radius: 100px;
          text-decoration: none; border: none; cursor: pointer; transition: all 0.25s ease;
        }
        .btn-primary:hover { background: var(--forest-mid); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(30,58,47,0.25); }
        .btn-ghost {
          font-size: 0.9rem; font-weight: 400; color: var(--text-muted);
          text-decoration: none; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s;
        }
        .btn-ghost:hover { color: var(--forest); }

        /* Hero visual */
        .hero-visual { position: relative; animation: fadeSlideUp 0.9s ease 0.3s both; }
        .hero-card-main {
          background: var(--forest); border-radius: 24px; padding: 2rem;
          color: var(--cream); position: relative; overflow: hidden;
        }
        .hero-card-main::before {
          content: ''; position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.04);
        }
        .hc-label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--sage); margin-bottom: 1rem; }
        .hc-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; line-height: 1.3; margin-bottom: 1.5rem; }
        .hc-streak-row { display: flex; gap: 0.4rem; margin-bottom: 1.5rem; }
        .streak-day {
          flex: 1; height: 36px; border-radius: 6px;
          background: rgba(255,255,255,0.08); display: flex; align-items: center;
          justify-content: center; font-size: 0.65rem; color: rgba(255,255,255,0.4);
        }
        .streak-day.done { background: var(--forest-light); color: var(--cream); }
        .streak-day.today { background: var(--amber); color: var(--cream); }
        .hc-progress-bar-bg { background: rgba(255,255,255,0.1); border-radius: 100px; height: 6px; margin-bottom: 0.5rem; }
        .hc-progress-bar-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, var(--sage) 0%, var(--amber-light) 100%);
          width: 68%; animation: growBar 1.5s ease 1s both;
        }
        @keyframes growBar { from{width:0} to{width:68%} }
        .hc-progress-label { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--sage); }
        .hero-card-mini {
          position: absolute; background: white; border-radius: 16px;
          padding: 1rem 1.25rem; box-shadow: 0 8px 32px rgba(30,58,47,0.12);
          animation: floatCard 4s ease-in-out infinite;
        }
        .hero-card-mini-1 { top: -1.5rem; left: -2rem; animation-delay: 0s; }
        .hero-card-mini-2 { bottom: -1.5rem; right: -1.5rem; animation-delay: 2s; }
        @keyframes floatCard { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .mc-emoji { font-size: 1.2rem; margin-bottom: 0.3rem; }
        .mc-label { font-size: 0.7rem; color: #888; }
        .mc-value { font-size: 1rem; font-weight: 500; color: var(--forest); }

        /* ── SHARED ── */
        section { padding: 6rem 2.5rem; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-tag {
          font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--sage); margin-bottom: 1rem; display: block;
        }
        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 700;
          letter-spacing: -0.03em; line-height: 1.15; color: var(--forest); margin-bottom: 1.25rem;
        }
        .section-sub { font-size: 1rem; font-weight: 300; line-height: 1.75; color: var(--text-muted); max-width: 520px; }

        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        .anim-ready { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .anim-ready.visible { opacity: 1; transform: translateY(0); }
        .anim-delay-1 { transition-delay: 0.1s; }
        .anim-delay-2 { transition-delay: 0.22s; }
        .anim-delay-3 { transition-delay: 0.34s; }
        .anim-delay-4 { transition-delay: 0.46s; }

        /* ── FEATURES ── */
        .features-section { background: var(--cream-dark); }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3.5rem; }
        .feature-card {
          background: var(--cream); border-radius: 20px; padding: 2rem;
          border: 1px solid rgba(139,175,141,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative; overflow: hidden;
        }
        .feature-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--sage) 0%, var(--amber) 100%);
          transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(30,58,47,0.1); }
        .feature-card:hover::after { transform: scaleX(1); }
        .feature-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(74,124,95,0.12); display: flex; align-items: center;
          justify-content: center; font-size: 1.3rem; margin-bottom: 1.25rem;
        }
        .feature-title { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: var(--forest); margin-bottom: 0.6rem; }
        .feature-desc { font-size: 0.9rem; line-height: 1.7; color: var(--text-muted); font-weight: 300; }

        /* ── PHILOSOPHY ── */
        .philosophy-section { background: var(--forest); }
        .philosophy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3.5rem; }
        .philosophy-item { border-top: 1px solid rgba(139,175,141,0.25); padding-top: 1.5rem; }
        .philosophy-num { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 700; color: rgba(139,175,141,0.2); line-height: 1; margin-bottom: 0.75rem; }
        .philosophy-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--cream); margin-bottom: 0.6rem; }
        .philosophy-desc { font-size: 0.9rem; line-height: 1.7; color: var(--sage-light); font-weight: 300; }

        /* ── POEM SECTION ── */
        .poem-section {
          background: #111F18;
          padding: 7rem 2.5rem;
          position: relative;
          overflow: hidden;
        }
        .poem-section::before {
          content: '';
          position: absolute;
          top: -200px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,175,141,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .poem-section::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(196,121,58,0.05) 0%, transparent 70%);
          pointer-events: none;
        }
        .poem-inner {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .poem-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(139,175,141,0.5);
          margin-bottom: 3rem;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .poem-eyebrow::before, .poem-eyebrow::after {
          content: '';
          display: block;
          width: 40px;
          height: 1px;
          background: rgba(139,175,141,0.2);
        }
        .poem-moon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 2.5rem;
          animation: moonFloat 4s ease-in-out infinite;
        }
        @keyframes moonFloat { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-10px) rotate(5deg)} }
        .poem-stanza {
          margin-bottom: 2.2rem;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .poem-stanza.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .poem-stanza:nth-child(1) { transition-delay: 0s; }
        .poem-stanza:nth-child(2) { transition-delay: 0.15s; }
        .poem-stanza:nth-child(3) { transition-delay: 0.3s; }
        .poem-stanza:nth-child(4) { transition-delay: 0.45s; }
        .poem-stanza:nth-child(5) { transition-delay: 0.6s; }
        .poem-stanza:nth-child(6) { transition-delay: 0.75s; }
        .poem-stanza:nth-child(7) { transition-delay: 0.9s; }
        .poem-line {
          display: block;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1rem, 2vw, 1.2rem);
          line-height: 1.9;
          color: rgba(245, 240, 232, 0.75);
          letter-spacing: 0.01em;
        }
        .poem-stanza:last-child .poem-line {
          color: rgba(245, 240, 232, 0.95);
          font-size: clamp(1.05rem, 2.2vw, 1.25rem);
        }
        .poem-stanza.highlighted .poem-line {
          color: rgba(196, 121, 58, 0.9);
        }
        .poem-divider {
          width: 1px;
          height: 40px;
          background: rgba(139,175,141,0.2);
          margin: 0 auto 2.2rem;
          opacity: 0;
          transition: opacity 0.8s ease 0.5s;
        }
        .poem-divider.visible { opacity: 1; }
        .poem-attribution {
          margin-top: 3rem;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          color: rgba(139,175,141,0.4);
          font-family: 'DM Sans', sans-serif;
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 1s ease 1s;
        }
        .poem-attribution.visible { opacity: 1; }
        .poem-tagline {
          margin-top: 3.5rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(139,175,141,0.1);
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          color: var(--amber-light);
          font-style: italic;
          line-height: 1.5;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.8s ease 1.2s, transform 0.8s ease 1.2s;
        }
        .poem-tagline.visible { opacity: 1; transform: translateY(0); }

        /* ── JOURNEY ── */
        .journey-steps { display: flex; flex-direction: column; gap: 0; margin-top: 3.5rem; position: relative; }
        .journey-steps::before {
          content: ''; position: absolute; left: 23px; top: 0; bottom: 0;
          width: 1px; background: linear-gradient(to bottom, var(--sage-light) 0%, var(--cream-dark) 100%);
        }
        .journey-step { display: flex; gap: 2rem; padding-bottom: 3rem; position: relative; }
        .step-circle {
          width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
          background: var(--cream); border: 2px solid var(--sage-light);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 1rem;
          font-weight: 700; color: var(--forest-light); position: relative; z-index: 1; transition: all 0.3s;
        }
        .journey-step:hover .step-circle { background: var(--forest); border-color: var(--forest); color: var(--cream); }
        .step-content { padding-top: 0.6rem; }
        .step-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--forest); margin-bottom: 0.4rem; }
        .step-desc { font-size: 0.9rem; line-height: 1.7; color: var(--text-muted); font-weight: 300; max-width: 480px; }

        /* ── STATS ── */
        .stats-section { background: var(--cream-dark); }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem; }
        .stat-card { text-align: center; padding: 2.5rem 1rem; border-radius: 20px; background: var(--cream); border: 1px solid rgba(139,175,141,0.2); }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 700; color: var(--forest); letter-spacing: -0.04em; display: block; margin-bottom: 0.3rem; }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); font-weight: 300; }

        /* ── QUOTE ── */
        .quote-section { background: var(--cream); overflow: hidden; }
        .quote-block { max-width: 760px; margin: 3rem auto 0; text-align: center; }
        .quote-mark { font-family: 'Playfair Display', serif; font-size: 8rem; line-height: 0.5; color: var(--sage-light); opacity: 0.5; display: block; margin-bottom: 1.5rem; }
        .quote-text { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 2.5vw, 2rem); font-style: italic; line-height: 1.5; color: var(--forest); margin-bottom: 2rem; }
        .quote-author { font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); }

        /* ── CTA ── */
        .cta-section { background: var(--forest); text-align: center; padding: 7rem 2.5rem; }
        .cta-section .section-tag { color: var(--sage); display: block; text-align: center; }
        .cta-heading { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3.5rem); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; color: var(--cream); margin: 1rem 0 1.5rem; }
        .cta-heading em { font-style: italic; color: var(--amber-light); }
        .cta-sub { font-size: 1rem; font-weight: 300; line-height: 1.7; color: var(--sage-light); max-width: 500px; margin: 0 auto 2.5rem; }

        /* ── FOOTER ── */
        footer { background: #111F18; padding: 2.5rem; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Playfair Display', serif; font-size: 1rem; color: var(--sage); display: flex; align-items: center; gap: 0.5rem; }
        .footer-copy { font-size: 0.8rem; color: rgba(139,175,141,0.5); font-weight: 300; }
        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a { font-size: 0.8rem; color: rgba(139,175,141,0.5); text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: var(--sage); }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 900px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .philosophy-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
          footer { flex-direction: column; gap: 1rem; text-align: center; }
          .footer-links { justify-content: center; }
          section { padding: 4rem 1.5rem; }
          .poem-section { padding: 5rem 1.5rem; }
        }
        @media (max-width: 768px) {
          .nav { padding: 1rem 1.25rem; }
          .hero { padding: 6rem 1.25rem 4rem; }
          .journey-inner-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>

      {/* ── MOBILE MENU OVERLAY ── */}
      <div className={`nav-mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <ul className="nav-mobile-links">
          <li>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
          </li>
          <li>
            <a href="#philosophy" onClick={() => setMobileMenuOpen(false)}>
              Philosophy
            </a>
          </li>
          <li>
            <a href="#journey" onClick={() => setMobileMenuOpen(false)}>
              How it works
            </a>
          </li>
        </ul>
        <div className="nav-mobile-cta">
          <SmartCTA variant="hero" />
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <span className="nav-logo-dot" />
          Marathon Mindset
        </a>

        {/* Desktop links */}
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#philosophy">Philosophy</a>
          </li>
          <li>
            <a href="#journey">How it works</a>
          </li>
        </ul>

        {/* Desktop CTA */}
        <div className="nav-cta-wrap">
          <SmartCTA variant="nav" />
        </div>

        {/* Mobile hamburger */}
        <button
          className={`nav-hamburger ${mobileMenuOpen ? "open" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-circle hero-bg-circle-1" />
        <div className="hero-bg-circle hero-bg-circle-2" />
        <div className="hero-inner">
          <div style={{ animation: "fadeSlideUp 0.8s ease 0.1s both" }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Personal Growth Platform
            </div>
            <h1 className="hero-heading">
              Grow at your
              <br />
              <em>own pace.</em>
            </h1>
            <p className="hero-sub">
              You don't need to rush. You need to stay consistent. Marathon
              Mindset helps you take small steps and{" "}
              <em style={{ fontStyle: "italic", color: "var(--forest-light)" }}>
                actually see your growth
              </em>{" "}
              — even when it feels invisible.
            </p>
            <div className="hero-actions">
              <SmartCTA variant="hero" />
              <a href="#journey" className="btn-ghost">
                See how it works ↓
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card-mini hero-card-mini-1">
              <div className="mc-emoji">🔥</div>
              <div className="mc-label">Current streak</div>
              <div className="mc-value">14 days</div>
            </div>
            <div className="hero-card-main">
              <div className="hc-label">Today's Progress</div>
              <div className="hc-title">
                You're building
                <br />
                something real.
              </div>
              <div className="hc-streak-row">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    className={`streak-day ${i < 5 ? "done" : i === 5 ? "today" : ""}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="hc-progress-bar-bg">
                <div className="hc-progress-bar-fill" />
              </div>
              <div className="hc-progress-label">
                <span>Weekly goal</span>
                <span>68%</span>
              </div>
            </div>
            <div className="hero-card-mini hero-card-mini-2">
              <div className="mc-emoji">🌱</div>
              <div className="mc-label">Small win today</div>
              <div className="mc-value">Logged ✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="section-inner">
          <span className="section-tag">What you get</span>
          <h2 className="section-heading">
            Everything you need
            <br />
            to grow consistently
          </h2>
          <p className="section-sub">
            Not a todo list. Not a productivity tracker. A system designed
            around how humans actually change — slowly, with setbacks, and
            always forward.
          </p>
          <div className="features-grid">
            {[
              {
                icon: "🌱",
                title: "Today's Focus",
                desc: "One clear, small step every day. No overwhelm. No sprawling task lists. Just the next right thing.",
              },
              {
                icon: "✅",
                title: "Habit Tracker",
                desc: "Build consistency without pressure. Track your streaks, and see the compound effect of small daily actions.",
              },
              {
                icon: "😊",
                title: "Mood Tracker",
                desc: "Understand the emotional patterns behind your progress. Growth isn't linear, and your data knows it.",
              },
              {
                icon: "🏆",
                title: "Small Wins Log",
                desc: "The most powerful feature: recording tiny victories. Confidence is built on evidence, not motivation.",
              },
              {
                icon: "📈",
                title: "GrowVisible™",
                desc: "Our unique system shows you your progress trends even when you can't feel them. You are improving.",
              },
              {
                icon: "🧘",
                title: "Slow Down Mode",
                desc: "Feeling overwhelmed? Simplify everything instantly. Burnout prevention built right into your flow.",
              },
            ].map((f, i) => (
              <div
                key={i}
                id={`feature-${i}`}
                data-animate
                className={`feature-card anim-ready anim-delay-${(i % 3) + 1} ${isVisible(`feature-${i}`) ? "visible" : ""}`}
              >
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy" className="philosophy-section">
        <div className="section-inner">
          <span className="section-tag">Core Philosophy</span>
          <h2 className="section-heading" style={{ color: "var(--cream)" }}>
            This is not a sprint.
          </h2>
          <p className="section-sub">
            Most apps push productivity and create pressure. We do the opposite.
            We help you slow down, see clearly, and move steadily.
          </p>
          <div className="philosophy-grid">
            {[
              {
                num: "01",
                title: "Growth is slow, but real",
                desc: "The best changes in your life happen so gradually you barely notice — until one day, you look back and can't believe how far you've come.",
              },
              {
                num: "02",
                title: "Small steps matter",
                desc: "A 1% improvement every day compounds into something extraordinary over a year. You don't need to leap — you need to step.",
              },
              {
                num: "03",
                title: "Consistency beats intensity",
                desc: "Doing something for 5 minutes every day forever beats doing it for 5 hours once. Sustainability is the strategy.",
              },
              {
                num: "04",
                title: "Everyone has their own timeline",
                desc: "Stop comparing your chapter 1 to someone else's chapter 20. Your pace is valid. Your journey is unique.",
              },
            ].map((p, i) => (
              <div
                key={i}
                id={`philo-${i}`}
                data-animate
                className={`philosophy-item anim-ready anim-delay-${(i % 2) + 1} ${isVisible(`philo-${i}`) ? "visible" : ""}`}
              >
                <div className="philosophy-num">{p.num}</div>
                <div className="philosophy-title">{p.title}</div>
                <p className="philosophy-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POEM SECTION ── */}
      <section className="poem-section">
        <div className="poem-inner">
          <div className="poem-eyebrow">
            The philosophy behind Marathon Mindset
          </div>

          <span className="poem-moon">🌙</span>

          {POEM_STANZAS.map((stanza, si) => (
            <div key={si}>
              <div
                id={`poem-stanza-${si}`}
                data-animate
                className={`poem-stanza ${si === 6 ? "highlighted" : ""} ${isVisible(`poem-stanza-${si}`) ? "visible" : ""}`}
              >
                {stanza.map((line, li) => (
                  <span key={li} className="poem-line">
                    {line}
                  </span>
                ))}
              </div>
              {si === 2 && (
                <div
                  id="poem-divider"
                  data-animate
                  className={`poem-divider ${isVisible("poem-divider") ? "visible" : ""}`}
                />
              )}
            </div>
          ))}

          <p
            id="poem-attribution"
            data-animate
            className={`poem-attribution ${isVisible("poem-attribution") ? "visible" : ""}`}
          >
            — Written by the founder
          </p>

          <p
            id="poem-tagline"
            data-animate
            className={`poem-tagline ${isVisible("poem-tagline") ? "visible" : ""}`}
          >
            "This is what Marathon Mindset is built on.
            <br />
            Grow at your own pace."
          </p>
        </div>
      </section>

      {/* JOURNEY */}
      <section id="journey">
        <div
          className="section-inner journey-inner-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          <div>
            <span className="section-tag">How it works</span>
            <h2 className="section-heading">
              Your journey
              <br />
              from day one
            </h2>
            <p className="section-sub">
              Five clear steps from visitor to consistent grower. No complicated
              setup. No steep learning curve.
            </p>
          </div>
          <div
            id="journey-steps"
            data-animate
            className={`journey-steps anim-ready ${isVisible("journey-steps") ? "visible" : ""}`}
          >
            {[
              {
                step: "1",
                title: "Land & Feel It",
                desc: "Visit Marathon Mindset. Read the words. Feel recognized — because we built this for you, exactly as you are.",
              },
              {
                step: "2",
                title: "Sign Up in 30 Seconds",
                desc: "No lengthy forms. Just your name and a password to get started. Personalization comes next.",
              },
              {
                step: "3",
                title: "Tell Us About Yourself",
                desc: "What do you want to become? Three gentle questions. One personalized journey built just for you.",
              },
              {
                step: "4",
                title: "Enter Your Dashboard",
                desc: "Your home base. Today's focus, habit tracker, journal, and your growing archive of small wins — all in one calm place.",
              },
              {
                step: "5",
                title: "Watch Yourself Grow",
                desc: "Week by week, your streak, tracker, and growth letters show you the progress happening even on the days you can't feel it.",
              },
            ].map((s, i) => (
              <div key={i} className="journey-step">
                <div className="step-circle">{s.step}</div>
                <div className="step-content">
                  <div className="step-title">{s.title}</div>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="section-inner">
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <span className="section-tag" style={{ display: "inline-block" }}>
              The numbers
            </span>
            <h2 className="section-heading">Built for the long run</h2>
          </div>
          <div className="stats-grid">
            {[
              {
                num: "68%",
                label: "of users build a habit in their first 21 days",
              },
              {
                num: "1%",
                label: "daily improvement compounds to 37× growth in a year",
              },
              {
                num: "∞",
                label: "your timeline, your pace, your definition of progress",
              },
            ].map((s, i) => (
              <div
                key={i}
                id={`stat-${i}`}
                data-animate
                className={`stat-card anim-ready anim-delay-${i + 1} ${isVisible(`stat-${i}`) ? "visible" : ""}`}
              >
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="quote-section">
        <div className="section-inner">
          <div
            id="quote"
            data-animate
            className={`quote-block anim-ready ${isVisible("quote") ? "visible" : ""}`}
          >
            <span className="quote-mark">"</span>
            <p className="quote-text">
              Life isn't meant to rush or race, or chase another's hurried pace.
              <br />
              Each seed has time to be full-grown.
            </p>
            <span className="quote-author">— From the founder's poem</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <span className="section-tag">Ready to begin?</span>
        <h2 className="cta-heading">
          Start small.
          <br />
          Stay <em>consistent.</em>
        </h2>
        <p className="cta-sub">
          Join thousands of people who stopped chasing quick results and started
          trusting their own journey.
        </p>
        <SmartCTA variant="footer" />
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--sage)",
              display: "inline-block",
            }}
          />
          Marathon Mindset
        </div>
        <span className="footer-copy">
          © 2026 Marathon Mindset. Grow at your pace.
        </span>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}
