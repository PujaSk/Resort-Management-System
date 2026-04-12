// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"
import { BroomIcon, FeedbackIcon } from "../components/ui/Icons"

/* ══════════════════════════════════════
   SVG ICONS
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
  Housekeeping: () => <BroomIcon size={16}/>,
  Booking: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
  Feedback: () => <FeedbackIcon size={16} color="currentColor" />,
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

const ADMIN_NAV = [
  { section: "Overview", items: [
    { to: "/admin/dashboard",       Icon: IC.Dashboard,    label: "Dashboard" },
  ]},
  { section: "Rooms & Facilities", items: [
    { to: "/admin/manage-rooms",    Icon: IC.Rooms,        label: "Manage Rooms" },
    { to: "/admin/room-settings",   Icon: IC.Settings,     label: "Room Settings" },
    { to: "/admin/room-facilities", Icon: IC.Facilities,   label: "Facilities" },
    { to: "/admin/housekeeping",    Icon: IC.Housekeeping, label: "House Keeping" },
  ]},
  // ── Feedback added here under Bookings ──────────────────────────────────────
  { section: "Bookings", items: [
    { to: "/admin/room-booking",    Icon: IC.Booking,      label: "Room Booking" },
    { to: "/admin/feedback",        Icon: IC.Feedback,     label: "Feedback" },
  ]},
  // ───────────────────────────────────────────────────────────────────────────
  { section: "People", items: [
    { to: "/admin/manage-customer", Icon: IC.Customer,     label: "Manage Customer" },
    { to: "/admin/manage-staff",    Icon: IC.Staff,        label: "Manage Staff" },
  ]},
  { section: "Finance", items: [
    { to: "/admin/transaction",     Icon: IC.Transaction,  label: "Transaction" },
    { to: "/admin/reports",         Icon: IC.Reports,      label: "Reports" },
  ]},
  { section: "Account", items: [
    { to: "/admin/profile",         Icon: IC.Profile,      label: "My Profile" },
  ]},
]

const STAFF_NAV = [
  { section: "Overview", items: [
    { to: "/staff/dashboard",       Icon: IC.Dashboard,    label: "Dashboard" },
  ]},
  { section: "Rooms", items: [
    { to: "/staff/housekeeping",    Icon: IC.Housekeeping, label: "House Keeping" },
  ]},
  { section: "Bookings", items: [
    { to: "/staff/room-booking",    Icon: IC.Booking,      label: "Room Booking" },
  ]},
  { section: "People", items: [
    { to: "/staff/manage-customer", Icon: IC.Customer,     label: "Manage Customer" },
  ]},
  { section: "Account", items: [
    { to: "/staff/profile",         Icon: IC.Profile,      label: "My Profile" },
  ]},
]

/* ── Hook: detect if viewport is desktop (≥1024px) ── */
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

/* ══════════════════════════════════════
   SIDEBAR INNER CONTENT
══════════════════════════════════════ */
function SidebarContent({ role, nav, user, onNavigate, onLogout }) {
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
            <p style={{ fontSize: 10, color: "#C9A84C", textTransform: "capitalize", letterSpacing: "0.12em", margin: "2px 0 0" }}>
              {role} panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav sections */}
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
            {(user?.staff_name || user?.name)?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#F5ECD7", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.staff_name || user?.name || "Admin"}
            </p>
            <p style={{ fontSize: 10, color: "#6B6054", margin: "1px 0 0", textTransform: "capitalize" }}>
              {user?.designation || user?.role || role}
            </p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6B6054", padding: "4px", borderRadius: 6,
              display: "flex", alignItems: "center", flexShrink: 0,
              transition: "color .15s",
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
   EXPORTED SIDEBAR
══════════════════════════════════════ */
export default function Sidebar({ role = "admin" }) {
  const { logout, user } = useAuth()
  const navigate         = useNavigate()
  const { pathname }     = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useIsDesktop()

  // Refs for accessibility focus management
  const drawerRef    = useRef(null)
  const hamburgerRef = useRef(null)

  const nav = role === "admin" ? ADMIN_NAV : STAFF_NAV

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!isDesktop) {
      document.body.style.overflow = mobileOpen ? "hidden" : ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen, isDesktop])

  // When drawer closes: blur any focused element inside it, then
  // return focus to the hamburger button so keyboard/screen-reader
  // users are not left stranded inside the now-hidden drawer.
  useEffect(() => {
    if (!mobileOpen && drawerRef.current) {
      const focused = drawerRef.current.querySelector(":focus")
      if (focused) focused.blur()
      const t = setTimeout(() => hamburgerRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [mobileOpen])

  const handleLogout = () => { logout(); navigate("/login") }

  const sidebarStyle = {
    background: "#100E0B",
    borderRight: "1px solid rgba(201,168,76,.1)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: 256,
  }

  /* ── DESKTOP: fixed left sidebar ── */
  if (isDesktop) {
    return (
      <aside style={{
        ...sidebarStyle,
        position: "fixed",
        left: 0, top: 0, bottom: 0,
        zIndex: 50,
        overflowY: "auto",
      }}>
        <SidebarContent
          role={role} nav={nav} user={user}
          onNavigate={() => {}}
          onLogout={handleLogout}
        />
      </aside>
    )
  }

  /* ── MOBILE: hamburger + drawer overlay ── */
  return (
    <>
      {/* Hamburger button — always visible on mobile */}
      <button
        ref={hamburgerRef}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-sidebar"
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

      {/* Backdrop — only rendered when open */}
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

      {/*
        Slide-in drawer.

        FIX: replaced aria-hidden={!mobileOpen} with the inert attribute.

        Why inert is better than aria-hidden here:
        - aria-hidden only hides from the accessibility tree but focus can
          still land inside, causing the "aria-hidden on focused ancestor"
          browser warning.
        - inert does everything aria-hidden does AND prevents focus from
          ever entering the element, eliminating the warning entirely.
        - The browser recommendation in the warning message itself says
          "consider using the inert attribute instead".

        React syntax: pass true to enable inert, undefined to remove it.
        Passing false or an empty string both cause React warnings.
      */}
      <aside
        id="mobile-sidebar"
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
          role={role} nav={nav} user={user}
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}