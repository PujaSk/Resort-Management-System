// src/pages/auth/Login.jsx
// Fully responsive — fluid card, inputs, typography
import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { loginUser } from "../../services/authService"
import SlideshowBg from "../../components/SlideshowBg"

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

function Field({ label, name, type = "text", value, onChange, required, IconLeft, rightSlot }) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0
  const active = focused || filled

  return (
    <div style={{ position: "relative" }}>
      <span style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", opacity:active?1:0.5,
        display:"flex", alignItems:"center", pointerEvents:"none", zIndex:2, transition:"opacity 0.2s" }}>
        <IconLeft color={focused ? "#e8c980" : "rgba(201,169,110,0.7)"}/>
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
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        autoComplete="new-password"
        style={{ width:"100%", height:"56px", paddingTop:"20px", paddingBottom:"6px",
          paddingLeft:"44px", paddingRight:rightSlot?"46px":"14px",
          background:focused?"rgba(201,169,110,0.1)":"rgba(255,255,255,0.06)",
          backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
          border:`1px solid ${focused?"rgba(201,169,110,0.55)":"rgba(255,255,255,0.1)"}`,
          borderRadius:"8px", color:"#f5edd8", fontSize:"clamp(13px,1.5vw,15px)",
          fontFamily:"'Cormorant Garamond', serif", outline:"none", transition:"all 0.22s",
          boxSizing:"border-box", WebkitTextFillColor:"#f5edd8",
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

function PasswordField({ value, onChange }) {
  const [show, setShow] = useState(false)
  return (
    <Field label="Password" name="password" type={show?"text":"password"}
      value={value} onChange={onChange} required IconLeft={IconLock}
      rightSlot={
        <span onClick={() => setShow(s => !s)}
          style={{ display:"flex", opacity:0.5, transition:"opacity 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.opacity=1}
          onMouseLeave={e => e.currentTarget.style.opacity=0.5}>
          {show ? <IconEyeOff color="#c9a96e"/> : <IconEye color="#c9a96e"/>}
        </span>
      }
    />
  )
}

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form,    setForm]    = useState({ email:"", password:"" })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("")
    try {
      const res   = await loginUser(form)
      const token = res.data.token
      const user  = res.data.user || res.data.data || res.data
      login(token, user)
      const role = user.role || "customer"
      navigate(role==="admin"?"/admin/dashboard":role==="staff"?"/staff/dashboard":"/")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password")
    } finally { setLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,8,3,0.7) inset !important;
          -webkit-text-fill-color: #f5edd8 !important;
          caret-color: #c9a96e !important;
          transition: background-color 9999s ease-in-out 0s !important;
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear { display:none; }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-strong-password-auto-fill-button { display:none !important; }

        .lg-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(20px,4vw,32px) clamp(12px,4vw,16px);
          font-family: 'Cormorant Garamond', serif;
          position: relative; overflow: hidden;
        }

        /* Fluid card — shrinks gracefully on small phones */
        .lg-card {
          width: 100%;
          max-width: 500px;
          position: relative; z-index: 20;
          background: rgba(12,6,2,0.55);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(201,169,110,0.25);
          border-radius: 16px;
          padding: clamp(28px,5vw,50px) clamp(18px,5vw,48px) clamp(24px,4vw,44px);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 40px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(201,169,110,0.06),
            inset 0 1px 0 rgba(255,255,255,0.08),
            inset 0 -1px 0 rgba(0,0,0,0.3),
            inset 1px 0 0 rgba(255,255,255,0.04),
            inset -1px 0 0 rgba(255,255,255,0.04);
        }
        .lg-card::before {
          content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
          border-radius:50%;
        }

        .lg-frame { position:absolute; inset:10px; border:1px solid rgba(201,169,110,0.08); border-radius:8px; pointer-events:none; }
        .lg-bracket { position:absolute; width:20px; height:20px; border-color:rgba(201,169,110,0.35); border-style:solid; }
        .lg-bracket.tl { top:9px; left:9px; border-width:1.5px 0 0 1.5px; border-radius:8px 0 0 0; }
        .lg-bracket.tr { top:9px; right:9px; border-width:1.5px 1.5px 0 0; border-radius:0 8px 0 0; }
        .lg-bracket.bl { bottom:9px; left:9px; border-width:0 0 1.5px 1.5px; border-radius:0 0 0 8px; }
        .lg-bracket.br { bottom:9px; right:9px; border-width:0 1.5px 1.5px 0; border-radius:0 0 8px 0; }

        .lg-crown { text-align:center; margin-bottom:8px; }
        .lg-crown svg { filter:drop-shadow(0 2px 10px rgba(201,169,110,0.5)); }

        .lg-eyebrow {
          text-align:center; font-size:clamp(11px,1.5vw,14px);
          letter-spacing:0.3em; text-transform:uppercase;
          color:#f8f0e0; margin-bottom:8px;
        }
        .lg-title {
          text-align:center;
          font-family:'Playfair Display', serif;
          font-size:clamp(22px,4vw,30px); font-weight:600;
          color:rgb(201,169,110); line-height:1.15;
          margin-bottom:clamp(20px,3vw,32px);
          text-shadow:0 2px 20px rgba(0,0,0,0.5);
        }
        .lg-fields { display:flex; flex-direction:column; gap:12px; }

        .lg-forgot {
          display:block; text-align:right; margin-top:8px;
          font-size:clamp(11px,1.5vw,11.5px); letter-spacing:0.1em;
          color:rgba(201,169,110,0.45); text-decoration:none;
          font-family:'Cormorant Garamond', serif; transition:color 0.2s;
        }
        .lg-forgot:hover { color:rgba(201,169,110,0.85); }

        .lg-btn {
          width:100%; margin-top:clamp(18px,3vw,26px);
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
        .lg-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%); pointer-events:none; }
        .lg-btn:hover:not(:disabled) { background-position:right center; box-shadow:0 8px 32px rgba(201,169,110,0.4),0 0 0 1px rgba(201,169,110,0.3); transform:translateY(-2px); }
        .lg-btn:active:not(:disabled) { transform:translateY(0); }
        .lg-btn:disabled { opacity:0.4; cursor:not-allowed; }

        .lg-error {
          display:flex; align-items:flex-start; gap:10px;
          background:rgba(180,50,30,0.15); backdrop-filter:blur(8px);
          border:1px solid rgba(200,70,50,0.25); border-left:3px solid rgba(220,80,60,0.7);
          color:#d07868; padding:11px 14px; font-size:clamp(12px,1.5vw,13px);
          border-radius:6px; margin-bottom:18px; line-height:1.5;
          animation:fadeUp 0.2s ease;
        }

        .lg-divider { display:flex; align-items:center; gap:14px; color:rgba(255,255,255,0.1); font-size:10px; letter-spacing:0.4em; text-transform:uppercase; margin-top:clamp(16px,2.5vw,22px); }
        .lg-divider::before, .lg-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.07); }

        .lg-bottom { text-align:center; margin-top:clamp(14px,2.5vw,22px); font-size:clamp(13px,1.5vw,15px); color:rgba(221,217,217,0.91); letter-spacing:0.06em; }
        .lg-link { color:rgba(242,218,174,0.6); text-decoration:underline; transition:color 0.2s; }
        .lg-link:hover { color:#c9a96e; }

        .lg-spinner { display:inline-block; width:13px; height:13px; border:2px solid rgba(22,11,5,0.3); border-top-color:rgba(22,11,5,0.8); border-radius:50%; animation:spin 0.7s linear infinite; margin-right:8px; vertical-align:middle; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .fade-up { animation:fadeUp 0.4s cubic-bezier(0.4,0,0.2,1) forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <SlideshowBg />

      <div className="lg-root">
        <div className="lg-card fade-up">
          <div className="lg-frame"/>
          <div className="lg-bracket tl"/><div className="lg-bracket tr"/>
          <div className="lg-bracket bl"/><div className="lg-bracket br"/>

          <div className="lg-crown">
            <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
              <path d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z" fill="none" stroke="#c9a96e" strokeWidth="1.3" strokeLinejoin="round"/>
              <circle cx="16" cy="2" r="1.8" fill="#c9a96e"/>
              <circle cx="6"  cy="9" r="1.4" fill="#c9a96e"/>
              <circle cx="26" cy="9" r="1.4" fill="#c9a96e"/>
            </svg>
          </div>

          <p className="lg-eyebrow">Royal Palace Resort</p>
          <h1 className="lg-title">Sign In</h1>

          {error && (
            <div className="lg-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"1px" }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="fade-up">
            <div className="lg-fields">
              <Field label="Email Address" name="email" type="email" value={form.email} onChange={onChange} required IconLeft={IconMail}/>
              <PasswordField value={form.password} onChange={onChange}/>
            </div>
            <Link to="/forgot-password" className="lg-forgot">Forgot Password?</Link>
            <button type="submit" className="lg-btn" disabled={loading}>
              {loading ? <><span className="lg-spinner"/>Signing In…</> : "Sign In →"}
            </button>
          </form>

          <div className="lg-divider">or</div>
          <p className="lg-bottom">
            No account?&nbsp;<Link to="/register" className="lg-link">Create Account</Link>
          </p>
        </div>
      </div>
    </>
  )
}