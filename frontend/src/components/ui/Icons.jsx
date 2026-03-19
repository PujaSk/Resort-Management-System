// src/components/ui/Icons.jsx

import React from "react";

// =================== Bed Icon ===================
export const IconBed = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill={color}
  >
    <path d="M239.802 74.44v.19h12.275v29.433h.004v31.265a85 85 0 0 0-10.095-1.084c-26.8-1.293-55.033 8.738-73.23 13.36l-7.545 1.92l.582 5.564c-.46-.176-.917-.356-1.387-.525l-.705-.256l-.74-.135c-4.097-.747-8.27-1.193-12.48-1.39c-29.477-1.372-60.834 9.463-81.174 14.523l-7.612 1.892l.836 7.8c.605 5.644 1.218 11.59 2.774 17.493c-10.642 13.072-10.078 18.35-8.417 27.184l211.14 73.916v74.053C184.03 336.45 106.252 295.828 25.582 264.49v-170h18v.125h12.374v34.77l165.848-21.414V74.44zm-2.088 77.845q1.804-.02 3.564.04c2.818.095 5.505.396 8.09.84c13.548 5.197 20.296 12.637 24.25 21.462c-23.255 9.644-44.174 13.507-62.515 15.736c-5.277-1.15-9.503-2.466-12.944-3.894a63.3 63.3 0 0 0-16.522-20.16a92 92 0 0 1-.584-3.33c17.414-4.63 38.614-10.504 56.66-10.695zm-94.35 18.528q2.07-.022 4.09.046a69 69 0 0 1 9.26.95c15.757 5.89 23.546 14.435 28.002 24.526c-26.44 10.85-50.22 15.162-70.965 17.62c-17.42-3.692-25.116-8.99-29.17-14.665c-3.072-4.302-4.524-9.753-5.53-16.518c19.495-5.077 43.62-11.753 64.314-11.96zM291.8 186.295l26.406 7.453c-59.194 10.41-125.095 28.732-165.18 45.766l-27.443-9.17c21.235-3.146 45.785-8.753 72.568-20.846l5.29-2.39c1.72.44 3.5.853 5.35 1.232l1.42.29l1.44-.17c21.562-2.54 47.905-7.294 77.15-20.782zm68.797 19.418l51.336 14.49l-147.905 38.377v17.6l-82.517-27.147l-1.77-.59c49.176-17.717 124.438-36.303 180.857-42.73zm127.79 13.68v90.57L283.69 372.127v-99.62zM23.613 282.45L60.837 299v14.674L39.98 322.13l-16.366-10.57zm463.26 49.243v34.995l-21.91 9.515l-16.367-7.4v-25.487zm-234.453 52.49l11.608 5.16l9.442 4.196l19.342-6.87v40.848l-22.704 10.043l-17.687-12.685z"/>
  </svg>
)

// =================== Money Icon ===================
export const MoneyIcon = ({ size = 14, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill={color}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.463 9.692C13.463 12.664 10.77 14 7 14S.537 12.664.537 9.713c0-3.231 1.616-4.868 4.847-6.505L4.24 1.077A.7.7 0 0 1 4.843 0H9.41a.7.7 0 0 1 .603 1.023L8.616 3.208c3.23 1.615 4.847 3.252 4.847 6.484M4.957 6.5H6.64c.14.042.316.12.457.25a.8.8 0 0 1 .226.354H4.958a.5.5 0 1 0 0 1h2.207a1.5 1.5 0 0 1-.633.417a3.1 3.1 0 0 1-.977.187H5.54a.5.5 0 0 0-.328.877h.001l.001.002l.005.003l.013.012a4 4 0 0 0 .219.173a8.2 8.2 0 0 0 2.886 1.377a.5.5 0 1 0 .242-.97a7.2 7.2 0 0 1-1.75-.704l.054-.02c.338-.127.71-.329 1-.656c.175-.195.312-.428.397-.698h.762a.5.5 0 0 0 0-1h-.694A1.9 1.9 0 0 0 8.15 6.5h.892a.5.5 0 0 0 0-1H4.958a.5.5 0 0 0 0 1Zm.583 2.708l-.329.377z"
    />
  </svg>
)

// =================== UPI Icon ===================
export const UpiIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M11 15h1.5v-2H15q.425 0 .713-.288T16 12v-2q0-.425-.288-.712T15 9h-4zm6 0h1.5V9H17zm-4.5-3.5v-1h2v1zM6 15h3q.425 0 .713-.288T10 14V9H8.5v4.5h-2V9H5v5q0 .425.288.713T6 15m-2 5q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6z"/>
  </svg>
)

// =================== Hall Icon ===================
export const HallIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 9V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6m0 0v-6.172a2 2 0 0 0-.586-1.414l-3-3a2 2 0 0 0-2.828 0l-3 3A2 2 0 0 0 3 13.828V18a2 2 0 0 0 2 2h3m5 0H8m0-4v4m9.001-12H17m.002 4H17m.001 4H17" />
  </svg>
);

