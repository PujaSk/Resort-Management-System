// src/pages/customer/bookingShared.jsx
// ─── Shared constants, helpers, and UI components
// ─── used by both RoomDetail.jsx and BanquetDetail.jsx

import { InfoIcon } from "./BanquetDetail"

/* ══════════════════════════════════════════════
   GLOBAL STYLES (injected once)
══════════════════════════════════════════════ */
if (typeof document !== "undefined" && !document.getElementById("booking-shared-style")) {
  const s = document.createElement("style")
  s.id = "booking-shared-style"
  s.textContent = `
    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(1) brightness(2); cursor: pointer; opacity: .7;
    }
    input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }
    @keyframes tick-draw {
      from { stroke-dashoffset: 80; }
      to   { stroke-dashoffset: 0; }
    }
    @keyframes fade-slide-up {
      from { transform: translateY(20px); opacity:0; }
      to   { transform: translateY(0);    opacity:1; }
    }
    @keyframes row-in {
      from { transform: translateX(-12px); opacity:0; }
      to   { transform: translateX(0);     opacity:1; }
    }
    @keyframes shimmer-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .pay-split-card {
      position: relative;
      overflow: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }
    .pay-split-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(201,168,76,0.08) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.25s;
    }
    .pay-split-card:hover::before { opacity: 1; }
    .pay-split-card.selected::before { opacity: 1; }
    .pay-split-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .method-row {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .method-row:hover { transform: translateX(2px); }
    .canc-bar {
      height: 4px;
      border-radius: 2px;
      overflow: hidden;
      background: rgba(255,255,255,0.06);
    }
    .canc-bar-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `
  document.head.appendChild(s)
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
export const fmt = (n) => Number(n).toLocaleString("en-IN")

export const toYMD = (d) => {
  const dt = d instanceof Date ? d : new Date(d)
  const y   = dt.getFullYear()
  const m   = String(dt.getMonth() + 1).padStart(2, "0")
  const day = String(dt.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const parseLocalDate = (ymd) => {
  const [y, mo, d] = ymd.split("-").map(Number)
  return new Date(y, mo - 1, d)
}

export const nightsBetween = (ci, co) => {
  if (!ci || !co) return 0
  return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000))
}

/* ── Blocked dates ── */
export const computeFullyBlockedDates = (ranges, totalRooms) => {
  if (!ranges?.length || !totalRooms) return new Set()
  const counts = {}
  ranges.forEach(({ checkIn, checkOut, hallDates }) => {
    if (hallDates?.length) {
      hallDates.forEach(ymd => { counts[ymd] = (counts[ymd] || 0) + 1 })
    } else {
      let cur = new Date(checkIn), end = new Date(checkOut)
      while (cur < end) {
        const k = toYMD(cur); counts[k] = (counts[k] || 0) + 1; cur.setDate(cur.getDate() + 1)
      }
    }
  })
  const blocked = new Set()
  Object.entries(counts).forEach(([d, c]) => { if (c >= totalRooms) blocked.add(d) })
  return blocked
}

export const firstBlockedInRange = (ci, co, blocked) => {
  if (!blocked.size) return null
  let cur = new Date(ci), end = new Date(co)
  end.setDate(end.getDate() - 1)
  while (cur <= end) { const k = toYMD(cur); if (blocked.has(k)) return k; cur.setDate(cur.getDate() + 1) }
  return null
}

/* ══════════════════════════════════════════════
   AMENITY ICONS
══════════════════════════════════════════════ */
const AMENITY_ICONS = {
  "wifi":"📶","wi-fi":"📶","ac":"❄️","air conditioning":"❄️","tv":"📺",
  "television":"📺","pool":"🏊","swimming pool":"🏊","gym":"🏋️","fitness":"🏋️",
  "spa":"💆","jacuzzi":"🛁","breakfast":"🍳","restaurant":"🍽️","parking":"🚗",
  "bar":"🍸","balcony":"🌅","ocean view":"🌊","safe":"🔒","minibar":"🍾","room service":"🛎️",
}
export const amenityIcon = (a) => AMENITY_ICONS[a.toLowerCase()] || "✦"

/* ══════════════════════════════════════════════
   CARD ICONS
══════════════════════════════════════════════ */
export const CreditCardIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 576 512"
    fill={color}
  >
    <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16zm16 144v192c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224zM64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24h112c13.3 0 24-10.7 24-24s-10.7-24-24-24z"/>
  </svg>
)

export const DebitCardIcon = ({ size = 22, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill={color}
  >
    <g>
      <path d="M27.147 28h-1.794a.86.86 0 0 1-.853-.853v-1.794c0-.475.378-.853.853-.853h1.794c.475 0 .853.378.853.853v1.794a.85.85 0 0 1-.853.853m-3.761-4H5.614A.617.617 0 0 1 5 23.384v-2.768c0-.333.272-.616.614-.616h17.772c.332 0 .614.273.614.616v2.778a.61.61 0 0 1-.614.606M6 22a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5"/>
      <path d="M4.248 11A3.25 3.25 0 0 0 1 14.249V27.75A3.25 3.25 0 0 0 4.248 31h23.504A3.245 3.245 0 0 0 31 27.751V14.25A3.25 3.25 0 0 0 27.752 11zM3 14.249C3 13.56 3.562 13 4.248 13h23.504c.686 0 1.248.561 1.248 1.249V15H3zM3 18h26v9.751c0 .695-.559 1.249-1.248 1.249H4.248A1.25 1.25 0 0 1 3 27.751z"/>
    </g>
  </svg>
)

export const UpiIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M11 15h1.5v-2H15q.425 0 .713-.288T16 12v-2q0-.425-.288-.712T15 9h-4zm6 0h1.5V9H17zm-4.5-3.5v-1h2v1zM6 15h3q.425 0 .713-.288T10 14V9H8.5v4.5h-2V9H5v5q0 .425.288.713T6 15m-2 5q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6z"/>
  </svg>
)

export const LockIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill={color}
  >
    <path d="M24.875 15.334v-4.876c0-4.894-3.98-8.875-8.875-8.875s-8.875 3.98-8.875 8.875v4.876H5.042v15.083h21.916V15.334zm-14.25-4.876c0-2.964 2.41-5.375 5.375-5.375s5.375 2.41 5.375 5.375v4.876h-10.75zm7.647 16.498h-4.545l1.222-3.667a2.37 2.37 0 0 1-1.325-2.12a2.375 2.375 0 1 1 4.75 0c0 .932-.542 1.73-1.324 2.12z"/>
  </svg>
)

