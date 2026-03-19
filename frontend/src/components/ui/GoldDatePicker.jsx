// src/components/ui/GoldDatePicker.jsx


import React, { forwardRef } from "react"
import DatePicker from "react-datepicker"
import { Calendar } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <div onClick={onClick} ref={ref} className="relative cursor-pointer">
    <input
      value={value}
      placeholder={placeholder}
      readOnly
      className="f-input pr-10"
    />
    <Calendar
      size={18}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gold-500 pointer-events-none"
    />
  </div>
))

export default function GoldDatePicker({
  label,
  value,
  onChange,
  placeholder = "Select date",
  minDate = null
}) {
  const today = new Date()

  return (
    <div>
      {label && (
        <label className="block text-sm mb-1 text-resort-muted">
          {label}
        </label>
      )}

      <DatePicker
        selected={value}
        onChange={onChange}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="dd/MM/yyyy"

        /* 🔥 Restrict Future Completely */
        maxDate={today}
        minDate={minDate}

        /* 🔥 Year + Month Dropdown */
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"

        /* 🔥 Better Year Control */
        scrollableYearDropdown
        yearDropdownItemNumber={120}

        /* 🔥 Add this */
        dayClassName={(date) =>
            date > today ? "future-day" : undefined
        }

        popperPlacement="bottom-start"
      />
    </div>
  )
}