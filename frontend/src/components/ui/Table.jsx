// src/components/ui/Table.jsx
import React from "react"

export default function Table({ columns, data, loading, emptyMsg="No records found.", onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border:"1px solid rgba(255,255,255,.06)" }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columns.map(c=>(
              <th key={c.key||c.label} style={{ width:c.width, borderBottom:"1px solid rgba(255,255,255,.06)" }}
                className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-resort-muted bg-resort-surface whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({length:5}).map((_,i)=>(
                <tr key={i}>
                  {columns.map(c=>(
                    <td key={c.key||c.label} className="px-5 py-4">
                      <div className="h-3.5 rounded skeleton" style={{width:`${50+Math.random()*35}%`}}/>
                    </td>
                  ))}
                </tr>
              ))
            : data.length===0
              ? <tr><td colSpan={columns.length} className="px-5 py-16 text-center text-resort-dim">
                  <div className="text-4xl mb-3">🏨</div>
                  <p className="text-sm">{emptyMsg}</p>
                </td></tr>
              : data.map((row,i)=>(
                  <tr key={row._id||i} onClick={()=>onRowClick?.(row)}
                    className={[
                      "transition-colors duration-150",
                      i%2===1 ? "bg-white/[0.01]" : "",
                      onRowClick ? "cursor-pointer hover:bg-gold/[0.04]" : "hover:bg-white/[0.02]",
                    ].join(" ")}
                    style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    {columns.map(c=>(
                      <td key={c.key||c.label} className="px-5 py-3.5 text-cream align-middle">
                        {c.render ? c.render(row[c.key], row) : (row[c.key]??"—")}
                      </td>
                    ))}
                  </tr>
                ))
          }
        </tbody>
      </table>
    </div>
  )
}
