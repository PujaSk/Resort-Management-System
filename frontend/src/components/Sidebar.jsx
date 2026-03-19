// src/components/Sidebar.jsx
import React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"

/* ══════════════════════════════════════
   SVG ICONS — stroke only, colourless
   (inherit colour from parent)
══════════════════════════════════════ */
const IC = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Rooms: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"/>
      <path d="M3 22h18"/>
      <path d="M7 22v-4h10v4"/>
      <path d="M5 6V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Facilities: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Housekeeping: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22l4-4"/>
      <path d="M7 18l9-9"/>
      <path d="M14 3l7 7-2 2-7-7 2-2z"/>
      <path d="M5 16l3 3"/>
    </svg>
  ),
  Booking: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
  Customer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Staff: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Transaction: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <path d="M1 10h22"/>
      <circle cx="7" cy="15" r="1" fill="currentColor"/>
    </svg>
  ),
  Reports: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      <path d="M15 5.5a3 3 0 0 1 0 5"/>
      <circle cx="19" cy="15" r="3"/>
      <path d="M19 12v1M19 18v1M16.27 13.5l.87.5M21.73 16.5l-.87.5M16.27 16.5l.87-.5M21.73 13.5l-.87-.5"/>
    </svg>
  ),
}

const ADMIN_NAV = [
  { section:"Overview", items:[
    { to:"/admin/dashboard",    Icon:IC.Dashboard,    label:"Dashboard" },
  ]},
  { section:"Rooms & Facilities", items:[
    { to:"/admin/manage-rooms",    Icon:IC.Rooms,        label:"Manage Rooms" },
    { to:"/admin/room-settings",   Icon:IC.Settings,     label:"Room Settings" },
    { to:"/admin/room-facilities", Icon:IC.Facilities,   label:"Facilities" },
    { to:"/admin/housekeeping",    Icon:IC.Housekeeping, label:"House Keeping" },
  ]},
  { section:"Bookings", items:[
    { to:"/admin/room-booking",    Icon:IC.Booking,      label:"Room Booking" },
  ]},
  { section:"People", items:[
    { to:"/admin/manage-customer", Icon:IC.Customer,     label:"Manage Customer" },
    { to:"/admin/manage-staff",    Icon:IC.Staff,        label:"Manage Staff" },
  ]},
  { section:"Finance", items:[
    { to:"/admin/transaction",     Icon:IC.Transaction,  label:"Transaction" },
    { to:"/admin/reports",         Icon:IC.Reports,      label:"Reports" },
  ]},
  { section:"Account", items:[
    { to:"/admin/profile",         Icon:IC.Profile,      label:"My Profile" },
  ]},
]

const STAFF_NAV = [
  { section:"Overview", items:[
    { to:"/staff/dashboard",       Icon:IC.Dashboard,    label:"Dashboard" },
  ]},
  { section:"Rooms", items:[
    { to:"/staff/housekeeping",    Icon:IC.Housekeeping, label:"House Keeping" },
  ]},
  { section:"Bookings", items:[
    { to:"/staff/room-booking",    Icon:IC.Booking,      label:"Room Booking" },
  ]},
  { section:"People", items:[
    { to:"/staff/manage-customer", Icon:IC.Customer,     label:"Manage Customer" },
  ]},
  { section:"Account", items:[
    { to:"/staff/profile",         Icon:IC.Profile,      label:"My Profile" },
  ]},
]

export default function Sidebar({ role="admin" }) {
  const { logout, user } = useAuth()
  const nav = role==="admin" ? ADMIN_NAV : STAFF_NAV
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate("/login") }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col fixed left-0 top-0 bottom-0 z-50 overflow-y-auto"
      style={{ background:"#100E0B", borderRight:"1px solid rgba(201,168,76,.1)" }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl white-btn flex items-center justify-center text-resort-bg text-lg font-bold flex-shrink-0">
            <CrownIcon size={30}/>
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight" style={{color:"#c9a96e"}}>Royal Palace Resort</p>
            <p className="text-[10px] text-gold uppercase tracking-widest capitalize">{role} panel</p>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 py-3">
        {nav.map(sec => (
          <div key={sec.section} className="mb-1">
            <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color:"#3e352a" }}>
              {sec.section}
            </p>
            {sec.items.map(({ to, Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <span className="w-5 flex items-center justify-center flex-shrink-0">
                  <Icon/>
                </span>
                <span className="text-sm">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-4 pt-3" style={{ borderTop:"1px solid rgba(255,255,255,.05)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background:"rgba(255,255,255,.03)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gold flex-shrink-0"
            style={{ background:"rgba(201,168,76,.1)", border:"1px solid rgba(201,168,76,.25)" }}>
            {(user?.staff_name || user?.name)?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cream truncate">{user?.staff_name || user?.name || "Admin"}</p>
            <p className="text-[10px] text-resort-dim capitalize">{user?.designation || user?.role || role}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            style={{ background:"none", border:"none", cursor:"pointer", color:"#6B6054", padding:"4px", borderRadius:6, display:"flex", alignItems:"center" }}
            onMouseEnter={e => e.currentTarget.style.color="#E05252"}
            onMouseLeave={e => e.currentTarget.style.color="#6B6054"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}