export const MoneyIcon = ({ size = 14, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill={color}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.463 9.692C13.463 12.664 10.77 14 7 14S.537 12.664.537 9.713c0-3.231 1.616-4.868 4.847-6.505L4.24 1.077A.7.7 0 0 1 4.843 0H9.41a.7.7 0 0 1 .603 1.023L8.616 3.208c3.23 1.615 4.847 3.252 4.847 6.484M4.957 6.5H6.64c.14.042.316.12.457.25a.8.8 0 0 1 .226.354H4.958a.5.5 0 1 0 0 1h2.207a1.5 1.5 0 0 1-.633.417a3.1 3.1 0 0 1-.977.187H5.54a.5.5 0 0 0-.328.877h.001l.001.002l.005.003l.013.012a4 4 0 0 0 .219.173a8.2 8.2 0 0 0 2.886 1.377a.5.5 0 1 0 .242-.97a7.2 7.2 0 0 1-1.75-.704l.054-.02c.338-.127.71-.329 1-.656c.175-.195.312-.428.397-.698h.762a.5.5 0 0 0 0-1h-.694A1.9 1.9 0 0 0 8.15 6.5h.892a.5.5 0 0 0 0-1H4.958a.5.5 0 0 0 0 1Zm.583 2.708l-.329.377z"
    />
  </svg>
)

export const HallIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6m0 0v-6.172a2 2 0 0 0-.586-1.414l-3-3a2 2 0 0 0-2.828 0l-3 3A2 2 0 0 0 3 13.828V18a2 2 0 0 0 2 2h3m5 0H8m0-4v4m9.001-12H17m.002 4H17m.001 4H17" />
  </svg>
);

export const AlarmIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M26.607 6.392a15 15 0 0 0-6.725-3.882m-7.764 0a15 15 0 0 0-6.725 3.882M16 9v8l-4 4m15-4c0 6.075-4.925 11-11 11S5 23.075 5 17S9.925 6 16 6s11 4.925 11 11"/>
  </svg>
)

export const RightTickIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.86 5.392c.428 1.104-.171 1.86-1.33 2.606c-.935.6-2.126 1.252-3.388 2.365c-1.238 1.091-2.445 2.406-3.518 3.7a55 55 0 0 0-2.62 3.437c-.414.591-.993 1.473-.993 1.473A2.25 2.25 0 0 1 8.082 20a2.24 2.24 0 0 1-1.9-1.075c-.999-1.677-1.769-2.34-2.123-2.577C3.112 15.71 2 15.618 2 14.134C2 12.955 2.995 12 4.222 12c.867.032 1.672.373 2.386.853c.456.306.939.712 1.441 1.245a58 58 0 0 1 2.098-2.693c1.157-1.395 2.523-2.892 3.988-4.184c1.44-1.27 3.105-2.459 4.87-3.087c1.15-.41 2.429.153 2.856 1.258"/>
  </svg>
)




/* ══════════════════════════════════════════════
   PAYMENT METHODS
   Rooms:  card / UPI only — 50% or 100% upfront
   Halls:  card / UPI only — always 100% upfront
   ❌ "Pay at Check-In" removed entirely
══════════════════════════════════════════════ */
export const PAYMENT_METHODS = [
  { id:"credit_card", label:"Credit Card", icon:<CreditCardIcon />, desc:"Visa, Mastercard, RuPay, Amex" },
  { id:"debit_card",  label:"Debit Card",  icon:<DebitCardIcon />, desc:"All major bank cards accepted"  },
  { id:"upi",         label:"UPI",          icon:<UpiIcon />, desc:"GPay, PhonePe, Paytm & more"   },
]

/* Hall uses same methods */
export const HALL_PAYMENT_METHODS = PAYMENT_METHODS

/* ── Split options for ROOMS ── */
export const ROOM_PAYMENT_SPLITS = [
  {
    id: "half",
    label: "Pay 50% Now",
    sublabel: "Rest at check-in",
    icon: "✦",
    description: "Pay half upfront to secure your booking. The remaining 50% is due at check-in.",
    badge: "Flexible",
    badgeColor: "#4ade80",
    badgeBg: "rgba(74,222,128,0.12)",
  },
  {
    id: "full",
    label: "Pay 100% Now",
    sublabel: "Fully settled",
    icon: "◆",
    description: "Pay the full amount now. No payments required on arrival.",
    badge: "Recommended",
    badgeColor: "#C9A84C",
    badgeBg: "rgba(201,168,76,0.15)",
  },
]

export const CardLogos = {
  VISA:       <svg viewBox="0 0 48 16" width="36" height="13" xmlns="http://www.w3.org/2000/svg"><text x="0" y="13" fontFamily="Arial" fontWeight="900" fontSize="14" fill="#1A1FBF" letterSpacing="-0.5">VISA</text></svg>,
  MASTERCARD: <svg viewBox="0 0 38 24" width="36" height="22" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="12" r="10" fill="#EB001B"/><circle cx="24" cy="12" r="10" fill="#F79E1B"/><path d="M19 5.27A9.97 9.97 0 0122.73 12 9.97 9.97 0 0119 18.73 9.97 9.97 0 0115.27 12 9.97 9.97 0 0119 5.27z" fill="#FF5F00"/></svg>,
  RUPAY:      <svg viewBox="0 0 52 20" width="44" height="17" xmlns="http://www.w3.org/2000/svg"><rect width="52" height="20" rx="3" fill="#1a1a2e"/><text x="4" y="14" fontFamily="Arial" fontWeight="800" fontSize="10" fill="#f97316">Ru</text><text x="18" y="14" fontFamily="Arial" fontWeight="800" fontSize="10" fill="#ffffff">Pay</text></svg>,
  AMEX:       <svg viewBox="0 0 52 20" width="44" height="17" xmlns="http://www.w3.org/2000/svg"><rect width="52" height="20" rx="3" fill="#007BC1"/><text x="5" y="14" fontFamily="Arial" fontWeight="800" fontSize="9" fill="white">AMEX</text></svg>,
}

