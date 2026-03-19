// src/components/ui/AmenityIcon.jsx
//
// Uses icons already defined in Icons.jsx.
// Keyword matching is case-insensitive, so admin can type
// "Free WiFi", "wifi", "Wi-Fi" — all resolve to the same icon.
//
// Usage:
//   import { AmenityIcon, AmenityBadge } from "../ui/AmenityIcon"
//
//   <AmenityIcon name="WiFi" size={18} color="#C9A84C" />
//   <AmenityBadge name="Swimming Pool" />

import React from "react"
import {
  AcIcon,
  WifiIcon,
  CoffeeIcon,
  JacuzziIcon,
  GymIcon,
  GameIcon,
  TvIcon,
  BreakfastIcon,
  FridgeIcon,
  PoolIcon,
  LockIcon,
} from "./Icons"

/* ─────────────────────────────────────────────
   Extra inline SVGs for amenities not in Icons.jsx
───────────────────────────────────────────── */

const SafeIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M3 9h2M3 15h2M19 9h2M19 15h2"/>
    <path d="M12 8v4l2 2"/>
  </svg>
)

const ParkingIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
  </svg>
)

const BalconyIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="5" rx="1"/>
    <path d="M2 8h20v4H2z"/>
    <path d="M6 12v9M10 12v9M14 12v9M18 12v9"/>
    <path d="M2 21h20"/>
  </svg>
)

const ViewIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const HeaterIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
  </svg>
)

const BathtubIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4z"/>
    <path d="M4 12V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1"/>
    <path d="M6 19v2M18 19v2"/>
  </svg>
)

const HousekeepingIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18"/>
    <circle cx="7" cy="6" r="1" fill={color} stroke="none"/>
    <circle cx="7" cy="12" r="1" fill={color} stroke="none"/>
    <circle cx="7" cy="18" r="1" fill={color} stroke="none"/>
  </svg>
)

const LaundryIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="20" rx="2"/>
    <circle cx="12" cy="13" r="5"/>
    <path d="M5 6h1M8 6h1"/>
  </svg>
)

const ElevatorIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="2" width="18" height="20" rx="2"/>
    <path d="M9 10l3-3 3 3"/>
    <path d="M9 15l3 3 3-3"/>
  </svg>
)

const SecurityIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const PetIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.562-1.053 1.562-1"/>
    <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.562-1.053-1.562-1"/>
    <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/>
  </svg>
)

const NoSmokingIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="22" y2="22"/>
    <path d="M16 12h4a2 2 0 0 1 2 2v2H4v-2a2 2 0 0 1 2-2h6"/>
    <path d="M18 8c0-2-2-2-2-4"/>
  </svg>
)

const GardenIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/>
    <path d="M5 3a7 7 0 0 1 14 0c0 4-3 7-7 9-4-2-7-5-7-9z"/>
  </svg>
)

const BeachIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 8a6 6 0 0 0-11 0"/>
    <path d="M3 21c1-4 4-6 9-6s8 2 9 6"/>
    <path d="M8 21l4-6"/>
  </svg>
)

const ConciergeIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h18"/>
    <path d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z"/>
    <path d="M12 4v2"/>
  </svg>
)

const RoomServiceIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 19h18"/>
    <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/>
  </svg>
)

const PowerBackupIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
)

const SpaIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22C6 22 2 17 2 11c0-2 1-5 3-7 0 3 1.5 5 4 6-1-2-1-4 1-6 1 3 3 5 5 5-1-2 0-4 2-5 1 4 2 7 1 10 2-2 3-5 3-8 2 2 3 5 3 8 0 5.5-4 9-12 9z"/>
  </svg>
)

const RestaurantIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
  </svg>
)

const GenericAmenityIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v4M12 16h.01"/>
  </svg>
)

/* ─────────────────────────────────────────────
   Icon component map
───────────────────────────────────────────── */
const ICON_COMPONENTS = {
  wifi:         WifiIcon,
  ac:           AcIcon,
  pool:         PoolIcon,
  tv:           TvIcon,
  parking:      ParkingIcon,
  breakfast:    BreakfastIcon,
  restaurant:   RestaurantIcon,
  gym:          GymIcon,
  spa:          SpaIcon,
  heater:       HeaterIcon,
  balcony:      BalconyIcon,
  view:         ViewIcon,
  minibar:      FridgeIcon,
  fridge:       FridgeIcon,
  safe:         SafeIcon,
  locker:       LockIcon,
  bathtub:      BathtubIcon,
  jacuzzi:      JacuzziIcon,
  coffee:       CoffeeIcon,
  housekeeping: HousekeepingIcon,
  laundry:      LaundryIcon,
  elevator:     ElevatorIcon,
  security:     SecurityIcon,
  pet:          PetIcon,
  nosmoking:    NoSmokingIcon,
  garden:       GardenIcon,
  beach:        BeachIcon,
  concierge:    ConciergeIcon,
  roomservice:  RoomServiceIcon,
  powerbackup:  PowerBackupIcon,
  game:         GameIcon,
  generic:      GenericAmenityIcon,
}

