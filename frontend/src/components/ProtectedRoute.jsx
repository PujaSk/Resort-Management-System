// src/components/ProtectedRoute.jsx
import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loader from "./ui/Loader"

/*
  role prop:
    "admin"  → only admins
    "staff"  → only staff (Manager + Receptionist)
    undefined → any logged-in user
*/
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader fullPage text="Authenticating…" />
  if (!user)   return <Navigate to="/login" replace />

  /* role-specific guard */
  if (role === "admin" && user.role !== "admin") {
    return <Navigate to={user.role === "staff" ? "/staff/dashboard" : "/"} replace />
  }

  if (role === "staff" && user.role !== "staff") {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/"} replace />
  }

  /* Staff designation guard — only Manager and Receptionist can log in to staff portal */
  if (user.role === "staff") {
    const allowed = ["Manager", "Receptionist"]
    if (!allowed.includes(user.designation)) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#100E0B",
          padding: 40,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F5ECD7", marginBottom: 8 }}>
            Access Restricted
          </h2>
          <p style={{ fontSize: 14, color: "#6B6054", maxWidth: 340, lineHeight: 1.7 }}>
            Only <strong style={{ color: "#C9A84C" }}>Manager</strong> and{" "}
            <strong style={{ color: "#C9A84C" }}>Receptionist</strong> designations
            have access to the staff portal.
          </p>
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/login" }}
            style={{
              marginTop: 24, padding: "10px 24px", borderRadius: 8,
              background: "rgba(201,168,76,.15)",
              border: "1px solid rgba(201,168,76,.3)",
              color: "#C9A84C", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Back to Login
          </button>
        </div>
      )
    }
  }

  return children
}