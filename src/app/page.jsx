"use client";
import { useState, useEffect, useRef } from "react";
import HeroDashboard from "./HeroDashboard";

// ─── INJECT FONTS & GLOBAL CSS ───────────────────────────────────────────────
const GlobalStyles = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const meta1 = document.createElement("meta");
    meta1.name = "description";
    meta1.content =
      "MyBusiness – The all-in-one modular business management platform for Indian SMEs. Manage workforce, invoicing, CRM, inventory, finance & more.";
    document.head.appendChild(meta1);

    const meta2 = document.createElement("meta");
    meta2.name = "keywords";
    meta2.content =
      "business management software India, GST invoicing, CRM, inventory management, workforce management, SAAS India, SME software, ERP India";
    document.head.appendChild(meta2);

    const ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    ogTitle.content = "MyBusiness – Modular Business Management Platform";
    document.head.appendChild(ogTitle);

    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = "https://mybusiness.app";
    document.head.appendChild(canonical);

    const style = document.createElement("style");
    
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #06080f; color: #f0f4ff; font-family: overflow-x: hidden; }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: #06080f; }
      ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }

      .font-display { font-family: 'Sora', sans-serif; }
      .text-gradient { background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 40%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .text-gradient-amber { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .text-gradient-blue { background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

      .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
      .glass-hover { transition: all 0.3s ease; }
      .glass-hover:hover { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.3); transform: translateY(-2px); box-shadow: 0 20px 60px rgba(99,102,241,0.15); }

      .btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none; cursor: pointer; transition: all 0.3s ease; position: relative; overflow: hidden; }
      .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #818cf8, #6366f1); opacity: 0; transition: opacity 0.3s; }
      .btn-primary:hover::after { opacity: 1; }
      .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 40px rgba(99,102,241,0.4); }

      .btn-secondary { background: transparent; color: #f0f4ff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: all 0.3s ease; }
      .btn-secondary:hover { border-color: #6366f1; color: #a5b4fc; background: rgba(99,102,241,0.08); }

      .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
      .orb-1 { width: 600px; height: 600px; background: rgba(99,102,241,0.12); top: -200px; left: -200px; }
      .orb-2 { width: 400px; height: 400px; background: rgba(245,158,11,0.08); bottom: -100px; right: -100px; }
      .orb-3 { width: 300px; height: 300px; background: rgba(99,102,241,0.06); top: 50%; left: 50%; transform: translate(-50%,-50%); }

      @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
      @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 50px rgba(99,102,241,0.6); } }
      @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes dash { to { stroke-dashoffset: 0; } }

      .animate-float { animation: float 4s ease-in-out infinite; }
      .animate-fadeInUp { animation: fadeInUp 0.7s ease forwards; }
      .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

      .section-in { opacity: 0; transform: translateY(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
      .section-in.visible { opacity: 1; transform: translateY(0); }

      .module-card { position: relative; overflow: hidden; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .module-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 0%, transparent 100%); opacity: 0; transition: opacity 0.3s; z-index: 0; }
      .module-card:hover { transform: translateY(-6px) scale(1.01); }
      .module-card:hover::before { opacity: 1; }

      .nav-link { position: relative; color: #94a3b8; transition: color 0.2s; font-size: 0.9rem; font-weight: 500; text-decoration: none; }
      .nav-link::after { content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px; background: #6366f1; transition: width 0.3s; }
      .nav-link:hover { color: #f0f4ff; }
      .nav-link:hover::after { width: 100%; }
      .nav-link.active { color: #f0f4ff; }
      .nav-link.active::after { width: 100%; }

      .pricing-card { transition: all 0.4s ease; }
      .pricing-card:hover { transform: translateY(-8px); }
      .pricing-card.featured { border-color: rgba(99,102,241,0.5) !important; animation: pulse-glow 3s ease-in-out infinite; }

      .input-field { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #f0f4ff; transition: all 0.3s; outline: none; }
      .input-field:focus { border-color: #6366f1; background: rgba(99,102,241,0.06); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
      .input-field::placeholder { color: #475569; }

      .tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; border-radius: 100px; font-size: 0.78rem; font-weight: 600; padding: 4px 12px; letter-spacing: 0.05em; text-transform: uppercase; }

      .feature-check { color: #6366f1; display: inline-flex; }

      .progress-bar { height: 3px; background: linear-gradient(90deg, #6366f1, #f59e0b); border-radius: 2px; transition: width 0.3s; }

      .grid-bg { background-image: linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px); background-size: 50px 50px; }

      .hero-badge { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(245,158,11,0.1)); border: 1px solid rgba(99,102,241,0.3); border-radius: 100px; padding: 6px 16px; font-size: 0.8rem; font-weight: 600; color: #a5b4fc; display: inline-flex; align-items: center; gap: 8px; }

      .glow-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse-glow 1.5s ease-in-out infinite; box-shadow: 0 0 8px rgba(34,197,94,0.6); }

      @media (max-width: 768px) {
        .hide-mobile { display: none !important; }
        .show-mobile { display: flex !important; }

        /* Hero grid: single column on mobile */
        .hero-grid { grid-template-columns: 1fr !important; }
        .hero-mockup { display: none !important; }

        /* Features detail grid: stack on mobile */
        .features-detail-grid { grid-template-columns: 1fr !important; }

        /* Contact page: stack columns */
        .contact-grid { grid-template-columns: 1fr !important; }
        .contact-form-grid { grid-template-columns: 1fr !important; }

        /* Footer: single column */
        .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }

        /* Reduce section vertical padding on mobile */
        .section-pad { padding: 60px 5% !important; }
        .section-pad-lg { padding: 72px 5% !important; }

        /* Deep-dive rows: always column on mobile, never reverse */
        .deepdive-row { flex-direction: column !important; }
        .deepdive-row > div { min-width: unset !important; width: 100% !important; }
        .deepdive-row > div:last-child { height: 220px !important; }
      }

      @media (max-width: 480px) {
        .hero-grid { padding: 40px 5% !important; }
        .pricing-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(style);
    return () => {};
  }, []);
  return null;
};

// ─── SVG ILLUSTRATIONS ────────────────────────────────────────────────────────
const WorkforceIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="220" height="140" rx="12" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1"/>
    {[0,1,2].map(i=>(
      <g key={i} transform={`translate(${20+i*72}, 25)`}>
        <circle cx="28" cy="18" r="14" fill={`rgba(99,102,241,${0.2+i*0.1})`} stroke="rgba(99,102,241,0.4)" strokeWidth="1"/>
        <circle cx="28" cy="15" r="7" fill={`rgba(99,102,241,${0.4+i*0.1})`}/>
        <path d="M14 32 Q28 24 42 32" fill={`rgba(99,102,241,${0.3+i*0.1})`}/>
        <rect x="6" y="38" width="44" height="5" rx="2" fill="rgba(255,255,255,0.15)"/>
        <rect x="12" y="47" width="32" height="3" rx="1" fill="rgba(255,255,255,0.08)"/>
      </g>
    ))}
    <rect x="20" y="95" width="200" height="1" fill="rgba(99,102,241,0.2)"/>
    <rect x="20" y="105" width="60" height="6" rx="3" fill="rgba(99,102,241,0.3)"/>
    <rect x="90" y="105" width="40" height="6" rx="3" fill="rgba(245,158,11,0.3)"/>
    <rect x="140" y="105" width="80" height="6" rx="3" fill="rgba(99,102,241,0.15)"/>
    <rect x="20" y="118" width="200" height="4" rx="2" fill="rgba(99,102,241,0.15)"/>
    <rect x="20" y="118" width="130" height="4" rx="2" fill="rgba(99,102,241,0.4)"/>
  </svg>
);

const CRMIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="220" height="140" rx="12" fill="rgba(245,158,11,0.05)" stroke="rgba(245,158,11,0.15)" strokeWidth="1"/>
    <circle cx="120" cy="80" r="30" fill="rgba(245,158,11,0.15)" stroke="rgba(245,158,11,0.4)" strokeWidth="1.5"/>
    <circle cx="120" cy="80" r="12" fill="rgba(245,158,11,0.4)"/>
    {[[55,40],[185,40],[40,110],[200,110],[120,25]].map(([x,y],i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="14" fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.4)" strokeWidth="1"/>
        <circle cx={x} cy={y} r="5" fill="rgba(99,102,241,0.6)"/>
        <line x1={x} y1={y} x2="120" y2="80" stroke="rgba(245,158,11,0.25)" strokeWidth="1" strokeDasharray="4,3"/>
      </g>
    ))}
    <rect x="85" y="125" width="70" height="6" rx="3" fill="rgba(245,158,11,0.3)"/>
    <rect x="95" y="135" width="50" height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
  </svg>
);

const InvoiceIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="30" y="10" width="160" height="140" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(99,102,241,0.2)" strokeWidth="1"/>
    <rect x="30" y="10" width="160" height="30" rx="10" fill="rgba(99,102,241,0.2)"/>
    <rect x="30" y="30" width="160" height="10" fill="rgba(99,102,241,0.2)"/>
    <rect x="42" y="18" width="60" height="6" rx="3" fill="rgba(255,255,255,0.7)"/>
    <rect x="160" y="18" width="18" height="6" rx="3" fill="rgba(245,158,11,0.8)"/>
    {[50,65,80,95,110].map((y,i)=>(
      <g key={i}>
        <rect x="42" y={y} width={40+i*8} height="4" rx="2" fill="rgba(255,255,255,0.12)"/>
        <rect x={170} y={y} width="20" height="4" rx="2" fill="rgba(99,102,241,0.4)"/>
      </g>
    ))}
    <rect x="42" y="125" width="80" height="1" fill="rgba(255,255,255,0.1)"/>
    <rect x="42" y="130" width="50" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
    <rect x="150" y="128" width="38" height="8" rx="4" fill="rgba(34,197,94,0.5)"/>
    <rect x="155" y="131" width="28" height="3" rx="1" fill="rgba(34,197,94,0.8)"/>
  </svg>
);

const InventoryIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="220" height="140" rx="12" fill="rgba(20,184,166,0.05)" stroke="rgba(20,184,166,0.15)" strokeWidth="1"/>
    {[0,1,2].map(row=>[0,1,2,3].map(col=>(
      <rect key={`${row}-${col}`} x={20+col*52} y={20+row*38} width="44" height="30" rx="6"
        fill={`rgba(20,184,166,${0.1+(row*4+col)*0.02})`}
        stroke={`rgba(20,184,166,${0.2+(row*4+col)*0.03})`} strokeWidth="1"/>
    )))}
    <rect x="10" y="140" width="220" height="3" rx="1" fill="rgba(20,184,166,0.4)"/>
    <rect x="10" y="140" width="140" height="3" rx="1" fill="rgba(20,184,166,0.6)"/>
    <circle cx="200" cy="130" r="20" fill="rgba(245,158,11,0.2)" stroke="rgba(245,158,11,0.5)" strokeWidth="1.5"/>
    <text x="200" y="135" textAnchor="middle" fill="rgba(245,158,11,0.9)" fontSize="14" fontWeight="bold">!</text>
  </svg>
);

const FinanceIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="220" height="140" rx="12" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" strokeWidth="1"/>
    <polyline points="20,120 50,90 80,100 110,60 140,75 170,40 200,55 220,35" stroke="rgba(99,102,241,0.8)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="20,120 50,90 80,100 110,60 140,75 170,40 200,55 220,35 220,140 20,140" fill="rgba(99,102,241,0.1)"/>
    <polyline points="20,130 50,115 80,125 110,105 140,115 170,95 200,105 220,90" stroke="rgba(245,158,11,0.6)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,3"/>
    {[20,50,80,110,140,170,200,220].map((x,i)=>{
      const ys=[120,90,100,60,75,40,55,35];
      return <circle key={i} cx={x} cy={ys[i]} r="3" fill="rgba(99,102,241,0.9)"/>;
    })}
    <rect x="20" y="18" width="80" height="16" rx="4" fill="rgba(99,102,241,0.2)"/>
    <rect x="24" y="22" width="45" height="4" rx="2" fill="rgba(99,102,241,0.6)"/>
    <rect x="110" y="18" width="60" height="16" rx="4" fill="rgba(245,158,11,0.15)"/>
    <rect x="114" y="22" width="35" height="4" rx="2" fill="rgba(245,158,11,0.5)"/>
  </svg>
);

const ReportsIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="100" height="65" rx="8" fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.2)" strokeWidth="1"/>
    <rect x="130" y="10" width="100" height="65" rx="8" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.2)" strokeWidth="1"/>
    <rect x="10" y="85" width="220" height="65" rx="8" fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" strokeWidth="1"/>
    {[0,1,2,3,4].map(i=>(
      <rect key={i} x={20+i*16} y={55-i*8} width="10" height={20+i*8} rx="3" fill={`rgba(99,102,241,${0.3+i*0.1})`}/>
    ))}
    <circle cx="180" cy="42" r="22" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="10"/>
    <circle cx="180" cy="42" r="22" fill="none" stroke="rgba(245,158,11,0.7)" strokeWidth="10" strokeDasharray="69 140" strokeLinecap="round" transform="rotate(-90 180 42)"/>
    <circle cx="180" cy="42" r="22" fill="none" stroke="rgba(99,102,241,0.5)" strokeWidth="10" strokeDasharray="35 140" strokeDashoffset="-69" strokeLinecap="round" transform="rotate(-90 180 42)"/>
    {[95,105,115,120,130,140,145].map((y,i)=>(
      <rect key={i} x={20} y={y} width={[140,100,120,80,150,90,110][i]} height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
    ))}
  </svg>
);

const VendorIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="10" y="10" width="220" height="140" rx="12" fill="rgba(168,85,247,0.05)" stroke="rgba(168,85,247,0.15)" strokeWidth="1"/>
    {[[30,40,60,30],[90,30,60,30],[150,30,60,30]].map(([x,y,w,h],i)=>(
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} rx="6" fill={`rgba(168,85,247,${0.1+i*0.05})`} stroke="rgba(168,85,247,0.3)" strokeWidth="1"/>
        <rect x={x+6} y={y+8} width={w-12} height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
        <rect x={x+6} y={y+16} width={w-20} height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
      </g>
    ))}
    <rect x="80" y="75" width="80" height="50" rx="8" fill="rgba(168,85,247,0.15)" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5"/>
    <rect x="88" y="83" width="50" height="5" rx="2" fill="rgba(255,255,255,0.25)"/>
    <rect x="88" y="92" width="35" height="4" rx="2" fill="rgba(255,255,255,0.15)"/>
    <rect x="88" y="105" width="64" height="10" rx="5" fill="rgba(168,85,247,0.5)"/>
    <line x1="60" y1="60" x2="100" y2="78" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeDasharray="4,3"/>
    <line x1="120" y1="58" x2="120" y2="76" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeDasharray="4,3"/>
    <line x1="180" y1="60" x2="145" y2="78" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeDasharray="4,3"/>
  </svg>
);

const QuoteIllustr = () => (
  <svg viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <rect x="30" y="10" width="135" height="140" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(34,197,94,0.2)" strokeWidth="1"/>
    <rect x="30" y="10" width="135" height="28" rx="10" fill="rgba(34,197,94,0.15)"/>
    <rect x="30" y="28" width="135" height="10" fill="rgba(34,197,94,0.15)"/>
    <rect x="42" y="17" width="55" height="5" rx="2" fill="rgba(255,255,255,0.6)"/>
    {[48,63,78,93,108].map((y,i)=>(
      <g key={i}>
        <rect x="42" y={y} width={35+i*8} height="4" rx="2" fill="rgba(255,255,255,0.1)"/>
        <rect x="130" y={y} width="22" height="4" rx="2" fill="rgba(34,197,94,0.35)"/>
      </g>
    ))}
    <rect x="42" y="120" width="110" height="1" fill="rgba(255,255,255,0.1)"/>
    <rect x="42" y="126" width="48" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
    <rect x="100" y="124" width="42" height="10" rx="5" fill="rgba(34,197,94,0.5)"/>
    <g transform="translate(185, 40)">
      <circle cx="20" cy="20" r="18" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" strokeWidth="1.5"/>
      <polyline points="10,20 17,27 30,13" stroke="rgba(34,197,94,0.9)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g transform="translate(185, 90)">
      <circle cx="20" cy="20" r="18" fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5"/>
      <line x1="10" y1="10" x2="30" y2="30" stroke="rgba(245,158,11,0.7)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="10" x2="10" y2="30" stroke="rgba(245,158,11,0.7)" strokeWidth="2" strokeLinecap="round"/>
    </g>
  </svg>
);

