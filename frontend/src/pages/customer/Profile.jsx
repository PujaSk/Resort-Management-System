// src/pages/customer/Profile.jsx
import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../services/axiosInstance"
import {
  IconBed,
  MoneyIcon,
  UpiIcon,
  HallIcon,
  CalendarIcon,
  CreditCardIcon,
  DebitCardIcon,
  LockIcon,
  AlarmIcon,
  RightTickIcon,
  GuestIcon,
  UserIcon,
  EmailIcon,
  PhoneIcon,
  CityIcon,
  LocationIcon,
  IconCheck,
  IconWarning,
  IconArrowLeft,
  IconSparkle
} from "../../components/ui/Icons"; 

/* ─── inject styles once ─── */
if (typeof document !== "undefined" && !document.getElementById("profile-styles")) {
  const s = document.createElement("style")
  s.id = "profile-styles"
  s.textContent = `
    @keyframes p-fade-up {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0);    }
    }
    @keyframes p-shimmer {
      0%   { background-position:-400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes leaf-sway-left {
      0%   { transform: rotate(0deg);  }
      20%  { transform: rotate(4deg);  }
      50%  { transform: rotate(-3deg); }
      70%  { transform: rotate(5deg);  }
      100% { transform: rotate(0deg);  }
    }
    @keyframes leaf-sway-right {
      0%   { transform: rotate(0deg);  }
      20%  { transform: rotate(-4deg); }
      50%  { transform: rotate(3deg);  }
      70%  { transform: rotate(-5deg); }
      100% { transform: rotate(0deg);  }
    }
    .p-anim { animation: p-fade-up .45s ease both; }
    .p-field-input {
      width: 100%;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      padding: 10px 14px;
      color: #f5edd8;
      font-size: 14px;
      outline: none;
      transition: border-color .2s, background .2s;
      box-sizing: border-box;
      font-family: inherit;
    }
    .p-field-input:focus {
      border-color: rgba(201,168,76,.55);
      background: rgba(201,168,76,.04);
    }
    .p-field-input:disabled {
      opacity: .55;
      cursor: not-allowed;
    }
    .p-btn-gold {
      background: linear-gradient(135deg, #C9A84C, #ddb94e);
      color: #0E0C09;
      border: none;
      border-radius: 12px;
      padding: 11px 28px;
      font-weight: 700;
      font-size: 13.5px;
      cursor: pointer;
      letter-spacing: .3px;
      transition: opacity .15s;
    }
    .p-btn-gold:hover { opacity: .88; }
    .p-btn-gold:disabled { opacity: .45; cursor:not-allowed; }
    .p-btn-ghost {
      background: transparent;
      color: rgba(255,255,255,.45);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 12px;
      padding: 11px 28px;
      font-weight: 600;
      font-size: 13.5px;
      cursor: pointer;
      transition: border-color .2s, color .2s;
    }
    .p-btn-ghost:hover { border-color: rgba(255,255,255,.25); color: rgba(255,255,255,.7); }
  `
  document.head.appendChild(s)
}

const FIELD_DEFS = [
  { key:"name",    label:"Full Name",     icon:<UserIcon size={10}/>, type:"text",  half:false },
  { key:"email",   label:"Email Address", icon:<EmailIcon size={14}/>, type:"email", half:false, readonly:true },
  { key:"phoneno", label:"Phone Number",  icon:<PhoneIcon size={12}/>, type:"tel",   half:true  },
  { key:"city",    label:"City",          icon:<CityIcon size={12}/>, type:"text",  half:true  },
  { key:"address", label:"Address",       icon:<LocationIcon size={12}/>, type:"text",  half:false },
]

function Avatar({ name }) {
  const initials = (name || "G").split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()
  return (
    <div style={{
      width:80, height:80, borderRadius:"50%", flexShrink:0,
      background:"linear-gradient(135deg,rgba(201,168,76,.18),rgba(201,168,76,.06))",
      border:"2px solid rgba(201,168,76,.4)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"Georgia,serif", fontSize:"1.6rem", fontWeight:700, color:"#C9A84C",
      boxShadow:"0 0 0 6px rgba(201,168,76,.06)",
      letterSpacing:1,
    }}>{initials}</div>
  )
}

