// src/services/bookingService.js
import api from "./axiosInstance"

export const createBooking              = (data)         => api.post("/bookings", data)
export const getAllBookings              = ()             => api.get("/bookings")
export const getMyBookings              = ()             => api.get("/bookings/mine")
export const getBookedDates             = (roomTypeId)   => api.get(`/bookings/booked-dates/${roomTypeId}`)
export const cancelBooking              = (id)           => api.put(`/bookings/cancel/${id}`)
export const checkIn                    = (id, data)     => api.put(`/bookings/checkin/${id}`, data)
export const checkOut                   = (id, data)     => api.put(`/bookings/checkout/${id}`, data)
export const submitFeedback             = (id, data)     => api.post(`/bookings/${id}/feedback`, data)
export const getPublicTestimonials      = ()             => api.get("/bookings/testimonials/public")

/* ── Room switch ── */
export const getAvailableRoomsForSwitch = (id)           => api.get(`/bookings/${id}/available-rooms-for-switch`)
export const switchRoom                 = (id, data)     => api.put(`/bookings/${id}/switch-room`, data)

/* ── Admin: mark no-shows ── */
export const markNoShows                = ()             => api.post("/bookings/admin/mark-no-shows")