// src/pages/customer/FacilityList.jsx
// Fully responsive — fluid grid, clamp padding, mobile hero
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
const toImageUrl  = p => { if (!p) return null; if (p.startsWith("http")) return p; return `${BACKEND_URL}/${p.replace(/^\/+/, "")}` }

const FAC_ACCENT_CYCLE = ["#c9a96e","#a8c88a","#8ab4d4","#d4af70","#b87fff","#52C07A","#f07070","#ffb347"]
const FAC_ICONS = ["🏊","🍽","💆","🌿","🎭","✈️","🏋️","🎾","🚗","🛎","🏌️","🎯","🍷","🌊","🔥","🎨"]

function getFacilityIcon(name, index) {
  const lower = (name || "").toLowerCase()
  if (lower.includes("pool") || lower.includes("swim"))  return "🏊"
  if (lower.includes("dine") || lower.includes("food") || lower.includes("restaurant")) return "🍽"
  if (lower.includes("spa") || lower.includes("wellness") || lower.includes("massage")) return "💆"
  if (lower.includes("garden") || lower.includes("nature") || lower.includes("trail"))  return "🌿"
  if (lower.includes("event") || lower.includes("hall") || lower.includes("banquet"))   return "🎭"
  if (lower.includes("gym") || lower.includes("fitness"))  return "🏋️"
  if (lower.includes("tennis") || lower.includes("sport")) return "🎾"
  if (lower.includes("concierge") || lower.includes("desk")) return "🛎"
  if (lower.includes("golf"))  return "🏌️"
  if (lower.includes("bar") || lower.includes("wine") || lower.includes("lounge")) return "🍷"
  if (lower.includes("beach") || lower.includes("ocean") || lower.includes("lake")) return "🌊"
  if (lower.includes("sauna") || lower.includes("steam")) return "🔥"
  return FAC_ICONS[index % FAC_ICONS.length]
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  @keyframes fadeUp { from{opacity:0} to{opacity:1} }
  @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }

  .fac-grid-card {
    transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s, border-color 0.35s !important;
    cursor: pointer;
  }
  .fac-grid-card:hover {
    transform: translateY(-8px) !important;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(201,169,110,0.1) !important;
  }
  .fac-grid-card:hover .fac-grid-img { transform: scale(1.06) !important; }
  .fac-grid-img { transition: transform 0.6s cubic-bezier(.4,0,.2,1) !important; }
  .fac-grid-card:hover .card-explore-btn {
    background: rgba(201,169,110,0.2) !important;
    border-color: rgba(201,169,110,0.6) !important;
    color: #c9a96e !important;
    transform: translateX(4px) !important;
  }
  .card-explore-btn { transition: all 0.25s !important; }
  .back-btn { transition: all 0.2s !important; }
  .back-btn:hover {
    border-color: rgba(201,169,110,0.5) !important;
    color: #c9a96e !important;
    background: rgba(201,169,110,0.08) !important;
  }

  /* Responsive grid */
  .fac-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 480px) { .fac-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
  @media (min-width: 900px) { .fac-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
  @media (min-width: 1200px){ .fac-grid { grid-template-columns: repeat(4, 1fr); } }

  /* Responsive page padding */
  .fac-wrap { max-width: 1200px; margin: 0 auto; padding: 0 clamp(16px,4vw,40px) clamp(60px,8vw,100px); }
  .fac-hero { padding-top: clamp(60px,8vw,90px); padding-bottom: clamp(48px,6vw,80px); }

  /* Card image height scales */
  .fac-card-img { height: clamp(160px, 22vw, 220px); }

  /* Back button position on mobile */
  .fac-back { top: clamp(16px,3vw,40px); left: clamp(16px,3vw,40px); }
`

function SkeletonCard() {
  return (
    <div style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:"14px", overflow:"hidden" }}>
      <div className="fac-card-img" style={{ background:"rgba(255,255,255,0.04)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          animation:"shimmer 1.5s ease-in-out infinite" }}/>
      </div>
      <div style={{ padding:"clamp(14px,2vw,20px) clamp(16px,2.5vw,22px) clamp(16px,2.5vw,24px)" }}>
        <div style={{ height:20, width:"60%", background:"rgba(255,255,255,0.06)", borderRadius:6, marginBottom:12 }}/>
        <div style={{ height:13, width:"90%", background:"rgba(255,255,255,0.04)", borderRadius:4, marginBottom:6 }}/>
        <div style={{ height:13, width:"75%", background:"rgba(255,255,255,0.04)", borderRadius:4 }}/>
      </div>
    </div>
  )
}

export default function FacilityList() {
  const navigate = useNavigate()
  const [facilities, setFacilities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [search,     setSearch]     = useState("")

  useEffect(() => { window.scrollTo({ top:0, left:0, behavior:"instant" }) }, [])

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/facilities`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { setFacilities(data || []); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const filtered = facilities.filter(f =>
    !search || f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ background:"#080604", minHeight:"100vh", color:"#f5edd8" }}>

        {/* ── Hero ── */}
        <div className="fac-hero" style={{ position:"relative", textAlign:"center", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0,
            background:"radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.09) 0%, transparent 65%)",
            pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:0, left:"15%", right:"15%", height:"1px",
            background:"linear-gradient(90deg,transparent,rgba(201,169,110,0.2),transparent)" }}/>

          <button onClick={() => navigate(-1)} className="back-btn fac-back" style={{
            position:"absolute", display:"flex", alignItems:"center", gap:"8px",
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"8px", padding:"8px 16px", color:"rgba(255,255,255,0.5)",
            fontSize:"12px", letterSpacing:"0.1em", cursor:"pointer",
            fontFamily:"'Cormorant Garamond',serif" }}>
            ← Back
          </button>

          <p style={{ fontSize:"clamp(10px,1.5vw,11px)", letterSpacing:"0.4em", textTransform:"uppercase",
            color:"#f9d28a", marginBottom:"14px", fontFamily:"'Cormorant Garamond',serif",
            animation:"fadeUp .6s forwards" }}>
            ✦ &nbsp;Resort Amenities&nbsp; ✦
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(1.8rem,5vw,3.8rem)", color:"#f5edd8", fontWeight:700,
            marginBottom:"16px", animation:"fadeUp .7s .08s forwards" }}>
            Our Facilities
          </h1>
          <div style={{ width:"60px", height:"1px",
            background:"linear-gradient(90deg,transparent,#c9a96e,transparent)",
            margin:"0 auto 20px", animation:"fadeUp .7s .12s forwards" }}/>
          <p style={{ fontFamily:"sans-serif", color:"rgba(220,200,165,0.45)",
            fontSize:"clamp(13px,2vw,15px)", maxWidth:"500px", margin:"0 auto 40px",
            lineHeight:1.7, padding:"0 16px", animation:"fadeUp .7s .16s forwards" }}>
            Every amenity at Royal Palace Resort is crafted to elevate your stay.
          </p>

          <div style={{ maxWidth:"clamp(280px,80vw,380px)", margin:"0 auto",
            position:"relative", animation:"fadeUp .7s .2s forwards", padding:"0 16px" }}>
            <span style={{ position:"absolute", left:"clamp(26px,4vw,30px)", top:"50%",
              transform:"translateY(-50%)", color:"rgba(201,169,110,0.5)", fontSize:"16px" }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search facilities…"
              style={{ width:"100%", background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(201,169,110,0.2)", borderRadius:"30px",
                padding:"12px 18px 12px clamp(36px,5vw,40px)", color:"#f5edd8",
                fontSize:"13px", outline:"none", boxSizing:"border-box",
                fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.05em" }}/>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="fac-wrap">
          {loading ? (
            <div className="fac-grid">
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i}/>)}
            </div>
          ) : error ? (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}>⚠️</div>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"rgba(240,112,112,0.8)",
                fontSize:"18px", marginBottom:"8px" }}>Could not load facilities</p>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>Please check your connection and try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔍</div>
              <p style={{ fontFamily:"'Playfair Display',serif", color:"rgba(220,200,165,0.6)",
                fontSize:"clamp(16px,3vw,20px)", marginBottom:"8px" }}>No facilities found</p>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px" }}>
                {search ? `No results for "${search}"` : "No facilities have been added yet."}
              </p>
              {search && (
                <button onClick={() => setSearch("")} style={{ marginTop:"16px",
                  background:"rgba(201,169,110,0.1)", border:"1px solid rgba(201,169,110,0.3)",
                  borderRadius:"8px", padding:"8px 20px", color:"#c9a96e", fontSize:"13px",
                  cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>Clear Search</button>
              )}
            </div>
          ) : (
            <>
              <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.25)", marginBottom:"clamp(16px,3vw,28px)",
                fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.1em" }}>
                {filtered.length} facilit{filtered.length !== 1 ? "ies" : "y"} available
              </p>
              <div className="fac-grid">
                {filtered.map((f, i) => {
                  const accent   = FAC_ACCENT_CYCLE[i % FAC_ACCENT_CYCLE.length]
                  const icon     = getFacilityIcon(f.name, i)
                  const imageUrl = f.images?.[0] ? toImageUrl(f.images[0]) : null
                  return (
                    <div key={f._id} className="fac-grid-card"
                      onClick={() => navigate(`/facilities/${f._id}`)}
                      style={{ background:"rgba(255,255,255,0.025)",
                        border:`1px solid rgba(201,169,110,0.1)`,
                        borderRadius:"14px", overflow:"hidden", position:"relative",
                        animation:`fadeUp .5s ${Math.min(i * 0.06, 0.3).toFixed(2)}s forwards` }}>
                      <div className="fac-card-img" style={{ overflow:"hidden", position:"relative",
                        background:`linear-gradient(135deg, ${accent}15 0%, #0a0804 100%)` }}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={f.name} className="fac-grid-img"
                            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                            onError={e => { e.target.style.display = "none" }}/>
                        ) : (
                          <div className="fac-grid-img" style={{ width:"100%", height:"100%",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"clamp(40px,8vw,60px)" }}>
                            <div style={{ position:"absolute", inset:0,
                              background:`radial-gradient(ellipse at 50% 60%, ${accent}20, transparent 70%)` }}/>
                            <span style={{ position:"relative" }}>{icon}</span>
                          </div>
                        )}
                        <div style={{ position:"absolute", inset:0,
                          background:"linear-gradient(to top, rgba(8,6,4,0.7) 0%, transparent 55%)",
                          pointerEvents:"none" }}/>
                        <div style={{ position:"absolute", top:"14px", right:"14px", width:"8px", height:"8px",
                          borderRadius:"50%", background:accent, boxShadow:`0 0 12px ${accent}` }}/>
                      </div>

                      <div style={{ padding:"clamp(16px,2.5vw,22px) clamp(16px,2.5vw,24px) clamp(18px,2.5vw,24px)",
                        position:"relative" }}>
                        <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px",
                          background:`linear-gradient(90deg, transparent, ${accent}35, transparent)` }}/>
                        <h3 style={{ fontFamily:"'Playfair Display',serif",
                          fontSize:"clamp(1rem,2.5vw,1.2rem)", color:"#f5edd8",
                          fontWeight:600, marginBottom:"10px", lineHeight:1.3 }}>
                          {f.name}
                        </h3>
                        <p style={{ color:"rgba(220,200,165,0.55)", fontSize:"clamp(12px,1.5vw,13px)",
                          lineHeight:1.75, fontFamily:"sans-serif", margin:"0 0 18px",
                          display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                          {f.description || "A world-class facility crafted for the discerning guest."}
                        </p>
                        <div className="card-explore-btn" style={{ display:"inline-flex", alignItems:"center",
                          gap:"8px", background:"rgba(201,169,110,0.08)",
                          border:"1px solid rgba(201,169,110,0.25)", borderRadius:"8px",
                          padding:"8px 18px", fontSize:"11px", letterSpacing:"0.2em",
                          textTransform:"uppercase", color:"rgba(201,169,110,0.7)",
                          fontFamily:"'Cormorant Garamond',serif" }}>
                          <span>View Details</span>
                          <span style={{ fontSize:"13px" }}>→</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {!loading && !error && filtered.length > 0 && (
          <div style={{ borderTop:"1px solid rgba(201,169,110,0.1)",
            padding:"clamp(40px,6vw,60px) clamp(16px,4vw,40px)", textAlign:"center",
            background:"linear-gradient(to top, rgba(201,169,110,0.04), transparent)" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.1rem,2.5vw,1.4rem)",
              color:"rgba(220,200,165,0.7)", marginBottom:"20px" }}>
              Ready to experience royal luxury?
            </p>
            <button onClick={() => navigate("/rooms")} style={{
              padding:"14px 36px", borderRadius:"8px",
              background:"linear-gradient(135deg,#c9a96e,#a07838)",
              color:"#0e0c09", fontWeight:700, fontSize:"12px",
              letterSpacing:"0.3em", textTransform:"uppercase", border:"none",
              cursor:"pointer", fontFamily:"'Cormorant Garamond',serif",
              boxShadow:"0 6px 24px rgba(201,169,110,0.25)" }}>
              Book Your Stay →
            </button>
          </div>
        )}
      </div>
    </>
  )
}