// src/pages/admin/pages/Dashboard.jsx
import React, { useState, useEffect } from "react"
import { getRooms }     from "../../../services/roomService"
import { getCustomers } from "../../../services/customerService"
import { getStaffList } from "../../../services/staffService"
import { getAllBookings as getBookings } from "../../../services/bookingService"
import { getFacilities} from "../../../services/facilityService"
import Loader from "../../../components/ui/Loader"
import { RupeeIcon, CashIcon } from "../../../components/ui/Icons"; 

/* ─── colours ─── */
const C = {
  gold:"#C9A84C", green:"#52C07A", red:"#E05252",
  amber:"#E0A852", blue:"#5294E0", purple:"#9B7FE8", teal:"#4ECDC4",
}
const DESIG_COLOR = {
  Manager:"#C9A84C", Receptionist:"#5294E0",
  Housekeeping:"#4ECDC4", Chef:"#E0A852", Security:"#9B7FE8",
}
const BOOKING_COLOR = {
  "Booked":"#5294E0","Checked-In":"#52C07A",
  "Checked-Out":"#6B6054","Cancelled":"#E05252",
}

/* ─── SVG icons ─── */
const SVG = ({ children, size=20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const Icons = {
  Hotel:     ()=><SVG><path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/><path d="M3 22h18"/><path d="M7 22v-4h10v4"/><path d="M5 6V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2"/></SVG>,
  CheckSq:   ()=><SVG><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></SVG>,
  Circle:    ()=><SVG><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></SVG>,
  Bell:      ()=><SVG><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SVG>,
  Coins:     ()=><SVG><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><line x1="16.71" y1="13.88" x2="17.64" y2="13.88"/></SVG>,
  Calendar:  ()=><SVG><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></SVG>,
  // greeting banner icons
  ClipCheck: ()=><SVG size={18}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></SVG>,
  Door:      ()=><SVG size={18}><path d="M13 4H3v16h10"/><path d="M13 4h8v16h-8"/><circle cx="17" cy="12" r="1" fill="currentColor"/></SVG>,
  Star:      ()=><SVG size={18}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SVG>,
  // quick stats icons
  Users:     ()=><SVG size={14}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></SVG>,
  Wrench:    ()=><SVG size={14}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></SVG>,
  Person:    ()=><SVG size={14}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></SVG>,
  Pool:      ()=><SVG size={14}><path d="M2 12h2a2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/><path d="M2 7h2a2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2"/><circle cx="12" cy="3" r="1" fill="currentColor"/></SVG>,
  Clipboard: ()=><SVG size={14}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></SVG>,
}

/* ─── utils ─── */
const greeting = () => { const h=new Date().getHours(); return h<12?"morning":h<17?"afternoon":"evening" }
const fmtINR   = n  => { if(!n)return"₹0"; if(n>=100000)return`₹${(n/100000).toFixed(1)}L`; if(n>=1000)return`₹${(n/1000).toFixed(1)}K`; return`₹${n}` }
const fmtDate  = d  => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—"

/* ─── tiny components ─── */
function StatCard({ Icon, label, value, accent, sub, badge, delay=1 }) {
  return (
    <div className={`stat-card anim-up d${delay}`} style={{position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${accent},transparent)`}}/>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${accent}18`,filter:"blur(18px)",pointerEvents:"none"}}/>
      <div className="stat-bar" style={{background:accent}}/>
      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{color:"#8A7E6A"}}>{label}</p>
          <p className="font-display text-4xl font-bold" style={{color:accent}}>{value}</p>
          {sub   && <p className="text-resort-dim text-xs mt-1.5">{sub}</p>}
          {badge && <span style={{display:"inline-block",marginTop:8,padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:600,background:`${accent}18`,color:accent,border:`1px solid ${accent}28`}}>{badge}</span>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{background:`${accent}15`,border:`1px solid ${accent}22`,flexShrink:0,color:accent}}>
          <Icon/>
        </div>
      </div>
    </div>
  )
}

