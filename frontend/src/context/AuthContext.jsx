// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react"
import { getMe } from "../services/authService"

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await getMe()
        const userData = res.data.user || res.data.data || res.data
        setUser(userData)
      } catch (err) {
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (token, userData) => {
    localStorage.setItem("token", token)
    setUser(userData)
  }
  const logout = () => { localStorage.removeItem("token"); setUser(null) }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
