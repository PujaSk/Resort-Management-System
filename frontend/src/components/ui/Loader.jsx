// src/components/ui/Loader.jsx
import React from "react"
import CrownIcon from "./Crown"

export default function Loader({ fullPage=false, text="" }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-[3px] border-gold/20 border-t-gold rounded-full anim-spin" />
      {text && <p className="text-resort-muted text-sm">{text}</p>}
    </div>
  )
  if (fullPage) return (
    <div className="fixed inset-0 z-[9999] bg-resort-bg flex flex-col items-center justify-center gap-6">
      <span className="font-display text-3xl font-bold gold-text"> <CrownIcon/> Resort Management</span>
      {inner}
    </div>
  )
  return <div className="flex items-center justify-center py-16">{inner}</div>
}

// ── Toast ──────────────────────────────────────────
export function Toast({ msg, type }) {
  if (!msg) return null
  return (
    <div className={`toast ${type==="error" ? "toast-err" : "toast-ok"}`}>
      <span>{type==="error" ? "⚠" : "✓"}</span> {msg}
    </div>
  )
}

// ── useToast hook ──────────────────────────────────
import { useState, useCallback } from "react"
export function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((msg, type="success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)    //5 second
  }, [])
  return { toast, show }
}
