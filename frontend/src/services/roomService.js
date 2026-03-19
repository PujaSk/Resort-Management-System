// src/services/roomService.js
import api from "./axiosInstance"

// /api/room-types
export const getRoomTypes   = ()      => api.get("/room-types")
export const createRoomType = (data)  => api.post("/room-types", data)
export const updateRoomType = (id, d) => api.put(`/room-types/${id}`, d)
export const deleteRoomType = (id)    => api.delete(`/room-types/${id}`)
export const getRoomTypeById = (id) => api.get(`/room-types/${id}`)

// /api/rooms
export const getRooms         = ()      => api.get("/rooms")
export const getAvailableRooms= ()      => api.get("/rooms/available")
export const generateRooms    = (data)  => api.post("/rooms/generate", data)
export const createRoom       = (data)  => api.post("/rooms", data)
export const updateRoom       = (id, d) => api.put(`/rooms/${id}`, d)
export const updateRoomStatus = (id, s) => api.put(`/rooms/status/${id}`, { status: s })
export const deleteRoom       = (id)    => api.delete(`/rooms/${id}`)
export const getNextRoomNumber = (floor) => api.get(`/rooms/next-room/${floor}`);

