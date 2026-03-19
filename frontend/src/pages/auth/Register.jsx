import React, { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"
import resortBg from "../../assets/resort.jpg"
import resortRoom from "../../assets/resort_room.jpg"
import resortRestaurant from "../../assets/resort_restaurant.jpg"
import SlideshowBg from "../../components/SlideshowBg"

/* ════════════════════════════════════════════════════════
   SVG ICONS
════════════════════════════════════════════════════════ */
const IconPerson = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconMail = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const IconLock = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)
const IconEye = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)
const IconEyeOff = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)
const IconPhone = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.67 3.4 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.79-.79a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16v.92z"/>
  </svg>
)
const IconMap = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconCity = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

/* ════════════════════════════════════════════════════════
   SLIDESHOW BACKGROUND — Ken Burns + blur crossfade
════════════════════════════════════════════════════════ */
// function SlideshowBg() {
//   const images = [resortBg, resortRoom, resortRestaurant]
//   const [current, setCurrent] = useState(0)
//   const [prev, setPrev] = useState(null)
//   const [transitioning, setTransitioning] = useState(false)

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTransitioning(true)
//       setPrev(current)
//       setCurrent(c => (c + 1) % images.length)
//       setTimeout(() => {
//         setPrev(null)
//         setTransitioning(false)
//       }, 1800)
//     }, 6000)
//     return () => clearInterval(interval)
//   }, [current])

//   const kenBurnsVariants = [
//     { from: "scale(1.08) translate(0,0)",    to: "scale(1.18) translate(-2%,-1%)" },
//     { from: "scale(1.1) translate(2%,0)",    to: "scale(1.18) translate(-1%,2%)"  },
//     { from: "scale(1.05) translate(-1%,2%)", to: "scale(1.15) translate(2%,-2%)"  },
//   ]

//   return (
//     <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
//       {/* Previous slide — fading out + blurring */}
//       {prev !== null && (
//         <div
//           key={`prev-${prev}`}
//           style={{
//             position: "absolute", inset: 0,
//             backgroundImage: `url(${images[prev]})`,
//             backgroundSize: "cover",
//             backgroundPosition: "center",
//             animation: `slideOut 1.8s ease-in-out forwards`,
//           }}
//         />
//       )}

//       {/* Current slide — fading in + Ken Burns zoom */}
//       <div
//         key={`curr-${current}`}
//         style={{
//           position: "absolute", inset: 0,
//           backgroundImage: `url(${images[current]})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           animation: `slideIn 1.8s ease-in-out forwards, kenBurns${current} 7.8s ease-in-out forwards`,
//           transform: kenBurnsVariants[current].from,
//         }}
//       />

//       {/* Dark overlay — deeper at bottom */}
//       <div style={{
//         position: "absolute", inset: 0,
//         background: `
//           linear-gradient(
//             to bottom,
//             rgba(5,2,1,0.45) 0%,
//             rgba(8,4,2,0.55) 40%,
//             rgba(5,2,1,0.75) 100%
//           )
//         `,
//         zIndex: 1,
//       }} />

//       {/* Subtle vignette */}
//       <div style={{
//         position: "absolute", inset: 0,
//         background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)`,
//         zIndex: 2,
//       }} />

//       {/* Slide dots indicator */}
//       <div style={{
//         position: "absolute", bottom: "28px", left: "50%",
//         transform: "translateX(-50%)",
//         display: "flex", gap: "8px", zIndex: 10,
//       }}>
//         {images.map((_, i) => (
//           <div key={i} style={{
//             width: i === current ? "24px" : "6px",
//             height: "6px",
//             borderRadius: "3px",
//             background: i === current ? "rgba(201,169,110,0.8)" : "rgba(201,169,110,0.25)",
//             transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)",
//           }}/>
//         ))}
//       </div>

//       <style>{`
//         @keyframes slideIn {
//           from { opacity: 0; filter: blur(12px); }
//           to   { opacity: 1; filter: blur(0px); }
//         }
//         @keyframes slideOut {
//           from { opacity: 1; filter: blur(0px); }
//           to   { opacity: 0; filter: blur(14px); }
//         }
//         @keyframes kenBurns0 {
//           from { transform: scale(1.08) translate(0,0); }
//           to   { transform: scale(1.18) translate(-2%,-1%); }
//         }
//         @keyframes kenBurns1 {
//           from { transform: scale(1.1) translate(2%,0); }
//           to   { transform: scale(1.18) translate(-1%,2%); }
//         }
//         @keyframes kenBurns2 {
//           from { transform: scale(1.05) translate(-1%,2%); }
//           to   { transform: scale(1.15) translate(2%,-2%); }
//         }
//       `}</style>
//     </div>
//   )
// }

