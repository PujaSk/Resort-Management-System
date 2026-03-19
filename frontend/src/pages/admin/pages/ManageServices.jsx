// src/pages/admin/pages/ManageServices.jsx
// ─────────────────────────────────────────────
// Full services catalog management.
// Data persists via localStorage (no backend endpoint for services).
// ─────────────────────────────────────────────
import React, { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Modal  from "../../../components/ui/Modal"
import Input  from "../../../components/ui/Input"
import { Toast, useToast } from "../../../components/ui/Loader"

const CATEGORIES = ["Dining", "Spa & Wellness", "Laundry", "Transport", "Room Service", "Activities", "Business", "Other"]
const STATUSES   = ["Active", "Inactive", "Coming Soon"]

const CAT_ICON = {
  "Dining":        "🍽",
  "Spa & Wellness": "💆",
  "Laundry":       "👕",
  "Transport":     "🚗",
  "Room Service":  "🛎",
  "Activities":    "🎯",
  "Business":      "💼",
  "Other":         "✦",
}
const CAT_COLOR = {
  "Dining":        "#E0A852",
  "Spa & Wellness": "#9B7FE8",
  "Laundry":       "#5294E0",
  "Transport":     "#52C07A",
  "Room Service":  "#C9A84C",
  "Activities":    "#E05252",
  "Business":      "#4ECDC4",
  "Other":         "#6B6054",
}
const STATUS_COLOR = {
  Active:       "#52C07A",
  Inactive:     "#E05252",
  "Coming Soon": "#E0A852",
}

const STORAGE_KEY = "resort_services"
const loadServices = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}
const saveServices = s => localStorage.setItem(STORAGE_KEY, JSON.stringify(s))

const emptyForm = {
  name: "", category: "Dining", price: "", unit: "per person", status: "Active",
  description: "", availability: "24/7", icon: ""
}

