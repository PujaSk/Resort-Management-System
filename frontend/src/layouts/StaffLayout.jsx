// src/layouts/StaffLayout.jsx
// Responsive — uses the same Sidebar drawer pattern as AdminLayout
import React from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"

/* ── SVG icons ── */
const IC = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Housekeeping: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22l4-4"/><path d="M7 18l9-9"/>
      <path d="M14 3l7 7-2 2-7-7 2-2z"/><path d="M5 16l3 3"/>
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
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

const MANAGER_NAV = [
  { section:"Overview",  items:[{ to:"/staff/dashboard",       Icon:IC.Dashboard,    label:"Dashboard" }]},
  { section:"Rooms",     items:[{ to:"/staff/housekeeping",    Icon:IC.Housekeeping, label:"House Keeping" }]},
  { section:"Bookings",  items:[{ to:"/staff/room-booking",    Icon:IC.Booking,      label:"Room Booking" }]},
  { section:"People",    items:[
    { to:"/staff/manage-customer", Icon:IC.Customer, label:"Manage Customer" },
    { to:"/staff/manage-staff",    Icon:IC.Staff,    label:"Manage Staff" },
  ]},
  { section:"Account",   items:[{ to:"/staff/profile",         Icon:IC.Profile,      label:"My Profile" }]},
]

const RECEPTIONIST_NAV = [
  { section:"Overview",  items:[{ to:"/staff/dashboard",       Icon:IC.Dashboard,    label:"Dashboard" }]},
  { section:"Rooms",     items:[{ to:"/staff/housekeeping",    Icon:IC.Housekeeping, label:"House Keeping" }]},
  { section:"Bookings",  items:[{ to:"/staff/room-booking",    Icon:IC.Booking,      label:"Room Booking" }]},
  { section:"People",    items:[{ to:"/staff/manage-customer", Icon:IC.Customer,     label:"Manage Customer" }]},
  { section:"Account",   items:[{ to:"/staff/profile",         Icon:IC.Profile,      label:"My Profile" }]},
]

const LABELS = {
  "/staff/dashboard":       "Dashboard",
  "/staff/housekeeping":    "House Keeping",
  "/staff/room-booking":    "Room Booking",
  "/staff/manage-customer": "Manage Customer",
  "/staff/manage-staff":    "Manage Staff",
  "/staff/profile":         "My Profile",
}

