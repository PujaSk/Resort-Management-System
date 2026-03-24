// src/layouts/CustomerLayout.jsx
// Fully responsive — hamburger menu on mobile, horizontal nav on desktop
import React, { useState, useEffect } from "react"
import { Outlet, NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"
import Footer from "../components/Footer"

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const NAV_LINKS = [
  { to: "/",            label: "Home",        end: true },
  { to: "/rooms",       label: "Rooms" },
  { to: "/facilities",  label: "Facilities" },
  { to: "/bookings",    label: "My Bookings" },
  { to: "/profile",     label: "Profile" },
]

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  const { pathname }     = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-resort-bg">

      {/* ════ HEADER ════ */}
      <header
        className="sticky top-0 z-50 h-16 flex items-center justify-between px-5 sm:px-8 lg:px-10"
        style={{
          background: "rgba(14,12,9,.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,168,76,.1)",
        }}
      >
        {/* Brand */}
        <NavLink
          to="/"
          className="font-display text-lg sm:text-xl font-bold gold-text flex items-center gap-2 no-underline flex-shrink-0"
        >
          <CrownIcon size={26} />
          {/* Short name on tiny screens, full name on sm+ */}
          <span className="hidden xs:block sm:block">Royal Palace Resort</span>
          <span className="xs:hidden sm:hidden">Royal Palace</span>
        </NavLink>

        {/* Desktop nav (md+) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gold/10 text-[rgba(201,169,110,.95)]"
                    : "text-resort-muted hover:text-cream hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all duration-150"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className="ml-2 px-5 py-2 rounded-lg text-sm font-bold gold-btn"
              style={{ color: "#0d0d0d" }}
            >
              Login
            </NavLink>
          )}
        </nav>

        {/* Mobile hamburger button (below md) */}
        <button
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
          style={{
            background: "rgba(201,168,76,.08)",
            border: "1px solid rgba(201,168,76,.2)",
            color: "#C9A84C",
          }}
          onClick={() => setMobileOpen(o => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </header>

      {/* ════ MOBILE MENU DRAWER ════ */}

      {/* Backdrop — tapping it closes the menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{
            background: "rgba(0,0,0,.6)",
            backdropFilter: "blur(4px)",
            top: "64px",
          }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel — slides down from below the header */}
      <div
        className="md:hidden fixed left-0 right-0 z-40"
        style={{
          top: "64px",
          background: "rgba(10,8,5,.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(201,168,76,.15)",
          transform: mobileOpen ? "translateY(0)" : "translateY(-110%)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 8px 40px rgba(0,0,0,.5)",
        }}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col p-4 gap-1">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-gold/10 text-[rgba(201,169,110,.95)]"
                    : "text-resort-muted hover:text-cream hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {/* Divider */}
          <div style={{ height: "1px", background: "rgba(255,255,255,.05)", margin: "4px 0" }} />

          {user ? (
            <button
              onClick={() => { logout(); setMobileOpen(false) }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all duration-150 text-left"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold gold-btn mt-1"
              style={{ color: "#0d0d0d" }}
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}