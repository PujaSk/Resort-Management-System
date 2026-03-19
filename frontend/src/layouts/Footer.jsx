// src/layouts/Footer.jsx
import React from "react"
import { Link } from "react-router-dom"

const FOOTER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
`

function CrownIcon({ size = 40 }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 32 22" fill="none">
      <path d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z" fill="none" stroke="#c9a96e" strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="16" cy="2"  r="1.8" fill="#c9a96e"/>
      <circle cx="6"  cy="9"  r="1.4" fill="#c9a96e"/>
      <circle cx="26" cy="9"  r="1.4" fill="#c9a96e"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <>
      <style>{FOOTER_CSS}</style>
      <footer style={{ padding:"60px 40px 40px", borderTop:"1px solid rgba(201,169,110,.1)", background:"#080604" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"48px", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"48px" }}>

            {/* Brand + Social */}
            <div style={{ maxWidth:"280px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
                <CrownIcon size={26}/>
                <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#c9a96e", fontWeight:700 }}>Royal Palace Resort</span>
              </div>
              <p style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.81)", lineHeight:1.8, marginBottom:"20px" }}>
                Where timeless elegance meets the grandeur of nature. An experience beyond compare.
              </p>
              <div style={{ display:"flex", gap:"12px" }}>
                {[
                  { label:"Facebook",  href:"https://facebook.com",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                  { label:"Instagram", href:"https://instagram.com", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { label:"Twitter/X", href:"https://twitter.com",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label:"YouTube",   href:"https://youtube.com",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#080604"/></svg> },
                ].map(({ label, href, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid rgba(201,169,110,.25)", background:"rgba(201,169,110,.06)", color:"rgba(201,169,110,.7)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", transition:"all .25s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="rgba(201,169,110,.18)"; e.currentTarget.style.borderColor="rgba(201,169,110,.6)"; e.currentTarget.style.color="#c9a96e" }}
                    onMouseLeave={e => { e.currentTarget.style.background="rgba(201,169,110,.06)"; e.currentTarget.style.borderColor="rgba(201,169,110,.25)"; e.currentTarget.style.color="rgba(201,169,110,.7)" }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav Links */}
            <div style={{ display:"flex", gap:"60px", flexWrap:"wrap" }}>
              {[
                ["Explore", [
                  ["Rooms & Suites", "/rooms"],
                  ["Banquet Halls",  "/banquet"],
                  ["Facilities",     "/facilities"],
                ]],
                ["Stay", [
                  ["Book Now",    "/rooms"],
                  ["My Bookings", "/bookings"],
                ]],
              ].map(([title, links]) => (
                <div key={title}>
                  <div style={{ fontSize:"11px", letterSpacing:"0.35em", color:"#c9a96e", textTransform:"uppercase", marginBottom:"18px", fontFamily:"'Cormorant Garamond',serif" }}>
                    {title}
                  </div>
                  {links.map(([label, href]) => (
                    <div key={href} style={{ marginBottom:"10px" }}>
                      <Link to={href} style={{ fontFamily:"sans-serif", fontSize:"14px", color:"rgba(220,200,165,.4)", textDecoration:"none", transition:"color .2s" }}
                        onMouseEnter={e => e.currentTarget.style.color="rgba(201,169,110,.85)"}
                        onMouseLeave={e => e.currentTarget.style.color="rgba(220,200,165,.4)"}
                      >
                        {label}
                      </Link>
                    </div>
                  ))}
                </div>
              ))}

              {/* Contact */}
              <div>
                <div style={{ fontSize:"11px", letterSpacing:"0.35em", color:"#c9a96e", textTransform:"uppercase", marginBottom:"18px", fontFamily:"'Cormorant Garamond',serif" }}>
                  Contact Us
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <a href="mailto:royalpalace.care1@gmail.com"
                    style={{ display:"flex", alignItems:"flex-start", gap:"10px", textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.querySelector("span").style.color="rgba(201,169,110,.85)"}
                    onMouseLeave={e => e.currentTarget.querySelector("span").style.color="rgba(220,200,165,.4)"}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"2px" }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <span style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.4)", transition:"color .2s", lineHeight:1.5 }}>
                      royalpalace.care1@gmail.com
                    </span>
                  </a>

                  <div style={{ display:"flex", alignItems:"flex-start", gap:"10px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:"2px" }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ fontFamily:"sans-serif", fontSize:"13.5px", color:"rgba(220,200,165,.4)", lineHeight:1.6, maxWidth:"200px" }}>
                      Royal Palace Resort,<br/>
                      Civil Lines, Jaipur,<br/>
                      Rajasthan – 302006, India
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ paddingTop:"24px", borderTop:"1px solid rgba(255, 255, 255, 0.2)", display:"flex", flexWrap:"wrap", gap:"12px", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"13px", color:"#c9a96e", letterSpacing:"0.08em", fontFamily:"'Cormorant Garamond',serif" }}>
              © {new Date().getFullYear()} Royal Palace Resort. All rights reserved.
            </span>
            <div style={{ display:"flex", gap:"20px" }}>
              {[["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]].map(([label, href]) => (
                <Link key={href} to={href}
                  style={{ fontSize:"12px", color:"rgba(255, 255, 255, 0.55)", textDecoration:"none", fontFamily:"'Cormorant Garamond',serif", letterSpacing:"0.05em", transition:"color .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color="rgba(201,169,110,.6)"}
                  onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.2)"}
                >{label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}