// =================== Calendar Icon ===================
export const CalendarIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <g>
      <path d="M16 2a1 1 0 0 1 .993.883L17 3v1h1a3 3 0 0 1 2.995 2.824L21 7v12a3 3 0 0 1-2.824 2.995L18 22H6a3 3 0 0 1-2.995-2.824L3 19V7a3 3 0 0 1 2.824-2.995L6 4h1V3a1 1 0 0 1 1.993-.117L9 3v1h6V3a1 1 0 0 1 1-1m3 7H5v9.625c0 .705.386 1.286.883 1.366L6 20h12c.513 0 .936-.53.993-1.215l.007-.16z"/>
      <path d="M12 12a1 1 0 0 1 .993.883L13 13v3a1 1 0 0 1-1.993.117L11 16v-2a1 1 0 0 1-.117-1.993L11 12z"/>
    </g>
  </svg>
)



// =================== Credit Card Icon ===================
export const CreditCardIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 576 512"
    fill={color}
  >
    <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16zm16 144v192c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224zM64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s-10.7-24-24-24zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24h112c13.3 0 24-10.7 24-24s-10.7-24-24-24z"/>
  </svg>
)

// =================== Debit Card Icon ===================
export const DebitCardIcon = ({ size = 22, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill={color}
  >
    <g>
      <path d="M27.147 28h-1.794a.86.86 0 0 1-.853-.853v-1.794c0-.475.378-.853.853-.853h1.794c.475 0 .853.378.853.853v1.794a.85.85 0 0 1-.853.853m-3.761-4H5.614A.617.617 0 0 1 5 23.384v-2.768c0-.333.272-.616.614-.616h17.772c.332 0 .614.273.614.616v2.778a.61.61 0 0 1-.614.606M6 22a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11a.5.5 0 0 0-.5.5"/>
      <path d="M4.248 11A3.25 3.25 0 0 0 1 14.249V27.75A3.25 3.25 0 0 0 4.248 31h23.504A3.245 3.245 0 0 0 31 27.751V14.25A3.25 3.25 0 0 0 27.752 11zM3 14.249C3 13.56 3.562 13 4.248 13h23.504c.686 0 1.248.561 1.248 1.249V15H3zM3 18h26v9.751c0 .695-.559 1.249-1.248 1.249H4.248A1.25 1.25 0 0 1 3 27.751z"/>
    </g>
  </svg>
)


// =================== Lock Icon ===================
export const LockIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill={color}
  >
    <path d="M24.875 15.334v-4.876c0-4.894-3.98-8.875-8.875-8.875s-8.875 3.98-8.875 8.875v4.876H5.042v15.083h21.916V15.334zm-14.25-4.876c0-2.964 2.41-5.375 5.375-5.375s5.375 2.41 5.375 5.375v4.876h-10.75zm7.647 16.498h-4.545l1.222-3.667a2.37 2.37 0 0 1-1.325-2.12a2.375 2.375 0 1 1 4.75 0c0 .932-.542 1.73-1.324 2.12z"/>
  </svg>
)

// =================== Alarm Icon ===================
export const AlarmIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M26.607 6.392a15 15 0 0 0-6.725-3.882m-7.764 0a15 15 0 0 0-6.725 3.882M16 9v8l-4 4m15-4c0 6.075-4.925 11-11 11S5 23.075 5 17S9.925 6 16 6s11 4.925 11 11"/>
  </svg>
)

// =================== Right Tick Icon ===================
export const RightTickIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.86 5.392c.428 1.104-.171 1.86-1.33 2.606c-.935.6-2.126 1.252-3.388 2.365c-1.238 1.091-2.445 2.406-3.518 3.7a55 55 0 0 0-2.62 3.437c-.414.591-.993 1.473-.993 1.473A2.25 2.25 0 0 1 8.082 20a2.24 2.24 0 0 1-1.9-1.075c-.999-1.677-1.769-2.34-2.123-2.577C3.112 15.71 2 15.618 2 14.134C2 12.955 2.995 12 4.222 12c.867.032 1.672.373 2.386.853c.456.306.939.712 1.441 1.245a58 58 0 0 1 2.098-2.693c1.157-1.395 2.523-2.892 3.988-4.184c1.44-1.27 3.105-2.459 4.87-3.087c1.15-.41 2.429.153 2.856 1.258"/>
  </svg>
)