// ─── MODULES DATA ─────────────────────────────────────────────────────────────
const MODULES = [
  { id: "workforce", icon: "👥", title: "Workforce", tagline: "HR That Works As Hard As You", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", features: ["Employee profiles & documents", "Biometric attendance tracking", "Leave requests & approvals", "Payroll & salary processing", "Performance reviews"], illustration: <WorkforceIllustr /> },
  { id: "crm", icon: "🤝", title: "CRM / Clients", tagline: "Every Relationship, Perfected", color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", features: ["Client database & contacts", "Interaction history timeline", "Deal tracking pipeline", "Follow-up reminders", "Client activity reports"], illustration: <CRMIllustr /> },
  { id: "quotations", icon: "📋", title: "Quotations", tagline: "Win More Deals, Faster", color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.2)", features: ["Professional quote builder", "Products & services catalog", "GST & discount engine", "One-click Convert → Invoice", "Status tracking & follow-ups"], illustration: <QuoteIllustr /> },
  { id: "invoicing", icon: "🧾", title: "Invoicing", tagline: "Get Paid. On Time. Every Time.", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", features: ["GST-compliant invoices", "Partial payment tracking", "Recurring invoice automation", "Multi-currency support", "Payment reminder emails"], illustration: <InvoiceIllustr /> },
  { id: "inventory", icon: "📦", title: "Inventory", tagline: "Never Run Out. Never Overstock.", color: "#14b8a6", bg: "rgba(20,184,166,0.06)", border: "rgba(20,184,166,0.2)", features: ["Product & service catalog", "Real-time stock tracking", "Stock in/out logs", "Low stock alerts", "Supplier-wise purchase history"], illustration: <InventoryIllustr /> },
  { id: "vendors", icon: "🏪", title: "Vendors & Purchase", tagline: "Smarter Procurement, Happier Vendors", color: "#a855f7", bg: "rgba(168,85,247,0.06)", border: "rgba(168,85,247,0.2)", features: ["Vendor database & KYC", "Purchase order management", "Vendor payment tracking", "Purchase history & reports", "Vendor performance scoring"], illustration: <VendorIllustr /> },
  { id: "finance", icon: "💰", title: "Finance", tagline: "Your Money, Completely Clear", color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", features: ["Income & expense tracking", "Cash flow forecasting", "Profit & loss reports", "Bank reconciliation", "Tax-ready reports"], illustration: <FinanceIllustr /> },
  { id: "reports", icon: "📊", title: "Reports & Analytics", tagline: "Data That Drives Decisions", color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)", features: ["Sales & revenue reports", "Expense breakdown charts", "Employee productivity reports", "Inventory turnover analysis", "Export PDF & Excel"], illustration: <ReportsIllustr /> },
];

const PLANS = [
  { name: "Starter", price: { monthly: 999, annual: 799 }, currency: "₹", color: "#6366f1", description: "Perfect for freelancers and micro-businesses", features: ["3 Modules of your choice", "Up to 5 users", "Basic invoicing with GST", "Client & vendor management", "Email support", "Mobile app access"], cta: "Start Free Trial", featured: false },
  { name: "Growth", price: { monthly: 2499, annual: 1999 }, currency: "₹", color: "#f59e0b", description: "For growing teams that need it all", features: ["All 8 Modules included", "Up to 25 users", "Advanced reporting & analytics", "Inventory & stock alerts", "Automation workflows", "WhatsApp payment reminders", "Priority support", "Custom branding on invoices"], cta: "Start Free Trial", featured: true },
  { name: "Enterprise", price: { monthly: null, annual: null }, currency: "", description: "For large teams with custom needs", features: ["Unlimited modules & users", "Custom integrations & API", "Dedicated account manager", "On-premise deployment option", "Custom workflows & fields", "SLA-backed 24/7 support", "Employee training sessions", "White-label option"], cta: "Contact Sales", featured: false },
];

const TESTIMONIALS = [
  { name: "Rahul Sharma", role: "CEO, TechVentive Pvt Ltd", text: "MyBusiness completely transformed how we manage our team and clients. The invoicing module alone saved us 10 hours a week. Highly recommend for any growing Indian SME.", avatar: "RS" },
  { name: "Priya Patel", role: "CFO, GreenLeaf Exports", text: "The finance and reporting modules give me clarity I never had before. I can see cash flow, P&L, and pending invoices in one dashboard. It's brilliant.", avatar: "PP" },
  { name: "Amir Khan", role: "Founder, BuildRight Construction", text: "Vendor and inventory management in one place is exactly what we needed. Our purchase order process went from 2 days to 20 minutes. Game changer.", avatar: "AK" },
];

const STATS = [
  { value: "5,000+", label: "Businesses" },
  { value: "₹120Cr+", label: "Invoiced Monthly" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "User Rating" },
];



// ─── USEVISIBILITY HOOK ───────────────────────────────────────────────────────
function useVisible(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(6,8,15,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(99,102,241,0.1)" : "none",
      transition: "all 0.4s ease",
      padding: "0 5%",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        {/* Logo */}
        <button onClick={() => { setPage("home"); setMenuOpen(false); window.scrollTo(0,0); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(99,102,241,0.4)" }}>
            <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 16 }}>M</span>
          </div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: "1.15rem", color: "#f0f4ff" }}>
            My<span style={{ color: "#6366f1" }}>Business</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {links.map(l => (
            <button key={l.id} className={`nav-link ${page === l.id ? "active" : ""}`}
              onClick={() => { setPage(l.id); window.scrollTo(0,0); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", padding: 0 }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hide-mobile" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-secondary" style={{ padding: "8px 20px", borderRadius: 8, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem", fontWeight: 600 }}
            onClick={() => window.location.href = "/dashboard"}>
            Log In
          </button>
          <button className="btn-primary" style={{ padding: "8px 20px", borderRadius: 8, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.9rem", fontWeight: 600, position: "relative", zIndex: 1 }}
            onClick={() => window.location.href = "/dashboard"}>
            Start Free Trial
          </button>
        </div>

        {/* Mobile menu button */}
        <button className="show-mobile" style={{ display: "none", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 8 }}
          onClick={() => setMenuOpen(!menuOpen)}>
          {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: "#f0f4ff", borderRadius: 2, transition: "all 0.3s",
            transform: menuOpen ? (i===0?"rotate(45deg) translateY(7px)":i===2?"rotate(-45deg) translateY(-7px)":"scaleX(0)") : "none" }}/>)}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "rgba(6,8,15,0.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(99,102,241,0.1)", padding: "20px 5% 30px" }}>
          {links.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id); setMenuOpen(false); window.scrollTo(0,0); }}
              style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", color: page===l.id ? "#a5b4fc" : "#94a3b8", fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 600, textAlign: "left", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {l.label}
            </button>
          ))}
          <button className="btn-primary" style={{ width: "100%", padding: "12px", borderRadius: 8, marginTop: 16, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 600, position: "relative", zIndex: 1 }}
            onClick={() => { setPage("pricing"); setMenuOpen(false); window.scrollTo(0,0); }}>
            Start Free Trial
          </button>
        </div>
      )}
    </nav>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const [statsRef, statsVis] = useVisible();
  const [modulesRef, modulesVis] = useVisible(0.05);
  const [featRef, featVis] = useVisible(0.1);
  const [howRef, howVis] = useVisible(0.1);
  const [testRef, testVis] = useVisible(0.1);

  return (
    <div>
      {/* Hero */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", paddingTop: 72 }}>
        <div className="orb orb-1"/>
        <div className="orb orb-2"/>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.4 }}/>
        <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 1%", width: "100%", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>

          {/* Left: Text */}
          <div style={{ animation: "fadeInUp 0.8s ease forwards" }}>
            <div className="hero-badge" style={{ marginBottom: 24, width: "fit-content" }}>
              <span className="glow-dot"/>
              Business Management in 1 go.
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3.8rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
              The Business Platform<br/>
              <span className="text-gradient">Built for Bharat</span>
            </h1>
            <p style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.1rem)", color: "#94a3b8", lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              One platform to manage your workforce, clients, invoices, inventory, vendors, and finances. Modular. Scalable. Made for Indian businesses.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
              <button className="btn-primary" style={{ padding: "14px 28px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 700, position: "relative", zIndex: 1 }}
                onClick={() => window.location.href = "/dashboard"}>
                Start Free — No Credit Card
              </button>
              <button className="btn-secondary" style={{ padding: "14px 24px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}
                onClick={() => window.location.href = "/dashboard"}>
                <span>▶</span> Watch Demo
              </button>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["✓ GST Compliant", "✓ Free 14-day trial", "✓ No setup fee", "✓ Works on mobile"].map(t => (
                <span key={t} style={{ color: "#64748b", fontSize: "0.82rem", fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup */}

          <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", marginTop: 4 }}> <HeroDashboard /></div>

        </div>

      </section>

      {/* Stats */}
      <section ref={statsRef} className={`section-in ${statsVis ? "visible" : ""}`} style={{ padding: "50px 5%", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(99,102,241,0.03)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, textAlign: "center" }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div className="font-display text-gradient" style={{ fontSize: "2.4rem", fontWeight: 800 }}>{s.value}</div>
              <div style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section ref={modulesRef} className={`section-in section-pad-lg ${modulesVis ? "visible" : ""}`} style={{ padding: "100px 5%" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="tag">Platform</span>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, margin: "16px 0 16px", lineHeight: 1.2 }}>
              8 Modules. One Platform.<br/><span className="text-gradient">Your Entire Business.</span>
            </h2>
            <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: 540, margin: "0 auto" }}>
              Choose the modules you need. Enable more as you grow. Pay only for what you use.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {MODULES.map((m, i) => (
              <div key={m.id} className="module-card glass glass-hover" style={{
                background: m.bg, border: `1px solid ${m.border}`, borderRadius: 16, padding: 24,
                animationDelay: `${i * 0.07}s`,
                cursor: "pointer"
              }} onClick={() => { setPage("features"); window.scrollTo(0,0); }}>
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>{m.icon}</div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: "1.05rem", color: "#f0f4ff", marginBottom: 6 }}>{m.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 16 }}>{m.tagline}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {m.features.slice(0, 3).map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.82rem", color: "#94a3b8" }}>
                      <span style={{ color: m.color, marginTop: 1, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 20, height: 120, borderRadius: 8, overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
                  {m.illustration}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive */}
      <section ref={featRef} className={`section-in ${featVis ? "visible" : ""}`} style={{ padding: "80px 5%", background: "rgba(99,102,241,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="tag" style={{ background: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }}>Deep Dive</span>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, margin: "16px 0", lineHeight: 1.2 }}>
              Features That <span className="text-gradient-amber">Actually Matter</span>
            </h2>
          </div>
          {[
            { title: "Smart GST Invoicing", body: "Generate professional, GST-compliant invoices in under 30 seconds. Support for CGST, SGST, IGST. Attach payment links, track partial payments, and send automated reminders — all from one screen.", icon: "🧾", stat: "30s", statLabel: "avg. invoice creation time", color: "#6366f1", img: <InvoiceIllustr /> },
            { title: "Real-Time Inventory", body: "Track every product, every movement. Get low-stock alerts before you run out. Reconcile purchases against inventory automatically. Know your stock value at any moment.", icon: "📦", stat: "100%", statLabel: "real-time stock accuracy", color: "#14b8a6", img: <InventoryIllustr /> },
            { title: "Comprehensive Reports", body: "Sales performance, expense breakdown, employee productivity, cash flow forecasts — all in one dashboard. Export to PDF or Excel in one click. Share with your CA or investor instantly.", icon: "📊", stat: "50+", statLabel: "built-in report types", color: "#f59e0b", img: <ReportsIllustr /> },
          ].map((f, i) => (
            <div key={f.title} className="deepdive-row" style={{ display: "flex", flexDirection: i%2===0 ? "row" : "row-reverse", gap: 48, alignItems: "center", marginBottom: 80, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{f.icon}</div>
                <h3 className="font-display" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)", fontWeight: 700, marginBottom: 16, color: "#f0f4ff" }}>{f.title}</h3>
                <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 28, fontSize: "1rem" }}>{f.body}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, background: `${f.color}15`, border: `1px solid ${f.color}25`, borderRadius: 12, padding: "16px 20px", width: "fit-content" }}>
                  <span className="font-display" style={{ fontSize: "2.5rem", fontWeight: 800, color: f.color }}>{f.stat}</span>
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}>{f.statLabel}</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 280, height: 280, borderRadius: 16, border: `1px solid ${f.color}20`, background: `${f.color}06`, overflow: "hidden" }}>
                {f.img}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section ref={howRef} className={`section-in ${howVis ? "visible" : ""}`} style={{ padding: "80px 5%" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span className="tag">Process</span>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, margin: "16px 0 60px", lineHeight: 1.2 }}>
            Up & Running in <span className="text-gradient">Under 10 Minutes</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {[
              { step: "01", title: "Sign Up Free", body: "Create your account in 30 seconds. No credit card required. Start your 14-day full-access trial instantly.", icon: "✍️" },
              { step: "02", title: "Pick Your Modules", body: "Choose only the modules you need today. Add more as your business grows. Full flexibility, always.", icon: "🧩" },
              { step: "03", title: "Import & Go Live", body: "Import your existing clients, products, and employees. Our onboarding wizard guides you through every step.", icon: "🚀" },
            ].map((s, i) => (
              <div key={s.step} className="glass glass-hover" style={{ borderRadius: 16, padding: 32, position: "relative" }}>
                <div style={{ position: "absolute", top: 20, right: 20, fontFamily: "Sora, sans-serif", fontSize: "3rem", fontWeight: 900, color: "rgba(99,102,241,0.1)", lineHeight: 1 }}>{s.step}</div>
                <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>{s.icon}</div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 12, color: "#f0f4ff" }}>{s.title}</h3>
                <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.9rem" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testRef} className={`section-in ${testVis ? "visible" : ""}`} style={{ padding: "80px 5%", background: "rgba(99,102,241,0.02)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span className="tag" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.3)", color: "#86efac" }}>Testimonials</span>
            <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, margin: "16px 0" }}>
              Trusted by <span className="text-gradient">5,000+ Businesses</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="glass glass-hover" style={{ borderRadius: 16, padding: 28 }}>
                <div style={{ color: "#f59e0b", fontSize: "1.2rem", marginBottom: 16 }}>★★★★★</div>
                <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 24, fontSize: "0.92rem" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "white" }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#f0f4ff" }}>{t.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: "100px 5%", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div className="orb orb-3"/>
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Ready to Transform<br/><span className="text-gradient">Your Business?</span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: 40, lineHeight: 1.7 }}>
            Join 5,000+ Indian businesses already using MyBusiness. Start free today — no credit card required.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ padding: "16px 40px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1.05rem", fontWeight: 700, position: "relative", zIndex: 1 }}
              onClick={() => { setPage("pricing"); window.scrollTo(0,0); }}>
              Start Free Trial →
            </button>
            <button className="btn-secondary" style={{ padding: "16px 32px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 600 }}
              onClick={() => { setPage("contact"); window.scrollTo(0,0); }}>
              Talk to Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── FEATURES PAGE ────────────────────────────────────────────────────────────
function FeaturesPage({ setPage }) {
  const [active, setActive] = useState("workforce");
  const mod = MODULES.find(m => m.id === active);

  return (
    <div style={{ paddingTop: 100 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="tag">All Features</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, margin: "16px 0", lineHeight: 1.2 }}>
            Everything You Need,<br/><span className="text-gradient">Nothing You Don't</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
            8 powerful modules, each designed to solve a specific business challenge.
          </p>
        </div>

        {/* Module tabs */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          {MODULES.map(m => (
            <button key={m.id} onClick={() => setActive(m.id)} style={{
              padding: "8px 18px", borderRadius: 100, border: `1px solid ${active===m.id ? m.color : "rgba(255,255,255,0.1)"}`,
              background: active===m.id ? `${m.color}20` : "transparent",
              color: active===m.id ? m.color : "#64748b",
              cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, fontSize: "0.85rem",
              transition: "all 0.2s"
            }}>
              {m.icon} {m.title}
            </button>
          ))}
        </div>

        {/* Active module detail */}
        <div className="features-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>{mod.icon}</div>
            <h2 className="font-display" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 12, color: "#f0f4ff" }}>{mod.title} Module</h2>
            <p style={{ color: mod.color, fontWeight: 600, marginBottom: 24, fontSize: "1rem" }}>{mod.tagline}</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {mod.features.map(f => (
                <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "#94a3b8", fontSize: "0.95rem" }}>
                  <span style={{ color: mod.color, flexShrink: 0, marginTop: 1, fontSize: "1rem" }}>✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button className="btn-primary" style={{ marginTop: 32, padding: "12px 28px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.95rem", fontWeight: 700, position: "relative", zIndex: 1 }}
              onClick={() => { setPage("pricing"); window.scrollTo(0,0); }}>
              Get Started Free →
            </button>
          </div>
          <div style={{ height: 340, background: mod.bg, border: `1px solid ${mod.border}`, borderRadius: 20, overflow: "hidden" }}>
            {mod.illustration}
          </div>
        </div>

        {/* All modules mini-grid */}
        <div style={{ marginTop: 100 }}>
          <h3 className="font-display" style={{ textAlign: "center", fontSize: "1.6rem", fontWeight: 700, marginBottom: 40 }}>All Modules at a Glance</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {MODULES.map(m => (
              <div key={m.id} className="glass glass-hover" style={{ borderRadius: 14, padding: 20, border: `1px solid ${m.border}`, cursor: "pointer" }} onClick={() => { setActive(m.id); window.scrollTo(0, 300); }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{m.icon}</div>
                <div className="font-display" style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f0f4ff", marginBottom: 4 }}>{m.title}</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{m.features.length} features</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PRICING PAGE ─────────────────────────────────────────────────────────────
function PricingPage({ setPage }) {
  const [annual, setAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const faqs = [
    { q: "Can I change my plan later?", a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated accordingly." },
    { q: "Is there a free trial?", a: "Yes! Every plan comes with a 14-day free trial with full access to all features. No credit card required to start." },
    { q: "Is MyBusiness GST compliant?", a: "100%. MyBusiness is fully GST compliant. Generate CGST, SGST, and IGST invoices. File-ready reports are included in all plans." },
    { q: "Can I export my data?", a: "Yes, you can export all your data in PDF and Excel format at any time. Your data always belongs to you." },
    { q: "Do you offer onboarding support?", a: "Yes! All plans include email and chat support. Growth and Enterprise plans get priority support with dedicated onboarding sessions." },
    { q: "What happens after my trial ends?", a: "Your data is safely preserved. You'll be prompted to choose a plan to continue. If you don't, your account is paused — not deleted." },
  ];

  return (
    <div style={{ paddingTop: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="tag" style={{ background: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.3)", color: "#fbbf24" }}>Pricing</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, margin: "16px 0", lineHeight: 1.2 }}>
            Simple, Honest Pricing.<br/><span className="text-gradient-amber">No Surprises.</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 460, margin: "0 auto 32px" }}>
            Start free. Scale as you grow. Cancel anytime.
          </p>
          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "6px 6px 6px 16px" }}>
            <span style={{ color: annual ? "#64748b" : "#f0f4ff", fontSize: "0.9rem", fontWeight: 600 }}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} style={{
              width: 48, height: 26, borderRadius: 13, background: annual ? "#6366f1" : "rgba(255,255,255,0.15)",
              border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s"
            }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: annual ? 25 : 3, transition: "left 0.3s" }}/>
            </button>
            <span style={{ color: annual ? "#f0f4ff" : "#64748b", fontSize: "0.9rem", fontWeight: 600, paddingRight: 10 }}>
              Annual <span style={{ color: "#22c55e", fontSize: "0.75rem", fontWeight: 700 }}>Save 20%</span>
            </span>
          </div>
        </div>

        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24, alignItems: "start" }}>
          {PLANS.map(plan => (
            <div key={plan.name} className={`pricing-card glass ${plan.featured ? "featured" : ""}`} style={{
              borderRadius: 20, padding: 32, border: plan.featured ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.07)",
              background: plan.featured ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
              position: "relative"
            }}>
              {plan.featured && (
                <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", fontSize: "0.75rem", fontWeight: 700, padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: 24 }}>
                <div className="font-display" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f0f4ff", marginBottom: 6 }}>{plan.name}</div>
                <p style={{ color: "#64748b", fontSize: "0.82rem", marginBottom: 20 }}>{plan.description}</p>
                {plan.price.monthly ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span className="font-display" style={{ fontSize: "2.8rem", fontWeight: 800, color: plan.color }}>{plan.currency}{annual ? plan.price.annual : plan.price.monthly}</span>
                    <span style={{ color: "#64748b", fontSize: "0.85rem" }}>/mo</span>
                  </div>
                ) : (
                  <div className="font-display" style={{ fontSize: "2rem", fontWeight: 700, color: plan.color }}>Custom</div>
                )}
              </div>
              <button className={plan.featured ? "btn-primary" : "btn-secondary"} style={{
                width: "100%", padding: "12px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "0.95rem", fontWeight: 700, marginBottom: 28,
                position: plan.featured ? "relative" : "static", zIndex: plan.featured ? 1 : "auto"
              }} onClick={() => { setPage("contact"); window.scrollTo(0,0); }}>
                {plan.cta}
              </button>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.87rem", color: "#94a3b8" }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div style={{ marginTop: 96 }}>
          <h2 className="font-display" style={{ textAlign: "center", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 48, color: "#f0f4ff" }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div key={i} className="glass" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16
                }}>
                  <span style={{ color: "#f0f4ff", fontWeight: 600, fontSize: "0.95rem", textAlign: "left", fontFamily: "Plus Jakarta Sans, sans-serif" }}>{faq.q}</span>
                  <span style={{ color: "#6366f1", fontSize: "1.2rem", transition: "transform 0.3s", transform: faqOpen===i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 24px 18px", color: "#64748b", lineHeight: 1.8, fontSize: "0.9rem" }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const values = [
    { icon: "🇮🇳", title: "Built for India", body: "From GST compliance to Hindi support — every feature is designed for the realities of running a business in India." },
    { icon: "🔒", title: "Security First", body: "Bank-grade encryption, regular backups, and SOC 2 compliance. Your business data is always safe with us." },
    { icon: "⚡", title: "Blazing Fast", body: "Optimized for low-bandwidth networks. MyBusiness loads in under 2 seconds even on 3G connections." },
    { icon: "🤝", title: "Customer Obsessed", body: "Real human support in English and Hindi. Average response time: under 2 hours. We don't hide behind bots." },
    { icon: "🌱", title: "Grow With You", body: "Start with one module. Add more as your team grows. Our platform scales from a 2-person startup to a 500-person enterprise." },
    { icon: "💡", title: "Always Innovating", body: "We ship new features every week. Our product roadmap is public and our customers vote on what gets built next." },
  ];

  const team = [
    { name: "Arjun Mehta", role: "CEO & Co-founder", avatar: "AM", bio: "Ex-Zoho product lead. 12 years in enterprise software." },
    { name: "Sneha Joshi", role: "CTO & Co-founder", avatar: "SJ", bio: "IIT Bombay grad. Previously at Razorpay and Freshworks." },
    { name: "Vikram Reddy", role: "Head of Product", avatar: "VR", bio: "Built product at 3 YC-backed startups. SME software evangelist." },
  ];

  return (
    <div style={{ paddingTop: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 5%" }}>
        {/* Mission */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 80px" }}>
          <span className="tag">Our Story</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, margin: "16px 0", lineHeight: 1.2 }}>
            We're on a Mission to<br/><span className="text-gradient">Empower Every Indian Business</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: 1.8 }}>
            MyBusiness was born out of frustration. In 2021, our founders watched small and mid-sized Indian businesses struggle with cobbled-together spreadsheets, disconnected apps, and expensive enterprise software that didn't understand India.
          </p>
          <p style={{ color: "#64748b", fontSize: "1.05rem", lineHeight: 1.8, marginTop: 16 }}>
            We set out to build something different: a modular, affordable, genuinely Indian business platform that any team could master in a day.
          </p>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 80 }}>
          <h2 className="font-display" style={{ textAlign: "center", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 48, color: "#f0f4ff" }}>
            What We <span className="text-gradient">Stand For</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {values.map(v => (
              <div key={v.title} className="glass glass-hover" style={{ borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{v.icon}</div>
                <h3 className="font-display" style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 10, color: "#f0f4ff" }}>{v.title}</h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: 1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="font-display" style={{ textAlign: "center", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: 48, color: "#f0f4ff" }}>
            Meet the <span className="text-gradient">Team</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto" }}>
            {team.map(t => (
              <div key={t.name} className="glass glass-hover" style={{ borderRadius: 16, padding: 28, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "white", margin: "0 auto 16px" }}>{t.avatar}</div>
                <div className="font-display" style={{ fontWeight: 700, color: "#f0f4ff", marginBottom: 4 }}>{t.name}</div>
                <div style={{ color: "#6366f1", fontSize: "0.82rem", fontWeight: 600, marginBottom: 12 }}>{t.role}</div>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>{t.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 80, padding: 48, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 20 }}>
          <h3 className="font-display" style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: 12, color: "#f0f4ff" }}>Want to join our team?</h3>
          <p style={{ color: "#64748b", marginBottom: 28 }}>We're always looking for passionate people who want to build for India.</p>
          <button className="btn-primary" style={{ padding: "12px 32px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: "1rem", position: "relative", zIndex: 1 }}
            onClick={() => { setPage("contact"); window.scrollTo(0,0); }}>
            Get In Touch
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      alert("Please fill in your name, email, and message.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: "YOUR_WEB3FORMS_KEY",
          subject: `MyBusiness Inquiry: ${form.subject || "Contact Form"}`,
          from_name: form.name,
          email: form.email,
          to_email: "yashkolnure58@gmail.com",
          company: form.company,
          phone: form.phone,
          message: form.message,
          botcheck: ""
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm({ name: "", email: "", company: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ paddingTop: 100 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="tag">Contact Us</span>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, margin: "16px 0", lineHeight: 1.2 }}>
            We'd Love to <span className="text-gradient">Hear From You</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 460, margin: "0 auto" }}>
            Questions, demos, partnerships, or just saying hi — we're all ears.
          </p>
        </div>

        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, flexWrap: "wrap" }}>
          {/* Left: Info */}
          <div>
            <div style={{ marginBottom: 40 }}>
              <h2 className="font-display" style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 24, color: "#f0f4ff" }}>Get in Touch</h2>
              {[
                { icon: "📧", label: "Email", value: "yashkolnure58@gmail.com" },
                { icon: "📞", label: "Phone", value: "+91 98765 43210" },
                { icon: "📍", label: "Office", value: "Pune, Maharashtra, India" },
                { icon: "⏰", label: "Support Hours", value: "Mon–Sat, 9am–7pm IST" },
              ].map(c => (
                <div key={c.label} style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{c.label}</div>
                    <div style={{ color: "#f0f4ff", fontSize: "0.9rem" }}>{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <div style={{ color: "#64748b", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>Follow Us</div>
              <div style={{ display: "flex", gap: 12 }}>
                {["Twitter", "LinkedIn", "YouTube", "Instagram"].map(s => (
                  <div key={s} style={{ width: 38, height: 38, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.7rem", color: "#64748b", fontWeight: 600, transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.color = "#a5b4fc"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#64748b"; }}>
                    {s[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="glass" style={{ borderRadius: 20, padding: 40, border: "1px solid rgba(99,102,241,0.15)" }}>
            {status === "success" ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: 20 }}>✅</div>
                <h3 className="font-display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f0f4ff", marginBottom: 12 }}>Message Sent!</h3>
                <p style={{ color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
                  Thanks for reaching out! We've received your message and will get back to you within 2 business hours.
                </p>
                <button className="btn-primary" onClick={() => setStatus("idle")} style={{ padding: "10px 24px", borderRadius: 8, fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 600, position: "relative", zIndex: 1 }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-display" style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 28, color: "#f0f4ff" }}>Send Us a Message</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {[
                    { key: "name", placeholder: "Full Name *", label: "Name" },
                    { key: "email", placeholder: "Email Address *", label: "Email", type: "email" },
                    { key: "company", placeholder: "Company Name", label: "Company" },
                    { key: "phone", placeholder: "+91 XXXXX XXXXX", label: "Phone", type: "tel" },
                  ].map(f => (
                    <div key={f.key}>
                      <input className="input-field" type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif" }}/>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <select className="input-field" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif", appearance: "none", cursor: "pointer" }}>
                    <option value="">Select a Subject</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <textarea className="input-field" placeholder="Your message *" rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: "12px 14px", borderRadius: 8, fontSize: "0.9rem", fontFamily: "Plus Jakarta Sans, sans-serif", resize: "vertical" }}/>
                </div>
                {status === "error" && (
                  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 16, color: "#fca5a5", fontSize: "0.85rem" }}>
                    ⚠️ Something went wrong. Please try again or email us directly.
                  </div>
                )}
                <button className="btn-primary" onClick={handleSubmit} disabled={status === "sending"}
                  style={{ width: "100%", padding: "14px", borderRadius: 10, fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: "1rem", fontWeight: 700, position: "relative", zIndex: 1, opacity: status === "sending" ? 0.7 : 1 }}>
                  {status === "sending" ? "Sending..." : "Send Message →"}
                </button>
                <p style={{ color: "#475569", fontSize: "0.75rem", textAlign: "center", marginTop: 14 }}>
                  We respond within 2 hours on business days. Your info is never shared.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 5% 30px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(3, 1fr)", gap: 48, marginBottom: 48, flexWrap: "wrap" }}>
          <div>
            <button onClick={() => { setPage("home"); window.scrollTo(0,0); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontFamily: "Sora, sans-serif", fontWeight: 800, fontSize: 14 }}>M</span>
              </div>
              <span className="font-display" style={{ fontWeight: 700, color: "#f0f4ff", fontSize: "1rem" }}>My<span style={{color:"#6366f1"}}>Business</span></span>
            </button>
            <p style={{ color: "#475569", fontSize: "0.85rem", lineHeight: 1.8, maxWidth: 280, marginBottom: 20 }}>
              The all-in-one modular business management platform built for Indian SMEs.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["GST Ready", "India Made", "Secure"].map(b => (
                <span key={b} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", color: "#a5b4fc", fontSize: "0.72rem", fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: [["Features", "features"], ["Pricing", "pricing"], ["About", "about"], ["Contact", "contact"]] },
            { title: "Modules", links: MODULES.slice(0,4).map(m => [m.title, "features"]) },
            { title: "Legal", links: [["Privacy Policy", "home"], ["Terms of Service", "home"], ["Security", "home"], ["Compliance", "home"]] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-display" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#94a3b8", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(([label, page]) => (
                  <li key={label}>
                    <button onClick={() => { setPage(page); window.scrollTo(0,0); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "0.85rem", fontFamily: "Plus Jakarta Sans, sans-serif", padding: 0, transition: "color 0.2s", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                      onMouseLeave={e => e.currentTarget.style.color = "#475569"}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <span style={{ color: "#334155", fontSize: "0.82rem" }}>© 2025 MyBusiness Technologies Pvt. Ltd. All rights reserved.</span>
          <span style={{ color: "#334155", fontSize: "0.82rem" }}>Made with ❤️ in India 🇮🇳</span>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage setPage={setPage} />;
      case "features": return <FeaturesPage setPage={setPage} />;
      case "pricing": return <PricingPage setPage={setPage} />;
      case "about": return <AboutPage setPage={setPage} />;
      case "contact": return <ContactPage />;
      default: return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalStyles />
      <Navbar page={page} setPage={setPage} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer setPage={setPage} />
    </div>
  );
}