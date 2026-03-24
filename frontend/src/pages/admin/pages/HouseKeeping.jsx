// src/pages/admin/pages/HouseKeeping.jsx
import React, { useState, useEffect } from "react"
import { getRooms, updateRoomStatus } from "../../../services/roomService"
import Badge  from "../../../components/ui/Badge"
import Loader from "../../../components/ui/Loader"
import { Toast, useToast } from "../../../components/ui/Loader"
import { LockIcon } from "lucide-react"

const ACCENT = {
  Available:   "#52C07A",
  Occupied:    "#E05252",
  Cleaning:    "#E0A852",
  Maintenance: "#5294E0",
  Booked:      "#C9A84C",
}

// Rooms in these statuses cannot be manually changed by housekeeping
const LOCKED_STATUSES = ["Occupied", "Booked", "Checked-In"]
const HK_STATUSES     = ["Available", "Cleaning", "Maintenance"]
const ALL_STATUSES    = ["Available", "Occupied", "Booked", "Cleaning", "Maintenance"]

export default function HouseKeeping() {
  const [rooms,      setRooms]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [floor,      setFloor]      = useState("All")
  const [statusFilt, setStatusFilt] = useState("All")
  const { toast, show } = useToast()

  const load = async () => {
    setLoading(true)
    try { const r = await getRooms(); setRooms(r.data || []) }
    catch { show("Failed to load", "error") }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const changeStatus = async (id, status) => {
    try { await updateRoomStatus(id, status); show("Status updated!"); load() }
    catch { show("Failed to update status", "error") }
  }

  const floors   = ["All", ...[...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b)]
  const attention = rooms.filter(r => r.status === "Cleaning" || r.status === "Maintenance")

  const filtered = rooms.filter(r => {
    const matchFloor  = floor === "All" || r.floor === +floor
    const matchStatus = statusFilt === "All" || r.status === statusFilt
    return matchFloor && matchStatus
  })

  // count per status for filter badges
  const countByStatus = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = rooms.filter(r => r.status === s).length
    return acc
  }, {})

  if (loading) return <Loader text="Loading rooms…" />

  return (
    <div>
      <Toast {...(toast || {})} />

      <div className="page-hd">
        <div>
          <h1 className="page-title">House Keeping</h1>
          <p className="page-sub">{attention.length} rooms need attention · {rooms.length} total</p>
        </div>
      </div>

      {/* Attention banner */}
      {attention.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-5 anim-up"
          style={{ background: "rgba(224,168,82,.08)", border: "1px solid rgba(224,168,82,.22)" }}>
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm" style={{ color: "#E0A852" }}>Rooms Requiring Attention</p>
            <p className="text-resort-muted text-xs mt-0.5">{attention.map(r => `Room #${r.room_number}`).join(" · ")}</p>
          </div>
        </div>
      )}

      {/* ── Filters row ── */}
      <div className="space-y-3 mb-5 anim-up d1">

        {/* Floor filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Floor</span>
          {floors.map(f => (
            <button key={f} className={`chip ${floor === String(f) ? "on" : ""}`}
              onClick={() => setFloor(String(f))}>
              {f === "All" ? "All Floors" : `Floor ${f}`}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6B6054", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Status</span>
          <button className={`chip ${statusFilt === "All" ? "on" : ""}`}
            onClick={() => setStatusFilt("All")}>
            All <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.7 }}>{rooms.length}</span>
          </button>
          {ALL_STATUSES.map(s => {
            const count  = countByStatus[s] || 0
            const accent = ACCENT[s] || "#6B6054"
            const active = statusFilt === s
            return (
              <button key={s}
                onClick={() => setStatusFilt(s)}
                style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", transition: "all .15s",
                  background: active ? `${accent}22` : "rgba(255,255,255,.04)",
                  border:     active ? `1px solid ${accent}66` : "1px solid rgba(255,255,255,.08)",
                  color:      active ? accent : "#6B6054",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? accent : "#6B6054", flexShrink: 0 }}/>
                {s}
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 10,
                  background: active ? `${accent}30` : "rgba(255,255,255,.06)",
                  color: active ? accent : "#6B6054",
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: 11, color: "#6B6054", marginBottom: 12 }}>
        Showing <strong style={{ color: "#C8BAA0" }}>{filtered.length}</strong> room{filtered.length !== 1 ? "s" : ""}
        {floor !== "All" && ` on Floor ${floor}`}
        {statusFilt !== "All" && ` · ${statusFilt}`}
      </p>

      {/* Room grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 anim-up d2">
        {filtered.map(room => {
          const isLocked = LOCKED_STATUSES.includes(room.status)
          const accent   = ACCENT[room.status] || "#C9A84C"

          return (
            <div key={room._id} className="stat-card" style={{
              opacity: isLocked ? 0.75 : 1,
              position: "relative",
              transition: "opacity .2s",
            }}>
              <div className="stat-bar" style={{ background: accent }} />

              {/* Lock badge for occupied/booked */}
              {isLocked && (
                <div style={{
                  position: "absolute", top: 10, right: 10,
                  fontSize: 11, padding: "2px 7px", borderRadius: 20,
                  background: `${accent}20`, border: `1px solid ${accent}40`,
                  color: accent, fontWeight: 700, display:"flex", alignItems:"center", gap:5
                }}>
                  <LockIcon size={14}/> {room.status}
                </div>
              )}

              <div className="flex items-center justify-between mb-2 mt-1">
                <span className="font-display text-lg font-bold text-gold">#{room.room_number}</span>
                {!isLocked && <Badge label={room.status} variant={room.status} size="sm" />}
              </div>

              <p className="text-resort-dim text-xs mb-3">{room.roomType?.type_name || "—"} · Fl.{room.floor}</p>

              {isLocked ? (
                <p style={{ fontSize: 10, color: "#4A4035", fontStyle: "italic" }}>
                  Cannot change status while {room.status.toLowerCase()}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {HK_STATUSES.filter(s => s !== room.status).map(s => (
                    <button key={s} onClick={() => changeStatus(room._id, s)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 hover:text-cream"
                      style={{
                        background: `${ACCENT[s]}15`,
                        border:     `1px solid ${ACCENT[s]}30`,
                        color:      ACCENT[s],
                      }}>
                      → {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-5 text-center py-14 text-resort-dim">
            <div className="text-4xl mb-3">🛏</div>
            <p>No rooms match this filter</p>
            <button className="chip mt-3" onClick={() => { setFloor("All"); setStatusFilt("All") }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}