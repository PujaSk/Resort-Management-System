// src/services/authService.js
import api from "./axiosInstance"
export const loginUser      = (data) => api.post("/auth/login", data)
export const registerUser   = (data) => api.post("/auth/register", data)
export const getMe          = ()     => api.get("/auth/me")
export const updateProfile  = (data) => api.put("/auth/profile", data)
export const changePassword = (data) => api.put("/auth/change-password", data)
export const forgotPassword = (data) => api.post("/auth/forgot-password", data)
export const verifyResetOtp = (data) => api.post("/auth/verify-reset-otp", data)
export const resetPassword  = (data) => api.post("/auth/reset-password", data)