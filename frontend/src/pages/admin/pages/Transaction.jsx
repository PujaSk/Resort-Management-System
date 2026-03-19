// src/pages/admin/pages/Transaction.jsx
import React, { useState, useEffect, useCallback } from "react"
import { getAllBookings } from "../../../services/bookingService"
import Badge from "../../../components/ui/Badge"
import Loader from "../../../components/ui/Loader"
import { Toast, useToast } from "../../../components/ui/Loader"
import Modal from "../../../components/ui/Modal"
import Button from "../../../components/ui/Button"
import { RupeeIcon } from "../../../components/ui/Icons"; 

const IST     = { timeZone: "Asia/Kolkata" }
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { ...IST, day: "2-digit", month: "short", year: "numeric" }) : "—"
const fmtTime = d => d ? new Date(d).toLocaleTimeString("en-IN", { ...IST, hour: "2-digit", minute: "2-digit" }) : ""
const fmtINR  = n => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"

const STATUS_COLOR = {
  "Booked":      "#5294E0",
  "Checked-In":  "#52C07A",
  "Checked-Out": "#6B6054",
  "Cancelled":   "#E05252",
}
const PAY_COLOR = {
  "Paid":           "#52C07A",
  "Partially Paid": "#E0A852",
  "Pending":        "#E05252",
}
const PAYMENT_LABEL = {
  credit_card: "💳 Credit Card",
  debit_card:  "💳 Debit Card",
  upi:         "📱 UPI",
  checkin:     "🏨 Pay at Check-in",
}

