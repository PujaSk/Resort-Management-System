// src/services/facilityService.js

import axiosInstance from "./axiosInstance"

export const getFacilities    = ()     => axiosInstance.get("/facilities")
export const getFacilityById  = (id)   => axiosInstance.get(`/facilities/${id}`)
export const createFacility   = (data) => axiosInstance.post("/facilities", data)
export const updateFacility   = (id, data) => axiosInstance.put(`/facilities/${id}`, data)
export const deleteFacility   = (id)   => axiosInstance.delete(`/facilities/${id}`)