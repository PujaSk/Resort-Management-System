// src/pages/customer/Home.jsx
import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
// import landingPageVideo from "../../assets/landing_page_video.mp4"

/* ══════════════════════════════════════════════
   GLOBAL CSS  — all keyframes + utility classes
══════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body  { background: #080604; color: #f5edd8; }
  html  { scroll-behavior: smooth; }

  @keyframes fadeUp       { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer      { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
  @keyframes float1       { 0%,100%{transform:translateY(0) translateX(0) scale(1);opacity:.4} 50%{transform:translateY(-30px) translateX(15px) scale(1.1);opacity:.8} }
  @keyframes float2       { 0%,100%{transform:translateY(0) translateX(0);opacity:.3} 50%{transform:translateY(20px) translateX(-10px);opacity:.7} }
  @keyframes float3       { 0%,100%{transform:translateY(0) scale(1);opacity:.2} 50%{transform:translateY(-20px) scale(1.2);opacity:.6} }
  @keyframes kenBurns     { 0%{transform:scale(1)} 100%{transform:scale(1.09)} }
  @keyframes facilityGlow { 0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,0)} 50%{box-shadow:0 0 30px 4px rgba(201,169,110,0.08)} }
  @keyframes shimmerGold  { 0%{background-position:200% center} 100%{background-position:-200% center} }

  .hero-d1{animation:fadeUp .8s cubic-bezier(.4,0,.2,1) .2s both}
  .hero-d2{animation:fadeUp .8s cubic-bezier(.4,0,.2,1) .4s both}
  .hero-d3{animation:fadeUp .8s cubic-bezier(.4,0,.2,1) .6s both}
  .hero-d4{animation:fadeUp .8s cubic-bezier(.4,0,.2,1) .8s both}
  .hero-d5{animation:fadeUp .8s cubic-bezier(.4,0,.2,1) 1.0s both}

  .sr {
    opacity: 0;
    will-change: opacity, transform;
    transition:
      opacity   .85s cubic-bezier(.16,1,.3,1),
      transform .85s cubic-bezier(.16,1,.3,1);
  }
  .sr.up    { transform: translateY(52px); }
  .sr.left  { transform: translateX(-60px); }
  .sr.right { transform: translateX(60px); }
  .sr.scale { transform: scale(.91); }
  .sr.d1  { transition-delay:.05s }
  .sr.d2  { transition-delay:.15s }
  .sr.d3  { transition-delay:.25s }
  .sr.d4  { transition-delay:.35s }
  .sr.d5  { transition-delay:.45s }
  .sr.d6  { transition-delay:.55s }
  .sr.in  { opacity:1 !important; transform:none !important; }

  .zoom-wrap          { overflow:hidden; border-radius:14px; }
  .zoom-wrap .zinner  { transform:scale(1.07); transition:transform 1.15s cubic-bezier(.16,1,.3,1); width:100%; height:100%; }
  .sr.in .zoom-wrap .zinner { transform:scale(1); }

  .kb { animation: kenBurns 9s ease-in-out infinite alternate; }

  .btn-g {
    position:relative; overflow:hidden; cursor:pointer;
    transition: transform .28s cubic-bezier(.4,0,.2,1),
                box-shadow .28s cubic-bezier(.4,0,.2,1) !important;
  }
  .btn-g::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(135deg,rgba(255,255,255,.22) 0%,transparent 55%);
    opacity:0; transition:opacity .28s;
  }
  .btn-g:hover              { transform:translateY(-3px) !important; }
  .btn-g:hover::after       { opacity:1; }
  .btn-g:active             { transform:translateY(-1px) !important; }

  .btn-o {
    position:relative; cursor:pointer;
    transition: color .28s, border-color .28s, background .28s !important;
  }
  .btn-o:hover {
    border-color: rgba(201,169,110,.55) !important;
    color:        rgba(201,169,110,.95) !important;
    background:   rgba(201,169,110,.07) !important;
  }

  /* ─── Facility card hover ─── */
  .fac-card {
    transition: background .35s, border-color .35s, transform .35s, box-shadow .35s !important;
    cursor: pointer;
  }
  .fac-card:hover {
    background:   rgba(201,169,110,.07) !important;
    border-color: rgba(201,169,110,.35) !important;
    transform:    translateY(-8px) !important;
    box-shadow:   0 24px 64px rgba(0,0,0,.5), 0 0 32px rgba(201,169,110,.1) !important;
  }
  .fac-card:hover .fac-img-inner {
    transform: scale(1.06) !important;
  }
  .fac-img-inner {
    transition: transform 0.6s cubic-bezier(.4,0,.2,1) !important;
  }
  .fac-card:hover .fac-arrow {
    transform: translateX(5px) !important;
    opacity: 1 !important;
  }
  .fac-arrow {
    transition: transform 0.25s, opacity 0.25s !important;
  }

  .feat {
    transition: background .32s, border-color .32s,
                transform  .32s, box-shadow  .32s !important;
  }
  .feat:hover {
    background:   rgba(201,169,110,.06) !important;
    border-color: rgba(201,169,110,.3)  !important;
    transform:    translateY(-7px)       !important;
    box-shadow:   0 22px 60px rgba(0,0,0,.42), 0 0 28px rgba(201,169,110,.08) !important;
  }

  .stat-num { transition:color .3s; }
  .stat-item:hover .stat-num { color:#c9a96e !important; }
`

function useScrollReveal(dep) {
  useEffect(() => {
    const targets = document.querySelectorAll(".sr")
    if (!targets.length) return
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target) } }),
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    )
    targets.forEach(t => io.observe(t))
    return () => io.disconnect()
  }, [dep]) // ← only re-runs when backend data arrives, NOT on every render
}

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
const toImageUrl  = p => { if (!p) return null; if (p.startsWith("http")) return p; return `${BACKEND_URL}/${p.replace(/^\/+/, "")}` }
const isHall      = r => /hall/i.test(r.type_name)
const ACCENTS     = ["#c9a96e","#d4af70"]

const CrownIcon = ({ size=40 }) => (
  <svg width={size} height={size*.7} viewBox="0 0 32 22" fill="none">
    <path d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z" fill="none" stroke="#c9a96e" strokeWidth="1.3" strokeLinejoin="round"/>
    <circle cx="16" cy="2"  r="1.8" fill="#c9a96e"/>
    <circle cx="6"  cy="9"  r="1.4" fill="#c9a96e"/>
    <circle cx="26" cy="9"  r="1.4" fill="#c9a96e"/>
  </svg>
)

const Brackets = ({ accent }) =>
  [["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
    <div key={i} style={{
      position:"absolute",[v]:"-9px",[h]:"-9px",width:"24px",height:"24px",
      borderColor:accent, borderStyle:"solid",
      borderWidth: v==="top"&&h==="left"?"1.5px 0 0 1.5px": v==="top"&&h==="right"?"1.5px 1.5px 0 0": v==="bottom"&&h==="left"?"0 0 1.5px 1.5px":"0 1.5px 1.5px 0",
      borderRadius: v==="top"&&h==="left"?"8px 0 0 0": v==="top"&&h==="right"?"0 8px 0 0": v==="bottom"&&h==="left"?"0 0 0 8px":"0 0 8px 0",
    }}/>
  ))

const Heading = ({ eyebrow, title, subtitle }) => (
  <div style={{ textAlign:"center", marginBottom:"60px" }}>
    <p className="sr up d1" style={{ fontSize:"12px", letterSpacing:"0.4em", textTransform:"uppercase", color:"#f9d28a", marginBottom:"14px", fontFamily:"'Cormorant Garamond', serif" }}>
      ✦ &nbsp;{eyebrow}&nbsp; ✦
    </p>
    <h2 className="sr up d2" style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(1.8rem,4vw,2.8rem)", color:"#f5edd8", fontWeight:700, margin:0 }}>
      {title}
    </h2>
    <div className="sr up d2" style={{ width:"60px", height:"1px", background:"linear-gradient(90deg,transparent,#c9a96e,transparent)", margin:"18px auto 0" }}/>
    {subtitle && <p className="sr up d3" style={{ fontFamily:"sans-serif", color:"rgba(220,200,165,.45)", fontSize:"14px", marginTop:"14px" }}>{subtitle}</p>}
  </div>
)

const FALLBACK_ROOMS = [
  { _id:"1", type_name:"Deluxe Suite",    price_per_night:350, capacity:"2", description:"An exquisite retreat with panoramic valley views, handcrafted furnishings, and a private terrace that invites the morning mist.",          amenities:["King Bed","Jacuzzi","Minibar","Butler Service","Mountain View"],              beds:[{type:"King",count:1}],                images:[], accent:"#c9a96e", tag:"Most Popular"  },
  { _id:"2", type_name:"Royal Penthouse", price_per_night:890, capacity:"4", description:"The crown jewel of our resort. Two floors of opulence featuring a private pool, dedicated staff, and sweeping panoramic skyline.",         amenities:["Private Pool","2 Bedrooms","Grand Piano","Personal Chef","Helipad Access"],    beds:[{type:"King",count:2}],                images:[], accent:"#d4af70", tag:"Exclusive"      },
  { _id:"3", type_name:"Garden Villa",    price_per_night:520, capacity:"3", description:"A private sanctuary nestled in manicured gardens, blending colonial elegance with modern comforts and a secluded plunge pool.",            amenities:["Plunge Pool","Garden View","Outdoor Shower","Fireplace","Yoga Deck"],          beds:[{type:"King",count:1},{type:"Twin",count:1}], images:[], accent:"#a8c88a", tag:"Nature Retreat"},
  { _id:"4", type_name:"Classic Room",    price_per_night:195, capacity:"2", description:"Timeless elegance in every detail. Our classic rooms offer the perfect balance of luxury and comfort for the discerning traveller.",        amenities:["Queen Bed","City View","Work Desk","Premium Linens","Rain Shower"],           beds:[{type:"Queen",count:1}],               images:[], accent:"#8ab4d4", tag:"Best Value"     },
]

const ILLS = [
  `<svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d0804"/><stop offset="100%" stop-color="#2a1a0a"/></linearGradient><radialGradient id="g1" cx="50%" cy="30%" r="50%"><stop offset="0%" stop-color="#c9a96e" stop-opacity="0.15"/><stop offset="100%" stop-color="#c9a96e" stop-opacity="0"/></radialGradient></defs><rect width="480" height="320" fill="url(#s1)"/><rect width="480" height="320" fill="url(#g1)"/><rect x="160" y="20" width="160" height="200" rx="4" fill="#0a1520" stroke="#c9a96e" stroke-width="1"/><circle cx="240" cy="90" r="25" fill="#c9a96e" opacity="0.12"/><line x1="240" y1="22" x2="240" y2="218" stroke="#c9a96e" stroke-width="0.8" opacity="0.4"/><line x1="162" y1="120" x2="318" y2="120" stroke="#c9a96e" stroke-width="0.8" opacity="0.4"/><rect x="0" y="245" width="480" height="75" fill="#1a0e06"/><rect x="80" y="200" width="320" height="50" rx="4" fill="#1e1408" stroke="#c9a96e" stroke-width="0.8"/></svg>`,
  `<svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#06050a"/><stop offset="100%" stop-color="#14100c"/></linearGradient></defs><rect width="480" height="320" fill="url(#s2)"/><rect x="20" y="10" width="440" height="180" rx="3" fill="#040810" stroke="#d4af70" stroke-width="0.8" opacity="0.9"/><rect x="40" y="100" width="20" height="80" fill="#0a0d14"/><rect x="70" y="80" width="25" height="100" fill="#0a0d14"/><rect x="200" y="60" width="35" height="120" fill="#0a0d14"/><rect x="306" y="65" width="28" height="115" fill="#0a0d14"/><rect x="410" y="70" width="30" height="110" fill="#0a0d14"/></svg>`,
  `<svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#030a04"/><stop offset="100%" stop-color="#0a1a08"/></linearGradient></defs><rect width="480" height="320" fill="url(#s3)"/><ellipse cx="60" cy="120" rx="50" ry="80" fill="#0d1f0a" opacity="0.9"/><line x1="60" y1="180" x2="60" y2="280" stroke="#0e1a08" stroke-width="8"/><ellipse cx="420" cy="130" rx="55" ry="85" fill="#0d1f0a" opacity="0.9"/><rect x="120" y="130" width="240" height="160" rx="3" fill="#0f1a08" stroke="#a8c88a" stroke-width="0.8"/><path d="M105 130 L240 70 L375 130 Z" fill="#0a1306" stroke="#a8c88a" stroke-width="0.8"/></svg>`,
  `<svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="s4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#06080e"/><stop offset="100%" stop-color="#0e1018"/></linearGradient></defs><rect width="480" height="320" fill="url(#s4)"/><path d="M170 20 L170 160 Q170 185 240 185 Q310 185 310 160 L310 20 Z" fill="#040810" stroke="#8ab4d4" stroke-width="0.8" opacity="0.9"/><line x1="240" y1="25" x2="240" y2="183" stroke="#8ab4d4" stroke-width="0.8" opacity="0.3"/><rect x="80" y="230" width="320" height="55" rx="5" fill="#0c1018" stroke="#8ab4d4" stroke-width="0.7"/></svg>`,
]