export const UpiLogos = [
  { name:"GPay",    svg:<svg viewBox="0 0 40 16" width="40" height="16" xmlns="http://www.w3.org/2000/svg"><text x="0" y="12" fontFamily="Arial" fontWeight="800" fontSize="11"><tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">P</tspan><tspan fill="#FBBC04">a</tspan><tspan fill="#34A853">y</tspan></text></svg> },
  { name:"PhonePe", svg:<svg viewBox="0 0 54 16" width="54" height="16" xmlns="http://www.w3.org/2000/svg"><text x="0" y="12" fontFamily="Arial" fontWeight="800" fontSize="10" fill="#5f259f">Phone</text><text x="33" y="12" fontFamily="Arial" fontWeight="800" fontSize="10" fill="#7b3cc3">Pe</text></svg> },
  { name:"Paytm",   svg:<svg viewBox="0 0 44 16" width="44" height="16" xmlns="http://www.w3.org/2000/svg"><text x="0" y="12" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#00BAF2">Pay</text><text x="22" y="12" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#012970">tm</text></svg> },
  { name:"BHIM",    svg:<svg viewBox="0 0 36 16" width="36" height="16" xmlns="http://www.w3.org/2000/svg"><text x="0" y="12" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#00894b">BH</text><text x="18" y="12" fontFamily="Arial" fontWeight="900" fontSize="11" fill="#f47920">IM</text></svg> },
]

export const isExpiryValid = (exp) => {
  if (!exp || exp.length < 5) return false
  const [mm, yy] = exp.split("/")
  const month = parseInt(mm, 10), year = 2000 + parseInt(yy, 10)
  if (month < 1 || month > 12) return false
  return new Date(year, month, 1) > new Date()
}

/* ── Split options for HALLS (mirrors rooms) ── */
export const HALL_PAYMENT_SPLITS = [
  {
    id: "half",
    label: "Pay 50% Now",
    sublabel: "Rest on first event day",
    icon: "✦",
    description: "Pay half upfront to confirm the venue. The remaining 50% is due on the first booked date.",
    badge: "Flexible",
    badgeColor: "#4ade80",
    badgeBg: "rgba(74,222,128,0.12)",
  },
  {
    id: "full",
    label: "Pay 100% Now",
    sublabel: "Fully settled",
    icon: "◆",
    description: "Pay the full amount now. No payments required on the event day.",
    badge: "Recommended",
    badgeColor: "#C9A84C",
    badgeBg: "rgba(201,168,76,0.15)",
  },
]

/* ══════════════════════════════════════════════
   CANCELLATION POLICY CONSTANTS

   ROOMS:  15% cancellation charge on total booking amount
   HALLS:  25% cancellation charge per cancelled day (on per-day total, not just paid portion)
══════════════════════════════════════════════ */
export const HALL_CANCELLATION_CHARGE_PCT = 25
export const ROOM_CANCELLATION_CHARGE_PCT = 15

/* HALLS: 25% fee is always based on the PER-DAY TOTAL (pricePerDay), not just what was paid.
   This mirrors the room logic — fee is on the total value, not the upfront portion.
   amountPaidPerDay = ceil(pricePerDay / 2)  if 50% split
                    = pricePerDay            if full
   fee    = 25% of pricePerDay  (always on total day rate)
   refund = amountPaidPerDay − fee  (min 0)
   remaining balance (if half-pay) is waived on cancellation */
export const hallCancellationFee    = (pricePerDay)                       => Math.round(pricePerDay * 0.25)
export const hallCancellationRefund = (amountPaidPerDay, pricePerDay)     => Math.max(0, amountPaidPerDay - hallCancellationFee(pricePerDay))

/* Fee is always 15% of the TOTAL booking amount (not just what was paid upfront).
   If only 50% was paid, the refund = amountPaid − fee (could be 0 → no refund, balance reduced). */
export const roomCancellationFee    = (totalAmount) => Math.round(totalAmount * 0.15)
export const roomCancellationRefund = (amountPaid, totalAmount) =>
  Math.max(0, amountPaid - roomCancellationFee(totalAmount))

/* ══════════════════════════════════════════════
   SHARED: SUCCESS SCREEN ANIMATED RING + TICK
══════════════════════════════════════════════ */
import React from "react"
import { IconBed } from "./RoomList"

export function SuccessRing({ phase }) {
  const R = 45, CIR = 2 * Math.PI * R
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5"/>
      <circle cx="55" cy="55" r={R - 3} fill="#0E0C09"/>
      <circle cx="55" cy="55" r={R}
        fill="none" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={CIR} strokeDashoffset={phase >= 1 ? 0 : CIR}
        transform="rotate(-90 55 55)"
        style={{ transition:"stroke-dashoffset 0.95s cubic-bezier(.4,0,.2,1)" }}
      />
      {phase >= 1 && (
        <polyline points="33,56 48,71 77,37" fill="none" stroke="#C9A84C"
          strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="80" strokeDashoffset="80"
          style={{ animation:"tick-draw 0.45s 0.05s ease forwards" }}
        />
      )}
    </svg>
  )
}

/* ══════════════════════════════════════════════
   BOOKING SUCCESS SCREEN
   Drop-in for RoomDetail.jsx and BanquetDetail.jsx.

   Props:
     bookingData  — { nights, totalAmount, checkIn, checkOut,
                      pricePerNight, isHall, hallDates, daysBooked }
     paymentData  — { amountPaid,
                      paymentDetails: { method, splitChoice, cardNumber, upiId } }
     roomType     — { type_name }
     room         — { room_number, floor }  (null for hall)
     onDone       — () => navigate("/my-bookings")

   Usage in RoomDetail / BanquetDetail:
     {step === "success" && (
       <BookingSuccessScreen
         bookingData={bookingData}
         paymentData={confirmedPayment}
         roomType={roomType}
         room={assignedRoom}
         onDone={() => navigate("/my-bookings")}
       />
     )}
══════════════════════════════════════════════ */
export function BookingSuccessScreen({ bookingData, paymentData, roomType, room, onDone }) {
  const [phase, setPhase] = React.useState(0)
  React.useEffect(() => { const t = setTimeout(() => setPhase(1), 120); return () => clearTimeout(t) }, [])

  /* ── derived values ── */
  const isHall      = !!bookingData?.isHall
  const totalAmount = Number(bookingData?.totalAmount) || 0
  const amountPaid  = Number(paymentData?.amountPaid)  || 0
  const amountDue   = Math.max(0, totalAmount - amountPaid)
  const splitChoice = paymentData?.paymentDetails?.splitChoice || (amountDue === 0 ? "full" : "half")
  const isHalfPay   = splitChoice === "half" && amountDue > 0

  const method      = paymentData?.paymentDetails?.method || ""
  const cardLast4   = paymentData?.paymentDetails?.cardNumber?.replace(/\s/g, "").slice(-4)
  const upiId       = paymentData?.paymentDetails?.upiId

  const nights      = Number(bookingData?.nights) || 0
  const hallDates   = bookingData?.hallDates   || []
  const daysBooked  = Number(bookingData?.daysBooked) || hallDates.length || 1
  const priceUnit   = Number(bookingData?.pricePerNight || room?.price_per_night) || 0

  const cancFee = isHall
    ? Math.round(priceUnit * 0.25)
    : Math.round(totalAmount * 0.15)

  /* ── formatters ── */
  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
    : "—"
  const fmtYMD = (ymd) => {
    const [y, mo, d] = ymd.split("-").map(Number)
    return new Date(y, mo - 1, d).toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })
  }

  const methodLabel = { credit_card:"Credit Card", debit_card:"Debit Card", upi:"UPI" }[method] || "—"
  const methodIcon  = {
    credit_card: <CreditCardIcon size={16} />,
    debit_card:  <DebitCardIcon size={16} />,
    upi:         <UpiIcon size={16} />,
  }[method] || <MoneyIcon size={14} />

  /* ── tiny sub-components ── */
  const Divider = () => (
    <div style={{ height:1, background:"rgba(255,255,255,.06)", margin:"2px 0" }} />
  )

  const Row = ({ label, value, valueColor="#e8dcc8", valueSize="13px", labelSize="12px", bold=false, topBorder=false }) => (
    <div style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"10px 18px",
      borderTop: topBorder ? "1px solid rgba(255,255,255,.06)" : "none",
    }}>
      <span style={{ color:"rgba(255,255,255,.45)", fontSize:labelSize }}>{label}</span>
      <span style={{ color:valueColor, fontSize:valueSize, fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  )

  const SectionHeader = ({ icon, title }) => (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      padding:"11px 18px 9px",
      borderBottom:"1px solid rgba(255,255,255,.06)",
      background:"rgba(201,168,76,.04)",
    }}>
      <span style={{ fontSize:13 }}>{icon}</span>
      <span style={{ color:"rgba(255,255,255,.3)", fontSize:"10px", fontWeight:700, letterSpacing:"1.8px", textTransform:"uppercase" }}>
        {title}
      </span>
    </div>
  )

  const Card = ({ children }) => (
    <div style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, overflow:"hidden" }}>
      {children}
    </div>
  )

  return (
    <div className="space-y-4" style={{ animation:"fade-slide-up 0.45s cubic-bezier(0.4,0,0.2,1) forwards" }}>

      {/* ═══ HERO: TICK + TITLE ═══ */}
      <div className="flex flex-col items-center gap-3 py-3">
        <SuccessRing phase={phase} />
        <div className="text-center space-y-1">
          <h2 style={{ fontFamily:"Georgia,serif", color:"#C9A84C", fontSize:"1.3rem", fontWeight:700, margin:0 }}>
            {isHall ? "Venue Booked!" : "Booking Confirmed!"}
          </h2>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:"11.5px", margin:0, display: "flex", alignItems: "center", gap: "4px",   }}>
            Confirmation email sent · Booking is secured <LockIcon size={12}/>
          </p>
        </div>
      </div>

      {/* ═══ PAYMENT PLAN HERO PILL ═══ */}
      <div style={{ display:"flex", justifyContent:"center" }}>
        <div style={{
          display:"inline-flex", flexDirection:"column", alignItems:"center", gap:4,
          padding:"14px 28px", borderRadius:16,
          background: isHalfPay
            ? "linear-gradient(135deg, rgba(245,158,11,.12) 0%, rgba(245,158,11,.06) 100%)"
            : "linear-gradient(135deg, rgba(74,222,128,.12) 0%, rgba(74,222,128,.06) 100%)",
          border:`1.5px solid ${isHalfPay ? "rgba(245,158,11,.35)" : "rgba(74,222,128,.35)"}`,
        }}>
          <span style={{ fontSize:22 }}>{isHalfPay ? "⚡" : <RightTickIcon size={20} color="#4ade80"/> }</span>
          <span style={{ color: isHalfPay ? "#f59e0b" : "#4ade80", fontSize:"13px", fontWeight:800, letterSpacing:".4px" }}>
            {isHalfPay ? "50% PAID NOW" : "FULLY PAID"}
          </span>
          <span style={{ color:"rgba(255,255,255,.35)", fontSize:"11px" }}>
            {isHalfPay
              ? `₹${fmt(amountPaid)} charged · ₹${fmt(amountDue)} due ${isHall ? "on event day" : "at check-in"}`
              : `₹${fmt(amountPaid)} — no balance remaining`}
          </span>
        </div>
      </div>

      {/* ═══ BOOKING DETAILS ═══ */}
      <Card>
        <SectionHeader icon={isHall ? <span style={{ color: "#C9A84C", fontSize: 18 ,alignItems: "center",}}>🏛</span> : <IconBed/>} title={isHall ? "Venue Details" : "Stay Details"} />

        <Row label={isHall ? "Hall / Venue" : "Room Type"}
             value={roomType?.type_name || "—"}
             valueColor="#C9A84C" bold />

        {!isHall && room && (
          <Row label="Room & Floor"
               value={`Room ${room.room_number}  ·  Floor ${room.floor}`} />
        )}

        {!isHall && <>
          <Divider />
          <Row label="Check-In"  value={fmtDate(bookingData?.checkIn)}  />
          <Row label="Check-Out" value={fmtDate(bookingData?.checkOut)} />
          <Row label="Duration"  value={`${nights} Night${nights !== 1 ? "s" : ""}`} bold valueColor="#e8dcc8" />
        </>}

        {isHall && hallDates.length > 0 && <>
          <Divider />
          <div style={{ padding:"10px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12px" }}>
                Event Date{daysBooked > 1 ? "s" : ""}
              </span>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                {[...hallDates].sort().map(ymd => (
                  <span key={ymd} style={{ color:"#e8dcc8", fontSize:"12.5px", fontWeight:500 }}>
                    {fmtYMD(ymd)}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Row label="Total Days Booked"
               value={`${daysBooked} Day${daysBooked !== 1 ? "s" : ""}`}
               bold valueColor="#e8dcc8" />
        </>}
      </Card>

      {/* ═══ PAYMENT SUMMARY ═══ */}
      <Card>
        <SectionHeader icon={<MoneyIcon size={16} />} title="Payment Summary" />

        {/* rate × unit */}
        <Row
          label={isHall
            ? `₹${fmt(priceUnit)} × ${daysBooked} day${daysBooked !== 1 ? "s" : ""}`
            : `₹${fmt(priceUnit)} × ${nights} night${nights !== 1 ? "s" : ""}`}
          value={`₹${fmt(totalAmount)}`}
        />

        <Divider />

        {/* payment plan badge row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 18px" }}>
          <span style={{ color:"rgba(255,255,255,.45)", fontSize:"12px" }}>Payment Plan</span>
          <span style={{
            padding:"3px 12px", borderRadius:20, fontSize:"11px", fontWeight:700,
            background: isHalfPay ? "rgba(245,158,11,.12)" : "rgba(201,168,76,.15)",
            color:      isHalfPay ? "#f59e0b"              : "#C9A84C",
            border:     `1px solid ${isHalfPay ? "rgba(245,158,11,.3)" : "rgba(201,168,76,.35)"}`,
          }}>
            {isHalfPay ? "50% Upfront" : "Full Payment"}
          </span>
        </div>

        <Divider />

        {/* paid now — prominent green */}
        <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(74,222,128,.04)" }}>
          <div>
            <p style={{ color:"rgba(255,255,255,.4)", fontSize:"11px", margin:"0 0 2px" }}>Paid Now</p>
            <p style={{ color:"#4ade80", fontSize:"18px", fontWeight:800, fontFamily:"Georgia,serif", margin:0 }}>
              ₹{fmt(amountPaid)}
            </p>
          </div>
          <span style={{
            padding:"4px 14px", borderRadius:20, fontSize:"11px", fontWeight:700,
            background: isHalfPay ? "rgba(245,158,11,.12)" : "rgba(74,222,128,.12)",
            color:      isHalfPay ? "#f59e0b"              : "#4ade80",
            border:     `1px solid ${isHalfPay ? "rgba(245,158,11,.3)" : "rgba(74,222,128,.3)"}`,
          }}>
            {isHalfPay ? "Partially Paid" : "Paid ✓"}
          </span>
        </div>

        {/* due amount — prominent amber (50% only) */}
        {isHalfPay && (
          <div style={{ padding:"12px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(245,158,11,.04)", borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <div>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:"11px", margin:"0 0 2px" }}>
                Due at {isHall ? "First Event Date" : "Check-In"}
              </p>
              <p style={{ color:"#f59e0b", fontSize:"18px", fontWeight:800, fontFamily:"Georgia,serif", margin:0 }}>
                ₹{fmt(amountDue)}
              </p>
            </div>
            <span style={{ color:"rgba(255,255,255,.3)", fontSize:"11px" }}>
              Pay on arrival
            </span>
          </div>
        )}

        <Divider />

        {/* payment method */}
        <Row
          label={
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {methodIcon}
              {methodLabel}
            </span>
          }
          value={
            (method === "credit_card" || method === "debit_card") && cardLast4
              ? `**** **** **** ${cardLast4}`
              : method === "upi" && upiId
                ? upiId
                : "—"
          }
          valueColor="rgba(255,255,255,.6)"
        />
      </Card>

      {/* ═══ BALANCE DUE CALLOUT (50% only) ═══ */}
      {isHalfPay && (
        <div style={{
          background:"rgba(245,158,11,.07)", border:"1px solid rgba(245,158,11,.28)",
          borderRadius:12, padding:"14px 16px",
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ fontSize:16 }}>
              <AlarmIcon size={16} />
            </span>
            <span style={{ color:"#f59e0b", fontSize:"12.5px", fontWeight:700 }}>
              Balance Due: ₹{fmt(amountDue)}
            </span>
          </div>
          <p style={{ color:"rgba(255,255,255,.4)", fontSize:"11.5px", lineHeight:1.65, margin:0 }}>
            Please bring ₹{fmt(amountDue)} to pay{" "}
            {isHall ? "at the front desk on your first event date" : "at check-in"}.
            Nothing else to do right now.
          </p>
        </div>
      )}

      {/* ═══ CANCELLATION POLICY NOTE ═══ */}
      <div style={{
        background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)",
        borderRadius:12, padding:"12px 16px", display:"flex", gap:10,
      }}>
        <span style={{ fontSize:13, flexShrink:0, marginTop:1 }}><InfoIcon size={16} /></span>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:"11px", lineHeight:1.65, margin:0 }}>
          {isHall
            ? <>On Cancellation: <strong style={{color:"rgba(255,255,255,.45)"}}>25% per-day fee (₹{fmt(cancFee)}/day)</strong> will be deducted from amount paid.{isHalfPay ? " Remaining balance will be waived." : ""}</>
            : <>On Cancellation: <strong style={{color:"rgba(255,255,255,.45)"}}>15% of total (₹{fmt(cancFee)})</strong> will be deducted from your upfront payment.{isHalfPay ? " Remaining check-in balance will be waived." : ""}</>
          }
        </p>
      </div>

      {/* ═══ CTA ═══ */}
      <button
        onClick={onDone}
        className="w-full py-3.5 rounded-xl gold-btn font-bold text-sm tracking-wide"
        style={{ color:"#0E0C09" }}
      >
        View My Bookings →
      </button>

    </div>
  )
}

