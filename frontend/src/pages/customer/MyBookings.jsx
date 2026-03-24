// src/pages/customer/MyBookings.jsx
// Fully responsive — fluid padding, horizontal-scroll tabs on mobile, stacked cards
import React, { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { getMyBookings, cancelBooking, submitFeedback } from "../../services/bookingService"
import {
  IconBed, MoneyIcon, UpiIcon, HallIcon, CreditCardIcon, DebitCardIcon,
  LockIcon, AlarmIcon, RightTickIcon, CalendarIcon, GuestIcon, UserIcon,
  EmailIcon, PhoneIcon, CityIcon, LocationIcon, IconCheck, IconWarning,
  IconArrowLeft, IconSparkle, BookingIcon, SwitchIcon, PastIcon, CancelIcon
} from "../../components/ui/Icons"

/* ─── helpers ─── */
const fmt     = (n) => Number(n).toLocaleString("en-IN")
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
const nights  = (ci, co) => Math.round((new Date(co) - new Date(ci)) / 86400000)

const fmtYMD = (ymd) => {
  const [y, mo, d] = ymd.split("-").map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
}
const isDatePast = (ymd) => {
  const [y, mo, d] = ymd.split("-").map(Number)
  const date = new Date(y, mo - 1, d); date.setHours(23, 59, 59, 999)
  return date < new Date()
}

const HALL_CANCEL_PCT  = 25
const hallCancelFee    = (pricePerDay) => Math.round(pricePerDay * HALL_CANCEL_PCT / 100)
const hallCancelRefund = (amountPaidPerDay, pricePerDay) => Math.max(0, amountPaidPerDay - hallCancelFee(pricePerDay))
const ROOM_CANCEL_PCT  = 15
const roomCancelFee    = (totalAmount) => Math.round(totalAmount * ROOM_CANCEL_PCT / 100)
const roomCancelRefund = (amountPaid, totalAmount) => Math.max(0, amountPaid - roomCancelFee(totalAmount))

const STATUS_CONFIG = {
  "Booked":      { color:"#C9A84C", bg:"rgba(201,168,76,.12)",  border:"rgba(201,168,76,.3)",  dot:"#C9A84C",  label:"Confirmed"  },
  "Checked-In":  { color:"#4ade80", bg:"rgba(74,222,128,.1)",   border:"rgba(74,222,128,.3)",  dot:"#4ade80",  label:"Checked In" },
  "Checked-Out": { color:"#94a3b8", bg:"rgba(148,163,184,.1)",  border:"rgba(148,163,184,.25)",dot:"#94a3b8",  label:"Completed"  },
  "Cancelled":   { color:"#f87171", bg:"rgba(248,113,113,.1)",  border:"rgba(248,113,113,.25)",dot:"#f87171",  label:"Cancelled"  },
}
const PAYMENT_CONFIG = {
  "Paid":           { color:"#4ade80", label:"Paid"           },
  "Partially Paid": { color:"#fbbf24", label:"Partially Paid" },
  "Pending":        { color:"#fbbf24", label:"Pending"        },
}

const TABS = [
  { key:"upcoming",  label:"Upcoming",  icon:<CalendarIcon size={14}/> },
  { key:"active",    label:"Active",    icon:<BookingIcon size={13}/> },
  { key:"past",      label:"Past",      icon:<PastIcon size={13}/> },
  { key:"cancelled", label:"Cancelled", icon:<CancelIcon size={14}/>  },
]

const classifyItem = (item) => {
  const status = item._singleStatus || item.bookingStatus
  if (status === "Cancelled")   return "cancelled"
  if (status === "Checked-Out") return "past"
  if (status === "Checked-In")  return "active"
  const refYMD = item._singleHallDate || null
  if (refYMD) return isDatePast(refYMD) ? "active" : "upcoming"
  return new Date(item.checkInDateTime) > new Date() ? "upcoming" : "active"
}

function Spinner({ size = 14, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14"
      style={{ animation:"spin .7s linear infinite", flexShrink:0 }}>
      <circle cx="7" cy="7" r="5" fill="none" stroke={color} strokeWidth="2" strokeOpacity=".3"/>
      <path d="M7 2a5 5 0 015 5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function CancelModal({ target, onConfirm, onClose, loading }) {
  if (!target) return null
  const { booking, singleDate, singleBookingId } = target
  const isHall = booking?._isHallEvent && !!singleDate
  const pricePerDay   = booking?.roomType?.price_per_night || 0
  const dayAmountPaid = booking?.amountPaid || 0
  const hallIsHalfPay = dayAmountPaid > 0 && dayAmountPaid < pricePerDay
  const hallFee       = hallCancelFee(pricePerDay)
  const hallRefund    = hallCancelRefund(dayAmountPaid, pricePerDay)
  const totalAmount   = booking?.totalAmount || 0
  const amountPaid    = booking?.amountPaid  || 0
  const roomFee       = roomCancelFee(totalAmount)
  const roomRefund    = roomCancelRefund(amountPaid, totalAmount)
  const isHalfPayment = amountPaid < totalAmount && amountPaid > 0
  const title = isHall
    ? `${booking?.roomType?.type_name} — ${fmtYMD(singleDate)}`
    : `${booking?.roomType?.type_name} · ${fmtDate(booking?.checkInDateTime)}`

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#161410", border:"1px solid rgba(248,113,113,.25)",
        borderRadius:"20px", padding:"clamp(20px,4vw,36px) clamp(18px,4vw,32px)",
        maxWidth:"440px", width:"100%", boxShadow:"0 40px 100px rgba(0,0,0,.85)",
        animation:"modal-in .25s cubic-bezier(.34,1.56,.64,1) forwards",
      }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(248,113,113,.1)",
          border:"1px solid rgba(248,113,113,.22)", display:"flex", alignItems:"center",
          justifyContent:"center", margin:"0 auto 22px", fontSize:24 }}>⚠</div>
        <h3 style={{ color:"#f5edd8", fontSize:"1.1rem", fontWeight:700, margin:"0 0 8px",
          fontFamily:"Georgia,serif", textAlign:"center" }}>
          {isHall ? "Cancel Venue Date?" : "Cancel Booking?"}
        </h3>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:"13px", margin:"0 0 6px", textAlign:"center" }}>
          You are cancelling:
        </p>
        <p style={{ color:"#C9A84C", fontWeight:700, fontSize:"14px", margin:"0 0 22px", textAlign:"center" }}>{title}</p>

        {isHall && (
          <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,.07)", marginBottom:22 }}>
            <div style={{ background:"rgba(248,113,113,.08)", borderBottom:"1px solid rgba(255,255,255,.07)",
              padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <p style={{ color:"#f87171", fontSize:"11px", fontWeight:700, letterSpacing:".8px",
                textTransform:"uppercase", margin:0 }}>⚠ Cancellation Charge Applies</p>
              <span style={{ background:"rgba(248,113,113,.12)", border:"1px solid rgba(248,113,113,.25)",
                color:"#f87171", borderRadius:20, padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>25% of day rate</span>
            </div>
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12.5px" }}>Full per-day rate</span>
                <span style={{ color:"#e8dcc8", fontSize:"12.5px", fontWeight:600 }}>₹{fmt(pricePerDay)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12.5px" }}>Cancellation fee (25%)</span>
                <span style={{ color:"#f87171", fontSize:"12.5px", fontWeight:700 }}>− ₹{fmt(hallFee)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"1px solid rgba(255,255,255,.07)" }}>
                <span style={{ color:"rgba(255,255,255,.6)", fontSize:"13px", fontWeight:600 }}>You get back</span>
                <span style={{ color: hallRefund > 0 ? "#4ade80" : "rgba(255,255,255,.35)", fontSize:"14px", fontWeight:700 }}>
                  {hallRefund > 0 ? `₹${fmt(hallRefund)}` : "No refund"}
                </span>
              </div>
            </div>
          </div>
        )}

        {!isHall && (
          <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(251,191,36,.18)", marginBottom:22 }}>
            <div style={{ background:"rgba(251,191,36,.07)", borderBottom:"1px solid rgba(251,191,36,.12)",
              padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <p style={{ color:"#fbbf24", fontSize:"11px", fontWeight:700, letterSpacing:".8px",
                textTransform:"uppercase", margin:0 }}>⚠ Cancellation Fee Applies</p>
              <span style={{ background:"rgba(251,191,36,.12)", border:"1px solid rgba(251,191,36,.25)",
                color:"#fbbf24", borderRadius:20, padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>15% of total</span>
            </div>
            <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12.5px" }}>Total booking value</span>
                <span style={{ color:"#e8dcc8", fontSize:"12.5px", fontWeight:600 }}>₹{fmt(totalAmount)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12.5px" }}>Cancellation fee (15%)</span>
                <span style={{ color:"#fbbf24", fontSize:"12.5px", fontWeight:700 }}>− ₹{fmt(roomFee)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"1px solid rgba(255,255,255,.07)" }}>
                <span style={{ color:"rgba(255,255,255,.6)", fontSize:"13px", fontWeight:600 }}>You get back</span>
                <span style={{ color: roomRefund > 0 ? "#4ade80" : "rgba(255,255,255,.35)", fontSize:"14px", fontWeight:700 }}>
                  {roomRefund > 0 ? `₹${fmt(roomRefund)}` : "No refund"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} disabled={loading} style={{ flex:1, padding:"12px", borderRadius:"12px",
            border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"rgba(255,255,255,.55)",
            cursor:"pointer", fontSize:"13px", fontWeight:600 }}>
            Keep Booking
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex:1, padding:"12px", borderRadius:"12px",
            border:"none", background: loading ? "rgba(248,113,113,.35)" : "#f87171",
            color:"white", cursor: loading ? "not-allowed" : "pointer",
            fontSize:"13px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            {loading ? <><Spinner/> Cancelling…</> : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  )
}

const STAR_LABELS = ["", "Terrible", "Poor", "Average", "Good", "Excellent"]

function FeedbackPanel({ bookingId, existingFeedback, onSubmitted }) {
  const [rating,     setRating]     = useState(existingFeedback?.rating  || 0)
  const [hoverStar,  setHoverStar]  = useState(0)
  const [comment,    setComment]    = useState(existingFeedback?.comment || "")
  const [submitting, setSubmitting] = useState(false)
  const [err,        setErr]        = useState("")
  const [done,       setDone]       = useState(!!existingFeedback?.rating)
  const active = hoverStar || rating

  const handleSubmit = async () => {
    if (!rating) return setErr("Please select a star rating.")
    setErr(""); setSubmitting(true)
    try {
      await submitFeedback(bookingId, { rating, comment })
      setDone(true)
      onSubmitted?.({ rating, comment, submittedAt: new Date() })
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to submit. Please try again.")
    } finally { setSubmitting(false) }
  }

  if (done) return (
    <div style={{ padding:"14px 16px", borderRadius:10, background:"rgba(74,222,128,.06)",
      border:"1px solid rgba(74,222,128,.15)", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:38, height:38, borderRadius:"50%", flexShrink:0, background:"rgba(74,222,128,.12)",
        border:"1px solid rgba(74,222,128,.25)", display:"flex", alignItems:"center",
        justifyContent:"center", fontSize:16, color:"#4ade80" }}>✓</div>
      <div style={{ minWidth:0 }}>
        <p style={{ color:"#4ade80", fontSize:"12.5px", fontWeight:700, margin:"0 0 4px" }}>Thank you for your feedback!</p>
        <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
          <span style={{ fontSize:"14px", letterSpacing:1 }}>
            <span style={{ color:"#C9A84C" }}>{"★".repeat(rating)}</span>
            <span style={{ color:"rgba(255,255,255,.12)" }}>{"★".repeat(5 - rating)}</span>
          </span>
          <span style={{ color:"rgba(201,168,76,.7)", fontSize:"12px", fontWeight:600 }}>{STAR_LABELS[rating]}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding:"16px", borderRadius:10, background:"rgba(201,168,76,.03)",
      border:"1px solid rgba(201,168,76,.1)" }}>
      <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", letterSpacing:"1.5px",
        textTransform:"uppercase", fontWeight:600, margin:"0 0 12px" }}>✦ Rate Your Stay</p>
      <div style={{ display:"flex", alignItems:"center", gap:3, marginBottom:12 }}>
        {[1,2,3,4,5].map(star => (
          <button key={star} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)}
            onClick={() => setRating(star)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"2px",
              fontSize:"clamp(22px,5vw,28px)", lineHeight:1,
              color: star <= active ? "#C9A84C" : "rgba(255,255,255,.1)",
              transition:"color .12s, transform .1s", transform: star <= active ? "scale(1.2)" : "scale(1)" }}>★</button>
        ))}
        {active > 0 && <span style={{ marginLeft:8, color:"rgba(201,168,76,.8)", fontSize:"12.5px", fontWeight:600 }}>{STAR_LABELS[active]}</span>}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value.slice(0, 1000))}
        placeholder="Tell us about your experience… (optional)" rows={3}
        style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,.04)",
          border:"1px solid rgba(255,255,255,.08)", borderRadius:8, color:"#e8dcc8",
          fontSize:"12.5px", lineHeight:1.6, padding:"10px 12px", resize:"vertical",
          outline:"none", fontFamily:"inherit", marginBottom:10, transition:"border-color .2s" }}
        onFocus={e => e.target.style.borderColor="rgba(201,168,76,.3)"}
        onBlur={e => e.target.style.borderColor="rgba(255,255,255,.08)"}/>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <span style={{ color:"rgba(255,255,255,.18)", fontSize:"10.5px" }}>{comment.length}/1000</span>
        {err && <span style={{ color:"#f87171", fontSize:"11.5px", flex:1 }}>⚠ {err}</span>}
        <button onClick={handleSubmit} disabled={submitting || !rating}
          style={{ marginLeft:"auto", background: rating ? "linear-gradient(135deg,#C9A84C,#a8872e)" : "rgba(255,255,255,.05)",
            border:"none", borderRadius:8, color: rating ? "#0E0C09" : "rgba(255,255,255,.2)",
            padding:"8px 20px", fontSize:"12px", fontWeight:700,
            cursor: rating && !submitting ? "pointer" : "not-allowed",
            transition:"all .2s", display:"flex", alignItems:"center", gap:6 }}>
          {submitting ? <><Spinner size={13} color="#0E0C09"/> Submitting…</> : "Submit Review"}
        </button>
      </div>
    </div>
  )
}

