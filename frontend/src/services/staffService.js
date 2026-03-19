// src/services/staffService.js
import api from "./axiosInstance"
export const getStaffList = ()      => api.get("/staff")
export const createStaff  = (data)  => api.post("/staff", data)
export const updateStaff  = (id, d) => api.put(`/staff/${id}`, d)
export const deleteStaff  = (id)    => api.delete(`/staff/${id}`)