// =================== Guest Icon ===================
export const GuestIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill={color}
  >
    <g fill={color}>
      <g opacity="0.2">
        <path d="M9.75 7.75a3 3 0 1 1-6 0a3 3 0 0 1 6 0"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.75 8.75a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 2a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.8 11.5A1.5 1.5 0 0 0 5.3 13v1.5a1 1 0 0 1-2 0V13a3.5 3.5 0 0 1 7 0v.5a1 1 0 1 1-2 0V13a1.5 1.5 0 0 0-1.5-1.5"/>
        <path d="M12.75 7.75a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M15.75 8.75a1 1 0 1 1 0-2a1 1 0 0 1 0 2m0 2a3 3 0 1 1 0-6a3 3 0 0 1 0 6"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M15.7 11.5a1.5 1.5 0 0 1 1.5 1.5v1.5a1 1 0 1 0 2 0V13a3.5 3.5 0 0 0-7 0v.5a1 1 0 1 0 2 0V13a1.5 1.5 0 0 1 1.5-1.5"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M11.3 14.25a1.5 1.5 0 0 0-1.5 1.5v1.5a1 1 0 0 1-2 0v-1.5a3.5 3.5 0 0 1 7 0v1.5a1 1 0 1 1-2 0v-1.5a1.5 1.5 0 0 0-1.5-1.5"/>
        <path d="M14.25 10.5a3 3 0 1 1-6 0a3 3 0 0 1 6 0"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M11.25 11.5a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 2a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/>
        <path d="M4.25 11.5h5v4h-5zm9 0h5v4h-5z"/>
        <path d="M9.25 13.5h4l.5 4.75h-5z"/>
      </g>
      <path fillRule="evenodd" clipRule="evenodd" d="M5 9a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 1a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M3.854 8.896a.5.5 0 0 1 0 .708l-.338.337A3.47 3.47 0 0 0 2.5 12.394v1.856a.5.5 0 1 1-1 0v-1.856a4.47 4.47 0 0 1 1.309-3.16l.337-.338a.5.5 0 0 1 .708 0m11.792-.3a.5.5 0 0 0 0 .708l.338.337A3.47 3.47 0 0 1 17 12.094v2.156a.5.5 0 0 0 1 0v-2.156a4.47 4.47 0 0 0-1.309-3.16l-.337-.338a.5.5 0 0 0-.708 0"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M14 9a2 2 0 1 1 0-4a2 2 0 0 1 0 4m0 1a3 3 0 1 1 0-6a3 3 0 0 1 0 6m-4.5 3.25a2.5 2.5 0 0 0-2.5 2.5v1.3a.5.5 0 0 1-1 0v-1.3a3.5 3.5 0 0 1 7 0v1.3a.5.5 0 1 1-1 0v-1.3a2.5 2.5 0 0 0-2.5-2.5"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M9.5 11.75a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 1a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/>
    </g>
  </svg>
)

// =================== User Icon ===================
export const UserIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 1280 1536"
    fill={color}
  >
    <path d="M1280 1271q0 109-62.5 187t-150.5 78H213q-88 0-150.5-78T0 1271q0-85 8.5-160.5t31.5-152t58.5-131t94-89T327 704q131 128 313 128t313-128q76 0 134.5 34.5t94 89t58.5 131t31.5 152t8.5 160.5m-256-887q0 159-112.5 271.5T640 768T368.5 655.5T256 384t112.5-271.5T640 0t271.5 112.5T1024 384"/>
  </svg>
);

// =================== Email Icon ===================
export const EmailIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path strokeDasharray="66" d="M4 5h16c0.55 0 1 0.45 1 1v12c0 0.55 -0.45 1 -1 1h-16c-0.55 0 -1 -0.45 -1 -1v-12c0 -0.55 0.45 -1 1 -1Z">
      <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="66;0"/>
    </path>
    <path strokeDasharray="24" strokeDashoffset="24" d="M3 6.5l9 5.5l9 -5.5">
      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.3s" to="0"/>
    </path>
  </svg>
);

// =================== Phone Icon ===================
export const PhoneIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M18.07 22h.35c.47-.02.9-.26 1.17-.64l2.14-3.09c.23-.33.32-.74.24-1.14s-.31-.74-.64-.97l-4.64-3.09a1.47 1.47 0 0 0-.83-.25c-.41 0-.81.16-1.1.48l-1.47 1.59c-.69-.43-1.61-1.07-2.36-1.82c-.72-.72-1.37-1.64-1.82-2.36l1.59-1.47c.54-.5.64-1.32.23-1.93L7.84 2.67c-.22-.33-.57-.57-.97-.64a1.46 1.46 0 0 0-1.13.24L2.65 4.41c-.39.27-.62.7-.64 1.17c-.03.69-.16 6.9 4.68 11.74c4.35 4.35 9.81 4.69 11.38 4.69ZM6.88 10.05c-.16.15-.21.39-.11.59c.05.09 1.15 2.24 2.74 3.84c1.6 1.6 3.75 2.7 3.84 2.75c.2.1.44.06.59-.11l1.99-2.15l3.86 2.57l-1.7 2.46c-1.16 0-6.13-.24-9.99-4.1S4 7.06 4 5.91l2.46-1.7l2.57 3.86l-2.15 1.99Z"/>
  </svg>
);

