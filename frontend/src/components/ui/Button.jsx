// src/components/ui/Button.jsx
import React from "react"

const V = {
  gold:    "gold-btn text-resort-bg font-bold shadow-glow-g",
  outline: "bg-transparent text-gold border border-gold/40 hover:bg-gold/10",
  ghost:   "bg-transparent text-resort-muted hover:text-cream hover:bg-white/5",
  danger:  "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  surface: "bg-resort-s2 text-cream border border-white/[0.08] hover:bg-resort-s3",
  success: "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20",
}
const S = {
  xs: "px-3 py-1.5 text-[11px] rounded-lg",
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3 text-sm rounded-xl",
}

export default function Button({ children, variant="gold", size="md", loading=false, disabled=false, icon, onClick, type="button", className="", fullWidth=false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled||loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap cursor-pointer",
        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-body tracking-wide",
        V[variant]||V.gold, S[size]||S.md, fullWidth?"w-full":"", className,
      ].join(" ")}
    >
      {loading
        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full anim-spin" />
        : icon ? <span className="text-base leading-none">{icon}</span> : null}
      {children}
    </button>
  )
}