function HallDateRow({ item, onCancel, idx }) {
  const [expanded, setExpanded] = useState(false)
  const date      = item._singleHallDate
  const bookingId = item._singleBookingId
  const status    = item._singleStatus || "Booked"
  const cfg       = STATUS_CONFIG[status]   || STATUS_CONFIG["Booked"]
  const pcfg      = PAYMENT_CONFIG[item.paymentStatus] || PAYMENT_CONFIG["Pending"]
  const pricePerDay = item.roomType?.price_per_night || 0
  const allDates    = item._hallDatesInfo   || []
  const totalDays   = item._hallEventDates?.length || allDates.length
  const canCancel   = status === "Booked" && !isDatePast(date)
  const isCancelled = status === "Cancelled"
  const amountPaid  = item.amountPaid || 0
  const amountDue   = item.amountDue  || 0
  const isHalfPay   = amountPaid > 0 && amountDue > 0
  const cancelFee    = item.cancellationFee    || (isCancelled ? hallCancelFee(pricePerDay) : 0)
  const cancelRefund = item.cancellationRefund || (isCancelled ? hallCancelRefund(amountPaid, pricePerDay) : 0)

  return (
    <div style={{
      background:"#161410",
      border:`1px solid ${isCancelled ? "rgba(248,113,113,.1)" : "rgba(201,168,76,.14)"}`,
      borderRadius:"14px", overflow:"hidden",
      transition:"border-color .2s, box-shadow .2s",
      animation:`card-in .4s ${idx * 0.06}s ease both`,
      opacity: isCancelled ? 0.75 : 1,
    }}
      onMouseEnter={e => { if (!isCancelled) { e.currentTarget.style.borderColor="rgba(201,168,76,.35)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(0,0,0,.35)" } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=isCancelled?"rgba(248,113,113,.1)":"rgba(201,168,76,.14)"; e.currentTarget.style.boxShadow="none" }}
    >
      <div style={{ display:"flex" }}>
        {/* Thumbnail — narrower on mobile */}
        <div style={{ width:"clamp(56px,12vw,76px)", flexShrink:0, minHeight:104,
          background: item.roomType?.images?.[0] ? "transparent" : "rgba(201,168,76,.05)",
          display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column",
          gap:3, position:"relative" }}>
          {item.roomType?.images?.[0]
            ? <img src={`http://localhost:5000/${item.roomType.images[0]}`} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover", minHeight:104, opacity: isCancelled ? .45 : 1 }}/>
            : <><span style={{ fontSize:22, opacity: isCancelled ? .4 : 1 }}>🏛</span></>
          }
          <div style={{ position:"absolute", bottom:5, left:"50%", transform:"translateX(-50%)",
            background:"rgba(201,168,76,.1)", border:"1px solid rgba(201,168,76,.25)",
            borderRadius:5, padding:"1px 6px", fontSize:"7.5px", color:"#C9A84C", fontWeight:700, whiteSpace:"nowrap" }}>Venue</div>
        </div>

        <div style={{ flex:1, padding:"clamp(10px,2vw,13px) clamp(12px,2vw,16px)", display:"flex", flexDirection:"column", gap:7, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ color: isCancelled ? "rgba(255,255,255,.45)" : "#f5edd8", fontWeight:700,
                fontSize:"clamp(12px,2.5vw,14px)", margin:"0 0 2px", fontFamily:"Georgia,serif",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {item.roomType?.type_name || "Banquet Hall"}
              </p>
              <p style={{ color:"rgba(201,168,76,.5)", fontSize:"10.5px", margin:0 }}>
                🏛 Part of {totalDays}-day event
              </p>
            </div>
            <span style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
              borderRadius:20, padding:"3px 9px", fontSize:"10px", fontWeight:700,
              display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:cfg.dot }}/>{cfg.label}
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ background: isCancelled ? "rgba(248,113,113,.08)" : "rgba(201,168,76,.1)",
              border:`1px solid ${isCancelled ? "rgba(248,113,113,.2)" : "rgba(201,168,76,.25)"}`,
              color: isCancelled ? "#f87171" : "#C9A84C",
              borderRadius:8, padding:"4px 10px", fontSize:"clamp(11px,2vw,12.5px)", fontWeight:700,
              display:"inline-flex", alignItems:"center", gap:4 }}>
              {isCancelled ? "❌" : <CalendarIcon size={14}/>} {fmtYMD(date)}
            </span>
            {isCancelled && cancelFee > 0 && <span style={{ background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.18)", color:"#f87171", borderRadius:8, padding:"2px 9px", fontSize:"11px", fontWeight:600 }}>Fee: ₹{fmt(cancelFee)}</span>}
            {isCancelled && cancelRefund > 0 && <span style={{ background:"rgba(74,222,128,.06)", border:"1px solid rgba(74,222,128,.18)", color:"#4ade80", borderRadius:8, padding:"2px 9px", fontSize:"11px", fontWeight:600 }}>Refund: ₹{fmt(cancelRefund)}</span>}

            <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              {!isCancelled && <span style={{ color:"#C9A84C", fontSize:"clamp(12px,2vw,13px)", fontWeight:700 }}>₹{fmt(pricePerDay)}</span>}
              {canCancel && (
                <button onClick={() => onCancel({ booking: item, singleDate: date, singleBookingId: bookingId })}
                  style={{ background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.25)",
                    color:"#f87171", borderRadius:7, padding:"3px 8px", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
                  Cancel
                </button>
              )}
              <button onClick={() => setExpanded(e => !e)}
                style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)",
                  color:"rgba(255,255,255,.5)", borderRadius:7, padding:"3px 8px", fontSize:"11px",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}>
                {expanded ? "Less" : "More"}
                <span style={{ transform:expanded?"rotate(180deg)":"rotate(0deg)", transition:".2s", display:"inline-block" }}>▾</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"14px 16px",
          background:"rgba(255,255,255,.015)", animation:"expand-in .2s ease forwards" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", letterSpacing:".8px",
              textTransform:"uppercase", margin:"0 0 4px" }}>All Event Dates</p>
            {allDates.map((info, i) => {
              const dcfg  = STATUS_CONFIG[info.bookingStatus] || STATUS_CONFIG["Booked"]
              const isThis = info.ymd === date
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:9, color: isThis ? "#C9A84C" : "rgba(255,255,255,.2)" }}>{isThis ? "▶" : "·"}</span>
                  <span style={{ fontSize:"12px", fontWeight: isThis ? 700 : 400, color: isThis ? "#C9A84C" : "rgba(255,255,255,.45)" }}>{fmtYMD(info.ymd)}</span>
                  <span style={{ marginLeft:"auto", fontSize:"10px", fontWeight:600, color:dcfg.color,
                    background:dcfg.bg, border:`1px solid ${dcfg.border}`, borderRadius:10, padding:"1px 7px" }}>
                    {dcfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, onCancel, idx }) {
  const [expanded,     setExpanded]     = useState(false)
  const [feedbackData, setFeedbackData] = useState(booking.feedback || null)

  const isCheckedOut  = booking.bookingStatus === "Checked-Out"
  const isHallBooking = !!booking.paymentDetails?.isNonContiguous
  const isCancelled   = booking.bookingStatus === "Cancelled"
  const canCancel     = booking.bookingStatus === "Booked" && new Date(booking.checkInDateTime) > new Date()

  const totalAmount  = booking.totalAmount || 0
  const amountPaid   = booking.amountPaid  || 0
  const cancelFee    = booking.cancellationFee    ?? roomCancelFee(totalAmount)
  const cancelRefund = booking.cancellationRefund ?? roomCancelRefund(amountPaid, totalAmount)
  const isHalfPay    = amountPaid < totalAmount && amountPaid > 0

  const cfg  = STATUS_CONFIG[booking.bookingStatus] || STATUS_CONFIG["Booked"]
  const pcfg = PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG["Pending"]
  const n    = nights(booking.checkInDateTime, booking.checkOutDateTime)
  const img  = booking.roomType?.images?.[0]

  return (
    <div style={{
      background:"#161410",
      border:`1px solid ${isCancelled ? "rgba(248,113,113,.1)" : "rgba(255,255,255,.07)"}`,
      borderRadius:"16px", overflow:"hidden",
      transition:"border-color .2s, box-shadow .2s",
      animation:`card-in .4s ${idx * 0.06}s ease both`,
      opacity: isCancelled ? 0.75 : 1,
    }}
      onMouseEnter={e => { if (!isCancelled) { e.currentTarget.style.borderColor="rgba(201,168,76,.25)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,.4)" } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor=isCancelled?"rgba(248,113,113,.1)":"rgba(255,255,255,.07)"; e.currentTarget.style.boxShadow="none" }}
    >
      <div style={{ display:"flex" }}>
        <div style={{ width:"clamp(64px,14vw,90px)", flexShrink:0, background: img ? "transparent" : "rgba(201,168,76,.06)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(22px,5vw,28px)" }}>
          {img
            ? <img src={`http://localhost:5000/${img}`} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover", minHeight:120, opacity: isCancelled ? .45 : 1 }}/>
            : "🛏"}
        </div>

        <div style={{ flex:1, padding:"clamp(12px,2vw,16px) clamp(12px,2vw,18px)", display:"flex", flexDirection:"column", gap:8, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ color: isCancelled ? "rgba(255,255,255,.45)" : "#f5edd8", fontWeight:700,
                fontSize:"clamp(12px,2.5vw,15px)", margin:"0 0 3px", fontFamily:"Georgia,serif",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {booking.roomType?.type_name || "Room"}
              </p>
              <p style={{ color:"rgba(255,255,255,.35)", fontSize:"clamp(10px,1.5vw,11px)", margin:0 }}>
                Room {booking.room?.room_number ?? "—"} · Floor {booking.room?.floor ?? "—"}
              </p>
            </div>
            <span style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
              borderRadius:20, padding:"3px 10px", fontSize:"clamp(9px,1.5vw,11px)", fontWeight:700,
              display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:cfg.dot }}/>{cfg.label}
            </span>
          </div>

          <div style={{ display:"flex", gap:"clamp(8px,2vw,16px)", flexWrap:"wrap" }}>
            {isHallBooking ? (
              <div>
                <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", margin:"0 0 2px",
                  letterSpacing:".8px", textTransform:"uppercase" }}>Event Date</p>
                <p style={{ color:"#e8dcc8", fontSize:"clamp(11px,2vw,12.5px)", fontWeight:600, margin:0 }}>
                  {fmtDate(booking.checkInDateTime)}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", margin:"0 0 2px", letterSpacing:".8px", textTransform:"uppercase" }}>Check-In</p>
                  <p style={{ color:"#e8dcc8", fontSize:"clamp(11px,2vw,12.5px)", fontWeight:600, margin:0 }}>{fmtDate(booking.checkInDateTime)}</p>
                </div>
                <div style={{ color:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", fontSize:14 }}>→</div>
                <div>
                  <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", margin:"0 0 2px", letterSpacing:".8px", textTransform:"uppercase" }}>Check-Out</p>
                  <p style={{ color:"#e8dcc8", fontSize:"clamp(11px,2vw,12.5px)", fontWeight:600, margin:0 }}>{fmtDate(booking.checkOutDateTime)}</p>
                </div>
              </>
            )}
            <div style={{ marginLeft:"auto", textAlign:"right" }}>
              <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10px", margin:"0 0 2px", letterSpacing:".8px", textTransform:"uppercase" }}>Total</p>
              <p style={{ color: isCancelled ? "rgba(201,168,76,.4)" : "#C9A84C",
                fontSize:"clamp(12px,2.5vw,14px)", fontWeight:700, margin:0 }}>₹{fmt(booking.totalAmount)}</p>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)",
              color:"rgba(255,255,255,.5)", borderRadius:8, padding:"2px 8px", fontSize:"11px" }}>
              {isHallBooking ? "1 day" : `${n} night${n !== 1 ? "s" : ""}`}
            </span>
            {!isCancelled && (
              <span style={{ background:`${pcfg.color}18`, border:`1px solid ${pcfg.color}40`, color:pcfg.color, borderRadius:8, padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>
                {pcfg.label}
              </span>
            )}
            {isCancelled && cancelFee > 0 && <span style={{ background:"rgba(251,191,36,.06)", border:"1px solid rgba(251,191,36,.18)", color:"#fbbf24", borderRadius:8, padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>Fee: ₹{fmt(cancelFee)}</span>}
            {isCancelled && cancelRefund > 0 && <span style={{ background:"rgba(74,222,128,.06)", border:"1px solid rgba(74,222,128,.15)", color:"#4ade80", borderRadius:8, padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>Refund: ₹{fmt(cancelRefund)}</span>}

            <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
              {isCheckedOut && !isHallBooking && !feedbackData?.rating && (
                <button onClick={() => setExpanded(true)}
                  style={{ background:"rgba(201,168,76,.12)", border:"1px solid rgba(201,168,76,.35)",
                    color:"#C9A84C", borderRadius:8, padding:"4px 10px", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
                  ★ Review
                </button>
              )}
              {canCancel && (
                <button onClick={() => onCancel({ booking })}
                  style={{ background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.25)",
                    color:"#f87171", borderRadius:8, padding:"4px 10px", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
                  Cancel
                </button>
              )}
              <button onClick={() => setExpanded(e => !e)}
                style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)",
                  color:"rgba(255,255,255,.5)", borderRadius:8, padding:"4px 8px", fontSize:"11px",
                  cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                {expanded ? "Less" : "More"}
                <span style={{ transform:expanded?"rotate(180deg)":"rotate(0deg)", transition:".2s", display:"inline-block" }}>▾</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", padding:"clamp(12px,2vw,18px) clamp(14px,2vw,20px)",
          background:"rgba(255,255,255,.015)", animation:"expand-in .2s ease forwards" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 20px" }}>
            <style>{`@media (max-width: 400px) { .booking-detail-grid { grid-template-columns: 1fr !important; } }`}</style>
            <div className="booking-detail-grid" style={{ gridColumn:"1/-1" }}>
              <p style={{ color:"rgba(255,255,255,.35)", fontSize:"10.5px", letterSpacing:".8px", textTransform:"uppercase", margin:"0 0 8px" }}>Guests</p>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {!(booking.guests || []).length
                  ? <span style={{ color:"rgba(255,255,255,.25)", fontSize:"12px" }}>No guest details</span>
                  : (booking.guests || []).map((g, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:22, height:22, borderRadius:"50%", background:"rgba(201,168,76,.1)",
                        border:"1px solid rgba(201,168,76,.2)", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:9, color:"#C9A84C", fontWeight:700, flexShrink:0 }}>{i+1}</span>
                      <span style={{ color:"#e8dcc8", fontSize:"12.5px" }}>{g.name}</span>
                      <span style={{ color:"rgba(255,255,255,.3)", fontSize:"11px" }}>· {g.age}y · {g.gender}</span>
                    </div>
                  ))
                }
              </div>
            </div>
            {isCheckedOut && !isHallBooking && (
              <div style={{ gridColumn:"1/-1" }}>
                <FeedbackPanel bookingId={booking._id} existingFeedback={feedbackData}
                  onSubmitted={(fb) => setFeedbackData(fb)}/>
              </div>
            )}
            <div style={{ gridColumn:"1/-1", paddingTop:10, borderTop:"1px solid rgba(255,255,255,.05)" }}>
              <span style={{ color:"rgba(255,255,255,.25)", fontSize:"11px" }}>Booking Ref: </span>
              <span style={{ color:"rgba(201,168,76,.6)", fontSize:"11px", fontFamily:"monospace" }}>
                #{booking._id?.toString().slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MyBookings() {
  const navigate = useNavigate()
  const [bookings,     setBookings]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState("upcoming")
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling,   setCancelling]   = useState(false)
  const [cancelErr,    setCancelErr]    = useState("")

  useEffect(() => {
    if (document.getElementById("mybookings-styles")) return
    const s = document.createElement("style")
    s.id = "mybookings-styles"
    s.textContent = `
      @keyframes card-in   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes expand-in { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes modal-in  { from{opacity:0;transform:scale(.92)}       to{opacity:1;transform:scale(1)} }
      @keyframes spin      { to{transform:rotate(360deg)} }
      @keyframes fade-in   { from{opacity:0} to{opacity:1} }
      @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      .skeleton {
        background:linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.04) 75%);
        background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:8px;
      }

      /* Responsive page layout */
      .mb-page { padding: 0 0 80px; }
      .mb-header { padding: clamp(32px,5vw,48px) clamp(16px,4vw,40px) 0; max-width: 880px; margin: 0 auto; }
      .mb-body   { max-width: 880px; margin: 0 auto; padding: 0 clamp(16px,4vw,40px); }

      /* Tab scroll on mobile */
      .mb-tabs { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 1px; }
      .mb-tabs::-webkit-scrollbar { display: none; }
      .mb-tabs { -ms-overflow-style: none; scrollbar-width: none; }
      .mb-tab { flex-shrink: 0; }
    `
    document.head.appendChild(s)
  }, [])

  const fetchAll = () => {
    setLoading(true)
    getMyBookings()
      .then(r => setBookings(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchAll() }, [])

  const flatItems = useMemo(() => {
    const items = []
    bookings.forEach(b => {
      if (b._isHallEvent && b._hallDatesInfo?.length) {
        b._hallDatesInfo.forEach(info => {
          items.push({ ...b, _singleHallDate:info.ymd, _singleBookingId:info.bookingId,
            _singleStatus:info.bookingStatus,
            cancellationFee:info.cancellationFee||0, cancellationRefund:info.cancellationRefund||0 })
        })
      } else { items.push(b) }
    })
    return items
  }, [bookings])

  const tabMap = useMemo(() => {
    const m = { upcoming:[], active:[], past:[], cancelled:[] }
    flatItems.forEach(item => m[classifyItem(item)]?.push(item))
    const byDate = (a, b) => {
      const da = a._singleHallDate
        ? (() => { const [y,mo,d]=a._singleHallDate.split("-").map(Number); return new Date(y,mo-1,d) })()
        : new Date(a.checkInDateTime)
      const db = b._singleHallDate
        ? (() => { const [y,mo,d]=b._singleHallDate.split("-").map(Number); return new Date(y,mo-1,d) })()
        : new Date(b.checkInDateTime)
      return da - db
    }
    m.upcoming.sort(byDate); m.active.sort(byDate)
    m.past.sort((a,b)=>byDate(b,a)); m.cancelled.sort((a,b)=>byDate(b,a))
    return m
  }, [flatItems])

  const visibleBookings = tabMap[activeTab] || []

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return
    setCancelling(true); setCancelErr("")
    try {
      const idToCancel = cancelTarget.singleBookingId || cancelTarget.booking._id
      await cancelBooking(idToCancel)
      await fetchAll()
      setCancelTarget(null)
    } catch (e) {
      setCancelErr(e?.response?.data?.message || "Could not cancel. Try again.")
    } finally { setCancelling(false) }
  }

  useEffect(() => {
    if (!loading && visibleBookings.length === 0) {
      const fallback = TABS.find(t => tabMap[t.key]?.length > 0)
      if (fallback && fallback.key !== activeTab) setActiveTab(fallback.key)
    }
  }, [loading, tabMap])

  return (
    <div className="mb-page" style={{ minHeight:"100vh", background:"#0E0C09", position:"relative", overflow:"hidden" }}>
      {/* Decorative SVGs hidden on mobile */}
      <style>{`
        .mb-deco { display: none; }
        @media (min-width: 640px) { .mb-deco { display: block; } }
      `}</style>
      <div className="mb-deco" style={{ position:"fixed", top:-10, right:-10, pointerEvents:"none", zIndex:0 }}>
        <svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg"
          style={{ display:"block", width:"clamp(200px,35vw,420px)", height:"auto", opacity:0.12 }}>
          <g fill="none" stroke="#C9A84C" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="268" cy="145" r="44" strokeWidth="2.8"/><circle cx="268" cy="145" r="31" strokeWidth="1.5" opacity=".55"/>
            <circle cx="218" cy="188" r="30" strokeWidth="2.6"/><circle cx="218" cy="188" r="17" strokeWidth="1.6"/>
            <path d="M196 208 L110 285" strokeWidth="2.6"/>
            <path d="M312 221 L312 295M312 242 L325 242" strokeWidth="2.4"/>
          </g>
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="mb-header" style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between",
          flexWrap:"wrap", gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(1.5rem,4vw,2rem)",
              fontWeight:700, color:"#f5edd8", margin:"0 0 6px" }}>My Bookings</h1>
            <p style={{ color:"rgba(255,255,255,.35)", fontSize:"clamp(12px,1.5vw,13.5px)", margin:0 }}>
              {loading ? "Loading…" : `${bookings.length} reservation${bookings.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
          <button onClick={() => navigate("/rooms")} style={{
            background:"linear-gradient(135deg,#C9A84C,#ddb94e)", color:"#0E0C09",
            border:"none", cursor:"pointer", padding:"clamp(9px,1.5vw,11px) clamp(16px,2.5vw,22px)",
            borderRadius:"12px", fontWeight:700, fontSize:"clamp(12px,1.5vw,13px)",
          }}>+ New Booking</button>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="mb-tabs">
          {TABS.map(tab => {
            const count  = tabMap[tab.key]?.length || 0
            const active = activeTab === tab.key
            return (
              <button key={tab.key} className="mb-tab" onClick={() => setActiveTab(tab.key)} style={{
                padding:"clamp(8px,1.5vw,10px) clamp(12px,2vw,18px)",
                borderRadius:"12px 12px 0 0",
                border: active ? "1px solid rgba(201,168,76,.3)" : "1px solid transparent",
                borderBottom: active ? "1px solid #161410" : "1px solid transparent",
                background: active ? "#161410" : "transparent",
                color: active ? "#C9A84C" : "rgba(255,255,255,.35)",
                fontSize:"clamp(11px,1.5vw,13px)", fontWeight: active ? 700 : 500,
                cursor:"pointer", position:"relative", bottom:-1,
                display:"flex", alignItems:"center", gap:5, transition:"color .2s",
                whiteSpace:"nowrap",
              }}>
                <span style={{ fontSize:11 }}>{tab.icon}</span>
                {tab.label}
                {count > 0 && (
                  <span style={{ background: active ? "rgba(201,168,76,.2)" : "rgba(255,255,255,.07)",
                    color: active ? "#C9A84C" : "rgba(255,255,255,.4)",
                    borderRadius:20, padding:"1px 7px", fontSize:"10px", fontWeight:700 }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mb-body">
        <div style={{ background:"#161410", borderRadius:"0 16px 16px 16px",
          border:"1px solid rgba(201,168,76,.15)", borderTop:"none",
          padding:"clamp(16px,2.5vw,24px)", minHeight:200 }}>
          {loading && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height:100, borderRadius:14, background:"rgba(255,255,255,.03)",
                  border:"1px solid rgba(255,255,255,.06)", overflow:"hidden", display:"flex" }}>
                  <div className="skeleton" style={{ width:"clamp(56px,12vw,76px)", flexShrink:0 }}/>
                  <div style={{ flex:1, padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
                    <div className="skeleton" style={{ height:13, width:"40%" }}/>
                    <div className="skeleton" style={{ height:11, width:"60%" }}/>
                    <div className="skeleton" style={{ height:11, width:"30%" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && visibleBookings.length === 0 && (
            <div style={{ textAlign:"center", padding:"clamp(40px,8vw,60px) 20px" }}>
              <div style={{ fontSize:"clamp(36px,8vw,48px)", marginBottom:16 }}>
                {activeTab==="upcoming"?"🗓":activeTab==="active"?"🏨":activeTab==="past"?"📋":"✕"}
              </div>
              <p style={{ color:"#f5edd8", fontSize:"16px", fontWeight:600, fontFamily:"Georgia,serif", margin:"0 0 8px" }}>
                No {activeTab} bookings
              </p>
              <p style={{ color:"rgba(255,255,255,.35)", fontSize:"13px", margin:"0 0 24px" }}>
                {activeTab==="upcoming" ? "You have no upcoming reservations." : activeTab==="cancelled" ? "No cancelled bookings." : "Nothing here yet."}
              </p>
              {activeTab !== "past" && activeTab !== "cancelled" && (
                <button onClick={() => navigate("/rooms")} style={{
                  background:"linear-gradient(135deg,#C9A84C,#ddb94e)", color:"#0E0C09",
                  border:"none", cursor:"pointer", padding:"11px 24px", borderRadius:"12px", fontWeight:700, fontSize:"13px" }}>
                  Browse Rooms
                </button>
              )}
            </div>
          )}
          {!loading && visibleBookings.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {visibleBookings.map((item, i) =>
                item._singleHallDate
                  ? <HallDateRow key={`${item._id}_${item._singleHallDate}`} item={item} onCancel={setCancelTarget} idx={i}/>
                  : <BookingCard key={item._id} booking={item} onCancel={setCancelTarget} idx={i}/>
              )}
            </div>
          )}
        </div>
        {cancelErr && (
          <p style={{ marginTop:12, color:"#f87171", fontSize:"12.5px",
            background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)",
            borderRadius:10, padding:"10px 14px" }}>
            ⚠ {cancelErr}
          </p>
        )}
      </div>

      {cancelTarget && (
        <CancelModal
          target={cancelTarget}
          onClose={() => { if (!cancelling) setCancelTarget(null) }}
          onConfirm={handleCancelConfirm}
          loading={cancelling}
        />
      )}
    </div>
  )
}