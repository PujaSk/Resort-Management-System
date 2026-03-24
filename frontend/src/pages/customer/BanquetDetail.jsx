// src/pages/customer/BanquetDetail.jsx
// Fully responsive — stacks to 1 col on mobile, 5-col grid on desktop
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRoomTypeById } from "../../services/roomService"
import { createBooking, getBookedDates } from "../../services/bookingService"
import { useAuth } from "../../context/AuthContext"
import Loader from "../../components/ui/Loader"
import {
  fmt, toYMD, parseLocalDate,
  computeFullyBlockedDates,
  amenityIcon, PaymentPanel, BookingSuccessScreen,
} from "./bookingShared"
import { IconBed } from "./RoomList"
import { CalendarIcon, GuestIcon } from "../../components/ui/Icons"

export const IconSparkle = ({ size = 14, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)

/* ── Hall calendar styles (injected once) ── */
if (typeof document !== "undefined" && !document.getElementById("banquet-cal-style")) {
  const s = document.createElement("style")
  s.id = "banquet-cal-style"
  s.textContent = `
    .bcal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:clamp(2px,0.5vw,4px); }
    .bcal-day {
      aspect-ratio:1; display:flex; align-items:center; justify-content:center;
      border-radius:8px; font-size:clamp(10px,1.5vw,12px); font-weight:600;
      cursor:pointer; transition:all .15s;
      border:1px solid transparent; user-select:none;
    }
    .bcal-day.past      { color:rgba(255,255,255,.15); cursor:not-allowed; }
    .bcal-day.blocked   { color:rgba(255,80,80,.3);    cursor:not-allowed; background:rgba(255,80,80,.04); }
    .bcal-day.available { color:rgba(255,255,255,.55); background:rgba(255,255,255,.03); }
    .bcal-day.available:hover { background:rgba(201,168,76,.15); color:#C9A84C; border-color:rgba(201,168,76,.3); }
    .bcal-day.selected  { background:rgba(201,168,76,.22); color:#C9A84C; border-color:rgba(201,168,76,.5); }
    .bcal-day.maxed     { color:rgba(255,255,255,.15); cursor:not-allowed; }
    .bcal-day.empty     { cursor:default; }

    /* Responsive layout */
    .bd-wrap { max-width: 1200px; margin: 0 auto; padding: clamp(32px,5vw,56px) clamp(16px,4vw,40px) clamp(48px,6vw,80px); }
    .bd-grid { display: grid; grid-template-columns: 1fr; gap: 32px; }
    @media (min-width: 1024px) { .bd-grid { grid-template-columns: 3fr 2fr; gap: 40px; } }
    .bd-panel-sticky { position: static; }
    @media (min-width: 1024px) { .bd-panel-sticky { position: sticky; top: 24px; } }
    .bd-hero-img { height: clamp(220px, 40vw, 384px); }
    .bd-thumbs { display:flex; gap:8px; padding:10px; overflow-x:auto; }
    .bd-thumb  { height:clamp(44px,7vw,56px); width:clamp(60px,9vw,80px); border-radius:8px; overflow:hidden; flex-shrink:0; }
  `
  document.head.appendChild(s)
}

/* ══════════════════════════════════════════════
   CALENDAR
══════════════════════════════════════════════ */
function BanquetCalendar({ daysNeeded, selectedDates, onToggle, blockedDates }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const monthLabel  = new Date(viewYear, viewMonth, 1)
    .toLocaleString("en-IN", { month:"long", year:"numeric" })
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y-1)) : setViewMonth(m => m-1)
  const nextMonth = () => viewMonth === 11 ? (setViewMonth(0),  setViewYear(y => y+1)) : setViewMonth(m => m+1)

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gold hover:bg-gold/10 transition"
          style={{ border:"1px solid rgba(201,168,76,.25)", fontSize:"16px" }}>‹</button>
        <span className="text-cream text-sm font-semibold">{monthLabel}</span>
        <button onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gold hover:bg-gold/10 transition"
          style={{ border:"1px solid rgba(201,168,76,.25)", fontSize:"16px" }}>›</button>
      </div>

      <div className="bcal-grid mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="bcal-day empty"
            style={{ color:"rgba(201,168,76,.5)", fontSize:"clamp(8px,1.2vw,10px)", fontWeight:700 }}>{d}</div>
        ))}
      </div>

      <div className="bcal-grid">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="bcal-day empty" />
          const date = new Date(viewYear, viewMonth, d); date.setHours(0,0,0,0)
          const ymd       = toYMD(date)
          const isPast    = date < today
          const isBlocked = blockedDates.has(ymd)
          const isSel     = selectedDates.includes(ymd)
          const isMaxed   = selectedDates.length >= daysNeeded && !isSel

          let cls = "bcal-day "
          if (isPast)         cls += "past"
          else if (isBlocked) cls += "blocked"
          else if (isSel)     cls += "selected"
          else if (isMaxed)   cls += "maxed"
          else                cls += "available"

          const clickable = !isPast && !isBlocked && (!isMaxed || isSel)
          return (
            <div key={ymd} className={cls} title={isBlocked ? "Already booked" : undefined}
              onClick={() => clickable && onToggle(ymd)}>{d}</div>
          )
        })}
      </div>

      <div className="flex gap-3 mt-3 justify-center flex-wrap">
        {[
          { cls:"selected",  label:"Selected" },
          { cls:"available", label:"Available" },
          { cls:"blocked",   label:"Booked"    },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-resort-dim">
            <span className={`bcal-day ${cls}`}
              style={{ width:12, height:12, borderRadius:4, display:"inline-flex", flexShrink:0, cursor:"default" }}/>
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   STEP 1 — Days + Calendar
══════════════════════════════════════════════ */
function BanquetBookingPanel({ venue, user, navigate, blockedDates, savedData, onSave, onProceed }) {
  const [daysNeeded,    setDaysNeeded]    = useState(savedData?.daysNeeded    || 1)
  const [selectedDates, setSelectedDates] = useState(savedData?.selectedDates || [])
  const [error, setError] = useState("")

  const pricePerDay = venue?.price_per_night || 0
  const totalAmount = daysNeeded * pricePerDay

  const toggleDate = (ymd) => {
    setSelectedDates(prev => {
      if (prev.includes(ymd)) return prev.filter(d => d !== ymd)
      if (prev.length >= daysNeeded) return prev
      return [...prev, ymd].sort()
    })
    setError("")
  }

  const handleDaysChange = (v) => {
    const n = Math.max(1, Math.min(30, Number(v) || 1))
    setDaysNeeded(n)
    setSelectedDates(prev => prev.slice(0, n))
  }

  const handleProceed = () => {
    setError("")
    if (selectedDates.length < daysNeeded)
      return setError(`Please select ${daysNeeded} date${daysNeeded !== 1 ? "s" : ""} on the calendar.`)
    const data = {
      isHall: true, daysNeeded, selectedDates, hallDates: selectedDates,
      daysBooked: daysNeeded,
      checkIn:  selectedDates[0],
      checkOut: selectedDates[selectedDates.length - 1],
      nights:   daysNeeded, totalAmount, pricePerNight: pricePerDay,
      adults: 0, children: 0,
    }
    onSave(data); onProceed(data)
  }

  const remaining = daysNeeded - selectedDates.length

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between pb-4" style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <div>
          <span className="text-gold font-bold font-display" style={{ fontSize:"clamp(22px,4vw,30px)" }}>₹{fmt(pricePerDay)}</span>
          <span className="text-resort-dim text-sm ml-1">/ day</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.15)" }}>
          <span className="text-[10px]">🏛</span>
          <span className="text-gold text-[10px] font-semibold">Banquet / Hall</span>
        </div>
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
          <div>
            <label className="block text-resort-muted text-[11px] mb-2 uppercase tracking-widest">
              How many days do you need?
            </label>
            <div className="flex items-center gap-3">
              <button onClick={() => handleDaysChange(daysNeeded - 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gold font-bold text-xl hover:bg-gold/10 transition"
                style={{ border:"1px solid rgba(201,168,76,.25)" }}>−</button>
              <input type="number" min={1} max={30} value={daysNeeded}
                onChange={e => handleDaysChange(e.target.value)}
                className="f-input text-center font-bold text-cream text-lg w-20"
                style={{ MozAppearance:"textfield" }}/>
              <button onClick={() => handleDaysChange(daysNeeded + 1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gold font-bold text-xl hover:bg-gold/10 transition"
                style={{ border:"1px solid rgba(201,168,76,.25)" }}>+</button>
              <span className="text-resort-muted text-sm">day{daysNeeded !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="rounded-lg px-3 py-2.5"
            style={{ background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.15)" }}>
            <div className="flex items-center gap-1 text-gold font-semibold text-[11px] mb-0.5">
              <CalendarIcon size={14}/>
              <span>Select {daysNeeded} date{daysNeeded !== 1 ? "s" : ""} from the calendar</span>
            </div>
            <p className="text-resort-muted text-[11px]">
              {selectedDates.length} / {daysNeeded} selected
              {selectedDates.length > 0 && (
                <span className="ml-1">
                  — {selectedDates.map(d => parseLocalDate(d).toLocaleDateString("en-IN", { day:"numeric", month:"short" })).join(", ")}
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl p-4"
            style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)" }}>
            <BanquetCalendar daysNeeded={daysNeeded} selectedDates={selectedDates}
              onToggle={toggleDate} blockedDates={blockedDates}/>
          </div>

          {selectedDates.length === daysNeeded && (
            <div className="rounded-xl p-4 space-y-1.5 text-sm"
              style={{ background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.12)" }}>
              <div className="flex justify-between text-resort-muted">
                <span>₹{fmt(pricePerDay)} × {daysNeeded} day{daysNeeded !== 1 ? "s" : ""}</span>
                <span>₹{fmt(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-cream pt-1.5"
                style={{ borderTop:"1px solid rgba(201,168,76,.12)" }}>
                <span>Total</span><span className="text-gold">₹{fmt(totalAmount)}</span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-400 text-xs px-3 py-2 rounded-lg"
              style={{ background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)" }}>⚠ {error}</p>
          )}

          <button onClick={handleProceed}
            className="w-full py-3.5 rounded-xl gold-btn font-bold text-sm tracking-wide"
            style={{ color:"#0E0C09" }}>
            {remaining === 0
              ? "Continue to Payment →"
              : `Select ${remaining} More Date${remaining !== 1 ? "s" : ""}`}
          </button>
          <p className="text-resort-dim text-[11px] text-center">Free cancellation before the first booked date</p>
        </>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════ */
export const InfoIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <g>
      <path d="M10.363 3.591L2.257 17.125a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636-2.87L13.637 3.59a1.914 1.914 0 0 0-3.274 0M12 9h.01"/>
      <path d="M11 12h1v4h1"/>
    </g>
  </svg>
)

/* ══════════════════════════════════════════════
   MAIN — BanquetDetail
══════════════════════════════════════════════ */
export default function BanquetDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [venue,            setVenue]            = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [activeImg,        setActiveImg]        = useState(0)
  const [bookedRanges,     setBookedRanges]     = useState([])
  const [totalRooms,       setTotalRooms]       = useState(0)
  const [step,             setStep]             = useState("details")
  const [bookingData,      setBookingData]      = useState(null)
  const [savedPayment,     setSavedPayment]     = useState(null)
  const [confirmedPayment, setConfirmedPayment] = useState(null)
  const [submitting,       setSubmitting]       = useState(false)
  const [apiError,         setApiError]         = useState("")

  const blockedDates = useMemo(
    () => computeFullyBlockedDates(bookedRanges, totalRooms),
    [bookedRanges, totalRooms]
  )

  useEffect(() => {
    getRoomTypeById(id).then(r => setVenue(r.data)).catch(() => {}).finally(() => setLoading(false))
    getBookedDates(id).then(r => {
      setBookedRanges(r.data.ranges || [])
      setTotalRooms(r.data.totalRooms || 0)
    }).catch(() => {})
  }, [id])

  const handleConfirm = async ({ amountPaid, paymentDetails }) => {
    setApiError(""); setSubmitting(true)
    try {
      const sorted = [...bookingData.selectedDates].sort()
      const checkInDt  = parseLocalDate(sorted[0])
      const checkOutDt = new Date(parseLocalDate(sorted[0]))
      checkOutDt.setDate(checkOutDt.getDate() + 1)
      await createBooking({
        customer: user?._id || user?.id, roomType: id,
        adults: 0, children: 0, guests: [],
        checkInDateTime:  checkInDt.toISOString(),
        checkOutDateTime: checkOutDt.toISOString(),
        amountPaid,
        paymentDetails: { ...paymentDetails, hallDates:sorted, daysBooked:bookingData.daysNeeded, isNonContiguous:true },
      })
      setConfirmedPayment({ amountPaid, paymentDetails })
      setStep("done")
    } catch (e) {
      setApiError(e?.response?.data?.message || "Booking failed. Please try again.")
    } finally { setSubmitting(false) }
  }

  if (loading) return <Loader text="Loading venue details…"/>
  if (!venue) return (
    <div className="text-center py-32 text-resort-dim">
      <div className="text-6xl mb-4">🏛</div>
      <p className="text-cream text-xl mb-2">Venue not found</p>
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
          bookingData={{ ...bookingData, isHall:true,
            hallDates:bookingData.selectedDates, daysBooked:bookingData.daysNeeded,
            pricePerNight:venue?.price_per_night }}
          paymentData={confirmedPayment} roomType={venue} room={null}
          onDone={() => navigate("/bookings")}
        />
        <div style={{ marginTop:16, borderRadius:12, padding:"14px 16px",
          background:"rgba(201,168,76,.07)", border:"1px solid rgba(201,168,76,.22)" }}>
          <p className="flex items-center gap-1 text-[13px] font-bold text-[#C9A84C] mb-1">
            <IconBed size={18}/>&nbsp; Where will your guests stay?
          </p>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:"11.5px", lineHeight:1.6, marginBottom:10 }}>
            You've reserved the hall — don't forget accommodation for your guests!
          </p>
          <button onClick={() => navigate("/rooms")} style={{ width:"100%",
            background:"linear-gradient(135deg,#C9A84C,#ddb94e)", color:"#0E0C09",
            border:"none", cursor:"pointer", padding:"10px 20px", borderRadius:"10px",
            fontWeight:700, fontSize:"13px" }}>
            Browse &amp; Book Rooms for Guests →
          </button>
        </div>
      </div>
    </div>
  )

  const images    = venue.images || []
  const STEPS     = ["Book Venue", "Payment"]
  const stepIndex = { details:0, payment:1 }[step] ?? 0

  return (
    <div className="bd-wrap">
      <button onClick={() => navigate(-1)}
        className="text-resort-muted hover:text-gold text-sm flex items-center gap-1.5 transition group"
        style={{ marginBottom:"clamp(20px,4vw,32px)" }}>
        <span className="group-hover:-translate-x-1 transition">←</span> Back
      </button>

      <div className="bd-grid">

        {/* ── LEFT — venue info ── */}
        <div className="space-y-6 anim-up">
          <div className="rounded-2xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,.07)" }}>
            <div className="bd-hero-img overflow-hidden relative bg-[#1A1710]">
              {images.length > 0
                ? <img src={`http://resort-management-system.onrender.com/${images[activeImg]}`} alt={venue.type_name}
                    className="w-full h-full object-cover transition duration-500"/>
                : <div className="h-full flex items-center justify-center"
                    style={{ color:"rgba(201,168,76,.2)", fontSize:"clamp(48px,10vw,72px)" }}>🏛</div>
              }
              <div className="absolute inset-0 pointer-events-none"
                style={{ background:"linear-gradient(to top, rgba(14,12,9,.6) 0%, transparent 60%)" }}/>
              <div className="absolute bottom-4 left-4">
                <h1 className="font-display font-bold text-cream drop-shadow"
                  style={{ fontSize:"clamp(18px,4vw,28px)" }}>{venue.type_name}</h1>
                <p className="text-gold/80 text-sm mt-0.5">🏛 Banquet &amp; Event Venue</p>
              </div>
            </div>
            {images.length > 1 && (
              <div className="bd-thumbs" style={{ background:"#12100D" }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`bd-thumb flex-shrink-0 transition border-2 ${i === activeImg ? "border-gold" : "border-transparent opacity-60 hover:opacity-90"}`}>
                    <img src={`http://resort-management-system.onrender.com/${img}`} alt="" className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {venue.description && (
            <div className="card">
              <h3 className="font-display text-base font-semibold text-cream mb-3 flex items-center gap-2">
                <span className="text-gold"><IconSparkle/></span> About This Venue
              </h3>
              <p className="text-resort-muted text-sm leading-relaxed">{venue.description}</p>
            </div>
          )}

          {venue.capacity && (
            <div className="card">
              <h3 className="font-display text-base font-semibold text-cream mb-3 flex items-center gap-2">
                <span className="text-gold"><GuestIcon/></span> Capacity
              </h3>
              <p className="text-resort-muted text-sm">
                Up to <span className="text-gold font-semibold">{venue.capacity} guests</span>
              </p>
            </div>
          )}

          {venue.amenities?.length > 0 && (
            <div className="card">
              <h3 className="font-display text-base font-semibold text-cream mb-4 flex items-center gap-2">
                <span className="text-gold"><IconSparkle/></span> Amenities &amp; Features
              </h3>
              {/* Responsive amenity grid */}
              <div style={{ display:"grid",
                gridTemplateColumns:"repeat(auto-fill, minmax(clamp(120px,25%,180px), 1fr))", gap:12 }}>
                {venue.amenities.map(a => (
                  <div key={a} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-resort-muted"
                    style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)" }}>
                    <span className="text-base">{amenityIcon(a)}</span><span>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT — booking panel ── */}
        <div className="anim-up d2">
          <div className="bd-panel-sticky">
            <div className="card" style={{ border:"1px solid rgba(201,168,76,.18)" }}>

              {step !== "details" && (
                <div className="flex items-center gap-1 mb-5">
                  {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                          i < stepIndex  ? "bg-gold text-[#0E0C09]" :
                          i === stepIndex ? "bg-gold/20 text-gold border border-gold/50" :
                          "bg-white/5 text-resort-dim border border-white/10"
                        }`}>{i < stepIndex ? "✓" : i + 1}</div>
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
                <BanquetBookingPanel venue={venue} user={user} navigate={navigate}
                  blockedDates={blockedDates} savedData={bookingData} onSave={setBookingData}
                  onProceed={data => { setBookingData(data); setStep("payment") }}/>
              )}
              {step === "payment" && (
                <PaymentPanel room={venue} bookingData={bookingData}
                  savedPayment={savedPayment} onSave={setSavedPayment}
                  onBack={() => setStep("details")}
                  onConfirm={handleConfirm} submitting={submitting} error={apiError}/>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}