// ══════════════════════════════════════════════
// FACILITY ICONS (fallback if no image)
// ══════════════════════════════════════════════
const FAC_ICONS = ["🏊","🍽","💆","🌿","🎭","✈️","🏋️","🎾","🚗","🛎","🏌️","🎯","🎰","🍷","🌊","🔥"]
const FAC_ACCENT_CYCLE = ["#c9a96e","#a8c88a","#8ab4d4","#d4af70","#b87fff","#52C07A"]

function getFacilityIcon(name, index) {
  const lower = (name || "").toLowerCase()
  if (lower.includes("pool") || lower.includes("swim"))  return "🏊"
  if (lower.includes("dine") || lower.includes("food") || lower.includes("restaurant")) return "🍽"
  if (lower.includes("spa") || lower.includes("wellness") || lower.includes("massage")) return "💆"
  if (lower.includes("garden") || lower.includes("nature") || lower.includes("trail"))  return "🌿"
  if (lower.includes("event") || lower.includes("hall") || lower.includes("banquet"))   return "🎭"
  if (lower.includes("gym") || lower.includes("fitness"))  return "🏋️"
  if (lower.includes("tennis") || lower.includes("sport")) return "🎾"
  if (lower.includes("park") || lower.includes("car"))     return "🚗"
  if (lower.includes("concierge") || lower.includes("desk")) return "🛎"
  if (lower.includes("golf"))  return "🏌️"
  if (lower.includes("bar") || lower.includes("wine") || lower.includes("lounge")) return "🍷"
  if (lower.includes("beach") || lower.includes("ocean") || lower.includes("lake")) return "🌊"
  if (lower.includes("sauna") || lower.includes("steam")) return "🔥"
  return FAC_ICONS[index % FAC_ICONS.length]
}