/* ════════════════════════════════════════════════════════
   OTP DIGIT BOXES
════════════════════════════════════════════════════════ */
function OtpBoxes({ value, onChange, disabled }) {
  const inputs = useRef([])
  const digits = (value + "      ").slice(0, 6).split("")

  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      const next = [...digits]
      if (next[i] !== " ") { next[i] = " " }
      else if (i > 0) { next[i - 1] = " "; inputs.current[i - 1]?.focus() }
      onChange(next.join("").trimEnd())
      return
    }
    if (/^\d$/.test(e.key)) {
      const next = [...digits]
      next[i] = e.key
      onChange(next.join("").replace(/ /g, ""))
      if (i < 5) inputs.current[i + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "4px 0 28px" }}>
      {digits.map((d, i) => {
        const filled = d && d !== " "
        return (
          <input
            key={i}
            ref={el => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? d : ""}
            onChange={() => {}}
            onKeyDown={e => handleKey(e, i)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: "48px", height: "56px",
              textAlign: "center",
              fontSize: "22px",
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              background: filled
                ? "rgba(201,169,110,0.18)"
                : "rgba(255,255,255,0.06)",
              backdropFilter: "blur(4px)",
              border: `1px solid ${filled ? "rgba(201,169,110,0.7)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: "6px",
              color: "#f5edd8",
              outline: "none",
              transition: "all 0.2s",
              opacity: disabled ? 0.4 : 1,
              caretColor: "#c9a96e",
              WebkitTextFillColor: "#f5edd8",
              boxShadow: filled ? "0 0 12px rgba(201,169,110,0.15)" : "none",
            }}
          />
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   FIELD — glassmorphic, no autofill color
════════════════════════════════════════════════════════ */
function Field({ label, name, type = "text", value, onChange, required, IconLeft, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0
  const active = focused || filled

  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: "14px",
        top: "50%", transform: "translateY(-50%)",
        opacity: active ? 1 : 0.5,
        display: "flex", alignItems: "center",
        pointerEvents: "none", zIndex: 2,
        transition: "opacity 0.2s",
      }}>
        <IconLeft color={focused ? "#e8c980" : "rgba(201,169,110,0.7)"} />
      </span>

      <label style={{
        position: "absolute",
        left: "44px",
        top: active ? "7px" : "50%",
        transform: active ? "none" : "translateY(-50%)",
        fontSize: active ? "9px" : "13.5px",
        color: focused ? "#e8c980" : active ? "rgba(201,169,110,0.8)" : "rgba(220,200,160,0.4)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
        letterSpacing: active ? "0.14em" : "0.06em",
        textTransform: "uppercase",
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 500,
        zIndex: 2,
      }}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="new-password"
        style={{
          width: "100%",
          height: "56px",
          paddingTop: "20px",
          paddingBottom: "6px",
          paddingLeft: "44px",
          paddingRight: rightSlot ? "46px" : "14px",
          background: focused
            ? "rgba(201,169,110,0.1)"
            : "rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: `1px solid ${focused ? "rgba(201,169,110,0.55)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "8px",
          color: "#f5edd8",
          fontSize: "15px",
          fontFamily: "'Cormorant Garamond', serif",
          outline: "none",
          transition: "all 0.22s",
          boxSizing: "border-box",
          WebkitTextFillColor: "#f5edd8",
          WebkitBoxShadow: "0 0 0px 1000px rgba(10,5,2,0.01) inset",
          caretColor: "#c9a96e",
          boxShadow: focused ? "0 0 0 3px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.06)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      />

      {rightSlot && (
        <span style={{
          position: "absolute", right: "14px",
          top: "50%", transform: "translateY(-50%)",
          display: "flex", alignItems: "center",
          cursor: "pointer", zIndex: 2,
        }}>
          {rightSlot}
        </span>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   PASSWORD FIELD
════════════════════════════════════════════════════════ */
function PasswordField({ label, name, value, onChange, required }) {
  const [show, setShow] = useState(false)
  return (
    <Field
      label={label}
      name={name}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      required={required}
      IconLeft={IconLock}
      rightSlot={
        <span
          onClick={() => setShow(s => !s)}
          style={{ display: "flex", opacity: 0.5, transition: "opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
        >
          {show ? <IconEyeOff color="#c9a96e" /> : <IconEye color="#c9a96e" />}
        </span>
      }
    />
  )
}

/* ════════════════════════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════════════════════════ */
function Steps({ current }) {
  const labels = ["Your Details", "Verify Email"]
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "32px" }}>
      {labels.map((lbl, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: i < current
                ? "linear-gradient(135deg,#c9a96e,#9e7035)"
                : i === current
                ? "rgba(201,169,110,0.12)"
                : "rgba(255,255,255,0.05)",
              backdropFilter: "blur(6px)",
              border: `1.5px solid ${i <= current ? "rgba(201,169,110,0.7)" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: i < current ? "#160b05" : i === current ? "#e8c980" : "rgba(255,255,255,0.25)",
              fontWeight: 700, fontSize: "13px",
              fontFamily: "'Playfair Display', serif",
              transition: "all 0.4s",
              boxShadow: i === current
                ? "0 0 0 4px rgba(201,169,110,0.12), 0 4px 12px rgba(201,169,110,0.15)"
                : i < current
                ? "0 4px 12px rgba(201,169,110,0.2)"
                : "none",
            }}>
              {i < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#160b05" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : i + 1}
            </div>
            <span style={{
              fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase",
              color: i === current ? "rgba(201,169,110,0.85)" : "rgba(255,255,255,0.2)",
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 500,
            }}>{lbl}</span>
          </div>
          {i < labels.length - 1 && (
            <div style={{
              width: "80px", height: "1px",
              margin: "0 10px", marginBottom: "22px",
              background: i < current
                ? "linear-gradient(90deg, rgba(201,169,110,0.8), rgba(158,112,53,0.6))"
                : "rgba(255,255,255,0.08)",
              transition: "background 0.6s",
            }}/>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN REGISTER
════════════════════════════════════════════════════════ */
export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneno: "", address: "", city: "" })
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState({ msg: "", type: "gold" })
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const showToast = (msg, type = "gold") => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: "", type: "gold" }), 3500)
  }

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSendOtp = async (e) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      await axios.post("http://localhost:5000/api/customer/send-otp", { email: form.email })
      setStep(1); setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP")
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError(""); setLoading(true)
    try {
      await axios.post("http://localhost:5000/api/customer/send-otp", { email: form.email })
      setOtp(""); setCountdown(60)
      showToast("Verification code resent to your inbox")
    } catch (err) {
      setError(err.response?.data?.message || "Resend failed")
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setError("Please enter the complete 6-digit code"); return }
    setError(""); setLoading(true)
    try {
      const res = await axios.post("http://localhost:5000/api/customer/verify-otp", { ...form, otp })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)
      localStorage.setItem("name", res.data.name)
      showToast("Welcome to Royal Palace Resort ✦", "green")
      setTimeout(() => navigate("/"), 1800)
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed")
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* kill autofill highlight */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(15, 8, 3, 0.7) inset !important;
          -webkit-text-fill-color: #f5edd8 !important;
          caret-color: #c9a96e !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        .rp-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          font-family: 'Cormorant Garamond', serif;
          position: relative;
          overflow: hidden;
        }

        /* ── GLASS CARD ── */
        .rp-card {
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 20;
          /* true glassmorphism */
          background: rgba(12, 6, 2, 0.55);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(201,169,110,0.25);
          border-radius: 16px;
          padding: 50px 48px 44px;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 40px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(201,169,110,0.06),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.04),
            inset -1px 0 0 rgba(255,255,255,0.04);
        }

        /* inner shimmer frame */
        .rp-frame {
          position: absolute; inset: 10px;
          border: 1px solid rgba(201,169,110,0.08);
          border-radius: 8px; pointer-events: none;
        }

        /* corner brackets */
        .rp-bracket {
          position: absolute; width: 20px; height: 20px;
          border-color: rgba(201,169,110,0.35); border-style: solid;
        }
        .rp-bracket.tl { top: 9px; left: 9px; border-width: 1.5px 0 0 1.5px; border-radius: 8px 0 0 0; }
        .rp-bracket.tr { top: 9px; right: 9px; border-width: 1.5px 1.5px 0 0; border-radius: 0 8px 0 0; }
        .rp-bracket.bl { bottom: 9px; left: 9px; border-width: 0 0 1.5px 1.5px; border-radius: 0 0 0 8px; }
        .rp-bracket.br { bottom: 9px; right: 9px; border-width: 0 1.5px 1.5px 0; border-radius: 0 0 8px 0; }

        /* card top gloss */
        .rp-card::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          border-radius: 50%;
        }

        /* header */
        .rp-crown { text-align: center; margin-bottom: 8px; }
        .rp-crown svg { filter: drop-shadow(0 2px 10px rgba(201,169,110,0.5)); }

        .rp-eyebrow {
          text-align: center; font-size: 14px;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: #f8f0e0; margin-bottom: 8px;
        }
        .rp-title {
          text-align: center;
          font-family: 'Playfair Display', serif;
          font-size: 30px; font-weight: 600;
          color: rgb(201, 169, 110);
          line-height: 1.15; margin-bottom: 32px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }

        /* form layout */
        .rp-fields { display: flex; flex-direction: column; gap: 12px; }
        .rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* gold button */
        .rp-btn {
          width: 100%; margin-top: 26px;
          padding: 16px;
          background: linear-gradient(135deg, #c9a96e 0%, #a07838 50%, #d4b478 100%);
          background-size: 200% auto;
          border: none; border-radius: 8px;
          color: #160b05;
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.35em; text-transform: uppercase;
          cursor: pointer;
          transition: background-position 0.4s, box-shadow 0.3s, transform 0.15s;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 20px rgba(201,169,110,0.25), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .rp-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 55%);
          pointer-events: none;
        }
        .rp-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 32px rgba(201,169,110,0.4), 0 0 0 1px rgba(201,169,110,0.3);
          transform: translateY(-2px);
        }
        .rp-btn:active:not(:disabled) { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ghost button */
        .rp-btn-ghost {
          width: 100%; margin-top: 10px; padding: 14px;
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(220,200,160,0.45);
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px; letter-spacing: 0.25em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .rp-btn-ghost:hover { border-color: rgba(201,169,110,0.3); color: rgba(201,169,110,0.7); background: rgba(201,169,110,0.06); }

        /* error */
        .rp-error {
          display: flex; align-items: flex-start; gap: 10px;
          background: rgba(180,50,30,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(200,70,50,0.25);
          border-left: 3px solid rgba(220,80,60,0.7);
          color: #d07868; padding: 11px 14px;
          font-size: 13px; border-radius: 6px;
          margin-bottom: 18px; line-height: 1.5;
          animation: fadeUp 0.2s ease;
        }

        /* toast */
        .rp-toast {
          position: fixed; bottom: 30px; left: 50%;
          transform: translateX(-50%);
          display: flex; align-items: center; gap: 10px;
          padding: 14px 26px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px; letter-spacing: 0.06em;
          border-radius: 8px; white-space: nowrap; z-index: 999;
          backdrop-filter: blur(20px);
          animation: toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .rp-toast.gold {
          background: rgba(20,10,3,0.85);
          border: 1px solid rgba(201,169,110,0.4);
          color: #d4b46a;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(201,169,110,0.1);
        }
        .rp-toast.green {
          background: rgba(5,20,5,0.85);
          border: 1px solid rgba(80,180,80,0.4);
          color: #80d080;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(18px) scale(0.93); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        /* OTP hint */
        .rp-otp-hint {
          text-align: center;
          color: rgba(220,200,160,0.45);
          font-size: 14px; line-height: 1.8; margin-bottom: 28px;
          font-style: italic;
        }
        .rp-otp-hint strong { color: rgba(201,169,110,0.85); font-style: normal; font-weight: 500; }

        /* resend */
        .rp-resend {
          text-align: center; margin-top: 18px;
          font-size: 13px; color: rgba(201,169,110,0.28); letter-spacing: 0.04em;
        }
        .rp-resend-btn {
          background: none; border: none; padding: 0;
          font-family: 'Cormorant Garamond', serif; font-size: 13px;
          color: rgba(201,169,110,0.6); cursor: pointer;
          border-bottom: 1px solid rgba(201,169,110,0.25);
          transition: all 0.2s; letter-spacing: 0.04em;
        }
        .rp-resend-btn:hover:not(:disabled) { color: #c9a96e; border-bottom-color: rgba(201,169,110,0.6); }
        .rp-resend-btn:disabled { color: rgba(201,169,110,0.22); border-bottom-color: transparent; cursor: default; }

        /* bottom link */
        .rp-bottom {
          text-align: center; margin-top: 22px;
          font-size: 15px; color: rgba(221, 217, 217, 0.91); letter-spacing: 0.06em;
        }
        .rp-link { color: rgba(242, 218, 174, 0.6); text-decoration: underline; transition: color 0.2s; }
        .rp-link:hover { color: #c9a96e; }

        /* divider */
        .rp-divider {
          display: flex; align-items: center; gap: 14px;
          color: rgba(255,255,255,0.1); font-size: 10px; letter-spacing: 0.4em;
          text-transform: uppercase; margin-top: 22px;
        }
        .rp-divider::before, .rp-divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.07);
        }

        /* spinner */
        .rp-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(22,11,5,0.3); border-top-color: rgba(22,11,5,0.8);
          border-radius: 50%; animation: spin 0.7s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* verified badge */
        .rp-verified {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(40,100,40,0.15);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(80,160,80,0.25);
          color: #78c878; padding: 7px 16px;
          border-radius: 100px; font-size: 12px;
          letter-spacing: 0.08em; margin-bottom: 18px;
        }

        .fade-up { animation: fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 540px) {
          .rp-card { padding: 38px 24px 34px; }
          .rp-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── SLIDESHOW BACKGROUND ── */}
      <SlideshowBg />

      <div className="rp-root">
        <div className="rp-card fade-up">
          <div className="rp-frame" />
          <div className="rp-bracket tl"/><div className="rp-bracket tr"/>
          <div className="rp-bracket bl"/><div className="rp-bracket br"/>

          {/* Crown */}
          <div className="rp-crown">
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
              <path d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z"
                fill="none" stroke="#c9a96e" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="16" cy="2" r="1.8" fill="#c9a96e"/>
              <circle cx="6" cy="9" r="1.4" fill="#c9a96e"/>
              <circle cx="26" cy="9" r="1.4" fill="#c9a96e"/>
            </svg>
          </div>

          <p className="rp-eyebrow">Royal Palace Resort</p>
          <h1 className="rp-title">
            {step === 0 ? "Create Account" : "Verify Your Email"}
          </h1>

          <Steps current={step} />

          {error && (
            <div className="rp-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* ── STEP 0 ── */}
          {step === 0 && (
            <form onSubmit={handleSendOtp} className="fade-up">
              <div className="rp-fields">
                <Field label="Full Name"      name="name"     value={form.name}     onChange={onChange} required IconLeft={IconPerson} />
                <Field label="Email Address"  name="email"    type="email" value={form.email}    onChange={onChange} required IconLeft={IconMail} />
                <PasswordField label="Password" name="password" value={form.password} onChange={onChange} required />
                <Field label="Phone Number"   name="phoneno"  value={form.phoneno}  onChange={onChange} required IconLeft={IconPhone} />
                <div className="rp-row">
                  <Field label="Address" name="address" value={form.address} onChange={onChange} required IconLeft={IconMap} />
                  <Field label="City"    name="city"    value={form.city}    onChange={onChange} required IconLeft={IconCity} />
                </div>
              </div>

              <button type="submit" className="rp-btn" disabled={loading}>
                {loading ? <><span className="rp-spinner"/>Sending Code…</> : "Send Verification Code →"}
              </button>

              <div className="rp-divider">or</div>
              <p className="rp-bottom">
                Already a member?&nbsp;
                <Link to="/login" className="rp-link">Sign In</Link>
              </p>
            </form>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleRegister} className="fade-up">
              <div style={{ textAlign: "center", marginBottom: "18px" }}>
                <span className="rp-verified">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Code sent successfully
                </span>
              </div>

              <p className="rp-otp-hint">
                Enter the 6-digit code sent to<br/>
                <strong>{form.email}</strong>
              </p>

              <OtpBoxes value={otp} onChange={setOtp} disabled={loading} />

              <button type="submit" className="rp-btn" disabled={loading || otp.length !== 6}>
                {loading ? <><span className="rp-spinner"/>Creating Account…</> : "Complete Registration ✦"}
              </button>

              <button type="button" className="rp-btn-ghost"
                onClick={() => { setStep(0); setError(""); setOtp("") }}>
                ← Back to Details
              </button>

              <div className="rp-resend">
                Didn't receive it?&nbsp;
                <button type="button" className="rp-resend-btn"
                  disabled={countdown > 0 || loading} onClick={handleResend}>
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {toast.msg && (
        <div className={`rp-toast ${toast.type}`}>
          {toast.type === "green"
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.67 3.4 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.5 5.5l.79-.79a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16v.92z"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  )
}