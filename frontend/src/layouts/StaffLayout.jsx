// src/layouts/StaffLayout.jsx
// Fixed: JS-based breakpoint detection (same pattern as Sidebar.jsx)
// Removes hidden lg:flex / lg:hidden Tailwind classes that cause double-render.
import React, { useState, useEffect, useRef } from "react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"
import { BroomIcon, CashIcon } from "../components/ui/Icons"

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
  // Housekeeping: () => (
  //   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  //     <path d="M3 22l4-4"/><path d="M7 18l9-9"/>
  //     <path d="M14 3l7 7-2 2-7-7 2-2z"/><path d="M5 16l3 3"/>
  //   </svg>
  // ),
  Housekeeping: () => <BroomIcon size={16}/>,
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
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

const MANAGER_NAV = [
  { section: "Overview",  items: [{ to: "/staff/dashboard",       Icon: IC.Dashboard,    label: "Dashboard" }]},
  { section: "Rooms",     items: [{ to: "/staff/housekeeping",    Icon: IC.Housekeeping, label: "House Keeping" }]},
  { section: "Bookings",  items: [{ to: "/staff/room-booking",    Icon: IC.Booking,      label: "Room Booking" }]},
  { section: "People",    items: [
    { to: "/staff/manage-customer", Icon: IC.Customer, label: "Manage Customer" },
    { to: "/staff/manage-staff",    Icon: IC.Staff,    label: "Manage Staff" },
  ]},
  { section: "Account",   items: [{ to: "/staff/profile", Icon: IC.Profile, label: "My Profile" }]},
]

const RECEPTIONIST_NAV = [
  { section: "Overview",  items: [{ to: "/staff/dashboard",       Icon: IC.Dashboard,    label: "Dashboard" }]},
  { section: "Rooms",     items: [{ to: "/staff/housekeeping",    Icon: IC.Housekeeping, label: "House Keeping" }]},
  { section: "Bookings",  items: [{ to: "/staff/room-booking",    Icon: IC.Booking,      label: "Room Booking" }]},
  { section: "People",    items: [{ to: "/staff/manage-customer", Icon: IC.Customer,     label: "Manage Customer" }]},
  { section: "Account",   items: [{ to: "/staff/profile",         Icon: IC.Profile,      label: "My Profile" }]},
]

const LABELS = {
  "/staff/dashboard":       "Dashboard",
  "/staff/housekeeping":    "House Keeping",
  "/staff/room-booking":    "Room Booking",
  "/staff/manage-customer": "Manage Customer",
  "/staff/manage-staff":    "Manage Staff",
  "/staff/profile":         "My Profile",
}

/* ── Hook: JS-based breakpoint — avoids Tailwind JIT issues ── */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isDesktop
}