// =================== City Icon ===================
export const CityIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M10 2v2.26l2 1.33V4h10v15h-5v2h7V2zM7.5 5L0 10v11h15V10zM14 6v.93L15.61 8H16V6zm4 0v2h2V6zM7.5 7.5L13 11v8h-3v-6H5v6H2v-8zM18 10v2h2v-2zm0 4v2h2v-2z"/>
  </svg>
);

// =================== Location Icon ===================
export const LocationIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="32"
  >
    <path d="M256 48c-79.5 0-144 61.39-144 137c0 87 96 224.87 131.25 272.49a15.77 15.77 0 0 0 25.5 0C304 409.89 400 272.07 400 185c0-75.61-64.5-137-144-137"/>
    <circle cx="256" cy="192" r="48"/>
  </svg>
);

// =================== Address Icon ===================
export const AddressIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 512 512"
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="32"
  >
    <path d="M256 48c-79.5 0-144 61.39-144 137c0 87 96 224.87 131.25 272.49a15.77 15.77 0 0 0 25.5 0C304 409.89 400 272.07 400 185c0-75.61-64.5-137-144-137" />
    <circle cx="256" cy="192" r="48" fill="none" />
  </svg>
);

// =================== Booking Icon ===================
export const BookingIcon = ({ size = 24, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill={color}
      fillOpacity="0"
      d="M6 4h4v2h4v-2h4v16h-12v-16Z"
    >
      <animate fill="freeze" attributeName="fill-opacity" begin="0.9s" dur="0.15s" to="0.3"/>
    </path>
    <g stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1">
      <path
        strokeDasharray="66"
        strokeWidth="2"
        d="M12 3h7v18h-14v-18h7Z"
      >
        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="66;0"/>
      </path>
      <path
        strokeDasharray="14"
        strokeDashoffset="14"
        d="M14.5 3.5v3h-5v-3"
      >
        <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" to="0"/>
      </path>
    </g>
  </svg>
)

// =================== Rupee Icon ===================
export const RupeeIcon = ({ size = 24, color = "#9B7FE8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
  >
    <path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 12a2 2 0 0 1 2-2h12a2 2 0 1 1 0 4h-3.07a8 8 0 0 1 .818 2H30a2 2 0 1 1 0 4h-2.252a8.01 8.01 0 0 1-6.121 5.834l6.037 9.057a2 2 0 1 1-3.328 2.218l-8-12A2 2 0 0 1 18 22h2c1.48 0 2.773-.804 3.465-2H18a2 2 0 1 1 0-4h5.465A4 4 0 0 0 20 14h-2a2 2 0 0 1-2-2"
    />
  </svg>
)

// =================== Cash Icon ===================
export const CashIcon = ({ size = 28, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M2 5h20v15H2zm18 13V7H4v11zM17 8a2 2 0 0 0 2 2v5a2 2 0 0 0-2 2H7a2 2 0 0 0-2-2v-5a2 2 0 0 0 2-2zm0 5v-1c0-1.1-.67-2-1.5-2s-1.5.9-1.5 2v1c0 1.1.67 2 1.5 2s1.5-.9 1.5-2m-1.5-2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5M13 13v-1c0-1.1-.67-2-1.5-2s-1.5.9-1.5 2v1c0 1.1.67 2 1.5 2s1.5-.9 1.5-2m-1.5-2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5M8 15h1v-5H8l-1 .5v1l1-.5z" />
  </svg>
)

// =================== Child Icon ===================
export const ChildIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 80 80"
    fill="none"
  >
    <g fill={color}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m28.88 23.517l-2.698-2.699a4.5 4.5 0 0 0-6.364 6.364l7.69 7.69a3.4 3.4 0 0 1 .992 2.395V63a4.5 4.5 0 1 0 9 0V51a.5.5 0 0 1 1 0v12a4.5 4.5 0 1 0 9 0V37.267c0-.898.357-1.76.992-2.394l7.69-7.691a4.5 4.5 0 0 0-6.364-6.364l-2.698 2.699l-.037.13l-.389 1.327a9.059 9.059 0 0 1-17.389 0l-.387-1.327z"
      />
      <path d="M33.312 15.184a7.463 7.463 0 0 1 11.85 7.902l-.387 1.327a7.058 7.058 0 0 1-13.55 0l-.388-1.327a7.46 7.46 0 0 1 2.475-7.902" />
    </g>
  </svg>
)

// =================== Walkin Icon ===================
export const WalkInIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill={color}
      d="M14 2a2 2 0 1 0 0 4a2 2 0 1 0 0-4m-3.47 4.83L7.94 7.94c-.44.19-.79.52-1 .94L5.1 12.55l1.79.89l1.84-3.67l2.07-.89l-1.71 8.54l-3.69 2.77l1.2 1.6l3.69-2.77c.39-.3.67-.72.76-1.21l.44-2.2l2.6 1.95l.93 4.63l1.96-.39l-.92-4.62c-.1-.48-.37-.91-.76-1.21l-2.14-1.6l.83-3.87l.95 1.67c.25.43.64.75 1.1.9l2.64.88l.63-1.9l-2.64-.88l-1.55-2.72c-.28-.49-.72-.87-1.24-1.08l-1.44-.57a2.48 2.48 0 0 0-1.91.02Z"
    />
  </svg>
)

// =================== Bell Icon ===================
export const BellIcon = ({ size = 20, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
  >
    <path
      fill={color}
      d="M53.645 51.493c-.262-.14-.537-.388-.812-.696H58v-4.051c0-11.479-7.257-20.085-19-22.634v-5.315h-5.143v-4.593h3.375v-4.068H26.768v4.068h3.375v4.593H25v5.315C13.257 26.661 6 35.268 6 46.746v4.051h5.168c-.275.309-.55.557-.813.696C8.475 52.497 5 53.5 5 57.199V62h54v-4.801c0-3.697-3.475-4.701-5.355-5.706M8 46.746c0-10.72 6.969-18.703 18.187-20.835l.813-.154v-4.96h10v4.96l.813.154C49.031 28.043 56 36.026 56 46.746v2.051H8zm45.602 13.22H10.4c-.994 0-1.799-.91-1.799-2.033c0-1.124.805-2.034 1.799-2.034h43.201c.994 0 1.799.91 1.799 2.034s-.804 2.033-1.798 2.033"
    />
    <path
      fill={color}
      d="m51.131 2l-8.949 14.792L56.729 6.438zM12.865 2L7.273 6.438l14.545 10.354zM62 22.848l-2.455-6.056L48 22.848zM4.455 16.792L2 22.848h14z"
    />
  </svg>
)

// =================== Door Icon ===================
export const DoorIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M20.5 19.53h-1.917V5.665c0-1.51-1.251-2.695-2.75-2.695h-1.161a1.75 1.75 0 0 0-1.85-1.211l-.2.032l-6.611 1.44a.75.75 0 0 0-.591.733V5.61l-.003.058V19.53H3.5a.75.75 0 0 0 0 1.5H7l.077-.004q.03-.003.062-.01l5.483 1.193l.2.032a1.75 1.75 0 0 0 1.85-1.21H20.5l.077-.005a.75.75 0 0 0 0-1.492zM17.083 5.665V19.53H14.75V4.47h1.083c.71 0 1.25.553 1.25 1.195m-6.833 5.36a.75.75 0 0 1 1.5 0v1.95a.75.75 0 0 1-1.5 0z"/>
  </svg>
)

// =================== Pencil Icon ===================
export const PencilIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21l2-6l11-11a2.828 2.828 0 0 1 4 4L9 19l-6 2z"/>
    <path d="M15 5l4 4"/>
    <path d="M6 15l3 3"/>
  </svg>
)

