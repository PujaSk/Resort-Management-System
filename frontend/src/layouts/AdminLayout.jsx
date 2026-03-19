// src/layouts/AdminLayout.jsx
import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Navbar from "../components/Navbar"

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-resort-bg">
      <Sidebar role="admin" />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
