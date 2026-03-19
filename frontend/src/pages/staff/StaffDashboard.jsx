// src/pages/staff/StaffDashboard.jsx
import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { getRooms } from "../../services/roomService"
import { getAllBookings } from "../../services/bookingService"
import Loader from "../../components/ui/Loader"

const C = {
  gold:"#C9A84C", green:"#52C07A", red:"#E05252",
  amber:"#E0A852", blue:"#5294E0", purple:"#9B7FE8", teal:"#4ECDC4",
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
  CheckSq:   ()=><SVG><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></SVG>,
  Broom:     ()=><SVG><path d="M3 22l4-4"/><path d="M7 18l9-9"/><path d="M14 3l7 7-2 2-7-7 2-2z"/><path d="M5 16l3 3"/></SVG>,
  Bell:      ()=><SVG><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SVG>,
  Coins:     ()=><SVG><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><line x1="16.71" y1="13.88" x2="17.64" y2="13.88"/></SVG>,
  Calendar:  ()=><SVG><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></SVG>,
  Door:      ()=><SVG size={18}><path d="M13 4H3v16h10"/><path d="M13 4h8v16h-8"/><circle cx="17" cy="12" r="1" fill="currentColor"/></SVG>,
  ClipCheck: ()=><SVG size={18}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="m9 12 2 2 4-4"/></SVG>,
  Warning:   ()=><SVG size={18}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></SVG>,
}

const fmtDate  = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—"
const fmtINR   = n => { if(!n)return"₹0"; if(n>=100000)return`₹${(n/100000).toFixed(1)}L`; if(n>=1000)return`₹${(n/1000).toFixed(1)}K`; return`₹${n}` }
const greeting = () => { const h=new Date().getHours(); return h<12?"morning":h<17?"afternoon":"evening" }

