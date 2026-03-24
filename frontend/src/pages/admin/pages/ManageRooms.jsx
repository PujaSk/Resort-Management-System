// src/pages/admin/pages/ManageRooms.jsx
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  getRooms, updateRoomStatus, deleteRoom,
  getRoomTypes, generateRooms, getNextRoomNumber
} from "../../../services/roomService"
import { getAllBookings } from "../../../services/bookingService"
import Table  from "../../../components/ui/Table"
import Badge  from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Modal  from "../../../components/ui/Modal"
import Input  from "../../../components/ui/Input"
import { Toast, useToast } from "../../../components/ui/Loader"
import {
  IconBed, BookingIcon, GuestIcon, IconWarning,
  GenerateIcon, BulbIcon, IconSparkle, RightTickIcon,
} from "../../../components/ui/Icons"
import { AmenityBadge } from "../../../components/ui/AmenityIcon"

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://localhost:5000"
const toImgUrl = p => !p ? null : p.startsWith("http") ? p : `${BACKEND_URL}/${p.replace(/^\/+/,"")}`

const STATUSES = ["Available","Booked","Occupied","Cleaning","Maintenance"]

const ALLOWED_TRANSITIONS = {
  Available:   ["Booked","Occupied","Cleaning","Maintenance"],
  Booked:      ["Cleaning","Maintenance"],
  Occupied:    ["Cleaning","Maintenance"],
  Cleaning:    ["Available","Maintenance"],
  Maintenance: ["Available","Cleaning"],
}

const emptyGen = { roomTypeId:"", floor:"", startNumber:"", endNumber:"" }
const fmtINR = n => n ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"

function Pill({ label, color="#C9A84C" }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium"
      style={{ color, background:`${color}12`, border:`1px solid ${color}22` }}>
      {label}
    </span>
  )
}

function getLiveStatus(room, bookings) {
  const rid   = room._id?.toString()
  const today = new Date(); today.setHours(0,0,0,0)
  const active = bookings.find(b => b.room?._id?.toString() === rid && b.bookingStatus === "Checked-In")
  if (active) return "Occupied"
  const upcoming = bookings.find(b =>
    b.room?._id?.toString() === rid &&
    b.bookingStatus === "Booked" &&
    new Date(b.checkInDateTime) >= today
  )
  if (upcoming) return "Booked"
  return room.status
}

