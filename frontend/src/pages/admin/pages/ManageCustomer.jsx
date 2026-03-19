// src/pages/admin/pages/ManageCustomer.jsx
// ──────────────────────────────────────────────────────────────
// Reads customers from the bookings API (populated customer field).
// Admin can VIEW customers and their booking history.
// There is no backend endpoint for admin-side customer CRUD.
// ──────────────────────────────────────────────────────────────
import React, { useState, useEffect, useCallback } from "react"
import { getAllBookings } from "../../../services/bookingService"
import Badge   from "../../../components/ui/Badge"
import Table   from "../../../components/ui/Table"
import Loader  from "../../../components/ui/Loader"
import Modal   from "../../../components/ui/Modal"
import Button  from "../../../components/ui/Button"
import { Toast, useToast } from "../../../components/ui/Loader"

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"
const fmtINR  = n => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"

export default function ManageCustomer() {
  const [customers, setCustomers] = useState([])   // deduplicated from bookings
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [selected,  setSelected]  = useState(null) // customer detail modal
  const { toast, show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getAllBookings()
      const allBookings = r.data || []
      setBookings(allBookings)

      // Deduplicate customers from booking records
      const custMap = {}
      allBookings.forEach(b => {
        const c = b.customer
        if (!c || !c._id) return
        const id = c._id.toString()
        if (!custMap[id]) {
          custMap[id] = { ...c, bookings: [] }
        }
        custMap[id].bookings.push(b)
      })
      setCustomers(Object.values(custMap))
    } catch { show("Failed to load customers", "error") }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = customers.filter(c =>
    (c.name  || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phoneno || "").includes(search)
  )

  const getCustomerStats = c => {
    const bs = c.bookings || []
    const spent    = bs.filter(b => b.bookingStatus !== "Cancelled").reduce((s, b) => s + (b.amountPaid || 0), 0)
    const checkins = bs.filter(b => b.bookingStatus === "Checked-Out").length
    const active   = bs.filter(b => b.bookingStatus === "Booked" || b.bookingStatus === "Checked-In").length
    const lastVisit = bs.sort((a, b) => new Date(b.checkInDateTime) - new Date(a.checkInDateTime))[0]?.checkInDateTime
    return { spent, checkins, active, lastVisit, total: bs.length }
  }

  const cols = [
    {
      key: "name", label: "Guest",
      render: (v, r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-gold flex-shrink-0"
            style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)" }}>
            {(v || "G")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-cream">{v || "—"}</p>
            <p className="text-xs text-resort-dim">{r.email || ""}</p>
          </div>
        </div>
      )
    },
    { key: "phoneno", label: "Phone", render: v => v || "—" },
    { key: "city",    label: "City",  render: v => v || "—" },
    {
      key: "isEmailVerified", label: "Verified",
      render: v => <Badge label={v ? "Verified" : "Unverified"} variant={v ? "Available" : "Maintenance"} size="sm" />
    },
    {
      key: "_id", label: "Bookings / Spent",
      render: (_, r) => {
        const s = getCustomerStats(r)
        return (
          <div>
            <p className="text-sm font-semibold text-cream">{s.total} booking{s.total !== 1 ? "s" : ""}</p>
            <p className="text-xs" style={{ color: "#52C07A" }}>{fmtINR(s.spent)} spent</p>
          </div>
        )
      }
    },
    {
      key: "__actions", label: "Actions",
      render: (_, r) => (
        <Button size="xs" variant="outline" onClick={() => setSelected(r)}>View Details</Button>
      )
    },
  ]

  return (
    <div>
      <Toast {...(toast || {})} />

      <div className="page-hd">
        <div>
          <h1 className="page-title">Manage Customers</h1>
          <p className="page-sub">{customers.length} registered guests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6 anim-up d1">
        {[
          { label: "Total Guests",   value: customers.length,
            color: "#C9A84C",
            sub: "from all bookings" },
          { label: "Verified Email", value: customers.filter(c => c.isEmailVerified).length,
            color: "#52C07A",
            sub: "email confirmed" },
          { label: "Active Stays",   value: bookings.filter(b => b.bookingStatus === "Checked-In").length,
            color: "#5294E0",
            sub: "currently in-house" },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-bar" style={{ background: k.color }} />
            <p className="text-[11px] text-resort-muted uppercase tracking-widest mt-1">{k.label}</p>
            <p className="font-display text-3xl font-bold mt-1" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs text-resort-dim mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 anim-up d2">
        <input placeholder="Search name, email, or phone…" value={search}
          onChange={e => setSearch(e.target.value)} className="f-input max-w-sm" />
      </div>

      <div className="anim-up d3">
        <Table columns={cols} data={filtered} loading={loading} emptyMsg="No guests found" />
      </div>

      {/* Customer Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name || "Guest Details"}
        subtitle={selected?.email || ""}
        wide
        footer={<Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>}
      >
        {selected && (() => {
          const stats = getCustomerStats(selected)
          const bs    = [...(selected.bookings || [])].sort((a, b) => new Date(b.checkInDateTime) - new Date(a.checkInDateTime))
          return (
            <div className="space-y-4">
              {/* Profile */}
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#C9A84C" }}>
                    {(selected.name || "G")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-cream text-base">{selected.name}</p>
                    <p className="text-xs text-resort-dim">{selected.email}</p>
                    <div className="mt-1">
                      <Badge label={selected.isEmailVerified ? "Verified" : "Unverified"} variant={selected.isEmailVerified ? "Available" : "Maintenance"} size="sm" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Phone",   selected.phoneno || "—"],
                    ["City",    selected.city    || "—"],
                    ["Address", selected.address || "—"],
                    ["Joined",  fmtDate(selected.createdAt)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ padding: "8px 10px", borderRadius: 6, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.04)" }}>
                      <p style={{ fontSize: 9, color: "#6B6054", textTransform: "uppercase", marginBottom: 3 }}>{l}</p>
                      <p style={{ fontSize: 12, color: "#F5ECD7", fontWeight: 500 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Total Bookings",  value: stats.total,         color: "#C9A84C" },
                  { label: "Completed Stays", value: stats.checkins,      color: "#52C07A" },
                  { label: "Active / Booked", value: stats.active,        color: "#5294E0" },
                  { label: "Total Spent",     value: fmtINR(stats.spent), color: "#9B7FE8" },
                ].map(s => (
                  <div key={s.label} style={{ padding: "10px", borderRadius: 8, background: `${s.color}08`, border: `1px solid ${s.color}18`, textAlign: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 9, color: "#6B6054", marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Booking history */}
              {bs.length > 0 && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Booking History</p>
                  <div className="space-y-2" style={{ maxHeight: 260, overflowY: "auto" }}>
                    {bs.map(b => {
                      const nights = Math.round((new Date(b.checkOutDateTime) - new Date(b.checkInDateTime)) / 86400000)
                      const bColor = { "Booked": "#5294E0", "Checked-In": "#52C07A", "Checked-Out": "#6B6054", "Cancelled": "#E05252" }[b.bookingStatus] || "#6B6054"
                      return (
                        <div key={b._id} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span style={{ fontSize: 12, fontWeight: 600, color: "#F5ECD7" }}>
                                {b.room ? `Room #${b.room.room_number}` : b.roomType?.type_name || "—"}
                              </span>
                              <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 20, background: `${bColor}15`, color: bColor, border: `1px solid ${bColor}22` }}>{b.bookingStatus}</span>
                            </div>
                            <p style={{ fontSize: 11, color: "#6B6054" }}>
                              {fmtDate(b.checkInDateTime)} → {fmtDate(b.checkOutDateTime)} · {nights}n
                            </p>
                          </div>
                          <div className="text-right">
                            <p style={{ fontSize: 13, fontWeight: 700, color: "#52C07A" }}>{fmtINR(b.amountPaid)}</p>
                            {b.amountDue > 0 && <p style={{ fontSize: 10, color: "#E0A852" }}>Due: {fmtINR(b.amountDue)}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}