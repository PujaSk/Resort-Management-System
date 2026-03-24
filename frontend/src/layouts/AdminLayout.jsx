// src/layouts/AdminLayout.jsx
import React, { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

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

export default function AdminLayout() {
  const isDesktop = useIsDesktop()

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0E0C09" }}>
      <Sidebar role="admin" />

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
        marginLeft: isDesktop ? 256 : 0,
        // NO overflow here — overflow:hidden on any ancestor breaks position:sticky
      }}>
        <Navbar />
        <main style={{
          flex: 1,
          padding: isDesktop ? 32 : 16,
          // NO overflow here — this is what was killing the sticky right column
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}