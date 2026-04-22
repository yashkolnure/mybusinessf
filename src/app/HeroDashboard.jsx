import { useState, useEffect, useRef } from "react";

// ─── INJECT STYLES ────────────────────────────────────────────────────────────
const DASH_STYLE = `
  @keyframes dashFadeIn   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dashSlideIn  { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
  @keyframes barGrow      { from { width:0; }  }
  @keyframes barGrowH     { from { height:0; } }
  @keyframes pulse2       { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @keyframes tick         { from{stroke-dashoffset:200;} to{stroke-dashoffset:0;} }
  @keyframes countUp      { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
  @keyframes scanLine     { 0%{top:0;} 100%{top:100%;} }
  @keyframes ringFill     { from{stroke-dashoffset:220;} to{stroke-dashoffset:var(--target);} }
  @keyframes float2       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  @keyframes progressAuto { from{width:0;} to{width:100%;} }

  .db-fade  { animation: dashFadeIn .35s ease both; }
  .db-slide { animation: dashSlideIn .3s ease both; }

  .db-bar    { animation: barGrow .6s cubic-bezier(.4,0,.2,1) both; }
  .db-barH   { animation: barGrowH .6s cubic-bezier(.4,0,.2,1) both; }
  .db-pulse2 { animation: pulse2 1.8s ease infinite; }
  .db-count  { animation: countUp .4s ease both; }
  .db-ring   { animation: ringFill 1s cubic-bezier(.4,0,.2,1) both; }

  .db-module-btn {
    display:flex; align-items:center; gap:7px;
    background:transparent; border:none; cursor:pointer;
    padding:7px 9px; border-radius:8px;
    font-size:.7rem; font-weight:600; letter-spacing:.02em;
    transition:background .2s,color .2s;
    font-family:'Plus Jakarta Sans',sans-serif;
    color:#475569; white-space:nowrap;
  }
  .db-module-btn.active { background:rgba(99,102,241,.18); color:#a5b4fc; }
  .db-module-btn:hover:not(.active) { background:rgba(255,255,255,.05); color:#94a3b8; }

  .db-progress-track {
    height:2px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden; margin-top:4px;
  }
  .db-progress-fill {
    height:100%; background:linear-gradient(90deg,#6366f1,#a5b4fc);
    border-radius:2px;
    animation: progressAuto var(--dur,4s) linear both;
  }

  .db-tag {
    display:inline-flex; align-items:center;
    padding:2px 8px; border-radius:100px;
    font-size:.62rem; font-weight:700; letter-spacing:.04em;
  }
  .db-row { display:flex; align-items:center; justify-content:space-between; }
`;

// ─── MODULE CONFIG ─────────────────────────────────────────────────────────────
const MODULES = [
  { id:"workforce",  icon:"👥", label:"Workforce"   },
  { id:"crm",        icon:"🤝", label:"CRM"         },
  { id:"invoicing",  icon:"🧾", label:"Invoicing"   },
  { id:"inventory",  icon:"📦", label:"Inventory"   },
  { id:"vendors",    icon:"🏪", label:"Vendors"     },
  { id:"finance",    icon:"💰", label:"Finance"     },
  { id:"reports",    icon:"📊", label:"Reports"     },
  { id:"quotations", icon:"📋", label:"Quotes"      },
];

// ─── TINY SHARED ATOMS ────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color="#a5b4fc", delay=0 }) => (
  <div className="db-count" style={{ animationDelay:`${delay}s`, background:"rgba(255,255,255,.03)",
    border:"1px solid rgba(255,255,255,.07)", borderRadius:10, padding:"10px 12px" }}>
    <div style={{ fontFamily:"Sora,sans-serif", fontWeight:800, fontSize:"1.25rem", color, lineHeight:1 }}>{value}</div>
    <div style={{ color:"#475569", fontSize:".62rem", marginTop:3 }}>{label}</div>
    {sub && <div style={{ color, fontSize:".6rem", fontWeight:700, marginTop:1 }}>{sub}</div>}
  </div>
);

const Badge = ({ children, color="#6366f1" }) => (
  <span className="db-tag" style={{ background:`${color}20`, border:`1px solid ${color}40`, color }}>
    {children}
  </span>
);

