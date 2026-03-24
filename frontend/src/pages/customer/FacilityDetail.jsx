// src/pages/customer/FacilityDetail.jsx
// Fully responsive — 2-col layout on desktop stacks to 1 col on mobile
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://resort-management-system.onrender.com"
const toImageUrl  = p => { if (!p) return null; if (p.startsWith("http")) return p; return `${BACKEND_URL}/${p.replace(/^\/+/, "")}` }

const FAC_ICONS = ["🏊","🍽","💆","🌿","🎭","✈️","🏋️","🎾","🚗","🛎","🏌️","🎯","🍷","🌊","🔥","🎨"]
function getFacilityIcon(name, fallbackIndex = 0) {
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
  return FAC_ICONS[fallbackIndex % FAC_ICONS.length]
}

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  @keyframes fadeUp    { from{opacity:0} to{opacity:1} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes shimmer   { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes kenBurns  { 0%{transform:scale(1)} 100%{transform:scale(1.08)} }
  @keyframes slideInUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .thumb-img { transition: transform 0.4s cubic-bezier(.4,0,.2,1), opacity 0.3s !important; cursor: pointer; }
  .thumb-img:hover { transform: scale(1.04) !important; }
  .back-btn { transition: all 0.22s !important; }
  .back-btn:hover {
    border-color: rgba(201,169,110,0.5) !important;
    color: #c9a96e !important;
    background: rgba(201,169,110,0.08) !important;
    transform: translateX(-3px) !important;
  }
  .book-btn { transition: all 0.25s cubic-bezier(.4,0,.2,1) !important; }
  .book-btn:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 36px rgba(201,169,110,0.4) !important; }
  .lightbox-overlay { animation: fadeIn 0.2s ease both; }
  .lightbox-img     { animation: fadeUp 0.3s ease forwards; }

  /* Responsive hero */
  .fd-hero { height: clamp(260px, 40vw, 520px); }

  /* Responsive content grid — 1 col on mobile, 2 col on lg */
  .fd-content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    align-items: start;
  }
  @media (min-width: 768px) {
    .fd-content-grid { grid-template-columns: 1fr 1fr; gap: 48px; }
  }
  @media (min-width: 1024px) {
    .fd-content-grid { gap: 60px; }
  }

  /* Responsive page padding */
  .fd-wrap { max-width: 1100px; margin: 0 auto; padding: 0 clamp(16px,4vw,40px) clamp(60px,8vw,100px); }
  .fd-title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: clamp(24px,4vw,36px);
    padding-top: clamp(24px,4vw,40px);
    animation: fadeUp .6s forwards;
  }

  /* Thumbnail grid adapts */
  .fd-thumb-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  @media (max-width: 360px) {
    .fd-thumb-grid { grid-template-columns: repeat(3, 1fr); }
  }