/* ── Sidebar content (reused in both desktop & mobile drawer) ── */
function SidebarContent({ nav, user, isManager, onNavigate, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl white-btn flex items-center justify-center text-resort-bg text-lg font-bold flex-shrink-0">
            <CrownIcon size={30}/>
          </div>
          <div>
            <p className="font-display text-base font-bold text-cream leading-tight" style={{color:"#c9a96e"}}>Royal Palace Resort</p>
            <p className="text-[10px] text-gold uppercase tracking-widest">Staff Panel</p>
          </div>
        </div>
      </div>

      {/* Designation badge */}
      <div style={{padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,.04)"}}>
        <div style={{padding:"7px 12px", borderRadius:8, background:isManager?"rgba(201,168,76,.08)":"rgba(82,148,224,.08)", border:`1px solid ${isManager?"rgba(201,168,76,.2)":"rgba(82,148,224,.2)"}`}}>
          <p style={{fontSize:10, color:isManager?"#C9A84C":"#5294E0", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em"}}>
            {isManager ? "👔 Manager" : "🎯 Receptionist"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {nav.map(sec => (
          <div key={sec.section} className="mb-2">
            <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em]" style={{color:"#5e5647"}}>
              {sec.section}
            </p>
            {sec.items.map(({to, Icon, label}) => (
              <NavLink key={to} to={to}
                onClick={onNavigate}
                className={({isActive}) => `nav-item ${isActive ? "active" : ""}`}>
                <span className="w-5 flex items-center justify-center flex-shrink-0"><Icon/></span>
                <span className="text-sm">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 pb-4 pt-3" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{background:"rgba(255,255,255,.03)"}}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-gold flex-shrink-0"
            style={{background:"rgba(201,168,76,.1)", border:"1px solid rgba(201,168,76,.25)"}}>
            {(user?.staff_name||user?.name||"S")[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cream truncate">{user?.staff_name||user?.name||"Staff"}</p>
            <p className="text-[10px] text-resort-dim capitalize">{user?.designation||"Staff"}</p>
          </div>
          <button onClick={onLogout} title="Logout"
            style={{background:"none", border:"none", cursor:"pointer", color:"#6B6054", padding:"4px", borderRadius:6, display:"flex", alignItems:"center"}}
            onMouseEnter={e=>e.currentTarget.style.color="#E05252"}
            onMouseLeave={e=>e.currentTarget.style.color="#6B6054"}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const { pathname }      = useLocation()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const designation = user?.designation || ""
  const isManager   = designation === "Manager"
  const nav         = isManager ? MANAGER_NAV : RECEPTIONIST_NAV

  const label = LABELS[pathname] || "Staff Panel"
  const today = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  })

  const handleLogout = () => { logout(); navigate("/login") }

  // Close drawer on route change
  React.useEffect(() => { setMobileOpen(false) }, [pathname])

  // Prevent body scroll when drawer open
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  const sidebarStyle = {
    background: "#100E0B",
    borderRight: "1px solid rgba(201,168,76,.1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  }

  return (
    <div className="flex min-h-screen bg-resort-bg">

      {/* ── Desktop Sidebar (lg+) ── */}
      <aside
        className="hidden lg:flex w-64 flex-shrink-0 flex-col fixed left-0 top-0 bottom-0 z-50 overflow-y-auto"
        style={sidebarStyle}
      >
        <SidebarContent nav={nav} user={user} isManager={isManager} onNavigate={() => {}} onLogout={handleLogout}/>
      </aside>

      {/* ── Mobile hamburger ── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[60] flex items-center justify-center w-10 h-10 rounded-xl"
        style={{ background:"rgba(16,14,11,0.9)", border:"1px solid rgba(201,168,76,.25)", color:"#C9A84C", backdropFilter:"blur(8px)" }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <IC.Menu />
      </button>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[55]"
          style={{ background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className="lg:hidden fixed left-0 top-0 bottom-0 z-[60] flex flex-col w-72 overflow-y-auto"
        style={{
          ...sidebarStyle,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: mobileOpen ? "4px 0 40px rgba(0,0,0,.6)" : "none",
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
          style={{ background:"rgba(255,255,255,.06)", color:"#6B6054", border:"none", cursor:"pointer" }}
          onMouseEnter={e => e.currentTarget.style.color="#E05252"}
          onMouseLeave={e => e.currentTarget.style.color="#6B6054"}
        >
          <IC.Close />
        </button>
        <SidebarContent nav={nav} user={user} isManager={isManager} onNavigate={() => setMobileOpen(false)} onLogout={handleLogout}/>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Navbar */}
        <header
          className="h-16 flex items-center justify-between sticky top-0 z-40"
          style={{
            background:"rgba(14,12,9,.85)",
            backdropFilter:"blur(16px)",
            borderBottom:"1px solid rgba(255,255,255,.05)",
            paddingLeft: "calc(3.5rem + 0.5rem)",
            paddingRight: "1.5rem",
          }}
        >
          <style>{`@media(min-width:1024px){.staff-header{padding-left:2rem!important}}`}</style>
          <div className="staff-header flex items-center justify-between w-full" style={{ paddingLeft:"inherit", paddingRight:"inherit" }}>
            <h2 className="font-display text-base sm:text-lg font-semibold text-cream">{label}</h2>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:block text-[11px] text-resort-muted px-3 sm:px-4 py-1.5 rounded-lg"
                style={{background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)"}}>
                {today}
              </span>
              <span className="w-2 h-2 rounded-full anim-pulse"
                style={{background:"#52C07A", boxShadow:"0 0 8px rgba(82,192,122,.6)"}} title="System Online"/>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}