// =================== Plus Icon ===================
export const PlusIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
)

// =================== AC Icon ===================
export const AcIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeLinecap="round"
  >
    <path
      strokeWidth="1.5"
      d="M16 3c2.339 0 3.508 0 4.362.536a3.5 3.5 0 0 1 1.102 1.102C22 5.492 22 6.66 22 9s0 3.508-.537 4.362a3.5 3.5 0 0 1-1.1 1.101C19.507 15 18.338 15 16 15H8c-2.339 0-3.508 0-4.362-.537a3.5 3.5 0 0 1-1.102-1.1C2 12.507 2 11.338 2 9s0-3.508.536-4.362a3.5 3.5 0 0 1 1.102-1.102C4.492 3 5.66 3 8 3zm-9 9h10"
    />
    <path strokeWidth="2" strokeLinejoin="round" d="M18 7h.009" />
    <path
      strokeWidth="1.5"
      strokeLinejoin="round"
      d="M6.8 18s.8 1.875-.8 3m11.2-3s-.8 1.875.8 3m-6-3v3"
    />
  </svg>
)

// =================== Wifi Icon ===================
export const WifiIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={(size * 1408) / 1984}
    viewBox="0 0 1984 1408"
    fill={color}
  >
    <path d="M992 1395q-20 0-93-73.5t-73-93.5q0-32 62.5-54t103.5-22t103.5 22t62.5 54q0 20-73 93.5t-93 73.5m270-271q-2 0-40-25t-101.5-50t-128.5-25t-128.5 25t-101 50t-40.5 25q-18 0-93.5-75T553 956q0-13 10-23q78-77 196-121t233-44t233 44t196 121q10 10 10 23q0 18-75.5 93t-93.5 75m273-272q-11 0-23-8q-136-105-252-154.5T992 640q-85 0-170.5 22t-149 53T559 777t-79 53t-31 22q-17 0-92-75t-75-93q0-12 10-22q132-132 320-205t380-73t380 73t320 205q10 10 10 22q0 18-75 93t-92 75m271-271q-11 0-22-9q-179-157-371.5-236.5T992 256t-420.5 79.5T200 572q-11 9-22 9q-17 0-92.5-75T10 413q0-13 10-23q187-186 445-288T992 0t527 102t445 288q10 10 10 23q0 18-75.5 93t-92.5 75"/>
  </svg>
)

