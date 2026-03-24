// src/pages/admin/pages/BookingActionDetail.jsx
import React, { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getAllBookings, checkIn, checkOut } from "../../../services/bookingService"
import api from "../../../services/axiosInstance"
import Button from "../../../components/ui/Button"
import Badge  from "../../../components/ui/Badge"
import Loader from "../../../components/ui/Loader"
import { Toast, useToast } from "../../../components/ui/Loader"
import { useAuth } from "../../../context/AuthContext"
import {
  BookingIcon, RupeeIcon, UserIcon, GuestIcon,
  RightTickIcon, DoorIcon, BellIcon, IconWarning,
  CreditCardIcon, DebitCardIcon, CashIcon, UpiIcon,
  CollectIcon, SwitchIcon,
} from "../../../components/ui/Icons"

const RESP = `
  /* Main 2-col grid */
  .bad-main-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  @media (min-width: 768px) {
    .bad-main-grid { grid-template-columns: 1fr 1fr; }
  }

  /* Payment method grid */
  .bad-pm-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  @media (max-width: 400px) { .bad-pm-grid { grid-template-columns: 1fr; } }

  /* Extended/early checkout stat grids */
  .bad-stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    margin-bottom: 10px;
  }
  @media (min-width: 480px) { .bad-stat-grid { grid-template-columns: repeat(3, 1fr); } }

  /* Room switch grid */
  .bad-switch-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    max-height: 220px;
    overflow-y: auto;
  }
  @media (max-width: 360px) { .bad-switch-grid { grid-template-columns: 1fr; } }

  /* Check-in choice buttons: side-by-side on sm+, stacked on tiny */
  .bad-ci-choice {
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,.08);
  }
  @media (min-width: 420px) {
    .bad-ci-choice { flex-direction: row; }
    .bad-ci-choice > button:first-child {
      border-right: 1px solid rgba(255,255,255,.08);
      border-bottom: none !important;
    }
  }
  .bad-ci-choice > button:first-child {
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  /* Card expiry row */
  .bad-expiry-row {
    display: flex;
    gap: 12px;
  }
  @media (max-width: 360px) { .bad-expiry-row { flex-direction: column; } }
`

const getAvailableRoomsForSwitch = id => api.get(`/bookings/${id}/available-rooms-for-switch`)
const switchRoom = (id, payload)  => api.put(`/bookings/${id}/switch-room`, payload)

const IST     = { timeZone:"Asia/Kolkata" }
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",  { ...IST, day:"2-digit", month:"long", year:"numeric" }) : "—"
const fmtDT   = d => d ? new Date(d).toLocaleString("en-IN",      { ...IST, day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }) : "—"
const fmtINR  = n => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"
const todayMid = () => { const d=new Date(); d.setHours(0,0,0,0); return d }
const midDay   = d  => { const x=new Date(d); x.setHours(0,0,0,0); return x }

const PAYMENT_METHODS = [
  { value:"cash",        label:"Cash",        Icon:CashIcon,       desc:"Collected at front desk" },
  { value:"upi",         label:"UPI",         Icon:UpiIcon,        desc:"GPay, PhonePe, Paytm…"  },
  { value:"credit_card", label:"Credit Card", Icon:CreditCardIcon, desc:"Visa, Mastercard, Amex"  },
  { value:"debit_card",  label:"Debit Card",  Icon:DebitCardIcon,  desc:"All major bank cards"    },
]
const METHOD_LABEL = { cash:"Cash", upi:"UPI", credit_card:"Credit Card", debit_card:"Debit Card" }
const PSTATUS_CLR  = { "Paid":"#52C07A","Partially Paid":"#E0A852","Pending":"#E05252" }
const STATUS_CLR   = {
  "Booked":"#5294E0","Checked-In":"#52C07A","Checked-Out":"#6B6054",
  "Cancelled":"#E05252","No-Show":"#E0A852",
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p style={{ fontSize:11, color:"#E05252", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
      <IconWarning size={11} color="#E05252"/> {msg}
    </p>
  )
}

function SectionTitle({ icon, text }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <span style={{ display:"flex", alignItems:"center", flexShrink:0 }}>{icon}</span>
      <p style={{ fontSize:10, fontWeight:800, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.12em", margin:0 }}>{text}</p>
      <div style={{ flex:1, height:1, background:"rgba(255,255,255,.06)" }}/>
    </div>
  )
}

function InfoRow({ label, value, valueColor, mono }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,.04)", gap:8 }}>
      <span style={{ fontSize:12, color:"#6B6054", flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, fontWeight:600, color:valueColor||"#F5ECD7", fontFamily:mono?"monospace":"inherit", textAlign:"right", wordBreak:"break-word" }}>{value}</span>
    </div>
  )
}

function Card({ children, style={} }) {
  return <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, padding:"20px 22px", ...style }}>{children}</div>
}