const ProgressBar = ({ pct, color="#6366f1", delay=0, thin=false }) => (
  <div style={{ height: thin?4:6, background:"rgba(255,255,255,.06)", borderRadius:4, overflow:"hidden" }}>
    <div className="db-bar" style={{ height:"100%", width:`${pct}%`, background:color,
      borderRadius:4, animationDelay:`${delay}s` }}/>
  </div>
);

// ─── MODULE PANELS ────────────────────────────────────────────────────────────

// WORKFORCE
const WorkforcePanel = () => {
  const employees = [
    { name:"Rahul S.", role:"Sales Lead", att:94, status:"present", avatar:"RS", color:"#6366f1" },
    { name:"Priya M.", role:"Accounts",   att:88, status:"present", avatar:"PM", color:"#f59e0b" },
    { name:"Amir K.",  role:"Ops",        att:76, status:"leave",   avatar:"AK", color:"#14b8a6" },
    { name:"Neha T.",  role:"Support",    att:100,status:"present", avatar:"NT", color:"#22c55e" },
  ];
  const statusColor = { present:"#22c55e", leave:"#f59e0b", absent:"#ef4444" };
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Total Staff"  value="48"   sub="↑ 3 this month" delay={0} />
        <KPI label="Present Today" value="41"  color="#22c55e" sub="85.4%" delay={.06} />
        <KPI label="On Leave"     value="7"    color="#f59e0b" sub="2 approved" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", overflow:"hidden" }}>
        <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em" }}>ATTENDANCE TODAY</span>
          <Badge color="#6366f1">Live</Badge>
        </div>
        {employees.map((e,i) => (
          <div key={e.name} className="db-slide" style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,.03)",
            display:"flex", alignItems:"center", gap:10, animationDelay:`${.05+i*.07}s` }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`${e.color}25`, border:`1px solid ${e.color}50`,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              fontSize:".58rem", fontWeight:800, color:e.color, fontFamily:"Sora,sans-serif" }}>{e.avatar}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ color:"#e2e8f0", fontSize:".72rem", fontWeight:600 }}>{e.name}</span>
                <span style={{ color:"#475569", fontSize:".6rem" }}>{e.att}%</span>
              </div>
              <ProgressBar pct={e.att} color={e.color} delay={.1+i*.06} thin />
            </div>
            <span className="db-tag" style={{ background:`${statusColor[e.status]}15`, border:`1px solid ${statusColor[e.status]}30`, color:statusColor[e.status], fontSize:".58rem", flexShrink:0 }}>{e.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// CRM
const CRMPanel = () => {
  const stages = [
    { name:"Leads",       count:24, value:"₹2.4L",  pct:100, color:"#6366f1" },
    { name:"Contacted",   count:18, value:"₹1.9L",  pct:75,  color:"#818cf8" },
    { name:"Proposal",    count:9,  value:"₹1.1L",  pct:50,  color:"#f59e0b" },
    { name:"Negotiation", count:5,  value:"₹72K",   pct:28,  color:"#fb923c" },
    { name:"Won",         count:3,  value:"₹44K",   pct:16,  color:"#22c55e" },
  ];
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Open Deals"   value="59"   color="#6366f1" delay={0}   />
        <KPI label="Pipeline"     value="₹6.1L" color="#f59e0b" delay={.06} />
        <KPI label="Won MTD"      value="₹44K" color="#22c55e" sub="↑ 12%" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", padding:"10px 12px" }}>
        <div style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em", marginBottom:10 }}>PIPELINE FUNNEL</div>
        {stages.map((s,i) => (
          <div key={s.name} className="db-slide" style={{ marginBottom:8, animationDelay:`${.04+i*.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ color:"#94a3b8", fontSize:".68rem" }}>{s.name}</span>
              <div style={{ display:"flex", gap:8 }}>
                <span style={{ color:"#64748b", fontSize:".63rem" }}>{s.count} deals</span>
                <span style={{ color:s.color, fontSize:".63rem", fontWeight:700 }}>{s.value}</span>
              </div>
            </div>
            <ProgressBar pct={s.pct} color={s.color} delay={.1+i*.06} />
          </div>
        ))}
      </div>
    </div>
  );
};

// INVOICING
const InvoicingPanel = () => {
  const invoices = [
    { id:"#1044", client:"TechVentive",  amt:"₹18,500", status:"paid",    color:"#22c55e" },
    { id:"#1043", client:"GreenLeaf",    amt:"₹9,200",  status:"pending", color:"#f59e0b" },
    { id:"#1042", client:"BuildRight",   amt:"₹34,000", status:"paid",    color:"#22c55e" },
    { id:"#1041", client:"Apex Traders", amt:"₹7,800",  status:"overdue", color:"#ef4444" },
  ];
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="This Month"  value="₹1.2L" color="#6366f1" sub="↑ 18%" delay={0}   />
        <KPI label="Pending"     value="₹34K"  color="#f59e0b" sub="4 invoices" delay={.06} />
        <KPI label="Overdue"     value="₹7.8K" color="#ef4444" sub="1 invoice" delay={.12} />
      </div>
      {/* Payment donut */}
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", padding:"10px 12px", flex:1, overflow:"hidden" }}>
          <div style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em", marginBottom:8 }}>RECENT INVOICES</div>
          {invoices.map((inv,i) => (
            <div key={inv.id} className="db-slide" style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,.03)", animationDelay:`${.05+i*.07}s` }}>
              <div>
                <span style={{ color:"#94a3b8", fontSize:".68rem", fontWeight:600 }}>{inv.id}</span>
                <span style={{ color:"#475569", fontSize:".62rem", marginLeft:6 }}>{inv.client}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#e2e8f0", fontSize:".68rem", fontWeight:700 }}>{inv.amt}</span>
                <span className="db-tag" style={{ background:`${inv.color}18`, border:`1px solid ${inv.color}35`, color:inv.color, fontSize:".58rem" }}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", padding:"12px", width:96, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10"/>
            <circle className="db-ring" cx="32" cy="32" r="26" fill="none" stroke="#22c55e" strokeWidth="10"
              strokeDasharray="220" style={{"--target":"88"}} strokeLinecap="round"
              transform="rotate(-90 32 32)"/>
            <circle className="db-ring" cx="32" cy="32" r="26" fill="none" stroke="#f59e0b" strokeWidth="10"
              strokeDasharray="220" strokeDashoffset="-88" style={{"--target":"-121","animationDelay":".3s"}} strokeLinecap="round"
              transform="rotate(-90 32 32)"/>
          </svg>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#22c55e", fontSize:".62rem", fontWeight:700 }}>60% Paid</div>
            <div style={{ color:"#f59e0b", fontSize:".6rem" }}>27% Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// INVENTORY
const InventoryPanel = () => {
  const items = [
    { name:"Paper A4 Ream",  stock:12, max:200, alert:true,  color:"#ef4444" },
    { name:"Laptop Bags",    stock:45, max:100, alert:false, color:"#6366f1" },
    { name:"Printer Toner",  stock:3,  max:20,  alert:true,  color:"#f59e0b" },
    { name:"Notebooks",      stock:88, max:150, alert:false, color:"#22c55e" },
    { name:"USB-C Cables",   stock:31, max:60,  alert:false, color:"#14b8a6" },
  ];
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="SKUs"         value="248"  delay={0}   />
        <KPI label="Low Stock"    value="12"   color="#f59e0b" sub="needs reorder" delay={.06} />
        <KPI label="Stock Value"  value="₹8.4L" color="#14b8a6" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", padding:"10px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em" }}>STOCK LEVELS</span>
          <Badge color="#f59e0b">2 Critical</Badge>
        </div>
        {items.map((item,i) => (
          <div key={item.name} className="db-slide" style={{ marginBottom:7, animationDelay:`${.04+i*.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
              <span style={{ color:"#94a3b8", fontSize:".68rem", display:"flex", alignItems:"center", gap:5 }}>
                {item.alert && <span className="db-pulse2" style={{ color:"#ef4444", fontSize:".7rem" }}>⚠</span>}
                {item.name}
              </span>
              <span style={{ color:item.color, fontSize:".63rem", fontWeight:700 }}>{item.stock}/{item.max}</span>
            </div>
            <ProgressBar pct={Math.round(item.stock/item.max*100)} color={item.color} delay={.1+i*.06} thin />
          </div>
        ))}
      </div>
    </div>
  );
};

// VENDORS
const VendorsPanel = () => {
  const vendors = [
    { name:"Infosys Supplies",  score:94, orders:12, pending:"₹22K",  color:"#6366f1" },
    { name:"PrintMart India",   score:87, orders:8,  pending:"₹8.5K", color:"#22c55e" },
    { name:"TechZone Delhi",    score:71, orders:5,  pending:"₹41K",  color:"#f59e0b" },
    { name:"Paper World",       score:96, orders:20, pending:"₹5K",   color:"#14b8a6" },
  ];
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Active Vendors" value="34"   color="#a855f7" delay={0}   />
        <KPI label="POs This Month" value="28"   delay={.06} />
        <KPI label="Payable"        value="₹76K" color="#f59e0b" sub="due in 7d" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", overflow:"hidden" }}>
        <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em" }}>VENDOR PERFORMANCE</span>
        </div>
        {vendors.map((v,i) => (
          <div key={v.name} className="db-slide" style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,.03)", animationDelay:`${.05+i*.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:"#e2e8f0", fontSize:".7rem", fontWeight:600 }}>{v.name}</span>
              <span style={{ color:v.color, fontSize:".68rem", fontWeight:800 }}>{v.score}/100</span>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ flex:1 }}><ProgressBar pct={v.score} color={v.color} delay={.1+i*.06} thin /></div>
              <span style={{ color:"#475569", fontSize:".6rem" }}>{v.orders} POs</span>
              <span style={{ color:"#f59e0b", fontSize:".6rem", fontWeight:700 }}>{v.pending}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// FINANCE
const FinancePanel = () => {
  const months = ["Sep","Oct","Nov","Dec","Jan","Feb"];
  const revenue = [38, 52, 45, 61, 55, 72];
  const expense = [28, 35, 32, 41, 38, 48];
  const maxV = 80;
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Revenue MTD"  value="₹4.2L" color="#6366f1" sub="↑ 18%" delay={0}   />
        <KPI label="Expenses MTD" value="₹2.8L" color="#f59e0b" sub="↑ 6%"  delay={.06} />
        <KPI label="Net Profit"   value="₹1.4L" color="#22c55e" sub="33% margin" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", padding:"10px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em" }}>6-MONTH OVERVIEW (₹K)</span>
          <div style={{ display:"flex", gap:10 }}>
            <span style={{ color:"#6366f1", fontSize:".6rem", display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8,height:8,borderRadius:2,background:"#6366f1",display:"inline-block" }}/>Revenue</span>
            <span style={{ color:"#f59e0b", fontSize:".6rem", display:"flex", alignItems:"center", gap:4 }}><span style={{ width:8,height:8,borderRadius:2,background:"#f59e0b",display:"inline-block" }}/>Expense</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:70 }}>
          {months.map((m,i) => (
            <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
              <div style={{ width:"100%", display:"flex", gap:2, alignItems:"flex-end", height:60 }}>
                <div className="db-barH" style={{ flex:1, background:"rgba(99,102,241,.7)", borderRadius:"3px 3px 0 0",
                  height:`${revenue[i]/maxV*100}%`, animationDelay:`${i*.07}s` }}/>
                <div className="db-barH" style={{ flex:1, background:"rgba(245,158,11,.6)", borderRadius:"3px 3px 0 0",
                  height:`${expense[i]/maxV*100}%`, animationDelay:`${.04+i*.07}s` }}/>
              </div>
              <span style={{ color:"#334155", fontSize:".56rem" }}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// REPORTS
const ReportsPanel = () => {
  const metrics = [
    { label:"Sales Growth",    value:"+24%", spark:[30,45,38,55,50,68,72], color:"#6366f1" },
    { label:"Expense Ratio",   value:"34%",  spark:[40,38,42,36,39,34,33], color:"#f59e0b" },
    { label:"Collection Rate", value:"91%",  spark:[78,82,85,88,87,90,91], color:"#22c55e" },
    { label:"Employee Prod.",  value:"87%",  spark:[75,78,80,82,85,83,87], color:"#14b8a6" },
  ];
  const W=48, H=28;
  const toPath = arr => {
    const max=Math.max(...arr), min=Math.min(...arr);
    const pts = arr.map((v,i) => {
      const x = (i/(arr.length-1))*W;
      const y = H - ((v-min)/(max-min||1))*H;
      return `${x},${y}`;
    });
    return `M ${pts.join(" L ")}`;
  };
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Reports Ready" value="12"   delay={0}   />
        <KPI label="Exports MTD"   value="34"   delay={.06} />
        <KPI label="Data Points"   value="1.2M" color="#6366f1" delay={.12} />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {metrics.map((m,i) => (
          <div key={m.label} className="db-slide" style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)",
            borderRadius:10, padding:"10px 12px", animationDelay:`${.05+i*.07}s` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
              <span style={{ color:"#64748b", fontSize:".63rem", lineHeight:1.2 }}>{m.label}</span>
              <span style={{ color:m.color, fontSize:".8rem", fontWeight:800, fontFamily:"Sora,sans-serif" }}>{m.value}</span>
            </div>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display:"block" }}>
              <path d={toPath(m.spark)} fill="none" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray="200" strokeDashoffset="200" style={{ animation:`tick .8s ${.1+i*.1}s ease forwards` }}/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

// QUOTATIONS
const QuotationsPanel = () => {
  const quotes = [
    { id:"Q-221", client:"TechVentive",  amt:"₹55,000", status:"approved", color:"#22c55e" },
    { id:"Q-220", client:"Apex Ltd",     amt:"₹12,800", status:"sent",     color:"#6366f1" },
    { id:"Q-219", client:"GreenLeaf",    amt:"₹28,500", status:"draft",    color:"#94a3b8" },
    { id:"Q-218", client:"BuildRight",   amt:"₹91,000", status:"approved", color:"#22c55e" },
  ];
  return (
    <div className="db-fade" style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:2 }}>
        <KPI label="Quotes Sent"  value="18"    delay={0}   />
        <KPI label="Approved"     value="₹1.4L" color="#22c55e" sub="7 quotes" delay={.06} />
        <KPI label="Conversion"   value="61%"   color="#6366f1" sub="↑ 8%" delay={.12} />
      </div>
      <div style={{ background:"rgba(255,255,255,.02)", borderRadius:10, border:"1px solid rgba(255,255,255,.06)", overflow:"hidden" }}>
        <div style={{ padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <span style={{ color:"#64748b", fontSize:".65rem", fontWeight:700, letterSpacing:".06em" }}>RECENT QUOTATIONS</span>
        </div>
        {quotes.map((q,i) => (
          <div key={q.id} className="db-slide" style={{ padding:"9px 12px", borderBottom:"1px solid rgba(255,255,255,.03)",
            display:"flex", alignItems:"center", justifyContent:"space-between", animationDelay:`${.05+i*.07}s` }}>
            <div>
              <div style={{ color:"#94a3b8", fontSize:".68rem", fontWeight:700 }}>{q.id}</div>
              <div style={{ color:"#475569", fontSize:".6rem" }}>{q.client}</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"#e2e8f0", fontSize:".7rem", fontWeight:700 }}>{q.amt}</span>
              <span className="db-tag" style={{ background:`${q.color}18`, border:`1px solid ${q.color}35`, color:q.color, fontSize:".58rem" }}>{q.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PANELS = {
  workforce:  <WorkforcePanel />,
  crm:        <CRMPanel />,
  invoicing:  <InvoicingPanel />,
  inventory:  <InventoryPanel />,
  vendors:    <VendorsPanel />,
  finance:    <FinancePanel />,
  reports:    <ReportsPanel />,
  quotations: <QuotationsPanel />,
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HeroDashboard() {
  const CYCLE_MS = 4000;
  const [active, setActive] = useState("workforce");
  const [key, setKey]       = useState(0); // force re-mount for animations
  const [prog, setProg]     = useState(0);
  const timerRef = useRef(null);
  const progRef  = useRef(null);

  const switchTo = (id) => {
    setActive(id);
    setKey(k => k+1);
    setProg(0);
    clearInterval(timerRef.current);
    clearInterval(progRef.current);
    startCycle(id);
  };

  const startCycle = (current = active) => {
    let elapsed = 0;
    const TICK = 50;
    progRef.current = setInterval(() => {
      elapsed += TICK;
      setProg(Math.min(elapsed / CYCLE_MS * 100, 100));
    }, TICK);

    timerRef.current = setTimeout(() => {
      clearInterval(progRef.current);
      setActive(prev => {
        const idx = MODULES.findIndex(m => m.id === prev);
        const next = MODULES[(idx + 1) % MODULES.length].id;
        setKey(k => k+1);
        setProg(0);
        return next;
      });
    }, CYCLE_MS);
  };

  useEffect(() => {
    startCycle();
    return () => { clearTimeout(timerRef.current); clearInterval(progRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // restart cycle whenever active changes (from auto-advance)
  const prevActive = useRef(active);
  useEffect(() => {
    if (active !== prevActive.current) {
      prevActive.current = active;
      clearTimeout(timerRef.current);
      clearInterval(progRef.current);
      setProg(0);
      startCycle(active);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const mod = MODULES.find(m => m.id === active);

  return (
    <>
      <style>{DASH_STYLE}</style>
      <div style={{ animation:"float2 5s ease-in-out infinite", opacity:.95, width:"100%" }}>
        <div style={{
          background:"rgba(10,14,28,.97)",
          border:"1px solid rgba(99,102,241,.2)",
          borderRadius:18,
          boxShadow:"0 40px 100px rgba(0,0,0,.65), 0 0 60px rgba(99,102,241,.08), inset 0 1px 0 rgba(255,255,255,.05)",
          overflow:"hidden",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
        }}>

          {/* Title bar */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px",
            borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(255,255,255,.015)" }}>
            <div style={{ display:"flex", gap:5 }}>
              {["#ff5f57","#ffbd2e","#28c940"].map(c =>
                <div key={c} style={{ width:9, height:9, borderRadius:"50%", background:c }}/>)}
            </div>
            <div style={{ flex:1, display:"flex", justifyContent:"center" }}>
              <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.07)",
                borderRadius:6, padding:"3px 14px", fontSize:".65rem", color:"#475569", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#334155" }}>🔒</span> app.mybusiness.in/dashboard
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span className="db-pulse2" style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block", boxShadow:"0 0 6px #22c55e" }}/>
              <span style={{ color:"#22c55e", fontSize:".6rem", fontWeight:700 }}>Live</span>
            </div>
          </div>

          {/* Module tabs */}
          <div style={{ display:"flex", gap:2, padding:"6px 10px", borderBottom:"1px solid rgba(255,255,255,.04)",
            overflowX:"auto", scrollbarWidth:"none" }}>
            {MODULES.map(m => (
              <button key={m.id} className={`db-module-btn${active===m.id?" active":""}`}
                onClick={() => switchTo(m.id)}>
                <span style={{ fontSize:".8rem" }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Progress bar for current tab */}
          <div style={{ padding:"0 10px 0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0" }}>
              <span style={{ color:"#6366f1", fontSize:".68rem", fontWeight:700 }}>{mod.icon} {mod.label} Module</span>
              <div style={{ flex:1, height:2, background:"rgba(255,255,255,.06)", borderRadius:2, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${prog}%`, background:"linear-gradient(90deg,#6366f1,#a5b4fc)", borderRadius:2, transition:"width .05s linear" }}/>
              </div>
            </div>
          </div>

          {/* Panel content */}
          <div key={`${active}-${key}`} style={{ padding:"0 12px 14px", minHeight:280 }}>
            {PANELS[active]}
          </div>

          {/* Footer bar */}
          <div style={{ padding:"8px 14px", borderTop:"1px solid rgba(255,255,255,.04)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
            background:"rgba(0,0,0,.2)" }}>
            <span style={{ color:"#1e293b", fontSize:".6rem" }}>MyBusiness v3.2.1</span>
            <div style={{ display:"flex", gap:12 }}>
              {[["#22c55e","GST Ready"],["#6366f1","Encrypted"],["#f59e0b","Auto-sync"]].map(([c,t]) => (
                <span key={t} style={{ color:c, fontSize:".6rem", display:"flex", alignItems:"center", gap:3 }}>
                  <span>●</span>{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