function Bar({ label, count, total, color }) {
  const pct = total>0 ? Math.round((count/total)*100) : 0
  return (
    <div className="mb-3.5">
      <div className="flex justify-between mb-1.5 items-center">
        <div className="flex items-center gap-2">
          <div style={{width:6,height:6,borderRadius:"50%",background:color,flexShrink:0}}/>
          <span className="text-resort-muted text-sm">{label}</span>
        </div>
        <div className="text-sm">
          <span className="font-semibold text-cream">{count}</span>
          <span className="text-resort-dim"> / {total}</span>
          <span style={{marginLeft:6,fontSize:10,color,fontWeight:600}}>{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full" style={{background:"#2A2620"}}>
        <div className="h-full rounded-full transition-all duration-1000"
          style={{width:`${pct}%`,background:`linear-gradient(90deg,${color}88,${color})`}}/>
      </div>
    </div>
  )
}

function SectionTitle({ title, count, accent=C.gold }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div style={{width:3,height:16,borderRadius:99,background:accent}}/>
        <h3 className="font-display text-lg font-semibold text-cream">{title}</h3>
      </div>
      {count!=null && <span style={{fontSize:11,fontWeight:600,padding:"2px 10px",borderRadius:20,background:`${accent}15`,color:accent,border:`1px solid ${accent}25`}}>{count}</span>}
    </div>
  )
}

function Avatar({ name="?", color=C.gold, size=36 }) {
  return (
    <div style={{width:size,height:size,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,color,background:`${color}15`,border:`1px solid ${color}22`}}>
      {(name||"?")[0].toUpperCase()}
    </div>
  )
}

