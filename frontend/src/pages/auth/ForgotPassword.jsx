// src/pages/auth/ForgotPassword.jsx
// Fully responsive — fluid card padding, OTP boxes scale on mobile,
// step bar condenses, slideshow bg works at all sizes
import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://resort-management-system.onrender.com/api"

/* ── Icons ── */
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
const IconCheck = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)

/* ── Slideshow Background ── */
function SlideshowBg({ images }) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % images.length)
      setTimeout(() => setPrev(null), 1800)
    }, 6000)
    return () => clearInterval(interval)
  }, [current])

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden" }}>
      {prev !== null && (
        <div key={`prev-${prev}`} style={{ position:"absolute", inset:0,
          backgroundImage:`url(${images[prev]})`, backgroundSize:"cover", backgroundPosition:"center",
          animation:"slideOut 1.8s ease-in-out forwards" }}/>
      )}
      <div key={`curr-${current}`} style={{ position:"absolute", inset:0,
        backgroundImage:`url(${images[current]})`, backgroundSize:"cover", backgroundPosition:"center",
        animation:`slideIn 1.8s ease-in-out forwards, kenBurns${current} 7.8s ease-in-out forwards` }}/>
      <div style={{ position:"absolute", inset:0, zIndex:1,
        background:`linear-gradient(to bottom,rgba(5,2,1,0.45) 0%,rgba(8,4,2,0.55) 40%,rgba(5,2,1,0.75) 100%)` }}/>
      <div style={{ position:"absolute", inset:0, zIndex:2,
        background:`radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.55) 100%)` }}/>
      <div style={{ position:"absolute", bottom:"clamp(16px,3vw,28px)", left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:"8px", zIndex:10 }}>
        {images.map((_, i) => (
          <div key={i} style={{ width:i===current?"24px":"6px", height:"6px", borderRadius:"3px",
            background:i===current?"rgba(201,169,110,0.8)":"rgba(201,169,110,0.25)",
            transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)" }}/>
        ))}
      </div>
      <style>{`
        @keyframes slideIn  { from{opacity:0;filter:blur(12px)} to{opacity:1;filter:blur(0px)} }
        @keyframes slideOut { from{opacity:1;filter:blur(0px)}  to{opacity:0;filter:blur(14px)} }
        @keyframes kenBurns0 { from{transform:scale(1.08) translate(0,0)}    to{transform:scale(1.18) translate(-2%,-1%)} }
        @keyframes kenBurns1 { from{transform:scale(1.1)  translate(2%,0)}   to{transform:scale(1.18) translate(-1%,2%)} }
        @keyframes kenBurns2 { from{transform:scale(1.05) translate(-1%,2%)} to{transform:scale(1.15) translate(2%,-2%)} }
      `}</style>
    </div>
  )
}

/* ── Floating Label Field ── */
function Field({ label, name, type="text", value, onChange, required, IconLeft, rightSlot, disabled }) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0
  const active = focused || filled

  return (
    <div style={{ position:"relative" }}>
      <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:active?1:0.5,
        display:"flex", alignItems:"center", pointerEvents:"none", zIndex:2, transition:"opacity 0.2s" }}>
        <IconLeft color={focused?"#e8c980":"rgba(201,169,110,0.7)"}/>
      </span>
      <label style={{ position:"absolute", left:"44px", top:active?"7px":"50%",
        transform:active?"none":"translateY(-50%)", fontSize:active?"9px":"clamp(12px,1.5vw,13.5px)",
        color:focused?"#e8c980":active?"rgba(201,169,110,0.8)":"rgba(220,200,160,0.4)",
        transition:"all 0.22s cubic-bezier(0.4,0,0.2,1)", pointerEvents:"none",
        letterSpacing:active?"0.14em":"0.06em", textTransform:"uppercase",
        fontFamily:"'Cormorant Garamond', serif", fontWeight:500, zIndex:2 }}>
        {label}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        disabled={disabled} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete="new-password"
        style={{ width:"100%", height:"56px", paddingTop:"20px", paddingBottom:"6px",
          paddingLeft:"44px", paddingRight:rightSlot?"46px":"14px",
          background:disabled?"rgba(255,255,255,0.02)":focused?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.06)",
          backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
          border:`1px solid ${focused?"rgba(201,169,110,0.55)":"rgba(255,255,255,0.1)"}`,
          borderRadius:"8px", color:disabled?"rgba(245,237,216,0.4)":"#f5edd8",
          fontSize:"clamp(13px,1.5vw,15px)", fontFamily:"'Cormorant Garamond', serif",
          outline:"none", transition:"all 0.22s", boxSizing:"border-box",
          WebkitTextFillColor:disabled?"rgba(245,237,216,0.4)":"#f5edd8",
          WebkitBoxShadow:"0 0 0px 1000px rgba(10,5,2,0.01) inset", caretColor:"#c9a96e",
          boxShadow:focused?"0 0 0 3px rgba(201,169,110,0.08), inset 0 1px 0 rgba(255,255,255,0.06)":"inset 0 1px 0 rgba(255,255,255,0.04)" }}
      />
      {rightSlot && (
        <span style={{ position:"absolute", right:"14px", top:"50%", transform:"translateY(-50%)",
          display:"flex", alignItems:"center", cursor:"pointer", zIndex:2 }}>
          {rightSlot}
        </span>
      )}
    </div>
  )
}

