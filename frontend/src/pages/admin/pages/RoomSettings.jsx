// src/pages/admin/pages/RoomSettings.jsx
import React, { useState, useEffect, useRef } from "react"
import { getRoomTypes, createRoomType, updateRoomType, deleteRoomType } from "../../../services/roomService"
import Button from "../../../components/ui/Button"
import Modal  from "../../../components/ui/Modal"
import Input  from "../../../components/ui/Input"
import { Toast, useToast } from "../../../components/ui/Loader"
import {
  IconBed, GuestIcon,
  IconCheck, IconWarning,
  PlusIcon, PencilIcon,
} from "../../../components/ui/Icons"
import { AmenityBadge, AmenityIcon } from "../../../components/ui/AmenityIcon"

const AMENITIES_LIST = [
  "AC", "TV", "High Speed WiFi", "Complimentary Breakfast",
  "Coffee Maker", "Mini Fridge", "Jacuzzi", "Safe / Locker",
  "Gym", "Swimming Pool", "Game Zone",
]

const BED_TYPES = ["Single", "Double"]

const fieldStyle = {
  background:       "rgba(255,255,255,0.04)",
  border:           "1px solid rgba(255,255,255,0.1)",
  borderRadius:     "8px",
  color:            "#e8d5b0",
  padding:          "6px 10px",
  outline:          "none",
  fontSize:         "13px",
  appearance:       "none",
  WebkitAppearance: "none",
}

const AutoSlider = ({ images }) => {
  const [current, setCurrent] = React.useState(0)
  React.useEffect(() => {
    if (!images?.length) return
    const id = setInterval(() =>
      setCurrent(p => p === images.length - 1 ? 0 : p + 1), 3000)
    return () => clearInterval(id)
  }, [images])
  if (!images?.length) return null
  return (
    <div style={{ position:"relative", height:"180px", borderRadius:"12px", overflow:"hidden", marginBottom:"12px" }}>
      {images.map((img, i) => (
        <img key={i} src={`http://localhost:5000/${img}`} alt="room"
          style={{ position:"absolute", width:"100%", height:"100%", objectFit:"cover",
            borderRadius:"12px", top:0, left:0,
            opacity: i === current ? 1 : 0, transition:"opacity 0.8s ease-in-out" }}/>
      ))}
      <div style={{ position:"absolute", bottom:"10px", left:"50%", transform:"translateX(-50%)", display:"flex", gap:"6px" }}>
        {images.map((_, i) => (
          <span key={i} onClick={() => setCurrent(i)}
            style={{ width:"8px", height:"8px", borderRadius:"50%", cursor:"pointer", transition:"0.3s",
              backgroundColor: i === current ? "#c9a84c" : "rgba(255,255,255,0.5)" }}/>
        ))}
      </div>
    </div>
  )
}

const empty = { type_name:"", capacity:"", price_per_night:"", amenities:[], beds:[], description:"", images:[] }

