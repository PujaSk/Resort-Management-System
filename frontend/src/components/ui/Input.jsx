// src/components/ui/Input.jsx
import React, { useState } from "react"

export default function Input({ label, type="text", name, placeholder, value, onChange, required, disabled, error, hint, icon, options, rows, className="" }) {
  const [focused, setFocused] = useState(false)

  const fieldCls = [
    "f-input",
    icon ? "with-icon" : "",
    error ? "border-red-500/50 focus:border-red-500/50 focus:shadow-none" : "",
  ].join(" ")

  const field = options
    ? <select name={name} value={value} onChange={onChange} disabled={disabled} required={required}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} className={fieldCls}>
        <option value="">{placeholder||"Select…"}</option>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    : rows
      ? <textarea name={name} value={value} onChange={onChange} disabled={disabled} required={required}
          rows={rows} placeholder={placeholder}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          className={fieldCls+" resize-y"} />
      : <input type={type} name={name} value={value} onChange={onChange} disabled={disabled}
          required={required} placeholder={placeholder}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} className={fieldCls} />

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="f-label">{label}{required&&<span className="f-req">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-resort-dim text-base pointer-events-none">{icon}</span>}
        {field}
      </div>
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
      {hint && !error && <p className="text-resort-dim text-[11px]">{hint}</p>}
    </div>
  )
}