function PasswordField({ label="New Password", name="password", value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <Field label={label} name={name} type={show?"text":"password"} value={value} onChange={onChange} required IconLeft={IconLock}
      rightSlot={
        <span onClick={() => setShow(s=>!s)} style={{ display:"flex", opacity:0.5, transition:"opacity 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
          {show ? <IconEyeOff color="#c9a96e"/> : <IconEye color="#c9a96e"/>}
        </span>
      }
    />
  )
}

/* ── OTP Input — responsive box sizes ── */
function OtpInput({ value, onChange }) {
  const inputs = useRef([])
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6)

  const handleKey = (e, i) => {
    if (e.key === "Backspace") {
      if (digits[i]) { const next=[...digits]; next[i]=""; onChange(next.join("")) }
      else if (i > 0) { inputs.current[i-1]?.focus(); const next=[...digits]; next[i-1]=""; onChange(next.join("")) }
      return
    }
    if (e.key==="ArrowLeft"  && i>0) { inputs.current[i-1]?.focus(); return }
    if (e.key==="ArrowRight" && i<5) { inputs.current[i+1]?.focus(); return }
  }

  const handleChange = (e, i) => {
    const raw = e.target.value.replace(/\D/g,"")
    if (!raw) return
    if (raw.length > 1) {
      const pasted = raw.slice(0,6)
      onChange(pasted.padEnd(6,"").slice(0,6))
      inputs.current[Math.min(pasted.length,5)]?.focus()
      return
    }
    const next=[...digits]; next[i]=raw[0]; onChange(next.join(""))
    if (i<5) inputs.current[i+1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6)
    onChange(pasted.padEnd(6,"").slice(0,6).trimEnd())
    inputs.current[Math.min(pasted.length,5)]?.focus()
  }

  return (
    /* gap and box size scale with viewport */
    <div style={{ display:"flex", gap:"clamp(5px,1.5vw,10px)", justifyContent:"center" }}>
      {digits.map((d, i) => (
        <input key={i} ref={el=>inputs.current[i]=el}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e=>handleChange(e,i)} onKeyDown={e=>handleKey(e,i)}
          onPaste={handlePaste} onFocus={e=>e.target.select()}
          style={{ width:"clamp(36px,10vw,48px)", height:"clamp(46px,11vw,58px)",
            textAlign:"center", fontSize:"clamp(18px,4vw,22px)", fontWeight:"600",
            fontFamily:"'Cormorant Garamond', serif",
            color:d?"#f5edd8":"transparent",
            background:d?"rgba(201,169,110,0.12)":"rgba(255,255,255,0.05)",
            border:`1px solid ${d?"rgba(201,169,110,0.5)":"rgba(255,255,255,0.1)"}`,
            borderRadius:"8px", outline:"none", caretColor:"#c9a96e",
            transition:"all 0.2s", boxShadow:d?"0 0 0 3px rgba(201,169,110,0.08)":"none" }}
        />
      ))}
    </div>
  )
}

