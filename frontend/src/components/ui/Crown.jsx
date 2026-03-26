// src/components/ui/Crown.jsx
import React from "react"

const CrownIcon = ({ size = 42 }) => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size * 0.7}
        viewBox="0 0 32 22"
        fill="none"
      >
        <defs>
          <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c9a96e" />
            <stop offset="50%" stopColor="#fff1b0" />
            <stop offset="100%" stopColor="#c9a96e" />
          </linearGradient>
        </defs>

        {/* Crown fill + border */}
        <path
          d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z"
          stroke="#C9A84C"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="rgba(201,169,110,0.08)"
        />

        {/* Shimmer overlay */}
        <path
          d="M2 20L6 9L12 15L16 2L20 15L26 9L30 20H2Z"
          stroke="url(#goldShimmer)"
          strokeWidth="0.6"
          opacity="0.7"
        />

        {/* Crown jewels */}
        <circle cx="16" cy="2" r="1.8" fill="#d4af70" />
        <circle cx="6"  cy="9" r="1.4" fill="#d4af70" />
        <circle cx="26" cy="9" r="1.4" fill="#d4af70" />
      </svg>
    </div>
  )
}

export default CrownIcon