/* ── Sidebar inner content ── */
function SidebarContent({ nav, user, isManager, onNavigate, onLogout }) {
  return (
    <>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.2)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <CrownIcon size={30}/>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, fontWeight: 700, color: "#c9a96e", margin: 0, lineHeight: 1.2 }}>
              Royal Palace Resort
            </p>
            <p style={{ fontSize: 10, color: "#C9A84C", textTransform: "uppercase", letterSpacing: "0.12em", margin: "2px 0 0" }}>
              Staff Panel
            </p>
          </div>
        </div>
      </div>

      {/* Designation badge */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.04)", flexShrink: 0 }}>
        <div style={{
          padding: "7px 12px", borderRadius: 8,
          background: isManager ? "rgba(201,168,76,.08)" : "rgba(82,148,224,.08)",
          border: `1px solid ${isManager ? "rgba(201,168,76,.2)" : "rgba(82,148,224,.2)"}`,
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
            color: isManager ? "#C9A84C" : "#5294E0", margin: 0,
          }}>
            {isManager ? "👔 Manager" : "🎯 Receptionist"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        {nav.map(sec => (
          <div key={sec.section} style={{ marginBottom: 4 }}>
            <p style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, color: "#3e352a", textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
              {sec.section}
            </p>
            {sec.items.map(({ to, Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              >
                <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon /></span>
                <span style={{ fontSize: 14 }}>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,.03)" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#C9A84C",
            background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.25)",
          }}>
            {(user?.staff_name || user?.name || "S")[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#F5ECD7", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.staff_name || user?.name || "Staff"}
            </p>
            <p style={{ fontSize: 10, color: "#6B6054", margin: "1px 0 0", textTransform: "capitalize" }}>
              {user?.designation || "Staff"}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6B6054", padding: "4px", borderRadius: 6,
              display: "flex", alignItems: "center", flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#E05252"}
            onMouseLeave={e => e.currentTarget.style.color = "#6B6054"}
          >
            <IC.Logout />
          </button>
        </div>
      </div>
    </>
  )
}

/* ══════════════════════════════════════
   STAFF LAYOUT
══════════════════════════════════════ */
export default function StaffLayout() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const { pathname }     = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useIsDesktop()

  // Refs for focus management
  const drawerRef    = useRef(null)
  const hamburgerRef = useRef(null)

  const designation = user?.designation || ""
  const isManager   = designation === "Manager"
  const nav         = isManager ? MANAGER_NAV : RECEPTIONIST_NAV

  const label = LABELS[pathname] || (pathname.includes("/bookings/") ? "Booking Detail" : "Staff Panel")
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  const handleLogout = () => { logout(); navigate("/login") }

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll on mobile when drawer open
  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = mobileOpen ? "hidden" : ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen, isDesktop])

  // Return focus to hamburger when drawer closes
  useEffect(() => {
    if (!mobileOpen && drawerRef.current) {
      const focused = drawerRef.current.querySelector(":focus")
      if (focused) focused.blur()
      const t = setTimeout(() => hamburgerRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [mobileOpen])

  const sidebarStyle = {
    background: "#100E0B",
    borderRight: "1px solid rgba(201,168,76,.1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: 256,
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0E0C09" }}>

      {/* ── DESKTOP: fixed sidebar — only rendered on desktop ── */}
      {isDesktop && (
        <aside style={{
          ...sidebarStyle,
          position: "fixed",
          left: 0, top: 0, bottom: 0,
          zIndex: 50,
          overflowY: "auto",
        }}>
          <SidebarContent
            nav={nav} user={user} isManager={isManager}
            onNavigate={() => {}}
            onLogout={handleLogout}
          />
        </aside>
      )}

      {/* ── MOBILE: hamburger + drawer — only rendered on mobile ── */}
      {!isDesktop && (
        <>
          {/* Hamburger button */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            aria-controls="staff-sidebar"
            style={{
              position: "fixed", top: 16, left: 16, zIndex: 60,
              width: 40, height: 40, borderRadius: 12,
              background: "rgba(16,14,11,0.92)",
              border: "1px solid rgba(201,168,76,.3)",
              color: "#C9A84C",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <IC.Menu />
          </button>

          {/* Backdrop */}
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              style={{
                position: "fixed", inset: 0, zIndex: 55,
                background: "rgba(0,0,0,.7)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
              }}
            />
          )}

          {/* Slide-in drawer — inert when closed to prevent focus trap */}
          <aside
            id="staff-sidebar"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            inert={!mobileOpen ? true : undefined}
            style={{
              ...sidebarStyle,
              position: "fixed",
              left: 0, top: 0, bottom: 0,
              zIndex: 60,
              width: 288,
              overflowY: "auto",
              transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: mobileOpen ? "6px 0 48px rgba(0,0,0,.7)" : "none",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              style={{
                position: "absolute", top: 12, right: 12,
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "#6B6054", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#E05252"}
              onMouseLeave={e => e.currentTarget.style.color = "#6B6054"}
            >
              <IC.Close />
            </button>

            <SidebarContent
              nav={nav} user={user} isManager={isManager}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </>
      )}

      {/* ── Main content area ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
        // Desktop: shift right to clear fixed 256px sidebar
        // Mobile: no margin (sidebar is overlay)
        marginLeft: isDesktop ? 256 : 0,
      }}>

        {/* Navbar */}
        <header style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(14,12,9,.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
          // Mobile: pad right of hamburger button; Desktop: normal padding
          paddingLeft: isDesktop ? 32 : 68,
          paddingRight: isDesktop ? 32 : 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(15px, 2.5vw, 18px)",
              fontWeight: 600,
              color: "#F5F0E8",
              margin: 0,
            }}>
              {label}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Date — hide on very small screens */}
              <span style={{
                display: "none",
                fontSize: 11,
                color: "rgba(245,240,232,.45)",
                padding: "6px 12px",
                borderRadius: 8,
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.06)",
                whiteSpace: "nowrap",
              }}
                className="navbar-date"
              >
                {today}
              </span>
              {/* Status dot */}
              <span style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: "#52C07A",
                boxShadow: "0 0 8px rgba(82,192,122,.6)",
              }} title="System Online"/>
            </div>
          </div>
        </header>

        <main style={{
          flex: 1,
          padding: isDesktop ? 32 : 16,
          overflowX: "hidden",
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}