/* ─────────────────────────────────────────────
   Keyword → icon key  (order matters — more
   specific phrases before shorter keywords)
───────────────────────────────────────────── */
const KEYWORD_MAP = [
  { keys: ["wifi", "wi-fi", "wi fi", "internet", "broadband", "high speed"],            icon: "wifi"         },
  { keys: ["ac", "a/c", "air condition", "air-condition", "cooling"],                   icon: "ac"           },
  { keys: ["pool", "swimming", "swim"],                                                  icon: "pool"         },
  { keys: ["tv", "television", "smart tv", "cable tv", "led tv"],                       icon: "tv"           },
  { keys: ["parking", "car park", "valet"],                                             icon: "parking"      },
  { keys: ["coffee maker", "coffee machine", "tea maker", "kettle", "tea"],             icon: "coffee"       },
  { keys: ["breakfast", "complimentary meal"],                                          icon: "breakfast"    },
  { keys: ["restaurant", "dining", "food court", "café", "cafe"],                       icon: "restaurant"   },
  { keys: ["gym", "fitness", "workout", "exercise"],                                    icon: "gym"          },
  { keys: ["spa", "wellness", "massage", "sauna", "steam"],                             icon: "spa"          },
  { keys: ["heat", "heater", "geyser", "hot water"],                                    icon: "heater"       },
  { keys: ["balcony", "terrace", "patio", "deck", "verandah"],                          icon: "balcony"      },
  { keys: ["mountain view", "sea view", "ocean view", "lake view", "garden view",
           "city view", "pool view", "scenic view", "valley view"],                     icon: "view"         },
  { keys: ["view"],                                                                      icon: "view"         },
  { keys: ["mini bar", "minibar", "mini-bar", "beverages", "mini fridge"],              icon: "minibar"      },
  { keys: ["fridge", "freeze", "freezer", "refrigerator"],                              icon: "fridge"       },
  { keys: ["jacuzzi", "whirlpool", "hot tub", "hydro"],                                icon: "jacuzzi"      },
  { keys: ["bathtub", "bath tub", "tub", "soaking bath"],                              icon: "bathtub"      },
  { keys: ["safe", "vault"],                                                             icon: "safe"         },
  { keys: ["locker", "security box"],                                                   icon: "locker"       },
  { keys: ["housekeep", "maid", "cleaning service", "turndown"],                        icon: "housekeeping" },
  { keys: ["laundry", "washing", "dryer"],                                              icon: "laundry"      },
  { keys: ["elevator", "lift"],                                                          icon: "elevator"     },
  { keys: ["security", "cctv", "guard", "surveillance"],                                icon: "security"     },
  { keys: ["pet", "dog", "cat", "animal"],                                              icon: "pet"          },
  { keys: ["no smoking", "non-smoking", "non smoking", "smoke-free", "smoke free"],    icon: "nosmoking"    },
  { keys: ["garden", "lawn", "landscape"],                                              icon: "garden"       },
  { keys: ["beach", "sea", "ocean", "waterfront", "lakefront"],                        icon: "beach"        },
  { keys: ["concierge", "reception", "front desk", "bell boy"],                        icon: "concierge"    },
  { keys: ["room service", "24-hour service", "24 hour", "in-room dining"],            icon: "roomservice"  },
  { keys: ["power backup", "generator", "ups", "power supply"],                        icon: "powerbackup"  },
  { keys: ["game", "gaming", "arcade", "play zone"],                                   icon: "game"         },
]

/* ─────────────────────────────────────────────
   getAmenityIconKey — returns icon key string
───────────────────────────────────────────── */
export function getAmenityIconKey(name = "") {
  const lower = name.toLowerCase().trim()
  for (const entry of KEYWORD_MAP) {
    if (entry.keys.some(k => lower.includes(k))) return entry.icon
  }
  return "generic"
}

/* ─────────────────────────────────────────────
   <AmenityIcon> — SVG icon only
   Props: name, size, color
───────────────────────────────────────────── */
export function AmenityIcon({ name = "", size = 18, color = "#C9A84C" }) {
  const key  = getAmenityIconKey(name)
  const Icon = ICON_COMPONENTS[key] || GenericAmenityIcon
  return <Icon size={size} color={color}/>
}

/* ─────────────────────────────────────────────
   <AmenityBadge> — pill with icon + label text
   Props: name, size, color, background, border, fontSize
───────────────────────────────────────────── */
export function AmenityBadge({
  name       = "",
  size       = 16,
  color      = "#C9A84C",
  background = "rgba(201,168,76,.08)",
  border     = "rgba(201,168,76,.2)",
  fontSize   = 12,
}) {
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          6,
      padding:      "5px 10px",
      borderRadius: 20,
      background,
      border:       `1px solid ${border}`,
      color,
      fontSize,
      fontWeight:   500,
      whiteSpace:   "nowrap",
    }}>
      <AmenityIcon name={name} size={size} color={color}/>
      {name}
    </span>
  )
}

export default AmenityIcon