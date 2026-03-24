// src/pages/admin/pages/ManageStaff.jsx
import React, { useState, useEffect } from "react"
import { getStaffList, createStaff, updateStaff, deleteStaff } from "../../../services/staffService"
import Table          from "../../../components/ui/Table"
import Badge          from "../../../components/ui/Badge"
import Button         from "../../../components/ui/Button"
import Modal          from "../../../components/ui/Modal"
import Input          from "../../../components/ui/Input"
import GoldDatePicker from "../../../components/ui/GoldDatePicker"
import { Toast, useToast } from "../../../components/ui/Loader"
import { IconWarning, PlusIcon, PencilIcon } from "../../../components/ui/Icons"

const SHIFTS       = ["Day Shift", "Night Shift", "Rotational Shift"]
const DESIGNATIONS = ["Manager", "Receptionist", "Housekeeping", "Chef", "Security"]

const emptyForm = {
  staff_name: "", email: "", phoneno: "", designation: "",
  salary: "", shift: "", birth_date: null, joining_date: null,
}
const emptyErrors = {
  staff_name: "", email: "", phoneno: "", designation: "",
  salary: "", shift: "", birth_date: "", joining_date: "",
}

/* Responsive CSS — ms-modal-row already in index.css but we reinforce here */
const RESP = `
  .ms-modal-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  @media (max-width: 420px) {
    .ms-modal-row { grid-template-columns: 1fr; }
  }
  .ms-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  @media (min-width: 768px) {
    .ms-stats-grid { grid-template-columns: repeat(4, 1fr); }
  }
`