`

function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  useEffect(() => {
    const handler = e => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % images.length)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [images.length])

  return (
    <div className="lightbox-overlay" onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.93)",
        backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <button onClick={onClose} style={{ position:"absolute", top:"20px", right:"24px",
        background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)",
        borderRadius:"50%", width:"40px", height:"40px", display:"flex", alignItems:"center",
        justifyContent:"center", color:"rgba(255,255,255,0.7)", fontSize:"18px", cursor:"pointer" }}>✕</button>
      <div style={{ position:"absolute", top:"24px", left:"50%", transform:"translateX(-50%)",
        fontSize:"12px", color:"rgba(255,255,255,0.4)", fontFamily:"'Cormorant Garamond',serif",
        letterSpacing:"0.2em" }}>{idx + 1} / {images.length}</div>
      <img key={idx} src={images[idx]} alt={`Photo ${idx + 1}`} className="lightbox-img"
        style={{ maxWidth:"88vw", maxHeight:"80vh", objectFit:"contain", borderRadius:"8px",
          boxShadow:"0 40px 100px rgba(0,0,0,0.7)" }}/>
      {images.length > 1 && (<>
        <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
          style={{ position:"absolute", left:"clamp(8px,2vw,20px)", top:"50%", transform:"translateY(-50%)",
            width:"48px", height:"48px", borderRadius:"50%", background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)",
            fontSize:"22px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>‹</button>
        <button onClick={() => setIdx(i => (i + 1) % images.length)}
          style={{ position:"absolute", right:"clamp(8px,2vw,20px)", top:"50%", transform:"translateY(-50%)",
            width:"48px", height:"48px", borderRadius:"50%", background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.7)",
            fontSize:"22px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>›</button>
      </>)}
      {images.length > 1 && (
        <div style={{ position:"absolute", bottom:"24px", left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:"8px" }}>
          {images.map((_,i) => <button key={i} onClick={() => setIdx(i)} style={{
            width:i===idx?"24px":"7px", height:"4px", borderRadius:"2px", border:"none",
            padding:0, cursor:"pointer", background:i===idx?"#c9a96e":"rgba(255,255,255,0.2)",
            transition:"all 0.3s" }}/>)}
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div style={{ background:"#080604", minHeight:"100vh" }}>
      <div className="fd-hero" style={{ background:"rgba(255,255,255,0.04)" }}/>
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"clamp(24px,4vw,60px) clamp(16px,4vw,40px)" }}>
        <div style={{ height:40, width:"50%", background:"rgba(255,255,255,0.06)", borderRadius:8, marginBottom:20 }}/>
        <div style={{ height:16, width:"90%", background:"rgba(255,255,255,0.04)", borderRadius:4, marginBottom:8 }}/>
        <div style={{ height:16, width:"75%", background:"rgba(255,255,255,0.04)", borderRadius:4 }}/>
      </div>
    </div>
  )
}

export default function FacilityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [facility,  setFacility]  = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [lightbox,  setLightbox]  = useState(null)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/facilities/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { setFacility(data); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [id])

  if (loading) return <><style>{GLOBAL_CSS}</style><Skeleton/></>

  if (error || !facility) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <div style={{ background:"#080604", minHeight:"100vh", display:"flex", alignItems:"center",
          justifyContent:"center", flexDirection:"column", gap:"16px", padding:"16px" }}>
          <div style={{ fontSize:"64px" }}>🏚️</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", color:"rgba(240,112,112,0.8)",
            fontSize:"clamp(18px,4vw,24px)", textAlign:"center" }}>Facility not found</h2>
          <button onClick={() => navigate("/facilities")} style={{
            background:"rgba(201,169,110,0.12)", border:"1px solid rgba(201,169,110,0.3)",
            borderRadius:"8px", padding:"10px 22px", color:"#c9a96e", fontSize:"13px",
            cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
            ← Back to Facilities
          </button>
        </div>
      </>
    )
  }

  const imageUrls = (facility.images || []).map(toImageUrl).filter(Boolean)
  const icon   = getFacilityIcon(facility.name)
  const accent = "#c9a96e"

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {lightbox !== null && <Lightbox images={imageUrls} startIndex={lightbox} onClose={() => setLightbox(null)}/>}

      <div style={{ background:"#080604", minHeight:"100vh", color:"#f5edd8" }}>

        {/* ── Hero ── */}
        <div className="fd-hero" style={{ position:"relative", overflow:"hidden" }}>
          {imageUrls.length > 0 ? (
            <>
              {imageUrls.map((url, i) => (
                <img key={i} src={url} alt={`${facility.name} ${i+1}`}
                  style={{ position:i===0?"relative":"absolute", inset:0, width:"100%", height:"100%",
                    objectFit:"cover", display:"block",
                    opacity:i===activeImg?1:0, transition:"opacity 0.6s cubic-bezier(.4,0,.2,1)",
                    animation:i===activeImg?"kenBurns 10s ease-in-out infinite alternate":"none" }}
                  onError={e => { e.target.style.display = "none" }}/>
              ))}
            </>
          ) : (
            <div style={{ width:"100%", height:"100%",
              background:`linear-gradient(135deg, ${accent}15 0%, #0a0804 100%)`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"clamp(60px,12vw,100px)" }}>
              {icon}
            </div>
          )}
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to bottom, rgba(8,6,4,0.3) 0%, rgba(8,6,4,0.0) 40%, rgba(8,6,4,0.7) 80%, rgba(8,6,4,1) 100%)",
            pointerEvents:"none" }}/>
          {imageUrls.length > 1 && (
            <div style={{ position:"absolute", bottom:"clamp(16px,3vw,32px)", right:"clamp(16px,3vw,32px)",
              display:"flex", gap:"6px", zIndex:5 }}>
              {imageUrls.map((_, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width:i===activeImg?"20px":"6px", height:"4px", borderRadius:"2px",
                  border:"none", padding:0, cursor:"pointer",
                  background:i===activeImg?accent:"rgba(255,255,255,0.35)", transition:"all 0.3s" }}/>
              ))}
            </div>
          )}
          {imageUrls.length > 0 && (
            <button onClick={() => setLightbox(activeImg)} style={{
              position:"absolute", bottom:"clamp(16px,3vw,28px)", left:"clamp(16px,3vw,32px)",
              display:"flex", alignItems:"center", gap:"7px",
              background:"rgba(8,6,4,0.7)", backdropFilter:"blur(10px)",
              border:"1px solid rgba(255,255,255,0.12)", borderRadius:"8px",
              padding:"8px 14px", color:"rgba(255,255,255,0.55)", fontSize:"12px",
              cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
              📷 <span>{imageUrls.length} photo{imageUrls.length !== 1 ? "s" : ""}</span>
            </button>
          )}
        </div>

        {/* ── Main Content ── */}
        <div className="fd-wrap">

          {/* Title row */}
          <div className="fd-title-row">
            <div>
              <p style={{ fontSize:"11px", letterSpacing:"0.4em", textTransform:"uppercase",
                color:"rgba(201,169,110,0.65)", marginBottom:"10px",
                fontFamily:"'Cormorant Garamond',serif" }}>✦ Resort Facility ✦</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif",
                fontSize:"clamp(1.5rem,4vw,3rem)", color:"#f5edd8", fontWeight:700, lineHeight:1.15 }}>
                {facility.name}
              </h1>
              <div style={{ width:"48px", height:"1px",
                background:"linear-gradient(90deg,#c9a96e,transparent)", marginTop:"14px" }}/>
            </div>
            <Link to="/rooms" className="book-btn" style={{
              padding:"clamp(10px,1.5vw,13px) clamp(18px,3vw,28px)", borderRadius:"8px",
              background:"linear-gradient(135deg,#c9a96e,#a07838)", color:"#0e0c09",
              fontWeight:700, fontSize:"clamp(11px,1.5vw,12px)", letterSpacing:"0.25em",
              textTransform:"uppercase", textDecoration:"none",
              fontFamily:"'Cormorant Garamond',serif",
              display:"inline-flex", alignItems:"center", gap:"8px",
              boxShadow:"0 6px 24px rgba(201,169,110,0.25)", whiteSpace:"nowrap", alignSelf:"center" }}>
              Book a Room <span style={{ fontSize:"15px" }}>→</span>
            </Link>
          </div>

          {/* 2-col grid — stacks on mobile */}
          <div className="fd-content-grid">

            {/* Left: Description */}
            <div style={{ animation:"fadeUp .6s .08s forwards" }}>
              {facility.description ? (
                <div style={{ background:"rgba(255,255,255,0.02)",
                  border:"1px solid rgba(201,169,110,0.1)", borderRadius:"14px",
                  padding:"clamp(18px,3vw,28px) clamp(18px,3vw,30px)", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px",
                    background:"linear-gradient(90deg,transparent,rgba(201,169,110,0.25),transparent)" }}/>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem",
                    color:"rgba(201,169,110,0.7)", fontWeight:600, letterSpacing:"0.15em",
                    textTransform:"uppercase", marginBottom:"16px" }}>About This Facility</h2>
                  <p style={{ fontFamily:"sans-serif", color:"rgba(220,200,165,0.7)",
                    fontSize:"clamp(13px,1.5vw,15px)", lineHeight:1.85, margin:0 }}>
                    {facility.description}
                  </p>
                </div>
              ) : (
                <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:"14px", padding:"clamp(18px,3vw,28px) clamp(18px,3vw,30px)", textAlign:"center" }}>
                  <div style={{ fontSize:"48px", marginBottom:"12px" }}>{icon}</div>
                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px",
                    fontFamily:"'Cormorant Garamond',serif" }}>
                    Experience world-class {facility.name.toLowerCase()} at Royal Palace Resort.
                  </p>
                </div>
              )}

              <div style={{ marginTop:"20px", background:"rgba(201,169,110,0.05)",
                border:"1px solid rgba(201,169,110,0.12)", borderRadius:"12px",
                padding:"clamp(14px,2.5vw,20px) clamp(16px,3vw,24px)" }}>
                <div style={{ fontSize:"11px", letterSpacing:"0.3em", color:"rgba(201,169,110,0.6)",
                  textTransform:"uppercase", fontFamily:"'Cormorant Garamond',serif", marginBottom:"14px" }}>
                  Facility Info
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {[
                    { label:"Location",     value:"Royal Palace Resort", color:"rgba(220,200,165,0.8)" },
                    { label:"Availability", value:"Open for guests",     color:"#52C07A" },
                    ...(imageUrls.length > 0 ? [{ label:"Gallery", value:`${imageUrls.length} photo${imageUrls.length !== 1?"s":""}`, color:"rgba(220,200,165,0.8)" }] : []),
                  ].map(({ label, value, color }, i, arr) => (
                    <div key={label} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      paddingBottom: i < arr.length - 1 ? "10px" : 0,
                    }}>
                      <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", fontFamily:"'Cormorant Garamond',serif" }}>{label}</span>
                      <span style={{ fontSize:"13px", color, fontWeight:600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => navigate("/facilities")} style={{
                marginTop:"16px", width:"100%", background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px",
                padding:"12px", color:"rgba(255,255,255,0.4)", fontSize:"12px",
                cursor:"pointer", fontFamily:"'Cormorant Garamond',serif",
                letterSpacing:"0.15em", textTransform:"uppercase", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(201,169,110,0.3)"; e.currentTarget.style.color="#c9a96e" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.color="rgba(255,255,255,0.4)" }}>
                ← View All Facilities
              </button>
            </div>

            {/* Right: Gallery */}
            <div style={{ animation:"fadeUp .6s .16s forwards" }}>
              {imageUrls.length > 0 ? (
                <div>
                  <div style={{ borderRadius:"12px", overflow:"hidden",
                    aspectRatio:"4/3", marginBottom:"12px", position:"relative", cursor:"pointer" }}
                    onClick={() => setLightbox(activeImg)}>
                    <img src={imageUrls[activeImg]} alt={facility.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
                    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0)", transition:"background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}/>
                    <div style={{ position:"absolute", bottom:"12px", right:"12px",
                      background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)",
                      border:"1px solid rgba(255,255,255,0.12)", borderRadius:"6px",
                      padding:"5px 10px", fontSize:"11px", color:"rgba(255,255,255,0.6)",
                      fontFamily:"'Cormorant Garamond',serif" }}>🔍 Enlarge</div>
                  </div>
                  {imageUrls.length > 1 && (
                    <div className="fd-thumb-grid">
                      {imageUrls.map((url, i) => (
                        <div key={i} onClick={() => setActiveImg(i)} className="thumb-img"
                          style={{ borderRadius:"8px", overflow:"hidden", aspectRatio:"1",
                            cursor:"pointer", border:i===activeImg?`2px solid ${accent}`:"2px solid transparent",
                            opacity:i===activeImg?1:0.65, transition:"opacity 0.2s, border-color 0.2s" }}>
                          <img src={url} alt={`Thumbnail ${i+1}`}
                            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                            onError={e => { e.target.parentNode.style.display = "none" }}/>
                        </div>
                      ))}
                    </div>
                  )}
                  {imageUrls.length > 4 && (
                    <button onClick={() => setLightbox(0)} style={{ marginTop:"10px", width:"100%",
                      background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)",
                      borderRadius:"8px", padding:"10px", color:"rgba(255,255,255,0.4)",
                      fontSize:"12px", cursor:"pointer", fontFamily:"'Cormorant Garamond',serif" }}>
                      View all {imageUrls.length} photos →
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ borderRadius:"14px", overflow:"hidden", aspectRatio:"4/3",
                  background:`linear-gradient(135deg, ${accent}12 0%, #0d0a06 100%)`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
                  gap:"12px", border:"1px solid rgba(201,169,110,0.1)", position:"relative" }}>
                  <div style={{ position:"absolute", inset:0,
                    background:`radial-gradient(ellipse at 50% 60%, ${accent}15, transparent 65%)`, borderRadius:"14px" }}/>
                  <span style={{ fontSize:"clamp(50px,10vw,80px)", position:"relative" }}>{icon}</span>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", color:"rgba(201,169,110,0.5)",
                    fontSize:"14px", letterSpacing:"0.1em", position:"relative" }}>
                    {facility.name}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}