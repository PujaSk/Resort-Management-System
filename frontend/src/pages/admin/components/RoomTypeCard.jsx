// src/pages/admin/components/RoomTypeCard.jsx
// ─────────────────────────────────────────────────────────────
// Shared card used by BOTH RoomSettings AND ManageRooms.
// Edit here → both pages update automatically.
// ─────────────────────────────────────────────────────────────
import React from "react"
import Button from "../../../components/ui/Button"

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"
const toImgUrl = p => !p ? null : p.startsWith("http") ? p : `${BACKEND_URL}/${p.replace(/^\/+/, "")}`

/* ── Auto-sliding image banner ─────────────────────────────── */
function AutoSlider({ images }) {
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!images?.length) return
    const id = setInterval(
      () => setCurrent(p => (p === images.length - 1 ? 0 : p + 1)),
      3000
    )
    return () => clearInterval(id)
  }, [images])

  if (!images?.length) return null

  return (
    <div style={{
      position: "relative",
      height: "180px",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: "12px",
    }}>
      {images.map((img, i) => (
        <img
          key={i}
          src={toImgUrl(img)}
          alt="room"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "12px",
            top: 0,
            left: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        />
      ))}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "6px",
          zIndex: 2,
        }}>
          {images.map((_, i) => (
            <span
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                cursor: "pointer",
                transition: "background .3s",
                backgroundColor: i === current ? "#c9a84c" : "rgba(255,255,255,0.4)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main Card ─────────────────────────────────────────────── */
/**
 * Props
 * ─────
 * roomType   {object}   – the room-type document from the API
 * onEdit     {fn}       – called with roomType; omit to hide Edit button
 * onDelete   {fn}       – called with roomType._id; omit to hide Delete button
 * index      {number}   – used for staggered anim-up delay class (optional)
 */
export default function RoomTypeCard({ roomType: t, onEdit, onDelete, index = 0 }) {
  return (
    <div className={`card-p anim-up d${Math.min(index + 1, 5)}`}>

      {/* Sliding images */}
      {t.images?.length > 0 && <AutoSlider images={t.images} />}

      {/* Header row: name + price */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-display text-xl font-semibold text-cream">{t.type_name}</h3>
        <span className="font-bold text-gold text-lg">
          ₹{t.price_per_night?.toLocaleString("en-IN")}
        </span>
      </div>

      {/* Capacity */}
      <p className="text-resort-muted text-sm mb-2">
        👥 Capacity: {t.capacity} guest{t.capacity !== 1 ? "s" : ""}
      </p>

      {/* Beds */}
      {t.beds?.length > 0 && (
        <p className="text-resort-dim text-xs mb-2">
          🛏 {t.beds.map(b => `${b.count}× ${b.type}`).join(", ")}
        </p>
      )}

      {/* Description */}
      {t.description && (
        <p className="text-resort-dim text-xs leading-relaxed mb-3 line-clamp-3">
          {t.description}
        </p>
      )}

      {/* Amenity chips */}
      {t.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {t.amenities.map(a => (
            <span
              key={a}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-gold"
              style={{
                background: "rgba(201,168,76,.08)",
                border: "1px solid rgba(201,168,76,.15)",
              }}
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons — only rendered when handlers are provided */}
      {(onEdit || onDelete) && (
        <div
          className="flex gap-2 mt-auto pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,.05)" }}
        >
          {onEdit && (
            <Button size="xs" variant="outline" onClick={() => onEdit(t)} className="flex-1">
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="xs" variant="danger" onClick={() => onDelete(t._id)}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}