/* ══════════════════════════════════════════════
   SPLIT SELECTOR — rooms and halls
══════════════════════════════════════════════ */
function SplitSelector({ totalAmount, splitChoice, onSelect, isHall = false }) {
  const halfAmount = Math.ceil(totalAmount / 2)
  const amounts    = { half: halfAmount, full: totalAmount }
  const splits     = isHall ? HALL_PAYMENT_SPLITS : ROOM_PAYMENT_SPLITS

  return (
    <div>
      <p className="text-resort-muted text-[11px] uppercase tracking-widest mb-3">
        How much would you like to pay now?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {splits.map(opt => {
          const amt = amounts[opt.id]
          const isSelected = splitChoice === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`pay-split-card rounded-xl p-4 text-left ${isSelected ? "selected" : ""}`}
              style={{
                background: isSelected
                  ? "rgba(201,168,76,0.08)"
                  : "rgba(255,255,255,0.02)",
                border: isSelected
                  ? "1.5px solid rgba(201,168,76,0.5)"
                  : "1.5px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Badge */}
              <div className="mb-2">
                <span
                  className="pay-split-badge"
                  style={{
                    color:       opt.badgeColor,
                    background:  opt.badgeBg,
                    border:      `1px solid ${opt.badgeColor}40`,
                  }}
                >
                  {opt.badge}
                </span>
              </div>

              {/* Amount */}
              <div className="mb-1">
                <span
                  className="font-bold text-lg leading-none"
                  style={{
                    fontFamily: "Georgia, serif",
                    color: isSelected ? "#C9A84C" : "#e8dcc8",
                  }}
                >
                  ₹{fmt(amt)}
                </span>
              </div>

              {/* Label */}
              <p
                className="text-xs font-semibold mb-0.5"
                style={{ color: isSelected ? "#C9A84C" : "rgba(255,255,255,0.6)" }}
              >
                {opt.label}
              </p>
              <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.28)" }}>
                {opt.sublabel}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="absolute top-3 right-3 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "#C9A84C" }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <polyline points="1,4 3,6 7,2" stroke="#0E0C09" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Split description */}
      {splitChoice && (
        <p
          className="text-[11px] mt-3 px-3 py-2 rounded-lg leading-relaxed"
          style={{ background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.06)" }}
        >
          {splits.find(o => o.id === splitChoice)?.description}
        </p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   CANCELLATION POLICY BLOCK
══════════════════════════════════════════════ */
function CancellationPolicyBlock({ isHall, totalAmount, amountBeingPaid, pricePerDay, daysBooked }) {
  if (isHall) {
    /* Fee is always 25% of the FULL per-day rate (not just what was paid).
       Refund = amountPaidPerDay − fee  (min 0)
       If 50% was paid: remaining 50% balance is waived on cancellation. */
    const cancFeePerDay    = hallCancellationFee(pricePerDay)
    const perDayPaidNow    = amountBeingPaid > 0 ? amountBeingPaid / (daysBooked || 1) : 0
    const isHalfPay        = perDayPaidNow > 0 && perDayPaidNow < pricePerDay
    const cancRefPerDay    = hallCancellationRefund(perDayPaidNow || pricePerDay, pricePerDay)
    const balanceWaived    = isHalfPay ? Math.floor(pricePerDay / 2) : 0

    return (
      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background:"rgba(248,113,113,.05)", border:"1px solid rgba(248,113,113,.18)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-400">⚠ Cancellation Policy</p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background:"rgba(248,113,113,0.12)", color:"#f87171", border:"1px solid rgba(248,113,113,0.25)" }}
          >
            25% fee/day
          </span>
        </div>

        <p className="text-resort-muted text-[11.5px] leading-relaxed">
          A{" "}
          <span className="text-red-400 font-semibold">25% cancellation charge per day</span>{" "}
          is applied on the{" "}
          <span className="font-semibold text-cream">full per-day rate</span>{" "}
          — regardless of how much was paid upfront.
        </p>

        {/* Visual bar — always shows 75/25 split of full day rate */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
            <span>Refundable (75% of day rate)</span>
            <span>Fee (25% of day rate)</span>
          </div>
          <div className="canc-bar">
            <div className="flex h-full">
              <div className="canc-bar-fill" style={{ width:"75%", background:"linear-gradient(90deg,#4ade80,#22c55e)" }}/>
              <div className="canc-bar-fill" style={{ width:"25%", background:"linear-gradient(90deg,#f87171,#ef4444)" }}/>
            </div>
          </div>
        </div>

        {/* Breakdown — only when an amount is selected */}
        {amountBeingPaid > 0 && (
          <div className="space-y-1 pt-1 text-[11px]" style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <p className="text-resort-dim uppercase tracking-wider text-[10px] mb-2">If you cancel 1 date:</p>
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.35)" }}>Full per-day rate</span>
              <span className="text-cream font-semibold">₹{fmt(pricePerDay)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.35)" }}>Cancellation fee (25%)</span>
              <span className="text-red-400 font-semibold">−₹{fmt(cancFeePerDay)}</span>
            </div>
            {isHalfPay && (
              <div className="flex justify-between">
                <span style={{ color:"rgba(255,255,255,0.35)" }}>You paid upfront (50%)</span>
                <span className="text-cream font-semibold">₹{fmt(Math.ceil(pricePerDay / 2))}</span>
              </div>
            )}
            {isHalfPay && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2 mt-1"
                style={{ background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.18)" }}
              >
                <span style={{ color:"#f87171", fontSize:"12px", flexShrink:0 }}>ℹ</span>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"10.5px", lineHeight:1.6 }}>
                  The ₹{fmt(cancFeePerDay)} fee is deducted from your upfront payment of ₹{fmt(Math.ceil(pricePerDay / 2))}.
                  The remaining balance of ₹{fmt(balanceWaived)} due on the event day will be waived.
                </p>
              </div>
            )}
            <div className="flex justify-between pt-1.5" style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <span className="font-semibold" style={{ color:"rgba(255,255,255,0.5)" }}>You get back</span>
              <span className={`font-bold ${cancRefPerDay > 0 ? "text-green-400" : "text-resort-dim"}`}>
                {cancRefPerDay > 0 ? `₹${fmt(cancRefPerDay)}` : "No refund"}
              </span>
            </div>
          </div>
        )}

        {/* Static breakdown when no amount selected yet */}
        {!amountBeingPaid && (
          <div className="space-y-1 pt-1 text-[11px]" style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <p className="text-resort-dim uppercase tracking-wider text-[10px] mb-2">If you cancel 1 date:</p>
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.35)" }}>Per-day rate</span>
              <span className="text-cream font-semibold">₹{fmt(pricePerDay)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color:"rgba(255,255,255,0.35)" }}>Cancellation fee (25%)</span>
              <span className="text-red-400 font-semibold">−₹{fmt(cancFeePerDay)}</span>
            </div>
            <div className="flex justify-between pt-1.5" style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <span className="font-semibold" style={{ color:"rgba(255,255,255,0.5)" }}>You get back</span>
              <span className="text-green-400 font-bold">₹{fmt(hallCancellationRefund(pricePerDay, pricePerDay))}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── Room cancellation: 15% of TOTAL booking amount (not just what was paid) ── */
  const cancFee    = roomCancellationFee(totalAmount)
  const cancRefund = roomCancellationRefund(amountBeingPaid, totalAmount)
  const isHalfPay  = amountBeingPaid > 0 && amountBeingPaid < totalAmount

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background:"rgba(255,180,0,.04)", border:"1px solid rgba(255,180,0,.18)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color:"#fbbf24" }}>
          ⚠ Cancellation Policy
        </p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background:"rgba(251,191,36,0.12)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.25)" }}
        >
          15% of total
        </span>
      </div>

      <p className="text-resort-muted text-[11.5px] leading-relaxed">
        A <span className="font-semibold" style={{ color:"#fbbf24" }}>15% cancellation charge</span>{" "}
        is deducted from the <span className="font-semibold text-cream">total booking amount</span>{" "}
        — regardless of how much was paid upfront.
      </p>

      {/* Visual bar — always shows 85/15 split of total */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]" style={{ color:"rgba(255,255,255,0.3)" }}>
          <span>Refundable (85% of total)</span>
          <span>Fee (15% of total)</span>
        </div>
        <div className="canc-bar">
          <div className="flex h-full">
            <div className="canc-bar-fill" style={{ width:"85%", background:"linear-gradient(90deg,#4ade80,#22c55e)" }}/>
            <div className="canc-bar-fill" style={{ width:"15%", background:"linear-gradient(90deg,#fbbf24,#f59e0b)" }}/>
          </div>
        </div>
      </div>

      {/* Breakdown — only show when an amount is selected */}
      {amountBeingPaid > 0 && (
        <div className="space-y-1.5 pt-2 text-[11px]" style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}>
          <p className="text-resort-dim uppercase tracking-wider text-[10px] mb-2">If you cancel this booking:</p>

          <div className="flex justify-between">
            <span style={{ color:"rgba(255,255,255,0.35)" }}>Total booking value</span>
            <span className="text-cream font-semibold">₹{fmt(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color:"rgba(255,255,255,0.35)" }}>Cancellation fee (15% of total)</span>
            <span style={{ color:"#fbbf24" }} className="font-semibold">−₹{fmt(cancFee)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color:"rgba(255,255,255,0.35)" }}>Amount you paid upfront</span>
            <span className="text-cream font-semibold">₹{fmt(amountBeingPaid)}</span>
          </div>

          {/* Warning note for 50% pay scenario */}
          {isHalfPay && (
            <div
              className="flex items-start gap-2 rounded-lg px-3 py-2 mt-1"
              style={{ background:"rgba(251,191,36,0.07)", border:"1px solid rgba(251,191,36,0.18)" }}
            >
              <span style={{ color:"#fbbf24", fontSize:"12px", flexShrink:0 }}>ℹ</span>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"10.5px", lineHeight:1.6 }}>
                The ₹{fmt(cancFee)} fee is deducted from your upfront payment of ₹{fmt(amountBeingPaid)}.
                {cancRefund > 0
                  ? ` You receive ₹${fmt(cancRefund)} back.`
                  : " No refund — fee exceeds or equals your upfront payment."}
              </p>
            </div>
          )}

          <div
            className="flex justify-between pt-1.5"
            style={{ borderTop:"1px solid rgba(255,255,255,.06)" }}
          >
            <span className="font-semibold" style={{ color:"rgba(255,255,255,0.5)" }}>You get back</span>
            <span className={`font-bold ${cancRefund > 0 ? "text-green-400" : "text-resort-dim"}`}>
              {cancRefund > 0 ? `₹${fmt(cancRefund)}` : "No refund"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════
   SHARED: PAYMENT PANEL

   Room rules (isHall=false):
   • Choose 50% or 100% upfront — NO "Pay at Check-In"
   • 15% cancellation charge on TOTAL booking amount (not just upfront)

   Hall rules (isHall=true):
   • Choose 50% or 100% upfront — same as rooms
   • 25% cancellation charge per day on TOTAL DAY RATE (not just upfront)
   • "Rest at first event day" instead of "at check-in"
══════════════════════════════════════════════ */
export function PaymentPanel({
  room, bookingData, onBack, onConfirm,
  submitting, error, savedPayment, onSave,
}) {
  const { totalAmount } = bookingData
  const isHall = !!bookingData.isHall

  const [splitChoice, setSplitChoice] = React.useState(
    savedPayment?.splitChoice || ""
  )
  const [method,      setMethod]      = React.useState(savedPayment?.method     || "")
  const [cardNumber,  setCardNumber]  = React.useState(savedPayment?.cardNumber || "")
  const [expiry,      setExpiry]      = React.useState(savedPayment?.expiry     || "")
  const [cvv,         setCvv]         = React.useState(savedPayment?.cvv        || "")
  const [cardName,    setCardName]    = React.useState(savedPayment?.cardName   || "")
  const [upiId,       setUpiId]       = React.useState(savedPayment?.upiId      || "")
  const [payErr,      setPayErr]      = React.useState("")

  /* Compute how much is being charged right now — same logic for rooms and halls */
  const amountNow = splitChoice === "half"
    ? Math.ceil(totalAmount / 2)
    : splitChoice === "full"
      ? totalAmount
      : 0

  const amountAtEvent = totalAmount - amountNow

  const isCard = method === "credit_card" || method === "debit_card"
  const isUpi  = method === "upi"

  /* Persist to parent */
  React.useEffect(() => {
    onSave({ splitChoice, method, cardNumber, expiry, cvv, cardName, upiId })
  }, [splitChoice, method, cardNumber, expiry, cvv, cardName, upiId])

  const handleCardNumber = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 16)
    setCardNumber(d.replace(/(.{4})/g, "$1 ").trim())
  }
  const handleExpiry = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4)
    setExpiry(d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d)
  }

  const handleSubmit = () => {
    setPayErr("")
    if (!splitChoice) return setPayErr("Please select how much you'd like to pay now.")
    if (!method)      return setPayErr("Please select a payment method.")
    if (isCard) {
      if (cardNumber.replace(/\s/g, "").length < 16) return setPayErr("Enter a valid 16-digit card number.")
      if (expiry.length < 5)       return setPayErr("Enter expiry date (MM/YY).")
      if (!isExpiryValid(expiry))  return setPayErr("Invalid or expired card.")
      if (cvv.length < 3)          return setPayErr("Enter a valid CVV.")
      if (!cardName.trim())        return setPayErr("Enter the cardholder name.")
    }
    if (isUpi && !upiId.includes("@")) return setPayErr("Enter a valid UPI ID (e.g. name@upi).")

    const paymentDetails = {
      method,
      splitChoice,
      ...(isCard && { cardNumber, cardName, expiry }),
      ...(isUpi  && { upiId }),
    }
    onConfirm({ amountPaid: amountNow, paymentDetails })
  }

  const availableMethods = PAYMENT_METHODS

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 pb-4" style={{ borderBottom:"1px solid rgba(255,255,255,.07)" }}>
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gold hover:bg-gold/10 transition text-lg"
          style={{ border:"1px solid rgba(201,168,76,.25)" }}
        >←</button>
        <div>
          <p className="text-cream font-semibold text-sm font-display">
            {isHall ? "Venue Payment" : "Secure Your Booking"}
          </p>
          <p className="text-resort-dim text-[11px]">
            Choose your payment split and method
          </p>
        </div>
      </div>

      {/* ── AMOUNT SUMMARY ── */}
      <div
        className="rounded-xl p-4"
        style={{ background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.12)" }}
      >
        <div className="flex justify-between text-sm mb-2">
          <span className="text-resort-muted">
            {isHall
              ? `₹${fmt(bookingData.pricePerNight || 0)} × ${bookingData.nights || 1} day${(bookingData.nights || 1) !== 1 ? "s" : ""}`
              : `₹${fmt(room?.price_per_night || 0)} × ${bookingData.nights || 1} night${(bookingData.nights || 1) !== 1 ? "s" : ""}`}
          </span>
          <span className="text-cream font-semibold">₹{fmt(totalAmount)}</span>
        </div>

        {splitChoice && (
          <>
            <div className="flex justify-between text-sm mb-1" style={{ color:"rgba(255,255,255,0.35)" }}>
              <span>Paying now ({splitChoice === "half" ? "50%" : "100%"})</span>
              <span className="text-gold font-bold">₹{fmt(amountNow)}</span>
            </div>
            {amountAtEvent > 0 && (
              <div className="flex justify-between text-sm" style={{ color:"rgba(255,255,255,0.3)" }}>
                <span>{isHall ? "Due on first event day (50%)" : "Due at check-in (50%)"}</span>
                <span>₹{fmt(amountAtEvent)}</span>
              </div>
            )}
          </>
        )}

        <div
          className="flex justify-between font-bold pt-2 mt-2"
          style={{ borderTop:"1px solid rgba(201,168,76,.12)" }}
        >
          <span className="text-cream">
            {splitChoice ? "Charging Now" : "Total Amount"}
          </span>
          <span className="text-gold text-base">₹{fmt(splitChoice ? amountNow : totalAmount)}</span>
        </div>
      </div>

      {/* ── SPLIT SELECTOR — rooms and halls both use it ── */}
      <SplitSelector
        totalAmount={totalAmount}
        splitChoice={splitChoice}
        onSelect={setSplitChoice}
        isHall={isHall}
      />

      {/* ── PAYMENT METHOD SELECTOR ── */}
      <div>
        <p className="text-resort-muted text-[11px] uppercase tracking-widest mb-3">
          Payment Method
        </p>
        <div className="space-y-2">
          {availableMethods.map(pm => (
            <button
              key={pm.id}
              onClick={() => setMethod(pm.id)}
              className="method-row w-full flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                background: method === pm.id ? "rgba(201,168,76,.1)" : "rgba(255,255,255,.03)",
                border: `1px solid ${method === pm.id ? "rgba(201,168,76,.4)" : "rgba(255,255,255,.08)"}`,
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border:`2px solid ${method === pm.id ? "#C9A84C" : "rgba(255,255,255,.2)"}` }}
              >
                {method === pm.id && (
                  <div className="w-2 h-2 rounded-full" style={{ background:"#C9A84C" }}/>
                )}
              </div>
              <span className="text-lg">{pm.icon}</span>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${method === pm.id ? "text-gold" : "text-cream"}`}>{pm.label}</p>
                <p className="text-resort-dim text-[10px]">{pm.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── CARD FORM ── */}
      {isCard && (
        <div
          className="space-y-3 rounded-xl p-4"
          style={{ background:"rgba(201,168,76,.04)", border:"1px solid rgba(201,168,76,.12)" }}
        >
          <p className="text-gold text-[11px] uppercase tracking-widest font-semibold">
            {method === "credit_card" ? "Credit" : "Debit"} Card Details
          </p>
          <div>
            <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">Card Number</label>
            <input value={cardNumber} onChange={e => handleCardNumber(e.target.value)}
              placeholder="1234 5678 9012 3456" maxLength={19}
              className="f-input w-full text-sm tracking-widest" />
          </div>
          <div>
            <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">Cardholder Name</label>
            <input value={cardName} onChange={e => setCardName(e.target.value)}
              placeholder="Name on card" className="f-input w-full text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">Expiry</label>
              <input value={expiry} onChange={e => handleExpiry(e.target.value)}
                placeholder="MM/YY" maxLength={5}
                className={`f-input w-full text-sm ${expiry.length === 5 && !isExpiryValid(expiry) ? "border-red-500/60" : ""}`} />
              {expiry.length === 5 && !isExpiryValid(expiry) && (
                <p className="text-red-400 text-[10px] mt-1">Card expired</p>
              )}
            </div>
            <div>
              <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">CVV</label>
              <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").slice(0,3))}
                placeholder="•••" maxLength={3} type="password" className="f-input w-full text-sm" />
            </div>
          </div>
          <div className="flex gap-3 items-center pt-1 flex-wrap">
            {[CardLogos.VISA, CardLogos.MASTERCARD, CardLogos.RUPAY, CardLogos.AMEX].map((Logo, i) => (
              <div key={i} className="flex items-center justify-center px-2 py-1.5 rounded"
                style={{ background:"#ffffff", border:"1px solid rgba(255,255,255,.3)" }}>
                {Logo}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── UPI FORM ── */}
      {isUpi && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background:"rgba(201,168,76,.04)", border:"1px solid rgba(201,168,76,.12)" }}
        >
          <p className="text-gold text-[11px] uppercase tracking-widest font-semibold">UPI Details</p>
          <div>
            <label className="block text-resort-muted text-[11px] mb-1 uppercase tracking-widest">UPI ID</label>
            <input value={upiId} onChange={e => setUpiId(e.target.value)}
              placeholder="yourname@upi" className="f-input w-full text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap pt-1">
            {UpiLogos.map(app => (
              <div key={app.name}
                className="flex items-center justify-center px-2.5 py-1.5 rounded-lg"
                style={{ background:"#ffffff", border:"1px solid rgba(255,255,255,.3)" }}
                title={app.name}>
                {app.svg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CANCELLATION POLICY ── */}
      <CancellationPolicyBlock
        isHall={isHall}
        totalAmount={totalAmount}
        amountBeingPaid={amountNow}
        pricePerDay={bookingData.pricePerNight || room?.price_per_night || 0}
        daysBooked={bookingData.daysBooked || bookingData.daysNeeded || 1}
      />

      {/* ── ERROR ── */}
      {(payErr || error) && (
        <p
          className="text-red-400 text-xs px-3 py-2 rounded-lg"
          style={{ background:"rgba(255,80,80,.08)", border:"1px solid rgba(255,80,80,.2)" }}
        >
          ⚠ {payErr || error}
        </p>
      )}

      {/* ── SUBMIT BUTTON ── */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-3.5 rounded-xl gold-btn font-bold text-sm tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ color:"#0E0C09" }}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".3"/>
              <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Confirming…
          </span>
        ) : amountNow > 0
          ? `Pay ₹${fmt(amountNow)} & Confirm`
          : "Select payment options above"}
      </button>

      <p className="text-resort-dim text-[11px] text-center flex items-center justify-center gap-1">
        <LockIcon size={14} color="#C9A84C" />
        Secured by 256-bit encryption · No hidden charges
      </p>
    </div>
  )
}