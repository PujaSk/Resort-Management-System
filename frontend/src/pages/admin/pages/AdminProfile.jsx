// src/pages/admin/pages/AdminProfile.jsx
import React, { useState, useRef } from "react"
import { useAuth } from "../../../context/AuthContext"
import api from "../../../services/axiosInstance"
import { Toast, useToast } from "../../../components/ui/Loader"
import { LockIcon, AlarmIcon, UserIcon, EmailIcon } from "../../../components/ui/Icons"

const RESP = `
  .ap-2col {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: 900px;
  }
  @media (min-width: 768px) {
    .ap-2col { grid-template-columns: 1fr 1fr; }
  }
`

function EyeOpen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}
function EyeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function Field({ label, value, onChange, type="text", placeholder, disabled, required, maxLength, inputMode, hint }) {
  return (
    <div>
      <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700,
        color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
        {label}{required && <span style={{ color:"#E05252", marginLeft:3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled} maxLength={maxLength} inputMode={inputMode}
        style={{
          width:"100%", boxSizing:"border-box", padding:"10px 13px",
          borderRadius:9, fontSize:13, color: disabled ? "#6B6054" : "#F5ECD7", outline:"none",
          background: disabled ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)",
          border:"1px solid rgba(255,255,255,.1)", transition:"border .15s",
        }}
        onFocus={e  => { if (!disabled) e.target.style.border="1px solid rgba(201,168,76,.4)" }}
        onBlur={e   => { e.target.style.border="1px solid rgba(255,255,255,.1)" }}
      />
      {hint && <p style={{ fontSize:11, color:"#4A4035", marginTop:4 }}>{hint}</p>}
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:14, overflow:"hidden" }}>
      <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#F5ECD7", margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:"20px" }}>{children}</div>
    </div>
  )
}

function SaveBtn({ loading, label="Save Changes", onClick }) {
  return (
    <button onClick={onClick} disabled={loading}
      style={{ padding:"10px 24px", borderRadius:9, fontWeight:700, fontSize:13, cursor: loading?"not-allowed":"pointer",
        background: loading ? "rgba(201,168,76,.3)" : "linear-gradient(135deg,#C9A84C,#E0C06A)",
        color:"#0E0C09", border:"none", transition:"opacity .15s", opacity: loading ? .7 : 1 }}>
      {loading ? "Saving…" : label}
    </button>
  )
}

function OtpRow({ value, onChange, onResend, canResend, timer }) {
  return (
    <div style={{ display:"flex", gap:8, alignItems:"flex-end", flexWrap:"wrap" }}>
      <div style={{ flex:1, minWidth:120 }}>
        <Field label="OTP (6 digits)" value={value} onChange={onChange}
          placeholder="Enter OTP from email" maxLength={6} inputMode="numeric"/>
      </div>
      <button onClick={onResend} disabled={!canResend}
        style={{ padding:"10px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor: canResend?"pointer":"not-allowed",
          border:"1px solid rgba(201,168,76,.3)", background:"rgba(201,168,76,.08)",
          color: canResend?"#C9A84C":"#6B6054", whiteSpace:"nowrap" }}>
        {canResend ? "Resend" : `Resend (${timer}s)`}
      </button>
    </div>
  )
}

