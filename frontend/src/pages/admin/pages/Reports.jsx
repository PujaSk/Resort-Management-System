// src/pages/admin/pages/Reports.jsx
import React, { useEffect, useState, useCallback } from "react"
import { getAllBookings } from "../../../services/bookingService"
import { getRooms } from "../../../services/roomService"
import { getStaffList } from "../../../services/staffService"
import { getCustomers } from "../../../services/customerService"
import { RupeeIcon } from "../../../components/ui/Icons"

const fmt    = (n = 0) => "₹" + Number(n).toLocaleString("en-IN")
const fmtPct = (n = 0) => Number(n).toFixed(1) + "%"

/* ─── mini bar ───────────────────────────────────────────── */
function Bar({ label, value, max, color = "#C9A84C", suffix = "" }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-resort-muted w-32 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,.06)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs text-cream font-semibold w-20 text-right flex-shrink-0">{suffix || value}</span>
    </div>
  )
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function Reports() {
  const [bookings,  setBookings]  = useState([])
  const [rooms,     setRooms]     = useState([])
  const [staff,     setStaff]     = useState([])
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [period,    setPeriod]    = useState("all") // all | month | week

  const load = useCallback(async () => {
    const [b, r, s, c] = await Promise.allSettled([getAllBookings(), getRooms(), getStaffList(), getCustomers()])
    if (b.status === "fulfilled") setBookings(b.value.data || [])
    if (r.status === "fulfilled") setRooms(r.value.data || [])
    if (s.status === "fulfilled") setStaff(s.value.data || [])
    if (c.status === "fulfilled") setCustomers(c.value.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Filter bookings by period
  const now  = new Date()
  const filtered = bookings.filter(b => {
    if (period === "all") return true
    const d = new Date(b.createdAt)
    if (period === "month") return (now - d) < 30 * 86400000
    if (period === "week")  return (now - d) < 7  * 86400000
    return true
  })

  const active  = filtered.filter(b => b.bookingStatus !== "Cancelled")
  const revenue = active.reduce((s, b) => s + (b.amountPaid || 0), 0)
  const pending = filtered.filter(b => b.paymentStatus === "Pending" && b.bookingStatus !== "Cancelled")
                         .reduce((s, b) => s + (b.amountDue || 0), 0)

  // Revenue by room type
  const byType = {}
  active.forEach(b => {
    const k = b.roomType?.type_name || "Unknown"
    byType[k] = (byType[k] || 0) + (b.totalAmount || 0)
  })
  const byTypeArr = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const maxType   = byTypeArr[0]?.[1] || 1

  // Bookings per month (last 6)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" })
    const count = bookings.filter(b => {
      const bd = new Date(b.createdAt)
      return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear()
    }).length
    return { label, count }
  })
  const maxMonth = Math.max(...months.map(m => m.count), 1)

  // Staff by designation
  const byDesig = {}
  staff.forEach(s => { byDesig[s.designation] = (byDesig[s.designation] || 0) + 1 })
  const byDesigArr = Object.entries(byDesig).sort((a, b) => b[1] - a[1])

  // Occupancy
  const occupiedRooms = rooms.filter(r => r.status === "Occupied" || r.status === "Booked").length
  const occupancyRate = rooms.length > 0 ? (occupiedRooms / rooms.length) * 100 : 0

  // Top customers
  const custSpend = {}
  active.forEach(b => {
    const k = b.customer?.name || b.customer || "Unknown"
    custSpend[k] = (custSpend[k] || 0) + (b.amountPaid || 0)
  })
  const topCusts = Object.entries(custSpend).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxCust  = topCusts[0]?.[1] || 1

  return (
    <div className="space-y-6">
      <div className="page-hd">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Business analytics and performance insights</p>
        </div>
        <div className="flex gap-2">
          {[["all","All Time"],["month","This Month"],["week","This Week"]].map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: period === v ? "rgba(201,168,76,.15)" : "rgba(255,255,255,.04)",
                border: `1px solid ${period === v ? "rgba(201,168,76,.4)" : "rgba(255,255,255,.08)"}`,
                color: period === v ? "#C9A84C" : "#888",
              }}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label:"Total Revenue",     value: fmt(revenue),          color:"#C9A84C",
              Icon: ()=><RupeeIcon size={28} color="#c9a84c"/> },
              { label:"Pending Collection",value: fmt(pending),          color:"#f5a623",
              Icon: ()=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label:"Total Bookings",    value: filtered.length,       color:"#5b9cf6",
              Icon: ()=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
            { label:"Room Occupancy",    value: fmtPct(occupancyRate), color:"#52C07A",
              Icon: ()=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><path d="M9 22V12h6v10"/><path d="M3 8h18"/></svg> },
          ].map(k => (
            <div key={k.label} className="card-p flex items-center gap-4 anim-up">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${k.color}18`, border: `1px solid ${k.color}30`, color: k.color }}>
                <k.Icon/>
              </div>
              <div>
                <p className="text-resort-muted text-xs uppercase tracking-wider mb-0.5">{k.label}</p>
                <p className="font-display text-xl font-bold text-cream">{k.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Revenue by Room Type */}
        <div className="card-p anim-up">
          <h3 className="font-display text-base font-semibold text-cream mb-1">Revenue by Room Type</h3>
          <p className="text-resort-muted text-xs mb-5">Cumulative booking revenue</p>
          {loading ? <div className="h-40 skeleton rounded-xl" /> : (
            byTypeArr.length === 0
              ? <p className="text-resort-muted text-sm text-center py-8">No data</p>
              : <div className="space-y-3">
                  {byTypeArr.map(([type, val]) => (
                    <Bar key={type} label={type} value={val} max={maxType} suffix={fmt(val)} />
                  ))}
                </div>
          )}
        </div>

        {/* Bookings per Month */}
        <div className="card-p anim-up" style={{ animationDelay: "60ms" }}>
          <h3 className="font-display text-base font-semibold text-cream mb-1">Monthly Bookings</h3>
          <p className="text-resort-muted text-xs mb-5">Last 6 months</p>
          {loading ? <div className="h-40 skeleton rounded-xl" /> : (
            <div className="space-y-3">
              {months.map(m => (
                <Bar key={m.label} label={m.label} value={m.count} max={maxMonth} suffix={`${m.count} bookings`} color="#5b9cf6" />
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="card-p anim-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-display text-base font-semibold text-cream mb-1">Top Customers</h3>
          <p className="text-resort-muted text-xs mb-5">By total amount paid</p>
          {loading ? <div className="h-40 skeleton rounded-xl" /> : (
            topCusts.length === 0
              ? <p className="text-resort-muted text-sm text-center py-8">No data</p>
              : <div className="space-y-3">
                  {topCusts.map(([name, val]) => (
                    <Bar key={name} label={name} value={val} max={maxCust} suffix={fmt(val)} color="#c084fc" />
                  ))}
                </div>
          )}
        </div>

        {/* Staff by Designation */}
        <div className="card-p anim-up" style={{ animationDelay: "140ms" }}>
          <h3 className="font-display text-base font-semibold text-cream mb-1">Staff Breakdown</h3>
          <p className="text-resort-muted text-xs mb-5">{staff.length} total staff members</p>
          {loading ? <div className="h-40 skeleton rounded-xl" /> : (
            byDesigArr.length === 0
              ? <p className="text-resort-muted text-sm text-center py-8">No staff</p>
              : <div className="space-y-3">
                  {byDesigArr.map(([desig, count]) => (
                    <Bar key={desig} label={desig} value={count} max={byDesigArr[0][1]} suffix={`${count} members`} color="#52C07A" />
                  ))}
                </div>
          )}
        </div>

      </div>

      {/* Booking status breakdown */}
      <div className="card-p anim-up">
        <h3 className="font-display text-base font-semibold text-cream mb-5">Booking Status Breakdown</h3>
        {loading ? <div className="h-16 skeleton rounded-xl" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label:"Booked",        color:"#5b9cf6" },
              { label:"Checked-In",    color:"#52C07A" },
              { label:"Checked-Out",   color:"#9CA3AF" },
              { label:"Cancelled",     color:"#e05c5c" },
            ].map(s => {
              const count = filtered.filter(b => b.bookingStatus === s.label).length
              const pct   = filtered.length > 0 ? (count / filtered.length) * 100 : 0
              return (
                <div key={s.label} className="rounded-xl p-4 text-center"
                  style={{ background: `${s.color}12`, border: `1px solid ${s.color}40` }}>
                  <p className="font-bold text-2xl" style={{ color: s.color }}>{count}</p>
                  <p className="text-xs text-resort-muted mt-1">{s.label}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: s.color }}>{fmtPct(pct)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}