function Chip({ label, color }) {
  return (
    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${color}15`,color,border:`1px solid ${color}22`}}>{label}</span>
  )
}

function DivRow({ children }) {
  return (
    <div className="flex items-center justify-between py-3" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
      {children}
    </div>
  )
}

function MiniDonut({ segments, total }) {
  let offset = 0
  return (
    <div className="relative w-28 h-28 mx-auto mb-6">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#211E17" strokeWidth="3.5"/>
        {total>0 && segments.map((s,i)=>{
          const pct=(s.val/total)*100
          const el=<circle key={i} cx="18" cy="18" r="15.9155" fill="none" stroke={s.color} strokeWidth="3.5" strokeDasharray={`${pct} ${100-pct}`} strokeDashoffset={-offset}/>
          offset+=pct; return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-bold text-cream">{total}</span>
        <span className="text-[9px] text-resort-dim uppercase tracking-wide">Rooms</span>
      </div>
    </div>
  )
}

/* ── small icon+label row in Room Status quick stats ── */
function QuickStat({ Icon, label, val }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-resort-muted flex items-center gap-2">
        <span style={{color:"#6B6054"}}><Icon/></span>{label}
      </span>
      <span className="font-semibold text-cream">{val}</span>
    </div>
  )
}

/* ════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════ */
export default function Dashboard() {
  const [rooms,      setRooms]      = useState([])
  const [customers,  setCustomers]  = useState([])
  const [staff,      setStaff]      = useState([])
  const [bookings,   setBookings]   = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const safe = (promise, setter) => promise.then(r => setter(r.data || [])).catch(() => {})
    Promise.all([
      safe(getRooms(),      setRooms),
      safe(getCustomers(),  setCustomers),
      safe(getStaffList(),  setStaff),
      safe(getBookings(),   setBookings),
      safe(getFacilities(), setFacilities),
    ]).finally(() => setLoading(false))
  }, [])

  const avail  = rooms.filter(r=>r.status==="Available").length
  const booked = rooms.filter(r=>r.status==="Booked").length
  const occ    = rooms.filter(r=>r.status==="Occupied").length
  const clean  = rooms.filter(r=>r.status==="Cleaning").length
  const maint  = rooms.filter(r=>r.status==="Maintenance").length

  const checkedIn    = bookings.filter(b=>b.bookingStatus==="Checked-In")
  const checkedOut   = bookings.filter(b=>b.bookingStatus==="Checked-Out")
  const cancelled    = bookings.filter(b=>b.bookingStatus==="Cancelled")
  const activeB      = bookings.filter(b=>b.bookingStatus==="Booked"||b.bookingStatus==="Checked-In")
  const paidB        = bookings.filter(b=>b.paymentStatus==="Paid")
  const totalRevenue = bookings.reduce((s,b)=>s+(b.amountPaid||0),0)
  const pendingDue   = bookings.reduce((s,b)=>s+(b.amountDue ||0),0)
  const guestsInHouse = checkedIn.length

  const todayStr  = new Date().toDateString()
  const todayCI   = bookings.filter(b=>new Date(b.checkInDateTime).toDateString()===todayStr)
  const todayCO   = bookings.filter(b=>new Date(b.checkOutDateTime).toDateString()===todayStr)

  const rated     = bookings.filter(b=>b.feedback?.rating)
  const avgRating = rated.length ? (rated.reduce((s,b)=>s+b.feedback.rating,0)/rated.length).toFixed(1) : "—"

  const recentB   = [...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)
  const designMap = staff.reduce((acc,s)=>{ const d=s.designation||"Other"; acc[d]=(acc[d]||0)+1; return acc },{})

  if (loading) return <Loader text="Loading dashboard…"/>

  /* greeting banner mini-stat items */
  const bannerStats = [
    { Icon:Icons.ClipCheck, label:"Check-ins Today",  val:todayCI.length, col:C.green },
    { Icon:Icons.Door,      label:"Check-outs Today", val:todayCO.length, col:C.amber },
    { Icon:Icons.Star,      label:"Avg Rating Today",  val:avgRating,      col:C.gold  },
  ]

  return (
    <div>

      {/* ── Greeting banner ── */}
      <div className="anim-up mb-7" style={{padding:"20px 24px",borderRadius:14,background:"linear-gradient(120deg,rgba(201,168,76,.08) 0%,rgba(255,255,255,.02) 100%)",border:"1px solid rgba(201,168,76,.14)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">Good {greeting()}, Admin <span className="text-gold">✦</span></h1>
          <p className="text-resort-muted text-sm mt-1.5">
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · Resort overview at a glance
          </p>
        </div>
        <div className="flex items-center gap-3" style={{flexWrap:"wrap"}}>
          {bannerStats.map((t,i)=>(
            <div key={i} style={{padding:"9px 14px",borderRadius:10,textAlign:"center",background:`${t.col}10`,border:`1px solid ${t.col}22`}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:2,color:t.col}}><t.Icon/></div>
              <div style={{fontSize:18,fontWeight:800,color:t.col,lineHeight:1.1}}>{t.val}</div>
              <div style={{fontSize:10,color:"#6B6054",marginTop:2}}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard Icon={Icons.Hotel}    label="Total Rooms"     value={rooms.length}         accent={C.gold}   sub="All floors"         badge={`${booked} Booked`}         delay={1}/>
        <StatCard Icon={Icons.CheckSq}  label="Available"       value={avail}                accent={C.green}  sub="Ready for check-in"                                     delay={2}/>
        <StatCard Icon={Icons.Circle}   label="Occupied"        value={occ}                  accent={C.red}    sub="Currently occupied"                                     delay={3}/>
        <StatCard Icon={Icons.Bell}     label="Guests In House" value={guestsInHouse}        accent={C.teal}   sub="Currently staying"  badge={`${checkedIn.length} rooms`} delay={4}/>
        <StatCard Icon={()=><RupeeIcon size={28}/>}    label="Revenue"         value={fmtINR(totalRevenue)} accent={C.purple} sub="Amount collected"   badge={`${paidB.length} paid`}      delay={5}/>
        <StatCard Icon={Icons.Calendar} label="Active Bookings" value={activeB.length}       accent={C.blue}   sub="Booked + In-house"                                      delay={6}/>
      </div>

      {/* ── Body ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left (spans 2) */}
        <div className="xl:col-span-2 space-y-5">

          {/* Staff */}
          <div className="card-p anim-up d3">
            <SectionTitle title="Staff Overview" count={staff.length} accent={C.gold}/>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
              {Object.entries(designMap).map(([d,n])=>(
                <Chip key={d} label={`${d}: ${n}`} color={DESIG_COLOR[d]||C.gold}/>
              ))}
            </div>
            {staff.length===0
              ? <p className="text-resort-dim text-sm text-center py-6">No staff records found</p>
              : staff.slice(0,6).map((s,i)=>(
                <DivRow key={s._id||i}>
                  <div className="flex items-center gap-3">
                    <Avatar name={s.staff_name} color={DESIG_COLOR[s.designation]||C.gold}/>
                    <div>
                      <p className="text-sm font-semibold text-cream">{s.staff_name||"Staff"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Chip label={s.designation||"Staff"} color={DESIG_COLOR[s.designation]||C.gold}/>
                        {s.shift && (
                          <span style={{fontSize:10,color:"#6B6054"}} title={s.shift}>
                            {s.shift.includes("Night") ? "Night" : s.shift.includes("Day") ? "Day" : "Rot."}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{color:C.gold}}>₹{(s.salary||0).toLocaleString("en-IN")}</p>
                    <p className="text-xs text-resort-dim">/ month</p>
                  </div>
                </DivRow>
              ))
            }
          </div>

          {/* Recent Bookings */}
          <div className="card-p anim-up d4">
            <SectionTitle title="Recent Bookings" count={bookings.length} accent={C.blue}/>
            {recentB.length===0
              ? <p className="text-resort-dim text-sm text-center py-6">No bookings yet</p>
              : recentB.map((b,i)=>{
                const name  = typeof b.customer==="object" ? (b.customer?.name||"Guest") : "Guest"
                const bCol  = BOOKING_COLOR[b.bookingStatus]||"#6B6054"
                const isPaid= b.paymentStatus==="Paid"
                return (
                  <DivRow key={b._id||i}>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} color={C.blue} size={34}/>
                      <div>
                        <p className="text-sm font-semibold text-cream">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Chip label={b.bookingStatus} color={bCol}/>
                          <Chip label={b.paymentStatus} color={isPaid?C.green:C.amber}/>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{color:C.teal}}>{fmtINR(b.totalAmount||0)}</p>
                      <p className="text-xs text-resort-dim mt-0.5">{fmtDate(b.checkInDateTime)} → {fmtDate(b.checkOutDateTime)}</p>
                    </div>
                  </DivRow>
                )
              })
            }
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
              {[
                {label:"Checked-In",  val:checkedIn.length,  col:C.green  },
                {label:"Checked-Out", val:checkedOut.length, col:"#6B6054"},
                {label:"Cancelled",   val:cancelled.length,  col:C.red    },
                {label:"Pending Due", val:fmtINR(pendingDue),col:C.amber  },
              ].map((m,i)=>(
                <div key={i} style={{padding:"9px 12px",borderRadius:10,background:`${m.col}10`,border:`1px solid ${m.col}1A`}}>
                  <p style={{fontSize:16,fontWeight:800,color:m.col}}>{m.val}</p>
                  <p style={{fontSize:10,color:"#6B6054",marginTop:2}}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Guests */}
          <div className="card-p anim-up d5">
            <SectionTitle title="Recent Guests" count={customers.length} accent={C.teal}/>
            {customers.length===0
              ? <p className="text-resort-dim text-sm text-center py-6">No guests registered yet</p>
              : [...customers].reverse().slice(0,5).map((c,i)=>(
                <DivRow key={c._id||i}>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} color={C.teal} size={34}/>
                    <div>
                      <p className="text-sm font-semibold text-cream">{c.name||"Guest"}</p>
                      <p className="text-xs text-resort-dim">{c.email||""}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-resort-dim">{c.phoneno||c.phone||"—"}</p>
                    <p className="text-xs text-resort-dim mt-0.5">{c.city||""}</p>
                    {c.isEmailVerified!=null && (
                      <div className="mt-1">
                        <Chip label={c.isEmailVerified?"Verified":"Unverified"} color={c.isEmailVerified?C.green:C.amber}/>
                      </div>
                    )}
                  </div>
                </DivRow>
              ))
            }
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">

          {/* Room Status */}
          <div className="card-p anim-up d3">
            <SectionTitle title="Room Status" accent={C.amber}/>
            <MiniDonut total={rooms.length} segments={[
              {val:avail, color:C.green},{val:booked,color:C.blue},
              {val:occ,   color:C.red  },{val:clean, color:C.amber},
              {val:maint, color:C.purple},
            ]}/>
            <Bar label="Available"   count={avail}  total={rooms.length} color={C.green} />
            <Bar label="Booked"      count={booked} total={rooms.length} color={C.blue}  />
            <Bar label="Occupied"    count={occ}    total={rooms.length} color={C.red}   />
            <Bar label="Cleaning"    count={clean}  total={rooms.length} color={C.amber} />
            <Bar label="Maintenance" count={maint}  total={rooms.length} color={C.purple}/>
            <div className="mt-5 pt-4 space-y-2" style={{borderTop:"1px solid rgba(255,255,255,.06)"}}>
              <QuickStat Icon={Icons.Users}     label="Total Staff"     val={staff.length}/>
              <QuickStat Icon={Icons.Bell}      label="Guests In House" val={guestsInHouse}/>
              <QuickStat Icon={Icons.Person}    label="Total Guests"    val={customers.length}/>
              <QuickStat Icon={Icons.Pool}      label="Facilities"      val={facilities.length}/>
              <QuickStat Icon={Icons.Clipboard} label="All Bookings"    val={bookings.length}/>
            </div>
          </div>

          {/* Revenue */}
          <div className="card-p anim-up d4">
            <SectionTitle title="Revenue" accent={C.gold}/>
            <div className="space-y-3">
              {[
                {label:"Total Collected",val:fmtINR(totalRevenue),col:C.teal  },
                {label:"Pending Due",    val:fmtINR(pendingDue),  col:C.amber },
                {label:"Paid Bookings",  val:paidB.length,        col:C.green },
              ].map((m,i)=>(
                <div key={i} style={{padding:"11px 14px",borderRadius:10,background:`${m.col}10`,border:`1px solid ${m.col}1A`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className="text-xs text-resort-muted">{m.label}</span>
                  <span style={{fontSize:16,fontWeight:800,color:m.col}}>{m.val}</span>
                </div>
              ))}
            </div>
            {bookings.length>0 && (()=>{
              const methods=bookings.reduce((acc,b)=>{ const m=b.paymentDetails?.method||"checkin"; acc[m]=(acc[m]||0)+1; return acc },{})
              const labels={credit_card:"Credit",debit_card:"Debit",upi:"UPI",checkin:"Check-in"}
              return (
                <div className="mt-4 pt-4" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
                  <p className="text-[10px] text-resort-dim uppercase tracking-widest mb-2">Payment Methods</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {Object.entries(methods).map(([m,n])=>(
                      <span key={m} style={{fontSize:10,color:"#C8BAA0",padding:"3px 9px",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:20}}>
                        {labels[m]||m}: <b>{n}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Facilities */}
          {facilities.length>0 && (
            <div className="card-p anim-up d5">
              <SectionTitle title="Facilities" count={facilities.length} accent={C.purple}/>
              <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                {facilities.map((f,i)=>(
                  <span key={f._id||i} style={{fontSize:11,color:"#C8BAA0",padding:"5px 12px",borderRadius:20,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)"}}>
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}