export default function AdminProfile() {
  const { user, setUser } = useAuth()
  const { toast, show }   = useToast()

  const isAdmin = user?.role === "admin"
  const isStaff = user?.role === "staff"

  const [profileForm, setProfileForm] = useState({
    name:       user?.name       || "",
    staff_name: user?.staff_name || "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [pwForm, setPwForm]   = useState({ currentPassword:"", newPassword:"", confirmPassword:"" })
  const [savingPw, setSavingPw]   = useState(false)
  const [showPw,   setShowPw]     = useState({ cur:false, new:false, con:false })
  const [otpStep,    setOtpStep]    = useState("idle")
  const [otpInput,   setOtpInput]   = useState("")
  const [otpTimer,   setOtpTimer]   = useState(0)
  const [newPwOtp,   setNewPwOtp]   = useState({ password:"", confirm:"" })
  const [savingOtp,  setSavingOtp]  = useState(false)
  const timerRef = useRef(null)

  const startTimer = () => {
    setOtpTimer(60)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setOtpTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSaveProfile = async () => {
    const displayName = isStaff ? profileForm.staff_name.trim() : profileForm.name.trim()
    if (!displayName) return show("Name cannot be empty", "error")
    
    setSavingProfile(true)
    try {
      const payload = {
        
        ...(isStaff ? { staff_name: displayName } : { name: displayName }),
      }
      const res = await api.put("/auth/profile", payload)
      show("Profile updated successfully ✅")
      if (setUser) setUser(prev => ({ ...prev, ...res.data.user }))
    } catch (err) {
      show(err.response?.data?.message || "Failed to update profile", "error")
    }
    setSavingProfile(false)
  }

  const handleChangePw = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm
    if (!currentPassword) return show("Enter your current password", "error")
    if (!newPassword)      return show("Enter a new password", "error")
    if (newPassword.length < 6) return show("New password must be at least 6 characters", "error")
    if (newPassword !== confirmPassword) return show("Passwords do not match", "error")
    setSavingPw(true)
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword })
      show("Password changed successfully ✅")
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" })
    } catch (err) {
      show(err.response?.data?.message || "Failed to change password", "error")
    }
    setSavingPw(false)
  }

  const sendOtp = async () => {
    setOtpStep("sending")
    try {
      await api.post("/auth/forgot-password", { email: user?.email })
      show(`OTP sent to ${user?.email}`)
      setOtpStep("sent"); setOtpInput(""); startTimer()
    } catch (err) {
      show(err.response?.data?.message || "Failed to send OTP", "error")
      setOtpStep("idle")
    }
  }

  const verifyOtp = async () => {
    if (otpInput.length !== 6) return show("Enter the 6-digit OTP", "error")
    setOtpStep("verifying")
    try {
      await api.post("/auth/verify-reset-otp", { email: user?.email, otp: otpInput })
      show("OTP verified ✅"); setOtpStep("verified")
    } catch (err) {
      show(err.response?.data?.message || "Invalid OTP", "error")
      setOtpStep("sent")
    }
  }

  const handleOtpReset = async () => {
    const { password, confirm } = newPwOtp
    if (!password) return show("Enter a new password", "error")
    if (password.length < 6) return show("Password must be at least 6 characters", "error")
    if (password !== confirm) return show("Passwords do not match", "error")
    setSavingOtp(true)
    try {
      await api.post("/auth/reset-password", { email: user?.email, newPassword: password })
      show("Password reset successfully ✅")
      setOtpStep("idle"); setOtpInput(""); setNewPwOtp({ password:"", confirm:"" })
    } catch (err) {
      show(err.response?.data?.message || "Reset failed", "error")
    }
    setSavingOtp(false)
  }

  const displayName = isStaff ? profileForm.staff_name : profileForm.name

  return (
    <div>
      <style>{RESP}</style>
      <Toast {...(toast||{})}/>

      <div className="page-hd">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">{user?.email} · <span style={{ color:"#C9A84C", fontWeight:600 }}>{isStaff ? user?.designation : "Admin"}</span></p>
        </div>
        <div style={{ width:52, height:52, borderRadius:14, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:22, fontWeight:800, color:"#C9A84C",
          background:"rgba(201,168,76,.12)", border:"2px solid rgba(201,168,76,.25)", flexShrink:0 }}>
          {(displayName?.[0] || "?").toUpperCase()}
        </div>
      </div>

      {/* RESPONSIVE: ap-2col stacks on mobile, 2-col on md+ */}
      <div className="ap-2col">

        {/* LEFT: Profile details */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <SectionCard title="Personal Info" icon={<UserIcon size={20}/>}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <Field label="Email (cannot be changed)" value={user?.email || ""} disabled
                hint="Contact admin to update email"/>
              {isStaff ? (
                <Field label="Full Name" required value={profileForm.staff_name}
                  placeholder="Your name"
                  onChange={e => setProfileForm(f => ({ ...f, staff_name: e.target.value }))}/>
              ) : (
                <Field label="Name" required value={profileForm.name}
                  placeholder="Your name"
                  onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}/>
              )}
              {/* <Field label="Phone Number" value={profileForm.phoneno}
                placeholder="10-digit mobile" inputMode="numeric" maxLength={10}
                onChange={e => setProfileForm(f => ({ ...f, phoneno: e.target.value.replace(/\D/g,"").slice(0,10) }))}
                hint="Indian mobile number starting with 6–9"/> */}
              {isStaff && <Field label="Designation" value={user?.designation || "—"} disabled/>}
              {isStaff && <Field label="Shift" value={user?.shift || "—"} disabled/>}
              <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:4 }}>
                <SaveBtn loading={savingProfile} onClick={handleSaveProfile}/>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT: Password management */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          <SectionCard title="Change Password" icon={<LockIcon/>}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <p style={{ fontSize:12, color:"#6B6054", marginBottom:2 }}>Know your current password? Change it directly.</p>

              {/* Current password */}
              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700,
                  color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  Current Password <span style={{ color:"#E05252" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <input type={showPw.cur ? "text" : "password"}
                    value={pwForm.currentPassword} placeholder="Enter current password"
                    onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", padding:"10px 40px 10px 13px",
                      borderRadius:9, fontSize:13, color:"#F5ECD7", outline:"none",
                      background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)" }}
                    onFocus={e => e.target.style.border="1px solid rgba(201,168,76,.4)"}
                    onBlur={e  => e.target.style.border="1px solid rgba(255,255,255,.1)"}/>
                  <button onClick={() => setShowPw(p => ({ ...p, cur:!p.cur }))}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", color:"#6B6054", cursor:"pointer",
                      display:"flex", alignItems:"center", padding:2 }}>
                    {showPw.cur ? <EyeOff/> : <EyeOpen/>}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700,
                  color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  New Password <span style={{ color:"#E05252" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <input type={showPw.new ? "text" : "password"}
                    value={pwForm.newPassword} placeholder="Min. 6 characters"
                    onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", padding:"10px 40px 10px 13px",
                      borderRadius:9, fontSize:13, color:"#F5ECD7", outline:"none",
                      background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)" }}
                    onFocus={e => e.target.style.border="1px solid rgba(201,168,76,.4)"}
                    onBlur={e  => e.target.style.border="1px solid rgba(255,255,255,.1)"}/>
                  <button onClick={() => setShowPw(p => ({ ...p, new:!p.new }))}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", color:"#6B6054", cursor:"pointer",
                      display:"flex", alignItems:"center", padding:2 }}>
                    {showPw.new ? <EyeOff/> : <EyeOpen/>}
                  </button>
                </div>
                {pwForm.newPassword && (
                  <div style={{ marginTop:6, display:"flex", gap:3, alignItems:"center" }}>
                    {[
                      pwForm.newPassword.length >= 6,
                      /[A-Z]/.test(pwForm.newPassword),
                      /[0-9]/.test(pwForm.newPassword),
                      /[^A-Za-z0-9]/.test(pwForm.newPassword),
                    ].map((ok, i) => (
                      <div key={i} style={{ flex:1, height:3, borderRadius:99,
                        background: ok ? "#52C07A" : "rgba(255,255,255,.08)", transition:"background .2s" }}/>
                    ))}
                    <span style={{ fontSize:10, color:"#6B6054", marginLeft:6, whiteSpace:"nowrap" }}>
                      {[pwForm.newPassword.length>=6,/[A-Z]/.test(pwForm.newPassword),/[0-9]/.test(pwForm.newPassword),/[^A-Za-z0-9]/.test(pwForm.newPassword)].filter(Boolean).length < 2 ? "Weak"
                        : [pwForm.newPassword.length>=6,/[A-Z]/.test(pwForm.newPassword),/[0-9]/.test(pwForm.newPassword),/[^A-Za-z0-9]/.test(pwForm.newPassword)].filter(Boolean).length < 4 ? "Good" : "Strong"}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700,
                  color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                  Confirm New Password <span style={{ color:"#E05252" }}>*</span>
                </label>
                <div style={{ position:"relative" }}>
                  <input type={showPw.con ? "text" : "password"}
                    value={pwForm.confirmPassword} placeholder="Repeat new password"
                    onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    style={{ width:"100%", boxSizing:"border-box", padding:"10px 40px 10px 13px",
                      borderRadius:9, fontSize:13, outline:"none",
                      color: pwForm.confirmPassword ? (pwForm.confirmPassword === pwForm.newPassword ? "#52C07A" : "#E05252") : "#F5ECD7",
                      background:"rgba(255,255,255,.04)",
                      border:`1px solid ${pwForm.confirmPassword ? (pwForm.confirmPassword === pwForm.newPassword ? "rgba(82,192,122,.3)" : "rgba(224,82,82,.3)") : "rgba(255,255,255,.1)"}` }}
                    onFocus={e => e.target.style.border="1px solid rgba(201,168,76,.4)"}
                    onBlur={e  => e.target.style.border=`1px solid ${e.target.value ? (e.target.value === pwForm.newPassword ? "rgba(82,192,122,.3)" : "rgba(224,82,82,.3)") : "rgba(255,255,255,.1)"}`}/>
                  <button onClick={() => setShowPw(p => ({ ...p, con:!p.con }))}
                    style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", color:"#6B6054", cursor:"pointer",
                      display:"flex", alignItems:"center", padding:2 }}>
                    {showPw.con ? <EyeOff/> : <EyeOpen/>}
                  </button>
                </div>
                {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                  <p style={{ fontSize:11, color:"#E05252", marginTop:4 }}>⚠ Passwords do not match</p>
                )}
              </div>

              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <SaveBtn loading={savingPw} label="Change Password" onClick={handleChangePw}/>
              </div>
            </div>
          </SectionCard>

          {/* Forgot password via OTP */}
          <SectionCard title="Forgot Password?" icon={<EmailIcon/>}>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {otpStep === "idle" && (
                <>
                  <p style={{ fontSize:12, color:"#6B6054", lineHeight:1.7 }}>
                    Don't remember your current password? We'll send a 6-digit OTP to{" "}
                    <strong style={{ color:"#C9A84C" }}>{user?.email}</strong>
                  </p>
                  <button onClick={sendOtp}
                    style={{ padding:"10px 18px", borderRadius:9, fontWeight:700, fontSize:13,
                      cursor:"pointer", border:"1px solid rgba(201,168,76,.3)",
                      background:"rgba(201,168,76,.08)", color:"#C9A84C",
                      display:"inline-flex", alignItems:"center", gap:6, lineHeight:1 }}>
                    <EmailIcon/> Send OTP to Email
                  </button>
                </>
              )}
              {otpStep === "sending" && (
                <p style={{ fontSize:13, color:"#6B6054", textAlign:"center", padding:"12px 0" }}>Sending OTP…</p>
              )}
              {otpStep === "sent" && (
                <>
                  <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)", fontSize:12, color:"#52C07A" }}>
                    ✅ OTP sent to {user?.email}. Check your inbox (valid 10 min).
                  </div>
                  <OtpRow value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g,"").slice(0,6))}
                    onResend={sendOtp} canResend={otpTimer===0} timer={otpTimer}/>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button onClick={() => setOtpStep("idle")}
                      style={{ flex:1, minWidth:80, padding:"10px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer",
                        border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#6B6054" }}>Cancel</button>
                    <button onClick={verifyOtp}
                      style={{ flex:2, minWidth:120, padding:"10px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer",
                        background:"linear-gradient(135deg,#C9A84C,#E0C06A)", color:"#0E0C09", border:"none" }}>Verify OTP</button>
                  </div>
                </>
              )}
              {otpStep === "verifying" && (
                <p style={{ fontSize:13, color:"#6B6054", textAlign:"center", padding:"12px 0" }}>Verifying…</p>
              )}
              {otpStep === "verified" && (
                <>
                  <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)", fontSize:12, color:"#52C07A" }}>
                    ✅ OTP verified. Set your new password below.
                  </div>
                  <div>
                    <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      New Password <span style={{ color:"#E05252" }}>*</span>
                    </label>
                    <input type="password" value={newPwOtp.password} placeholder="Min. 6 characters"
                      onChange={e => setNewPwOtp(p => ({ ...p, password: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 13px", borderRadius:9, fontSize:13, color:"#F5ECD7", outline:"none", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)" }}/>
                  </div>
                  <div>
                    <label style={{ display:"block", marginBottom:6, fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      Confirm Password <span style={{ color:"#E05252" }}>*</span>
                    </label>
                    <input type="password" value={newPwOtp.confirm} placeholder="Repeat new password"
                      onChange={e => setNewPwOtp(p => ({ ...p, confirm: e.target.value }))}
                      style={{ width:"100%", boxSizing:"border-box", padding:"10px 13px", borderRadius:9, fontSize:13, outline:"none",
                        color: newPwOtp.confirm ? (newPwOtp.confirm===newPwOtp.password?"#52C07A":"#E05252") : "#F5ECD7",
                        background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.1)" }}/>
                    {newPwOtp.confirm && newPwOtp.confirm !== newPwOtp.password && (
                      <p style={{ fontSize:11, color:"#E05252", marginTop:4 }}>⚠ Passwords do not match</p>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <button onClick={() => setOtpStep("idle")}
                      style={{ flex:1, minWidth:80, padding:"10px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer",
                        border:"1px solid rgba(255,255,255,.1)", background:"transparent", color:"#6B6054" }}>Cancel</button>
                    <SaveBtn loading={savingOtp} label="Reset Password" onClick={handleOtpReset}/>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}