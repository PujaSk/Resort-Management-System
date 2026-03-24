// src/pages/customer/RoomDetail.jsx
// Fully responsive — stacks to 1 col on mobile, 5-col grid on desktop
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRoomTypeById } from "../../services/roomService"
import { createBooking, getBookedDates } from "../../services/bookingService"
import { useAuth } from "../../context/AuthContext"
import Loader from "../../components/ui/Loader"
import { AmenityBadge } from "../../components/ui/AmenityIcon"
import {
  fmt, toYMD, nightsBetween,
  computeFullyBlockedDates, firstBlockedInRange,
  amenityIcon, PaymentPanel, BookingSuccessScreen,
} from "./bookingShared"

/* ══════════════════════════════════════════════
   LOCAL SVG ICONS
══════════════════════════════════════════════ */
export const IconBed = ({ size = 24, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512" fill={color}>
    <path d="M239.802 74.44v.19h12.275v29.433h.004v31.265a85 85 0 0 0-10.095-1.084c-26.8-1.293-55.033 8.738-73.23 13.36l-7.545 1.92l.582 5.564c-.46-.176-.917-.356-1.387-.525l-.705-.256l-.74-.135c-4.097-.747-8.27-1.193-12.48-1.39c-29.477-1.372-60.834 9.463-81.174 14.523l-7.612 1.892l.836 7.8c.605 5.644 1.218 11.59 2.774 17.493c-10.642 13.072-10.078 18.35-8.417 27.184l211.14 73.916v74.053C184.03 336.45 106.252 295.828 25.582 264.49v-170h18v.125h12.374v34.77l165.848-21.414V74.44zm-2.088 77.845q1.804-.02 3.564.04c2.818.095 5.505.396 8.09.84c13.548 5.197 20.296 12.637 24.25 21.462c-23.255 9.644-44.174 13.507-62.515 15.736c-5.277-1.15-9.503-2.466-12.944-3.894a63.3 63.3 0 0 0-16.522-20.16a92 92 0 0 1-.584-3.33c17.414-4.63 38.614-10.504 56.66-10.695zm-94.35 18.528q2.07-.022 4.09.046a69 69 0 0 1 9.26.95c15.757 5.89 23.546 14.435 28.002 24.526c-26.44 10.85-50.22 15.162-70.965 17.62c-17.42-3.692-25.116-8.99-29.17-14.665c-3.072-4.302-4.524-9.753-5.53-16.518c19.495-5.077 43.62-11.753 64.314-11.96zM291.8 186.295l26.406 7.453c-59.194 10.41-125.095 28.732-165.18 45.766l-27.443-9.17c21.235-3.146 45.785-8.753 72.568-20.846l5.29-2.39c1.72.44 3.5.853 5.35 1.232l1.42.29l1.44-.17c21.562-2.54 47.905-7.294 77.15-20.782zm68.797 19.418l51.336 14.49l-147.905 38.377v17.6l-82.517-27.147l-1.77-.59c49.176-17.717 124.438-36.303 180.857-42.73zm127.79 13.68v90.57L283.69 372.127v-99.62zM23.613 282.45L60.837 299v14.674L39.98 322.13l-16.366-10.57zm463.26 49.243v34.995l-21.91 9.515l-16.367-7.4v-25.487zm-234.453 52.49l11.608 5.16l9.442 4.196l19.342-6.87v40.848l-22.704 10.043l-17.687-12.685z"/>
  </svg>
)

const IconUsers = ({ size = 18, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const IconCheck = ({ size = 13, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconWarning = ({ size = 14, color = "#f59e0b" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconArrowLeft = ({ size = 16, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

export const IconSparkle = ({ size = 14, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)

/* ══════════════════════════════════════════════
   STEP 1 — Dates + Guests
══════════════════════════════════════════════ */
function BookingPanel({ room, user, navigate, blockedDates, savedData, onSave, onProceed }) {
  const [checkIn,  setCheckIn]  = useState(savedData?.checkIn  || "")
  const [checkOut, setCheckOut] = useState(savedData?.checkOut || "")
  const [adults,   setAdults]   = useState(savedData?.adults   ?? 1)
  const [children, setChildren] = useState(savedData?.children ?? 0)
  const [error,    setError]    = useState("")

  const nights        = nightsBetween(checkIn, checkOut)
  const pricePerNight = room?.price_per_night || 0
  const totalAmount   = nights * pricePerNight
  const today         = toYMD(new Date())

  const handleCheckIn = (v) => {
    setCheckIn(v); setCheckOut("")
    setError(blockedDates.has(v) ? "This date is fully booked. Please choose another date." : "")
  }
  const handleCheckOut = (v) => {
    if (!checkIn) return
    setCheckOut(v)
    const b = firstBlockedInRange(checkIn, v, blockedDates)
    setError(b ? `Date ${b} in your range is fully booked. Please adjust.` : "")
  }

  const handleProceed = () => {
    setError("")
    if (!checkIn || !checkOut)             return setError("Please select check-in and check-out dates.")
    if (nights <= 0)                       return setError("Check-out must be after check-in.")
    const b = firstBlockedInRange(checkIn, checkOut, blockedDates)
    if (b)                                 return setError(`Date ${b} is fully booked. Please adjust your dates.`)
    if (adults + children > room.capacity) return setError(`Max capacity is ${room.capacity} guests.`)
    const data = { checkIn, checkOut, adults, children, nights, totalAmount, pricePerNight }
    onSave(data); onProceed(data)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between pb-4" style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <div>
          <span className="text-gold font-bold font-display" style={{ fontSize:"clamp(22px,4vw,30px)" }}>₹{fmt(pricePerNight)}</span>
          <span className="text-resort-dim text-sm ml-1">/ night</span>
        </div>
        {nights > 0 && (
          <span className="text-resort-muted text-xs px-2.5 py-1 rounded-full"
            style={{ background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.15)" }}>
            {nights} night{nights !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {!user ? (
        <div className="text-center py-2">
          <p className="text-resort-muted text-sm mb-3">Please log in to make a booking</p>
          <button onClick={() => navigate("/login")}
            className="gold-btn px-6 py-2.5 rounded-xl text-sm font-bold w-full" style={{ color:"#0E0C09" }}>
            Login to Book
          </button>
        </div>
      ) : (
        <>
          {blockedDates.size > 0 && (
            <div className="rounded-lg px-3 py-2 text-[11px] text-resort-muted flex items-center gap-2"
              style={{ background:"rgba(255,180,0,.05)", border:"1px solid rgba(255,180,0,.15)" }}>
              <IconWarning size={13} color="#f59e0b"/>
              Some dates are fully booked. Unavailable dates will be rejected when selected.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-resort-muted text-[11px] mb-1.5 uppercase tracking-widest">Check-In</label>
              <input type="date" value={checkIn} min={today}
                onChange={e => handleCheckIn(e.target.value)} className="f-input w-full text-sm"/>
            </div>
            <div>
              <label className="block text-resort-muted text-[11px] mb-1.5 uppercase tracking-widest">Check-Out</label>
              <input type="date" value={checkOut} min={checkIn || today}
                onChange={e => handleCheckOut(e.target.value)} className="f-input w-full text-sm"/>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label:"Adults",   val:adults,   set:setAdults,   min:1, max:room.capacity },
              { label:"Children", val:children, set:setChildren, min:0, max:room.capacity - adults },
            ].map(({ label, val, set, min, max }) => (
              <div key={label}>
                <label className="block text-resort-muted text-[11px] mb-1.5 uppercase tracking-widest">{label}</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => set(Math.max(min, val - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gold font-bold text-lg hover:bg-gold/10 transition"
                    style={{ border:"1px solid rgba(201,168,76,.25)" }}>−</button>
                  <span className="text-cream font-semibold w-6 text-center">{val}</span>
                  <button onClick={() => set(Math.min(max, val + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gold font-bold text-lg hover:bg-gold/10 transition"
                    style={{ border:"1px solid rgba(201,168,76,.25)" }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {adults + children > room.capacity && (
            <p className="text-xs text-red-400 -mt-2 flex items-center gap-1">
              <IconWarning size={12} color="#f87171"/> Max capacity is {room.capacity} guests
            </p>
          )}

          {nights > 0 && (
            <div className="rounded-xl p-4 space-y-1.5 text-sm"
              style={{ background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.12)" }}>
              <div className="flex justify-between text-resort-muted">
                <span>₹{fmt(pricePerNight)} × {nights} night{nights !== 1 ? "s" : ""}</span>
                <span>₹{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-cream pt-1.5"
                style={{ borderTop:"1px solid rgba(201,168,76,.12)" }}>
                <span>Total</span><span className="text-gold">₹{fmt(totalAmount)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)" }}>
              <IconWarning size={12} color="#f87171"/> {error}
            </p>
          )}

          <button onClick={handleProceed}
            className="w-full py-3.5 rounded-xl gold-btn font-bold text-sm tracking-wide"
            style={{ color:"#0E0C09" }}>
            {nights > 0 ? "Continue →" : "Select Dates to Continue"}
          </button>
          <p className="text-resort-dim text-[11px] text-center">Free cancellation before check-in</p>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 2 — Guest Info
══════════════════════════════════════════════ */
function GuestInfoPanel({ bookingData, onBack, onProceed, savedGuests, onSave }) {
  const totalGuests = bookingData.adults + bookingData.children
  const [guests, setGuests] = useState(() => {
    if (savedGuests?.length === totalGuests) return savedGuests
    return Array.from({ length: totalGuests }, (_, i) => ({
      name:"", age:"", gender:"",
      type: i < bookingData.adults ? "Adult" : "Child",
    }))
  })
  const [error, setError] = useState("")

  const update = (i, field, value) =>
    setGuests(g => g.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const getAgeError = (g) => {
    const age = Number(g.age)
    if (!g.age) return null
    if (g.type === "Adult" && age < 18)              return "Adult must be 18 or older"
    if (g.type === "Child" && (age < 1 || age > 17)) return "Child must be between 1 and 17"
    return null
  }

  const handleProceed = () => {
    setError("")
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].name.trim()) return setError(`Please enter name for Guest ${i + 1}.`)
      if (!guests[i].age)         return setError(`Please enter age for Guest ${i + 1}.`)
      const ae = getAgeError(guests[i])
      if (ae)                     return setError(`Guest ${i + 1}: ${ae}.`)
      if (!guests[i].gender)      return setError(`Please select gender for Guest ${i + 1}.`)
    }
    onSave(guests)
    onProceed(guests.map(({ name, age, gender }) => ({ name, age: Number(age), gender })))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <button onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gold hover:bg-gold/10 transition"
          style={{ border:"1px solid rgba(201,168,76,.25)" }}>
          <IconArrowLeft size={15}/>
        </button>
        <div>
          <p className="text-cream font-semibold text-sm">Guest Details</p>
          <p className="text-resort-dim text-[11px]">
            {totalGuests} guest{totalGuests !== 1 ? "s" : ""} · {bookingData.nights} night{bookingData.nights !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Scroll container — limits height so panel doesn't overflow on mobile */}
      <div style={{ maxHeight:"clamp(280px, 50vh, 420px)", overflowY:"auto", paddingRight:4 }} className="space-y-4">
        {guests.map((g, i) => (
          <div key={i} className="rounded-xl p-4 space-y-3"
            style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}>
            <div className="flex items-center gap-2">
              <span className="text-gold text-sm font-semibold">Guest {i + 1}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px]" style={{
                background: g.type === "Adult" ? "rgba(201,168,76,.1)"         : "rgba(100,180,255,.1)",
                border:     g.type === "Adult" ? "1px solid rgba(201,168,76,.2)" : "1px solid rgba(100,180,255,.2)",
                color:      g.type === "Adult" ? "#C9A84C"                    : "rgba(100,200,255,1)",
              }}>{g.type}</span>
            </div>
            <div>
              <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">Full Name</label>
              <input value={g.name} onChange={e => update(i,"name",e.target.value)}
                placeholder="Enter full name" className="f-input w-full text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">
                  Age <span className="normal-case text-resort-dim">({g.type === "Adult" ? "18+" : "1–17"})</span>
                </label>
                <input type="number" value={g.age}
                  min={g.type === "Adult" ? 18 : 1} max={g.type === "Adult" ? 120 : 17}
                  onChange={e => update(i,"age",e.target.value)}
                  placeholder={g.type === "Adult" ? "18+" : "1–17"}
                  className={`f-input w-full text-sm ${getAgeError(g) ? "border-red-500/60" : ""}`}/>
                {getAgeError(g) && <p className="text-red-400 text-[10px] mt-1">{getAgeError(g)}</p>}
              </div>
              <div>
                <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">Gender</label>
                <select value={g.gender} onChange={e => update(i,"gender",e.target.value)}
                  className="f-input w-full text-sm">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)" }}>
          <IconWarning size={12} color="#f87171"/> {error}
        </p>
      )}

      <button onClick={handleProceed}
        className="w-full py-3.5 rounded-xl gold-btn font-bold text-sm tracking-wide"
        style={{ color:"#0E0C09" }}>
        Continue to Payment →
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN — RoomDetail
══════════════════════════════════════════════ */
export default function RoomDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room,             setRoom]             = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [activeImg,        setActiveImg]        = useState(0)
  const [bookedRanges,     setBookedRanges]     = useState([])
  const [totalRooms,       setTotalRooms]       = useState(0)
  const [step,             setStep]             = useState("details")
  const [bookingData,      setBookingData]      = useState(null)
  const [savedGuests,      setSavedGuests]      = useState(null)
  const [savedPayment,     setSavedPayment]     = useState(null)
  const [guestList,        setGuestList]        = useState([])
  const [confirmedPayment, setConfirmedPayment] = useState(null)
  const [submitting,       setSubmitting]       = useState(false)
  const [apiError,         setApiError]         = useState("")

  const blockedDates = useMemo(
    () => computeFullyBlockedDates(bookedRanges, totalRooms),
    [bookedRanges, totalRooms]
  )

  useEffect(() => {
    getRoomTypeById(id).then(r => setRoom(r.data)).catch(() => {}).finally(() => setLoading(false))
    getBookedDates(id).then(r => {
      setBookedRanges(r.data.ranges || [])
      setTotalRooms(r.data.totalRooms || 0)
    }).catch(() => {})
  }, [id])

  const handleConfirm = async ({ amountPaid, paymentDetails }) => {
    setApiError(""); setSubmitting(true)
    try {
      await createBooking({
        customer: user?._id || user?.id, roomType: id,
        adults: bookingData.adults, children: bookingData.children,
        guests: guestList,
        checkInDateTime:  new Date(bookingData.checkIn).toISOString(),
        checkOutDateTime: new Date(bookingData.checkOut).toISOString(),
        amountPaid, paymentDetails,
      })
      setConfirmedPayment({ amountPaid, paymentDetails })
      setStep("done")
    } catch (e) {
      setApiError(e?.response?.data?.message || "Booking failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader text="Loading room details…"/>
  if (!room) return (
    <div className="text-center py-32 text-resort-dim">
      <div className="flex justify-center mb-4"><IconBed size={56} color="rgba(201,168,76,.2)"/></div>
      <p className="text-cream text-xl mb-2">Room not found</p>
      <button onClick={() => navigate(-1)}
        className="gold-btn px-6 py-2 rounded-xl mt-4 text-sm font-bold" style={{ color:"#0E0C09" }}>← Go Back</button>
    </div>
  )

  if (step === "done") return (
    <div style={{ position:"fixed", inset:0, overflowY:"auto", background:"#0E0C09", zIndex:50,
      display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px 16px" }}>
      <div style={{ width:"100%", maxWidth:"440px", margin:"auto", background:"#161410",
        border:"1px solid rgba(201,168,76,.22)", borderRadius:"20px",
        padding:"clamp(18px,4vw,28px) clamp(16px,4vw,24px)",
        boxShadow:"0 32px 80px rgba(0,0,0,.7)" }}>
        <BookingSuccessScreen
          bookingData={{ ...bookingData, isHall:false, pricePerNight:room?.price_per_night }}
          paymentData={confirmedPayment}
          roomType={room} room={null}
          onDone={() => navigate("/bookings")}
        />
      </div>
    </div>
  )

  const images    = room.images || []
  const STEPS     = ["Details", "Guests", "Payment"]
  const stepIndex = { details:0, guests:1, payment:2 }[step] ?? 0

  return (
    <>
      {/* Responsive layout styles */}
      <style>{`
        .rd-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 16px 60px;
        }
        @media (min-width: 480px) { .rd-wrap { padding: 48px 24px 64px; } }
        @media (min-width: 768px) { .rd-wrap { padding: 56px 32px 72px; } }
        @media (min-width: 1024px){ .rd-wrap { padding: 56px 40px 80px; } }

        /* 1 col on mobile, 5-col grid on lg */
        .rd-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }
        @media (min-width: 1024px) {
          .rd-grid { grid-template-columns: 3fr 2fr; gap: 40px; }
        }

        /* Booking panel — sticky only on desktop */
        .rd-panel-sticky { position: static; }
        @media (min-width: 1024px) {
          .rd-panel-sticky { position: sticky; top: 24px; }
        }

        /* Image height */
        .rd-hero-img { height: clamp(220px, 40vw, 384px); }

        /* Thumbnail strip */
        .rd-thumbs { display: flex; gap: 8px; padding: 10px; overflow-x: auto; }
        .rd-thumb  { height: clamp(48px, 8vw, 56px); width: clamp(64px, 10vw, 80px); border-radius: 8px; overflow: hidden; flex-shrink: 0; }
      `}</style>

      <div className="rd-wrap">
        <button onClick={() => navigate(-1)}
          className="text-resort-muted hover:text-gold text-sm flex items-center gap-1.5 transition group"
          style={{ marginBottom:"clamp(20px,4vw,32px)" }}>
          <IconArrowLeft size={14} color="rgba(255,255,255,.4)"/>
          Back to Rooms
        </button>

        <div className="rd-grid">

          {/* ── LEFT ── */}
          <div className="space-y-6 anim-up">

            {/* Image gallery */}
            <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
              <div className="rd-hero-img overflow-hidden relative bg-[#1A1710]">
                {images.length > 0
                  ? <img src={`http://localhost:5000/${images[activeImg]}`} alt={room.type_name}
                      className="w-full h-full object-cover transition duration-500"/>
                  : <div className="h-full flex items-center justify-center">
                      <IconBed size={72} color="rgba(201,168,76,.2)"/>
                    </div>
                }
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background:"linear-gradient(to top, rgba(14,12,9,.6) 0%, transparent 60%)" }}/>
                <div className="absolute bottom-4 left-4">
                  <h1 className="font-display font-bold text-cream drop-shadow"
                    style={{ fontSize:"clamp(18px,4vw,28px)" }}>{room.type_name}</h1>
                  <p className="text-gold/80 flex items-center gap-1.5 mt-0.5"
                    style={{ fontSize:"clamp(11px,1.5vw,13px)" }}>
                    <IconUsers size={12} color="rgba(201,168,76,.8)"/>
                    Up to {room.capacity} guests
                  </p>
                </div>
              </div>
              {images.length > 1 && (
                <div className="rd-thumbs" style={{ background:"#12100D" }}>
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`rd-thumb flex-shrink-0 transition border-2 ${
                        i === activeImg ? "border-gold" : "border-transparent opacity-60 hover:opacity-90"}`}>
                      <img src={`http://localhost:5000/${img}`} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            {room.description && (
              <div className="card">
                <h3 className="font-display text-base font-semibold text-cream mb-3 flex items-center gap-2">
                  <IconSparkle size={14}/> About This Room
                </h3>
                <p className="text-resort-muted text-sm leading-relaxed">{room.description}</p>
              </div>
            )}

            {/* Bed configuration */}
            {room.beds?.length > 0 && (
              <div className="card">
                <h3 className="font-display text-base font-semibold text-cream mb-4 flex items-center gap-2">
                  <IconBed size={20}/> Bed Configuration
                </h3>
                <div className="flex flex-wrap gap-3">
                  {room.beds.map((bed, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gold font-medium"
                      style={{ background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.2)" }}>
                      <IconBed size={18}/> {bed.count} × {bed.type}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {room.amenities?.length > 0 && (
              <div className="card">
                <h3 className="font-display text-base font-semibold text-cream mb-4 flex items-center gap-2">
                  <IconSparkle size={14}/> Amenities
                </h3>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {room.amenities.map((a, i) => (
                    <AmenityBadge key={i} name={a} size={15} fontSize={13}
                      color="#C9A84C" background="rgba(255,255,255,.03)" border="rgba(255,255,255,.09)"/>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — booking panel ── */}
          <div className="anim-up d2">
            <div className="rd-panel-sticky">
              <div className="card" style={{ border:"1px solid rgba(201,168,76,.18)" }}>

                {step !== "details" && (
                  <div className="flex items-center gap-1 mb-5">
                    {STEPS.map((s, i) => (
                      <React.Fragment key={s}>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            i < stepIndex   ? "bg-gold text-[#0E0C09]"                        :
                            i === stepIndex ? "bg-gold/20 text-gold border border-gold/50"    :
                            "bg-white/5 text-resort-dim border border-white/10"
                          }`}>
                            {i < stepIndex ? <IconCheck size={10} color="#0E0C09"/> : i + 1}
                          </div>
                          <span className={`text-[11px] ${i === stepIndex ? "text-gold" : "text-resort-dim"}`}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className="flex-1 h-px mx-1"
                            style={{ background: i < stepIndex ? "rgba(201,168,76,.4)" : "rgba(255,255,255,.08)" }}/>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {step === "details" && (
                  <BookingPanel room={room} user={user} navigate={navigate}
                    blockedDates={blockedDates} savedData={bookingData}
                    onSave={setBookingData}
                    onProceed={data => { setBookingData(data); setStep("guests") }}/>
                )}
                {step === "guests" && (
                  <GuestInfoPanel bookingData={bookingData}
                    savedGuests={savedGuests} onSave={setSavedGuests}
                    onBack={() => setStep("details")}
                    onProceed={clean => { setGuestList(clean); setStep("payment") }}/>
                )}
                {step === "payment" && (
                  <PaymentPanel room={room} bookingData={bookingData}
                    savedPayment={savedPayment} onSave={setSavedPayment}
                    onBack={() => setStep("guests")}
                    onConfirm={handleConfirm}
                    submitting={submitting} error={apiError}/>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}