function InfoRow({ label, value, icon }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:4,
      padding:"14px 16px",
      background:"rgba(255,255,255,.025)",
      border:"1px solid rgba(255,255,255,.06)",
      borderRadius:12,
    }}>
      <span style={{ color:"rgba(255,255,255,.35)", fontSize:"10.5px", letterSpacing:"1px", textTransform:"uppercase", display: "flex", alignItems: "center", gap: 6,   }}>
        {icon} {label}
      </span>
      <span style={{ color:"#e8dcc8", fontSize:"14px", fontWeight:600 }}>
        {value || <span style={{ color:"rgba(255,255,255,.2)", fontStyle:"italic" }}>Not provided</span>}
      </span>
    </div>
  )
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({})
  const [errors,   setErrors]   = useState({})
  const [success,  setSuccess]  = useState("")
  const [apiError, setApiError] = useState("")
  const [showLogout, setShowLogout] = useState(false)

  /* ── fetch using /auth/me — already exists, returns full Customer doc with all fields ── */
  useEffect(() => {
    axiosInstance.get("/auth/me")
      .then(r => {
        const data = r.data.user || r.data.data || r.data
        setProfile(data)
        setForm(data)
      })
      .catch(err => {
        console.error("Profile fetch failed:", err?.response?.status, err?.response?.data)
        setApiError("Could not load profile. Please refresh the page.")
      })
      .finally(() => setLoading(false))
  }, [])

  const startEdit = () => { setForm({ ...profile }); setErrors({}); setSuccess(""); setApiError(""); setEditing(true) }
  const cancelEdit = () => { setEditing(false); setErrors({}); setApiError("") }

  const validate = () => {
    const e = {}
    if (!form.name?.trim())    e.name    = "Name is required"
    if (!form.phoneno?.trim()) e.phoneno = "Phone number is required"
    if (!form.city?.trim())    e.city    = "City is required"
    if (!form.address?.trim()) e.address = "Address is required"
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true); setApiError(""); setSuccess("")
    try {
      // PUT /api/customer/profile — matches server.js mount: app.use("/api/customer", customerRoutes)
      const { data } = await axiosInstance.put("/customer/profile", {
        name:    form.name?.trim(),
        phoneno: form.phoneno?.trim(),
        city:    form.city?.trim(),
        address: form.address?.trim(),
      })
      const updated = { ...profile, ...data }
      setProfile(updated)
      setForm(updated)
      setSuccess("Profile updated successfully.")
      setEditing(false)
    } catch (err) {
      console.error("Profile save failed:", err?.response?.status, err?.response?.data)
      setApiError(err?.response?.data?.message || "Could not update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate("/login") }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year:"numeric", month:"long", day:"numeric" })
    : "—"

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0E0C09", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"3px solid rgba(201,168,76,.2)", borderTopColor:"#C9A84C", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }}/>
        <p style={{ color:"rgba(255,255,255,.3)", fontSize:"13px" }}>Loading profile…</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"#0E0C09", padding:"0 0 80px", position:"relative", overflow:"hidden" }}>

      {/* ── LEFT BOTTOM LEAVES ── wrapper does the sway, SVG stays as-is ── */}
      <div style={{
        position:"fixed", bottom:-40, left:-40,
        pointerEvents:"none", zIndex:0,
        transformOrigin:"bottom left",
        animation:"leaf-sway-left 6s ease-in-out infinite",
      }}>
        <svg viewBox="0 0 340 420" xmlns="http://www.w3.org/2000/svg"
          style={{ width:320, height:"auto", opacity:0.17, display:"block" }}>
          <g fill="#C9A84C">
            {/* main large leaf bottom-left */}
            <path d="M20 400 C 40 320, 120 280, 160 180 C 180 240, 160 310, 20 400Z"/>
            <path d="M20 400 C 60 340, 150 320, 200 240 C 210 290, 170 350, 20 400Z" opacity=".97"/>
            {/* stem */}
            <path d="M20 400 Q 90 300 160 180" fill="none" stroke="#C9A84C" strokeWidth="2.5" opacity=".96"/>
            {/* second leaf behind */}
            <path d="M10 380 C 60 290, 160 240, 130 120 C 100 180, 60 280, 10 380Z" opacity=".5"/>
            <path d="M10 380 Q 80 260 130 120" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity=".94"/>
            {/* small accent leaf */}
            <path d="M60 400 C 80 360, 140 340, 170 280 C 160 310, 110 360, 60 400Z" opacity=".45"/>
            <path d="M60 400 Q 110 350 170 280" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity=".35"/>
            {/* tiny side sprout */}
            <path d="M100 350 C 120 320, 180 310, 190 260 C 170 285, 120 320, 100 350Z" opacity=".35"/>
            {/* veins on main leaf */}
            <path d="M90 310 Q 120 285 145 230" fill="none" stroke="#C9A84C" strokeWidth="1" opacity=".94"/>
            <path d="M110 330 Q 130 300 148 260" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".93"/>
            <path d="M70 355 Q 105 325 125 280" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".93"/>
          </g>
        </svg>
      </div>

      {/* ── RIGHT TOP LEAVES ── wrapper does the sway, SVG keeps its original flip transform ── */}
      <div style={{
        position:"fixed", top:-40, right:-40,
        pointerEvents:"none", zIndex:0,
        transformOrigin:"top right",
        animation:"leaf-sway-right 7s ease-in-out infinite 1s",
      }}>
        <svg viewBox="0 0 340 420" xmlns="http://www.w3.org/2000/svg"
          style={{
            width:320, height:"auto", opacity:0.17, display:"block",
            transform:"rotate(180deg) scaleX(-1)",
          }}>
          <g fill="#C9A84C">
            <path d="M20 400 C 40 320, 120 280, 160 180 C 180 240, 160 310, 20 400Z"/>
            <path d="M20 400 C 60 340, 150 320, 200 240 C 210 290, 170 350, 20 400Z" opacity=".97"/>
            <path d="M20 400 Q 90 300 160 180" fill="none" stroke="#C9A84C" strokeWidth="2.5" opacity=".96"/>
            <path d="M10 380 C 60 290, 160 240, 130 120 C 100 180, 60 280, 10 380Z" opacity=".5"/>
            <path d="M10 380 Q 80 260 130 120" fill="none" stroke="#C9A84C" strokeWidth="1.5" opacity=".94"/>
            <path d="M60 400 C 80 360, 140 340, 170 280 C 160 310, 110 360, 60 400Z" opacity=".45"/>
            <path d="M60 400 Q 110 350 170 280" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity=".35"/>
            <path d="M100 350 C 120 320, 180 310, 190 260 C 170 285, 120 320, 100 350Z" opacity=".35"/>
            <path d="M90 310 Q 120 285 145 230" fill="none" stroke="#C9A84C" strokeWidth="1" opacity=".94"/>
            <path d="M110 330 Q 130 300 148 260" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".93"/>
            <path d="M70 355 Q 105 325 125 280" fill="none" stroke="#C9A84C" strokeWidth=".8" opacity=".93"/>
          </g>
        </svg>
      </div>

      {/* ── HEADER BAND ── */}
      <div style={{
        background:"linear-gradient(180deg,rgba(201,168,76,.07) 0%,transparent 100%)",
        borderBottom:"1px solid rgba(255,255,255,.06)",
        padding:"48px 40px 36px",
      }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          {/* <p style={{ color:"rgba(201,168,76,.65)", fontSize:"11px", letterSpacing:"3px", textTransform:"uppercase", margin:"0 0 8px" }}>
            ✦ Royal Palace Resort
          </p> */}
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:"2rem", fontWeight:700, color:"#f5edd8", margin:"0 0 4px" }}>
            My Profile
          </h1>
          <p style={{ color:"rgba(255,255,255,.35)", fontSize:"13px", margin:0 }}>
            Manage your personal information and preferences
          </p>
        </div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"32px 40px 0" }}>

        {/* ── IDENTITY CARD ── */}
        <div className="p-anim" style={{
          background:"#161410",
          border:"1px solid rgba(201,168,76,.2)",
          borderRadius:20,
          padding:"28px 28px 24px",
          marginBottom:20,
          position:"relative",
          overflow:"hidden",
        }}>
          {/* gold corner accent */}
          <div style={{
            position:"absolute", top:0, right:0,
            width:120, height:120,
            background:"radial-gradient(circle at top right,rgba(201,168,76,.1),transparent 70%)",
            pointerEvents:"none",
          }}/>

          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:22 }}>
            <Avatar name={profile?.name} />
            <div style={{ flex:1 }}>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:"1.35rem", fontWeight:700, color:"#f5edd8", margin:"0 0 4px" }}>
                {profile?.name || "Guest"}
              </h2>
              <p style={{ color:"rgba(255,255,255,.4)", fontSize:"13px", margin:"0 0 8px" }}>
                {profile?.email}
              </p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{
                  background:"rgba(201,168,76,.12)", border:"1px solid rgba(201,168,76,.25)",
                  color:"#C9A84C", borderRadius:20, padding:"2px 12px",
                  fontSize:"11px", fontWeight:700, textTransform:"capitalize",
                }}>
                  ✦ {profile?.role || "Customer"}
                </span>
                {profile?.isEmailVerified && (
                  <span style={{
                    background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.25)",
                    color:"#4ade80", borderRadius:20, padding:"2px 12px",
                    fontSize:"11px", fontWeight:600,
                  }}>
                    ✓ Verified
                  </span>
                )}
              </div>
            </div>

            {/* Edit / Save buttons */}
            {!editing ? (
              <button className="p-btn-ghost" onClick={startEdit} style={{ flexShrink:0 }}>
                ✏ Edit
              </button>
            ) : (
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <button className="p-btn-ghost" onClick={cancelEdit}>Cancel</button>
                <button className="p-btn-gold" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* member since strip */}
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 14px", borderRadius:10,
            background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)",
          }}>
            <span style={{ fontSize:15 }}>🗓</span>
            <span style={{ color:"rgba(255,255,255,.35)", fontSize:"12px" }}>Member since</span>
            <span style={{ color:"#C9A84C", fontSize:"12px", fontWeight:600, marginLeft:4 }}>{joinDate}</span>
          </div>
        </div>

        {/* ── SUCCESS / ERROR BANNERS ── */}
        {success && (
          <div className="p-anim" style={{
            background:"rgba(74,222,128,.07)", border:"1px solid rgba(74,222,128,.25)",
            borderRadius:12, padding:"12px 16px", marginBottom:16,
            color:"#4ade80", fontSize:"13px", display:"flex", alignItems:"center", gap:8,
          }}>
            ✓ {success}
          </div>
        )}
        {apiError && (
          <div className="p-anim" style={{
            background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.25)",
            borderRadius:12, padding:"12px 16px", marginBottom:16,
            color:"#f87171", fontSize:"13px", display:"flex", alignItems:"center", gap:8,
          }}>
            ⚠ {apiError}
          </div>
        )}

        {/* ── DETAILS CARD ── */}
        <div className="p-anim" style={{
          background:"#161410", border:"1px solid rgba(255,255,255,.07)",
          borderRadius:20, padding:"24px 28px", marginBottom:20,
          animationDelay:".08s",
        }}>
          <p style={{
            color:"rgba(201,168,76,.7)", fontSize:"11px", letterSpacing:"2.5px",
            textTransform:"uppercase", margin:"0 0 18px", fontWeight:600,
          }}>Personal Information</p>

          {editing ? (
            /* ── EDIT FORM ── */
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {FIELD_DEFS.map(f => (
                <div key={f.key} style={{ gridColumn: f.half ? "span 1" : "span 2" }}>
                  <label style={{
                    display:"flex", color:"rgba(255,255,255,.4)", fontSize:"10.5px", alignItems: "center", gap: 6, 
                    letterSpacing:"1px", textTransform:"uppercase", marginBottom:6         
                  }}>
                    {f.icon} {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key] || ""}
                    disabled={f.readonly}
                    onChange={e => { setForm(p => ({ ...p, [f.key]:e.target.value })); setErrors(p => ({ ...p, [f.key]:"" })) }}
                    className="p-field-input"
                    placeholder={f.label}
                  />
                  {errors[f.key] && (
                    <p style={{ color:"#f87171", fontSize:"11px", margin:"4px 0 0" }}>{errors[f.key]}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* ── VIEW MODE ── */
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div style={{ gridColumn:"span 2" }}><InfoRow label="Full Name"    icon= {<UserIcon size={10}/>} value={profile?.name}    /></div>
              <div style={{ gridColumn:"span 2" }}><InfoRow label="Email"        icon={<EmailIcon size={14}/>} value={profile?.email}   /></div>
              <div>                                <InfoRow label="Phone"        icon={<PhoneIcon size={12}/>} value={profile?.phoneno} /></div>
              <div>                                <InfoRow label="City"         icon={<CityIcon size={12}/>} value={profile?.city}    /></div>
              <div style={{ gridColumn:"span 2" }}><InfoRow label="Address"      icon={<LocationIcon size={12}/>} value={profile?.address} /></div>
            </div>
          )}
        </div>

        {/* ── SIGN OUT ── */}
        <div className="p-anim" style={{ animationDelay:".14s" }}>
          {!showLogout ? (
            <button onClick={() => setShowLogout(true)} style={{
              width:"100%", padding:"13px",
              background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.2)",
              borderRadius:14, color:"#f87171", fontWeight:600, fontSize:"14px",
              cursor:"pointer", transition:"background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(248,113,113,.13)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(248,113,113,.07)"}
            >
              Sign Out
            </button>
          ) : (
            <div style={{
              background:"#161410", border:"1px solid rgba(248,113,113,.25)",
              borderRadius:14, padding:"20px 24px",
              animation:"p-fade-up .2s ease",
            }}>
              <p style={{ color:"#f5edd8", fontSize:"14px", fontWeight:600, margin:"0 0 6px" }}>Sign out of your account?</p>
              <p style={{ color:"rgba(255,255,255,.35)", fontSize:"12.5px", margin:"0 0 18px" }}>
                You will be redirected to the login page.
              </p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setShowLogout(false)} className="p-btn-ghost" style={{ flex:1, padding:"10px" }}>
                  Stay
                </button>
                <button onClick={handleLogout} style={{
                  flex:1, padding:"10px", borderRadius:12, border:"none",
                  background:"#f87171", color:"white", fontWeight:700, fontSize:"13.5px", cursor:"pointer",
                }}>
                  Yes, Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}