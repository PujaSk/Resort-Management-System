// src/pages/admin/pages/RoomBooking.jsx
// ─── Admin booking panel — fully responsive ──────────────────────────────────
import React, { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { getRooms, getRoomTypes }            from "../../../services/roomService"
import { getAllBookings, checkIn, checkOut,
         cancelBooking, createBooking }       from "../../../services/bookingService"
import api                                   from "../../../services/axiosInstance"
import Table  from "../../../components/ui/Table"
import Badge  from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Modal  from "../../../components/ui/Modal"
import Input  from "../../../components/ui/Input"
import Loader from "../../../components/ui/Loader"
import { Toast, useToast } from "../../../components/ui/Loader"
import { useAuth } from "../../../context/AuthContext"
import {
  RupeeIcon, UserIcon, ChildIcon, WalkInIcon, GuestIcon, IconBed,
  RightTickIcon, CalendarIcon, HallIcon, CreditCardIcon, DebitCardIcon,
  CashIcon, MoneyIcon, UpiIcon, BookingIcon, IconWarning, DoorIcon, BellIcon,
  PlusIcon
} from "../../../components/ui/Icons"

/* ════════════════════════════════════
   HELPERS
════════════════════════════════════ */
const IST      = { timeZone: "Asia/Kolkata" }
const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-IN", { ...IST, day:"2-digit", month:"short", year:"numeric" }) : "—"
const fmtINR   = n => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"
const todayISO = () => new Date().toISOString().split("T")[0]
const parseCapacity = str => { const n = parseInt(str); return isNaN(n) ? 999 : n }

const isValidPhone = v => /^[6-9]\d{9}$/.test(v.replace(/\s/g,""))
const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const isValidName  = v => v.trim().length >= 2

const getBookedDatesApi = id    => api.get(`/bookings/booked-dates/${id}`)
const sendAdminOtp      = email => api.post("/customer/admin-send-otp", { email })
const verifyAdminOtp    = (email, otp) => api.post("/customer/admin-verify-otp", { email, otp })
const registerWalkin    = data  => api.post("/customer/register-walkin", data)

const PCOLOR = { "Paid":"#52C07A","Partially Paid":"#E0A852","Pending":"#E05252" }

const PAYMENT_METHODS = [
  { value:"cash",        label:"Cash",        icon: CashIcon,       desc:"Collected at front desk" },
  { value:"upi",         label:"UPI",         icon: UpiIcon,        desc:"GPay, PhonePe, Paytm…"  },
  { value:"credit_card", label:"Credit Card", icon: CreditCardIcon, desc:"Visa, Mastercard, Amex"  },
  { value:"debit_card",  label:"Debit Card",  icon: DebitCardIcon,  desc:"All major bank cards"    },
]

const METHOD_LABEL = {
  cash:"Cash", upi:"UPI", credit_card:"Credit Card", debit_card:"Debit Card",
}

const BOOKING_STATUSES = [
  {
    value: "Booked",
    label: (
      <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
        <CalendarIcon size={14}/> Pre-Booking
      </span>
    ),
    desc: "Guest is booking in advance, check-in later",
  },
  {
    value: "Checked-In",
    label: (
      <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
        <RightTickIcon size={14}/> Check-In Now
      </span>
    ),
    desc: "Guest is here right now, checking in immediately",
  },
]

const EMPTY_FORM = {
  bookingType:"room", bookingStatus:"Booked", customerMode:"existing", customerId:"",
  guestName:"", guestEmail:"", guestPhone:"", guestCity:"", guestAddress:"",
  emailOtpSent:false, emailOtpCode:"", emailVerified:false, otpCooldown:0,
  existingCustomerId:"", roomTypeId:"", checkIn:todayISO(), checkOut:"",
  hallDates:[], adults:1, children:0, guests:[{ name:"", age:"", gender:"" }],
  paymentMethod:"cash", upiId:"", cardNumber:"", cardName:"", expiry:"", cvv:"",
}

/* ════════════════════════════════════
   RESPONSIVE STYLES
════════════════════════════════════ */
const RESPONSIVE_CSS = `
  @keyframes spin { to { transform: rotate(360deg) } }

  .rb-guest-row {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }
  @media (min-width: 480px) {
    .rb-guest-row {
      grid-template-columns: 1fr 90px 120px;
      gap: 10px;
    }
  }

  .rb-date-pair {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  @media (min-width: 420px) {
    .rb-date-pair { grid-template-columns: 1fr 1fr; }
  }

  .rb-pm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 10px;
  }
  @media (min-width: 480px) {
    .rb-pm-grid { gap: 8px; }
  }

  .rb-mode-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .rb-mode-row > * { flex: 1; min-width: 120px; }

  .rb-status-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .rb-status-row > * { flex: 1; min-width: 140px; }

  .rb-step-bar {
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .rb-step-bar::-webkit-scrollbar { display: none; }
  .rb-step-bar-inner {
    display: flex;
    align-items: center;
    gap: 0;
    min-width: max-content;
  }

  .rb-cancel-modal {
    background: #161410;
    border: 1px solid rgba(248,113,113,.3);
    border-radius: 20px;
    padding: 24px 20px;
    width: calc(100vw - 2rem);
    max-width: 500px;
    box-shadow: 0 40px 100px rgba(0,0,0,.85);
    max-height: 90vh;
    overflow-y: auto;
  }
  @media (min-width: 560px) {
    .rb-cancel-modal { padding: 32px 28px; }
  }

  .rb-snapshot-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }
  @media (min-width: 400px) {
    .rb-snapshot-grid { grid-template-columns: 1fr 1fr; }
  }

  .rb-ci-choice {
    display: flex;
    flex-direction: column;
  }
  @media (min-width: 420px) {
    .rb-ci-choice { flex-direction: row; }
  }

  .rb-booking-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .rb-guest-count-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 360px) {
    .rb-guest-count-grid { grid-template-columns: 1fr; }
  }

  .rb-card-expiry-row {
    display: flex;
    gap: 10px;
  }
  @media (max-width: 360px) {
    .rb-card-expiry-row { flex-direction: column; }
  }
`

/* ════════════════════════════════════
   FIELD ERROR
════════════════════════════════════ */
function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p style={{ fontSize:11, color:"#E05252", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
      <IconWarning size={11} color="#E05252"/> {msg}
    </p>
  )
}

/* ════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════ */
function StepBar({ step, isHall }) {
  const labels = isHall
    ? ["Guest", "Hall & Dates", "Payment"]
    : ["Guest", "Room & Dates", "Guest Details", "Payment"]
  const displayStep = isHall && step===4 ? 3 : step
  return (
    <div className="rb-step-bar" style={{ marginBottom:20 }}>
      <div className="rb-step-bar-inner">
        {labels.map((l, i) => {
          const n = i+1, done = n < displayStep, cur = n === displayStep
          return (
            <React.Fragment key={l}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:11, fontWeight:800, transition:"all .2s",
                  background: done?"#52C07A":cur?"#C9A84C":"rgba(255,255,255,.06)",
                  color: done||cur?"#0E0C09":"#6B6054",
                  border:`2px solid ${done?"#52C07A":cur?"#C9A84C":"rgba(255,255,255,.1)"}`,
                }}>
                  {done ? "✓" : n}
                </div>
                <span style={{ fontSize:10, fontWeight:cur?700:400, color:cur?"#C9A84C":done?"#52C07A":"#6B6054", whiteSpace:"nowrap" }}>{l}</span>
              </div>
              {i < labels.length-1 && (
                <div style={{ flex:1, minWidth:20, height:2, margin:"0 6px", marginBottom:18,
                  background: i < step-1 ? "#52C07A":"rgba(255,255,255,.06)", borderRadius:2, transition:"all .3s" }}/>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function ModeBtn({ active, onClick, children, danger }) {
  return (
    <button type="button" onClick={onClick} style={{
      flex:1, padding:"9px 8px", borderRadius:9, fontSize:12, fontWeight:600, textAlign:"center",
      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      background: active ? (danger?"rgba(224,82,82,.12)":"rgba(201,168,76,.12)") : "rgba(255,255,255,.03)",
      border:`1.5px solid ${active?(danger?"rgba(224,82,82,.5)":"rgba(201,168,76,.5)"):"rgba(255,255,255,.08)"}`,
      color: active ? (danger?"#E05252":"#C9A84C") : "#8A7E6A",
      cursor:"pointer", transition:"all .15s", minWidth:0,
    }}>
      {children}
    </button>
  )
}

function SectionLabel({ text }) {
  return (
    <p style={{ fontSize:10, fontWeight:800, color:"#6B6054", textTransform:"uppercase",
      letterSpacing:"0.12em", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
      {text}
      <span style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }}/>
    </p>
  )
}

function HallCalendar({ bookedDates=[], selected=[], onChange }) {
  const today = todayISO()
  const [vDate, setVDate] = useState(() => { const d=new Date(); d.setDate(1); return d })
  const y=vDate.getFullYear(), m=vDate.getMonth()
  const firstDay=new Date(y,m,1).getDay(), daysIn=new Date(y,m+1,0).getDate()
  const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const toYMD = d => { const mm=String(d.getMonth()+1).padStart(2,"0"); const dd=String(d.getDate()).padStart(2,"0"); return `${d.getFullYear()}-${mm}-${dd}` }
  const toggle = ymd => onChange(selected.includes(ymd)?selected.filter(d=>d!==ymd):[...selected,ymd].sort())
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysIn},(_,i)=>i+1)]
  return (
    <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:14 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <button type="button" onClick={()=>setVDate(new Date(y,m-1,1))}
          style={{ background:"none", border:"1px solid rgba(255,255,255,.1)", borderRadius:6, color:"#C9A84C", width:26, height:26, cursor:"pointer" }}>‹</button>
        <span style={{ fontSize:13, fontWeight:700, color:"#F5ECD7" }}>{MONTHS[m]} {y}</span>
        <button type="button" onClick={()=>setVDate(new Date(y,m+1,1))}
          style={{ background:"none", border:"1px solid rgba(255,255,255,.1)", borderRadius:6, color:"#C9A84C", width:26, height:26, cursor:"pointer" }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
          <div key={d} style={{ textAlign:"center", fontSize:9, color:"#6B6054", fontWeight:700 }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((d,i)=>{
          if (!d) return <div key={`e${i}`}/>
          const ymd=toYMD(new Date(y,m,d)), past=ymd<today, booked=bookedDates.includes(ymd), sel=selected.includes(ymd), dis=past||booked
          return (
            <button key={ymd} type="button" disabled={dis} onClick={()=>!dis&&toggle(ymd)} style={{
              padding:"5px 2px", borderRadius:6, fontSize:12, fontWeight:sel?700:400,
              background:sel?"rgba(201,168,76,.25)":booked?"rgba(224,82,82,.08)":"transparent",
              border:sel?"1px solid rgba(201,168,76,.6)":booked?"1px solid rgba(224,82,82,.2)":"1px solid transparent",
              color:past?"#2A2520":booked?"rgba(224,82,82,.4)":sel?"#C9A84C":"#C8BAA0",
              cursor:dis?"not-allowed":"pointer", textAlign:"center",
            }}>{d}</button>
          )
        })}
      </div>
      {selected.length>0&&(
        <div style={{ marginTop:10, padding:"6px 10px", borderRadius:8, background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.2)" }}>
          <p style={{ fontSize:11, color:"#C9A84C", fontWeight:600 }}>
            {selected.length} date{selected.length!==1?"s":""} selected
          </p>
        </div>
      )}
    </div>
  )
}

function GuestDetailRow({ idx, guest, onChange, type, errors }) {
  const upd = (k,v) => onChange(idx,{...guest,[k]:v})
  const isAdult = type==="Adult"
  const ageError = (()=>{
    if (!guest.age) return null
    const n=+guest.age
    if (isNaN(n)||n<1) return "Enter valid age"
    if (isAdult&&n<18) return "Adult must be 18+"
    if (!isAdult&&n>17) return "Child must be 1–17"
    return null
  })()
  return (
    <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", marginBottom:10 }}>
      <p style={{ fontSize:11, color:isAdult?"#C9A84C":"#5294E0", fontWeight:700, marginBottom:10, display:"inline-flex", alignItems:"center", gap:5 }}>
        {isAdult ? <UserIcon size={14}/> : <ChildIcon size={26} color="#5294E0"/>} Guest {idx+1} — {type}
      </p>
      <div className="rb-guest-row">
        <div>
          <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Full Name *</label>
          <input value={guest.name} onChange={e=>upd("name",e.target.value)} placeholder="Full name"
            style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors?.name?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
          <FieldError msg={errors?.name}/>
        </div>
        <div>
          <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Age *</label>
          <input type="number" value={guest.age} onChange={e=>upd("age",e.target.value)}
            placeholder={isAdult?"18+":"1–17"} min={isAdult?18:1} max={isAdult?120:17}
            style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${ageError?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
          <FieldError msg={ageError||errors?.age}/>
        </div>
        <div>
          <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Gender *</label>
          <select value={guest.gender} onChange={e=>upd("gender",e.target.value)}
            style={{ width:"100%", background:"rgba(20,18,14,1)", border:`1px solid ${errors?.gender?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"8px 10px", fontSize:13, color:guest.gender?"#F5ECD7":"#6B6054", outline:"none", boxSizing:"border-box" }}>
            <option value="">Select</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
          <FieldError msg={errors?.gender}/>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   ADMIN CANCEL MODAL
════════════════════════════════════════════════════════════ */
function AdminCancelModal({ booking, onConfirm, onClose, loading }) {
  const [confirmed, setConfirmed] = useState(false)
  if (!booking) return null

  const isHall      = !!booking.paymentDetails?.isNonContiguous
  const total       = booking.totalAmount || 0
  const paid        = booking.amountPaid  || 0
  const due         = booking.amountDue   || 0
  const nights      = Math.max(1, Math.round(
    (new Date(booking.checkOutDateTime) - new Date(booking.checkInDateTime)) / 86400000
  ))
  const pricePerDay    = booking.roomType?.price_per_night || 0
  const pricePerNight  = booking.roomType?.price_per_night || 0

  const cancFee    = isHall ? Math.round(pricePerDay * 0.25) : Math.round(total * 0.15)
  const cancRefund = Math.max(0, paid - cancFee)
  const cancWaived = Math.max(0, due)
  const hotelKeeps = Math.min(paid, cancFee)

  const isHalfPay  = paid < total && paid > 0
  const method     = booking.paymentDetails?.method
  const upiId      = booking.paymentDetails?.upiId
  const cardNum    = booking.paymentDetails?.cardNumber

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300,
      background:"rgba(0,0,0,.78)", backdropFilter:"blur(10px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:"16px",
    }} onClick={() => { if (!loading) onClose() }}>
      <div onClick={e => e.stopPropagation()} className="rb-cancel-modal">

        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{
            width:58, height:58, borderRadius:"50%",
            background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24, margin:"0 auto 14px",
          }}>🚫</div>
          <h3 style={{ color:"#F5ECD7", fontSize:"1.1rem", fontWeight:700, margin:"0 0 6px", fontFamily:"Georgia,serif" }}>
            {isHall ? "Cancel Venue Date?" : "Cancel This Booking?"}
          </h3>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:12, margin:0 }}>
            Review the full breakdown. This action cannot be undone.
          </p>
        </div>

        <div style={{
          borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,.07)",
          marginBottom:18,
        }}>
          <div style={{ padding:"10px 16px", background:"rgba(255,255,255,.03)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <p style={{ fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>
              {isHall ? "🏛 Hall Booking" : "🛏 Room Booking"} — Ref #{booking._id?.toString().slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="rb-snapshot-grid">
            {[
              ["Guest",      booking.customer?.name || "—"],
              [isHall?"Hall":"Room", isHall ? (booking.roomType?.type_name||"—") : (booking.room ? `#${booking.room.room_number}` : "—")],
              ["Check-In",   fmtDate(booking.checkInDateTime)],
              ["Check-Out",  fmtDate(booking.checkOutDateTime)],
              [isHall?"Duration":"Nights", isHall ? "1 day" : `${nights} night${nights!==1?"s":""}`],
              ["Booked On",  booking.createdAt ? fmtDate(booking.createdAt) : "—"],
            ].map(([l,v], i) => (
              <div key={l} style={{
                padding:"10px 14px",
                borderBottom: i < 4 ? "1px solid rgba(255,255,255,.05)" : "none",
                borderRight:  i % 2 === 0 ? "1px solid rgba(255,255,255,.05)" : "none",
                background:   i % 4 < 2 ? "transparent" : "rgba(255,255,255,.015)",
              }}>
                <p style={{ fontSize:10, color:"#6B6054", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.07em" }}>{l}</p>
                <p style={{ fontSize:13, fontWeight:600, color:"#C8BAA0", margin:0 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderRadius:12, overflow:"hidden",
          border:`1px solid ${isHall ? "rgba(248,113,113,.2)" : "rgba(251,191,36,.2)"}`,
          marginBottom:18,
        }}>
          <div style={{
            padding:"11px 16px",
            background: isHall ? "rgba(248,113,113,.08)" : "rgba(251,191,36,.07)",
            borderBottom:`1px solid ${isHall ? "rgba(248,113,113,.15)" : "rgba(251,191,36,.15)"}`,
            display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8,
          }}>
            <p style={{ fontSize:11, fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase",
              color: isHall ? "#f87171" : "#fbbf24", margin:0 }}>
              ⚠ Cancellation Fee Breakdown
            </p>
            <span style={{
              fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:20,
              background: isHall ? "rgba(248,113,113,.12)" : "rgba(251,191,36,.12)",
              color:      isHall ? "#f87171" : "#fbbf24",
              border:    `1px solid ${isHall ? "rgba(248,113,113,.3)" : "rgba(251,191,36,.3)"}`,
              whiteSpace:"nowrap",
            }}>
              {isHall ? "25% of day rate" : "15% of total"}
            </span>
          </div>

          {[
            {
              label:    isHall ? `Full per-day rate` : `Total booking value`,
              sub:      isHall ? `${booking.roomType?.type_name}` : `${nights} night${nights!==1?"s":""} × ${fmtINR(pricePerNight)}`,
              value:    isHall ? fmtINR(pricePerDay) : fmtINR(total),
              color:    "#C9A84C",
            },
            {
              label:    `Cancellation fee (${isHall ? "25% of day rate" : "15% of total"})`,
              sub:      isHall ? `${fmtINR(pricePerDay)} × 25%` : `${fmtINR(total)} × 15%`,
              value:    `− ${fmtINR(cancFee)}`,
              color:    isHall ? "#f87171" : "#fbbf24",
            },
            {
              label:    "Guest paid upfront",
              sub:      [
                isHalfPay ? "50% split" : "Full payment",
                method ? (METHOD_LABEL[method] || method) : null,
                upiId  ? upiId : null,
                cardNum ? `**** ${cardNum}` : null,
              ].filter(Boolean).join(" · "),
              value:    fmtINR(paid),
              color:    "#52C07A",
            },
          ].map(({ label, sub, value, color }, i) => (
            <div key={i} style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 16px", gap:8,
              background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.02)",
              borderBottom: "1px solid rgba(255,255,255,.05)",
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, color:"#C8BAA0", margin:0 }}>{label}</p>
                {sub && <p style={{ fontSize:10, color:"#6B6054", margin:"2px 0 0", wordBreak:"break-word" }}>{sub}</p>}
              </div>
              <span style={{ fontSize:15, fontWeight:700, color, flexShrink:0 }}>{value}</span>
            </div>
          ))}

          {cancWaived > 0 && (
            <div style={{
              display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"12px 16px", gap:8, background:"rgba(82,148,224,.05)",
              borderBottom:"1px solid rgba(255,255,255,.05)",
            }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:13, color:"#5294E0", margin:0 }}>Remaining balance — Waived</p>
                <p style={{ fontSize:10, color:"#6B6054", margin:"2px 0 0" }}>
                  Guest no longer owes this amount on cancellation
                </p>
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:"#5294E0", flexShrink:0 }}>{fmtINR(cancWaived)} waived</span>
            </div>
          )}

          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"16px", gap:8,
            background: cancRefund > 0 ? "rgba(82,192,122,.07)" : "rgba(255,255,255,.02)",
            borderTop:"2px solid rgba(255,255,255,.09)",
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:15, fontWeight:800, color: cancRefund>0?"#52C07A":"#6B6054", margin:"0 0 4px" }}>
                {cancRefund > 0 ? "✓ Refund to Guest" : "No Refund Applicable"}
              </p>
              <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>
                {cancRefund > 0
                  ? `${fmtINR(paid)} paid − ${fmtINR(cancFee)} fee = ${fmtINR(cancRefund)}`
                  : "Cancellation fee ≥ amount paid — no refund issued"}
              </p>
            </div>
            <span style={{ fontSize:22, fontWeight:800, fontFamily:"Georgia,serif", color: cancRefund>0?"#52C07A":"#6B6054", flexShrink:0 }}>
              {fmtINR(cancRefund)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom:18 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#6B6054", marginBottom:5, flexWrap:"wrap", gap:4 }}>
            <span>Refundable ({isHall?"75%":"85%"} of {isHall?"day rate":"total"})</span>
            <span>Fee ({isHall?"25%":"15%"} retained)</span>
          </div>
          <div style={{ height:6, borderRadius:3, overflow:"hidden", background:"rgba(255,255,255,.06)", display:"flex" }}>
            <div style={{ width: isHall?"75%":"85%", background:"linear-gradient(90deg,#4ade80,#22c55e)", borderRadius:3 }}/>
            <div style={{ flex:1, background: isHall?"linear-gradient(90deg,#f87171,#ef4444)":"linear-gradient(90deg,#fbbf24,#f59e0b)", borderRadius:3 }}/>
          </div>
        </div>

        <div style={{
          padding:"14px 16px", borderRadius:10, marginBottom:20,
          background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.15)",
          fontSize:12, color:"#8A7E6A", lineHeight:1.7,
        }}>
          <p style={{ margin:"0 0 6px", fontWeight:700, color:"#C9A84C", fontSize:13 }}>💡 What happens next</p>
          <p style={{ margin:"0 0 4px" }}>
            Hotel retains <strong style={{ color:"#C9A84C" }}>{fmtINR(hotelKeeps)}</strong> as cancellation revenue.
          </p>
          {cancRefund > 0 ? (
            <p style={{ margin:"0 0 4px" }}>
              Resort must refund <strong style={{ color:"#52C07A" }}>{fmtINR(cancRefund)}</strong> to{" "}
              <strong style={{ color:"#F5ECD7" }}>{booking.customer?.name || "the guest"}</strong> within 2 business days.
            </p>
          ) : (
            <p style={{ margin:"0 0 4px" }}>No refund will be issued — fee equals or exceeds upfront payment.</p>
          )}
          {cancWaived > 0 && (
            <p style={{ margin:"0 0 4px" }}>
              Remaining balance of <strong style={{ color:"#5294E0" }}>{fmtINR(cancWaived)}</strong> is fully waived.
            </p>
          )}
          <p style={{ margin:0 }}>
            A cancellation email will be sent automatically to{" "}
            <strong style={{ color:"#F5ECD7" }}>{booking.customer?.email || "the guest"}</strong>.
          </p>
        </div>

        {!confirmed ? (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button onClick={onClose} disabled={loading} style={{
              flex:1, minWidth:100, padding:"12px", borderRadius:12, cursor:"pointer",
              background:"transparent", border:"1px solid rgba(255,255,255,.1)",
              color:"rgba(255,255,255,.5)", fontSize:13, fontWeight:600,
            }}>
              Keep Booking
            </button>
            <button onClick={() => setConfirmed(true)} disabled={loading} style={{
              flex:1.5, minWidth:140, padding:"12px", borderRadius:12, cursor:"pointer",
              background:"rgba(248,113,113,.1)", border:"1px solid rgba(248,113,113,.4)",
              color:"#f87171", fontSize:13, fontWeight:700,
            }}>
              I understand — proceed →
            </button>
          </div>
        ) : (
          <div style={{
            padding:16, borderRadius:12,
            background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.4)",
          }}>
            <p style={{ fontSize:13, fontWeight:700, color:"#f87171", textAlign:"center", margin:"0 0 14px" }}>
              ⚠ Final Confirmation — This cannot be undone
            </p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <button onClick={() => setConfirmed(false)} disabled={loading} style={{
                flex:1, minWidth:80, padding:"11px", borderRadius:10, cursor:"pointer",
                background:"transparent", border:"1px solid rgba(255,255,255,.1)",
                color:"rgba(255,255,255,.4)", fontSize:12, fontWeight:600,
              }}>
                Go Back
              </button>
              <button onClick={onConfirm} disabled={loading} style={{
                flex:2, minWidth:140, padding:"11px", borderRadius:10, cursor: loading?"not-allowed":"pointer",
                background: loading ? "rgba(248,113,113,.3)" : "#f87171",
                border:"none", color:"white", fontSize:13, fontWeight:700,
                display:"flex", alignItems:"center", justifyContent:"center", gap:7,
              }}>
                {loading ? (
                  <>
                    <svg width={14} height={14} viewBox="0 0 14 14" style={{ animation:"spin .7s linear infinite" }}>
                      <circle cx="7" cy="7" r="5" fill="none" stroke="white" strokeWidth="2" strokeOpacity=".3"/>
                      <path d="M7 2a5 5 0 015 5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                    </svg>
                    Cancelling…
                  </>
                ) : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
export default function RoomBooking() {
  const [rooms,      setRooms]     = useState([])
  const [roomTypes,  setRoomTypes] = useState([])
  const [bookings,   setBookings]  = useState([])
  const [customers,  setCustomers] = useState([])
  const [loading,    setLoading]   = useState(true)
  const [tab,        setTab]       = useState("bookings")
  const [bFilter,    setBFilter]   = useState("All")
  const [search,     setSearch]    = useState("")
  const [bookModal,  setBookModal] = useState(false)
  const [actModal,   setActModal]  = useState(null)
  const [cancelModal,setCancelModal] = useState(null)
  const [cancelLoad, setCancelLoad]  = useState(false)
  const [dayFilter,  setDayFilter] = useState("All")
  const [coPayment,  setCoPayment] = useState({ method:"cash", upiId:"", cardNumber:"", cardName:"", expiry:"", cvv:"" })
  const [coErrors,   setCoErrors]  = useState({})
  const [ciPayChoice,setCiPayChoice]=useState("checkout")
  const [form,       setForm]      = useState(EMPTY_FORM)
  const [errors,     setErrors]    = useState({})
  const [guestErrs,  setGuestErrs] = useState([])
  const [saving,     setSaving]    = useState(false)
  const [actLoad,    setActLoad]   = useState(false)
  const [step,       setStep]      = useState(1)
  const [availData,  setAvailData] = useState(null)
  const [availLoad,  setAvailLoad] = useState(false)
  const [otpSending, setOtpSend]   = useState(false)
  const [otpVerify,  setOtpVerify] = useState(false)
  const [cooldown,   setCooldown]  = useState(0)
  const coolRef = useRef(null)

  const { toast, show } = useToast()
  const { user } = useAuth()
  const basePath = user?.role==="staff" ? "/staff" : "/admin"
  const navigate = useNavigate()

  const load = async () => {
    setLoading(true)
    try {
      const [r,t,b] = await Promise.all([
        getRooms().catch(()=>({data:[]})),
        getRoomTypes().catch(()=>({data:[]})),
        getAllBookings().catch(()=>({data:[]})),
      ])
      setRooms(r.data||[]); setRoomTypes(t.data||[])
      const bList=b.data||[]; setBookings(bList)
      const cmap={}; bList.forEach(bk=>{const c=bk.customer;if(c?._id)cmap[c._id]=c})
      setCustomers(Object.values(cmap))
    } catch { show("Failed to load","error") }
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  useEffect(()=>{
    if (!form.roomTypeId){setAvailData(null);return}
    setAvailLoad(true)
    getBookedDatesApi(form.roomTypeId).then(r=>setAvailData(r.data)).catch(()=>setAvailData(null)).finally(()=>setAvailLoad(false))
  },[form.roomTypeId])

  const startCooldown = () => {
    setCooldown(60); clearInterval(coolRef.current)
    coolRef.current=setInterval(()=>{ setCooldown(c=>{if(c<=1){clearInterval(coolRef.current);return 0}return c-1}) },1000)
  }
  useEffect(()=>()=>clearInterval(coolRef.current),[])

  const available    = rooms.filter(r=>r.status==="Available")
  const selectedType = roomTypes.find(t=>t._id===form.roomTypeId)
  const capacity     = parseCapacity(selectedType?.capacity)
  const totalGuests  = form.adults+form.children

  const hallBookedDates = useMemo(()=>{
    if (!availData?.ranges) return []
    const dates=[]; availData.ranges.forEach(r=>{if(r.hallDates?.length)dates.push(...r.hallDates)}); return [...new Set(dates)]
  },[availData])

  const toYMD = d => { const dt=new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}` }
  const addDays = (ymd,n) => { const [y,m,d]=ymd.split("-").map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return toYMD(dt) }

  const roomDateConflict = useMemo(()=>{
    if (form.bookingType!=="room"||!form.checkIn||!form.checkOut||!availData?.ranges) return false
    const totalRooms=availData.totalRooms||0; if (totalRooms===0) return false
    const counts={}
    availData.ranges.forEach(r=>{ if(r.hallDates) return; const ri=toYMD(r.checkIn),ro=toYMD(r.checkOut); let cur=ri; while(cur<ro){counts[cur]=(counts[cur]||0)+1;cur=addDays(cur,1)} })
    let cur=form.checkIn; while(cur<form.checkOut){if((counts[cur]||0)>=totalRooms)return true;cur=addDays(cur,1)}; return false
  },[form.checkIn,form.checkOut,availData,form.bookingType])

  const roomsAvailableForDates = useMemo(()=>{
    if (form.bookingType!=="room"||!form.checkIn||!form.checkOut||!availData?.ranges) return null
    const totalRooms=availData.totalRooms||0; if (totalRooms===0) return 0
    const counts={}
    availData.ranges.forEach(r=>{ if(r.hallDates) return; const ri=toYMD(r.checkIn),ro=toYMD(r.checkOut); let cur=ri; while(cur<ro){counts[cur]=(counts[cur]||0)+1;cur=addDays(cur,1)} })
    let maxOccupied=0,cur=form.checkIn; while(cur<form.checkOut){maxOccupied=Math.max(maxOccupied,counts[cur]||0);cur=addDays(cur,1)}
    return Math.max(0,totalRooms-maxOccupied)
  },[form.checkIn,form.checkOut,availData,form.bookingType])

  const nights = useMemo(()=>{ if(!form.checkIn||!form.checkOut)return 0; return Math.max(0,Math.round((new Date(form.checkOut)-new Date(form.checkIn))/86400000)) },[form.checkIn,form.checkOut])
  const totalAmount = selectedType
    ? form.bookingType==="room" ? (selectedType.price_per_night||0)*nights : (selectedType.price_per_night||0)*form.hallDates.length
    : 0

  const set = patch => setForm(f=>({...f,...patch}))
  const syncGuests = (adults,children) => {
    const total=adults+children, cur=form.guests
    const next=Array.from({length:total},(_,i)=>cur[i]||{name:"",age:"",gender:""})
    set({adults,children,guests:next}); setGuestErrs([])
  }

  const handleSendOtp = async () => {
    if (!isValidEmail(form.guestEmail)){setErrors(e=>({...e,guestEmail:"Enter a valid email address"}));return}
    setErrors(e=>({...e,guestEmail:""})); setOtpSend(true)
    try {
      const res=await sendAdminOtp(form.guestEmail.trim())
      set({emailOtpSent:true,emailOtpCode:"",emailVerified:false}); startCooldown()
      if (res.data.existingCustomerId){set({existingCustomerId:res.data.existingCustomerId});show("OTP sent — this email already has an account, we'll link it","")}
      else show("OTP sent to email!")
    } catch(e){setErrors(er=>({...er,guestEmail:e.response?.data?.message||"Failed to send OTP"}))}
    setOtpSend(false)
  }

  const handleVerifyOtp = async () => {
    if (!form.emailOtpCode||form.emailOtpCode.length<4){setErrors(e=>({...e,emailOtp:"Enter the 6-digit OTP"}));return}
    setOtpVerify(true)
    try {
      await verifyAdminOtp(form.guestEmail.trim(),form.emailOtpCode.trim())
      set({emailVerified:true}); setErrors(e=>({...e,emailOtp:""})); show("Email verified!")
    } catch(e){setErrors(er=>({...er,emailOtp:e.response?.data?.message||"Invalid or expired OTP"}))}
    setOtpVerify(false)
  }

  const validateStep = () => {
    const errs={}
    if (step===1){
      if (form.customerMode==="existing"&&!form.customerId) errs.customerId="Select a registered guest"
      if (form.customerMode==="walkin"){
        if (!isValidName(form.guestName))   errs.guestName="Enter at least 2 characters"
        if (!isValidPhone(form.guestPhone)) errs.guestPhone="Enter valid 10-digit mobile number (starts with 6–9)"
        if (!isValidEmail(form.guestEmail)) errs.guestEmail="Enter a valid email address"
        if (!form.emailVerified)            errs.emailVerify="Email must be verified before proceeding"
        if (!form.guestCity.trim())         errs.guestCity="City is required"
        if (!form.guestAddress.trim())      errs.guestAddress="Address is required"
      }
    }
    if (step===2){
      if (!form.roomTypeId) errs.roomTypeId="Select a room / hall type"
      if (form.bookingType==="room"){
        if (!form.checkIn)       errs.checkIn="Select check-in date"
        if (!form.checkOut)      errs.checkOut="Select check-out date"
        else if (nights<1)       errs.checkOut="Check-out must be after check-in"
        else if (roomDateConflict) errs.checkOut="All rooms of this type are fully booked for these dates"
      }
      if (form.bookingType==="hall"&&form.hallDates.length===0) errs.hallDates="Select at least one date from the calendar"
    }
    if (step===3){
      const gErrs=form.guests.map(g=>{
        const ge={}
        if (!isValidName(g.name)) ge.name="Name required (min 2 chars)"
        if (!g.age)               ge.age="Age required"
        else { const n=+g.age; if(n<1||n>120) ge.age="Enter valid age" }
        if (!g.gender)            ge.gender="Select gender"
        return ge
      })
      setGuestErrs(gErrs)
      if (gErrs.some(ge=>Object.keys(ge).length>0)){setErrors(errs);return false}
      if (form.guests.slice(0,form.adults).some(g=>+g.age<18)) errs._guests="All adults must be 18 or older"
      if (form.guests.slice(form.adults).some(g=>+g.age<1||+g.age>17)) errs._guests="Children must be between 1 and 17 years"
      if (totalGuests>capacity) errs._capacity=`Room capacity is ${capacity} — you have ${totalGuests} guests`
    }
    if (step===4){
      if (!form.paymentMethod) errs.paymentMethod="Select a payment method"
      if (form.paymentMethod==="upi"&&!form.upiId.includes("@")) errs.upiId="Enter valid UPI ID (e.g. name@upi)"
      if (form.paymentMethod==="credit_card"||form.paymentMethod==="debit_card"){
        if (form.cardNumber.replace(/\s/g,"").length<16) errs.cardNumber="Enter 16-digit card number"
        if (!form.cardName.trim())                       errs.cardName="Enter cardholder name"
        if (!form.cvv||form.cvv.length<3)                errs.cvv="Enter 3 or 4 digit CVV"
        if (form.expiry.length<5) errs.expiry="Enter expiry (MM/YY)"
        else {
          const [mm,yy]=form.expiry.split("/"), expMM=parseInt(mm), expYY=2000+parseInt(yy)
          const now=new Date(), curYY=now.getFullYear(), curMM=now.getMonth()+1
          if (expMM<1||expMM>12) errs.expiry="Enter valid month (01–12)"
          else if (expYY>curYY+15) errs.expiry="Enter a realistic expiry year"
          else if (expYY<curYY||(expYY===curYY&&expMM<curMM)) errs.expiry="Card has expired"
        }
      }
    }
    setErrors(errs); return Object.keys(errs).length===0
  }

  const isHall=form.bookingType==="hall"
  const nextStep=()=>{ if(!validateStep())return; if(isHall&&step===2){setStep(4);return}; setStep(s=>s+1) }
  const prevStep=()=>{ setErrors({}); setGuestErrs([]); if(isHall&&step===4){setStep(2);return}; setStep(s=>s-1) }

  const handleSave = async () => {
    if (!validateStep()) return
    setSaving(true)
    try {
      let customerId=form.customerId
      if (form.customerMode==="walkin"){
        if (form.existingCustomerId) customerId=form.existingCustomerId
        else {
          const res=await registerWalkin({ name:form.guestName.trim(), email:form.guestEmail.trim(), phoneno:form.guestPhone.replace(/\s/g,""), city:form.guestCity.trim(), address:form.guestAddress.trim() })
          customerId=res.data.customerId||res.data._id
        }
      }
      if (!customerId){show("Guest registration failed","error");setSaving(false);return}
      const isHallLocal=form.bookingType==="hall"
      const payload = {
        customer:customerId, roomType:form.roomTypeId, adults:form.adults, children:form.children,
        guests:form.guests.map(g=>({name:g.name.trim(),age:+g.age,gender:g.gender})), amountPaid:totalAmount,
        paymentDetails:{
          method:form.paymentMethod, splitChoice:"full",
          ...(form.paymentMethod==="upi"&&{upiId:form.upiId}),
          ...((form.paymentMethod==="credit_card"||form.paymentMethod==="debit_card")&&{cardNumber:form.cardNumber,cardName:form.cardName,expiry:form.expiry,cvv:form.cvv}),
          ...(isHallLocal&&{isNonContiguous:true,hallDates:form.hallDates}),
        },
        ...(isHallLocal
          ?{checkInDateTime:new Date(form.hallDates[0]).toISOString(),checkOutDateTime:new Date(form.hallDates[form.hallDates.length-1]).toISOString()}
          :{checkInDateTime:new Date(form.checkIn).toISOString(),checkOutDateTime:new Date(form.checkOut).toISOString()}
        ),
      }
      await createBooking(payload)
      if (form.bookingStatus==="Checked-In"){
        await new Promise(r=>setTimeout(r,500))
        const fresh=await getAllBookings()
        const ciDateStr=new Date(form.checkIn).toDateString()
        const newBk=(fresh.data||[]).find(b=>b.customer?._id?.toString()===customerId&&b.bookingStatus==="Booked"&&b.roomType?._id?.toString()===form.roomTypeId&&new Date(b.checkInDateTime).toDateString()===ciDateStr)
        if (newBk) await checkIn(newBk._id,{}).catch(()=>{})
      }
      show(form.bookingStatus==="Checked-In"?"Guest checked in!":"Booking created!")
      setBookModal(false); setForm(EMPTY_FORM); setStep(1); setErrors({}); load()
    } catch(err){ show(err.response?.data?.message||"Failed to create booking","error") }
    setSaving(false)
  }

  const validateCoPayment = () => {
    const errs={}, m=coPayment.method
    if (!m){errs.method="Select a payment method";setCoErrors(errs);return false}
    if (m==="upi"&&!coPayment.upiId.includes("@")) errs.upiId="Enter valid UPI ID"
    if (m==="credit_card"||m==="debit_card"){
      if (coPayment.cardNumber.replace(/\s/g,"").length<16) errs.cardNumber="Enter 16-digit card number"
      if (!coPayment.cardName.trim())                       errs.cardName="Enter cardholder name"
      if (!coPayment.cvv||coPayment.cvv.length<3)           errs.cvv="Enter 3 or 4 digit CVV"
      if (coPayment.expiry.length<5) errs.expiry="Enter expiry (MM/YY)"
      else {
        const [mm,yy]=coPayment.expiry.split("/"), expMM2=parseInt(mm), expYY2=2000+parseInt(yy)
        const now2=new Date(), curYY2=now2.getFullYear(), curMM2=now2.getMonth()+1
        if (expMM2<1||expMM2>12) errs.expiry="Enter valid month (01–12)"
        else if (expYY2>curYY2+15) errs.expiry="Enter a realistic expiry year"
        else if (expYY2<curYY2||(expYY2===curYY2&&expMM2<curMM2)) errs.expiry="Card has expired"
      }
    }
    setCoErrors(errs); return Object.keys(errs).length===0
  }

  const handleAction = async () => {
    const bk=actModal.booking, due=bk.amountDue||0
    if (actModal.type==="checkin"&&due>0&&ciPayChoice==="now"&&!validateCoPayment()) return
    if (actModal.type==="checkout"&&due>0&&!validateCoPayment()) return
    setActLoad(true)
    try {
      if (actModal.type==="checkin"){
        const payBody=(due>0&&ciPayChoice==="now")?{collectNow:true,paymentMethod:coPayment.method,upiId:coPayment.upiId,cardNumber:coPayment.cardNumber,cardName:coPayment.cardName,expiry:coPayment.expiry,cvv:coPayment.cvv}:{}
        await checkIn(bk._id,payBody)
      }
      if (actModal.type==="checkout"){
        const payBody=due>0?{paymentMethod:coPayment.method,upiId:coPayment.upiId,cardNumber:coPayment.cardNumber,cardName:coPayment.cardName,expiry:coPayment.expiry,cvv:coPayment.cvv}:null
        await checkOut(bk._id,payBody)
      }
      show(actModal.type==="checkin"?(due>0&&ciPayChoice==="now"?"Checked in & payment collected!":"Checked in!"):actModal.type==="checkout"?"Checked out successfully!":"")
      setActModal(null); setCoPayment({method:"cash",upiId:"",cardNumber:"",cardName:"",expiry:"",cvv:""}); setCoErrors({}); setCiPayChoice("checkout"); load()
    } catch(e){ show(e.response?.data?.message||"Failed","error") }
    setActLoad(false)
  }

  const handleCancelConfirm = async () => {
    if (!cancelModal) return
    setCancelLoad(true)
    try {
      await cancelBooking(cancelModal._id)
      show("Booking cancelled. Cancellation email sent to guest.", "success")
      setCancelModal(null)
      load()
    } catch(e){ show(e.response?.data?.message || "Cancellation failed","error") }
    setCancelLoad(false)
  }

  /* ── Co-payment fields ── */
  const CoPaymentFields = () => (
    <div>
      <div className="rb-pm-grid">
        {PAYMENT_METHODS.map(m=>{
          const Icon=m.icon
          return (
            <button key={m.value} type="button"
              onClick={()=>{ setCoPayment(p=>({...p,method:m.value})); setCoErrors(er=>({...er,method:""})) }}
              style={{padding:"8px 10px",borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all .15s",
                display:"flex",alignItems:"center",gap:7,
                background:coPayment.method===m.value?"rgba(201,168,76,.12)":"rgba(255,255,255,.02)",
                border:`1.5px solid ${coPayment.method===m.value?"rgba(201,168,76,.5)":"rgba(255,255,255,.08)"}`}}>
              <Icon size={18} color={coPayment.method===m.value?"#C9A84C":"#6B6054"}/>
              <div style={{ minWidth:0 }}>
                <p style={{fontSize:12,fontWeight:700,color:coPayment.method===m.value?"#C9A84C":"#C8BAA0",marginBottom:1}}>{m.label}</p>
                <p style={{fontSize:10,color:"#6B6054",display:"none"}}>{m.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
      {coErrors.method&&<p style={{fontSize:11,color:"#E05252",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><IconWarning size={11} color="#E05252"/> {coErrors.method}</p>}
      {coPayment.method==="cash"&&(
        <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(82,192,122,.08)",border:"1px solid rgba(82,192,122,.2)"}}>
          <p style={{fontSize:12,color:"#52C07A",display:"flex",alignItems:"center",gap:5}}><RightTickIcon size={13} color="#52C07A"/> Collect {fmtINR(actModal?.booking?.amountDue||0)} cash at front desk.</p>
        </div>
      )}
      {coPayment.method==="upi"&&(
        <div>
          <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>UPI ID *</label>
          <input value={coPayment.upiId} onChange={e=>{ setCoPayment(p=>({...p,upiId:e.target.value})); setCoErrors(er=>({...er,upiId:""})) }} placeholder="guest@upi"
            style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${coErrors.upiId?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
          {coErrors.upiId&&<p style={{fontSize:11,color:"#E05252",marginTop:4}}>{coErrors.upiId}</p>}
        </div>
      )}
      {(coPayment.method==="credit_card"||coPayment.method==="debit_card")&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div>
            <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Card Number *</label>
            <input value={coPayment.cardNumber} onChange={e=>{ const raw=e.target.value.replace(/\D/g,"").slice(0,16); const fmt=raw.replace(/(.{4})/g,"$1 ").trim(); setCoPayment(p=>({...p,cardNumber:fmt})); setCoErrors(er=>({...er,cardNumber:""})) }}
              placeholder="XXXX XXXX XXXX XXXX" maxLength={19}
              style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${coErrors.cardNumber?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box",letterSpacing:"0.08em"}}/>
            {coErrors.cardNumber&&<p style={{fontSize:11,color:"#E05252",marginTop:4}}>{coErrors.cardNumber}</p>}
          </div>
          <div>
            <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Cardholder Name *</label>
            <input value={coPayment.cardName} onChange={e=>{ setCoPayment(p=>({...p,cardName:e.target.value})); setCoErrors(er=>({...er,cardName:""})) }} placeholder="Name as on card"
              style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${coErrors.cardName?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
            {coErrors.cardName&&<p style={{fontSize:11,color:"#E05252",marginTop:4}}>{coErrors.cardName}</p>}
          </div>
          <div className="rb-card-expiry-row">
            <div style={{flex:1}}>
              <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Expiry (MM/YY) *</label>
              <input value={coPayment.expiry} onChange={e=>{ const raw=e.target.value.replace(/\D/g,"").slice(0,4); const fmt=raw.length>2?raw.slice(0,2)+"/"+raw.slice(2):raw; setCoPayment(p=>({...p,expiry:fmt})); setCoErrors(er=>({...er,expiry:""})) }}
                placeholder="MM/YY" maxLength={5}
                style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${coErrors.expiry?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
              {coErrors.expiry&&<p style={{fontSize:11,color:"#E05252",marginTop:4}}>{coErrors.expiry}</p>}
            </div>
            <div style={{width:100,flexShrink:0}}>
              <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>CVV *</label>
              <input value={coPayment.cvv} onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,4); setCoPayment(p=>({...p,cvv:d})); setCoErrors(er=>({...er,cvv:""})) }}
                placeholder="•••" maxLength={4} type="password" inputMode="numeric"
                style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${coErrors.cvv?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"8px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box",letterSpacing:"0.2em"}}/>
              {coErrors.cvv&&<p style={{fontSize:11,color:"#E05252",marginTop:4}}>{coErrors.cvv}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const bookingCols = [
    { key:"_id", label:"Booking Ref",
      render:(v,r)=>{
        const isHallBk=r.paymentDetails?.isNonContiguous, hallDates=r.paymentDetails?.hallDates||[]
        const siblings=isHallBk?bookings.filter(b=>b.paymentDetails?.isNonContiguous&&b.customer?._id===r.customer?._id&&b.roomType?._id===r.roomType?._id&&JSON.stringify([...(b.paymentDetails?.hallDates||[])].sort())===JSON.stringify([...hallDates].sort())&&b._id!==v):[]
        return (
          <div className="flex items-start gap-2">
            <div style={{width:32,height:32,borderRadius:8,background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
              {isHallBk ? <HallIcon size={16}/> : <BookingIcon size={16}/>}
            </div>
            <div>
              <p style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#C9A84C",letterSpacing:"0.06em"}}>#{v?.toString().slice(-8).toUpperCase()}</p>
              <p className="text-xs text-resort-dim">{r?.customer?.name||"—"}</p>
              {siblings.length>0&&(
                <div style={{marginTop:3,display:"flex",flexDirection:"column",gap:1}}>
                  {siblings.map(s=>(<p key={s._id} style={{fontFamily:"monospace",fontSize:10,color:"rgba(201,168,76,.5)",margin:0,letterSpacing:"0.05em"}}>#{s._id?.toString().slice(-8).toUpperCase()} · {fmtDate(s.checkInDateTime)}</p>))}
                </div>
              )}
            </div>
          </div>
        )
      }
    },
    { key:"room", label:"Room",
      render:(v,r)=>(
        <div>
          <p className="font-display text-sm font-bold text-gold">{v?`#${v.room_number}`:"—"}</p>
          <p className="text-xs text-resort-dim">{r.roomType?.type_name||"—"}</p>
        </div>
      )
    },
    { key:"checkInDateTime", label:"Dates",
      render:(v,r)=>{
        const isHallBk=r.paymentDetails?.isNonContiguous
        if (isHallBk){const sorted=[...(r.paymentDetails?.hallDates||[])].sort();return(<div><p className="text-xs text-cream">{fmtDate(v)}</p><p className="text-xs text-resort-dim">1 day · Hall</p>{sorted.length>1&&<p style={{fontSize:10,color:"#C9A84C",marginTop:1}}>Event: {sorted.length} dates</p>}</div>)}
        const n=Math.round((new Date(r.checkOutDateTime)-new Date(v))/86400000)
        return(<div><p className="text-xs text-cream">{fmtDate(v)} → {fmtDate(r.checkOutDateTime)}</p><p className="text-xs text-resort-dim">{n} night{n!==1?"s":""}</p></div>)
      }
    },
    { key:"totalAmount", label:"Amount", render:v=><span className="font-semibold text-cream">{fmtINR(v)}</span> },
    { key:"bookingStatus", label:"Status", render:v=><Badge label={v} variant={v} size="sm"/> },
    { key:"paymentStatus", label:"Payment",
      render:v=>{const c=PCOLOR[v]||"#6B6054";return<span style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:`${c}15`,color:c,border:`1px solid ${c}22`,whiteSpace:"nowrap"}}>{v}</span>}
    },
    { key:"actions", label:"Actions",
      render:(_,r)=>(
        <div className="flex gap-1.5">
          <Button size="xs" variant="gold" onClick={()=>navigate(`${basePath}/bookings/${r._id}`,{state:{booking:r}})}>View</Button>
          {r.bookingStatus==="Booked" && (
            <Button size="xs" variant="danger" onClick={()=>setCancelModal(r)}>Cancel</Button>
          )}
        </div>
      )
    },
  ]

  const stats = {
    total:     bookings.length,
    checkedIn: bookings.filter(b=>b.bookingStatus==="Checked-In").length,
    booked:    bookings.filter(b=>b.bookingStatus==="Booked").length,
    revenue:   bookings.filter(b=>b.bookingStatus!=="Cancelled").reduce((s,b)=>s+(b.amountPaid||0),0),
  }

  /* ════════════════════════════════════
     TODAY FILTER HELPERS
  ════════════════════════════════════ */
  const getTodayMidnight = () => {
    const d = new Date(); d.setHours(0,0,0,0); return d
  }

  /**
   * Check-Ins Today:
   *   bookingStatus === "Booked"  (not yet checked in)
   *   AND checkInDateTime <= today  (due today OR overdue from a past date)
   *   AND checkOutDateTime > today  (stay hasn't fully expired yet)
   *
   *   This catches:
   *   - Guests whose check-in was yesterday (or earlier) but haven't arrived yet
   *   - Guests whose check-in is today
   *   Both are actionable — front desk can still check them in.
   */
  const checkInTodayCount = bookings.filter(b => {
    if (b.bookingStatus !== "Booked") return false
    const ciDate = new Date(b.checkInDateTime); ciDate.setHours(0,0,0,0)
    const coDate = new Date(b.checkOutDateTime); coDate.setHours(0,0,0,0)
    const today  = getTodayMidnight()
    return ciDate <= today && coDate > today
  }).length

  /**
   * Check-Outs Today:
   *   bookingStatus === "Checked-In"  (actively staying)
   *   AND checkOutDateTime <= today midnight  (due today OR overdue/past)
   */
  const checkOutTodayCount = bookings.filter(b => {
    if (b.bookingStatus !== "Checked-In") return false
    const coDate = new Date(b.checkOutDateTime); coDate.setHours(0,0,0,0)
    return coDate <= getTodayMidnight()
  }).length

  if (loading) return <Loader text="Loading bookings…"/>

  return (
    <div>
      <style>{RESPONSIVE_CSS}</style>
      <Toast {...(toast||{})}/>

      {cancelModal && (
        <AdminCancelModal
          booking={cancelModal}
          onClose={() => { if (!cancelLoad) setCancelModal(null) }}
          onConfirm={handleCancelConfirm}
          loading={cancelLoad}
        />
      )}

      <div className="page-hd">
        <div>
          <h1 className="page-title">Room Booking</h1>
          <p className="page-sub">{bookings.length} bookings · {available.length} rooms available</p>
        </div>
        <Button variant="gold" icon={<PlusIcon size={14} color="#0E0C09"/>} onClick={()=>{setForm(EMPTY_FORM);setStep(1);setErrors({});setGuestErrs([]);setBookModal(true)}}>
          New Booking
        </Button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 anim-up d1">
        {[
          { label:"Total Bookings",    value:stats.total,           color:"#C9A84C", Icon:()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
          { label:"Checked-In",        value:stats.checkedIn,       color:"#52C07A", Icon:()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
          { label:"Awaiting Check-In", value:stats.booked,          color:"#5294E0", Icon:()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="12" y1="14" x2="15" y2="14"/></svg> },
          { label:"Revenue Collected", value:fmtINR(stats.revenue), color:"#9B7FE8", Icon:()=><RupeeIcon size={20} color="currentColor"/> },
        ].map(k=>(
          <div key={k.label} className="stat-card">
            <div className="stat-bar" style={{background:k.color}}/>
            <div className="flex justify-between items-start mt-1">
              <div>
                <p className="text-[11px] text-resort-muted uppercase tracking-widest mb-2">{k.label}</p>
                <p className="font-display text-3xl font-bold" style={{color:k.color}}>{k.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{background:`${k.color}15`,border:`1px solid ${k.color}22`,color:k.color}}>
                <k.Icon/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tab-row">
        <button className={`tab-btn ${tab==="bookings"?"on":""}`} onClick={()=>setTab("bookings")} style={{display:"flex",alignItems:"center",gap:6}}>
          <BookingIcon size={15}/> All Bookings
        </button>
        <button className={`tab-btn ${tab==="rooms"?"on":""}`} onClick={()=>setTab("rooms")} style={{display:"flex",alignItems:"center",gap:6}}>
          <IconBed size={15}/> Room Status
        </button>
      </div>

      {tab==="bookings"&&(
        <div className="anim-up d2">
          {/* Search + status filters */}
          <div className="flex gap-3 mb-3 flex-wrap">
            <input placeholder="Search by ref ID, guest or room…" value={search} onChange={e=>setSearch(e.target.value)} className="f-input flex-1 min-w-48 max-w-sm"/>
            <div className="flex gap-2 flex-wrap">
              {["All","Booked","Checked-In","Checked-Out","Cancelled"].map(s=>(
                <button key={s} className={`chip ${bFilter===s?"on":""}`} onClick={()=>{ setBFilter(s); setDayFilter("All") }}>{s}</button>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════
              TODAY FILTERS
              Check-Ins Today  : status=Booked + checkIn <= today + checkOut > today
              Check-Outs Today : status=Checked-In + checkOut <= today
          ════════════════════════════════════ */}
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <span style={{fontSize:11,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginRight:4}}>Today:</span>
            {[
              { key:"checkin-today",  label:"Check-Ins Today",  Icon: BellIcon, color:"#C9A84C", count: checkInTodayCount  },
              { key:"checkout-today", label:"Check-Outs Today", Icon: DoorIcon, color:"#52C07A", count: checkOutTodayCount },
            ].map(f=>{
              const active=dayFilter===f.key
              return (
                <button key={f.key} onClick={()=>{ setDayFilter(active?"All":f.key); setBFilter("All") }}
                  style={{display:"flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:8,cursor:"pointer",transition:"all .15s",
                    background:active?`${f.color}18`:"rgba(255,255,255,.03)",border:`1.5px solid ${active?f.color:"rgba(255,255,255,.1)"}`,outline:"none"}}>
                  <f.Icon size={14} color={active?f.color:"#C8BAA0"}/>
                  <span style={{fontSize:12,fontWeight:700,color:active?f.color:"#C8BAA0"}}>{f.label}</span>
                  <span style={{fontSize:11,fontWeight:800,padding:"1px 7px",borderRadius:20,background:active?f.color:"rgba(255,255,255,.08)",color:active?"#100E0B":"#8A7E6A"}}>{f.count}</span>
                </button>
              )
            })}
            {dayFilter!=="All"&&(
              <button onClick={()=>setDayFilter("All")} style={{fontSize:11,color:"#6B6054",background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:6,textDecoration:"underline"}}>Clear</button>
            )}
          </div>

          {/* Status summary pills */}
          <div className="rb-booking-stats">
            {[{label:"Booked",count:bookings.filter(b=>b.bookingStatus==="Booked").length,color:"#5294E0"},
              {label:"Checked-In",count:bookings.filter(b=>b.bookingStatus==="Checked-In").length,color:"#52C07A"},
              {label:"Checked-Out",count:bookings.filter(b=>b.bookingStatus==="Checked-Out").length,color:"#6B6054"},
              {label:"Cancelled",count:bookings.filter(b=>b.bookingStatus==="Cancelled").length,color:"#E05252"},
            ].map(s=>(
              <div key={s.label} style={{padding:"6px 12px",borderRadius:8,background:`${s.color}08`,border:`1px solid ${s.color}18`}}>
                <span style={{fontSize:14,fontWeight:800,color:s.color}}>{s.count}</span>
                <span style={{fontSize:11,color:"#6B6054",marginLeft:6}}>{s.label}</span>
              </div>
            ))}
          </div>

          <Table columns={bookingCols} data={
            [...bookings]
              .sort((a,b)=>new Date(a.checkInDateTime)-new Date(b.checkInDateTime))
              .filter(b=>{
                const todayMidnight = getTodayMidnight()

                if (dayFilter === "checkin-today") {
                  // Show Booked guests whose check-in is today OR overdue
                  // but whose checkout hasn't passed yet (still actionable)
                  if (b.bookingStatus !== "Booked") return false
                  const ciDate = new Date(b.checkInDateTime); ciDate.setHours(0,0,0,0)
                  const coDate = new Date(b.checkOutDateTime); coDate.setHours(0,0,0,0)
                  if (ciDate > todayMidnight) return false   // future — not yet due
                  if (coDate <= todayMidnight) return false  // checkout passed — no point
                }

                if (dayFilter === "checkout-today") {
                  // Only show Checked-In guests whose checkout is today OR overdue (past)
                  if (b.bookingStatus !== "Checked-In") return false
                  const coDate = new Date(b.checkOutDateTime); coDate.setHours(0,0,0,0)
                  if (coDate > todayMidnight) return false
                }

                const ms = bFilter==="All" || b.bookingStatus===bFilter
                const ref=(b._id?.toString().slice(-8)||"").toUpperCase(), sq=search.toUpperCase()
                const hallDates=b.paymentDetails?.hallDates||[]
                const siblingRefMatch=b.paymentDetails?.isNonContiguous&&sq.length>=3&&bookings.some(s=>s.paymentDetails?.isNonContiguous&&s.customer?._id===b.customer?._id&&JSON.stringify([...(s.paymentDetails?.hallDates||[])].sort())===JSON.stringify([...hallDates].sort())&&s._id?.toString().slice(-8).toUpperCase().includes(sq))
                const mq=ref.includes(sq)||(b.customer?.name||"").toLowerCase().includes(search.toLowerCase())||(b.room?.room_number||"").includes(search)||siblingRefMatch
                return ms&&mq
              })
          } loading={false} emptyMsg="No bookings found"/>
        </div>
      )}

      {tab==="rooms"&&(
        <div className="anim-up d2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {rooms.map(room=>{
            const A={Available:"#52C07A",Booked:"#5294E0",Occupied:"#E05252",Cleaning:"#E0A852",Maintenance:"#9B7FE8"}
            const col=A[room.status]||"#C9A84C"
            return(
              <div key={room._id} className="stat-card">
                <div className="stat-bar" style={{background:col}}/>
                <div className="flex items-center justify-between mb-1 mt-1">
                  <span className="font-display text-lg font-bold text-gold">#{room.room_number}</span>
                  <Badge label={room.status} variant={room.status} size="sm"/>
                </div>
                <p className="text-resort-dim text-xs">{room.roomType?.type_name||"—"} · Fl.{room.floor}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* ══ NEW BOOKING MODAL ══ */}
      <Modal open={bookModal} onClose={()=>setBookModal(false)}
        title={<span style={{display:"flex",alignItems:"center",gap:8}}><BookingIcon size={18}/> New Booking</span>}
        subtitle="Admin walk-in booking"
        wide
        footer={
          <div style={{display:"flex",justifyContent:"space-between",width:"100%",alignItems:"center",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",gap:5}}>
              {(isHall?[1,2,4]:[1,2,3,4]).map((n)=>(
                <div key={n} style={{width:n===step?22:7,height:7,borderRadius:4,transition:"all .2s",background:n<step?"#52C07A":n===step?"#C9A84C":"rgba(255,255,255,.1)"}}/>
              ))}
            </div>
            <div style={{display:"flex",gap:8}}>
              {step>1?<Button variant="ghost" onClick={prevStep}>← Back</Button>:<Button variant="ghost" onClick={()=>setBookModal(false)}>Cancel</Button>}
              {step<4?<Button variant="gold" onClick={nextStep}>Continue →</Button>:<Button variant="gold" loading={saving} onClick={handleSave}>Confirm Booking</Button>}
            </div>
          </div>
        }
      >
        <StepBar step={step} isHall={isHall}/>
        <div style={{minHeight:360}}>

          {/* STEP 1 — Guest */}
          {step===1&&(
            <div className="space-y-5">
              <div>
                <SectionLabel text="Booking Type"/>
                <div className="rb-mode-row">
                  <ModeBtn active={form.bookingType==="room"} onClick={()=>set({bookingType:"room",hallDates:[],checkIn:todayISO(),checkOut:"",roomTypeId:""})}><IconBed size={20}/> Room Booking</ModeBtn>
                  <ModeBtn active={form.bookingType==="hall"} onClick={()=>set({bookingType:"hall",hallDates:[],checkIn:"",checkOut:"",roomTypeId:""})}><HallIcon size={20}/> Hall / Banquet</ModeBtn>
                </div>
              </div>
              {form.bookingType==="room"&&(
                <div>
                  <SectionLabel text="Booking Status"/>
                  <div className="rb-status-row">
                    {BOOKING_STATUSES.map(bs=>(
                      <button key={bs.value} type="button" onClick={()=>set({bookingStatus:bs.value})}
                        style={{flex:1,minWidth:130,padding:"10px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all .15s",
                          background:form.bookingStatus===bs.value?"rgba(201,168,76,.1)":"rgba(255,255,255,.02)",
                          border:`1.5px solid ${form.bookingStatus===bs.value?"rgba(201,168,76,.5)":"rgba(255,255,255,.08)"}`}}>
                        <p style={{fontSize:13,fontWeight:700,color:form.bookingStatus===bs.value?"#C9A84C":"#C8BAA0",marginBottom:2}}>{bs.label}</p>
                        <p style={{fontSize:11,color:"#6B6054"}}>{bs.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <SectionLabel text="Guest"/>
                <div className="rb-mode-row" style={{marginBottom:12}}>
                  <ModeBtn active={form.customerMode==="existing"} onClick={()=>set({customerMode:"existing",customerId:""})}><UserIcon size={14}/> Registered Guest</ModeBtn>
                  <ModeBtn active={form.customerMode==="walkin"} onClick={()=>set({customerMode:"walkin",customerId:""})}><WalkInIcon size={20}/> Walk-in / New Guest</ModeBtn>
                </div>
                {form.customerMode==="existing"&&(
                  customers.length===0
                    ?<div style={{padding:"10px 14px",borderRadius:8,background:"rgba(224,168,82,.08)",border:"1px solid rgba(224,168,82,.2)"}}>
                      <p style={{fontSize:12,color:"#E0A852",display:"flex",alignItems:"center",gap:5}}><IconWarning size={13} color="#E0A852"/> No registered guests found. Use Walk-in for new guests.</p>
                    </div>
                    :<div>
                      <select value={form.customerId} onChange={e=>set({customerId:e.target.value})}
                        style={{width:"100%",background:"rgba(20,18,14,1)",border:`1px solid ${errors.customerId?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:form.customerId?"#F5ECD7":"#6B6054",outline:"none"}}>
                        <option value="">— Choose a registered guest —</option>
                        {customers.map(c=><option key={c._id} value={c._id}>{c.name} — {c.phoneno||c.email||""}</option>)}
                      </select>
                      <FieldError msg={errors.customerId}/>
                    </div>
                )}
                {form.customerMode==="walkin"&&(
                  <div className="space-y-3">
                    <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(82,148,224,.08)",border:"1px solid rgba(82,148,224,.2)"}}>
                      <p style={{fontSize:12,color:"#5294E0"}}>A guest account will be created after email verification.</p>
                    </div>
                    <div>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Full Name *</label>
                      <input value={form.guestName} onChange={e=>{ set({guestName:e.target.value}); if(errors.guestName)setErrors(er=>({...er,guestName:""})) }} placeholder="Guest's full name"
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.guestName?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                      <FieldError msg={errors.guestName}/>
                    </div>
                    <div>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Mobile Number * (10 digits)</label>
                      <input value={form.guestPhone} onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,10); set({guestPhone:v}); if(errors.guestPhone)setErrors(er=>({...er,guestPhone:""})) }}
                        placeholder="9999999999" maxLength={10} inputMode="numeric"
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.guestPhone?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}>
                        <FieldError msg={errors.guestPhone}/>
                        <span style={{fontSize:10,color:form.guestPhone.length===10?"#52C07A":"#6B6054"}}>{form.guestPhone.length}/10</span>
                      </div>
                    </div>
                    <div>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Email Address *</label>
                      <div style={{display:"flex",gap:8,alignItems:"flex-start",flexWrap:"wrap"}}>
                        <div style={{flex:1,minWidth:160}}>
                          <input value={form.guestEmail} onChange={e=>{ set({guestEmail:e.target.value,emailOtpSent:false,emailVerified:false,emailOtpCode:"",existingCustomerId:""}); if(errors.guestEmail)setErrors(er=>({...er,guestEmail:""})) }}
                            placeholder="guest@email.com" type="email" disabled={form.emailVerified}
                            style={{width:"100%",background:form.emailVerified?"rgba(82,192,122,.06)":"rgba(255,255,255,.04)",border:`1px solid ${form.emailVerified?"rgba(82,192,122,.4)":errors.guestEmail?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                        </div>
                        {form.emailVerified
                          ?<div style={{padding:"8px 14px",borderRadius:8,background:"rgba(82,192,122,.1)",border:"1px solid rgba(82,192,122,.3)",color:"#52C07A",fontSize:12,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,display:"flex",alignItems:"center",gap:5}}><RightTickIcon size={13} color="#52C07A"/> Verified</div>
                          :<button type="button" disabled={otpSending||cooldown>0} onClick={handleSendOtp}
                              style={{padding:"9px 14px",borderRadius:8,fontSize:12,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,cursor:otpSending||cooldown>0?"not-allowed":"pointer",background:"rgba(201,168,76,.15)",border:"1px solid rgba(201,168,76,.4)",color:"#C9A84C",opacity:otpSending||cooldown>0?0.6:1}}>
                              {otpSending?"Sending…":cooldown>0?`Resend in ${cooldown}s`:form.emailOtpSent?"Resend OTP":"Send OTP"}
                            </button>
                        }
                      </div>
                      <FieldError msg={errors.guestEmail}/>
                    </div>
                    {form.emailOtpSent&&!form.emailVerified&&(
                      <div style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.08)"}}>
                        <p style={{fontSize:11,color:"#8A7E6A",marginBottom:8}}>Enter the 6-digit OTP sent to <strong style={{color:"#C9A84C"}}>{form.guestEmail}</strong></p>
                        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                          <input value={form.emailOtpCode} onChange={e=>{ const v=e.target.value.replace(/\D/g,"").slice(0,6); set({emailOtpCode:v}); if(errors.emailOtp)setErrors(er=>({...er,emailOtp:""})) }}
                            placeholder="6-digit OTP" maxLength={6} inputMode="numeric"
                            style={{flex:1,minWidth:120,background:"rgba(255,255,255,.04)",border:`1px solid ${errors.emailOtp?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:16,color:"#F5ECD7",outline:"none",letterSpacing:"0.25em",textAlign:"center"}}/>
                          <button type="button" disabled={otpVerify||form.emailOtpCode.length<4} onClick={handleVerifyOtp}
                            style={{padding:"9px 16px",borderRadius:8,fontSize:12,fontWeight:700,cursor:otpVerify?"not-allowed":"pointer",background:"rgba(82,192,122,.15)",border:"1px solid rgba(82,192,122,.4)",color:"#52C07A",opacity:otpVerify?0.6:1,whiteSpace:"nowrap"}}>
                            {otpVerify?"Verifying…":"Verify OTP"}
                          </button>
                        </div>
                        <FieldError msg={errors.emailOtp}/>
                      </div>
                    )}
                    {errors.emailVerify&&(
                      <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(224,82,82,.08)",border:"1px solid rgba(224,82,82,.3)"}}>
                        <p style={{fontSize:12,color:"#E05252",display:"flex",alignItems:"center",gap:5}}><IconWarning size={12} color="#E05252"/> {errors.emailVerify}</p>
                      </div>
                    )}
                    <div className="form-grid-2">
                      <div>
                        <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>City *</label>
                        <input value={form.guestCity} onChange={e=>{ set({guestCity:e.target.value}); if(errors.guestCity)setErrors(er=>({...er,guestCity:""})) }} placeholder="City"
                          style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.guestCity?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                        <FieldError msg={errors.guestCity}/>
                      </div>
                      <div>
                        <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Address *</label>
                        <input value={form.guestAddress} onChange={e=>{ set({guestAddress:e.target.value}); if(errors.guestAddress)setErrors(er=>({...er,guestAddress:""})) }} placeholder="Street / Area"
                          style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.guestAddress?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                        <FieldError msg={errors.guestAddress}/>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — Room/Hall & Dates */}
          {step===2&&(
            <div className="space-y-4">
              <SectionLabel text={form.bookingType==="room"?"Room & Dates":"Hall & Dates"}/>
              <div>
                <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>{form.bookingType==="room"?"Room Type *":"Hall Type *"}</label>
                <select value={form.roomTypeId} onChange={e=>set({roomTypeId:e.target.value,checkIn:form.bookingType==="room"?todayISO():"",checkOut:"",hallDates:[]})}
                  style={{width:"100%",background:"rgba(20,18,14,1)",border:`1px solid ${errors.roomTypeId?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:form.roomTypeId?"#F5ECD7":"#6B6054",outline:"none"}}>
                  <option value="">— Select {form.bookingType==="room"?"room":"hall"} type —</option>
                  {roomTypes.filter(t=>{ const n=t.type_name.toLowerCase(); const isHallType=n.includes("hall")||n.includes("banquet")||n.includes("conference")||n.includes("event")||n.includes("lawn")||n.includes("venue"); return form.bookingType==="hall"?isHallType:!isHallType })
                    .map(t=>(<option key={t._id} value={t._id}>{t.type_name} · ₹{t.price_per_night?.toLocaleString()}/night · Cap: {t.capacity}</option>))}
                </select>
                <FieldError msg={errors.roomTypeId}/>
              </div>
              {selectedType&&(
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",color:"#C9A84C",display:"inline-flex",alignItems:"center",gap:5}}>
                    <GuestIcon size={14}/> Capacity: {selectedType.capacity}
                  </span>
                  {availData?.totalRooms!=null&&(
                    <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"#8A7E6A",display:"inline-flex",alignItems:"center",gap:5}}>
                      <IconBed size={14} color="rgba(255,255,255,.34)"/> Total rooms: {availData.totalRooms}
                    </span>
                  )}
                  {roomsAvailableForDates!==null&&form.checkIn&&form.checkOut&&(
                    <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,display:"inline-flex",alignItems:"center",gap:5,
                      background:roomsAvailableForDates===0?"rgba(224,82,82,.08)":"rgba(82,192,122,.08)",
                      border:`1px solid ${roomsAvailableForDates===0?"rgba(224,82,82,.2)":"rgba(82,192,122,.2)"}`,
                      color:roomsAvailableForDates===0?"#E05252":"#52C07A"}}>
                      {roomsAvailableForDates===0
                        ?<><IconWarning size={12} color="#E05252"/> No rooms free for these dates</>
                        :<><RightTickIcon size={12} color="#52C07A"/> {roomsAvailableForDates} room{roomsAvailableForDates!==1?"s":""} available</>
                      }
                    </span>
                  )}
                  {availLoad&&<span style={{fontSize:11,color:"#6B6054"}}>⟳ Checking…</span>}
                </div>
              )}
              {form.bookingType==="room"&&(
                <div className="space-y-3">
                  <div className="rb-date-pair">
                    <div>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Check-in Date *</label>
                      <input type="date" value={form.checkIn} min={todayISO()} onChange={e=>{ set({checkIn:e.target.value,checkOut:""}); if(errors.checkIn)setErrors(er=>({...er,checkIn:""})) }}
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.checkIn?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                      <FieldError msg={errors.checkIn}/>
                    </div>
                    <div>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Check-out Date *</label>
                      <input type="date" value={form.checkOut} min={form.checkIn||todayISO()} onChange={e=>{ set({checkOut:e.target.value}); if(errors.checkOut)setErrors(er=>({...er,checkOut:""})) }}
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.checkOut?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                      <FieldError msg={errors.checkOut}/>
                    </div>
                  </div>
                  {nights>0&&!roomDateConflict&&(
                    <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)"}}>
                      <p style={{fontSize:13,color:"#C9A84C",fontWeight:700}}>{nights} night{nights!==1?"s":""} · {fmtINR(totalAmount)} total</p>
                    </div>
                  )}
                </div>
              )}
              {form.bookingType==="hall"&&form.roomTypeId&&(
                <div>
                  <p style={{fontSize:12,color:"#8A7E6A",marginBottom:8}}>Select one or more dates for the hall (red = already booked):</p>
                  <HallCalendar bookedDates={hallBookedDates} selected={form.hallDates} onChange={dates=>{ set({hallDates:dates}); if(errors.hallDates)setErrors(er=>({...er,hallDates:""})) }}/>
                  <FieldError msg={errors.hallDates}/>
                  {form.hallDates.length>0&&!errors.hallDates&&(
                    <div style={{marginTop:8,padding:"10px 14px",borderRadius:8,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.18)"}}>
                      <p style={{fontSize:13,color:"#C9A84C",fontWeight:700}}>{form.hallDates.length} day{form.hallDates.length!==1?"s":""} · {fmtINR(totalAmount)} total</p>
                    </div>
                  )}
                </div>
              )}
              {form.bookingType==="hall"&&!form.roomTypeId&&(
                <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)"}}>
                  <p style={{fontSize:12,color:"#6B6054"}}>← Select a hall type above to see the availability calendar</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Guest Details */}
          {step===3&&(
            <div className="space-y-4">
              <SectionLabel text="Guest Details"/>
              <div style={{padding:"10px 14px",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between",
                background:totalGuests>capacity?"rgba(224,82,82,.08)":"rgba(201,168,76,.06)",
                border:`1px solid ${totalGuests>capacity?"rgba(224,82,82,.3)":"rgba(201,168,76,.18)"}`}}>
                <span style={{fontSize:12,color:totalGuests>capacity?"#E05252":"#C9A84C",fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                  {totalGuests>capacity
                    ?<><IconWarning size={13} color="#E05252"/> Exceeds capacity (max {capacity})</>
                    :<><GuestIcon size={18}/> Room capacity: {capacity} guests max</>
                  }
                </span>
                <span style={{fontSize:12,fontWeight:700,color:totalGuests>capacity?"#E05252":"#52C07A"}}>{totalGuests}/{capacity}</span>
              </div>
              {errors._capacity&&<FieldError msg={errors._capacity}/>}
              <div className="rb-guest-count-grid">
                {[{label:"Adults (18+)",key:"adults",min:1},{label:"Children (1–17)",key:"children",min:0}].map(({label,key,min})=>(
                  <div key={key}>
                    <p style={{fontSize:11,color:"#8A7E6A",marginBottom:8,fontWeight:500}}>{label}</p>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button type="button" onClick={()=>{ const next=Math.max(min,form[key]-1); syncGuests(key==="adults"?next:form.adults,key==="children"?next:form.children) }}
                        style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.04)",color:"#C9A84C",fontSize:18,cursor:"pointer"}}>−</button>
                      <span style={{fontSize:18,fontWeight:700,color:"#F5ECD7",minWidth:20,textAlign:"center"}}>{form[key]}</span>
                      <button type="button" onClick={()=>{ if(totalGuests>=capacity){show(`Capacity is ${capacity} guests`,"error");return}; const next=form[key]+1; syncGuests(key==="adults"?next:form.adults,key==="children"?next:form.children) }}
                        style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.04)",color:"#C9A84C",fontSize:18,cursor:"pointer"}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
              {errors._guests&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(224,82,82,.08)",border:"1px solid rgba(224,82,82,.3)"}}><p style={{fontSize:12,color:"#E05252",display:"flex",alignItems:"center",gap:5}}><IconWarning size={12} color="#E05252"/> {errors._guests}</p></div>}
              <div>
                <p style={{fontSize:11,color:"#8A7E6A",marginBottom:10}}>Fill details for each guest:</p>
                {form.guests.map((g,i)=>(
                  <GuestDetailRow key={i} idx={i} guest={g} type={i<form.adults?"Adult":"Child"}
                    onChange={(idx,ng)=>{ const next=[...form.guests]; next[idx]=ng; set({guests:next}) }}
                    errors={guestErrs[i]}/>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Payment */}
          {step===4&&(
            <div className="space-y-4">
              <SectionLabel text="Payment"/>
              <div style={{padding:"14px 16px",borderRadius:10,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:12,color:"#8A7E6A"}}>
                    {form.bookingType==="room"?`${nights} night${nights!==1?"s":""} × ${fmtINR(selectedType?.price_per_night)}`:`${form.hallDates.length} day${form.hallDates.length!==1?"s":""} × ${fmtINR(selectedType?.price_per_night)}`}
                  </span>
                  <span style={{fontSize:20,fontWeight:800,color:"#C9A84C"}}>{fmtINR(totalAmount)}</span>
                </div>
                <p style={{fontSize:11,color:"#6B6054",marginTop:4}}>Full payment collected now (admin booking)</p>
              </div>
              <div>
                <p style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Payment Method *</p>
                <div className="rb-pm-grid">
                  {PAYMENT_METHODS.map(m=>{
                    const Icon=m.icon
                    return (
                      <button key={m.value} type="button" onClick={()=>{ set({paymentMethod:m.value}); if(errors.paymentMethod)setErrors(er=>({...er,paymentMethod:""})) }}
                        style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all .15s",display:"flex",alignItems:"center",gap:8,
                          background:form.paymentMethod===m.value?"rgba(201,168,76,.12)":"rgba(255,255,255,.02)",
                          border:`1.5px solid ${form.paymentMethod===m.value?"rgba(201,168,76,.5)":"rgba(255,255,255,.08)"}`}}>
                        <Icon size={22} color={form.paymentMethod===m.value?"#C9A84C":"#6B6054"}/>
                        <div style={{ minWidth:0 }}>
                          <p style={{fontSize:13,fontWeight:700,color:form.paymentMethod===m.value?"#C9A84C":"#C8BAA0",marginBottom:2}}>{m.label}</p>
                          <p style={{fontSize:11,color:"#6B6054",display:"none"}}>{m.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <FieldError msg={errors.paymentMethod}/>
              </div>
              {form.paymentMethod==="cash"&&(
                <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(82,192,122,.08)",border:"1px solid rgba(82,192,122,.2)"}}>
                  <p style={{fontSize:12,color:"#52C07A",display:"flex",alignItems:"center",gap:5}}><RightTickIcon size={13} color="#52C07A"/> Cash of {fmtINR(totalAmount)} received at front desk.</p>
                </div>
              )}
              {form.paymentMethod==="upi"&&(
                <div>
                  <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>UPI ID *</label>
                  <input value={form.upiId} onChange={e=>{ set({upiId:e.target.value}); if(errors.upiId)setErrors(er=>({...er,upiId:""})) }} placeholder="guest@upi"
                    style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.upiId?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                  <FieldError msg={errors.upiId}/>
                </div>
              )}
              {(form.paymentMethod==="credit_card"||form.paymentMethod==="debit_card")&&(
                <div className="space-y-3">
                  <div>
                    <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Card Number * (16 digits)</label>
                    <input value={form.cardNumber} onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,16); set({cardNumber:d.replace(/(.{4})/g,"$1 ").trim()}); if(errors.cardNumber)setErrors(er=>({...er,cardNumber:""})) }}
                      placeholder="XXXX XXXX XXXX XXXX" maxLength={19}
                      style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.cardNumber?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box",letterSpacing:"0.08em"}}/>
                    <FieldError msg={errors.cardNumber}/>
                  </div>
                  <div>
                    <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Cardholder Name *</label>
                    <input value={form.cardName} onChange={e=>{ set({cardName:e.target.value}); if(errors.cardName)setErrors(er=>({...er,cardName:""})) }} placeholder="Name as on card"
                      style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.cardName?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                    <FieldError msg={errors.cardName}/>
                  </div>
                  <div className="rb-card-expiry-row">
                    <div style={{flex:1}}>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>Expiry (MM/YY) *</label>
                      <input value={form.expiry} onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,4); set({expiry:d.length>2?d.slice(0,2)+"/"+d.slice(2):d}); if(errors.expiry)setErrors(er=>({...er,expiry:""})) }}
                        placeholder="MM/YY" maxLength={5}
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.expiry?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box"}}/>
                      <FieldError msg={errors.expiry}/>
                    </div>
                    <div style={{width:110,flexShrink:0}}>
                      <label style={{fontSize:10,color:"#6B6054",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:5}}>CVV *</label>
                      <input value={form.cvv} onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,4); set({cvv:d}); if(errors.cvv)setErrors(er=>({...er,cvv:""})) }}
                        placeholder="•••" maxLength={4} type="password" inputMode="numeric"
                        style={{width:"100%",background:"rgba(255,255,255,.04)",border:`1px solid ${errors.cvv?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:"#F5ECD7",outline:"none",boxSizing:"border-box",letterSpacing:"0.2em"}}/>
                      <FieldError msg={errors.cvv}/>
                    </div>
                  </div>
                </div>
              )}
              {/* Booking summary */}
              <div style={{padding:"14px 16px",borderRadius:10,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)"}}>
                <p style={{fontSize:11,fontWeight:700,color:"#C8BAA0",marginBottom:10}}>Booking Summary</p>
                {[
                  ["Guest",   form.customerMode==="existing"?customers.find(c=>c._id===form.customerId)?.name||"—":form.guestName||"Walk-in"],
                  ["Type",    `${selectedType?.type_name||"—"} (${form.bookingType})`],
                  ["Status",  form.bookingStatus],
                  ...(form.bookingType==="room"
                    ?[["Check-in",fmtDate(form.checkIn+"T00:00:00")],["Check-out",fmtDate(form.checkOut+"T00:00:00")],["Nights",`${nights}`]]
                    :[["Days",`${form.hallDates.length}`],["Dates",form.hallDates.map(d=>fmtDate(d+"T00:00:00")).join(", ")]]),
                  ["Guests",  `${form.adults} adult${form.adults!==1?"s":""}, ${form.children} child${form.children!==1?"ren":""}`],
                  ["Payment", PAYMENT_METHODS.find(m=>m.value===form.paymentMethod)?.label||"—"],
                  ["Total",   fmtINR(totalAmount)],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.04)",gap:8}}>
                    <span style={{fontSize:11,color:"#6B6054",flexShrink:0}}>{l}</span>
                    <span style={{fontSize:11,fontWeight:600,color:"#F5ECD7",maxWidth:"60%",textAlign:"right",wordBreak:"break-word"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ══ CHECK-IN / CHECK-OUT ACTION MODAL ══ */}
      <Modal open={!!actModal} onClose={()=>{ setActModal(null); setCoPayment({method:"cash",upiId:"",cardNumber:"",cardName:"",expiry:"",cvv:""}); setCoErrors({}); setCiPayChoice("checkout") }}
        title={
          actModal?.type==="checkin"
            ?<span style={{display:"flex",alignItems:"center",gap:7}}><RightTickIcon size={16} color="#52C07A"/> Confirm Check-In</span>
            :<span style={{display:"flex",alignItems:"center",gap:7}}><DoorIcon size={16} color="#C9A84C"/> Confirm Check-Out</span>
        }
        subtitle={`Ref #${actModal?.booking?._id?.toString().slice(-8).toUpperCase()||"—"} · Room ${actModal?.booking?.room?`#${actModal.booking.room.room_number}`:"—"}`}
        footer={
          <>
            <Button variant="ghost" onClick={()=>{ setActModal(null); setCoPayment({method:"cash",upiId:"",cardNumber:"",cardName:"",expiry:"",cvv:""}); setCoErrors({}); setCiPayChoice("checkout") }}>Back</Button>
            <Button variant="gold" loading={actLoad} onClick={handleAction}>
              {actModal?.type==="checkin"
                ?(actModal.booking.amountDue>0?(ciPayChoice==="now"?"Pay & Check In":"Check In (Pay Later)"):"Confirm Check-In")
                :(actModal?.booking?.amountDue>0?"Collect & Check Out":"Confirm Check-Out")}
            </Button>
          </>
        }
      >
        {actModal&&(()=>{
          const bk=actModal.booking, due=bk.amountDue||0, paid=bk.amountPaid||0, total=bk.totalAmount||0
          const isCheckout=actModal.type==="checkout"
          return (
            <div className="space-y-3">
              <div style={{padding:"14px 16px",borderRadius:10,background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)"}}>
                {[["Ref",`#${bk._id?.toString().slice(-8).toUpperCase()}`],["Guest",bk.customer?.name||"—"],["Room",bk.room?`#${bk.room.room_number}`:"—"],["Check-in",fmtDate(bk.checkInDateTime)],["Check-out",fmtDate(bk.checkOutDateTime)],["Total",fmtINR(total)],["Paid",fmtINR(paid)],...(due>0?[["Due",fmtINR(due)]]:[])]
                  .map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.04)",gap:8}}>
                      <span style={{fontSize:12,color:"#6B6054",flexShrink:0}}>{l}</span>
                      <span style={{fontSize:12,fontWeight:600,color:l==="Due"?"#E0A852":l==="Paid"?"#52C07A":"#F5ECD7",textAlign:"right"}}>{v}</span>
                    </div>
                  ))}
              </div>
              {actModal.type==="checkin"&&due===0&&(
                <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(82,192,122,.08)",border:"1px solid rgba(82,192,122,.2)"}}>
                  <p style={{fontSize:12,color:"#52C07A",display:"flex",alignItems:"center",gap:5}}><RightTickIcon size={13} color="#52C07A"/> Fully paid — ready to check in.</p>
                </div>
              )}
              {actModal.type==="checkin"&&due>0&&(
                <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(224,168,82,.3)"}}>
                  <div style={{padding:"10px 14px",background:"rgba(224,168,82,.08)"}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#E0A852",marginBottom:2,display:"flex",alignItems:"center",gap:5}}><IconWarning size={13} color="#E0A852"/> Partial payment — {fmtINR(due)} still due</p>
                    <p style={{fontSize:11,color:"#8A7E6A"}}>When would you like to collect the remaining amount?</p>
                  </div>
                  <div className="rb-ci-choice">
                    {[
                      {val:"now",     Icon:RupeeIcon, label:"Collect Now",          desc:"Collect at check-in"},
                      {val:"checkout",Icon:DoorIcon,  label:"Collect at Check-Out", desc:"Guest pays on departure"},
                    ].map((opt,i)=>(
                      <button key={opt.val} type="button" onClick={()=>{ setCiPayChoice(opt.val); setCoErrors({}) }}
                        style={{flex:1,padding:"12px 14px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"flex-start",gap:8,
                          borderRight:"none",
                          borderTop:"1px solid rgba(255,255,255,.06)",
                          background:ciPayChoice===opt.val?"rgba(201,168,76,.12)":"rgba(255,255,255,.02)",border:"none",
                          borderBottom: i===0 ? "1px solid rgba(255,255,255,.06)" : "none"}}>
                        <opt.Icon size={15} color={ciPayChoice===opt.val?"#C9A84C":"#6B6054"} style={{marginTop:2,flexShrink:0}}/>
                        <div>
                          <p style={{fontSize:13,fontWeight:700,color:ciPayChoice===opt.val?"#C9A84C":"#C8BAA0",marginBottom:2}}>{opt.label}</p>
                          <p style={{fontSize:11,color:"#6B6054"}}>{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {ciPayChoice==="now"&&(
                    <div style={{padding:14,borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(255,255,255,.01)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:"rgba(224,168,82,.12)",border:"1px solid rgba(224,168,82,.3)",marginBottom:12,gap:8}}>
                        <span style={{fontSize:11,color:"#8A7E6A"}}>Collecting now</span>
                        <span style={{fontSize:18,fontWeight:800,color:"#E0A852"}}>{fmtINR(due)}</span>
                      </div>
                      <CoPaymentFields/>
                    </div>
                  )}
                  {ciPayChoice==="checkout"&&(
                    <div style={{padding:"10px 14px",borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(255,255,255,.01)"}}>
                      <p style={{fontSize:11,color:"#8A7E6A"}}>{fmtINR(due)} will be collected at checkout time.</p>
                    </div>
                  )}
                </div>
              )}
              {isCheckout&&due===0&&(
                <div style={{padding:"10px 14px",borderRadius:8,background:"rgba(82,192,122,.08)",border:"1px solid rgba(82,192,122,.2)"}}>
                  <p style={{fontSize:12,color:"#52C07A",display:"flex",alignItems:"center",gap:5}}><RightTickIcon size={13} color="#52C07A"/> Payment fully settled — ready to check out.</p>
                </div>
              )}
              {isCheckout&&due>0&&(
                <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(224,168,82,.3)"}}>
                  <div style={{padding:"10px 14px",background:"rgba(224,168,82,.08)"}}>
                    <p style={{fontSize:12,fontWeight:700,color:"#E0A852",marginBottom:2,display:"flex",alignItems:"center",gap:5}}><IconWarning size={13} color="#E0A852"/> Collect due amount before checkout</p>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6,gap:8}}>
                      <span style={{fontSize:11,color:"#8A7E6A"}}>Amount due</span>
                      <span style={{fontSize:20,fontWeight:800,color:"#E0A852"}}>{fmtINR(due)}</span>
                    </div>
                  </div>
                  <div style={{padding:14,background:"rgba(255,255,255,.01)"}}>
                    <CoPaymentFields/>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}