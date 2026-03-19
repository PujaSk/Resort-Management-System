// src/layouts/AdminLayout.jsx
// Responsive: sidebar shifts main content on desktop, drawer on mobile
import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-resort-bg">
      <Sidebar role="admin" />

      {/* lg:ml-64 shifts content right of fixed sidebar on desktop.
          On mobile the sidebar is a drawer overlay, so no margin needed. */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}