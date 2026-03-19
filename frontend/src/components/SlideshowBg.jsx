// src/components/SlideshowBg.jsx


import React, { useState, useEffect } from "react"
import resortBg from "../assets/resort.jpg"
import resortRoom from "../assets/resort_room.jpg"
import resortRestaurant from "../assets/resort_restaurant.jpg"

export default function SlideshowBg() {
  const images = [resortBg, resortRoom, resortRestaurant]
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current)
      setCurrent(c => (c + 1) % images.length)
      setTimeout(() => setPrev(null), 1800)
    }, 6000)

    return () => clearInterval(interval)
  }, [current])

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      {prev !== null && (
        <div
          key={`prev-${prev}`}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${images[prev]})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            animation: "slideOut 1.8s ease-in-out forwards",
          }}
        />
      )}

      <div
        key={`curr-${current}`}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${images[current]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: `slideIn 1.8s ease-in-out forwards, kenBurns${current} 7.8s ease-in-out forwards`,
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "linear-gradient(to bottom, rgba(5,2,1,0.45) 0%, rgba(8,4,2,0.55) 40%, rgba(5,2,1,0.75) 100%)",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <style>{`
        @keyframes slideIn  { from { opacity:0; filter:blur(12px); } to { opacity:1; filter:blur(0px); } }
        @keyframes slideOut { from { opacity:1; filter:blur(0px); } to { opacity:0; filter:blur(14px); } }

        @keyframes kenBurns0 { from { transform:scale(1.08); } to { transform:scale(1.18); } }
        @keyframes kenBurns1 { from { transform:scale(1.1); } to { transform:scale(1.18); } }
        @keyframes kenBurns2 { from { transform:scale(1.05); } to { transform:scale(1.15); } }
      `}</style>
    </div>
  )
}