function StatCard({ Icon, label, value, accent, sub, delay=1 }) {
  return (
    <div className={`stat-card anim-up d${delay}`} style={{position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${accent},transparent)`}}/>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`${accent}18`,filter:"blur(18px)",pointerEvents:"none"}}/>
      <div className="stat-bar" style={{background:accent}}/>
      <div className="flex items-start justify-between mt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{color:"#8A7E6A"}}>{label}</p>
          <p className="font-display text-4xl font-bold" style={{color:accent}}>{value}</p>
          {sub && <p className="text-resort-dim text-xs mt-1.5">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{background:`${accent}15`,border:`1px solid ${accent}22`,flexShrink:0,color:accent}}>
          <Icon/>
        </div>
      </div>
    </div>
  )
}

function DivRow({ children }) {
  return (
    <div className="flex items-center justify-between py-3" style={{borderBottom:"1px solid rgba(255,255,255,.04)"}}>
      {children}
    </div>
  )
}

function Chip({ label, color }) {
  return (
    <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${color}15`,color,border:`1px solid ${color}22`}}>{label}</span>
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

export default function StaffDashboard() {
  const { user } = useAuth()
  const [rooms,    setRooms]    = useState([])
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  const designation = user?.designation || ""

  useEffect(() => {
    const safe = (p, s) => p.then(r => s(r.data||[])).catch(()=>{})
    Promise.all([
      safe(getRooms(),      setRooms),
      safe(getAllBookings(), setBookings),
    ]).finally(()=>setLoading(false))
  }, [])

  if (loading) return <Loader text="Loading dashboard…"/>

  const avail  = rooms.filter(r=>r.status==="Available").length
  const occ    = rooms.filter(r=>r.status==="Occupied").length
  const clean  = rooms.filter(r=>r.status==="Cleaning").length
  const maint  = rooms.filter(r=>r.status==="Maintenance").length
  const booked = rooms.filter(r=>r.status==="Booked").length

  const checkedIn = bookings.filter(b=>b.bookingStatus==="Checked-In")
  const todayStr  = new Date().toDateString()
  const todayCI   = bookings.filter(b=>new Date(b.checkInDateTime).toDateString()===todayStr)
  const todayCO   = bookings.filter(b=>new Date(b.checkOutDateTime).toDateString()===todayStr)
  const activeB   = bookings.filter(b=>b.bookingStatus==="Booked"||b.bookingStatus==="Checked-In")
  const attention = rooms.filter(r=>r.status==="Cleaning"||r.status==="Maintenance")

  const todayRevBookings = bookings.filter(b =>
    b.bookingStatus !== "Cancelled" && (
      new Date(b.checkInDateTime).toDateString()  === todayStr ||
      new Date(b.checkOutDateTime).toDateString() === todayStr
    )
  )
  const todayRev     = todayRevBookings.reduce((s,b)=>s+(b.amountPaid||0),0)
  const todayDue     = todayRevBookings.reduce((s,b)=>s+(b.amountDue||0),0)
  const todayPaid    = todayRevBookings.filter(b=>b.paymentStatus==="Paid").length
  const todayPartial = todayRevBookings.filter(b=>b.paymentStatus==="Partially Paid").length

  const recentB = [...bookings].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)

  const bannerStats = [
    { Icon:Icons.ClipCheck, label:"Check-ins Today",  val:todayCI.length,   col:C.green },
    { Icon:Icons.Door,      label:"Check-outs Today", val:todayCO.length,   col:C.amber },
    { Icon:Icons.Warning,   label:"Need Attention",   val:attention.length, col:C.red   },
  ]

  return (
    <div>
      {/* Greeting */}
      <div className="anim-up mb-7" style={{padding:"20px 24px",borderRadius:14,background:"linear-gradient(120deg,rgba(201,168,76,.08) 0%,rgba(255,255,255,.02) 100%)",border:"1px solid rgba(201,168,76,.14)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 className="font-display text-3xl font-bold text-cream">
            Good {greeting()}, {user?.staff_name||user?.name||"Staff"} <span className="text-gold">✦</span>
          </h1>
          <p className="text-resort-muted text-sm mt-1.5">
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            &nbsp;·&nbsp;
            <span style={{color:C.gold,fontWeight:600}}>{designation}</span>
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

      {/* KPI cards */}
      <div className="grid gap-4 mb-6 grid-cols-2 lg:grid-cols-4">
        <StatCard Icon={Icons.CheckSq} label="Available Rooms" value={avail}            accent={C.green}  sub="Ready for check-in"    delay={1}/>
        <StatCard Icon={Icons.Broom}   label="Needs Cleaning"  value={clean}            accent={C.amber}  sub="Awaiting housekeeping" delay={2}/>
        <StatCard Icon={Icons.Bell}    label="Guests In House" value={checkedIn.length} accent={C.teal}   sub="Currently checked in"  delay={3}/>
        <StatCard Icon={Icons.Coins}   label="Today's Revenue" value={fmtINR(todayRev)} accent={C.purple} sub="Collected today"       delay={4}/>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        <div className="xl:col-span-2 space-y-5">

          {/* Today's activity */}
          <div className="card-p anim-up d3">
            <SectionTitle title="Today's Activity" accent={C.blue}/>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                {label:"Check-ins Today",  val:todayCI.length,   col:C.green},
                {label:"Check-outs Today", val:todayCO.length,   col:C.amber},
                {label:"Active Bookings",  val:activeB.length,   col:C.blue},
                {label:"Today's Pending",  val:fmtINR(todayDue), col:C.red},
              ].map((m,i)=>(
                <div key={i} style={{padding:"11px 14px",borderRadius:10,background:`${m.col}10`,border:`1px solid ${m.col}1A`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className="text-xs text-resort-muted">{m.label}</span>
                  <span style={{fontSize:16,fontWeight:800,color:m.col}}>{m.val}</span>
                </div>
              ))}
            </div>

            {todayCI.length > 0 && (
              <div>
                <p style={{fontSize:10,fontWeight:700,color:"#6B6054",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Today's Check-ins</p>
                {todayCI.slice(0,4).map((b,i)=>{
                  const name = b.customer?.name||"Guest"
                  const bCol = BOOKING_COLOR[b.bookingStatus]||"#6B6054"
                  return (
                    <DivRow key={b._id||i}>
                      <div className="flex items-center gap-3">
                        <div style={{width:32,height:32,borderRadius:8,background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.gold}}>
                          {(name[0]||"G").toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-cream">{name}</p>
                          <p className="text-xs text-resort-dim">
                            {b.room?`Room #${b.room.room_number}`:"—"} · {b.roomType?.type_name||"—"}
                          </p>
                        </div>
                      </div>
                      <Chip label={b.bookingStatus} color={bCol}/>
                    </DivRow>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="card-p anim-up d4">
            <SectionTitle title="Recent Bookings" count={bookings.length} accent={C.blue}/>
            {recentB.length===0
              ? <p className="text-resort-dim text-sm text-center py-6">No bookings yet</p>
              : recentB.map((b,i)=>{
                const name   = b.customer?.name||"Guest"
                const bCol   = BOOKING_COLOR[b.bookingStatus]||"#6B6054"
                const isPaid = b.paymentStatus==="Paid"
                return (
                  <DivRow key={b._id||i}>
                    <div className="flex items-center gap-3">
                      <div style={{width:34,height:34,borderRadius:8,background:"rgba(82,148,224,.1)",border:"1px solid rgba(82,148,224,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:C.blue}}>
                        {(name[0]||"G").toUpperCase()}
                      </div>
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
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-5">
          <div className="card-p anim-up d3">
            <SectionTitle title="Room Status" accent={C.amber}/>
            <Bar label="Available"   count={avail}  total={rooms.length} color={C.green} />
            <Bar label="Booked"      count={booked} total={rooms.length} color={C.blue}  />
            <Bar label="Occupied"    count={occ}    total={rooms.length} color={C.red}   />
            <Bar label="Cleaning"    count={clean}  total={rooms.length} color={C.amber} />
            <Bar label="Maintenance" count={maint}  total={rooms.length} color={C.purple}/>
            {attention.length>0 && (
              <div style={{marginTop:14,padding:"10px 14px",borderRadius:8,background:"rgba(224,168,82,.08)",border:"1px solid rgba(224,168,82,.25)"}}>
                <p style={{fontSize:11,fontWeight:700,color:C.amber,marginBottom:4}}>Rooms Needing Attention</p>
                <p style={{fontSize:11,color:"#8A7E6A"}}>{attention.map(r=>`#${r.room_number}`).join(" · ")}</p>
              </div>
            )}
          </div>

          <div className="card-p anim-up d4">
            <SectionTitle title="Today's Revenue" accent={C.gold}/>
            <div className="space-y-3">
              {[
                {label:"Today's Revenue", val:fmtINR(todayRev),  col:C.teal  },
                {label:"Today's Pending", val:fmtINR(todayDue),  col:C.amber },
                {label:"Paid Today",      val:todayPaid,         col:C.green },
                {label:"Partial Today",   val:todayPartial,      col:C.blue  },
              ].map((m,i)=>(
                <div key={i} style={{padding:"11px 14px",borderRadius:10,background:`${m.col}10`,border:`1px solid ${m.col}1A`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className="text-xs text-resort-muted">{m.label}</span>
                  <span style={{fontSize:16,fontWeight:800,color:m.col}}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}