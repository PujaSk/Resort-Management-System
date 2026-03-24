// src/pages/admin/pages/RoomBookings.jsx
// when clicked View on a room in ManageRooms → shows ALL booking history for that room
// ALSO shows hall/venue bookings for the same room type
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getRooms }      from "../../../services/roomService"
import { getAllBookings } from "../../../services/bookingService"
import Badge  from "../../../components/ui/Badge"
import Loader from "../../../components/ui/Loader"
import { AtBookingIcon, BookingIcon, BulbIcon, CashIcon, ClockIcon, DoorIcon, HallIcon, IconBed } from "../../../components/ui/Icons"
import { CreditCardIcon, DebitCardIcon, UpiIcon } from "../../customer/bookingShared"

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api","") || "http://resort-management-system.onrender.com"
const toImgUrl = p => !p ? null : p.startsWith("http") ? p : `${BACKEND_URL}/${p.replace(/^\/+/,"")}`

const IST    = { timeZone:"Asia/Kolkata" }
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { ...IST, day:"2-digit", month:"short", year:"numeric" }) : "—"
const fmtDT   = d => d ? new Date(d).toLocaleString("en-IN",     { ...IST, day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true }) : "—"
const fmtINR  = n => n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "₹0"

const METHOD_ICON  = { credit_card:<CreditCardIcon/>, debit_card:<DebitCardIcon/>, upi:<UpiIcon/>, cash:<CashIcon/> }
const METHOD_LABEL = { credit_card:"Credit Card", debit_card:"Debit Card", upi:"UPI", cash:"Cash" }

const STATUS_COLOR = {
  "Booked":      "#5294E0",
  "Checked-In":  "#52C07A",
  "Checked-Out": "#C9A84C",
  "Cancelled":   "#E05252",
  "No-Show":     "#E0A852",
}

function TCell({ label, value, color, mono, span2 }) {
  return (
    <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", gridColumn: span2 ? "span 2" : undefined }}>
      <p style={{ fontSize:10, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:13, fontWeight:600, color:color||"#F5ECD7", fontFamily:mono?"monospace":"inherit", wordBreak:"break-all" }}>{value ?? "—"}</p>
    </div>
  )
}

function Divider({ label, color="#6B6054" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, margin:"18px 0 10px" }}>
      <div style={{ height:1, flex:1, background:"rgba(255,255,255,.08)" }}/>
      <span style={{ fontSize:10, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.12em", whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ height:1, flex:1, background:"rgba(255,255,255,.08)" }}/>
    </div>
  )
}

function MethodBadge({ method, upiId, cardNumber, cardName }) {
  if (!method) return <span style={{ color:"#6B6054" }}>—</span>
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color:"#C8BAA0" }}>
      <span>{METHOD_ICON[method] || "💰"}</span>
      <strong style={{ color:"#F5ECD7" }}>{METHOD_LABEL[method] || method}</strong>
      {upiId && <span style={{ color:"#8A7E6A" }}>· {upiId}</span>}
      {cardNumber && <span style={{ color:"#8A7E6A", fontFamily:"monospace" }}>· ···· {cardNumber}</span>}
      {cardName && <span style={{ color:"#8A7E6A" }}>· {cardName}</span>}
    </span>
  )
}

function PayStage({ icon, label, amount, method, upiId, cardNumber, cardName, timestamp, color="#52C07A", note }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:10, background:`${color}08`, border:`1px solid ${color}20` }}>
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, background:`${color}15`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:3 }}>
          <span style={{ fontSize:11, color:"#8A7E6A", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</span>
          <span style={{ fontSize:17, fontWeight:800, color, fontFamily:"Georgia,serif", flexShrink:0 }}>{fmtINR(amount)}</span>
        </div>
        {method && <div style={{ marginBottom:2 }}><MethodBadge method={method} upiId={upiId} cardNumber={cardNumber} cardName={cardName}/></div>}
        {timestamp && <p style={{ fontSize:11, color:"#6B6054", margin:"2px 0 0", display:"flex", alignItems:"center", gap:5 }}> <ClockIcon/> {fmtDT(timestamp)}</p>}    
        {note && <p style={{ fontSize:11, color:"#8A7E6A", margin:"4px 0 0", fontStyle:"italic" }}>{note}</p>}
      </div>
    </div>
  )
}

