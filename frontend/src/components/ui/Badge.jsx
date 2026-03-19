// src/components/ui/Badge.jsx
import React from "react"

const MAP = {
  Available:"b-avail", Occupied:"b-occ", Cleaning:"b-clean", Maintenance:"b-maint",
  Confirmed:"b-confirm", Pending:"b-pend", Cancelled:"b-cancel",
  CheckedIn:"b-cin", CheckedOut:"b-cout",
  Active:"b-active", Inactive:"b-inactive",
  gold:"b-gold", admin:"b-confirm", staff:"b-cin", customer:"b-gold",
}
const DOT = {
  Available:"#52C07A", Occupied:"#E05252", Cleaning:"#E0A852", Maintenance:"#5294E0",
  Confirmed:"#52C07A", Pending:"#E0A852", Cancelled:"#E05252",
  CheckedIn:"#5294E0", CheckedOut:"#C9A84C",
  Active:"#52C07A", Inactive:"#8A7E6A", gold:"#C9A84C",
  admin:"#52C07A", staff:"#5294E0", customer:"#C9A84C",
}

export default function Badge({ label, variant, size="md" }) {
  const key = variant || label
  const cls = MAP[key] || "b-gold"
  const dot = DOT[key] || "#C9A84C"
  const sz  = size==="sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"
  const dsz = size==="sm" ? "w-1.5 h-1.5" : "w-2 h-2"
  return (
    <span className={`badge ${cls} ${sz}`}>
      <span className={`bdot ${dsz}`} style={{ backgroundColor: dot }} />
      {label}
    </span>
  )
}
