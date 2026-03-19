// src/components/Footer.jsx
import React from "react"
import { Link } from "react-router-dom"

const C = { gold:"#C9A84C", cream:"#F5ECD7", dim:"#6B6054", muted:"#8A7E6A" }

const SVG = ({ children, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const Icons = {
  Phone:    ()=><SVG><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.5a16 16 0 0 0 6 6l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.4 16z"/></SVG>,
  Mail:     ()=><SVG><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></SVG>,
  MapPin:   ()=><SVG><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></SVG>,
  Clock:    ()=><SVG><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SVG>,
  Crown:    ()=><SVG size={22}><path d="M2 20h20"/><path d="M5 20 3 8l4 3 5-7 5 7 4-3-2 12"/><circle cx="12" cy="4" r="1" fill="currentColor"/></SVG>,
  ChevronR: ()=><SVG size={14}><polyline points="9 18 15 12 9 6"/></SVG>,
  Facebook: ()=><SVG size={16}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></SVG>,
  Instagram:()=><SVG size={16}><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></SVG>,
  Twitter:  ()=><SVG size={16}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></SVG>,
}

const NAV_COLS = [
  {
    title: "Explore",
    links: [
      { to: "/",            label: "Home" },
      { to: "/rooms",       label: "Our Rooms" },
      { to: "/facilities",  label: "Facilities" },
    ],
  },
  {
    title: "Guest Services",
    links: [
      { to: "/bookings",   label: "My Bookings" },
      { to: "/profile",    label: "My Profile" },
      { to: "/login",      label: "Sign In" },
      { to: "/register",   label: "Create Account" },
    ],
  },
]

const CONTACT = [
  { Icon: Icons.MapPin, text: "Palace Road, Udaipur, Rajasthan 313001" },
  { Icon: Icons.Phone,  text: "+91 94141 00000" },
  { Icon: Icons.Mail,   text: "reservations@royalpalace.com" },
  { Icon: Icons.Clock,  text: "Reception open 24 × 7" },
]

const SOCIALS = [
  { Icon: Icons.Facebook,  href: "#", label: "Facebook" },
  { Icon: Icons.Instagram, href: "#", label: "Instagram" },
  { Icon: Icons.Twitter,   href: "#", label: "Twitter" },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background:"#0A0804", borderTop:"1px solid rgba(201,168,76,.12)", marginTop:"auto" }}>

      {/* Top strip — CTA */}
      <div style={{
        background:"linear-gradient(135deg,rgba(201,168,76,.12) 0%,rgba(201,168,76,.04) 100%)",
        borderBottom:"1px solid rgba(201,168,76,.1)",
        padding:"36px 40px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:20
      }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:C.cream, margin:0 }}>
            Experience Unmatched Luxury
          </h2>
          <p style={{ color:C.muted, marginTop:6, fontSize:14 }}>
            Book your stay at Royal Palace Resort and create memories that last a lifetime.
          </p>
        </div>
        <Link to="/rooms" style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"13px 28px", borderRadius:8, textDecoration:"none",
          background:"linear-gradient(135deg,#C9A84C,#a8873d)",
          color:"#0A0804", fontWeight:700, fontSize:14, letterSpacing:"0.04em",
          boxShadow:"0 4px 20px rgba(201,168,76,.3)"
        }}>
          Book a Room <Icons.ChevronR />
        </Link>
      </div>

      {/* Main grid */}
      <div style={{ padding:"52px 40px 40px", display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1.4fr", gap:40 }}>

        {/* Brand col */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{
              width:40, height:40, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
              background:"linear-gradient(135deg,rgba(201,168,76,.25),rgba(201,168,76,.08))",
              border:"1px solid rgba(201,168,76,.3)", color:C.gold
            }}>
              <Icons.Crown />
            </div>
            <div>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:C.gold, margin:0, lineHeight:1.2 }}>
                Royal Palace Resort
              </p>
              <p style={{ fontSize:10, color:C.dim, letterSpacing:"0.14em", textTransform:"uppercase", margin:0 }}>
                Est. 1987 · Luxury Hospitality
              </p>
            </div>
          </div>
          <p style={{ color:C.muted, fontSize:13.5, lineHeight:1.85, maxWidth:280 }}>
            Nestled in the heart of Rajasthan, Royal Palace Resort blends timeless
            heritage with modern luxury — offering guests an unrivalled sanctuary of
            comfort, culture, and elegance.
          </p>

          {/* Socials */}
          <div style={{ display:"flex", gap:10, marginTop:24 }}>
            {SOCIALS.map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} style={{
                width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                background:"rgba(201,168,76,.08)", border:"1px solid rgba(201,168,76,.15)",
                color:C.dim, textDecoration:"none", transition:"all .2s"
              }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(201,168,76,.18)"; e.currentTarget.style.color=C.gold }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(201,168,76,.08)"; e.currentTarget.style.color=C.dim }}>
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Nav cols */}
        {NAV_COLS.map(col => (
          <div key={col.title}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
              color:C.gold, marginBottom:18, marginTop:2 }}>
              {col.title}
            </p>
            <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:11 }}>
              {col.links.map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} style={{ color:C.muted, textDecoration:"none", fontSize:13.5,
                    display:"inline-flex", alignItems:"center", gap:5, transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = C.cream}
                    onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                    <span style={{ opacity:.4 }}><Icons.ChevronR /></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact col */}
        <div>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase",
            color:C.gold, marginBottom:18, marginTop:2 }}>
            Contact Us
          </p>
          <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:14 }}>
            {CONTACT.map(({ Icon, text }) => (
              <li key={text} style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
                <span style={{ color:C.gold, flexShrink:0, marginTop:1 }}><Icon /></span>
                <span style={{ color:C.muted, fontSize:13, lineHeight:1.6 }}>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider + bottom bar */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", margin:"0 40px" }} />
      <div style={{
        padding:"18px 40px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexWrap:"wrap", gap:12
      }}>
        <p style={{ color:C.dim, fontSize:12, margin:0 }}>
          © {year} Royal Palace Resort. All rights reserved.
        </p>
        <div style={{ display:"flex", gap:24 }}>
          {["Privacy Policy","Terms of Service","Cookie Policy"].map(t => (
            <a key={t} href="#" style={{ color:C.dim, fontSize:12, textDecoration:"none", transition:"color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = C.muted}
              onMouseLeave={e => e.currentTarget.style.color = C.dim}>
              {t}
            </a>
          ))}
        </div>
      </div>

    </footer>
  )
}