// src/components/Navbar.jsx
import React from "react"
import { useLocation } from "react-router-dom"

const LABELS = {
  "/admin/dashboard":       "Dashboard",
  "/admin/manage-rooms":    "Manage Rooms",
  "/admin/room-settings":   "Room Settings",
  "/admin/room-facilities": "Room Facilities",
  "/admin/housekeeping":    "House Keeping",
  "/admin/room-booking":    "Room Booking",
  "/admin/manage-customer": "Manage Customer",
  "/admin/manage-staff":    "Manage Staff",
  "/admin/item-manage":     "Item Manage",
  "/admin/manage-services": "Manage Services",
  "/admin/transaction":     "Transaction",
  "/admin/reports":         "Reports",
  "/admin/profile":         "My Profile",
  "/staff/dashboard":       "Dashboard",
  "/staff/housekeeping":    "House Keeping",
  "/staff/room-booking":    "Room Booking",
  "/staff/manage-customer": "Manage Customer",
  "/staff/manage-staff":    "Manage Staff",
  "/staff/profile":         "My Profile",
}

export default function Navbar() {
  const { pathname } = useLocation()

  let label = LABELS[pathname]
  if (!label && pathname.includes("/bookings/"))      label = "Booking Detail"
  if (!label && pathname.includes("/room-bookings/")) label = "Room Bookings"
  if (!label) label = "Resort Management"

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <>
      <style>{`
        .navbar-bar {
          height: 64px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(14,12,9,.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,.05);
          /* Mobile: leave room for the 40px hamburger (left:16) + gap */
          padding-left: 68px;
          padding-right: 16px;
        }
        @media (min-width: 1024px) {
          .navbar-bar {
            /* Desktop: sidebar already occupies left space */
            padding-left: 32px;
            padding-right: 32px;
          }
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .navbar-date {
          display: none;
        }
        @media (min-width: 480px) {
          .navbar-date {
            display: block;
            font-size: 11px;
            color: rgba(245,240,232,.45);
            padding: 6px 12px;
            border-radius: 8px;
            background: rgba(255,255,255,.04);
            border: 1px solid rgba(255,255,255,.06);
            white-space: nowrap;
          }
        }
      `}</style>

      <header className="navbar-bar">
        <div className="navbar-inner">
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(15px, 2.5vw, 18px)",
            fontWeight: 600,
            color: "#F5F0E8",
            margin: 0,
            lineHeight: 1.2,
          }}>
            {label}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="navbar-date">{today}</span>
            {/* Online status dot */}
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: "#52C07A",
                boxShadow: "0 0 8px rgba(82,192,122,.6)",
                animation: "pulseDot 2s ease-in-out infinite",
              }}
              title="System Online"
            />
          </div>
        </div>
      </header>
    </>
  )
}