function PaymentForm({ payment, setPayment, errors, setErrors, amountDue }) {
  return (
    <div>
      {/* RESPONSIVE: bad-pm-grid */}
      <div className="bad-pm-grid">
        {PAYMENT_METHODS.map(m => {
          const Icon = m.Icon
          return (
            <button key={m.value} type="button"
              onClick={() => { setPayment(p=>({...p,method:m.value})); setErrors(e=>({...e,method:""})) }}
              style={{
                padding:"10px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", transition:"all .15s",
                display:"flex", alignItems:"center", gap:8,
                background:payment.method===m.value?"rgba(201,168,76,.12)":"rgba(255,255,255,.02)",
                border:`1.5px solid ${payment.method===m.value?"rgba(201,168,76,.5)":"rgba(255,255,255,.08)"}`
              }}>
              <Icon size={20} color={payment.method===m.value?"#C9A84C":"#8A7E6A"}/>
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:payment.method===m.value?"#C9A84C":"#C8BAA0", margin:"0 0 2px" }}>{m.label}</p>
                <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>{m.desc}</p>
              </div>
            </button>
          )
        })}
      </div>
      {errors.method && <p style={{ fontSize:11, color:"#E05252", marginBottom:10, display:"flex", alignItems:"center", gap:4 }}><IconWarning size={11} color="#E05252"/> {errors.method}</p>}

      {payment.method==="cash" && (
        <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)" }}>
          <p style={{ fontSize:13, color:"#52C07A", margin:0, display:"flex", alignItems:"center", gap:6 }}>
            <RightTickIcon size={14} color="#52C07A"/>
            Collect <strong style={{ marginLeft:4 }}>{fmtINR(amountDue)}</strong>&nbsp;cash at front desk.
          </p>
        </div>
      )}

      {payment.method==="upi" && (
        <div>
          <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>UPI ID *</label>
          <input value={payment.upiId}
            onChange={e=>{ setPayment(p=>({...p,upiId:e.target.value})); setErrors(er=>({...er,upiId:""})) }}
            placeholder="guest@upi"
            style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors.upiId?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
          <FieldError msg={errors.upiId}/>
        </div>
      )}

      {(payment.method==="credit_card"||payment.method==="debit_card") && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Card Number *</label>
            <input value={payment.cardNumber}
              onChange={e=>{ const raw=e.target.value.replace(/\D/g,"").slice(0,16); const fmt=raw.replace(/(.{4})/g,"$1 ").trim(); setPayment(p=>({...p,cardNumber:fmt})); setErrors(er=>({...er,cardNumber:""})) }}
              placeholder="XXXX XXXX XXXX XXXX" maxLength={19}
              style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors.cardNumber?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box", letterSpacing:"0.08em" }}/>
            <FieldError msg={errors.cardNumber}/>
          </div>
          <div>
            <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Cardholder Name *</label>
            <input value={payment.cardName}
              onChange={e=>{ setPayment(p=>({...p,cardName:e.target.value})); setErrors(er=>({...er,cardName:""})) }}
              placeholder="Name as on card"
              style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors.cardName?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
            <FieldError msg={errors.cardName}/>
          </div>
          {/* RESPONSIVE: bad-expiry-row */}
          <div className="bad-expiry-row">
            <div style={{ flex:1 }}>
              <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Expiry (MM/YY) *</label>
              <input value={payment.expiry}
                onChange={e=>{ const raw=e.target.value.replace(/\D/g,"").slice(0,4); const fmt=raw.length>2?raw.slice(0,2)+"/"+raw.slice(2):raw; setPayment(p=>({...p,expiry:fmt})); setErrors(er=>({...er,expiry:""})) }}
                placeholder="MM/YY" maxLength={5}
                style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors.expiry?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
              <FieldError msg={errors.expiry}/>
            </div>
            <div style={{ width:110, flexShrink:0 }}>
              <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>CVV *</label>
              <input value={payment.cvv}
                onChange={e=>{ const d=e.target.value.replace(/\D/g,"").slice(0,4); setPayment(p=>({...p,cvv:d})); setErrors(er=>({...er,cvv:""})) }}
                placeholder="•••" maxLength={4} type="password" inputMode="numeric"
                style={{ width:"100%", background:"rgba(255,255,255,.04)", border:`1px solid ${errors.cvv?"rgba(224,82,82,.5)":"rgba(255,255,255,.1)"}`, borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box", letterSpacing:"0.2em" }}/>
              <FieldError msg={errors.cvv}/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function validatePayment(payment, setErrors) {
  const errs = {}
  const m = payment.method
  if (!m) { errs.method = "Select a payment method" }
  if (m==="upi" && !payment.upiId.includes("@")) errs.upiId = "Enter valid UPI ID (e.g. name@upi)"
  if (m==="credit_card"||m==="debit_card") {
    if (payment.cardNumber.replace(/\s/g,"").length<16) errs.cardNumber = "Enter 16-digit card number"
    if (!payment.cardName.trim())                       errs.cardName   = "Enter cardholder name"
    if (!payment.cvv||payment.cvv.length<3)             errs.cvv        = "Enter 3 or 4 digit CVV"
    if (payment.expiry.length<5)                        errs.expiry     = "Enter expiry (MM/YY)"
    else {
      const [mm,yy]=payment.expiry.split("/")
      const expMM=parseInt(mm), expYY=2000+parseInt(yy)
      if (expMM<1||expMM>12) errs.expiry = "Enter valid month (01–12)"
      else {
        const now=new Date()
        if (expYY<now.getFullYear()||(expYY===now.getFullYear()&&expMM<now.getMonth()+1))
          errs.expiry = "Card has expired"
      }
    }
  }
  setErrors(errs)
  return Object.keys(errs).length===0
}

const EMPTY_PAY = { method:"cash", upiId:"", cardNumber:"", cardName:"", expiry:"", cvv:"" }

function RoomSwitchModal({ bookingId, currentRoom, roomType, onClose, onSuccess }) {
  const [loading,        setLoading]        = useState(true)
  const [availableRooms, setAvailableRooms] = useState([])
  const [selectedRoom,   setSelectedRoom]   = useState(null)
  const [reason,         setReason]         = useState("")
  const [switching,      setSwitching]      = useState(false)
  const [error,          setError]          = useState("")

  useEffect(() => {
    getAvailableRoomsForSwitch(bookingId)
      .then(r => setAvailableRooms(r.data.availableRooms || []))
      .catch(e => setError(e.response?.data?.message || "Failed to load rooms"))
      .finally(() => setLoading(false))
  }, [bookingId])

  const handleSwitch = async () => {
    if (!selectedRoom) return setError("Select a room to switch to")
    setSwitching(true); setError("")
    try {
      await switchRoom(bookingId, { newRoomId: selectedRoom._id, reason })
      onSuccess(`Room switched to #${selectedRoom.room_number}!`)
    } catch (e) {
      setError(e.response?.data?.message || "Switch failed")
    }
    setSwitching(false)
  }

  const ROOM_STATUS_COLOR = {
    Available:"#52C07A", Booked:"#5294E0", Occupied:"#E05252",
    Cleaning:"#E0A852", Maintenance:"#9B7FE8",
  }

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#161410", border:"1px solid rgba(201,168,76,.25)", borderRadius:20,
        padding:"24px 22px", maxWidth:460, width:"100%",
        boxShadow:"0 40px 100px rgba(0,0,0,.8)", maxHeight:"90vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:8 }}>
          <div>
            <h3 style={{ color:"#F5ECD7", fontSize:17, fontWeight:700, margin:"0 0 3px", fontFamily:"Georgia,serif" }}>Switch Room</h3>
            <p style={{ color:"#6B6054", fontSize:12, margin:0 }}>
              Current: Room #{currentRoom?.room_number||"—"} · {roomType?.type_name}
            </p>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, color:"#6B6054", width:32, height:32, cursor:"pointer", fontSize:16 }}>✕</button>
        </div>

        {loading && <p style={{ color:"#6B6054", textAlign:"center", padding:24 }}>Loading available rooms…</p>}

        {!loading && availableRooms.length===0 && (
          <div style={{ padding:"16px", borderRadius:10, background:"rgba(224,82,82,.08)", border:"1px solid rgba(224,82,82,.2)", textAlign:"center", marginBottom:16 }}>
            <p style={{ color:"#E05252", fontSize:13, margin:0 }}>No other rooms available for these dates.</p>
          </div>
        )}

        {!loading && availableRooms.length>0 && (
          <div style={{ marginBottom:16 }}>
            <p style={{ fontSize:10, color:"#6B6054", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
              {availableRooms.length} Room{availableRooms.length!==1?"s":""} Available
            </p>
            {/* RESPONSIVE: bad-switch-grid */}
            <div className="bad-switch-grid">
              {availableRooms.map(room => {
                const isSel = selectedRoom?._id === room._id
                const sc = ROOM_STATUS_COLOR[room.status] || "#6B6054"
                return (
                  <button key={room._id} type="button" onClick={() => setSelectedRoom(room)} style={{
                    padding:"12px 14px", borderRadius:10, cursor:"pointer", textAlign:"left",
                    background:isSel?"rgba(82,192,122,.1)":"rgba(255,255,255,.02)",
                    border:`1.5px solid ${isSel?"rgba(82,192,122,.5)":"rgba(255,255,255,.07)"}`,
                    transition:"all .15s",
                  }}>
                    <p style={{ fontSize:15, fontWeight:700, color:isSel?"#52C07A":"#C9A84C", margin:"0 0 3px", fontFamily:"monospace" }}>#{room.room_number}</p>
                    <p style={{ fontSize:11, color:"#8A7E6A", margin:"0 0 5px" }}>Floor {room.floor||"—"}</p>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, fontWeight:700, background:`${sc}15`, color:sc, border:`1px solid ${sc}25` }}>{room.status}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:10, color:"#6B6054", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>Reason (optional)</label>
          <input value={reason} onChange={e=>setReason(e.target.value)} placeholder="e.g. Maintenance, guest preference…"
            style={{ width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#F5ECD7", outline:"none", boxSizing:"border-box" }}/>
        </div>

        {error && <p style={{ fontSize:12, color:"#E05252", marginBottom:12, display:"flex", alignItems:"center", gap:5 }}><IconWarning size={12} color="#E05252"/> {error}</p>}

        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Button variant="ghost" onClick={onClose} style={{ flex:1 }}>Cancel</Button>
          <Button variant="gold" loading={switching} onClick={handleSwitch}
            disabled={!selectedRoom||availableRooms.length===0} style={{ flex:2 }}>
            Switch to Room #{selectedRoom?.room_number||"—"} →
          </Button>
        </div>
        <p style={{ fontSize:11, color:"#6B6054", marginTop:12, textAlign:"center", lineHeight:1.6 }}>
          An email notification will be sent to the guest automatically.
        </p>
      </div>
    </div>
  )
}

export default function BookingActionDetail() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const location        = useLocation()
  const { toast, show } = useToast()
  const { user }        = useAuth()
  const isAdmin         = user?.role==="admin" || user?.role==="staff"

  const [booking,   setBooking]   = useState(location.state?.booking||null)
  const [loading,   setLoading]   = useState(!location.state?.booking)
  const [acting,    setActing]    = useState(false)
  const [ciChoice,  setCiChoice]  = useState("checkout")
  const [ciPayment, setCiPayment] = useState({...EMPTY_PAY})
  const [ciErrors,  setCiErrors]  = useState({})
  const [coPayment, setCoPayment] = useState({...EMPTY_PAY})
  const [coErrors,  setCoErrors]  = useState({})
  const [panel,     setPanel]     = useState(null)
  const [showSwitch,setShowSwitch]= useState(false)

  const load = async () => {
    try {
      const res = await getAllBookings()
      const bk  = (res.data||[]).find(b=>b._id===id)
      if (bk) setBooking(bk)
    } catch { show("Failed to refresh","error") }
  }
  useEffect(() => { if (!booking) { setLoading(true); load().finally(()=>setLoading(false)) } }, [])

  if (loading) return <Loader text="Loading booking…"/>
  if (!booking) return (
    <div style={{ padding:40, textAlign:"center" }}>
      <p style={{ color:"#6B6054", fontSize:14 }}>Booking not found.</p>
      <Button variant="gold" onClick={()=>navigate(-1)} style={{ marginTop:16 }}>← Back</Button>
    </div>
  )

  const bk       = booking
  const isHallBk = !!bk.paymentDetails?.isNonContiguous
  const due      = bk.amountDue  || 0
  const paid     = bk.amountPaid || 0
  const total    = bk.totalAmount || 0

  const today          = todayMid()
  const ciDate         = midDay(bk.checkInDateTime)
  const coDate         = midDay(bk.checkOutDateTime)
  const originalNights = isHallBk ? 1 : Math.max(0, Math.round((coDate-ciDate)/86400000))
  const stayedNights   = isHallBk ? 1 : Math.max(1, Math.round((today-ciDate)/86400000))
  const unusedNights   = isHallBk ? 0 : Math.max(0, originalNights-stayedNights)
  const extraNights    = isHallBk ? 0 : Math.max(0, stayedNights-originalNights)

  const isEarly    = !isHallBk && unusedNights>0 && bk.bookingStatus==="Checked-In"
  const isExtended = !isHallBk && extraNights>0  && bk.bookingStatus==="Checked-In"

  const pricePerNight  = bk.roomType?.price_per_night || (originalNights>0 ? Math.round(total/originalNights) : 0)
  const deductPerNight = Math.round(pricePerNight*0.10)
  const totalDeduction = deductPerNight*unusedNights
  const newTotalEarly  = stayedNights*pricePerNight + totalDeduction
  const earlyDue       = isEarly ? Math.max(0, newTotalEarly-paid) : due

  const extraCharge  = extraNights*pricePerNight
  const extendedDue  = isExtended ? (due+extraCharge) : due
  const checkoutDue  = isEarly ? earlyDue : isExtended ? extendedDue : due

  const canCheckIn = isHallBk
    ? today.getTime()===ciDate.getTime()
    : today>=ciDate && today<coDate
  const ciBlockMsg = isHallBk
    ? today<ciDate ? `Hall check-in only allowed on the event day: ${fmtDate(bk.checkInDateTime)}` : "Today is not the event date — check-in window has passed."
    : today<ciDate ? `Check-in not allowed yet — earliest: ${fmtDate(bk.checkInDateTime)}` : "Check-in window has passed."

  const isBooked    = bk.bookingStatus==="Booked"
  const isCheckedIn = bk.bookingStatus==="Checked-In"
  const isDone      = bk.bookingStatus==="Checked-Out"||bk.bookingStatus==="Cancelled"||bk.bookingStatus==="No-Show"

  const handleCheckIn = async () => {
    if (!canCheckIn) { show(ciBlockMsg,"error"); return }
    if (due>0&&ciChoice==="now") { if (!validatePayment(ciPayment,setCiErrors)) return }
    setActing(true)
    try {
      const body = (due>0&&ciChoice==="now")
        ? {collectNow:true,paymentMethod:ciPayment.method,upiId:ciPayment.upiId,cardNumber:ciPayment.cardNumber,cardName:ciPayment.cardName,expiry:ciPayment.expiry}
        : {}
      await checkIn(bk._id, body)
      show(due>0&&ciChoice==="now"?"Checked in & payment collected!":"Checked in!")
      setPanel(null); setCiPayment({...EMPTY_PAY}); setCiErrors({}); setCiChoice("checkout"); await load()
    } catch(e){ show(e.response?.data?.message||"Check-in failed","error") }
    setActing(false)
  }

  const handleCheckOut = async () => {
    if (checkoutDue>0) { if (!validatePayment(coPayment,setCoErrors)) return }
    setActing(true)
    try {
      const body = {
        isEarlyCheckout: isEarly,
        ...(checkoutDue>0 ? {paymentMethod:coPayment.method,upiId:coPayment.upiId,cardNumber:coPayment.cardNumber,cardName:coPayment.cardName,expiry:coPayment.expiry} : {}),
      }
      await checkOut(bk._id, body)
      show(checkoutDue>0?"Payment collected & checked out!":"Checked out!")
      setPanel(null); setCoPayment({...EMPTY_PAY}); setCoErrors({}); await load()
    } catch(e){ show(e.response?.data?.message||"Check-out failed","error") }
    setActing(false)
  }

  const PayRec = ({record, label}) => {
    if (!record) return null
    return (
      <div style={{ marginTop:8, padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5, gap:8 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</span>
          <span style={{ fontSize:14, fontWeight:700, color:"#52C07A" }}>{fmtINR(record.amount)}</span>
        </div>
        <p style={{ fontSize:12, color:"#C8BAA0", margin:0 }}>{METHOD_LABEL[record.method]||record.method}
          {record.upiId&&<span style={{ color:"#8A7E6A" }}> · {record.upiId}</span>}
          {record.cardNumber&&<span style={{ color:"#8A7E6A" }}> · **** {record.cardNumber}</span>}
          {record.collectedAt&&<span style={{ color:"#6B6054" }}> · {fmtDT(record.collectedAt)}</span>}
        </p>
      </div>
    )
  }

  const CheckoutScenarioBadge = () => {
    if (isExtended) return (
      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:"#E0A852", flexShrink:0 }}/>
        <span style={{ color:"#E0A852", fontSize:12 }}>
          <strong>Extended stay</strong> — {extraNights} extra night{extraNights>1?"s":""} · {fmtINR(extraCharge)} additional charge.
        </span>
      </div>
    )
    if (isEarly) return (
      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:"#E0A852", flexShrink:0 }}/>
        <span style={{ color:"#E0A852", fontSize:12 }}>
          <strong>Early checkout</strong> — {unusedNights} unused night{unusedNights>1?"s":""}. 10% fee applies.
        </span>
      </div>
    )
    if (due>0) return (
      <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
        <IconWarning size={12} color="#E0A852"/>
        <span style={{ color:"#E0A852", fontSize:12 }}><strong>{fmtINR(due)} due</strong> — collect on checkout.</span>
      </div>
    )
    return (
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <RightTickIcon size={12} color="#52C07A"/>
        <span style={{ color:"#52C07A", fontSize:12 }}>Fully paid. Ready to check out.</span>
      </div>
    )
  }

  return (
    <div style={{ maxWidth:960, margin:"0 auto", padding:"0 0 80px" }}>
      <style>{RESP}</style>
      <Toast {...(toast||{})}/>

      {showSwitch && (
        <RoomSwitchModal
          bookingId={bk._id}
          currentRoom={bk.room}
          roomType={bk.roomType}
          onClose={() => setShowSwitch(false)}
          onSuccess={msg => { show(msg); setShowSwitch(false); load() }}
        />
      )}

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        <button onClick={()=>navigate(-1)}
          style={{ width:38, height:38, borderRadius:10, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)",
            color:"#C9A84C", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          ←
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#F5ECD7", margin:0 }}>Booking Detail</h1>
          <p style={{ fontSize:12, color:"#6B6054", margin:"3px 0 0", fontFamily:"monospace", letterSpacing:"0.08em" }}>
            Ref&nbsp;#<span style={{ color:"#C9A84C" }}>{bk._id?.toString().slice(-8).toUpperCase()}</span>
          </p>
        </div>
        <Badge label={bk.bookingStatus} variant={bk.bookingStatus} size="md"/>
      </div>

      {/* RESPONSIVE: bad-main-grid — stacks on mobile, 2-col on md+ */}
      <div className="bad-main-grid">

        {/* LEFT */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <Card>
            <SectionTitle icon={<BookingIcon size={15}/>} text="Booking Info"/>
            <InfoRow label="Booking Ref"   value={`#${bk._id?.toString().slice(-8).toUpperCase()}`} valueColor="#C9A84C" mono/>
            <InfoRow label="Room"          value={bk.room?`#${bk.room.room_number}${bk.room.floor?` · Floor ${bk.room.floor}`:""}`:"-"}/>
            <InfoRow label="Room Type"     value={bk.roomType?.type_name||"—"}/>
            {isHallBk ? (
              <InfoRow label="Event Date"  value={fmtDate(bk.checkInDateTime)} valueColor="#C9A84C"/>
            ) : (
              <>
                <InfoRow label="Check-In Date"  value={fmtDate(bk.checkInDateTime)}/>
                <InfoRow label="Check-Out Date" value={fmtDate(bk.checkOutDateTime)}/>
              </>
            )}
            <InfoRow label="Duration" value={isHallBk?"1 day":`${originalNights} night${originalNights!==1?"s":""}`}/>
            <InfoRow label={isHallBk?"Price / Day":"Price / Night"} value={fmtINR(bk.roomType?.price_per_night)} valueColor="#C9A84C"/>
            <InfoRow label="Status" value={bk.bookingStatus} valueColor={STATUS_CLR[bk.bookingStatus]||"#6B6054"}/>
            {bk.actualCheckInTime  && <InfoRow label="✓ Checked-In At"  value={fmtDT(bk.actualCheckInTime)}  valueColor="#52C07A"/>}
            {bk.actualCheckOutDate && <InfoRow label="✓ Checked-Out At" value={fmtDT(bk.actualCheckOutDate)} valueColor="#52C07A"/>}
            {bk.noShowMarkedAt     && <InfoRow label="⚠ No-Show At"    value={fmtDT(bk.noShowMarkedAt)}     valueColor="#E0A852"/>}
            {bk.roomSwitch?.switchedAt && (
              <div style={{ marginTop:8, padding:"10px 12px", borderRadius:8, background:"rgba(147,112,219,.08)", border:"1px solid rgba(147,112,219,.2)" }}>
                <p style={{ fontSize:10, fontWeight:700, color:"#9B7FE8", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>Room Switched</p>
                <p style={{ fontSize:12, color:"#C8BAA0", margin:0 }}>
                  #{bk.roomSwitch.fromRoom?.room_number||"?"} → #{bk.roomSwitch.toRoom?.room_number||"?"}&nbsp;
                  <span style={{ color:"#6B6054" }}>· {fmtDT(bk.roomSwitch.switchedAt)}</span>
                </p>
                {bk.roomSwitch.reason && <p style={{ fontSize:11, color:"#6B6054", margin:"3px 0 0" }}>Reason: {bk.roomSwitch.reason}</p>}
                {bk.roomSwitch.emailSent && <p style={{ fontSize:11, color:"#52C07A", margin:"3px 0 0" }}>✓ Guest notified via email</p>}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle icon={<RupeeIcon size={15} color="#C9A84C"/>} text="Payment Info"/>
            <InfoRow label="Total Billed"  value={fmtINR(total)} valueColor="#52C07A"/>
            <InfoRow label="Amount Paid"   value={fmtINR(paid)}/>
            {due>0&&<InfoRow label="Amount Due" value={fmtINR(due)} valueColor="#E0A852"/>}
            <InfoRow label="Payment Split" value={bk.paymentSplit==="half"?"50% Upfront":"Full Payment"}/>
            <InfoRow label="Payment Status" value={bk.paymentStatus||"—"} valueColor={PSTATUS_CLR[bk.paymentStatus]||"#6B6054"}/>
            {bk.paymentDetails?.method && (
              <div style={{ marginTop:14 }}>
                <p style={{ fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>At Booking</p>
                <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4, gap:8 }}>
                    <span style={{ fontSize:12, color:"#C8BAA0" }}>{METHOD_LABEL[bk.paymentDetails.method]||bk.paymentDetails.method}</span>
                    <span style={{ fontSize:14, fontWeight:700, color:"#52C07A" }}>{fmtINR(paid-(bk.checkInPayment?.amount||0)-(bk.checkOutPayment?.amount||0))}</span>
                  </div>
                  {bk.paymentDetails.upiId&&<p style={{ fontSize:11, color:"#8A7E6A", margin:0 }}>UPI: {bk.paymentDetails.upiId}</p>}
                  {bk.paymentDetails.cardNumber&&<p style={{ fontSize:11, color:"#8A7E6A", margin:0 }}>Card: **** {bk.paymentDetails.cardNumber}</p>}
                </div>
              </div>
            )}
            {bk.checkInPayment  && <div style={{ marginTop:12 }}><p style={{ fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>At Check-In</p><PayRec record={bk.checkInPayment}  label="Check-In Payment"/></div>}
            {bk.checkOutPayment && <div style={{ marginTop:12 }}><p style={{ fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>At Check-Out</p><PayRec record={bk.checkOutPayment} label="Check-Out Payment"/></div>}
            {bk.extendedStay?.isExtended && (
              <div style={{ marginTop:14, padding:"10px 14px", borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px solid rgba(224,168,82,.2)" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#E0A852", marginBottom:6, display:"flex", alignItems:"center", gap:5 }}><IconWarning size={12} color="#E0A852"/> Extended Stay Charges</p>
                <InfoRow label="Original nights"     value={bk.extendedStay.originalNights}/>
                <InfoRow label="Total nights stayed" value={bk.extendedStay.totalNights}/>
                <InfoRow label="Extra nights"        value={bk.extendedStay.extraNights}/>
                <InfoRow label="Extra charge"        value={fmtINR(bk.extendedStay.extraCharge)} valueColor="#E0A852"/>
              </div>
            )}
            {bk.earlyCheckout?.isEarly && (
              <div style={{ marginTop:14, padding:"10px 14px", borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px solid rgba(224,168,82,.2)" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#E0A852", marginBottom:6, display:"flex", alignItems:"center", gap:5 }}><IconWarning size={12} color="#E0A852"/> Early Checkout Summary</p>
                <InfoRow label="Stayed nights"     value={bk.earlyCheckout.stayedNights}/>
                <InfoRow label="Unused nights"     value={bk.earlyCheckout.unusedNights}/>
                <InfoRow label="Early fee charged" value={fmtINR(bk.earlyCheckout.totalDeduction)} valueColor="#E0A852"/>
                {bk.earlyCheckout.refundAmount>0&&<InfoRow label="Refund to guest" value={fmtINR(bk.earlyCheckout.refundAmount)} valueColor="#52C07A"/>}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <Card>
            <SectionTitle icon={<UserIcon size={15}/>} text="Primary Guest"/>
            <InfoRow label="Name"     value={bk.customer?.name||"—"}/>
            <InfoRow label="Email"    value={bk.customer?.email||"—"}/>
            <InfoRow label="Phone"    value={bk.customer?.phoneno||"—"}/>
            <InfoRow label="City"     value={bk.customer?.city||"—"}/>
            <InfoRow label="Address"  value={bk.customer?.address||"—"}/>
            <InfoRow label="Adults"   value={bk.adults||0}/>
            <InfoRow label="Children" value={bk.children||0}/>
          </Card>

          {bk.guests?.length>0 && (
            <Card>
              <SectionTitle icon={<GuestIcon size={15}/>} text={`All Guests (${bk.guests.length})`}/>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ borderBottom:"1px solid rgba(255,255,255,.08)" }}>
                      {["#","Name","Age","Gender","Type"].map(h=>(
                        <th key={h} style={{ padding:"7px 10px", textAlign:"left", color:"#6B6054", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", fontSize:10 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bk.guests.map((g,i) => {
                      const isAdult = i<(bk.adults||0)
                      return (
                        <tr key={i} style={{ borderBottom:"1px solid rgba(255,255,255,.04)", background:i%2===0?"transparent":"rgba(255,255,255,.01)" }}>
                          <td style={{ padding:"8px 10px", color:"#6B6054" }}>{i+1}</td>
                          <td style={{ padding:"8px 10px", color:"#F5ECD7", fontWeight:600 }}>{g.name||"—"}</td>
                          <td style={{ padding:"8px 10px", color:"#C8BAA0" }}>{g.age||"—"}</td>
                          <td style={{ padding:"8px 10px", color:"#C8BAA0" }}>{g.gender||"—"}</td>
                          <td style={{ padding:"8px 10px" }}>
                            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, fontWeight:700,
                              background:isAdult?"rgba(201,168,76,.1)":"rgba(82,148,224,.1)",
                              color:isAdult?"#C9A84C":"#5294E0",
                              border:`1px solid ${isAdult?"rgba(201,168,76,.2)":"rgba(82,148,224,.2)"}`}}>
                              {isAdult?"Adult":"Child"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ACTION SECTION */}
      {isAdmin && !isDone && (
        <Card>
          <SectionTitle icon={<BellIcon size={15}/>} text="Actions"/>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:panel||isCheckedIn?20:0 }}>
            <Button variant="gold"
              onClick={() => { if(!isBooked) return; if(!canCheckIn){show(ciBlockMsg,"error");return}; setPanel(p=>p==="checkin"?null:"checkin") }}
              disabled={!isBooked}
              style={{ opacity:isBooked?1:0.35, cursor:isBooked?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
              <RightTickIcon size={14} color="#0E0C09"/> Check In {panel==="checkin"?"▲":"▼"}
            </Button>
            <Button variant="outline"
              onClick={() => { if(!isCheckedIn) return; setPanel(p=>p==="checkout"?null:"checkout") }}
              disabled={!isCheckedIn}
              style={{ opacity:isCheckedIn?1:0.35, cursor:isCheckedIn?"pointer":"not-allowed", display:"flex", alignItems:"center", gap:6 }}>
              <DoorIcon size={14} color="#C9A84C"/> Check Out {panel==="checkout"?"▲":"▼"}
            </Button>
            {(isBooked||isCheckedIn) && !isHallBk && (
              <Button variant="ghost" onClick={() => setShowSwitch(true)}
                style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid rgba(147,112,219,.35)", color:"#9B7FE8" }}>
                <SwitchIcon/> Switch Room
              </Button>
            )}
          </div>

          {isBooked&&!panel&&!canCheckIn && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(224,82,82,.08)", border:"1px solid rgba(224,82,82,.2)" }}>
              <p style={{ fontSize:12, color:"#E05252", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                <IconWarning size={13} color="#E05252"/> {ciBlockMsg}
              </p>
            </div>
          )}
          {isBooked&&!panel&&canCheckIn && (
            <p style={{ fontSize:12, color:"#8A7E6A", margin:0 }}>Click <strong style={{ color:"#C9A84C" }}>Check In</strong> to proceed.</p>
          )}
          {isCheckedIn&&!panel && <CheckoutScenarioBadge/>}

          {/* CHECK IN PANEL */}
          {panel==="checkin"&&isBooked && (
            <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(201,168,76,.25)" }}>
              <div style={{ padding:"14px 18px", background:"rgba(201,168,76,.06)", borderBottom:"1px solid rgba(201,168,76,.15)" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#C9A84C", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                  <RightTickIcon size={14} color="#C9A84C"/> Confirm Check-In
                </p>
                <p style={{ fontSize:11, color:"#8A7E6A", margin:"4px 0 0" }}>
                  {due>0?`${fmtINR(due)} pending — choose when to collect`:"Fully paid — ready to check in"}
                </p>
              </div>
              <div style={{ padding:18 }}>
                {due===0 && (
                  <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)", marginBottom:16 }}>
                    <p style={{ fontSize:12, color:"#52C07A", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                      <RightTickIcon size={13} color="#52C07A"/> Payment fully settled. Proceed with check-in.
                    </p>
                  </div>
                )}
                {due>0 && (
                  <div style={{ marginBottom:16 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#E0A852", marginBottom:12 }}>When to collect {fmtINR(due)}?</p>
                    {/* RESPONSIVE: bad-ci-choice */}
                    <div className="bad-ci-choice">
                      {[
                        {val:"now",     Icon:RupeeIcon, label:"Collect Now",          desc:"Guest pays at check-in"},
                        {val:"checkout",Icon:DoorIcon,  label:"Collect at Check-Out", desc:"Guest pays on departure"},
                      ].map((opt) => (
                        <button key={opt.val} type="button" onClick={() => {setCiChoice(opt.val);setCiErrors({})}}
                          style={{ flex:1, padding:"12px 16px", cursor:"pointer", textAlign:"left",
                            background:ciChoice===opt.val?"rgba(201,168,76,.12)":"rgba(255,255,255,.02)",
                            border:"none", display:"flex", alignItems:"flex-start", gap:8 }}>
                          <opt.Icon size={16} color={ciChoice===opt.val?"#C9A84C":"#6B6054"} style={{ flexShrink:0, marginTop:2 }}/>
                          <div>
                            <p style={{ fontSize:13, fontWeight:700, color:ciChoice===opt.val?"#C9A84C":"#C8BAA0", margin:"0 0 3px" }}>{opt.label}</p>
                            <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {due>0&&ciChoice==="now" && (
                  <div style={{ padding:16, borderRadius:10, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, gap:8 }}>
                      <span style={{ fontSize:12, color:"#8A7E6A" }}>Collecting now</span>
                      <span style={{ fontSize:20, fontWeight:800, color:"#E0A852" }}>{fmtINR(due)}</span>
                    </div>
                    <PaymentForm payment={ciPayment} setPayment={setCiPayment} errors={ciErrors} setErrors={setCiErrors} amountDue={due}/>
                  </div>
                )}
                {due>0&&ciChoice==="checkout" && (
                  <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(82,148,224,.08)", border:"1px solid rgba(82,148,224,.2)", marginBottom:16 }}>
                    <p style={{ fontSize:12, color:"#5294E0", margin:0 }}>{fmtINR(due)} will be collected at checkout.</p>
                  </div>
                )}
                <Button variant="gold" loading={acting} onClick={handleCheckIn}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <RightTickIcon size={14} color="#0E0C09"/>
                  {due>0?(ciChoice==="now"?"Pay & Check In":"Check In (Pay at Checkout)"):"Confirm Check-In"}
                </Button>
              </div>
            </div>
          )}

          {/* CHECK OUT PANEL */}
          {panel==="checkout"&&isCheckedIn && (
            <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid rgba(82,192,122,.2)" }}>
              <div style={{ padding:"14px 18px", background:"rgba(82,192,122,.06)", borderBottom:"1px solid rgba(82,192,122,.15)" }}>
                <p style={{ fontSize:13, fontWeight:700, color:"#52C07A", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                  <DoorIcon size={14} color="#52C07A"/> Confirm Check-Out
                </p>
                <p style={{ fontSize:11, color:"#8A7E6A", margin:"4px 0 0" }}>
                  {isExtended
                    ? `Extended stay · ${extraNights} extra night${extraNights>1?"s":""} · +${fmtINR(extraCharge)} additional charge`
                    : isEarly ? `Early checkout · ${unusedNights} unused night${unusedNights>1?"s":""} · 10% fee = ${fmtINR(totalDeduction)}`
                    : checkoutDue>0 ? `${fmtINR(checkoutDue)} due — collect before checking out`
                    : "Fully paid — ready to check out"}
                </p>
              </div>
              <div style={{ padding:18 }}>

                {/* Extended stay details — RESPONSIVE: bad-stat-grid */}
                {isExtended && (
                  <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:10, background:"rgba(224,168,82,.08)", border:"1px solid rgba(224,168,82,.3)" }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#E0A852", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 }}>
                      <IconWarning size={13} color="#E0A852"/> Extended Stay Detected
                    </p>
                    <div className="bad-stat-grid">
                      {[
                        ["Booked nights",  originalNights],
                        ["Stayed nights",  stayedNights],
                        ["Extra nights",   extraNights],
                        ["Price / night",  fmtINR(pricePerNight)],
                        ["Extra charge",   fmtINR(extraCharge)],
                        ["Total due",      fmtINR(extendedDue)],
                      ].map(([l,v]) => (
                        <div key={l} style={{ padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
                          <p style={{ fontSize:10, color:"#6B6054", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</p>
                          <p style={{ fontSize:14, fontWeight:700, color:"#E0A852", margin:0 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize:12, color:"#8A7E6A", margin:0 }}>
                      New total: <strong style={{ color:"#F5ECD7" }}>{fmtINR(total+extraCharge)}</strong>
                      {extendedDue>0&&<> · Due now: <strong style={{ color:"#E0A852" }}>{fmtINR(extendedDue)}</strong></>}
                    </p>
                  </div>
                )}

                {/* Early checkout details — RESPONSIVE: bad-stat-grid */}
                {isEarly && !isExtended && (
                  <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:10, background:"rgba(224,168,82,.08)", border:"1px solid rgba(224,168,82,.3)" }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#E0A852", margin:"0 0 10px", display:"flex", alignItems:"center", gap:6 }}>
                      <IconWarning size={13} color="#E0A852"/> Early Checkout Detected
                    </p>
                    <div className="bad-stat-grid">
                      {[
                        ["Booked nights",    originalNights],
                        ["Stayed nights",    stayedNights],
                        ["Unused nights",    unusedNights],
                        ["Price / night",    fmtINR(pricePerNight)],
                        ["Fee / night (10%)",fmtINR(deductPerNight)],
                        ["Total early fee",  fmtINR(totalDeduction)],
                      ].map(([l,v]) => (
                        <div key={l} style={{ padding:"7px 10px", borderRadius:8, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
                          <p style={{ fontSize:10, color:"#6B6054", margin:"0 0 3px", textTransform:"uppercase", letterSpacing:"0.06em" }}>{l}</p>
                          <p style={{ fontSize:14, fontWeight:700, color:"#E0A852", margin:0 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize:12, color:"#8A7E6A", margin:0 }}>
                      Adjusted total: <strong style={{ color:"#F5ECD7" }}>{fmtINR(newTotalEarly)}</strong>
                      {earlyDue>0&&<> · Due now: <strong style={{ color:"#E0A852" }}>{fmtINR(earlyDue)}</strong></>}
                      {earlyDue===0&&paid>newTotalEarly&&<> · Refund to guest: <strong style={{ color:"#52C07A" }}>{fmtINR(paid-newTotalEarly)}</strong></>}
                    </p>
                  </div>
                )}

                {checkoutDue===0 && (
                  <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)", marginBottom:16 }}>
                    <p style={{ fontSize:12, color:"#52C07A", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                      <RightTickIcon size={13} color="#52C07A"/>
                      {isEarly&&paid>newTotalEarly
                        ? `Early checkout fee ${fmtINR(totalDeduction)} applied. Refund ${fmtINR(paid-newTotalEarly)} to guest.`
                        : "Payment fully settled. Proceed with check-out."}
                    </p>
                  </div>
                )}

                {checkoutDue>0 && (
                  <div style={{ padding:16, borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px solid rgba(224,168,82,.25)", marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, gap:8 }}>
                      <span style={{ fontSize:12, color:"#8A7E6A", fontWeight:600 }}>
                        {isExtended?"Extra nights charge":isEarly?"Adjusted amount due":"Amount due"}
                      </span>
                      <span style={{ fontSize:22, fontWeight:800, color:"#E0A852" }}>{fmtINR(checkoutDue)}</span>
                    </div>
                    <PaymentForm payment={coPayment} setPayment={setCoPayment} errors={coErrors} setErrors={setCoErrors} amountDue={checkoutDue}/>
                  </div>
                )}

                <Button variant="gold" loading={acting} onClick={handleCheckOut}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  {checkoutDue>0
                    ? <><CollectIcon size={18} color="#0E0C09"/> Collect {fmtINR(checkoutDue)} & Check Out</>
                    : <><RightTickIcon size={14} color="#0E0C09"/> Confirm Check-Out</>
                  }
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {isDone && (
        <div style={{ marginTop:20, padding:"20px 24px", borderRadius:14, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", textAlign:"center" }}>
          <p style={{ fontSize:13, color:"#6B6054", margin:0, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            {bk.bookingStatus==="Checked-Out"
              ? <><RightTickIcon size={14} color="#52C07A"/> This booking has been checked out. No further actions required.</>
              : bk.bookingStatus==="No-Show"
                ? <><IconWarning size={14} color="#E0A852"/> This booking was marked as a no-show.</>
                : <><IconWarning size={14} color="#E05252"/> This booking was cancelled. No further actions available.</>
            }
          </p>
        </div>
      )}
    </div>
  )
}