export default function RoomSettings() {
  const [types,   setTypes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(empty)
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})
  const { toast, show } = useToast()
  const nameRef     = useRef(null)
  const capacityRef = useRef(null)
  const priceRef    = useRef(null)
  const descRef     = useRef(null)

  const clearError = field => setErrors(prev => {
    if (!prev[field]) return prev
    const u = { ...prev }; delete u[field]; return u
  })

  const validate = () => {
    const e = {}
    if (!form.type_name.trim())                             e.type_name       = "Type name is required"
    if (!form.capacity || form.capacity <= 0)               e.capacity        = "Valid capacity required"
    if (!form.price_per_night || form.price_per_night <= 0) e.price_per_night = "Valid price required"
    if (!form.description.trim())                           e.description     = "Description is required"
    if (!form.images?.length)                               e.images          = "At least one image required"
    if (!form.amenities || form.amenities.length < 2)       e.amenities       = "Select at least 2 amenities"
    setErrors(e)
    if      (e.type_name)       nameRef.current?.focus()
    else if (e.capacity)        capacityRef.current?.focus()
    else if (e.price_per_night) priceRef.current?.focus()
    else if (e.description)     descRef.current?.focus()
    return Object.keys(e).length === 0
  }

  const load = async () => {
    setLoading(true)
    try { const r = await getRoomTypes(); setTypes(r.data || []) }
    catch { show("Failed to load", "error") }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(empty); setErrors({}); setModal("create") }
  const openEdit   = t => {
    setForm({ ...t, beds: t.beds || [], amenities: Array.isArray(t.amenities) ? t.amenities.flat() : [] })
    setErrors({}); setModal(t)
  }

  const save = async e => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append("type_name",       form.type_name)
      fd.append("capacity",        +form.capacity)
      fd.append("price_per_night", +form.price_per_night)
      fd.append("description",     form.description)
      fd.append("beds",            JSON.stringify(form.beds))
      form.amenities.filter(a => typeof a === "string").forEach(a => fd.append("amenities", a))
      form.images?.forEach(img => fd.append("images", img))
      modal === "create" ? await createRoomType(fd) : await updateRoomType(modal._id, fd)
      show(modal === "create" ? "Type created!" : "Updated!")
      setModal(null); load()
    } catch (err) { show(err.response?.data?.message || "Failed", "error") }
    setSaving(false)
  }

  const remove = async id => {
    if (!window.confirm("Delete this room type?")) return
    try { await deleteRoomType(id); show("Deleted"); load() }
    catch { show("Cannot delete — rooms may be using this type", "error") }
  }

  const addBed    = () => setForm({ ...form, beds: [...form.beds, { type:"Single", count:1 }] })
  const updateBed = (i, field, val) => {
    const b = [...form.beds]; b[i][field] = field === "count" ? Number(val) : val
    setForm({ ...form, beds: b })
  }
  const removeBed = i => setForm({ ...form, beds: form.beds.filter((_, idx) => idx !== i) })

  return (
    <div>
      <Toast {...(toast || {})}/>

      <div className="page-hd">
        <div>
          <h1 className="page-title">Room Settings</h1>
          <p className="page-sub">Manage room types, pricing and amenities</p>
        </div>
        <Button variant="gold" onClick={openCreate} icon={<PlusIcon size={14} color="#0E0C09"/>}>New Room Type</Button>
      </div>

      {loading ? (
        /* FIX: was "grid grid-cols-3 gap-4" — hardcoded 3-col breaks on mobile */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card-p"><div className="h-32 skeleton rounded-xl"/></div>)}
        </div>
      ) : types.length === 0 ? (
        <div className="card-p text-center py-14 anim-up">
          <div className="flex justify-center mb-4">
            <IconBed size={48} color="rgba(201,168,76,.2)"/>
          </div>
          <p className="text-resort-dim">No room types yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 anim-up d1">
          {types.map((t, i) => (
            <div key={t._id} className={`card-p anim-up d${Math.min(i+1,5)}`}
              style={{ display:"flex", flexDirection:"column" }}>
              {t.images?.length > 0 && <AutoSlider images={t.images}/>}
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-display text-xl font-semibold text-cream">{t.type_name}</h3>
                <span className="font-bold text-gold text-lg">₹{t.price_per_night?.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 text-resort-muted text-sm mb-2">
                <div className="flex items-center gap-1.5">
                  <GuestIcon size={15}/>
                  <span>Capacity: {t.capacity} guests</span>
                </div>
                {t.beds?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <IconBed size={15}/>
                    <span>{t.beds.map(b => `${b.count} ${b.type}`).join(", ")}</span>
                  </div>
                )}
              </div>
              {t.description && (
                <p className="text-resort-dim text-xs leading-relaxed mb-3" style={{
                  display:"-webkit-box", WebkitLineClamp:3,
                  WebkitBoxOrient:"vertical", overflow:"hidden",
                }}>{t.description}</p>
              )}
              {t.amenities?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                  {t.amenities.slice(0, 4).map((a, ai) => (
                    <AmenityBadge key={ai} name={a} size={13} fontSize={11}/>
                  ))}
                  {t.amenities.length > 4 && (
                    <span style={{
                      display:"inline-flex", alignItems:"center",
                      padding:"5px 10px", borderRadius:20, fontSize:11,
                      color:"#6B6054", background:"rgba(255,255,255,.04)",
                      border:"1px solid rgba(255,255,255,.08)",
                    }}>
                      +{t.amenities.length - 4} more
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-3"
                style={{ marginTop:"auto", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                <Button size="xs" variant="outline" onClick={() => openEdit(t)} className="flex-1">Edit</Button>
                <Button size="xs" variant="danger"  onClick={() => remove(t._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal === "create"
            ? <span style={{display:"flex",alignItems:"center",gap:8}}><PlusIcon size={20}/> New Room Type</span>
            : <span style={{display:"flex",alignItems:"center",gap:8}}><PencilIcon size={15}/> Edit Room Type</span>
        }
        subtitle="Room category configuration"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="gold" loading={saving} onClick={save}>
              {modal === "create" ? "Create" : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">

          <Input label="Type Name" placeholder="Deluxe, Suite, Presidential…"
            value={form.type_name} ref={nameRef}
            onChange={e => { setForm({...form, type_name:e.target.value}); if(e.target.value.trim()) clearError("type_name") }}
            style={{ border: errors.type_name ? "1px solid red" : "" }}/>
          {errors.type_name && <p className="text-red-500 text-xs mt-1">{errors.type_name}</p>}

          <Input label="Price / Night (₹)" type="number" placeholder="₹5000"
            value={form.price_per_night} ref={priceRef}
            onChange={e => { setForm({...form, price_per_night:e.target.value}); if(e.target.value > 0) clearError("price_per_night") }}
            style={{ border: errors.price_per_night ? "1px solid red" : "" }}/>
          {errors.price_per_night && <p className="text-red-500 text-xs mt-1">{errors.price_per_night}</p>}

          {/* Beds */}
          <div>
            <label className="block mb-2 text-sm font-medium text-cream">Beds Configuration</label>
            <div className="space-y-2 mb-2">
              {form.beds.map((bed, i) => (
                <div key={i} className="flex gap-2 items-center px-3 py-2 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ position:"relative", flex:1 }}>
                    <select value={bed.type} onChange={e => updateBed(i, "type", e.target.value)}
                      style={{ ...fieldStyle, width:"100%", paddingRight:"28px", cursor:"pointer" }}>
                      {BED_TYPES.map(t => (
                        <option key={t} value={t} style={{ background:"#12121e", color:"#e8d5b0" }}>{t} Bed</option>
                      ))}
                    </select>
                    <span style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)",
                      color:"rgba(201,168,76,0.7)", fontSize:"10px", pointerEvents:"none" }}>▼</span>
                  </div>
                  <input type="number" min="1" value={bed.count}
                    onChange={e => updateBed(i, "count", e.target.value)}
                    style={{ ...fieldStyle, width:"60px", textAlign:"center" }}/>
                  <span className="text-resort-dim text-xs whitespace-nowrap">
                    {bed.count > 1 ? "beds" : "bed"}
                  </span>
                  <button type="button" onClick={() => removeBed(i)}
                    style={{ flexShrink:0, width:"28px", height:"28px",
                      background:"rgba(224,82,82,0.1)", border:"1px solid rgba(224,82,82,0.2)",
                      borderRadius:"6px", color:"#e05252", cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"13px", transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(224,82,82,0.2)"}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(224,82,82,0.1)"}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addBed}
              style={{ width:"100%", padding:"7px",
                background:"rgba(201,168,76,0.06)", border:"1px dashed rgba(201,168,76,0.3)",
                borderRadius:"8px", color:"#c9a84c", fontSize:"12px", fontWeight:600,
                cursor:"pointer", transition:"background 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(201,168,76,0.12)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.5)" }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(201,168,76,0.06)"; e.currentTarget.style.borderColor="rgba(201,168,76,0.3)" }}>
              + Add Bed
            </button>
          </div>

          <Input label="Capacity (guests)" type="number" placeholder="2"
            value={form.capacity} ref={capacityRef}
            onChange={e => { setForm({...form, capacity:e.target.value}); if(e.target.value > 0) clearError("capacity") }}
            style={{ border: errors.capacity ? "1px solid red" : "" }}/>
          {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}

          {/* Amenities */}
          <div>
            <label className="block mb-2 text-sm font-medium text-cream">Amenities</label>
            {/* FIX: was "grid grid-cols-2 gap-2" — Tailwind JIT unreliable inside modals.
                Using form-grid-2 from index.css: 1-col mobile → 2-col at 640px */}
            <div className="form-grid-2">
              {AMENITIES_LIST.map(item => {
                const checked = form.amenities.includes(item)
                return (
                  <label key={item}
                    className="flex items-center gap-2 text-sm text-resort-muted cursor-pointer select-none"
                    style={{ userSelect:"none" }}>
                    <input type="checkbox" checked={checked}
                      onChange={e => {
                        const updated = e.target.checked
                          ? [...form.amenities, item]
                          : form.amenities.filter(a => a !== item)
                        setForm({...form, amenities:updated})
                        if (updated.length >= 2) clearError("amenities")
                      }}
                      style={{ position:"absolute", opacity:0, width:0, height:0 }}/>
                    <span style={{
                      flexShrink:0, width:"16px", height:"16px", borderRadius:"4px",
                      border: checked ? "1.5px solid #c9a84c" : "1.5px solid rgba(255,255,255,0.2)",
                      background: checked ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.03)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all 0.15s ease",
                      boxShadow: checked ? "0 0 0 2px rgba(201,168,76,0.15)" : "none",
                    }}>
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3L3.5 5.5L8 1" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <AmenityIcon name={item} size={14} color={checked ? "#C9A84C" : "#6B6054"}/>
                      {item}
                    </span>
                  </label>
                )
              })}
            </div>
            {errors.amenities && <p className="text-red-500 text-xs mt-2">{errors.amenities}</p>}
          </div>

          <Input label="Description" rows={3} placeholder="Brief description of this room type…"
            ref={descRef} value={form.description}
            onChange={e => { setForm({...form, description:e.target.value}); if(e.target.value.trim()) clearError("description") }}
            style={{ border: errors.description ? "1px solid red" : "" }}/>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}

          <div>
            <label className="block mb-1 text-sm font-medium text-cream">Images</label>
            <input type="file" multiple accept="image/*" className="text-resort-muted text-sm"
              onChange={e => {
                const files = Array.from(e.target.files)
                setForm({...form, images:files})
                if (files.length > 0) clearError("images")
              }}/>
            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
          </div>

        </form>
      </Modal>
    </div>
  )
}