// =================== Coffee Icon ===================
export const CoffeeIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  >
    <path d="M4 20h6.943m0 0h.114m-.114 0h.114m-.114 0A7 7 0 0 1 4 13V8.923c0-.51.413-.923.923-.923h12.154c.51 0 .923.413.923.923V9" />
    <path d="M11.057 20H18m-6.943 0A7 7 0 0 0 18 13" />
    <path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18v-1m0-4v4" />
    <path d="M15 3l-1 2m-2-2l-1 2M9 3L8 5" />
  </svg>
)

// =================== Jacuzzi Icon ===================
export const JacuzziIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill={color}
  >
    <g>
      <path
        d="M240 104v40a48 48 0 0 1-48 48H64a48 48 0 0 1-48-48v-40h120v40h64v-40Z"
        opacity="0.2"
      />
      <path d="M240 96h-32a8 8 0 0 0-8-8h-64a8 8 0 0 0-8 8H64V52a12 12 0 0 1 12-12a12.44 12.44 0 0 1 12.16 9.59a8 8 0 0 0 15.68-3.18A28.32 28.32 0 0 0 76 24a28 28 0 0 0-28 28v44H16a8 8 0 0 0-8 8v40a56.06 56.06 0 0 0 56 56v16a8 8 0 0 0 16 0v-16h96v16a8 8 0 0 0 16 0v-16a56.06 56.06 0 0 0 56-56v-40a8 8 0 0 0-8-8m-48 8v32h-48v-32Zm40 40a40 40 0 0 1-40 40H64a40 40 0 0 1-40-40v-32h104v32a8 8 0 0 0 8 8h64a8 8 0 0 0 8-8v-32h24Z"/>
    </g>
  </svg>
)

// =================== Gym Icon ===================
export const GymIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="m20.274 9.869l-3.442-4.915l1.639-1.147l3.441 4.915zm-1.884 2.54L16.67 9.95l-8.192 5.736l1.72 2.457l-1.638 1.148l-4.588-6.554L5.61 11.59l1.72 2.458l8.192-5.736l-1.72-2.458l1.638-1.147l4.588 6.554zm2.375-5.326l1.638-1.147l-1.147-1.638l-1.638 1.147zM7.168 19.046l-3.442-4.915l-1.638 1.147l3.441 4.915zm-2.786-.491l-1.638 1.147l-1.147-1.638l1.638-1.147z"/>
  </svg>
)

// =================== Game Icon ===================
export const GameIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill={color}
  >
    <path d="M7.51 26a5.5 5.5 0 0 1-1.44-.19A5.6 5.6 0 0 1 2.19 19l2.33-8.84a5.54 5.54 0 0 1 2.59-3.43a5.43 5.43 0 0 1 4.15-.54A5.52 5.52 0 0 1 14.7 9h2.6a5.5 5.5 0 0 1 3.44-2.81a5.43 5.43 0 0 1 4.15.54a5.57 5.57 0 0 1 2.59 3.41L29.81 19a5.6 5.6 0 0 1-3.89 6.83a5.43 5.43 0 0 1-4.15-.54a5.54 5.54 0 0 1-2.59-3.41L19 21h-6l-.23.86a5.54 5.54 0 0 1-2.59 3.41a5.46 5.46 0 0 1-2.67.73M9.83 8a3.5 3.5 0 0 0-1.72.46a3.6 3.6 0 0 0-1.66 2.19l-2.33 8.84a3.6 3.6 0 0 0 2.48 4.39a3.43 3.43 0 0 0 2.62-.34a3.54 3.54 0 0 0 1.66-2.19L11.5 19h9l.61 2.35a3.58 3.58 0 0 0 1.66 2.19a3.46 3.46 0 0 0 2.63.34a3.58 3.58 0 0 0 2.47-4.39l-2.33-8.84a3.55 3.55 0 0 0-1.65-2.19a3.46 3.46 0 0 0-2.63-.34a3.55 3.55 0 0 0-2.37 2.22l-.24.66h-5.3l-.24-.66a3.56 3.56 0 0 0-2.38-2.22a3.5 3.5 0 0 0-.9-.12"/>
    <path d="M10 16a2 2 0 1 1 2-2a2 2 0 0 1-2 2m0-2"/>
    <circle cx="22" cy="12" r="1"/>
    <circle cx="22" cy="16" r="1"/>
    <circle cx="20" cy="14" r="1"/>
    <circle cx="24" cy="14" r="1"/>
  </svg>
)

