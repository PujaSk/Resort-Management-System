// src/pages/admin/pages/Feedback.jsx
import React, { useEffect, useState, useMemo } from "react"
import { getAllFeedback } from "../../../services/bookingService"

/* ── Stars ─────────────────────────────────────────────────────────── */
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= rating ? "#C9A84C" : "none"}
          stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  )
}

/* ── Rating colour meta ─────────────────────────────────────────────── */
function ratingMeta(r) {
  if (r >= 5) return { label: "Excellent", bg: "rgba(34,197,94,.12)",  color: "#4ade80", border: "rgba(34,197,94,.2)"  }
  if (r >= 4) return { label: "Very Good", bg: "rgba(201,168,76,.12)", color: "#C9A84C", border: "rgba(201,168,76,.2)" }
  if (r >= 3) return { label: "Average",   bg: "rgba(251,191,36,.1)",  color: "#fbbf24", border: "rgba(251,191,36,.2)" }
  if (r >= 2) return { label: "Poor",      bg: "rgba(239,68,68,.1)",   color: "#f87171", border: "rgba(239,68,68,.2)"  }
  return              { label: "Terrible", bg: "rgba(220,38,38,.12)",  color: "#ef4444", border: "rgba(220,38,38,.25)" }
}

/* ── Animated SVG ring ──────────────────────────────────────────────── */
function RatingRing({ rating, size = 72 }) {
  const meta = ratingMeta(rating)
  const R    = 26
  const circ = +(2 * Math.PI * R).toFixed(2)
  const fill = +((rating / 5) * circ).toFixed(2)
  // unique animation name so multiple rings on the same page don't clash
  const anim = `ring_${String(rating).replace(".", "_")}_${size}`

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <style>{`
        @keyframes ${anim} {
          from { stroke-dashoffset: ${circ}; }
          to   { stroke-dashoffset: ${circ - fill}; }
        }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 64 64"
        style={{ transform: "rotate(-90deg)", display: "block" }}>
        {/* track */}
        <circle cx="32" cy="32" r={R}
          fill="none" stroke="rgba(201,168,76,.12)" strokeWidth="5.5" />
        {/* filled arc */}
        <circle cx="32" cy="32" r={R}
          fill="none" stroke={meta.color} strokeWidth="5.5" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          style={{ animation: `${anim} 1s cubic-bezier(.4,0,.2,1) both` }}
        />
      </svg>
      {/* centre label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: meta.color, lineHeight: 1 }}>
          {rating}
        </span>
        <span style={{ fontSize: 9, color: "#5a5047", lineHeight: 1.4 }}>/ 5</span>
      </div>
    </div>
  )
}

/* ── Stat card ──────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, accent = "#C9A84C" }) {
  return (
    <div style={{
      background: "#18150F", border: "1px solid rgba(201,168,76,.12)",
      borderRadius: 14, padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 6,
    }}>
      <p style={{ fontSize: 11, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color: accent, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 12, color: "#5a5047", margin: 0 }}>{sub}</p>}
    </div>
  )
}

/* ── Feedback card ─────────────────────────────────────────────────── */
function FeedbackCard({ item }) {
  const meta     = ratingMeta(item.feedback?.rating)
  const roomType = item.roomType
  const customer = item.customer
  const room     = item.room

  const fmt = d => d
    ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

  return (
    <div
      style={{
        background: "#18150F", border: "1px solid rgba(201,168,76,.1)",
        borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "border-color .2s",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(201,168,76,.3)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(201,168,76,.1)"}
    >
      {/* ── Card header: ring + room info ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 16px 14px",
        background: "#0E0C09",
        borderBottom: "1px solid rgba(255,255,255,.04)",
      }}>
        <RatingRing rating={item.feedback?.rating || 0} size={72} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700, color: "#F5ECD7",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {roomType?.type_name || "Room Type"}
          </p>
          {room && (
            <p style={{ margin: "3px 0 6px", fontSize: 11, color: "#6B6054" }}>
              Room #{room.room_number} · Floor {room.floor}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Stars rating={item.feedback?.rating} size={12} />
            <span style={{
              fontSize: 10, fontWeight: 600, color: meta.color,
              background: meta.bg, border: `1px solid ${meta.border}`,
              borderRadius: 20, padding: "2px 8px",
            }}>
              {meta.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Customer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#C9A84C",
          }}>
            {customer?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 600, color: "#F5ECD7",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {customer?.name || "Unknown"}
            </p>
            <p style={{
              margin: 0, fontSize: 11, color: "#6B6054",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {customer?.email || "—"}
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.04)" }} />

        {/* Comment */}
        <div style={{ flex: 1 }}>
          {item.feedback?.comment ? (
            <p style={{
              margin: 0, fontSize: 13, color: "#b8a99a", lineHeight: 1.65,
              fontStyle: "italic",
              display: "-webkit-box", WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              "{item.feedback.comment}"
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: "#4a4038", fontStyle: "italic" }}>
              No written comment
            </p>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,.04)" }} />

        {/* Stay details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Check-in",  value: fmt(item.checkInDateTime) },
            { label: "Check-out", value: fmt(item.checkOutDateTime) },
            { label: "Reviewed",  value: fmt(item.feedback?.submittedAt) },
            { label: "Amount",    value: item.totalAmount ? `₹${item.totalAmount.toLocaleString("en-IN")}` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: 10, color: "#5a5047", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {label}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#C9A84C", fontWeight: 600 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════ */
export default function Feedback() {
  const [all,     setAll]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [search,  setSearch]  = useState("")
  const [ratingF, setRatingF] = useState("all")
  const [sortBy,  setSortBy]  = useState("newest")

  useEffect(() => {
    getAllFeedback()
      .then(r => setAll(r.data))
      .catch(e => setError(e.response?.data?.message || "Failed to load feedback"))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    if (!all.length) return { avg: "0.0", total: 0, dist: { 5:0, 4:0, 3:0, 2:0, 1:0 } }
    const sum  = all.reduce((a, b) => a + (b.feedback?.rating || 0), 0)
    const dist = { 5:0, 4:0, 3:0, 2:0, 1:0 }
    all.forEach(b => { if (b.feedback?.rating) dist[b.feedback.rating]++ })
    return { avg: (sum / all.length).toFixed(1), total: all.length, dist }
  }, [all])

  const filtered = useMemo(() => {
    let arr = [...all]
    if (ratingF !== "all") arr = arr.filter(b => b.feedback?.rating === Number(ratingF))
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(b =>
        b.customer?.name?.toLowerCase().includes(q)      ||
        b.customer?.email?.toLowerCase().includes(q)     ||
        b.roomType?.type_name?.toLowerCase().includes(q) ||
        b.feedback?.comment?.toLowerCase().includes(q)
      )
    }
    arr.sort((a, b) => {
      if (sortBy === "newest")  return new Date(b.feedback?.submittedAt) - new Date(a.feedback?.submittedAt)
      if (sortBy === "oldest")  return new Date(a.feedback?.submittedAt) - new Date(b.feedback?.submittedAt)
      if (sortBy === "highest") return (b.feedback?.rating || 0) - (a.feedback?.rating || 0)
      if (sortBy === "lowest")  return (a.feedback?.rating || 0) - (b.feedback?.rating || 0)
      return 0
    })
    return arr
  }, [all, search, ratingF, sortBy])

  const inputStyle = {
    background: "#18150F", border: "1px solid rgba(201,168,76,.15)",
    borderRadius: 10, padding: "9px 14px",
    color: "#F5ECD7", fontSize: 13, outline: "none",
    transition: "border-color .2s",
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 12 }}>
      <style>{`@keyframes _sp { to { transform: rotate(360deg) } }`}</style>
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        border: "2px solid rgba(201,168,76,.2)", borderTop: "2px solid #C9A84C",
        animation: "_sp 0.7s linear infinite",
      }} />
      <p style={{ color: "#6B6054", fontSize: 14, margin: 0 }}>Loading feedback…</p>
    </div>
  )

  if (error) return (
    <div style={{
      background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
      borderRadius: 14, padding: "20px 24px", color: "#f87171", fontSize: 14,
    }}>
      {error}
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 22, fontWeight: 700, color: "#F5ECD7",
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Guest Feedback
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B6054" }}>
            {all.length} review{all.length !== 1 ? "s" : ""} from checked-out guests
          </p>
        </div>

        {/* Overall average — also uses the ring */}
        {all.length > 0 && (
          <div style={{
            background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)",
            borderRadius: 14, padding: "12px 20px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <RatingRing rating={Number(stats.avg)} size={68} />
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#6B6054" }}>Overall average</p>
              <Stars rating={Math.round(Number(stats.avg))} size={14} />
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#5a5047" }}>{stats.total} reviews</p>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      {all.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
          <StatCard label="Total Reviews" value={stats.total} />
          {[5, 4, 3, 2, 1].map(r => {
            const m = ratingMeta(r)
            return (
              <StatCard key={r} label={`${r} Star`}
                value={stats.dist[r] || 0}
                sub={`${stats.total ? Math.round((stats.dist[r] || 0) / stats.total * 100) : 0}%`}
                accent={m.color}
              />
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#6B6054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search guest, room type, comment…"
            style={{ ...inputStyle, width: "100%", paddingLeft: 34, boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = "rgba(201,168,76,.4)"}
            onBlur={e  => e.target.style.borderColor = "rgba(201,168,76,.15)"}
          />
        </div>

        <select value={ratingF} onChange={e => setRatingF(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer", minWidth: 140 }}
          onFocus={e => e.target.style.borderColor = "rgba(201,168,76,.4)"}
          onBlur={e  => e.target.style.borderColor = "rgba(201,168,76,.15)"}>
          <option value="all">All Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="2">⭐⭐ 2 Stars</option>
          <option value="1">⭐ 1 Star</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer", minWidth: 150 }}
          onFocus={e => e.target.style.borderColor = "rgba(201,168,76,.4)"}
          onBlur={e  => e.target.style.borderColor = "rgba(201,168,76,.15)"}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>

        {filtered.length !== all.length && (
          <span style={{ fontSize: 12, color: "#6B6054" }}>
            {filtered.length} of {all.length} shown
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          background: "#18150F", border: "1px solid rgba(201,168,76,.1)",
          borderRadius: 16, padding: "48px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            stroke="rgba(201,168,76,.25)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01"/>
          </svg>
          <p style={{ margin: 0, fontSize: 15, color: "#5a5047", fontWeight: 600 }}>No feedback found</p>
          <p style={{ margin: 0, fontSize: 13, color: "#3e352a" }}>
            {all.length === 0 ? "No reviews have been submitted yet." : "Try adjusting your filters."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {filtered.map(item => <FeedbackCard key={item._id} item={item} />)}
        </div>
      )}
    </div>
  )
}