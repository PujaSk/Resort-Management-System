// src/components/ui/Modal.jsx
import React, { useEffect } from "react"

export default function Modal({ open, onClose, title, subtitle, children, footer, wide=false }) {
  useEffect(() => { document.body.style.overflow = open ? "hidden" : "" }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-in"
      style={{ background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)" }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        className={[
          "relative w-full card rounded-2xl shadow-modal overflow-y-auto max-h-[90vh] anim-up",
          wide ? "max-w-2xl" : "max-w-lg",
        ].join(" ")}>
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5"
          style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          <div>
            {title    && <h3 className="font-display text-xl font-semibold text-cream">{title}</h3>}
            {subtitle && <p className="text-resort-muted text-sm mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="ml-4 w-8 h-8 rounded-lg flex items-center justify-center text-resort-muted flex-shrink-0 transition-all duration-150 hover:text-red-400"
            style={{ background:"rgba(255,255,255,.05)" }}>✕</button>
        </div>
        {/* Body */}
        <div className="px-7 py-6">{children}</div>
        {/* Footer */}
        {footer && <div className="flex items-center justify-end gap-3 px-7 pb-6">{footer}</div>}
      </div>
    </div>
  )
}