export default function Transaction() {
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [payFilter, setPayFilter] = useState("All")
  const [selected,  setSelected]  = useState(null)
  const { toast, show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getAllBookings()
      setBookings(r.data || [])
    } catch { show("Failed to load transactions", "error") }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Stats
  const totalRevenue = bookings.filter(b => b.bookingStatus !== "Cancelled").reduce((s, b) => s + (b.amountPaid || 0), 0)
  const pendingDue   = bookings.reduce((s, b) => s + (b.amountDue || 0), 0)
  const paidCount    = bookings.filter(b => b.paymentStatus === "Paid").length
  const partialCount = bookings.filter(b => b.paymentStatus === "Partially Paid").length

  // Filter
  const filtered = bookings.filter(b => {
    const ms = statusFilter === "All" || b.bookingStatus === statusFilter
    const mp = payFilter    === "All" || b.paymentStatus === payFilter
    const name = b.customer?.name || ""
    const room = b.room?.room_number || ""
    const mq = name.toLowerCase().includes(search.toLowerCase()) ||
               room.toLowerCase().includes(search.toLowerCase()) ||
               (b._id || "").includes(search)
    return ms && mp && mq
  })




  if (loading) return <Loader text="Loading transactions…" />

  return (
    <div>
      <Toast {...(toast || {})} />

      <div className="page-hd">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-sub">{bookings.length} total bookings · All payment records</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 anim-up d1">
        {[
          { label: "Total Collected", value: fmtINR(totalRevenue), color: "#52C07A",
            Icon: ()=><RupeeIcon size={28} color="#52c07a"/> },
            { label: "Pending Due",     value: fmtINR(pendingDue),   color: "#E0A852",
            Icon: ()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
          { label: "Fully Paid",      value: paidCount,            color: "#5294E0",
            Icon: ()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
          { label: "Partial Pay",     value: partialCount,         color: "#9B7FE8",
            Icon: ()=><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg> },
        ].map((k, i) => (
          <div key={k.label} className="stat-card">
            <div className="stat-bar" style={{ background: k.color }} />
            <div className="flex justify-between items-start mt-1">
              <div>
                <p className="text-[11px] text-resort-muted uppercase tracking-widest mb-2">{k.label}</p>
                <p className="font-display text-3xl font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${k.color}15`, border: `1px solid ${k.color}22`, color: k.color }}>
                <k.Icon/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 anim-up d2">
        <input
          placeholder="Search guest, room, booking ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="f-input flex-1 min-w-48 max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {["All", "Booked", "Checked-In", "Checked-Out", "Cancelled"].map(s => (
            <button key={s} className={`chip ${statusFilter === s ? "on" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Paid", "Partially Paid", "Pending"].map(s => (
            <button key={s} className={`chip ${payFilter === s ? "on" : ""}`} onClick={() => setPayFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card-p anim-up d3" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                {["Guest", "Room / Type", "Check-in → Check-out", "Total", "Paid", "Due", "Booking", "Payment", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#6B6054", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: "48px 16px", textAlign: "center", color: "#6B6054" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💳</div>
                    <p>No transactions found</p>
                  </td>
                </tr>
              ) : filtered.map((b, i) => {
                const nights = Math.round((new Date(b.checkOutDateTime) - new Date(b.checkInDateTime)) / 86400000)
                const bCol = STATUS_COLOR[b.bookingStatus] || "#6B6054"
                const pCol = PAY_COLOR[b.paymentStatus] || "#6B6054"
                return (
                  <tr key={b._id}
                    onClick={() => setSelected(b)}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,.04)",
                      cursor: "pointer",
                      transition: "background .15s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#C9A84C", flexShrink: 0 }}>
                          {(b.customer?.name || "G")[0].toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#F5ECD7" }}>{b.customer?.name || "Guest"}</p>
                          <p style={{ fontSize: 11, color: "#6B6054" }}>{b.customer?.phoneno || b.customer?.email || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, color: "#C9A84C", fontWeight: 700 }}>
                        {b.room ? `#${b.room.room_number}` : "—"}
                      </p>
                      <p style={{ fontSize: 11, color: "#6B6054" }}>{b.roomType?.type_name || "—"}</p>
                    </td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: 12, color: "#C8BAA0" }}>{fmtDate(b.checkInDateTime)}</p>
                      <p style={{ fontSize: 11, color: "#6B6054" }}>→ {fmtDate(b.checkOutDateTime)} <span style={{ color: "#5e5647" }}>({nights}n)</span></p>
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, color: "#F5ECD7" }}>{fmtINR(b.totalAmount)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, color: "#52C07A" }}>{fmtINR(b.amountPaid)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, color: b.amountDue > 0 ? "#E0A852" : "#6B6054" }}>{fmtINR(b.amountDue)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: `${bCol}15`, color: bCol, border: `1px solid ${bCol}25` }}>{b.bookingStatus}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: `${pCol}15`, color: pCol, border: `1px solid ${pCol}25` }}>{b.paymentStatus}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(b) }}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", color: "#C9A84C", cursor: "pointer" }}
                      >View</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Booking — ${selected?.customer?.name || "Guest"}`}
        subtitle={`ID: ${selected?._id || ""}`}
        footer={
          <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
        }
      >
        {selected && (() => {
          const b = selected
          const nights = Math.round((new Date(b.checkOutDateTime) - new Date(b.checkInDateTime)) / 86400000)
          const isPaid = b.paymentStatus === "Paid"
          const bCol = STATUS_COLOR[b.bookingStatus] || "#6B6054"
          const pCol = PAY_COLOR[b.paymentStatus] || "#6B6054"
          return (
            <div className="space-y-4">
              {/* Guest */}
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontSize: 10, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Guest</p>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#C9A84C" }}>
                    {(b.customer?.name || "G")[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: "#F5ECD7" }}>{b.customer?.name || "—"}</p>
                    <p style={{ fontSize: 12, color: "#6B6054" }}>{b.customer?.email || ""} · {b.customer?.phoneno || ""}</p>
                  </div>
                </div>
              </div>

              {/* Stay + Payment grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Room", b.room ? `#${b.room.room_number}` : "—"],
                  ["Room Type", b.roomType?.type_name || "—"],
                  ["Check-in", fmtDate(b.checkInDateTime)],
                  ["Check-out", fmtDate(b.checkOutDateTime)],
                  ["Duration", `${nights} night${nights !== 1 ? "s" : ""}`],
                  ["Guests", `${b.adults || 0} adults${b.children ? `, ${b.children} children` : ""}`],
                  ["Total Amount", fmtINR(b.totalAmount)],
                  ["Amount Paid", fmtINR(b.amountPaid)],
                  ["Amount Due", fmtINR(b.amountDue)],
                  ["Payment Method", PAYMENT_LABEL[b.paymentDetails?.method] || b.paymentDetails?.method || "—"],
                ].map(([label, value]) => (
                  <div key={label} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)" }}>
                    <p style={{ fontSize: 9, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#F5ECD7" }}>{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Status chips */}
              <div className="flex gap-3">
                <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: `${bCol}10`, border: `1px solid ${bCol}20`, textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "#6B6054", textTransform: "uppercase", marginBottom: 4 }}>Booking</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: bCol }}>{b.bookingStatus}</p>
                </div>
                <div style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: `${pCol}10`, border: `1px solid ${pCol}20`, textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "#6B6054", textTransform: "uppercase", marginBottom: 4 }}>Payment</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: pCol }}>{b.paymentStatus}</p>
                </div>
              </div>

              {/* Cancellation info */}
              {b.bookingStatus === "Cancelled" && (
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(224,82,82,.08)", border: "1px solid rgba(224,82,82,.2)" }}>
                  <p style={{ fontSize: 11, color: "#E05252", marginBottom: 6, fontWeight: 600 }}>Cancellation Details</p>
                  <p style={{ fontSize: 12, color: "#C8BAA0" }}>Fee: {fmtINR(b.cancellationFee)} · Refund: {fmtINR(b.cancellationRefund)}</p>
                </div>
              )}

              {/* Feedback */}
              {b.feedback?.rating && (
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.15)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{"⭐".repeat(b.feedback.rating)}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#C9A84C" }}>{b.feedback.rating}/5</span>
                  </div>
                  {b.feedback.comment && <p style={{ fontSize: 12, color: "#8A7E6A", fontStyle: "italic" }}>"{b.feedback.comment}"</p>}
                </div>
              )}
            </div>
          )
        })()}
      </Modal>
    </div>
  )
}