// ══════════════════════════════════════════════
// FACILITY IMAGE COMPONENT
// ══════════════════════════════════════════════
function FacilityCardImage({ facility, index }) {
  const url = facility.images?.[0] ? toImageUrl(facility.images[0]) : null
  const accent = FAC_ACCENT_CYCLE[index % FAC_ACCENT_CYCLE.length]
  const icon = getFacilityIcon(facility.name, index)

  if (url) {
    return (
      <div style={{ height:"180px", overflow:"hidden", borderRadius:"10px 10px 0 0", position:"relative" }}>
        <img
          src={url} alt={facility.name}
          className="fac-img-inner"
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
          onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex" }}
        />
        <div style={{ display:"none", height:"180px", background:`linear-gradient(135deg, ${accent}18, #0a0804)`, alignItems:"center", justifyContent:"center", fontSize:"48px" }}>
          {icon}
        </div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)", pointerEvents:"none" }} />
      </div>
    )
  }

  return (
    <div className="fac-img-inner" style={{ height:"180px", borderRadius:"10px 10px 0 0", background:`linear-gradient(135deg, ${accent}18 0%, #080604 100%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"52px", position:"relative" }}>
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse at 50% 60%, ${accent}12, transparent 70%)` }} />
      <span style={{ position:"relative" }}>{icon}</span>
    </div>
  )
}

// ══════════════════════════════════════════════
// FACILITIES SECTION (replaces Features)
// ══════════════════════════════════════════════
const FALLBACK_FACILITIES = [
  { _id:"f1", name:"Infinity Pool",    description:"Suspended above the valley, our heated infinity pool offers an unrivalled vista as the sun dips behind the mountains.", images:[] },
  { _id:"f2", name:"Fine Dining",      description:"Award-winning cuisine crafted by our Michelin-trained chef, using ingredients sourced from our own kitchen gardens.", images:[] },
  { _id:"f3", name:"Royal Spa",        description:"Surrender to our signature treatments in the 12,000 sq ft spa sanctuary, inspired by ancient healing traditions.", images:[] },
  { _id:"f4", name:"Nature Trails",    description:"Guided walks through untouched forests, with a personal naturalist to reveal the wonders at every turn.", images:[] },
]

