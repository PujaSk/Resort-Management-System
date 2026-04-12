// src/routes/AppRoutes.jsx
import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute"
import AdminLayout    from "../layouts/AdminLayout"
import CustomerLayout from "../layouts/CustomerLayout"
import ScrollToTop    from "../components/ScrollToTop"

// Auth
import Login          from "../pages/auth/Login"
import Register       from "../pages/auth/Register"
import ForgotPassword from "../pages/auth/ForgotPassword"

// Admin pages
import Dashboard          from "../pages/admin/pages/Dashboard"
import ManageRooms        from "../pages/admin/pages/ManageRooms"
import RoomSettings       from "../pages/admin/pages/RoomSettings"
import RoomFacilities     from "../pages/admin/pages/RoomFacilities"
import HouseKeeping       from "../pages/admin/pages/HouseKeeping"
import RoomBooking        from "../pages/admin/pages/RoomBooking"
import RoomBookings       from "../pages/admin/pages/RoomBookings"
import BookingActionDetail from "../pages/admin/pages/BookingActionDetail"
import ManageCustomer     from "../pages/admin/pages/ManageCustomer"
import ManageStaff        from "../pages/admin/pages/ManageStaff"
import ItemManage         from "../pages/admin/pages/ItemManage"
import ManageServices     from "../pages/admin/pages/ManageServices"
import Transaction        from "../pages/admin/pages/Transaction"
import Reports            from "../pages/admin/pages/Reports"
import AdminProfile       from "../pages/admin/pages/AdminProfile"
import Feedback           from "../pages/admin/pages/Feedback"          // ← NEW

// Staff pages
import StaffLayout        from "../layouts/StaffLayout"
import StaffDashboard     from "../pages/staff/StaffDashboard"

// Customer pages
import Home          from "../pages/customer/Home"
import RoomList      from "../pages/customer/RoomList"
import MyBookings    from "../pages/customer/MyBookings"
import Profile       from "../pages/customer/Profile"
import RoomDetail    from "../pages/customer/RoomDetail"
import BanquetDetail from "../pages/customer/BanquetDetail"
import FacilityList  from "../pages/customer/FacilityList"
import FacilityDetail from "../pages/customer/FacilityDetail"

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index                        element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"             element={<Dashboard />} />
          <Route path="manage-rooms"          element={<ManageRooms />} />
          <Route path="room-bookings/:roomId" element={<RoomBookings />} />
          <Route path="room-settings"         element={<RoomSettings />} />
          <Route path="room-facilities"       element={<RoomFacilities />} />
          <Route path="housekeeping"          element={<HouseKeeping />} />
          <Route path="room-booking"          element={<RoomBooking />} />
          <Route path="bookings/:id"          element={<BookingActionDetail />} />
          <Route path="manage-customer"       element={<ManageCustomer />} />
          <Route path="manage-staff"          element={<ManageStaff />} />
          <Route path="item-manage"           element={<ItemManage />} />
          <Route path="manage-services"       element={<ManageServices />} />
          <Route path="transaction"           element={<Transaction />} />
          <Route path="reports"               element={<Reports />} />
          <Route path="profile"               element={<AdminProfile />} />
          <Route path="feedback"              element={<Feedback />} />   {/* ← NEW */}
        </Route>

        {/* Staff */}
        <Route path="/staff" element={<ProtectedRoute role="staff"><StaffLayout /></ProtectedRoute>}>
          <Route index                        element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard"             element={<StaffDashboard />} />
          <Route path="housekeeping"          element={<HouseKeeping />} />
          <Route path="room-booking"          element={<RoomBooking />} />
          <Route path="bookings/:id"          element={<BookingActionDetail />} />
          <Route path="manage-customer"       element={<ManageCustomer />} />
          <Route path="manage-staff"          element={<ManageStaff />} />
          <Route path="profile"               element={<AdminProfile />} />
        </Route>

        {/* Customer */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index               element={<Home />} />
          <Route path="rooms"        element={<RoomList />} />
          <Route path="rooms/:id"    element={<RoomDetail />} />
          <Route path="banquet/:id"  element={<BanquetDetail />} />
          <Route path="bookings"     element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="profile"      element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="facilities"   element={<FacilityList />} />
          <Route path="facilities/:id" element={<FacilityDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}