/* ── Step Bar — condenses on very small screens ── */
function StepBar({ step }) {
  const steps = ["Email", "Verify OTP", "New Password"]
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      marginBottom:"clamp(18px,3vw,28px)", gap:0 }}>
      {steps.map((label, i) => {
        const done   = i < step
        const active = i === step
        return (
          <React.Fragment key={i}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
              <div style={{ width:"clamp(22px,5vw,28px)", height:"clamp(22px,5vw,28px)", borderRadius:"50%",
                background:done?"linear-gradient(135deg,#c9a96e,#a07838)":active?"rgba(201,169,110,0.18)":"rgba(255,255,255,0.06)",
                border:`1px solid ${done||active?"rgba(201,169,110,0.6)":"rgba(255,255,255,0.1)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.4s", boxShadow:active?"0 0 14px rgba(201,169,110,0.3)":"none" }}>
                {done ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#160b05" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <span style={{ fontSize:"clamp(9px,1.5vw,11px)", color:active?"#c9a96e":"rgba(255,255,255,0.3)",
                    fontFamily:"'Cormorant Garamond', serif", fontWeight:600 }}>{i+1}</span>
                )}
              </div>
              {/* Hide labels on very small screens */}
              <span style={{ fontSize:"clamp(8px,1.2vw,9px)", letterSpacing:"0.12em", textTransform:"uppercase",
                color:done||active?"rgba(201,169,110,0.8)":"rgba(255,255,255,0.2)",
                fontFamily:"'Cormorant Garamond', serif", whiteSpace:"nowrap",
                display:"block" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:"1px",
                background:i<step?"rgba(201,169,110,0.4)":"rgba(255,255,255,0.08)",
                margin:"0 clamp(4px,1vw,6px)", marginBottom:"clamp(14px,2.5vw,18px)",
                transition:"background 0.4s", minWidth:"clamp(16px,4vw,28px)" }}/>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── Resend Timer ── */
function ResendTimer({ onResend }) {
  const [seconds, setSeconds] = useState(60)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s=>s-1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleResend = async () => {
    setLoading(true); await onResend(); setSeconds(60); setLoading(false)
  }

  return (
    <p style={{ textAlign:"center", fontSize:"clamp(12px,1.5vw,13px)", color:"rgba(220,200,160,0.45)",
      letterSpacing:"0.04em", fontFamily:"'Cormorant Garamond', serif" }}>
      {seconds > 0
        ? <>Resend OTP in <span style={{ color:"rgba(201,169,110,0.7)" }}>{seconds}s</span></>
        : <button onClick={handleResend} disabled={loading}
            style={{ background:"none", border:"none", padding:0, cursor:"pointer",
              color:"rgba(242,218,174,0.65)", textDecoration:"underline",
              fontSize:"clamp(12px,1.5vw,13px)", fontFamily:"'Cormorant Garamond', serif",
              transition:"color 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#c9a96e"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(242,218,174,0.65)"}>
            {loading ? "Sending…" : "Resend OTP"}
          </button>
      }
    </p>
  )
}

/* ── Password Strength Meter ── */
function StrengthMeter({ password }) {
  const getStrength = (pw) => {
    if (!pw) return 0
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
  }
  const strength = getStrength(password)
  const labels = ["","Weak","Fair","Good","Strong"]
  const colors = ["","#d07040","#d4a440","#7ab87a","#4caf84"]
  if (!password) return null
  return (
    <div style={{ marginTop:"6px" }}>
      <div style={{ display:"flex", gap:"4px", marginBottom:"5px" }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px",
            background:i<=strength?colors[strength]:"rgba(255,255,255,0.08)", transition:"all 0.3s" }}/>
        ))}
      </div>
      <p style={{ fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase",
        color:colors[strength], fontFamily:"'Cormorant Garamond', serif", textAlign:"right" }}>
        {labels[strength]}
      </p>
    </div>
  )
}

/* ── Main ── */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [email, setEmail]       = useState("")
  const [otp, setOtp]           = useState("")
  const [passwords, setPasswords] = useState({ password:"", confirm:"" })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")
  const [animKey, setAnimKey]   = useState(0)

  const transition = (nextStep) => {
    setError(""); setSuccess(""); setAnimKey(k=>k+1); setStep(nextStep)
  }

  const handleSendOtp = async (e) => {
    e.preventDefault(); setLoading(true); setError("")
    try {
      await axios.post(`${API}/auth/forgot-password`, { email })
      setSuccess("OTP sent! Check your inbox.")
      setTimeout(() => transition(1), 800)
    } catch (err) { setError(err.response?.data?.message || "Failed to send OTP. Try again.") }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (otp.replace(/\s/g,"").length < 6) { setError("Please enter the 6-digit OTP."); return }
    setLoading(true); setError("")
    try {
      await axios.post(`${API}/auth/verify-reset-otp`, { email, otp })
      setSuccess("OTP verified!"); setTimeout(() => transition(2), 600)
    } catch (err) { setError(err.response?.data?.message || "Invalid or expired OTP.") }
    finally { setLoading(false) }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwords.password.length < 6) { setError("Password must be at least 6 characters."); return }
    if (passwords.password !== passwords.confirm) { setError("Passwords do not match."); return }
    setLoading(true); setError("")
    try {
      await axios.post(`${API}/auth/reset-password`, { email, newPassword:passwords.password })
      transition(3)
    } catch (err) { setError(err.response?.data?.message || "Failed to reset password.") }
    finally { setLoading(false) }
  }

  const handleResend = async () => {
    try { await axios.post(`${API}/auth/forgot-password`, { email }) } catch {}
  }

  const bgImages = [
    new URL("../../assets/resort.jpg",            import.meta.url).href,
    new URL("../../assets/resort_room.jpg",       import.meta.url).href,
    new URL("../../assets/resort_restaurant.jpg", import.meta.url).href,
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        input:-webkit-autofill, input:-webkit-autofill:hover,
        input:-webkit-autofill:focus, input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,8,3,0.7) inset !important;
          -webkit-text-fill-color: #f5edd8 !important;
          caret-color: #c9a96e !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }

        .fp-root {
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          padding:clamp(16px,3vw,32px) clamp(12px,4vw,16px);
          font-family:'Cormorant Garamond', serif;
          position:relative; overflow:hidden;
        }

        /* Fluid card */
        .fp-card {
          width:100%; max-width:500px; position:relative; z-index:20;
          background:rgba(12,6,2,0.55);
          backdrop-filter:blur(28px) saturate(160%);
          -webkit-backdrop-filter:blur(28px) saturate(160%);
          border:1px solid rgba(201,169,110,0.25); border-radius:16px;
          padding:clamp(24px,5vw,46px) clamp(16px,5vw,48px) clamp(22px,4vw,42px);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 40px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(201,169,110,0.06),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.04),
            inset -1px 0 0 rgba(255,255,255,0.04);
        }
        .fp-card::before {
          content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          border-radius:50%;
        }

        .fp-frame  { position:absolute; inset:10px; border:1px solid rgba(201,169,110,0.08); border-radius:8px; pointer-events:none; }
        .fp-bracket { position:absolute; width:20px; height:20px; border-color:rgba(201,169,110,0.35); border-style:solid; }
        .fp-bracket.tl { top:9px; left:9px; border-width:1.5px 0 0 1.5px; border-radius:8px 0 0 0; }
        .fp-bracket.tr { top:9px; right:9px; border-width:1.5px 1.5px 0 0; border-radius:0 8px 0 0; }
        .fp-bracket.bl { bottom:9px; left:9px; border-width:0 0 1.5px 1.5px; border-radius:0 0 0 8px; }
        .fp-bracket.br { bottom:9px; right:9px; border-width:0 1.5px 1.5px 0; border-radius:0 0 8px 0; }

        .fp-crown { text-align:center; margin-bottom:8px; }
        .fp-crown svg { filter:drop-shadow(0 2px 10px rgba(201,169,110,0.5)); }

        .fp-eyebrow {
          text-align:center; font-size:clamp(11px,1.5vw,14px);
          letter-spacing:0.3em; text-transform:uppercase;
          color:#f8f0e0; margin-bottom:8px;
        }
        .fp-title {
          text-align:center; font-family:'Playfair Display', serif;
          font-size:clamp(20px,4vw,28px); font-weight:600;
          color:rgb(201,169,110); line-height:1.15;
          margin-bottom:6px; text-shadow:0 2px 20px rgba(0,0,0,0.5);
        }
        .fp-subtitle {
          text-align:center; font-size:clamp(12px,1.5vw,13.5px);
          color:rgba(220,200,160,0.45); letter-spacing:0.05em;
          margin-bottom:clamp(18px,3vw,28px); line-height:1.5;
        }
        .fp-subtitle span { color:rgba(201,169,110,0.7); }

        .fp-btn {
          width:100%; margin-top:clamp(16px,3vw,22px);
          padding:clamp(13px,2vw,16px);
          background:linear-gradient(135deg,#c9a96e 0%,#a07838 50%,#d4b478 100%);
          background-size:200% auto; border:none; border-radius:8px;
          color:#160b05; font-family:'Cormorant Garamond', serif;
          font-size:clamp(11px,1.5vw,12px); font-weight:700;
          letter-spacing:0.35em; text-transform:uppercase; cursor:pointer;
          transition:background-position 0.4s, box-shadow 0.3s, transform 0.15s;
          position:relative; overflow:hidden;
          box-shadow:0 4px 20px rgba(201,169,110,0.25), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .fp-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%); pointer-events:none; }
        .fp-btn:hover:not(:disabled) { background-position:right center; box-shadow:0 8px 32px rgba(201,169,110,0.4),0 0 0 1px rgba(201,169,110,0.3); transform:translateY(-2px); }
        .fp-btn:active:not(:disabled) { transform:translateY(0); }
        .fp-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .fp-error {
          display:flex; align-items:flex-start; gap:10px;
          background:rgba(180,50,30,0.15); backdrop-filter:blur(8px);
          border:1px solid rgba(200,70,50,0.25); border-left:3px solid rgba(220,80,60,0.7);
          color:#d07868; padding:11px 14px; font-size:clamp(12px,1.5vw,13px);
          border-radius:6px; margin-bottom:18px; line-height:1.5; animation:fadeUp 0.2s ease;
        }
        .fp-success-msg {
          display:flex; align-items:flex-start; gap:10px;
          background:rgba(50,120,70,0.15); backdrop-filter:blur(8px);
          border:1px solid rgba(80,160,100,0.25); border-left:3px solid rgba(80,180,100,0.6);
          color:#70c88a; padding:11px 14px; font-size:clamp(12px,1.5vw,13px);
          border-radius:6px; margin-bottom:18px; line-height:1.5; animation:fadeUp 0.2s ease;
        }

        .fp-back-btn {
          display:flex; align-items:center; gap:6px;
          background:none; border:none; padding:0;
          color:rgba(201,169,110,0.5); font-family:'Cormorant Garamond', serif;
          font-size:clamp(11px,1.5vw,12px); letter-spacing:0.2em; text-transform:uppercase;
          cursor:pointer; transition:color 0.2s; margin-bottom:clamp(14px,2.5vw,20px);
        }
        .fp-back-btn:hover { color:rgba(201,169,110,0.9); }

        .fp-otp-label {
          text-align:center; font-size:clamp(10px,1.5vw,11px); letter-spacing:0.22em;
          text-transform:uppercase; color:rgba(201,169,110,0.6);
          margin-bottom:clamp(10px,2vw,14px); font-family:'Cormorant Garamond', serif;
        }

        .fp-match-indicator {
          font-size:10px; letter-spacing:0.12em; text-transform:uppercase;
          font-family:'Cormorant Garamond', serif; text-align:right;
          margin-top:4px; transition:color 0.3s;
        }

        .fp-divider { display:flex; align-items:center; gap:14px; color:rgba(255,255,255,0.1); font-size:10px; letter-spacing:0.4em; text-transform:uppercase; margin-top:clamp(16px,2.5vw,22px); }
        .fp-divider::before, .fp-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.07); }

        .fp-bottom { text-align:center; margin-top:clamp(14px,2.5vw,22px); font-size:clamp(13px,1.5vw,15px); color:rgba(221,217,217,0.91); letter-spacing:0.06em; }
        .fp-link { color:rgba(242,218,174,0.6); text-decoration:underline; transition:color 0.2s; }
        .fp-link:hover { color:#c9a96e; }

        /* Success card */
        .fp-success-card { display:flex; flex-direction:column; align-items:center; text-align:center; gap:14px; padding:12px 0 8px; }
        .fp-success-icon {
          width:clamp(56px,10vw,72px); height:clamp(56px,10vw,72px); border-radius:50%;
          background:rgba(201,169,110,0.1); border:1px solid rgba(201,169,110,0.3);
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 40px rgba(201,169,110,0.15);
          animation:pulseGold 2.5s ease-in-out infinite;
        }
        @keyframes pulseGold { 0%,100%{box-shadow:0 0 20px rgba(201,169,110,0.15)} 50%{box-shadow:0 0 40px rgba(201,169,110,0.35)} }

        .fp-spinner { display:inline-block; width:13px; height:13px; border:2px solid rgba(22,11,5,0.3); border-top-color:rgba(22,11,5,0.8); border-radius:50%; animation:spin 0.7s linear infinite; margin-right:8px; vertical-align:middle; }
        @keyframes spin { to { transform:rotate(360deg); } }

        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fade-in  { animation:fadeIn 0.3s ease forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
      `}</style>

      <SlideshowBg images={bgImages}/>

      <div className="fp-root">
        <div className="fp-card fade-up">
          <div className="fp-frame"/>
          <div className="fp-bracket tl"/><div className="fp-bracket tr"/>
          <div className="fp-bracket bl"/><div className="fp-bracket br"/>

          {/* Crown */}
          <div className="fp-crown">
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
              <path d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z" fill="none" stroke="#c9a96e" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="16" cy="2" r="1.8" fill="#c9a96e"/>
              <circle cx="6"  cy="9" r="1.4" fill="#c9a96e"/>
              <circle cx="26" cy="9" r="1.4" fill="#c9a96e"/>
            </svg>
          </div>

          <p className="fp-eyebrow">Royal Palace Resort</p>

          {step < 3 && (
            <>
              <h1 className="fp-title">
                {step===0?"Forgot Password":step===1?"Verify OTP":"Reset Password"}
              </h1>
              <p className="fp-subtitle">
                {step===0 && "Enter your registered email address to receive a one-time password."}
                {step===1 && <>OTP sent to <span>{email}</span>. Please check your inbox.</>}
                {step===2 && "Choose a strong new password for your account."}
              </p>
              {step > 0 && (
                <button className="fp-back-btn" onClick={() => transition(step-1)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Back
                </button>
              )}
              <StepBar step={step}/>
            </>
          )}

          {error && (
            <div className="fp-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"1px" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="fp-success-msg">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"1px" }}><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}

          {/* Step 0 — Email */}
          {step === 0 && (
            <form key={`step0-${animKey}`} className="fade-in" onSubmit={handleSendOtp}>
              <Field label="Registered Email" name="email" type="email" value={email}
                onChange={e=>setEmail(e.target.value)} required IconLeft={IconMail}/>
              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? <><span className="fp-spinner"/>Sending OTP…</> : "Send Reset OTP →"}
              </button>
            </form>
          )}

          {/* Step 1 — OTP */}
          {step === 1 && (
            <form key={`step1-${animKey}`} className="fade-in" onSubmit={handleVerifyOtp}>
              <p className="fp-otp-label">Enter 6-digit verification code</p>
              <OtpInput value={otp} onChange={setOtp}/>
              <button type="submit" className="fp-btn" disabled={loading||otp.replace(/\s/g,"").length<6}>
                {loading ? <><span className="fp-spinner"/>Verifying…</> : "Verify OTP →"}
              </button>
              <div style={{ marginTop:"clamp(12px,2vw,18px)" }}>
                <ResendTimer onResend={handleResend}/>
              </div>
            </form>
          )}

          {/* Step 2 — New Password */}
          {step === 2 && (
            <form key={`step2-${animKey}`} className="fade-in" onSubmit={handleResetPassword}>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                <div>
                  <PasswordField label="New Password" name="password" value={passwords.password}
                    onChange={e=>setPasswords(p=>({...p,password:e.target.value}))}/>
                  <StrengthMeter password={passwords.password}/>
                </div>
                <div>
                  <PasswordField label="Confirm New Password" name="confirm" value={passwords.confirm}
                    onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))}/>
                  {passwords.confirm && (
                    <p className="fp-match-indicator" style={{ color:passwords.password===passwords.confirm?"#4caf84":"#d07040" }}>
                      {passwords.password===passwords.confirm?"✓ Passwords match":"✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>
              <button type="submit" className="fp-btn"
                disabled={loading||!passwords.password||passwords.password!==passwords.confirm}>
                {loading ? <><span className="fp-spinner"/>Updating…</> : "Update Password →"}
              </button>
            </form>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div key="step3" className="fp-success-card fade-up">
              <div className="fp-success-icon"><IconCheck/></div>
              <h1 className="fp-title" style={{ marginBottom:0 }}>Password Updated</h1>
              <p className="fp-subtitle" style={{ marginBottom:0 }}>
                Your password has been reset successfully.<br/>You can now sign in with your new credentials.
              </p>
              <button className="fp-btn" style={{ marginTop:"8px", width:"100%" }} onClick={() => navigate("/login")}>
                Go to Sign In →
              </button>
            </div>
          )}

          {step < 3 && (
            <>
              <div className="fp-divider">or</div>
              <p className="fp-bottom">
                Remembered it?&nbsp;<Link to="/login" className="fp-link">Sign In</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}