export default function ManageServices() {
  const [services, setServicesState] = useState([])
  const [search,   setSearch]  = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const [modal,    setModal]   = useState(null)
  const [form,     setForm]    = useState(emptyForm)
  const { toast, show } = useToast()

  useEffect(() => { setServicesState(loadServices()) }, [])

  const setServices = updated => { setServicesState(updated); saveServices(updated) }

  const openCreate = () => { setForm(emptyForm); setModal("create") }
  const openEdit   = svc => { setForm({ ...svc }); setModal(svc) }

  const save = e => {
    e.preventDefault()
    if (!form.name.trim()) { show("Name is required", "error"); return }
    if (modal === "create") {
      setServices([...services, { ...form, id: Date.now().toString(), price: +form.price || 0 }])
      show("Service added!")
    } else {
      setServices(services.map(s => s.id === modal.id ? { ...form, id: modal.id, price: +form.price || 0 } : s))
      show("Service updated!")
    }
    setModal(null)
  }

  const remove = id => {
    if (!window.confirm("Remove this service?")) return
    setServices(services.filter(s => s.id !== id))
    show("Service removed")
  }

  const toggleStatus = id => {
    setServices(services.map(s => {
      if (s.id !== id) return s
      const next = s.status === "Active" ? "Inactive" : "Active"
      return { ...s, status: next }
    }))
  }

  const filtered = services.filter(s => {
    const mc = catFilter === "All" || s.category === catFilter
    const mq = (s.name || "").toLowerCase().includes(search.toLowerCase())
    return mc && mq
  })

  const activeCount = services.filter(s => s.status === "Active").length

  return (
    <div>
      <Toast {...(toast || {})} />

      <div className="page-hd">
        <div>
          <h1 className="page-title">Manage Services</h1>
          <p className="page-sub">{services.length} services · {activeCount} active</p>
        </div>
        <Button variant="gold" icon="+" onClick={openCreate}>Add Service</Button>
      </div>

      {/* Category stat chips */}
      <div className="grid grid-cols-4 lg:grid-cols-8 gap-2 mb-6 anim-up d1">
        {CATEGORIES.map(cat => {
          const count = services.filter(s => s.category === cat).length
          const color = CAT_COLOR[cat] || "#C9A84C"
          const icon  = CAT_ICON[cat] || "✦"
          return (
            <div key={cat} className="stat-card cursor-pointer text-center"
              onClick={() => setCatFilter(catFilter === cat ? "All" : cat)}
              style={{ padding: "10px 8px", outline: catFilter === cat ? `1px solid ${color}40` : "none" }}>
              <div className="stat-bar" style={{ background: color }} />
              <div style={{ fontSize: 20, marginBottom: 4, marginTop: 4 }}>{icon}</div>
              <p style={{ fontSize: 9, color: "#6B6054", textTransform: "uppercase", marginBottom: 2 }}>{cat.split(" ")[0]}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color }}>{count}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-4 flex-wrap anim-up d2">
        <input placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} className="f-input flex-1 min-w-48 max-w-sm" />
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map(c => (
            <button key={c} className={`chip ${catFilter === c ? "on" : ""}`} onClick={() => setCatFilter(c)}>{CAT_ICON[c] || ""} {c}</button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      {filtered.length === 0 ? (
        <div className="card-p text-center py-16 anim-up">
          <div className="text-5xl mb-4">🍽</div>
          <h3 className="font-display text-xl text-cream mb-2">
            {services.length === 0 ? "No Services Yet" : "No services found"}
          </h3>
          <p className="text-resort-muted text-sm max-w-md mx-auto mb-6">
            {services.length === 0
              ? "Add your hotel's offerings — dining, spa, laundry, transport and more."
              : "No services match your current filter."}
          </p>
          {services.length === 0 && <Button variant="gold" onClick={openCreate}>Add First Service</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-up d3">
          {filtered.map((svc, i) => {
            const color  = CAT_COLOR[svc.category] || "#C9A84C"
            const icon   = svc.icon || CAT_ICON[svc.category] || "✦"
            const sColor = STATUS_COLOR[svc.status] || "#6B6054"
            return (
              <div key={svc.id} className={`card-p anim-up d${Math.min(i + 1, 5)}`} style={{ position: "relative" }}>
                <div className="stat-bar" style={{ background: color }} />

                {/* Status toggle */}
                <div style={{ position: "absolute", top: 12, right: 12 }}>
                  <button onClick={() => toggleStatus(svc.id)}
                    style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${sColor}15`, color: sColor, border: `1px solid ${sColor}25`, cursor: "pointer" }}>
                    {svc.status}
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-3 mt-1">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div className="flex-1 pr-12">
                    <h3 className="font-semibold text-cream text-base leading-tight">{svc.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${color}12`, color, border: `1px solid ${color}22`, marginTop: 4, display: "inline-block" }}>
                      {svc.category}
                    </span>
                  </div>
                </div>

                {svc.description && (
                  <p className="text-xs text-resort-dim leading-relaxed mb-3"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {svc.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div>
                    {svc.price ? (
                      <span className="font-bold text-lg" style={{ color }}>₹{Number(svc.price).toLocaleString("en-IN")}</span>
                    ) : (
                      <span className="text-resort-dim text-sm">Price on request</span>
                    )}
                    {svc.unit && <span className="text-xs text-resort-dim ml-1">{svc.unit}</span>}
                  </div>
                  {svc.availability && (
                    <span style={{ fontSize: 10, color: "#8A7E6A" }}>🕐 {svc.availability}</span>
                  )}
                </div>

                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                  <Button size="xs" variant="outline" onClick={() => openEdit(svc)} className="flex-1">Edit</Button>
                  <Button size="xs" variant="danger"  onClick={() => remove(svc.id)}>Remove</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "+ Add Service" : "Edit Service"}
        subtitle="Service catalog details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="gold" onClick={save}>{modal === "create" ? "Add Service" : "Save"}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Service Name" placeholder="e.g. Spa Treatment" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Icon (emoji)" placeholder="💆" value={form.icon}
              onChange={e => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Category"
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="Status"
              options={STATUSES.map(s => ({ value: s, label: s }))}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (₹)" type="number" placeholder="0 for price on request" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} />
            <Input label="Price Unit" placeholder="per person / per session" value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>
          <Input label="Availability" placeholder="24/7 / 9 AM – 9 PM" value={form.availability}
            onChange={e => setForm({ ...form, availability: e.target.value })} />
          <Input label="Description" rows={3} placeholder="Brief description of this service…"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}