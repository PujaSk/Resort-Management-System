// src/services/customerService.js
import api from "./axiosInstance"
export const getCustomers   = ()      => api.get("/customer")
export const createCustomer = (data)  => api.post("/customer", data)
export const updateCustomer = (id, d) => api.put(`/customer/${id}`, d)
export const deleteCustomer = (id)    => api.delete(`/customer/${id}`)