function FacilitiesSection({ facilities }) {
  const navigate = useNavigate()
  const displayed = facilities.slice(0, 4)

  return (
    <section style={{ padding:"100px 0 110px", position:"relative" }}>
      {/* top divider */}
      <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,110,.15),transparent)" }} />

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 40px" }}>
        <Heading
          eyebrow="The Royal Experience"
          title="Why Choose Royal Palace"
          subtitle="Discover the amenities and experiences that set us apart"
        />

        {/* 4-card grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"22px", marginBottom:"48px" }}>
          {displayed.map((f, i) => {
            const accent = FAC_ACCENT_CYCLE[i % FAC_ACCENT_CYCLE.length]
            return (
              <div
                key={f._id}
                className={`fac-card sr up d${(i % 4) + 1}`}
                onClick={() => navigate(`/facilities/${f._id}`)}
                style={{
                  background: "rgba(255,255,255,.025)",
                  border: `1px solid rgba(201,169,110,.1)`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Image area */}
                <FacilityCardImage facility={f} index={i} />

                {/* Content */}
                <div style={{ padding:"20px 22px 22px" }}>
                  {/* top accent line */}
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:`linear-gradient(90deg,transparent,${accent}40,transparent)` }} />

                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#f5edd8", fontWeight:600, marginBottom:"10px" }}>
                    {f.name}
                  </h3>
                  <p style={{ color:"rgba(220,200,165,.6)", fontSize:"13px", lineHeight:1.75, fontFamily:"sans-serif", margin:0, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {f.description || "Experience world-class luxury at Royal Palace Resort."}
                  </p>

                  {/* "Explore →" link */}
                  <div style={{ marginTop:"14px", display:"flex", alignItems:"center", gap:"6px" }}>
                    <span style={{ fontSize:"12px", color:accent, fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.15em", textTransform:"uppercase" }}>
                      Explore
                    </span>
                    <span className="fac-arrow" style={{ color:accent, fontSize:"14px", opacity:0.6 }}>→</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All CTA */}
        <div className="sr up d5" style={{ textAlign:"center" }}>
          <button
            onClick={() => navigate("/facilities")}
            className="btn-o"
            style={{
              padding:"13px 36px", borderRadius:"8px",
              border:"1px solid rgba(201,169,110,.35)",
              color:"rgba(201,169,110,.8)", fontSize:"12px",
              letterSpacing:"0.3em", textTransform:"uppercase",
              fontFamily:"'Cormorant Garamond',serif",
              background:"transparent", cursor:"pointer",
              display:"inline-flex", alignItems:"center", gap:"10px",
            }}
          >
            <span>View All Facilities</span>
            <span style={{ fontSize:"16px" }}>→</span>
          </button>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════
// ROOM IMAGE SLIDER
// ══════════════════════════════════════════════
function RoomImageSlider({ images, accent }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => { setIdx(0) }, [images])
  const urls = images.map(toImageUrl).filter(Boolean)
  if (!urls.length) return null
  return (
    <div style={{ position:"relative", borderRadius:"14px", overflow:"hidden", aspectRatio:"3/2", background:"#0a0804" }}>
      {urls.map((url,i) => (
        <img key={i} src={url} alt={`Room ${i+1}`} style={{
          position:i===0?"relative":"absolute", inset:0,
          width:"100%", height:"100%", objectFit:"cover", display:"block",
          opacity:i===idx?1:0, transition:"opacity .5s cubic-bezier(.4,0,.2,1)",
        }} onError={e=>{e.target.style.display="none"}}/>
      ))}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"60px",background:"linear-gradient(to top,rgba(0,0,0,.6),transparent)",pointerEvents:"none" }}/>
      {urls.length > 1 && (<>
        <div style={{ position:"absolute",bottom:"10px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"6px",zIndex:5 }}>
          {urls.map((_,i)=><button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?"20px":"6px",height:"4px",borderRadius:"2px",border:"none",cursor:"pointer",padding:0,background:i===idx?accent:"rgba(255,255,255,.35)",transition:"all .3s" }}/>)}
        </div>
        <button onClick={()=>setIdx(i=>(i-1+urls.length)%urls.length)} style={{ position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",width:"32px",height:"32px",borderRadius:"50%",background:"rgba(0,0,0,.45)",border:`1px solid ${accent}40`,color:accent,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}>‹</button>
        <button onClick={()=>setIdx(i=>(i+1)%urls.length)} style={{ position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",width:"32px",height:"32px",borderRadius:"50%",background:"rgba(0,0,0,.45)",border:`1px solid ${accent}40`,color:accent,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}>›</button>
      </>)}
    </div>
  )
}

// ══════════════════════════════════════════════
// ROOM SHOWCASE CAROUSEL
// ══════════════════════════════════════════════
function RoomShowcase({ rooms }) {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState(1)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  const go = (idx, dir = 1) => {
    if (animating) return
    setAnimating(true); setDirection(dir); setVisible(false)
    setTimeout(() => { setActive(idx); setVisible(true); setTimeout(() => setAnimating(false), 600) }, 400)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setAnimating(true); setDirection(1); setVisible(false)
      setTimeout(() => { setActive(a => (a + 1) % rooms.length); setVisible(true); setTimeout(() => setAnimating(false), 600) }, 400)
    }, 5500)
    return () => clearInterval(timerRef.current)
  }, [rooms.length])

  const room = rooms[active]
  const illustration = ILLS[active % ILLS.length]
  const accent = room.accent || ACCENTS[active % ACCENTS.length]
  const tag = room.tag || (active === 0 ? "Most Popular" : room.price_per_night >= 600 ? "Exclusive" : room.price_per_night >= 400 ? "Premium" : "Great Value")

  return (
    <section style={{ padding:"100px 0 120px", position:"relative", overflow:"hidden" }}>
      <Heading eyebrow="Curated Accommodations" title="Rooms & Suites"/>
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"60px", alignItems:"center" }}>
        <div style={{ position:"relative", opacity:visible?1:0, transform:visible?"translateX(0) scale(1)":`translateX(${direction*-40}px) scale(0.96)`, transition:"opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
          <div style={{ position:"absolute",inset:"-1px",borderRadius:"16px",border:`1px solid ${accent}40`,boxShadow:`0 0 60px ${accent}18, 0 40px 80px rgba(0,0,0,0.6)` }}/>
          {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i) => (
            <div key={i} style={{ position:"absolute",[v]:"-8px",[h]:"-8px",width:"22px",height:"22px",borderColor:accent,borderStyle:"solid",borderWidth:v==="top"&&h==="left"?"1.5px 0 0 1.5px":v==="top"&&h==="right"?"1.5px 1.5px 0 0":v==="bottom"&&h==="left"?"0 0 1.5px 1.5px":"0 1.5px 1.5px 0",borderRadius:v==="top"&&h==="left"?"8px 0 0 0":v==="top"&&h==="right"?"0 8px 0 0":v==="bottom"&&h==="left"?"0 0 0 8px":"0 0 8px 0" }}/>
          ))}
          {room.images && room.images.length > 0 ? (
            <RoomImageSlider images={room.images} accent={accent} />
          ) : (
            <div style={{ borderRadius:"14px",overflow:"hidden",background:"#0a0804",aspectRatio:"3/2" }} dangerouslySetInnerHTML={{ __html:illustration }}/>
          )}
          <div style={{ position:"absolute",bottom:"16px",right:"16px",background:"rgba(10,6,2,0.85)",backdropFilter:"blur(12px)",border:`1px solid ${accent}50`,borderRadius:"8px",padding:"10px 16px",fontFamily:"'Cormorant Garamond',serif" }}>
            <div style={{ fontSize:"10px",letterSpacing:"0.2em",color:`${accent}cc`,textTransform:"uppercase" }}>from</div>
            <div style={{ fontSize:"22px",fontWeight:700,color:accent,lineHeight:1.1 }}>₹{room.price_per_night}</div>
            <div style={{ fontSize:"10px",color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em" }}>per night</div>
          </div>
          {tag && <div style={{ position:"absolute",top:"16px",left:"16px",background:`${accent}22`,border:`1px solid ${accent}50`,borderRadius:"20px",padding:"5px 14px",fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:accent,fontFamily:"'Cormorant Garamond',serif" }}>{tag}</div>}
        </div>
        <div style={{ opacity:visible?1:0, transform:visible?"translateX(0)":`translateX(${direction*40}px)`, transition:"opacity 0.5s cubic-bezier(0.4,0,0.2,1) 0.06s, transform 0.5s cubic-bezier(0.4,0,0.2,1) 0.06s" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"24px" }}>
            {rooms.map((_,i) => <button key={i} onClick={() => go(i, i > active ? 1 : -1)} style={{ width:i===active?"32px":"8px",height:"3px",background:i===active?accent:"rgba(255,255,255,0.15)",border:"none",borderRadius:"2px",cursor:"pointer",transition:"all 0.4s",padding:0 }}/>)}
            <span style={{ fontSize:"11px",color:"rgba(255,255,255,0.25)",marginLeft:"6px",fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.1em" }}>{String(active+1).padStart(2,"0")} / {String(rooms.length).padStart(2,"0")}</span>
          </div>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.6rem,3vw,2.4rem)",color:"#f5edd8",fontWeight:700,marginBottom:"16px",lineHeight:1.2 }}>{room.type_name}</h3>
          <p style={{ color:"rgba(220,200,165,0.6)",fontSize:"15px",lineHeight:1.75,marginBottom:"28px",fontFamily:"sans-serif",display:"-webkit-box",WebkitLineClamp:4,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{room.description}</p>
          <div style={{ display:"flex",gap:"24px",marginBottom:"28px" }}>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:"25px",fontWeight:700,color:accent,fontFamily:"'Playfair Display',serif" }}>2–{room.capacity}</div><div style={{ fontSize:"13px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.51)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>Guests</div></div>
            {room.beds && room.beds.length > 0 && (<><div style={{ width:"1px",background:"rgba(255,255,255,0.08)" }}/><div style={{ textAlign:"center" }}><div style={{ fontSize:"25px",fontWeight:700,color:accent,fontFamily:"'Playfair Display',serif" }}>{room.beds.reduce((s,b)=>s+b.count,0)}</div><div style={{ fontSize:"13px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.51)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>{room.beds[0].type} {room.beds.reduce((s,b)=>s+b.count,0)>1?"Beds":"Bed"}</div></div></>)}
            <div style={{ width:"1px",background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:"25px",fontWeight:700,color:accent,fontFamily:"'Playfair Display',serif" }}>{room.amenities?.length ?? 0}</div><div style={{ fontSize:"13px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.51)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>Amenities</div></div>
          </div>
          <div style={{ display:"flex",gap:"14px" }}>
            <Link to={`/rooms/${room._id}`} style={{ padding:"14px 28px",borderRadius:"8px",background:`linear-gradient(135deg,${accent},#8a6a30)`,color:"#0e0c09",fontWeight:700,fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",transition:"all 0.3s",boxShadow:`0 6px 24px ${accent}30` }}>View Room →</Link>
            <Link to="/rooms" style={{ padding:"14px 28px",borderRadius:"8px",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(255,255,255,0.5)",fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",transition:"all 0.3s" }}>All Rooms</Link>
          </div>
        </div>
      </div>
      <button onClick={() => go((active-1+rooms.length)%rooms.length,-1)} style={{ position:"absolute",left:"20px",top:"50%",transform:"translateY(-50%)",width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#c9a96e",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",transition:"all 0.2s" }}>‹</button>
      <button onClick={() => go((active+1)%rooms.length,1)} style={{ position:"absolute",right:"20px",top:"50%",transform:"translateY(-50%)",width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",color:"#c9a96e",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",transition:"all 0.2s" }}>›</button>
    </section>
  )
}

// ══════════════════════════════════════════════
// BANQUET SECTION
// ══════════════════════════════════════════════
function BanquetSection({ halls }) {
  const [active, setActive] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [dir, setDir] = useState(1)
  const [vis, setVis] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const timer = useRef(null)

  const go = (idx,d=1) => {
    if (animating) return
    setAnimating(true); setDir(d); setVis(false)
    setTimeout(()=>{ setActive(idx); setImgIdx(0); setVis(true); setTimeout(()=>setAnimating(false),600) },400)
  }

  useEffect(()=>{
    if (!halls||halls.length<=1) return
    timer.current = setInterval(()=>{
      setAnimating(true); setDir(1); setVis(false)
      setTimeout(()=>{ setActive(a=>(a+1)%halls.length); setImgIdx(0); setVis(true); setTimeout(()=>setAnimating(false),600) },400)
    },6000)
    return ()=>clearInterval(timer.current)
  },[halls?.length])

  if (!halls||halls.length===0) return null

  const hall   = halls[active]
  const accent = ACCENTS[active % ACCENTS.length]
  const urls   = (hall.images||[]).map(toImageUrl).filter(Boolean)

  const Lanim = { opacity:vis?1:0, transform:vis?"translateX(0)":`translateX(${dir*-40}px)`, transition:"opacity .5s cubic-bezier(.4,0,.2,1) .06s, transform .5s cubic-bezier(.4,0,.2,1) .06s" }
  const Ranim = { opacity:vis?1:0, transform:vis?"translateX(0) scale(1)":`translateX(${dir*40}px) scale(.97)`, transition:"opacity .5s cubic-bezier(.4,0,.2,1), transform .5s cubic-bezier(.4,0,.2,1)" }

  return (
    <section style={{ padding:"100px 0 120px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,169,110,.15),transparent)" }}/>
      <Heading eyebrow="Grand Events" title="Banquet Halls" subtitle="Magnificent spaces for weddings, conferences & royal celebrations"/>
      <div style={{ maxWidth:"1200px",margin:"0 auto",padding:"0 40px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"70px",alignItems:"start" }}>
        <div className="sr left" style={{ ...Lanim,display:"flex",flexDirection:"column",justifyContent:"flex-start" }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px",marginBottom:"22px" }}>
            {halls.map((_,i)=><button key={i} onClick={()=>go(i,i>active?1:-1)} style={{ width:i===active?"32px":"8px",height:"3px",background:i===active?accent:"rgba(255,255,255,.15)",border:"none",borderRadius:"2px",cursor:"pointer",transition:"all .4s",padding:0 }}/>)}
            <span style={{ fontSize:"11px",color:"rgba(255,255,255,.22)",marginLeft:"6px",fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.1em" }}>{String(active+1).padStart(2,"0")} / {String(halls.length).padStart(2,"0")}</span>
          </div>
          <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.6rem,3vw,2.4rem)",color:"#f5edd8",fontWeight:700,marginBottom:"14px",lineHeight:1.2 }}>{hall.type_name}</h3>
          {hall.description && <p style={{ color:"rgba(220,200,165,.6)",fontSize:"15px",lineHeight:1.8,marginBottom:"26px",fontFamily:"sans-serif",display:"-webkit-box",WebkitLineClamp:6,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{hall.description}</p>}
          <div style={{ display:"flex",gap:"22px",marginBottom:"26px",alignItems:"center" }}>
            <div style={{ textAlign:"center" }}><div style={{ fontSize:"25px",fontWeight:700,color:accent,fontFamily:"'Playfair Display',serif" }}>200–{hall.capacity}</div><div style={{ fontSize:"13px",letterSpacing:"0.2em",color:"rgba(255,255,255,0.51)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>Guests</div></div>
            {hall.amenities?.length > 0 && (<><div style={{ width:"1px",height:"38px",background:"rgba(255,255,255,.08)" }}/><div style={{ textAlign:"center" }}><div style={{ fontSize:"25px",fontWeight:700,color:accent,fontFamily:"'Playfair Display',serif" }}>{hall.amenities.length}</div><div style={{ fontSize:"13px",letterSpacing:"0.2em",color:"rgba(255,255,255,.51)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>Amenities</div></div></>)}
          </div>
          <div style={{ display:"flex",gap:"12px",flexWrap:"wrap",alignItems:"center" }}>
            <Link to={`/banquet/${hall._id}`} className="btn-g" style={{ padding:"13px 28px",borderRadius:"8px",background:`linear-gradient(135deg,${accent} 0%,#8a6a30 100%)`,color:"#0e0c09",fontWeight:700,fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",boxShadow:`0 6px 24px ${accent}30`,display:"inline-flex",alignItems:"center",gap:"6px" }}>Enquire & Book <span style={{fontSize:"15px"}}>→</span></Link>
            {/* <Link to="/rooms" className="btn-o" style={{ padding:"13px 28px",borderRadius:"8px",border:"1px solid rgba(255,255,255,.14)",color:"rgba(255,255,255,.46)",fontSize:"12px",letterSpacing:"0.2em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",display:"inline-flex",alignItems:"center" }}>All Venues</Link> */}
          </div>
        </div>
        <div className="sr right" style={{ position:"relative",...Ranim }}>
          <div style={{ position:"absolute",inset:"-1px",borderRadius:"16px",border:`1px solid ${accent}40`,boxShadow:`0 0 60px ${accent}18, 0 40px 80px rgba(0,0,0,.6)` }}/>
          <Brackets accent={accent}/>
          <div style={{ borderRadius:"14px",overflow:"hidden",aspectRatio:"3/2",background:"#0a0804",position:"relative" }}>
            {urls.length ? (<>
              {urls.map((url,i)=><img key={i} src={url} alt={`${hall.type_name} ${i+1}`} style={{ position:i===0?"relative":"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:i===imgIdx?1:0,transition:"opacity .5s cubic-bezier(.4,0,.2,1)" }} className={i===imgIdx?"kb":""} onError={e=>{e.target.style.display="none"}}/>)}
              <div style={{ position:"absolute",bottom:0,left:0,right:0,height:"70px",background:"linear-gradient(to top,rgba(0,0,0,.65),transparent)",pointerEvents:"none" }}/>
              {urls.length > 1 && (<>
                <div style={{ position:"absolute",bottom:"10px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"6px",zIndex:5 }}>{urls.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} style={{ width:i===imgIdx?"20px":"6px",height:"4px",borderRadius:"2px",border:"none",cursor:"pointer",padding:0,background:i===imgIdx?accent:"rgba(255,255,255,.35)",transition:"all .3s" }}/>)}</div>
                <button onClick={()=>setImgIdx(i=>(i-1+urls.length)%urls.length)} style={{ position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",width:"32px",height:"32px",borderRadius:"50%",background:"rgba(0,0,0,.45)",border:`1px solid ${accent}40`,color:accent,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}>‹</button>
                <button onClick={()=>setImgIdx(i=>(i+1)%urls.length)} style={{ position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",width:"32px",height:"32px",borderRadius:"50%",background:"rgba(0,0,0,.45)",border:`1px solid ${accent}40`,color:accent,cursor:"pointer",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}>›</button>
              </>)}
            </>) : (
              <div className="zoom-wrap" style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0e0b06,#1a1408)" }}>
                <div className="zinner" style={{ display:"flex",alignItems:"center",justifyContent:"center",fontSize:"64px",width:"100%",height:"100%" }}>🏛️</div>
              </div>
            )}
          </div>
          <div style={{ position:"absolute",bottom:"16px",right:"16px",background:"rgba(10,6,2,.88)",backdropFilter:"blur(14px)",border:`1px solid ${accent}50`,borderRadius:"10px",padding:"10px 16px",fontFamily:"'Cormorant Garamond',serif" }}>
            <div style={{ fontSize:"9px",letterSpacing:"0.22em",color:`${accent}bb`,textTransform:"uppercase" }}>from</div>
            <div style={{ fontSize:"22px",fontWeight:700,color:accent,lineHeight:1.1 }}>₹{hall.price_per_night?.toLocaleString()}</div>
            <div style={{ fontSize:"9px",color:"rgba(255,255,255,.3)",letterSpacing:"0.1em" }}>per day</div>
          </div>
          <div style={{ position:"absolute",top:"16px",left:"16px",background:`${accent}20`,border:`1px solid ${accent}50`,borderRadius:"20px",padding:"5px 14px",fontSize:"10px",letterSpacing:"0.2em",textTransform:"uppercase",color:accent,fontFamily:"'Cormorant Garamond',serif" }}>Grand Venue</div>
        </div>
      </div>
      {halls.length > 1 && (<>
        <button onClick={()=>go((active-1+halls.length)%halls.length,-1)} style={{ position:"absolute",left:"16px",top:"50%",transform:"translateY(-50%)",width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#c9a96e",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px" }}>‹</button>
        <button onClick={()=>go((active+1)%halls.length,1)} style={{ position:"absolute",right:"16px",top:"50%",transform:"translateY(-50%)",width:"44px",height:"44px",borderRadius:"50%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#c9a96e",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px" }}>›</button>
      </>)}
    </section>
  )
}

// ══════════════════════════════════════════════
// TESTIMONIALS
// ══════════════════════════════════════════════
function Testimonials() {
  const FALLBACK = [
    { name:"Elizabeth Hartley", title:"Luxury Travel Blogger", text:"Royal Palace Resort redefined what luxury means to me. Every detail, from the handwritten welcome note to the midnight turndown chocolates, was a testament to their dedication." },
    { name:"James Whitmore",    title:"CEO, Whitmore Capital",  text:"I have stayed in the world's finest properties. This is the first time a resort has made me feel like true royalty. The staff anticipate every need before you even realise you have one." },
    { name:"Priya Menon",       title:"Honeymooner",            text:"We chose Royal Palace for our honeymoon and it was the single best decision of our lives. The Garden Villa with its private plunge pool was beyond anything we had imagined." },
  ]

  const [Q,      setQ]      = useState(FALLBACK)
  const [active, setActive] = useState(0)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/bookings/testimonials/public`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { if (Array.isArray(data) && data.length >= 2) setQ(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setActive(0)
    const t = setInterval(() => setActive(a => (a + 1) % Q.length), 6000)
    return () => clearInterval(t)
  }, [Q.length])

  return (
    <section style={{ padding:"100px 0", position:"relative", textAlign:"center" }}>
      <div style={{ position:"absolute",top:0,left:"10%",right:"10%",height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,169,110,.15),transparent)" }}/>
      <div style={{ maxWidth:"1000px",margin:"0 auto",padding:"0 24px" }}>
        <Heading eyebrow="Guest Voices" title="Experiences Recalled"/>
        <div style={{ position:"relative",minHeight:"220px" }}>
          {Q.map((q,i)=>(
            <div key={i} style={{ position:i===0?"relative":"absolute",top:0,left:0,right:0,opacity:i===active?1:0,transform:i===active?"translateY(0)":"translateY(20px)",transition:"all .6s cubic-bezier(.4,0,.2,1)",pointerEvents:i===active?"auto":"none" }}>
              <div style={{ fontSize:"60px",color:"#c9a96e",opacity:.25,lineHeight:1,marginBottom:"8px",fontFamily:"Georgia,serif" }}>"</div>
              <p style={{ fontFamily:"sans-serif",fontSize:"clamp(1rem,2.2vw,1.2rem)",color:"rgba(220,200,165,.75)",lineHeight:1.8,marginBottom:"28px" }}>{q.text}</p>
              {q.rating && (
                <div style={{ marginBottom:"12px", fontSize:"18px", letterSpacing:"4px" }}>
                  <span style={{ color:"#c9a96e" }}>{"★".repeat(q.rating)}</span>
                  <span style={{ color:"rgba(255,255,255,.12)" }}>{"★".repeat(5 - q.rating)}</span>
                </div>
              )}
              <div style={{ fontFamily:"'Playfair Display',serif",color:"#c9a96e",fontSize:"14px",fontWeight:600 }}>{q.name}</div>
              <div style={{ fontSize:"11px",color:"rgba(255,255,255,.25)",letterSpacing:"0.15em",marginTop:"4px",fontFamily:"'Cormorant Garamond',serif" }}>{q.title}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",gap:"8px",justifyContent:"center",marginTop:"40px" }}>
          {Q.map((_,i)=><button key={i} onClick={()=>setActive(i)} style={{ width:i===active?"28px":"7px",height:"3px",borderRadius:"2px",background:i===active?"#c9a96e":"rgba(201,169,110,.2)",border:"none",cursor:"pointer",transition:"all .4s",padding:0 }}/>)}
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════
// CTA BANNER
// ══════════════════════════════════════════════
function CTABanner() {
  return (
    <section className="sr scale" style={{ padding:"90px 24px",position:"relative",background:"linear-gradient(135deg,rgba(201,169,110,.07) 0%,rgba(201,169,110,.02) 50%,rgba(201,169,110,.07) 100%)",borderTop:"1px solid rgba(201,169,110,.12)",borderBottom:"1px solid rgba(201,169,110,.12)",textAlign:"center" }}>
      <div style={{ position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 50%,rgba(201,169,110,.05) 0%,transparent 70%)" }}/>
      <div style={{ position:"relative",maxWidth:"600px",margin:"0 auto" }}>
        <h2 className="sr up d2" style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.6rem,3vw,2.4rem)",color:"#f5edd8",fontWeight:700,margin:"20px 0 14px" }}>Begin Your Royal Journey</h2>
        <p className="sr up d3" style={{ fontFamily:"sans-serif",color:"rgba(220,200,165,.55)",fontSize:"1.1rem",marginBottom:"36px",lineHeight:1.7 }}>Reserve your suite today and receive complimentary champagne on arrival, curated for the discerning guest.</p>
        <div className="sr up d4">
          <Link to="/rooms" className="btn-g" style={{ display:"inline-block",padding:"16px 42px",borderRadius:"8px",background:"linear-gradient(135deg,#c9a96e 0%,#a07838 50%,#d4b478 100%)",color:"#0e0c09",fontWeight:700,fontSize:"12px",letterSpacing:"0.3em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",boxShadow:"0 8px 32px rgba(201,169,110,.3)" }}>Book Your Stay →</Link>
        </div>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════
// HERO VIDEO
// ══════════════════════════════════════════════
function HeroVideo() {
  return (
   <section style={{
  position: "relative",
  minHeight: "100vh",
  width: "100%",
  maxWidth: "100vw",      // ← ADD THIS
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}}>
      <video autoPlay muted loop playsInline style={{ position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",zIndex:0, objectPosition:"center 30%", transform: "scale(1.15)", transformOrigin: "center center"}}>
        {/* <source src={landingPageVideo} type="video/mp4"/> */}
        <source src="/landing_page_video.mp4" type="video/mp4"/>
      </video>
      <div style={{ position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(5,3,1,.55) 0%,rgba(8,5,2,.44) 50%,rgba(5,3,1,.78) 100%)" }}/>
      <div style={{ position:"absolute",inset:0,zIndex:2,background:"radial-gradient(ellipse at 50% 50%,rgba(201,169,110,.05) 0%,transparent 65%)",pointerEvents:"none" }}/>
      {[{x:"20%",y:"25%",s:3,a:"float1 6s ease-in-out infinite"},{x:"75%",y:"35%",s:2,a:"float2 8s ease-in-out infinite 1s"},{x:"45%",y:"70%",s:4,a:"float3 7s ease-in-out infinite 2s"},{x:"85%",y:"65%",s:2,a:"float1 9s ease-in-out infinite .5s"},{x:"10%",y:"60%",s:3,a:"float2 5s ease-in-out infinite 1.5s"}].map((p,i)=>(
        <div key={i} style={{ position:"absolute",left:p.x,top:p.y,zIndex:3,width:p.s*2,height:p.s*2,borderRadius:"50%",background:"#c9a96e",animation:p.a }}/>
      ))}
      <div style={{ position:"relative",zIndex:10,textAlign:"center",maxWidth:"800px",padding:"0 24px" }}>
        <div className="hero-d2" style={{ display:"inline-flex",alignItems:"center",gap:"12px", marginTop: "28px" ,marginBottom:"28px",padding:"8px 22px",borderRadius:"30px",background:"rgba(201,169,110,.08)",border:"1px solid rgba(201,169,110,.2)",fontSize:"11px",letterSpacing:"0.45em",textTransform:"uppercase",color:"#c9a96e",fontFamily:"'Cormorant Garamond',serif" }}>
          <span style={{ animation:"shimmer 2s ease-in-out infinite" }}>✦</span>
          Luxury Resort & Spa
          <span style={{ animation:"shimmer 2s ease-in-out infinite 1s" }}>✦</span>
        </div>
        <h1 className="hero-d3" style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(2.4rem,6.5vw,5rem)",fontWeight:700,color:"#f5edd8",lineHeight:1.1,marginBottom:"28px",textShadow:"0 4px 40px rgba(0,0,0,.6)" }}>
          Royal Palace<br/>
          <span style={{ background:"linear-gradient(135deg,#c9a96e 0%,#f0d898 40%,#c9a96e 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"200% auto",animation:"shimmer 4s linear infinite" }}>Resort</span>
        </h1>
        <div className="hero-d3" style={{ display:"flex",alignItems:"center",gap:"16px",justifyContent:"center",marginBottom:"28px" }}>
          <div style={{ flex:1,maxWidth:"80px",height:"1px",background:"linear-gradient(90deg,transparent,rgba(201,169,110,.4))" }}/>
          <span style={{ color:"#c9a96e",fontSize:"16px" }}>✦</span>
          <div style={{ flex:1,maxWidth:"80px",height:"1px",background:"linear-gradient(90deg,rgba(201,169,110,.4),transparent)" }}/>
        </div>
        <p className="hero-d4" style={{ fontFamily:"sans-serif",fontSize:"clamp(1rem,2vw,1.2rem)",color:"rgba(220,200,165,.65)",lineHeight:1.8,maxWidth:"1540px",margin:"0 auto 44px" }}>
          Nestled among emerald hills, where timeless elegance meets nature's grandeur — a sanctuary for those who seek the extraordinary.
        </p>
        <div className="hero-d5" style={{ display:"flex",flexWrap:"wrap",gap:"16px",justifyContent:"center" }}>
          <Link to="/rooms" className="btn-g" style={{ padding:"16px 36px",borderRadius:"8px",background:"linear-gradient(135deg,#c9a96e 0%,#a07838 50%,#d4b478 100%)",color:"#160b05",fontWeight:700,fontSize:"12px",letterSpacing:"0.3em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif",boxShadow:"0 6px 28px rgba(201,169,110,.3),inset 0 1px 0 rgba(255,255,255,.2)" }}>Explore Rooms</Link>
          <Link to="/bookings" className="btn-o" style={{ padding:"16px 36px",borderRadius:"8px",border:"1px solid rgba(201,169,110,.400)",color:"rgba(201,169,110,.8)",fontSize:"12px",letterSpacing:"0.3em",textTransform:"uppercase",textDecoration:"none",fontFamily:"'Cormorant Garamond',serif" }}>My Bookings</Link>
        </div>
        <div className="hero-d5" style={{ display:"flex",gap:"48px",justifyContent:"center",marginTop:"100px" }}>
          {[["250+","Luxury Rooms"],["98%","Guest Satisfaction"],["15","Awards Won"]].map(([num,label],i)=>(
            <div key={i} className="stat-item" style={{ textAlign:"center" }}>
              <div className="stat-num" style={{ fontFamily:"'Playfair Display',serif",fontSize:"2rem",fontWeight:700,color:"#f5edd8" }}>{num}</div>
              <div style={{ fontSize:"10px",letterSpacing:"0.25em",textTransform:"uppercase",color:"rgb(183, 180, 176)",fontFamily:"'Cormorant Garamond',serif" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:"absolute",bottom:"32px",left:"50%",transform:"translateX(-50%)",zIndex:10,animation:"scrollBounce 2s ease-in-out infinite",display:"flex",flexDirection:"column",alignItems:"center",gap:"8px" }}>
        <span style={{ fontSize:"9px",letterSpacing:"0.35em",color:"rgb(201, 169, 110)",textTransform:"uppercase",fontFamily:"'Cormorant Garamond',serif" }}>Scroll</span>
        <div style={{ width:"1px",height:"50px",background:"linear-gradient(to bottom,rgb(201, 169, 110),transparent)" }}/>
      </div>
    </section>
  )
}

// ══════════════════════════════════════════════
// FOOTER
// ══════════════════════════════════════════════
// // ══════════════════════════════════════════════
// // FOOTER
// // ══════════════════════════════════════════════
// function Footer() {
//   return (
//     <footer style={{ padding:"60px 40px 40px", borderTop:"1px solid rgba(201,169,110,.1)" }}>
//       <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
//         <div style={{ display:"flex", flexWrap:"wrap", gap:"48px", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"48px" }}>

//           {/* Brand + Social */}
//           <div style={{ maxWidth:"280px" }}>
//             <div className="sr up d1" style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
//               <CrownIcon size={26}/>
//               <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#c9a96e", fontWeight:700 }}>Royal Palace Resort</span>
//             </div>
//             <p className="sr up d2" style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.81)", lineHeight:1.8, marginBottom:"20px" }}>
//               Where timeless elegance meets the grandeur of nature. An experience beyond compare.
//             </p>
//             {/* Social Icons */}
//             <div className="sr up d3" style={{ display:"flex", gap:"12px" }}>
//               {[
//                 { label:"Facebook",  href:"https://facebook.com",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
//                 { label:"Instagram", href:"https://instagram.com", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
//                 { label:"Twitter/X", href:"https://twitter.com",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
//                 { label:"YouTube",   href:"https://youtube.com",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0e0c09"/></svg> },
//               ].map(({ label, href, icon }) => (
//                 <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
//                   style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid rgba(201,169,110,.25)", background:"rgba(201,169,110,.06)", color:"rgba(201,169,110,.7)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", transition:"all .25s" }}
//                   onMouseEnter={e => { e.currentTarget.style.background="rgba(201,169,110,.18)"; e.currentTarget.style.borderColor="rgba(201,169,110,.6)"; e.currentTarget.style.color="#c9a96e" }}
//                   onMouseLeave={e => { e.currentTarget.style.background="rgba(201,169,110,.06)"; e.currentTarget.style.borderColor="rgba(201,169,110,.25)"; e.currentTarget.style.color="rgba(201,169,110,.7)" }}
//                 >
//                   {icon}
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Nav Links */}
//           <div style={{ display:"flex", gap:"60px", flexWrap:"wrap" }}>
//             {[
//               ["Explore", [
//                 ["Rooms & Suites",   "/rooms"],
//                 ["Banquet Halls",    "/banquet"],
//                 ["Facilities",       "/facilities"],
//                 ["Spa & Wellness",   "/spa"],
//                 ["Events",           "/events"],
//               ]],
//               ["Stay", [
//                 ["Book Now",         "/rooms"],
//                 ["My Bookings",      "/bookings"],
//                 ["Special Offers",   "/offers"],
//                 ["Gift Cards",       "/gifts"],
//               ]],
//             ].map(([title, links]) => (
//               <div key={title} className="sr up d3">
//                 <div style={{ fontSize:"11px", letterSpacing:"0.35em", color:"#c9a96e", textTransform:"uppercase", marginBottom:"18px", fontFamily:"'Cormorant Garamond',serif" }}>
//                   {title}
//                 </div>
//                 {links.map(([label, href]) => (
//                   <div key={href} style={{ marginBottom:"10px" }}>
//                     <Link to={href} className="btn-o" style={{ fontFamily:"sans-serif", fontSize:"14px", color:"rgba(220,200,165,.4)", textDecoration:"none" }}>
//                       {label}
//                     </Link>
//                   </div>
//                 ))}
//               </div>
//             ))}

//             {/* Contact */}
//             <div className="sr up d4">
//               <div style={{ fontSize:"11px", letterSpacing:"0.35em", color:"#c9a96e", textTransform:"uppercase", marginBottom:"18px", fontFamily:"'Cormorant Garamond',serif" }}>
//                 Contact Us
//               </div>
//               <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
//                 <a href="mailto:royalpalace.care1@gmail.com"
//                   style={{ display:"flex", alignItems:"flex-start", gap:"10px", textDecoration:"none" }}
//                   onMouseEnter={e => e.currentTarget.querySelector("span").style.color="rgba(201,169,110,.85)"}
//                   onMouseLeave={e => e.currentTarget.querySelector("span").style.color="rgba(220,200,165,.4)"}
//                 >
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"2px" }}>
//                     <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
//                     <polyline points="22,6 12,13 2,6"/>
//                   </svg>
//                   <span style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.4)", transition:"color .2s", lineHeight:1.5 }}>
//                     royalpalace.care1@gmail.com
//                   </span>
//                 </a>

//                 <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"2px" }}>
//                     <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
//                     <circle cx="12" cy="10" r="3"/>
//                   </svg>
//                   <span style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.4)", lineHeight:1.6, maxWidth:"200px" }}>
//                     Royal Palace Resort,<br/>
//                     Civil Lines, Jaipur,<br/>
//                     Rajasthan – 302006, India
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div style={{ paddingTop:"24px", borderTop:"1px solid rgba(255,255,255,.05)", display:"flex", flexWrap:"wrap", gap:"12px", justifyContent:"space-between", alignItems:"center" }}>
//           <span style={{ fontSize:"13px", color:"rgba(255,255,255,.3)", letterSpacing:"0.08em", fontFamily:"'Cormorant Garamond',serif" }}>
//             © {new Date().getFullYear()} Royal Palace Resort. All rights reserved.
//           </span>
//           <div style={{ display:"flex", gap:"20px" }}>
//             {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]].map(([label, href]) => (
//               <Link key={href} to={href} style={{ fontSize:"12px", color:"rgba(255,255,255,.2)", textDecoration:"none", fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.05em", transition:"color .2s" }}
//                 onMouseEnter={e => e.currentTarget.style.color="rgba(201,169,110,.6)"}
//                 onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.2)"}
//               >{label}</Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }

// ══════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════
export default function Home() {
  const [rooms, setRooms] = useState(FALLBACK_ROOMS)
  const [facilities, setFacilities] = useState(FALLBACK_FACILITIES)

  // Re-run scroll reveal when data counts change (fallback → real data)
  useScrollReveal(`${rooms.length}-${facilities.length}`)

  useEffect(() => {
    // Fetch room types
    fetch(`${BACKEND_URL}/api/room-types`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { if (Array.isArray(data) && data.length > 0) setRooms(data) })
      .catch(() => {})

    // Fetch facilities
    fetch(`${BACKEND_URL}/api/facilities`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { if (Array.isArray(data) && data.length > 0) setFacilities(data) })
      .catch(() => {})
  }, [])

  const regularRooms = rooms.filter(r => !isHall(r))
  const hallRooms    = rooms.filter(r =>  isHall(r))

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background:"#080604", minHeight:"100vh", color:"#f5edd8" }}>
        <HeroVideo/>
        {regularRooms.length > 0 && <RoomShowcase rooms={regularRooms}/>}
        {hallRooms.length > 0    && <BanquetSection halls={hallRooms}/>}
        <FacilitiesSection facilities={facilities}/>
        <Testimonials/>
        <CTABanner/>
        {/* <Footer/> */}
      </div>
    </>
  )
}