// src/pages/admin/pages/ItemManage.jsx
import React, { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Modal  from "../../../components/ui/Modal"
import Input  from "../../../components/ui/Input"
import { Toast, useToast } from "../../../components/ui/Loader"

const CATEGORIES = ["Linen", "Toiletries", "Minibar", "Cleaning", "Kitchen", "Maintenance", "Office", "Other"]
const UNITS      = ["pcs", "kg", "ltr", "box", "roll", "pack", "bottle", "set"]

const CATEGORY_COLOR = {
  Linen:       "#5294E0",
  Toiletries:  "#9B7FE8",
  Minibar:     "#52C07A",
  Cleaning:    "#4ECDC4",
  Kitchen:     "#E0A852",
  Maintenance: "#E05252",
  Office:      "#C9A84C",
  Other:       "#6B6054",
}

const STORAGE_KEY = "resort_inventory"
const loadItems = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
  catch { return [] }
}
const saveItems = items => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

const emptyForm = { name: "", category: "Linen", quantity: "", minStock: "", unit: "pcs", notes: "" }

export default function ItemManage() {
  const [items,     setItemsState] = useState([])
  const [search,    setSearch]     = useState("")
  const [catFilter, setCatFilter]  = useState("All")
  const [modal,     setModal]      = useState(null)
  const [form,      setForm]       = useState(emptyForm)
  const { toast, show } = useToast()

  useEffect(() => { setItemsState(loadItems()) }, [])

  const setItems = updated => { setItemsState(updated); saveItems(updated) }

  const openCreate = () => { setForm(emptyForm); setModal("create") }
  const openEdit   = item => { setForm({ ...item }); setModal(item) }

  const save = e => {
    e.preventDefault()
    if (!form.name.trim()) { show("Name is required", "error"); return }
    if (modal === "create") {
      const newItem = { ...form, id: Date.now().toString(), quantity: +form.quantity || 0, minStock: +form.minStock || 0 }
      setItems([...items, newItem])
      show("Item added!")
    } else {
      setItems(items.map(i => i.id === modal.id ? { ...form, id: modal.id, quantity: +form.quantity || 0, minStock: +form.minStock || 0 } : i))
      show("Item updated!")
    }
    setModal(null)
  }

  const remove = id => {
    if (!window.confirm("Remove this item?")) return
    setItems(items.filter(i => i.id !== id))
    show("Item removed")
  }

  const adjustQty = (id, delta) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: Math.max(0, (i.quantity || 0) + delta) } : i))
  }

  const filtered = items.filter(i => {
    const mc = catFilter === "All" || i.category === catFilter
    const mq = (i.name || "").toLowerCase().includes(search.toLowerCase())
    return mc && mq
  })

  const lowStock   = items.filter(i => i.minStock > 0 && i.quantity <= i.minStock)
  const totalItems = items.reduce((s, i) => s + (i.quantity || 0), 0)

  return (
    <div>
      <Toast {...(toast || {})} />

      <div className="page-hd">
        <div>
          <h1 className="page-title">Item Manage</h1>
          <p className="page-sub">{items.length} item types · {totalItems} total units</p>
        </div>
        <Button variant="gold" icon="+" onClick={openCreate}>Add Item</Button>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-5 anim-up"
          style={{ background: "rgba(224,82,82,.08)", border: "1px solid rgba(224,82,82,.22)" }}>
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#E05252" }}>Low Stock Alert</p>
            <p className="text-resort-muted text-xs mt-0.5">{lowStock.map(i => i.name).join(" · ")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6 anim-up d1">
        {CATEGORIES.slice(0, 6).map(cat => {
          const count = items.filter(i => i.category === cat).length
          const color = CATEGORY_COLOR[cat] || "#C9A84C"
          return (
            <div key={cat} className="stat-card cursor-pointer" onClick={() => setCatFilter(catFilter === cat ? "All" : cat)}
              style={{ outline: catFilter === cat ? `1px solid ${color}40` : "none" }}>
              <div className="stat-bar" style={{ background: color }} />
              <p className="text-[10px] text-resort-muted uppercase tracking-widest mt-1">{cat}</p>
              <p className="font-display text-2xl font-bold mt-1" style={{ color }}>{count}</p>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap anim-up d2">
        <input placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} className="f-input flex-1 min-w-48 max-w-sm" />
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map(c => (
            <button key={c} className={`chip ${catFilter === c ? "on" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-p text-center py-16 anim-up">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="font-display text-xl text-cream mb-2">
            {items.length === 0 ? "No Items Yet" : "No items found"}
          </h3>
          <p className="text-resort-muted text-sm max-w-md mx-auto mb-6">
            {items.length === 0
              ? "Start tracking your hotel supplies — linen, toiletries, minibar items and more."
              : "No items match your current filter."}
          </p>
          {items.length === 0 && <Button variant="gold" onClick={openCreate}>Add First Item</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 anim-up d3">
          {filtered.map((item, i) => {
            const color = CATEGORY_COLOR[item.category] || "#C9A84C"
            const isLow = item.minStock > 0 && item.quantity <= item.minStock
            return (
              <div key={item.id} className={`card-p anim-up d${Math.min(i + 1, 5)}`} style={{ position: "relative" }}>
                <div className="stat-bar" style={{ background: color }} />
                {isLow && (
                  <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(224,82,82,.15)", color: "#E05252", border: "1px solid rgba(224,82,82,.3)" }}>
                    ⚠ Low Stock
                  </div>
                )}
                <div className="flex items-start justify-between mb-3 mt-1">
                  <div>
                    <h3 className="font-semibold text-cream text-base">{item.name}</h3>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${color}12`, color, border: `1px solid ${color}22`, marginTop: 4, display: "inline-block" }}>
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl font-bold" style={{ color, lineHeight: 1 }}>{item.quantity}</p>
                    <p className="text-[11px] text-resort-dim">{item.unit}</p>
                  </div>
                </div>
                {item.minStock > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-resort-dim">Stock level</span>
                      <span style={{ color: isLow ? "#E05252" : "#52C07A" }}>Min: {item.minStock} {item.unit}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.06)" }}>
                      <div style={{ height: "100%", borderRadius: 2, width: `${Math.min(100, (item.quantity / (item.minStock * 2)) * 100)}%`, background: isLow ? "#E05252" : "#52C07A", transition: "width .5s" }} />
                    </div>
                  </div>
                )}
                {item.notes && <p className="text-xs text-resort-dim mb-3">{item.notes}</p>}
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => adjustQty(item.id, -1)}
                    style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.2)", color: "#E05252", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span className="text-sm text-cream flex-1 text-center font-semibold">{item.quantity} {item.unit}</span>
                  <button onClick={() => adjustQty(item.id, +1)}
                    style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(82,192,122,.1)", border: "1px solid rgba(82,192,122,.2)", color: "#52C07A", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}>
                  <Button size="xs" variant="outline" onClick={() => openEdit(item)} className="flex-1">Edit</Button>
                  <Button size="xs" variant="danger"  onClick={() => remove(item.id)}>Remove</Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === "create" ? "+ Add Item" : "Edit Item"}
        subtitle="Inventory item details"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="gold" onClick={save}>{modal === "create" ? "Add Item" : "Save"}</Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Input label="Item Name" placeholder="e.g. Bath Towels" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />

          {/* FIX: was "grid grid-cols-2 gap-3" — Tailwind JIT unreliable inside modals */}
          <div className="form-grid-2">
            <Input label="Category"
              options={CATEGORIES.map(c => ({ value: c, label: c }))}
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })} />
            <Input label="Unit"
              options={UNITS.map(u => ({ value: u, label: u }))}
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })} />
          </div>

          {/* FIX: was "grid grid-cols-2 gap-3" — Tailwind JIT unreliable inside modals */}
          <div className="form-grid-2">
            <Input label="Current Quantity" type="number" placeholder="0" value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Min. Stock (alert threshold)" type="number" placeholder="0" value={form.minStock}
              onChange={e => setForm({ ...form, minStock: e.target.value })} />
          </div>

          <Input label="Notes" rows={2} placeholder="Storage location, supplier, etc." value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}