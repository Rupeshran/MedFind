import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [pharmacy, setPharmacy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mf_token')
    const savedUser = localStorage.getItem('mf_user')
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      // Verify token & refresh user data
      api.get('/auth/me').then(({ data }) => {
        setUser(data.user)
        setPharmacy(data.pharmacy)
        localStorage.setItem('mf_user', JSON.stringify(data.user))
      }).catch(() => logout()).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('mf_token', data.token)
    localStorage.setItem('mf_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('mf_token', data.token)
    localStorage.setItem('mf_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('mf_token')
    localStorage.removeItem('mf_user')
    setUser(null)
    setPharmacy(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('mf_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, pharmacy, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
