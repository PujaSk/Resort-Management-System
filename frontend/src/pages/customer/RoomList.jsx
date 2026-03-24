// src/pages/customer/RoomList.jsx
// Fully responsive — 1-col mobile, 2-col tablet, 3-col desktop
import React, { useState, useEffect } from "react"
import { getRoomTypes } from "../../services/roomService"
import Loader from "../../components/ui/Loader"
import { useNavigate } from "react-router-dom"

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const IconUsers = ({ size = 12, color = "rgba(201,168,76,.7)" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export const IconBed = ({ size = 24, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size}
    viewBox="0 0 512 512" fill={color}>
    <path d="M239.802 74.44v.19h12.275v29.433h.004v31.265a85 85 0 0 0-10.095-1.084c-26.8-1.293-55.033 8.738-73.23 13.36l-7.545 1.92l.582 5.564c-.46-.176-.917-.356-1.387-.525l-.705-.256l-.74-.135c-4.097-.747-8.27-1.193-12.48-1.39c-29.477-1.372-60.834 9.463-81.174 14.523l-7.612 1.892l.836 7.8c.605 5.644 1.218 11.59 2.774 17.493c-10.642 13.072-10.078 18.35-8.417 27.184l211.14 73.916v74.053C184.03 336.45 106.252 295.828 25.582 264.49v-170h18v.125h12.374v34.77l165.848-21.414V74.44zm-2.088 77.845q1.804-.02 3.564.04c2.818.095 5.505.396 8.09.84c13.548 5.197 20.296 12.637 24.25 21.462c-23.255 9.644-44.174 13.507-62.515 15.736c-5.277-1.15-9.503-2.466-12.944-3.894a63.3 63.3 0 0 0-16.522-20.16a92 92 0 0 1-.584-3.33c17.414-4.63 38.614-10.504 56.66-10.695zm-94.35 18.528q2.07-.022 4.09.046a69 69 0 0 1 9.26.95c15.757 5.89 23.546 14.435 28.002 24.526c-26.44 10.85-50.22 15.162-70.965 17.62c-17.42-3.692-25.116-8.99-29.17-14.665c-3.072-4.302-4.524-9.753-5.53-16.518c19.495-5.077 43.62-11.753 64.314-11.96zM291.8 186.295l26.406 7.453c-59.194 10.41-125.095 28.732-165.18 45.766l-27.443-9.17c21.235-3.146 45.785-8.753 72.568-20.846l5.29-2.39c1.72.44 3.5.853 5.35 1.232l1.42.29l1.44-.17c21.562-2.54 47.905-7.294 77.15-20.782zm68.797 19.418l51.336 14.49l-147.905 38.377v17.6l-82.517-27.147l-1.77-.59c49.176-17.717 124.438-36.303 180.857-42.73zm127.79 13.68v90.57L283.69 372.127v-99.62zM23.613 282.45L60.837 299v14.674L39.98 322.13l-16.366-10.57zm463.26 49.243v34.995l-21.91 9.515l-16.367-7.4v-25.487zm-234.453 52.49l11.608 5.16l9.442 4.196l19.342-6.87v40.848l-22.704 10.043l-17.687-12.685z"/>
  </svg>
)

/* ── Inject bed animation keyframe once ── */
if (typeof document !== "undefined" && !document.getElementById("bed-anim-style")) {
  const s = document.createElement("style")
  s.id = "bed-anim-style"
  s.textContent = `
    @keyframes bed-breathe {
      0%   { transform: scale(1)    translateZ(0); }
      50%  { transform: scale(1.06) translateZ(0); }
      100% { transform: scale(1)    translateZ(0); }
    }
  `
  document.head.appendChild(s)
}

/* ── Decorative SVG (hidden on very small screens) ── */
function BedSVG() {
  return (
    <div style={{ position:"fixed", top:15, right:-10, pointerEvents:"none", zIndex:0 }}
      className="bed-deco">
      <style>{`
        .bed-deco { display: none; }
        @media (min-width: 640px) { .bed-deco { display: block; } }
      `}</style>
      <svg viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg"
        style={{
          display:"block",
          width:"clamp(240px, 40vw, 480px)",
          height:"auto",
          opacity:0.136,
          transformOrigin:"top right",
          animation:"bed-breathe 8s ease-in-out infinite",
        }}>
        <g fill="none" stroke="#C9A84C" strokeLinecap="round" strokeLinejoin="round">
          <line x1="20" y1="255" x2="500" y2="255" strokeWidth="1.2" opacity=".5"/>
          <path d="M90 255 L85 285 M90 255 L95 285" strokeWidth="1.8"/>
          <path d="M390 255 L385 285 M390 255 L395 285" strokeWidth="1.8"/>
          <path d="M85 255 Q82 240 85 228 L395 228 Q398 240 395 255" strokeWidth="2"/>
          <path d="M90 270 Q240 278 390 270" strokeWidth=".8" opacity=".4" strokeDasharray="6 4"/>
          <path d="M80 228 Q78 210 82 198 L398 198 Q402 210 400 228 Z" strokeWidth="2" fill="rgba(201,168,76,.04)"/>
          <path d="M82 198 Q80 192 85 188 L395 188 Q400 192 398 198" strokeWidth="1.5"/>
          <path d="M85 188 Q84 182 88 178 L392 178 Q396 182 395 188" strokeWidth="1.5"/>
          <path d="M88 188 Q140 172 240 176 Q340 180 392 188" strokeWidth="2.2"/>
          <path d="M88 188 Q84 220 86 228" strokeWidth="1.8"/>
          <path d="M392 188 Q396 220 394 228" strokeWidth="1.8"/>
          <path d="M150 179 Q200 170 250 174 Q300 178 350 175" strokeWidth="1.2" opacity=".6"/>
          <path d="M120 188 Q240 196 360 188" strokeWidth="1" opacity=".5"/>
          <path d="M110 178 Q108 155 115 148 Q150 140 185 148 Q192 155 190 178 Q150 184 110 178 Z" strokeWidth="1.8" fill="rgba(201,168,76,.06)"/>
          <path d="M118 160 Q150 155 182 160" strokeWidth="1" opacity=".5"/>
          <path d="M210 178 Q208 155 215 148 Q250 140 285 148 Q292 155 290 178 Q250 184 210 178 Z" strokeWidth="1.8" fill="rgba(201,168,76,.06)"/>
          <path d="M218 160 Q250 155 282 160" strokeWidth="1" opacity=".5"/>
          <path d="M82 178 Q80 140 85 115 Q88 95 100 88 Q180 72 240 74 Q300 72 380 88 Q392 95 395 115 Q400 140 398 178" strokeWidth="2.2" fill="rgba(201,168,76,.03)"/>
          <path d="M105 172 Q103 138 108 118 Q112 102 125 96 Q180 82 240 84 Q300 82 355 96 Q368 102 372 118 Q377 138 375 172" strokeWidth="1.3" opacity=".6"/>
          <path d="M110 130 Q175 108 240 112 Q305 108 370 130" strokeWidth="1.4" opacity=".55"/>
          <circle cx="240" cy="125" r="2.5" fill="rgba(201,168,76,.4)" stroke="none"/>
          <circle cx="200" cy="130" r="1.8" fill="rgba(201,168,76,.3)" stroke="none"/>
          <circle cx="280" cy="130" r="1.8" fill="rgba(201,168,76,.3)" stroke="none"/>
          <circle cx="240" cy="150" r="1.8" fill="rgba(201,168,76,.3)" stroke="none"/>
          <ellipse cx="435" cy="210" rx="38" ry="8" strokeWidth="1.8" fill="rgba(201,168,76,.04)"/>
          <path d="M435 218 Q435 240 428 255 M435 218 Q435 240 442 255" strokeWidth="1.6"/>
          <path d="M420 255 Q435 260 450 255" strokeWidth="1.4"/>
          <path d="M428 210 Q425 198 426 188 Q427 178 435 175 Q443 178 444 188 Q445 198 442 210" strokeWidth="1.6" fill="rgba(201,168,76,.04)"/>
          <path d="M430 188 Q435 185 440 188" strokeWidth="1" opacity=".6"/>
          <path d="M435 175 Q433 160 430 148" strokeWidth="1.4"/>
          <path d="M430 148 Q420 135 415 122 Q425 125 430 136 Q430 148 430 148" strokeWidth="1.2" fill="rgba(201,168,76,.06)"/>
          <path d="M430 155 Q440 142 448 132 Q442 138 435 148" strokeWidth="1.2" fill="rgba(201,168,76,.06)"/>
          <path d="M430 162 Q418 152 412 140 Q422 144 430 154" strokeWidth="1.1" fill="rgba(201,168,76,.05)" opacity=".7"/>
        </g>
      </svg>
    </div>
  )
}

/* ─────────────────────────────────────────
   ROOM CARD
───────────────────────────────────────── */
function RoomCard({ type, index, onBook }) {
  return (
    <div
      className={`card group cursor-pointer anim-up d${Math.min(index + 1, 5)} overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-gold`}
      style={{ border:"1px solid rgba(255,255,255,.06)", padding:0 }}
    >
      {/* IMAGE */}
      <div style={{ height:"clamp(160px, 22vw, 192px)", overflow:"hidden" }}>
        {type.images?.length > 0 ? (
          <img
            src={`http://resort-management-system.onrender.com/${type.images[0]}`}
            alt={type.type_name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-5xl"
            style={{ background:"#211E17", color:"rgba(201,168,76,.2)", fontSize:"clamp(32px,6vw,48px)" }}>
            🛏
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ padding:"clamp(14px, 3vw, 20px)" }}>
        {/* Title + Price row */}
        <div className="flex justify-between items-start" style={{ marginBottom:8 }}>
          <div style={{ flex:1, minWidth:0, paddingRight:8 }}>
            <h3 className="font-display text-cream"
              style={{ fontSize:"clamp(15px, 2.5vw, 18px)", fontWeight:600, lineHeight:1.3 }}>
              {type.type_name}
            </h3>
            <p className="text-resort-muted flex items-center gap-1"
              style={{ fontSize:"clamp(10px, 1.5vw, 12px)", marginTop:3 }}>
              <IconUsers size={11} />{type.capacity} guests
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-gold font-bold"
              style={{ fontSize:"clamp(15px, 2.5vw, 18px)" }}>
              ₹{type.price_per_night?.toLocaleString()}
            </p>
            <p className="text-resort-dim" style={{ fontSize:"clamp(10px, 1.5vw, 11px)" }}>per night</p>
          </div>
        </div>

        {/* Description */}
        {type.description && (
          <p className="text-resort-muted line-clamp-2"
            style={{ fontSize:"clamp(11px, 1.5vw, 13px)", marginBottom:10, lineHeight:1.6 }}>
            {type.description}
          </p>
        )}

        {/* Bed Configuration */}
        {type.beds?.length > 0 && (
          <div className="flex flex-wrap items-center" style={{ gap:6, marginBottom:10 }}>
            <div className="flex items-center gap-1 text-gold font-medium"
              style={{ fontSize:"clamp(10px, 1.5vw, 12px)", marginRight:4 }}>
              <IconBed size={15} />
              <span>Beds:</span>
            </div>
            {type.beds.map((bed, i) => (
              <span key={i}
                className="text-gold"
                style={{
                  padding:"2px 8px", borderRadius:6, fontSize:"clamp(10px, 1.4vw, 11px)",
                  background:"#211E17", border:"1px solid #2C271F",
                }}>
                {bed.count} {bed.type}
              </span>
            ))}
          </div>
        )}

        {/* Amenities */}
        {type.amenities?.length > 0 && (
          <div className="flex flex-wrap" style={{ gap:5, marginBottom:14 }}>
            {type.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-gold"
                style={{
                  padding:"2px 10px", borderRadius:999, fontSize:"clamp(9px, 1.3vw, 10px)",
                  fontWeight:500, background:"rgba(201,168,76,.08)",
                  border:"1px solid rgba(201,168,76,.15)",
                }}>
                {a}
              </span>
            ))}
            {type.amenities.length > 3 && (
              <span className="text-gold"
                style={{
                  padding:"2px 8px", borderRadius:999, fontSize:12, fontWeight:500,
                  background:"rgba(201,168,76,.05)", border:"1px dashed rgba(201,168,76,.25)",
                }}>
                +{type.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        <button
          onClick={onBook}
          className="w-full gold-btn font-bold"
          style={{
            padding:"clamp(8px, 1.5vw, 10px) 0",
            borderRadius:12, fontSize:"clamp(12px, 1.5vw, 14px)",
            color:"#0E0C09",
          }}>
          Book Now
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function RoomList() {
  const [roomTypes, setRoomTypes] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    getRoomTypes()
      .then(r => setRoomTypes(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = roomTypes.filter(rt => {
    const name = (rt.type_name || "").toLowerCase()
    return name.includes(search.toLowerCase()) && !name.includes("hall")
  })

  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <BedSVG />

      {/* Responsive padding: tight on mobile, generous on desktop */}
      <div
        className="roomlist-wrap"
        style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto" }}>
        <style>{`
          .roomlist-wrap {
            padding: 40px 16px 48px;
          }
          @media (min-width: 480px) {
            .roomlist-wrap { padding: 48px 24px 56px; }
          }
          @media (min-width: 768px) {
            .roomlist-wrap { padding: 56px 32px 64px; }
          }
          @media (min-width: 1024px) {
            .roomlist-wrap { padding: 64px 40px 72px; }
          }

          /* Responsive card grid */
          .room-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
          }
          @media (min-width: 480px) {
            .room-grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
          }
          @media (min-width: 900px) {
            .room-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          }

          /* Search input responsive width */
          .room-search {
            width: 100%;
            max-width: 100%;
          }
          @media (min-width: 480px) {
            .room-search { max-width: 380px; }
          }
        `}</style>

        {/* ── Header ── */}
        <div className="text-center anim-up" style={{ marginBottom:"clamp(32px,5vw,56px)" }}>
          <h1 className="font-display font-bold text-cream"
            style={{ fontSize:"clamp(26px, 5vw, 40px)", marginBottom:10 }}>
            Our Rooms &amp; Suites
          </h1>
          <p className="text-resort-muted" style={{ fontSize:"clamp(13px, 2vw, 15px)" }}>
            {roomTypes.length} room categories available
          </p>
          <input
            placeholder="Search room type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="f-input room-search"
            style={{ display:"block", margin:"20px auto 0" }}
          />
        </div>

        {/* ── Content ── */}
        {loading ? (
          <Loader text="Loading rooms…" />
        ) : filtered.length === 0 ? (
          <div className="text-center text-resort-dim"
            style={{ padding:"clamp(48px, 10vw, 80px) 0" }}>
            <div style={{ fontSize:"clamp(36px, 8vw, 52px)", marginBottom:16 }}>🛏</div>
            <p style={{ fontSize:"clamp(13px, 2vw, 15px)" }}>No room types found.</p>
          </div>
        ) : (
          <div className="room-grid">
            {filtered.map((type, i) => (
              <RoomCard
                key={type._id}
                type={type}
                index={i}
                onBook={() => navigate(`/rooms/${type._id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}