function BookingRow({ booking, index, basePath, navigate }) {
  const [open, setOpen] = useState(false)

  const cust        = booking.customer
  const rt          = booking.roomType
  const isHallBk    = !!booking.paymentDetails?.isNonContiguous
  const sc          = STATUS_COLOR[booking.bookingStatus] || "#6B6054"
  const isCancelled = booking.bookingStatus === "Cancelled"
  const isCheckedIn = booking.bookingStatus === "Checked-In"
  const isNoShow    = booking.bookingStatus === "No-Show"
  const isPaid      = booking.paymentStatus === "Paid"
  const isPartial   = booking.paymentStatus === "Partially Paid"

  const nights = isHallBk ? 1 : Math.max(1, Math.round(
    (new Date(booking.checkOutDateTime) - new Date(booking.checkInDateTime)) / 86400000
  ))

  const totalAmt    = booking.totalAmount        || 0
  const amtPaid     = booking.amountPaid         || 0
  const amtDue      = booking.amountDue          || 0
  const cancelFee   = booking.cancellationFee    || 0
  const refund      = booking.cancellationRefund || 0
  const splitChoice = booking.paymentSplit || "full"
  const initPay     = booking.paymentDetails
  const ciPay       = booking.checkInPayment
  const coPay       = booking.checkOutPayment
  const earlyC      = booking.earlyCheckout
  const extStay     = booking.extendedStay
  const sw          = booking.roomSwitch
  const paidAtBooking = amtPaid - (ciPay?.amount||0) - (coPay?.amount||0)

  return (
    <>
      <tr onClick={() => setOpen(o=>!o)} style={{ cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"background .15s", background: open?"rgba(201,168,76,.04)":"transparent" }}
        onMouseEnter={e=>{ if(!open) e.currentTarget.style.background="rgba(255,255,255,.02)" }}
        onMouseLeave={e=>{ if(!open) e.currentTarget.style.background=open?"rgba(201,168,76,.04)":"transparent" }}>

        <td style={{ padding:"14px 16px", width:44 }}>
          <div style={{ width:28, height:28, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, background:`${sc}15`, color:sc, border:`1px solid ${sc}25` }}>{index+1}</div>
        </td>

        {/* Booking type icon + ref */}
        <td style={{ padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:7, background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {isHallBk ? <HallIcon size={14}/> : <IconBed size={14}/>}
            </div>
            <div>
              <p style={{ fontSize:12, fontFamily:"monospace", fontWeight:700, color:"#C9A84C", margin:0, letterSpacing:"0.05em" }}>#{booking._id?.toString().slice(-8).toUpperCase()}</p>
              <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>{isHallBk?"Hall / Venue":"Room"}</p>
            </div>
          </div>
        </td>

        <td style={{ padding:"14px 16px" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"#F5ECD7" }}>{cust?.name||"—"}</p>
          <p style={{ fontSize:11, color:"#6B6054", marginTop:2 }}>{cust?.phoneno||cust?.email||"—"}</p>
        </td>

        <td style={{ padding:"14px 16px" }}>
          {isHallBk ? (
            <>
              <p style={{ fontSize:12, color:"#C9A84C", fontWeight:600 }}>{fmtDate(booking.checkInDateTime)}</p>
              <p style={{ fontSize:11, color:"#6B6054", marginTop:1 }}>1 day · Hall</p>
            </>
          ) : (
            <>
              <p style={{ fontSize:12, color:"#C8BAA0" }}>{fmtDate(booking.checkInDateTime)}</p>
              <p style={{ fontSize:12, color:"#C8BAA0" }}>→ {fmtDate(booking.checkOutDateTime)}</p>
              <p style={{ fontSize:11, color:"#6B6054", marginTop:1 }}>{nights} night{nights!==1?"s":""}</p>
            </>
          )}
        </td>

        <td style={{ padding:"14px 16px" }}>
          <Badge label={booking.bookingStatus} variant={booking.bookingStatus}/>
          <p style={{ fontSize:10, marginTop:4, fontWeight:600, color:isPaid?"#52C07A":isPartial?"#E0A852":"#E05252" }}>
            {booking.paymentStatus}
          </p>
        </td>

        <td style={{ padding:"14px 16px" }}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, padding:"3px 8px", borderRadius:20, fontWeight:700,
            background:splitChoice==="half"?"rgba(245,158,11,.1)":"rgba(82,192,122,.1)",
            color:splitChoice==="half"?"#f59e0b":"#4ade80",
            border:`1px solid ${splitChoice==="half"?"rgba(245,158,11,.3)":"rgba(82,192,122,.3)"}` }}>
            {splitChoice==="half" ? "⚡ 50% Upfront" : "✓ Full Pay"}
          </span>
        </td>

        <td style={{ padding:"14px 16px", textAlign:"right" }}>
          <p style={{ fontSize:13, fontWeight:700, color:"#C9A84C" }}>{fmtINR(totalAmt)}</p>
          <p style={{ fontSize:11, color:"#52C07A", marginTop:1 }}>Paid {fmtINR(amtPaid)}</p>
          {amtDue>0 && !isCancelled && <p style={{ fontSize:11, color:"#E0A852" }}>Due {fmtINR(amtDue)}</p>}
          {isCancelled && cancelFee>0 && <p style={{ fontSize:11, color:"#E05252" }}>Fee {fmtINR(cancelFee)}</p>}
        </td>

        <td style={{ padding:"14px 12px" }} onClick={e=>e.stopPropagation()}>
          <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
            <button onClick={()=>navigate(`${basePath}/bookings/${booking._id}`,{state:{booking}})}
              style={{ padding:"4px 10px", borderRadius:7, fontSize:11, fontWeight:700, cursor:"pointer", background:"rgba(201,168,76,.12)", border:"1px solid rgba(201,168,76,.35)", color:"#C9A84C" }}>
              Actions →
            </button>
            <span style={{ color:"#6B6054", fontSize:12, display:"inline-block", transition:"transform .2s", transform:open?"rotate(180deg)":"rotate(0deg)" }}>▼</span>
          </div>
        </td>
      </tr>

      {open && (
        <tr style={{ background:"rgba(14,12,9,.4)", borderBottom:"2px solid rgba(201,168,76,.12)" }}>
          <td colSpan={8} style={{ padding:"4px 20px 24px" }}>
            <div className="rbk-expand-grid">

              {/* LEFT */}
              <div>
                <Divider label="Guest"/>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, fontWeight:700, color:"#4ECDC4", background:"rgba(78,205,196,.12)", border:"1px solid rgba(78,205,196,.2)" }}>
                    {(cust?.name||"G")[0].toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, color:"#F5ECD7", fontSize:14, margin:"0 0 2px" }}>{cust?.name||"—"}</p>
                    <p style={{ fontSize:12, color:"#6B6054", margin:0 }}>{cust?.email||"—"}</p>
                    <p style={{ fontSize:12, color:"#6B6054", margin:0 }}>{cust?.phoneno||"—"}</p>
                    {cust?.city && <p style={{ fontSize:11, color:"#8A7E6A", margin:0 }}>{cust.city}</p>}
                  </div>
                </div>

                <Divider label={isHallBk ? "Event" : "Stay"}/>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {isHallBk ? (
                    <TCell label="Event Date" value={fmtDate(booking.checkInDateTime)} color="#C9A84C" span2/>
                  ) : (
                    <>
                      <TCell label="Check-In"  value={fmtDate(booking.checkInDateTime)}/>
                      <TCell label="Check-Out" value={fmtDate(booking.checkOutDateTime)}/>
                    </>
                  )}
                  {booking.actualCheckInTime  && <TCell label="✓ Actual Check-In"  value={fmtDT(booking.actualCheckInTime)}  color="#52C07A"/>}
                  {booking.actualCheckOutDate && <TCell label="✓ Actual Check-Out" value={fmtDT(booking.actualCheckOutDate)} color="#52C07A"/>}
                  <TCell label={isHallBk?"Duration":"Nights"} value={isHallBk?"1 day":`${nights} night${nights!==1?"s":""}`}/>
                  <TCell label="Room Type" value={rt?.type_name}/>
                  {!isHallBk && <><TCell label="Adults" value={booking.adults||0}/>{(booking.children||0)>0&&<TCell label="Children" value={booking.children}/>}</>}
                </div>

                {/* Hall event dates list */}
                {isHallBk && booking.paymentDetails?.hallDates?.length > 0 && (
                  <>
                    <Divider label="All Event Dates"/>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {[...booking.paymentDetails.hallDates].sort().map((d,i)=>(
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:8, background:d===booking.paymentDetails.hallDates.find(x=>x===d)?"rgba(201,168,76,.05)":"transparent", border:"1px solid rgba(255,255,255,.05)" }}>
                          <span style={{ fontSize:10, color:"#6B6054", width:20 }}>{i+1}.</span>
                          <span style={{ fontSize:12, color:"#C9A84C", fontWeight:600 }}>{fmtDate(d+"T00:00:00")}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {isNoShow && booking.noShowMarkedAt && (
                  <>
                    <Divider label="No-Show" color="#E0A852"/>
                    <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(224,168,82,.08)", border:"1px solid rgba(224,168,82,.25)" }}>
                      <p style={{ fontSize:12, fontWeight:700, color:"#E0A852", margin:"0 0 4px" }}>⚠ Marked No-Show</p>
                      <p style={{ fontSize:12, color:"#8A7E6A", margin:0 }}>{fmtDT(booking.noShowMarkedAt)}</p>
                      <p style={{ fontSize:11, color:"#6B6054", margin:"4px 0 0", fontStyle:"italic" }}>
                        Amount paid of {fmtINR(amtPaid)} has been retained as no-show revenue.
                      </p>
                    </div>
                  </>
                )}

                {sw?.switchedAt && (
                  <>
                    <Divider label="Room Switch" color="#9B7FE8"/>
                    <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(147,112,219,.08)", border:"1px solid rgba(147,112,219,.25)" }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#9B7FE8", margin:"0 0 3px" }}>
                        #{sw.fromRoom?.room_number||"?"} → #{sw.toRoom?.room_number||"?"}
                      </p>
                      <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>{fmtDT(sw.switchedAt)}</p>
                      {sw.reason && <p style={{ fontSize:11, color:"#8A7E6A", margin:"3px 0 0", fontStyle:"italic" }}>Reason: {sw.reason}</p>}
                      {sw.emailSent && <p style={{ fontSize:11, color:"#52C07A", margin:"3px 0 0" }}>✓ Guest notified</p>}
                    </div>
                  </>
                )}

                {booking.guests?.length > 0 && (
                  <>
                    <Divider label={`Guests (${booking.guests.length})`}/>
                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                      {booking.guests.map((g, gi) => (
                        <div key={gi} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", borderRadius:8, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)" }}>
                          <span style={{ fontSize:10, color:"#6B6054", width:16 }}>{gi+1}.</span>
                          <span style={{ fontSize:13, color:"#F5ECD7", flex:1 }}>{g.name||"—"}</span>
                          {g.age && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:12, background:"rgba(82,148,224,.1)", color:"#5294E0", border:"1px solid rgba(82,148,224,.2)" }}>{g.age}y</span>}
                          {g.gender && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:12, background:"rgba(155,127,232,.1)", color:"#9B7FE8", border:"1px solid rgba(155,127,232,.2)" }}>{g.gender}</span>}
                          <span style={{ fontSize:9, padding:"1px 6px", borderRadius:10, fontWeight:700,
                            background:gi<(booking.adults||0)?"rgba(201,168,76,.1)":"rgba(82,148,224,.1)",
                            color:gi<(booking.adults||0)?"#C9A84C":"#5294E0",
                            border:`1px solid ${gi<(booking.adults||0)?"rgba(201,168,76,.2)":"rgba(82,148,224,.2)"}` }}>
                            {gi<(booking.adults||0)?"Adult":"Child"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {booking.feedback?.rating && (
                  <>
                    <Divider label="Guest Feedback"/>
                    <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(201,168,76,.06)", border:"1px solid rgba(201,168,76,.15)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:booking.feedback.comment?6:0 }}>
                        <span style={{ fontSize:15, letterSpacing:2, color:"#C9A84C" }}>{"★".repeat(booking.feedback.rating)}<span style={{ color:"rgba(255,255,255,.1)" }}>{"★".repeat(5-booking.feedback.rating)}</span></span>
                        <span style={{ fontSize:13, fontWeight:700, color:"#C9A84C" }}>{booking.feedback.rating}/5</span>
                        {booking.feedback.submittedAt && <span style={{ fontSize:10, color:"#6B6054", marginLeft:"auto" }}>{fmtDate(booking.feedback.submittedAt)}</span>}
                      </div>
                      {booking.feedback.comment && <p style={{ fontSize:12, color:"#8A7E6A", fontStyle:"italic", margin:0 }}>"{booking.feedback.comment}"</p>}
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT */}
              <div>
                <Divider label="Financial Overview"/>
                <div className="rbk-fin-grid">
                  <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.2)" }}>
                    <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Total Billed</p>
                    <p style={{ fontSize:16, fontWeight:800, color:"#C9A84C", margin:0 }}>{fmtINR(totalAmt)}</p>
                    <p style={{ fontSize:9, color:"#6B6054", marginTop:2 }}>{isHallBk?"1 day":`${nights}n`} × {fmtINR(rt?.price_per_night||0)}</p>
                  </div>
                  <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)" }}>
                    <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Total Paid</p>
                    <p style={{ fontSize:16, fontWeight:800, color:"#52C07A", margin:0 }}>{fmtINR(amtPaid)}</p>
                    <p style={{ fontSize:9, color:"#6B6054", marginTop:2 }}>{isPaid?"Fully settled":"Partial"}</p>
                  </div>
                  {isCancelled ? (
                    <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(248,113,113,.08)", border:"1px solid rgba(248,113,113,.2)" }}>
                      <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Refund</p>
                      <p style={{ fontSize:16, fontWeight:800, color:"#f87171", margin:0 }}>{fmtINR(refund)}</p>
                      <p style={{ fontSize:9, color:"#6B6054", marginTop:2 }}>Fee: {fmtINR(cancelFee)}</p>
                    </div>
                  ) : isNoShow ? (
                    <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(224,168,82,.08)", border:"1px solid rgba(224,168,82,.2)" }}>
                      <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Forfeited</p>
                      <p style={{ fontSize:16, fontWeight:800, color:"#E0A852", margin:0 }}>{fmtINR(amtPaid)}</p>
                      <p style={{ fontSize:9, color:"#6B6054", marginTop:2 }}>No-show rev</p>
                    </div>
                  ) : amtDue > 0 ? (
                    <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(224,168,82,.08)", border:"1px solid rgba(224,168,82,.2)" }}>
                      <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Still Due</p>
                      <p style={{ fontSize:16, fontWeight:800, color:"#E0A852", margin:0 }}>{fmtINR(amtDue)}</p>
                      <p style={{ fontSize:9, color:"#6B6054", marginTop:2 }}>{isCheckedIn?"At checkout":"Pending"}</p>
                    </div>
                  ) : (
                    <div style={{ padding:"12px", borderRadius:10, textAlign:"center", background:"rgba(82,192,122,.06)", border:"1px solid rgba(82,192,122,.15)" }}>
                      <p style={{ fontSize:10, color:"#6B6054", marginBottom:3 }}>Balance</p>
                      <p style={{ fontSize:16, fontWeight:800, color:"#52C07A", margin:0 }}>₹0</p>
                      <p style={{ fontSize:9, color:"#52C07A", marginTop:2 }}>✓ Settled</p>
                    </div>
                  )}
                </div>

                <Divider label="Payment Timeline"/>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {paidAtBooking > 0 && initPay?.method && (
                    <PayStage icon={<AtBookingIcon/>} label="At Booking" amount={paidAtBooking}
                      method={initPay.method} upiId={initPay.upiId} cardNumber={initPay.cardNumber} cardName={initPay.cardName}
                      timestamp={booking.createdAt} color="#C9A84C"
                      note={splitChoice==="half"?"50% paid to confirm reservation":"Full payment at time of booking"}/>
                  )}
                  {ciPay?.amount > 0 && (
                    <PayStage icon={<DoorIcon/>} label="At Check-In" amount={ciPay.amount}
                      method={ciPay.method} upiId={ciPay.upiId} cardNumber={ciPay.cardNumber} cardName={ciPay.cardName}
                      timestamp={ciPay.collectedAt} color="#52C07A" note="Remaining 50% collected at check-in"/>
                  )}
                  {coPay?.amount > 0 && (
                    <PayStage icon={<DoorIcon/>} label={extStay?.isExtended?"At Check-Out (incl. extended)":"At Check-Out"} amount={coPay.amount}
                      method={coPay.method} upiId={coPay.upiId} cardNumber={coPay.cardNumber} cardName={coPay.cardName}
                      timestamp={coPay.collectedAt} color="#52C07A"
                      note={extStay?.isExtended?`Includes ${extStay.extraNights} extra night charge of ${fmtINR(extStay.extraCharge)}`:earlyC?.isEarly?`Early fee: ${fmtINR(earlyC.totalDeduction)}`:"Balance settled at checkout"}/>
                  )}
                  {amtDue > 0 && !isCancelled && !isNoShow && (
                    <div style={{ padding:"10px 14px", borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px dashed rgba(224,168,82,.35)", display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:16 }}>⏳</span>
                      <div>
                        <p style={{ fontSize:12, fontWeight:700, color:"#E0A852", margin:"0 0 2px" }}>{fmtINR(amtDue)} still pending</p>
                        <p style={{ fontSize:11, color:"#6B6054", margin:0 }}>{isCheckedIn?"Collect at checkout":"Due at check-in"}</p>
                      </div>
                    </div>
                  )}
                </div>

                {extStay?.isExtended && (
                  <>
                    <Divider label="Extended Stay Charges" color="#E0A852"/>
                    <div style={{ padding:"14px", borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px solid rgba(224,168,82,.25)" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <TCell label="Original Nights"     value={extStay.originalNights}/>
                        <TCell label="Total Nights Stayed" value={extStay.totalNights} color="#E0A852"/>
                        <TCell label="Extra Nights"        value={extStay.extraNights}  color="#E0A852"/>
                        <TCell label="Extra Charge"        value={fmtINR(extStay.extraCharge)} color="#E0A852" span2/>
                      </div>
                    </div>
                  </>
                )}

                {earlyC?.isEarly && (
                  <>
                    <Divider label="Early Checkout" color="#E0A852"/>
                    <div style={{ padding:"14px", borderRadius:10, background:"rgba(224,168,82,.06)", border:"1px solid rgba(224,168,82,.25)" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <TCell label="Booked Nights"    value={earlyC.originalNights}/>
                        <TCell label="Stayed Nights"    value={earlyC.stayedNights}   color="#E0A852"/>
                        <TCell label="Unused Nights"    value={earlyC.unusedNights}/>
                        <TCell label="Total Early Fee"  value={fmtINR(earlyC.totalDeduction)} color="#E05252"/>
                      </div>
                      {earlyC.refundAmount > 0 && (
                        <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, background:"rgba(82,192,122,.08)", border:"1px solid rgba(82,192,122,.2)", fontSize:12, color:"#52C07A", fontWeight:600 }}>
                          ✓ Refund issued: {fmtINR(earlyC.refundAmount)}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {isCancelled && (
                  <>
                    <Divider label="Cancellation" color="#f87171"/>
                    <div style={{ padding:"14px", borderRadius:10, background:"rgba(248,113,113,.06)", border:"1px solid rgba(248,113,113,.25)" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                        <TCell label="Total Value"    value={fmtINR(totalAmt)}  color="#C9A84C"/>
                        <TCell label="Paid Upfront"   value={fmtINR(amtPaid)}   color="#C8BAA0"/>
                        <TCell label="Cancel Fee"     value={fmtINR(cancelFee)} color="#f87171"/>
                        <TCell label="Refund"         value={fmtINR(refund)}    color={refund>0?"#52C07A":"#6B6054"}/>
                      </div>
                      {booking.cancelledAt && (
                        <div style={{ marginTop:8, fontSize:11, color:"#6B6054" }}>
                          Cancelled: <span style={{ color:"#C8BAA0" }}>{fmtDT(booking.cancelledAt)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, color:"#6B6054" }}>Booking Ref</span>
                  <span style={{ fontSize:12, fontFamily:"monospace", color:"rgba(201,168,76,.7)", letterSpacing:"0.06em" }}>
                    #{booking._id?.toString().slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}


/* ── Mini calendar picker ── */
function MiniCalendar({ value, onChange, onClose, label }) {
  const [month, setMonth] = useState(() => {
    const d = value ? new Date(value) : new Date()
    d.setDate(1); return d
  })
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"]
  const y = month.getFullYear(), m = month.getMonth()
  const firstDay = new Date(y,m,1).getDay()
  const daysIn   = new Date(y,m+1,0).getDate()
  const toYMD = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
  const cells = [...Array(firstDay).fill(null), ...Array.from({length:daysIn},(_,i)=>i+1)]

  return (
    <div style={{
      position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:200,
      background:"#1a1710", border:"1px solid rgba(201,168,76,.3)",
      borderRadius:12, padding:14, width:"min(260px, calc(100vw - 32px))", boxShadow:"0 16px 40px rgba(0,0,0,.6)",
    }} onClick={e=>e.stopPropagation()}>
      <p style={{fontSize:10,fontWeight:700,color:"#6B6054",textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 10px"}}>{label}</p>
      {/* Month nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <button type="button" onClick={()=>setMonth(new Date(y,m-1,1))}
          style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,color:"#C9A84C",width:24,height:24,cursor:"pointer",fontSize:13}}>‹</button>
        <span style={{fontSize:12,fontWeight:700,color:"#F5ECD7"}}>{MONTHS[m]} {y}</span>
        <button type="button" onClick={()=>setMonth(new Date(y,m+1,1))}
          style={{background:"none",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,color:"#C9A84C",width:24,height:24,cursor:"pointer",fontSize:13}}>›</button>
      </div>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:"#6B6054",fontWeight:700}}>{d}</div>)}
      </div>
      {/* Dates */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {cells.map((d,i)=>{
          if (!d) return <div key={`e${i}`}/>
          const ymd = toYMD(new Date(y,m,d))
          const sel = value === ymd
          return (
            <button key={ymd} type="button" onClick={()=>{onChange(ymd);onClose()}}
              style={{minHeight:32,padding:"4px 2px",borderRadius:6,fontSize:11,fontWeight:sel?700:400,textAlign:"center",
                background:sel?"rgba(201,168,76,.25)":"transparent",
                border:sel?"1px solid rgba(201,168,76,.6)":"1px solid transparent",
                color:sel?"#C9A84C":"#C8BAA0",cursor:"pointer"}}>
              {d}
            </button>
          )
        })}
      </div>
      {value && (
        <button type="button" onClick={()=>{onChange("");onClose()}}
          style={{marginTop:10,width:"100%",padding:"5px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"#6B6054",fontSize:11,cursor:"pointer"}}>
          Clear
        </button>
      )}
    </div>
  )
}

export default function RoomBookings() {
  const { roomId } = useParams()
  const navigate   = useNavigate()

  const [room,     setRoom]     = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState("All")
  const [search,   setSearch]   = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo,   setDateTo]   = useState("")
  const [calOpen,  setCalOpen]  = useState(false)   // "from" | "to" | false
  const [calMonth, setCalMonth] = useState(() => { const d=new Date(); d.setDate(1); return d })

  const basePath = window.location.pathname.startsWith("/staff") ? "/staff" : "/admin"

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [rRes, bRes] = await Promise.all([getRooms(), getAllBookings()])
        const allRooms = rRes.data || []
        const allBooks = bRes.data || []
        const found    = allRooms.find(r => r._id === roomId)
        setRoom(found || null)

        const roomTypeId = found?.roomType?._id?.toString() || found?.roomType?.toString()

        // ── Show ALL bookings for this room OR hall bookings of the same room type ──
        const roomBooks = allBooks.filter(b => {
          const bRoomId     = b.room?._id?.toString() || b.room?.toString()
          const bRoomTypeId = b.roomType?._id?.toString() || b.roomType?.toString()
          const isHallBk    = !!b.paymentDetails?.isNonContiguous

          // Direct room match
          if (bRoomId === roomId) return true

          // Hall bookings of the same room type (halls don't have a room assigned)
          if (isHallBk && roomTypeId && bRoomTypeId === roomTypeId) return true

          return false
        }).sort((a, b) => new Date(b.checkInDateTime) - new Date(a.checkInDateTime))

        setBookings(roomBooks)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [roomId])

  if (loading) return <Loader text="Loading room bookings…"/>

  const rt = room?.roomType

  const STATUS_TABS = ["All","Booked","Checked-In","Checked-Out","Cancelled","No-Show"]

  const filtered = bookings.filter(b => {
    // Status tab
    if (filter !== "All" && b.bookingStatus !== filter) return false
    // Text search — ref, guest name, phone/email
    if (search.trim()) {
      const q   = search.trim().toLowerCase()
      const ref = (b._id?.toString().slice(-8)||"").toLowerCase()
      const name  = (b.customer?.name||"").toLowerCase()
      const phone = (b.customer?.phoneno||"").toLowerCase()
      const email = (b.customer?.email||"").toLowerCase()
      const type  = b.paymentDetails?.isNonContiguous ? "hall" : "room"
      if (!ref.includes(q) && !name.includes(q) && !phone.includes(q) && !email.includes(q) && !type.includes(q)) return false
    }
    // Date range filter — match if booking overlaps [dateFrom, dateTo]
    if (dateFrom || dateTo) {
      const bDate = new Date(b.checkInDateTime); bDate.setHours(0,0,0,0)
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0,0,0,0)
        if (bDate < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23,59,59,999)
        if (bDate > to) return false
      }
    }
    return true
  })

  const counts = STATUS_TABS.reduce((acc, s) => ({
    ...acc,
    [s]: s==="All" ? bookings.length : bookings.filter(b => b.bookingStatus===s).length,
  }), {})

  const totalRevenue  = bookings.filter(b=>!["Cancelled","No-Show"].includes(b.bookingStatus)).reduce((s,b)=>s+(b.amountPaid||0),0)
  const totalDue      = bookings.filter(b=>!["Cancelled","No-Show"].includes(b.bookingStatus)).reduce((s,b)=>s+(b.amountDue||0),0)
  const noShowRevenue = bookings.filter(b=>b.bookingStatus==="No-Show").reduce((s,b)=>s+(b.amountPaid||0),0)
  const hallCount     = bookings.filter(b=>!!b.paymentDetails?.isNonContiguous).length
  const roomCount     = bookings.filter(b=>!b.paymentDetails?.isNonContiguous).length

  return (
    <div>
      <div className="page-hd">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", color:"#8A7E6A", cursor:"pointer", fontSize:16, transition:"border-color .15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="rgba(201,168,76,.35)"}
            onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
            ←
          </button>
          <div>
            <h1 className="page-title">
              Room #{room?.room_number || "—"}
              <span className="text-resort-muted font-normal text-lg ml-2">· Floor {room?.floor}</span>
            </h1>
            <p className="page-sub">
              {rt?.type_name || "Room"} · {bookings.length} booking{bookings.length!==1?"s":""} total
              {hallCount > 0 && <span style={{color:"#C9A84C",marginLeft:6}}>({roomCount} room · {hallCount} hall)</span>}
            </p>
          </div>
        </div>
        <Badge label={room?.status || "—"} variant={room?.status}/>
      </div>

      {rt && (
        <div className="card-p mb-5 anim-up d1" style={{ padding:"14px 18px" }}>
          <div className="flex items-center gap-4 flex-wrap">
            {rt.images?.[0] && (
              <div style={{ width:72, height:52, borderRadius:8, overflow:"hidden", flexShrink:0 }}>
                <img src={toImgUrl(rt.images[0])} alt={rt.type_name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              </div>
            )}
            <div className="flex-1">
              <p className="font-semibold text-cream">{rt.type_name}</p>
              <p className="text-xs text-resort-dim mt-0.5">
                {rt.capacity && `${rt.capacity} guests`}
                {rt.beds?.length>0 && ` · ${rt.beds.map(b=>`${b.count} ${b.type}`).join(", ")}`}
                {rt.price_per_night && ` · ${fmtINR(rt.price_per_night)}/night`}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                ["Total",         bookings.length,         "#C9A84C"],
                ["Revenue",       fmtINR(totalRevenue),    "#52C07A"],
                ["Pending Due",   fmtINR(totalDue),        "#E0A852"],
                ...(noShowRevenue > 0 ? [["No-Show Rev", fmtINR(noShowRevenue), "#f59e0b"]] : []),
              ].map(([l,v,c]) => (
                <div key={l} style={{ textAlign:"center", padding:"8px 14px", borderRadius:10, background:`${c}08`, border:`1px solid ${c}18` }}>
                  <p style={{ fontSize:15, fontWeight:800, color:c, margin:0 }}>{v}</p>
                  <p style={{ fontSize:9, color:"#6B6054", margin:0 }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Info: halls are included */}
          {hallCount > 0 && (
            <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, background:"rgba(201,168,76,.05)", border:"1px solid rgba(201,168,76,.12)", display:"flex", alignItems:"center", gap:6 }}>
              <BulbIcon size={13} color="#C9A84C"/>
              <span style={{ fontSize:11, color:"#8A7E6A" }}>
                Includes <strong style={{ color:"#C9A84C" }}>{hallCount} hall/venue booking{hallCount!==1?"s":""}</strong> for this room type alongside {roomCount} room booking{roomCount!==1?"s":""}.
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Search + Date Range Toolbar ── */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"flex-start" }}>

        {/* Text search */}
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(201,168,76,.5)" strokeWidth="2" strokeLinecap="round"
            style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search ref, guest name, phone…"
            style={{ width:"100%", boxSizing:"border-box", paddingLeft:32, paddingRight:12, paddingTop:9, paddingBottom:9,
              background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.09)", borderRadius:9,
              color:"#F5ECD7", fontSize:13, outline:"none", transition:"border-color .2s" }}
            onFocus={e=>e.target.style.borderColor="rgba(201,168,76,.4)"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.09)"}/>
        </div>

        {/* Date From */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <button type="button" onClick={()=>setCalOpen(o=>o==="from"?false:"from")}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 13px", borderRadius:9, cursor:"pointer",
              background: dateFrom?"rgba(201,168,76,.1)":"rgba(255,255,255,.04)",
              border:`1px solid ${dateFrom?"rgba(201,168,76,.4)":"rgba(255,255,255,.09)"}`,
              color: dateFrom?"#C9A84C":"#8A7E6A", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            {dateFrom ? (() => { const [y,m,d]=dateFrom.split("-"); return `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${y}` })() : "From date"}
            {dateFrom && <span onClick={e=>{e.stopPropagation();setDateFrom("")}} style={{marginLeft:4,opacity:.6,fontSize:14,lineHeight:1}}>×</span>}
          </button>
          {calOpen==="from" && (
            <MiniCalendar value={dateFrom} onChange={setDateFrom} onClose={()=>setCalOpen(false)} label="Check-in from"/>
          )}
        </div>

        {/* Date To */}
        <div style={{ position:"relative", flexShrink:0 }}>
          <button type="button" onClick={()=>setCalOpen(o=>o==="to"?false:"to")}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 13px", borderRadius:9, cursor:"pointer",
              background: dateTo?"rgba(201,168,76,.1)":"rgba(255,255,255,.04)",
              border:`1px solid ${dateTo?"rgba(201,168,76,.4)":"rgba(255,255,255,.09)"}`,
              color: dateTo?"#C9A84C":"#8A7E6A", fontSize:12, fontWeight:600, whiteSpace:"nowrap" }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
            {dateTo ? (() => { const [y,m,d]=dateTo.split("-"); return `${d} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${y}` })() : "To date"}
            {dateTo && <span onClick={e=>{e.stopPropagation();setDateTo("")}} style={{marginLeft:4,opacity:.6,fontSize:14,lineHeight:1}}>×</span>}
          </button>
          {calOpen==="to" && (
            <MiniCalendar value={dateTo} onChange={setDateTo} onClose={()=>setCalOpen(false)} label="Check-in to"/>
          )}
        </div>

        {/* Clear all filters */}
        {(search||dateFrom||dateTo||filter!=="All") && (
          <button type="button" onClick={()=>{setSearch("");setDateFrom("");setDateTo("");setFilter("All")}}
            style={{ padding:"9px 14px", borderRadius:9, border:"1px solid rgba(248,113,113,.3)", background:"rgba(248,113,113,.07)", color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0 }}>
            Clear all
          </button>
        )}
      </div>

      {/* Close calendar on outside click */}
      {calOpen && <div style={{position:"fixed",inset:0,zIndex:199}} onClick={()=>setCalOpen(false)}/>}

      {/* Result count when filtering */}
      {(search||dateFrom||dateTo||filter!=="All") && (
        <p style={{ fontSize:11, color:"#6B6054", marginBottom:10 }}>
          Showing <strong style={{color:"#C9A84C"}}>{filtered.length}</strong> of <strong style={{color:"#C9A84C"}}>{bookings.length}</strong> bookings
        </p>
      )}

      <div className="tab-row mb-4" style={{ overflowX:"auto" }}>
        {STATUS_TABS.filter(s => s==="All" || counts[s]>0).map(s => (
          <button key={s} className={`tab-btn ${filter===s?"on":""}`} onClick={() => setFilter(s)} style={{ whiteSpace:"nowrap" }}>
            {s}
            {counts[s] > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background:filter===s?"rgba(201,168,76,.2)":"rgba(255,255,255,.07)", color:filter===s?"#C9A84C":"#6B6054" }}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card-p text-center py-12">
          <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
            <BookingIcon size={28} color="rgba(255,255,255,.2)"/>
          </div>
          <p className="text-resort-dim text-sm">No {filter!=="All"?filter.toLowerCase():""} bookings for this room</p>
        </div>
      ) : (
        <div className="anim-up d2" style={{ borderRadius:14, overflow:"hidden", border:"1px solid rgba(255,255,255,.06)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"rgba(255,255,255,.03)", borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                {["#","Ref / Type","Guest","Dates","Status","Payment","Financials",""].map(h => (
                  <th key={h} style={{ padding:"11px 16px", textAlign:h==="Financials"?"right":"left", fontSize:10, fontWeight:700, color:"#6B6054", textTransform:"uppercase", letterSpacing:"0.5em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <BookingRow key={b._id} booking={b} index={i} basePath={basePath} navigate={navigate}/>
              ))}
            </tbody>
          </table>
          <div style={{ padding:"12px 16px", background:"rgba(201,168,76,.04)", borderTop:"1px solid rgba(201,168,76,.1)", display:"flex", justifyContent:"flex-end", gap:24, flexWrap:"wrap" }}>
            {[
              ["Shown",      filtered.length,                                                                                                    "#C9A84C"],
              ["Collected",  fmtINR(filtered.filter(b=>!["Cancelled","No-Show"].includes(b.bookingStatus)).reduce((s,b)=>s+(b.amountPaid||0),0)), "#52C07A"],
              ["Due",        fmtINR(filtered.filter(b=>!["Cancelled","No-Show"].includes(b.bookingStatus)).reduce((s,b)=>s+(b.amountDue||0),0)),  "#E0A852"],
            ].map(([l,v,c]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:7 }}>
                <span style={{ fontSize:11, color:"#6B6054" }}>{l}:</span>
                <span style={{ fontSize:13, fontWeight:700, color:c }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}