function FErr({ msg }) {
  if (!msg) return null
  return (
    <p style={{ fontSize:11, color:"#E05252", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
      <IconWarning size={11} color="#E05252"/> {msg}
    </p>
  )
}

function FieldLabel({ text, required }) {
  return (
    <label style={{ display:"block", marginBottom:5, fontSize:10, fontWeight:700,
      color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em" }}>
      {text} {required && <span style={{ color:"#E05252" }}>*</span>}
    </label>
  )
}

function FInput({ value, onChange, placeholder, type="text", hasError, disabled, maxLength, inputMode }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      type={type} disabled={disabled} maxLength={maxLength} inputMode={inputMode}
      style={{
        width:"100%", boxSizing:"border-box",
        background: disabled ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)",
        border:`1px solid ${hasError ? "rgba(224,82,82,.5)" : "rgba(255,255,255,.1)"}`,
        borderRadius:8, padding:"9px 12px",
        fontSize:13, color:"#F5ECD7", outline:"none",
      }}/>
  )
}

function FSelect({ value, onChange, options, placeholder, hasError }) {
  return (
    <select value={value} onChange={onChange}
      style={{
        width:"100%", boxSizing:"border-box", background:"rgba(20,18,14,1)",
        border:`1px solid ${hasError ? "rgba(224,82,82,.5)" : "rgba(255,255,255,.1)"}`,
        borderRadius:8, padding:"9px 12px",
        fontSize:13, color: value ? "#F5ECD7" : "#6B6054", outline:"none",
      }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function ManageStaff() {
  const [staff,   setStaff]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [filter,  setFilter]  = useState("All")
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState(emptyForm)
  const [errors,  setErrors]  = useState(emptyErrors)
  const [saving,  setSaving]  = useState(false)
  const { toast, show } = useToast()

  const loadStaff = async () => {
    setLoading(true)
    try { const res = await getStaffList(); setStaff(res.data || []) }
    catch { show("Failed to load staff", "error") }
    setLoading(false)
  }
  useEffect(() => { loadStaff() }, [])

  const openCreate = () => { setForm(emptyForm); setErrors(emptyErrors); setModal("create") }
  const openEdit   = row => {
    setForm({
      staff_name:   row.staff_name   || "",
      email:        row.email        || "",
      phoneno:      row.phoneno      || "",
      designation:  row.designation  || "",
      salary:       row.salary       || "",
      shift:        row.shift        || "",
      birth_date:   row.birth_date   ? new Date(row.birth_date)   : null,
      joining_date: row.joining_date ? new Date(row.joining_date) : null,
    })
    setErrors(emptyErrors); setModal(row)
  }

  const set    = patch => setForm(f => ({ ...f, ...patch }))
  const clrErr = key  => setErrors(e => ({ ...e, [key]:"" }))

  const validate = () => {
    const errs = { ...emptyErrors }; let ok = true
    if (!form.staff_name.trim())                  { errs.staff_name = "Full name is required"; ok = false }
    else if (form.staff_name.trim().length < 2)   { errs.staff_name = "Name must be at least 2 characters"; ok = false }
    if (!form.email.trim())                        { errs.email = "Email is required"; ok = false }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { errs.email = "Enter a valid email address"; ok = false }
    const phone = form.phoneno.replace(/\s/g,"")
    if (!phone)                                    { errs.phoneno = "Phone number is required"; ok = false }
    else if (!/^[6-9]\d{9}$/.test(phone))         { errs.phoneno = "Enter valid 10-digit Indian mobile (starts with 6–9)"; ok = false }
    if (!form.designation)                         { errs.designation = "Designation is required"; ok = false }
    if (!form.shift)                               { errs.shift = "Shift is required"; ok = false }
    if (!form.salary)                              { errs.salary = "Salary is required"; ok = false }
    else if (isNaN(Number(form.salary)) || Number(form.salary) < 0) { errs.salary = "Enter a valid salary amount"; ok = false }
    else if (Number(form.salary) < 5000)           { errs.salary = "Salary must be at least ₹5,000"; ok = false }
    if (!form.birth_date) { errs.birth_date = "Birth date is required"; ok = false }
    else {
      const age = (new Date() - new Date(form.birth_date)) / (365.25 * 86400000)
      if (age < 18) { errs.birth_date = "Staff must be at least 18 years old"; ok = false }
      if (age > 65) { errs.birth_date = "Enter a valid birth date"; ok = false }
    }
    if (!form.joining_date) { errs.joining_date = "Joining date is required"; ok = false }
    else if (form.birth_date && new Date(form.joining_date) < new Date(form.birth_date))
      { errs.joining_date = "Joining date cannot be before birth date"; ok = false }
    setErrors(errs); return ok
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        staff_name:   form.staff_name.trim(),
        email:        form.email.trim(),
        phoneno:      form.phoneno.replace(/\s/g,""),
        designation:  form.designation,
        salary:       Number(form.salary),
        shift:        form.shift,
        birth_date:   form.birth_date,
        joining_date: form.joining_date,
      }
      if (modal === "create") { await createStaff(payload); show("Staff added — login credentials sent to their email!") }
      else { await updateStaff(modal._id, payload); show("Staff updated successfully") }
      setModal(null); loadStaff()
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed"
      if (msg.toLowerCase().includes("email"))                                              setErrors(e => ({ ...e, email: msg }))
      else if (msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("mobile")) setErrors(e => ({ ...e, phoneno: msg }))
      else show(msg, "error")
    }
    setSaving(false)
  }

  const handleDelete = async id => {
    if (!window.confirm("Are you sure you want to remove this staff member?")) return
    try { await deleteStaff(id); show("Staff removed successfully"); loadStaff() }
    catch { show("Delete failed", "error") }
  }

  const filtered = staff.filter(s => {
    const matchShift  = filter === "All" || s.shift === filter
    const matchSearch = !search ||
      s.staff_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.designation?.toLowerCase().includes(search.toLowerCase())
    return matchShift && matchSearch
  })

  const stats = {
    total:      staff.length,
    day:        staff.filter(s => s.shift === "Day Shift").length,
    night:      staff.filter(s => s.shift === "Night Shift").length,
    rotational: staff.filter(s => s.shift === "Rotational Shift").length,
  }

  const columns = [
    {
      key: "staff_name", label: "Staff",
      render: (v, r) => (
        <div>
          <p style={{ fontWeight:600, color:"#F5ECD7", margin:0 }}>{v}</p>
          <p style={{ fontSize:12, color:"#6B6054", margin:"2px 0 0" }}>{r.email}</p>
        </div>
      )
    },
    { key:"designation", label:"Designation" },
    { key:"phoneno",     label:"Phone" },
    { key:"shift",       label:"Shift", render: v => <Badge label={v} variant="info" size="sm"/> },
    {
      key:"salary", label:"Salary",
      render: v => v ? <span style={{ fontWeight:600, color:"#52C07A" }}>₹{Number(v).toLocaleString("en-IN")}</span> : "—"
    },
    {
      key:"actions", label:"Actions",
      render: (_, r) => (
        <div style={{ display:"flex", gap:6 }}>
          <Button size="xs" variant="outline" onClick={() => openEdit(r)}>Edit</Button>
          <Button size="xs" variant="danger"  onClick={() => handleDelete(r._id)}>Remove</Button>
        </div>
      )
    },
  ]

  const isCreate = modal === "create"

  return (
    <div>
      <style>{RESP}</style>
      <Toast {...(toast||{})}/>

      <div className="page-hd">
        <div>
          <h1 className="page-title">Manage Staff</h1>
          <p className="page-sub">{staff.length} team members</p>
        </div>
        <Button variant="gold" icon={<PlusIcon size={14} color="#0E0C09"/>} onClick={openCreate}>Add Staff</Button>
      </div>

      {/* RESPONSIVE: ms-stats-grid — 2-col mobile, 4-col desktop */}
      <div className="ms-stats-grid">
        {[
          ["Total",       stats.total,      "#C9A84C"],
          ["Day Shift",   stats.day,        "#52C07A"],
          ["Night Shift", stats.night,      "#E05252"],
          ["Rotational",  stats.rotational, "#5294E0"],
        ].map(([label, value, color]) => (
          <div key={label} className="stat-card">
            <div className="stat-bar" style={{ background: color }}/>
            <p className="text-xs text-resort-muted uppercase mt-1">{label}</p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input placeholder="Search name, email or designation…" value={search}
          onChange={e => setSearch(e.target.value)} className="f-input flex-1 min-w-48 max-w-sm"/>
        <div className="flex gap-2 flex-wrap">
          {["All", ...SHIFTS].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`chip ${filter===s?"on":""}`}>{s}</button>
          ))}
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyMsg="No staff found"/>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          isCreate
            ? <span style={{ display:"flex", alignItems:"center", gap:8 }}><PlusIcon size={20}/> Add Staff Member</span>
            : <span style={{ display:"flex", alignItems:"center", gap:8 }}><PencilIcon size={16}/> Edit Staff Member</span>
        }
        subtitle={isCreate ? "Login credentials will be emailed automatically" : `Editing ${modal?.staff_name||""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="gold" loading={saving} onClick={handleSave}>
              {isCreate ? "Add Staff" : "Save Changes"}
            </Button>
          </>
        }
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {isCreate && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:"rgba(82,148,224,.08)", border:"1px solid rgba(82,148,224,.25)" }}>
              <p style={{ fontSize:12, color:"#5294E0", margin:0 }}>
                📧 A random password will be auto-generated and emailed to the staff member after adding.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <FieldLabel text="Full Name" required/>
            <FInput value={form.staff_name} placeholder="Enter full name" hasError={!!errors.staff_name}
              onChange={e => { set({ staff_name: e.target.value }); clrErr("staff_name") }}/>
            <FErr msg={errors.staff_name}/>
          </div>

          {/* Email + Phone — RESPONSIVE: ms-modal-row */}
          <div className="ms-modal-row">
            <div>
              <FieldLabel text="Email" required/>
              <FInput value={form.email} placeholder="staff@resort.com" type="email" hasError={!!errors.email}
                onChange={e => { set({ email: e.target.value }); clrErr("email") }}/>
              <FErr msg={errors.email}/>
            </div>
            <div>
              <FieldLabel text="Phone (10 digits)" required/>
              <div style={{ position:"relative" }}>
                <FInput value={form.phoneno} placeholder="9876543210"
                  inputMode="numeric" maxLength={10} hasError={!!errors.phoneno}
                  onChange={e => { const v=e.target.value.replace(/\D/g,"").slice(0,10); set({ phoneno:v }); clrErr("phoneno") }}/>
                <span style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  fontSize:10, color: form.phoneno.length===10?"#52C07A":"#6B6054", fontWeight:600 }}>
                  {form.phoneno.length}/10
                </span>
              </div>
              <FErr msg={errors.phoneno}/>
            </div>
          </div>

          {/* Designation + Shift — RESPONSIVE: ms-modal-row */}
          <div className="ms-modal-row">
            <div>
              <FieldLabel text="Designation" required/>
              <FSelect value={form.designation} placeholder="— Select designation —"
                options={DESIGNATIONS} hasError={!!errors.designation}
                onChange={e => { set({ designation: e.target.value }); clrErr("designation") }}/>
              <FErr msg={errors.designation}/>
            </div>
            <div>
              <FieldLabel text="Shift" required/>
              <FSelect value={form.shift} placeholder="— Select shift —"
                options={SHIFTS} hasError={!!errors.shift}
                onChange={e => { set({ shift: e.target.value }); clrErr("shift") }}/>
              <FErr msg={errors.shift}/>
            </div>
          </div>

          {/* Birth date + Joining date — RESPONSIVE: ms-modal-row */}
          <div className="ms-modal-row">
            <div>
              <FieldLabel text="Birth Date" required/>
              <div style={{ border:`1px solid ${errors.birth_date?"rgba(224,82,82,.5)":"transparent"}`, borderRadius:8 }}>
                <GoldDatePicker value={form.birth_date}
                  onChange={d => { set({ birth_date: d }); clrErr("birth_date") }}/>
              </div>
              <FErr msg={errors.birth_date}/>
            </div>
            <div>
              <FieldLabel text="Joining Date" required/>
              <div style={{ border:`1px solid ${errors.joining_date?"rgba(224,82,82,.5)":"transparent"}`, borderRadius:8 }}>
                <GoldDatePicker value={form.joining_date} minDate={form.birth_date}
                  onChange={d => { set({ joining_date: d }); clrErr("joining_date") }}/>
              </div>
              <FErr msg={errors.joining_date}/>
            </div>
          </div>

          {/* Salary */}
          <div>
            <FieldLabel text="Salary (₹)" required/>
            <FInput value={form.salary} placeholder="e.g. 25000" type="number"
              hasError={!!errors.salary}
              onChange={e => { set({ salary: e.target.value }); clrErr("salary") }}/>
            <FErr msg={errors.salary}/>
          </div>
        </div>
      </Modal>
    </div>
  )
}