// =================== TV Icon ===================
export const TvIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path
      fillRule="evenodd"
      d="M3.2 5.2v12.6h17.6V5.2zM2 5a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm6 15.9c0-.331.266-.6.601-.6H15.4c.332 0 .601.278.601.6v.6H8zm3.665-12.004H9.81V15H8.716V8.896H6.558v-.942h5.958l1.919 5.816h.029l1.924-5.816h1.167L15.04 15h-1.196z"
    />
  </svg>
)

// =================== Breakfast Icon ===================
export const BreakfastIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M2 19h20v2H2zM13 5.05V3h-2v2.05c-5.05.5-9 4.77-9 9.95v1c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-1c0-5.18-3.95-9.45-9-9.95M4 15c0-4.41 3.59-8 8-8s8 3.59 8 8z"/>
  </svg>
)

// =================== Fridge / Freezer Icon ===================
export const FridgeIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M9 6h.01M5 10h14M9 14h.01" />
  </svg>
)

// =================== Swimming Pool Icon ===================
export const PoolIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      fill={color}
      d="M18.421 18.94a1 1 0 0 1-.884 1.104a10.7 10.7 0 0 1-2.062.031a1 1 0 1 1 .166-1.993a8.7 8.7 0 0 0 1.676-.026a1 1 0 0 1 1.104.883m-6.87-2.272q.31.132.623.292l.312.166q.375.207.746.364a1 1 0 0 1-.783 1.841a10 10 0 0 1-.623-.291l-.311-.166q-.376-.208-.747-.365a1 1 0 0 1 .783-1.841m10.323.846a1 1 0 0 1-.302 1.305l-.118.07a3 3 0 0 1-.146.077l-.1.049c-.165.079-.402.185-.698.3a1 1 0 0 1-.723-1.866l.26-.105a6 6 0 0 0 .466-.217c.487-.244 1.087-.106 1.361.387m-17.09-.257a1 1 0 0 1-.571 1.293l-.266.108l-.112.049l-.18.083c-.544.26-1.187.312-1.529-.305c-.345-.622.04-1.16.566-1.45l.1-.05c.166-.08.402-.185.698-.3a1 1 0 0 1 1.294.572m3.741-1.333a1 1 0 0 1-.166 1.993a8.7 8.7 0 0 0-1.676.026a1 1 0 0 1-.22-1.987c.637-.07 1.331-.093 2.062-.032m2.94-8.504l2.176 1.811c.286.24.537.533.8.796a3 3 0 0 1 .273 3.924c1.2.244 2.336.181 3.292.004a10 10 0 0 0 1.676-.464l.176-.068c.67-.266 1.53-.783 2.016.092a1 1 0 0 1-.302 1.305c-.303.191-.645.33-.976.462l-.393.148c-.495.175-1.118.36-1.834.492c-1.765.327-4.143.347-6.553-.886l-.301-.161c-1.988-1.104-3.985-1.113-5.52-.828c-.672.124-1.245.303-1.676.464l-.176.068q-.268.107-.432.185l-.075.035c-.536.258-1.174.291-1.51-.313c-.358-.645.074-1.215.643-1.489l.21-.098q.182-.082.425-.18l.393-.147c.495-.175 1.118-.36 1.834-.492c.648-.12 1.38-.198 2.164-.188l3.059-2.38l-.668-.556a1 1 0 0 0-.928-.19l-3.97 1.192a1 1 0 0 1-.575-1.916l3.97-1.191a3 3 0 0 1 2.783.569M17 5a3 3 0 1 1 0 6a3 3 0 0 1 0-6"
    />
  </svg>
)

// =================== Generate Icon ===================
export const GenerateIcon = ({ size = 18, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 128 128"
    fill={color}
  >
    <path d="M115.36 61.84L70.22 50.49L114.45 2.4a1.222 1.222 0 0 0-1.54-1.87L12.3 61.98c-.41.25-.64.72-.57 1.2c.06.48.4.87.87 1.01l45.07 13.25l-44.29 48.16c-.42.46-.44 1.15-.04 1.61c.24.29.58.44.94.44c.22 0 .45-.06.65-.19l100.78-63.41c.42-.26.64-.75.56-1.22c-.08-.49-.43-.88-.91-.99"/>
  </svg>
)

// =================== Bulb Icon ===================
export const BulbIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 25 24"
    fill={color}
  >
    <path d="M9.063 18.045c-.046-1.131-.794-2.194-1.803-3.18a7.5 7.5 0 1 1 10.48 0c-1.041 1.017-1.805 2.117-1.805 3.29v1.595a2.25 2.25 0 0 1-2.25 2.25h-2.373a2.25 2.25 0 0 1-2.25-2.25zM6.5 9.5a5.98 5.98 0 0 0 1.808 4.293c.741.724 1.512 1.633 1.933 2.707h1.509v-4.659a2.24 2.24 0 0 1-.841-.53l-.846-.846a.75.75 0 1 1 1.061-1.06l.846.845a.75.75 0 0 0 1.06 0l.846-.846a.75.75 0 1 1 1.06 1.06l-.845.846a2.24 2.24 0 0 1-.841.531V16.5h1.509c.421-1.074 1.192-1.984 1.933-2.707A6 6 0 1 0 6.5 9.5m4.063 8.713v1.537c0 .414.335.75.75.75h2.372a.75.75 0 0 0 .75-.75V18h-3.873v.017a4 4 0 0 1 0 .196"/>
  </svg>
)