export default function ManageRooms() {
  const navigate = useNavigate()
  const [rooms,     setRooms]     = useState([])
  const [types,     setTypes]     = useState([])
  const [bookings,  setBookings]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState("rooms")
  const [filter,    setFilter]    = useState("All")
  const [search,    setSearch]    = useState("")
  const [genOpen,   setGenOpen]   = useState(false)
  const [statusRow, setStatusRow] = useState(null)
  const [genForm,   setGenForm]   = useState(emptyGen)
  const [saving,    setSaving]    = useState(false)
  const { toast, show } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [r, t, b] = await Promise.all([
        getRooms().catch(()=>({data:[]})),
        getRoomTypes().catch(()=>({data:[]})),
        getAllBookings().catch(()=>({data:[]})),
      ])
      setRooms(r.data||[])
      setTypes(t.data||[])
      setBookings(b.data||[])
    } catch { show("Failed to load","error") }
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  const handleGenerate = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await generateRooms({ ...genForm, floor:+genForm.floor, startNumber:+genForm.startNumber, endNumber:+genForm.endNumber })
      show(`${+genForm.endNumber-+genForm.startNumber+1} rooms generated!`)
      setGenOpen(false); setGenForm(emptyGen); load()
    } catch(err) { show(err.response?.data?.message||"Failed","error") }
    setSaving(false)
  }

  const handleStatus = async (id, status) => {
    try { await updateRoomStatus(id, status); show("Status updated!"); setStatusRow(null); load() }
    catch { show("Failed","error") }
  }

  const handleDelete = async id => {
    if (!window.confirm("Remove this room?")) return
    try { await deleteRoom(id); show("Room removed"); load() }
    catch { show("Failed","error") }
  }

  const enriched = rooms.map(r => ({ ...r, liveStatus: getLiveStatus(r, bookings) }))

  const filtered = enriched.filter(r => {
    const ms = filter==="All" || r.liveStatus===filter
    const mq = (r.room_number||"").toLowerCase().includes(search.toLowerCase()) ||
               (r.roomType?.type_name||"").toLowerCase().includes(search.toLowerCase())
    return ms && mq
  })

  const stats = {
    total:       enriched.length,
    Available:   enriched.filter(r=>r.liveStatus==="Available").length,
    Booked:      enriched.filter(r=>r.liveStatus==="Booked").length,
    Occupied:    enriched.filter(r=>r.liveStatus==="Occupied").length,
    Cleaning:    enriched.filter(r=>r.liveStatus==="Cleaning").length,
    Maintenance: enriched.filter(r=>r.liveStatus==="Maintenance").length,
  }

  const cols = [
    { key:"room_number", label:"Room #",
      render:v=><span className="font-display text-base font-semibold text-gold">#{v}</span> },
    { key:"floor", label:"Floor",
      render:v=><span className="text-resort-muted">Floor {v}</span> },
    { key:"roomType", label:"Type",
      render:v=><span className="text-cream text-sm">{v?.type_name||"—"}</span> },
    // FIX: key changed from "roomType" (duplicate) to "price" to avoid React key warnings
    { key:"price", label:"Price/Night",
      render:(_,row)=>row.roomType?.price_per_night
        ? <span className="font-semibold text-cream">{fmtINR(row.roomType.price_per_night)}</span>
        : "—" },
    // FIX: key changed from "roomType" (duplicate) to "beds" to avoid React key warnings
    { key:"beds", label:"Beds",
      render:(_,row)=>row.roomType?.beds?.length
        ? <div className="flex gap-1 flex-wrap">{row.roomType.beds.map((b,i)=><Pill key={i} label={`${b.count}× ${b.type}`} color="#4ECDC4"/>)}</div>
        : <span className="text-resort-dim">—</span> },
    { key:"liveStatus", label:"Status", render:v=><Badge label={v} variant={v}/> },
    // FIX: key changed from "_id" (duplicate — _id already used internally) to "actions"
    { key:"actions", label:"Actions",
      render:(_,row)=>(
        <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
          <Button size="xs" variant="gold" onClick={()=>navigate(`/admin/room-bookings/${row._id}`)}>View</Button>
          <Button size="xs" variant="outline" onClick={()=>setStatusRow(row)}>Status</Button>
          {row.liveStatus==="Available" && (
            <Button size="xs" variant="danger" onClick={()=>handleDelete(row._id)}>Remove</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <Toast {...(toast||{})}/>

      <div className="page-hd">
        <div>
          <h1 className="page-title">Manage Rooms</h1>
          <p className="page-sub">{rooms.length} rooms · {types.length} types</p>
        </div>
        <Button variant="gold" onClick={()=>setGenOpen(true)} icon={<GenerateIcon size={14} color="#0E0C09"/>}>
          Generate Rooms
        </Button>
      </div>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6 anim-up d1">
        {[
          ["Total",       stats.total,       "#C9A84C"],
          ["Available",   stats.Available,   "#52C07A"],
          ["Booked",      stats.Booked,      "#5294E0"],
          ["Occupied",    stats.Occupied,    "#E05252"],
          ["Cleaning",    stats.Cleaning,    "#E0A852"],
          ["Maintenance", stats.Maintenance, "#9B7FE8"],
        ].map(([l,v,c])=>(
          <div key={l} className="stat-card cursor-pointer"
            onClick={()=>setFilter(filter===l?"All":l)}
            style={{outline: filter===l ? `1px solid ${c}40` : "none"}}>
            <div className="stat-bar" style={{background:c}}/>
            <p className="text-[10px] text-resort-muted uppercase tracking-widest mt-1">{l}</p>
            <p className="font-display text-3xl font-bold mt-1" style={{color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="tab-row">
        <button className={`tab-btn ${tab==="rooms"?"on":""}`} onClick={()=>setTab("rooms")}
          style={{display:"flex",alignItems:"center",gap:6}}>
          <IconBed size={15}/> All Rooms
        </button>
        <button className={`tab-btn ${tab==="types"?"on":""}`} onClick={()=>setTab("types")}
          style={{display:"flex",alignItems:"center",gap:6}}>
          <BookingIcon size={15}/> Room Types
        </button>
      </div>

      {tab==="rooms" && (
        <div className="anim-up d2">
          <div className="flex gap-3 mb-4 flex-wrap">
            <input placeholder="Search room or type…" value={search} onChange={e=>setSearch(e.target.value)}
              className="f-input flex-1 min-w-48 max-w-sm"/>
            <div className="flex gap-2 flex-wrap">
              {["All",...STATUSES].map(s=>(
                <button key={s} className={`chip ${filter===s?"on":""}`} onClick={()=>setFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          <p className="text-resort-dim text-xs mb-3 flex items-center gap-1.5">
            <BulbIcon size={16} color="#C9A84C"/>
            Status is live — reflects today's check-ins and bookings. Click <strong style={{color:"#C9A84C",margin:"0 2px"}}>View</strong> for full booking history.
          </p>
          <Table columns={cols} data={filtered} loading={loading} emptyMsg="No rooms found. Generate rooms first!"/>
        </div>
      )}

      {tab==="types" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 anim-up d2">
          {loading
            ? <p className="text-resort-dim">Loading…</p>
            : types.length===0
              ? <div className="col-span-3 text-center py-14 text-resort-dim">
                  <div className="flex justify-center mb-4"><BookingIcon size={48} color="rgba(201,168,76,.2)"/></div>
                  <p>No types yet.</p>
                </div>
              : types.map(t=>(
                <div key={t._id} className="card-p cursor-pointer transition-all duration-200"
                  style={{borderColor:"rgba(255,255,255,.06)", display:"flex", flexDirection:"column"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(201,168,76,.25)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.06)"}
                  onClick={()=>navigate(`/admin/room-settings`)}>
                  {t.images?.length>0 && (
                    <div style={{borderRadius:8,overflow:"hidden",height:140,marginBottom:12}}>
                      <img src={toImgUrl(t.images[0])} alt={t.type_name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display text-lg font-semibold text-cream">{t.type_name}</h3>
                    <span className="font-bold text-gold">{fmtINR(t.price_per_night)}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-resort-muted text-sm mb-2">
                    <div className="flex items-center gap-1.5"><GuestIcon size={15}/><span>{t.capacity} guests</span></div>
                    {t.beds?.length>0 && (
                      <div className="flex items-center gap-1.5 text-resort-dim">
                        <IconBed size={15}/><span>{t.beds.map(b=>`${b.count} ${b.type}`).join(", ")}</span>
                      </div>
                    )}
                  </div>
                  {t.description && <p className="text-resort-dim text-xs leading-relaxed mb-3 line-clamp-2">{t.description}</p>}
                  {t.amenities?.length>0 && (
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                      {t.amenities.slice(0,4).map((a,i)=>(<AmenityBadge key={i} name={a} size={13} fontSize={11}/>))}
                      {t.amenities.length>4 && (
                        <span style={{display:"inline-flex",alignItems:"center",padding:"5px 10px",borderRadius:20,fontSize:11,color:"#6B6054",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
                          +{t.amenities.length-4} more
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 mt-auto" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
                    {[
                      ["Available", enriched.filter(r=>(r.roomType?._id||r.roomType)===t._id&&r.liveStatus==="Available").length, "#52C07A"],
                      ["Booked",    enriched.filter(r=>(r.roomType?._id||r.roomType)===t._id&&r.liveStatus==="Booked").length,    "#5294E0"],
                      ["Occupied",  enriched.filter(r=>(r.roomType?._id||r.roomType)===t._id&&r.liveStatus==="Occupied").length,  "#E05252"],
                    ].map(([l,v,c])=>(
                      <div key={l} style={{flex:1,textAlign:"center",padding:"4px 0",borderRadius:6,background:`${c}08`,border:`1px solid ${c}18`}}>
                        <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
                        <div style={{fontSize:9,color:"#6B6054"}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-resort-dim mt-3 text-right">Click to manage →</p>
                </div>
              ))
          }
        </div>
      )}

      {/* Generate Modal */}
      <Modal open={genOpen} onClose={()=>setGenOpen(false)}
        title={<span style={{display:"flex",alignItems:"center",gap:8}}><GenerateIcon size={22} color="#C9A84C"/> Generate Rooms</span>}
        subtitle="Bulk create rooms for a floor"
        footer={<><Button variant="ghost" onClick={()=>setGenOpen(false)}>Cancel</Button><Button variant="gold" loading={saving} onClick={handleGenerate}>Generate</Button></>}>
        <form onSubmit={handleGenerate} className="space-y-4">
          <Input label="Room Type" options={types.map(t=>({value:t._id,label:t.type_name}))}
            placeholder="Select type" value={genForm.roomTypeId}
            onChange={e=>setGenForm({...genForm,roomTypeId:e.target.value})} required/>
          <Input label="Floor" type="number" placeholder="1" value={genForm.floor}
            onChange={async e => {
              const floor = e.target.value
              setGenForm(prev=>({...prev, floor}))
              if (floor) { try { const res = await getNextRoomNumber(floor); setGenForm(prev=>({...prev, floor, startNumber:res.data.nextNumber})) } catch {} }
            }} required/>

          {/* FIX: was "grid grid-cols-2 gap-3" — Tailwind JIT unreliable inside modals */}
          <div className="form-grid-2">
            <Input label="Start Room #" type="number" placeholder="101" value={genForm.startNumber} onChange={e=>setGenForm({...genForm,startNumber:e.target.value})} required/>
            <Input label="End Room #" type="number" placeholder="110" value={genForm.endNumber} onChange={e=>setGenForm({...genForm,endNumber:e.target.value})} required/>
          </div>

          {genForm.startNumber && genForm.endNumber && +genForm.endNumber>=+genForm.startNumber && (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold text-gold"
              style={{background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.2)",display:"flex",alignItems:"center",gap:8}}>
              <IconSparkle size={14} color="#C9A84C"/>
              Will generate {+genForm.endNumber - +genForm.startNumber + 1} rooms
            </div>
          )}
        </form>
      </Modal>

      {/* Status Modal */}
      <Modal open={!!statusRow} onClose={()=>setStatusRow(null)}
        title={`Room #${statusRow?.room_number}`} subtitle="Change room status"
        footer={<Button variant="ghost" onClick={()=>setStatusRow(null)}>Cancel</Button>}>
        <div className="space-y-2">
          {statusRow && (() => {
            const allowed = ALLOWED_TRANSITIONS[statusRow.status] || []
            return (
              <>
                {allowed.length===0 && (
                  <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                    style={{background:"rgba(224,82,82,.08)",border:"1px solid rgba(224,82,82,.2)",color:"#E05252"}}>
                    <IconWarning size={14} color="#E05252"/> Status cannot be changed while a guest is checked in.
                  </div>
                )}
                {STATUSES.map(s => {
                  const isActive  = statusRow.status===s
                  const isAllowed = allowed.includes(s)
                  if (!isActive && !isAllowed) return null
                  return (
                    <button key={s} onClick={()=>isAllowed && handleStatus(statusRow._id,s)}
                      disabled={!isAllowed} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-150"
                      style={{background:isActive?"rgba(201,168,76,.08)":"rgba(255,255,255,.02)",
                        border:`1px solid ${isActive?"rgba(201,168,76,.3)":"rgba(255,255,255,.07)"}`,
                        opacity:!isAllowed&&!isActive?.35:1, cursor:isAllowed?"pointer":"default"}}>
                      <Badge label={s} variant={s}/>
                      {isActive && <span className="ml-auto text-[11px] text-resort-dim flex items-center gap-1"><RightTickIcon size={11} color="#6B6054"/> Current</span>}
                    </button>
                  )
                })}
              </>
            )
          })()}
        </div>
      </Modal>
    </div>
  )
}