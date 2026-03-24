// src/pages/admin/pages/RoomFacilities.jsx
import React, { useState, useEffect, useRef } from "react"
import Button from "../../../components/ui/Button"
import {
  PlusIcon, PencilIcon, IconWarning, IconSparkle,
} from "../../../components/ui/Icons"

const API_BASE = "http://resort-management-system.onrender.com/api/facilities"

const getImageSrc = (imgPath) => {
  if (!imgPath) return ""
  if (imgPath.startsWith("http")) return imgPath
  const clean = imgPath.replace(/\\/g, "/")
  return `http://resort-management-system.onrender.com/${clean}`
}

const initialForm = { name: "", description: "", images: [] }

/* ── Small inline SVG close/edit icons (used only inside this file) ── */
const CloseIcon = ({ size = 14, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const EditIcon = ({ size = 14, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l2-6l11-11a2.828 2.828 0 0 1 4 4L9 19l-6 2z"/>
    <path d="M15 5l4 4"/>
  </svg>
)

/* ════════════════════════════════════════════════════════
   MODAL
════════════════════════════════════════════════════════ */
function FacilityModal({ mode, facility, onClose, onSaved }) {
  const [form, setForm] = useState(
    mode === "edit" && facility
      ? { name: facility.name, description: facility.description || "", images: [] }
      : initialForm
  )
  const [preview, setPreview] = useState(
    mode === "edit" && facility?.images?.length ? facility.images : []
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const fileRef = useRef()

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    setForm((f) => ({ ...f, images: files }))
    setPreview(files.map((f) => URL.createObjectURL(f)))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return }
    setError(""); setLoading(true)
    try {
      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("description", form.description)
      form.images.forEach((img) => fd.append("images", img))
      const url    = mode === "edit" ? `${API_BASE}/${facility._id}` : API_BASE
      const method = mode === "edit" ? "PUT" : "POST"
      const res    = await fetch(url, { method, body: fd })
      if (!res.ok) {
        const text = await res.text()
        let msg = "Failed"
        try { msg = JSON.parse(text).message || msg } catch (_) {}
        throw new Error(msg)
      }
      const saved = await res.json()
      onSaved(saved, mode)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="font-display text-xl text-cream" style={{display:"flex",alignItems:"center",gap:8}}>
            {mode === "edit"
              ? <><EditIcon size={16} color="#C9A84C"/> Edit Facility</>
              : <><PlusIcon size={20} color="#C9A84C"/> Add New Facility</>
            }
          </h2>
          <button className="modal-close" onClick={onClose} title="Close">
            <CloseIcon size={16}/>
          </button>
        </div>

        {error && (
          <p className="modal-error" style={{display:"flex",alignItems:"center",gap:6}}>
            <IconWarning size={13} color="#f87171"/> {error}
          </p>
        )}

        <div className="form-group">
          <label className="form-label">Facility Name *</label>
          <input className="form-input" placeholder="e.g. Swimming Pool"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}/>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea"
            placeholder="Brief description of this facility…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}/>
        </div>

        <div className="form-group">
          <label className="form-label">Images (up to 5)</label>
          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            {preview.length === 0 ? (
              <span className="text-resort-muted text-sm">Click to upload images</span>
            ) : (
              <div className="preview-grid">
                {preview.map((src, i) => (
                  <img key={i} src={getImageSrc(src)} alt="" className="preview-img"/>
                ))}
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*"
            style={{ display:"none" }} onChange={handleFiles}/>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <Button variant="gold" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : mode === "edit" ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   DELETE CONFIRM
════════════════════════════════════════════════════════ */
function DeleteConfirm({ facility, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/${facility._id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Delete failed")
      }
      onDeleted(facility._id)
    } catch (err) {
      console.error("Delete error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box modal-sm anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="text-center py-2">
          {/* Warning icon instead of ⚠ emoji */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <div style={{
              width:56, height:56, borderRadius:"50%",
              background:"rgba(224,82,82,.1)", border:"1px solid rgba(224,82,82,.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <IconWarning size={26} color="#E05252"/>
            </div>
          </div>
          <h2 className="font-display text-xl text-cream mb-2">Delete Facility?</h2>
          <p className="text-resort-muted text-sm mb-6">
            "<span className="text-cream">{facility.name}</span>" will be permanently removed.
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   AUTO SLIDER
════════════════════════════════════════════════════════ */
function AutoSlider({ images }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!images?.length) return
    const id = setInterval(() =>
      setCurrent((p) => (p === images.length - 1 ? 0 : p + 1)), 3000)
    return () => clearInterval(id)
  }, [images])
  if (!images?.length) return null
  return (
    <div style={{ position:"relative", height:"180px", overflow:"hidden" }}>
      {images.map((img, i) => (
        <img key={i} src={getImageSrc(img)} alt=""
          style={{
            position:"absolute", width:"100%", height:"100%",
            objectFit:"cover", top:0, left:0,
            opacity: i === current ? 1 : 0,
            transition:"opacity 0.8s ease-in-out",
          }}/>
      ))}
      {images.length > 1 && (
        <div style={{
          position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:5,
        }}>
          {images.map((_, i) => (
            <span key={i} onClick={() => setCurrent(i)}
              style={{
                width:6, height:6, borderRadius:"50%", cursor:"pointer",
                transition:"background 0.3s",
                backgroundColor: i === current ? "#c9a84c" : "rgba(255,255,255,0.45)",
              }}/>
          ))}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   FACILITY CARD
════════════════════════════════════════════════════════ */
function FacilityCard({ facility, onEdit, onDelete }) {
  const imgs = facility.images || []

  return (
    <div className="facility-card anim-up">
      <div className="facility-img-wrap" style={{ position:"relative" }}>
        {imgs.length > 0 ? (
          <AutoSlider images={imgs}/>
        ) : (
          /* placeholder — IconSparkle instead of ✦ */
          <div className="facility-img-placeholder">
            <IconSparkle size={36} color="rgba(201,168,76,.35)"/>
          </div>
        )}

        {/* Card action buttons — SVG icons */}
        <div className="facility-card-actions">
          <button className="icon-btn" title="Edit" onClick={() => onEdit(facility)}>
            <EditIcon size={14}/>
          </button>
          <button className="icon-btn icon-btn-danger" title="Delete" onClick={() => onDelete(facility)}>
            <CloseIcon size={14}/>
          </button>
        </div>
      </div>

      <div className="facility-body">
        <h3 className="font-display text-base text-cream">{facility.name}</h3>
        {facility.description && (
          <p className="text-resort-muted text-sm mt-1 facility-desc">{facility.description}</p>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function RoomFacilities() {
  const [facilities, setFacilities] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [modal,      setModal]      = useState(null)

  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then((data) => setFacilities(Array.isArray(data) ? data : []))
      .catch(() => setFacilities([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSaved = (saved, mode) => {
    setFacilities((prev) =>
      mode === "edit"
        ? prev.map((f) => (f._id === saved._id ? saved : f))
        : [...prev, saved]
    )
    setModal(null)
  }

  const handleDeleted = (id) => {
    setFacilities((prev) => prev.filter((f) => f._id !== id))
    setModal(null)
  }

  const filtered = facilities.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <style>{styles}</style>

      <div>
        {/* Header */}
        <div className="page-hd">
          <div>
            <h1 className="page-title">Room Facilities</h1>
            <p className="page-sub">Manage room amenities and facilities</p>
          </div>
          {/* PlusIcon on button — same pattern as RoomSettings */}
          <Button
            variant="gold"
            icon={<PlusIcon size={14} color="#0E0C09"/>}
            onClick={() => setModal({ type:"add" })}>
            Add Facility
          </Button>
        </div>

        {/* Search + count bar */}
        {!loading && facilities.length > 0 && (
          <div className="toolbar anim-up">
            <input className="search-input" placeholder="Search facilities…"
              value={search} onChange={(e) => setSearch(e.target.value)}/>
            <span className="text-resort-muted text-sm">
              {filtered.length} of {facilities.length} facilities
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card-p text-center py-16 anim-up">
            <div className="spinner"/>
            <p className="text-resort-muted text-sm mt-4">Loading facilities…</p>
          </div>
        )}

        {/* Empty state — IconSparkle instead of ✦ */}
        {!loading && facilities.length === 0 && (
          <div className="card-p text-center py-16 anim-up">
            <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
              <div style={{
                width:72, height:72, borderRadius:"50%",
                background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.15)",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <IconSparkle size={32} color="rgba(201,168,76,.5)"/>
              </div>
            </div>
            <h3 className="font-display text-xl text-cream mb-2">No Facilities Yet</h3>
            <p className="text-resort-muted text-sm max-w-md mx-auto mb-6">
              Start adding amenities like pool, spa, gym, and other features to your rooms.
            </p>
            <Button
              variant="gold"
              icon={<PlusIcon size={14} color="#0E0C09"/>}
              onClick={() => setModal({ type:"add" })}>
              Add First Facility
            </Button>
          </div>
        )}

        {/* No search results */}
        {!loading && facilities.length > 0 && filtered.length === 0 && (
          <div className="card-p text-center py-12 anim-up">
            <p className="text-resort-muted text-sm">
              No facilities match "<span className="text-cream">{search}</span>"
            </p>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="facility-grid">
            {filtered.map((f) => (
              <FacilityCard key={f._id} facility={f}
                onEdit={(fac) => setModal({ type:"edit", facility:fac })}
                onDelete={(fac) => setModal({ type:"delete", facility:fac })}/>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "add"    && <FacilityModal mode="add" onClose={() => setModal(null)} onSaved={handleSaved}/>}
      {modal?.type === "edit"   && <FacilityModal mode="edit" facility={modal.facility} onClose={() => setModal(null)} onSaved={handleSaved}/>}
      {modal?.type === "delete" && <DeleteConfirm facility={modal.facility} onClose={() => setModal(null)} onDeleted={handleDeleted}/>}
    </>
  )
}

/* ════════════════════════════════════════════════════════
   SCOPED STYLES
════════════════════════════════════════════════════════ */
const styles = `
  .facility-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 4px;
  }
  .facility-card {
    background: var(--card-bg, rgba(255,255,255,0.04));
    border: 1px solid var(--border, rgba(255,255,255,0.08));
    border-radius: 12px;
    overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .facility-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0,0,0,.35);
  }
  .facility-img-wrap {
    position: relative;
    height: 180px;
    background: rgba(255,255,255,0.03);
  }
  .facility-img-placeholder {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .facility-card-actions {
    position: absolute; top: 10px; right: 10px;
    display: flex; gap: 6px;
    opacity: 0; transition: opacity .2s;
  }
  .facility-card:hover .facility-card-actions { opacity: 1; }
  .icon-btn {
    width: 32px; height: 32px;
    border-radius: 6px; border: none;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(6px);
    color: var(--cream, #F5ECD7);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }
  .icon-btn:hover { background: rgba(201,168,76,.85); color: #000; }
  .icon-btn-danger:hover { background: rgba(220,60,60,.85); color: #fff; }
  .facility-body { padding: 14px 16px 16px; }
  .facility-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
  }
  .facility-meta { margin-top: 10px; }
  .badge {
    font-size: 11px; padding: 3px 8px; border-radius: 20px;
    background: rgba(201,168,76,.12); color: var(--gold, #C9A84C);
    border: 1px solid rgba(201,168,76,.25); letter-spacing: .03em;
  }
  .toolbar {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 20px;
  }
  .search-input {
    flex: 1; max-width: 320px;
    padding: 9px 14px; border-radius: 8px;
    border: 1px solid var(--border, rgba(255,255,255,0.1));
    background: rgba(255,255,255,0.04);
    color: var(--cream, #F5ECD7);
    font-size: 13.5px; outline: none;
    transition: border-color .2s;
  }
  .search-input::placeholder { color: var(--resort-muted, rgba(245,236,215,.45)); }
  .search-input:focus { border-color: var(--gold, #C9A84C); }
  .modal-backdrop {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,.65);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal-box {
    background: var(--modal-bg, #1a1710);
    border: 1px solid rgba(201,168,76,.2);
    border-radius: 16px; padding: 28px;
    width: 100%; max-width: 520px;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-sm { max-width: 380px; }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 22px;
  }
  .modal-close {
    background: none; border: none;
    color: var(--resort-muted, rgba(245,236,215,.45));
    cursor: pointer; line-height: 1;
    padding: 4px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: color .15s;
  }
  .modal-close:hover { color: var(--cream, #F5ECD7); }
  .modal-error {
    background: rgba(220,60,60,.12);
    border: 1px solid rgba(220,60,60,.3);
    border-radius: 8px; padding: 10px 14px;
    color: #f87171; font-size: 13px;
    margin-bottom: 16px;
  }
  .modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    margin-top: 24px; padding-top: 20px;
    border-top: 1px solid rgba(255,255,255,.06);
  }
  .form-group { margin-bottom: 18px; }
  .form-label {
    display: block; font-size: 12px; letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--resort-muted, rgba(245,236,215,.55));
    margin-bottom: 7px;
  }
  .form-input {
    width: 100%; padding: 10px 13px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,.09);
    background: rgba(255,255,255,.04);
    color: var(--cream, #F5ECD7);
    font-size: 14px; outline: none;
    transition: border-color .2s;
    box-sizing: border-box;
  }
  .form-input:focus { border-color: var(--gold, #C9A84C); }
  .form-textarea { resize: vertical; min-height: 90px; font-family: inherit; }
  .upload-zone {
    border: 1px dashed rgba(201,168,76,.3);
    border-radius: 10px; padding: 20px;
    min-height: 90px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: border-color .2s, background .2s;
    background: rgba(201,168,76,.03);
  }
  .upload-zone:hover { border-color: var(--gold, #C9A84C); background: rgba(201,168,76,.06); }
  .preview-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .preview-img {
    width: 72px; height: 72px; object-fit: cover;
    border-radius: 6px; border: 1px solid rgba(201,168,76,.25);
  }
  .btn-ghost {
    padding: 9px 18px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,.1);
    background: transparent;
    color: var(--resort-muted, rgba(245,236,215,.6));
    font-size: 13.5px; cursor: pointer;
    transition: border-color .15s, color .15s;
  }
  .btn-ghost:hover { border-color: rgba(255,255,255,.25); color: var(--cream, #F5ECD7); }
  .btn-danger {
    padding: 9px 18px; border-radius: 8px; border: none;
    background: rgba(220,60,60,.85); color: #fff;
    font-size: 13.5px; cursor: pointer;
    transition: background .15s;
  }
  .btn-danger:hover { background: rgb(220,60,60); }
  .btn-danger:disabled { opacity: .5; cursor: default; }
  .spinner {
    width: 32px; height: 32px;
    border: 2px solid rgba(201,168,76,.2);
    border-top-color: var(--gold, #C9A84C);
    border-radius: 50%;
    animation: spin .7s linear infinite;
    margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`