// =================== Collect Icon ===================
export const CollectIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M23.8 3a1.5 1.5 0 0 0-1.5-1.5h-14A1.5 1.5 0 0 0 6.8 3v8a1.5 1.5 0 0 0 1.5 1.5h14a1.5 1.5 0 0 0 1.5-1.5Zm-2 7.25a.25.25 0 0 1-.25.25H9.05a.25.25 0 0 1-.25-.25V3.78a.25.25 0 0 1 .25-.25h12.5a.25.25 0 0 1 .25.25Z"/>
    <path d="M13.3 7.03a2 2 0 1 0 4 0a2 2 0 1 0-4 0m6.9 9.5l-3.53 1.17a.23.23 0 0 0-.15.14A2 2 0 0 1 14.7 19h-4a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5h4a1 1 0 0 0 0-2h-3.5a7.15 7.15 0 0 0-4-1.5H5.14a4 4 0 0 0-1.79.5l-3 1.51a.25.25 0 0 0-.13.22v5.4a.26.26 0 0 0 .13.22a.25.25 0 0 0 .25 0l3.22-2a1 1 0 0 1 .85-.1c10 3.36 6.63 3.37 17.87-2.31a.52.52 0 0 0 .06-.94a2.48 2.48 0 0 0-2.4-.47"/>
  </svg>
)

// =================== Switch Icon ===================
export const SwitchIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 256 256"
    fill={color}
  >
    <path d="M228 48v48a12 12 0 0 1-12 12h-48a12 12 0 0 1 0-24h19l-7.8-7.8a75.55 75.55 0 0 0-53.32-22.26h-.43a75.5 75.5 0 0 0-53.06 21.63a12 12 0 1 1-16.78-17.16a99.38 99.38 0 0 1 69.87-28.47h.52a99.42 99.42 0 0 1 70.2 29.29L204 67V48a12 12 0 0 1 24 0m-44.39 132.43a75.5 75.5 0 0 1-53.09 21.63h-.43a75.55 75.55 0 0 1-53.32-22.26L69 172h19a12 12 0 0 0 0-24H40a12 12 0 0 0-12 12v48a12 12 0 0 0 24 0v-19l7.8 7.8a99.42 99.42 0 0 0 70.2 29.26h.56a99.38 99.38 0 0 0 69.87-28.47a12 12 0 0 0-16.78-17.16Z"/>
  </svg>
)

// =================== Past Icon ===================
export const PastIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 26 26"
    fill={color}
  >
    <path d="M13 0L8 3l5 3V4c4.955 0 9 4.045 9 9s-4.045 9-9 9s-9-4.045-9-9c0-2.453.883-4.57 2.5-6.188L5.094 5.407C3.11 7.39 2 10.053 2 13c0 6.045 4.955 11 11 11s11-4.955 11-11S19.045 2 13 2zm-2.094 6.563l-1.812.875l2.531 5A1.5 1.5 0 0 0 11.5 13v.063L8.281 16.28l1.439 1.44l3.219-3.219H13a1.5 1.5 0 0 0 1.5-1.5c0-.69-.459-1.263-1.094-1.438z"/>
  </svg>
)

// =================== Cancel Icon ===================
export const CancelIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
)

// =================== Clock Icon ===================
export const ClockIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path
      fill={color}
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
    />

    <rect x="11" y="6" width="2" height="7" rx="1" fill={color}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 12;360 12 12"
        dur="9s"
        repeatCount="indefinite"
      />
    </rect>

    <rect x="11" y="11" width="2" height="9" rx="1" fill={color}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 12 12;360 12 12"
        dur="0.75s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
)

// =================== At Booking Icon ===================
export const AtBookingIcon = ({ size = 16, color = "#C9A84C" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
  >
    <path d="M7 3h9a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3v6.7l-3-2.1l-3 2.1zm5 0H8v4.78l2-1.4l2 1.4z"/>
  </svg>
)



















export const IconCheck = ({ size = 13, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export const IconWarning = ({ size = 14, color = "#f59e0b" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

export const IconArrowLeft = ({ size = 16, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
)

export const IconSparkle = ({ size = 14, color = "#C9A84C" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
)