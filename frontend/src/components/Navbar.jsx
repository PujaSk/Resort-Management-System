// src/components/Navbar.jsx
import React from "react"
import { useLocation } from "react-router-dom"

const LABELS = {
  // Admin
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
  // Staff
  "/staff/dashboard":       "Dashboard",
  "/staff/housekeeping":    "House Keeping",
  "/staff/room-booking":    "Room Booking",
  "/staff/manage-customer": "Manage Customer",
  "/staff/manage-staff":    "Manage Staff",
}

export default function Navbar() {
  const { pathname } = useLocation()

  // Handle dynamic routes like /admin/bookings/:id
  let label = LABELS[pathname]
  if (!label && pathname.includes("/bookings/")) label = "Booking Detail"
  if (!label) label = "Resort Management"

  const today = new Date().toLocaleDateString("en-IN", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  })

  return (
    <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40"
      style={{ background:"rgba(14,12,9,.85)", backdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
      <div>
        <h2 className="font-display text-lg font-semibold text-cream">{label}</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-resort-muted px-4 py-1.5 rounded-lg"
          style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)" }}>
          {today}
        </span>
        <span className="w-2 h-2 rounded-full anim-pulse"
          style={{ background:"#52C07A", boxShadow:"0 0 8px rgba(82,192,122,.6)" }} title="System Online"/>
      </div>
    </header>
  )
}