// src/layouts/CustomerLayout.jsx
import React from "react"
import { Outlet, NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import CrownIcon from "../components/ui/Crown"
import Footer from "./Footer"          // ← add this

export default function CustomerLayout() {
  const { user, logout } = useAuth()
  return (
    // ← removed overflowX:"hidden" which was clipping the video
    <div className="min-h-screen bg-resort-bg">
      <header
        className="sticky top-0 z-50 h-16 flex items-center justify-between px-10"
        style={{
          background: "rgba(14,12,9,.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,168,76,.1)",
        }}
      >
        <span className="font-display text-xl font-bold gold-text flex items-center gap-2">
          <CrownIcon size={28} />
          Royal Palace Resort
        </span>
        <nav className="flex items-center gap-1">
          {[
            { to: "/",         label: "Home",        end: true },
            { to: "/rooms",    label: "Rooms" },
            { to: "/bookings", label: "My Bookings" },
            { to: "/profile",  label: "Profile" },
          ].map(l => (
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
              className="ml-2 px-5 py-2 rounded-lg text-sm font-bold gold-btn text-resort-bg"
              style={{ color: "#0d0d0d" }}
            >
              Login
            </NavLink>
          )}
        </nav>
      </header>
      <main><Outlet /></main>
      <Footer />                                       {/* ← add this */}
    </div>
  )
}