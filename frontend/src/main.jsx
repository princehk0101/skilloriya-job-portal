import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {GoogleOAuthProvider} from '@react-oauth/google'
import axios from 'axios'

// Dynamically determine the backend API base URL
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
if (apiBaseUrl.includes('skilloriya-1.onrender.com')) {
    apiBaseUrl = 'https://skilloriya.onrender.com'
}

const defaultBaseURL = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://127.0.0.1:8000'
        : 'https://skilloriya.onrender.com'

const selectedBaseUrl = (apiBaseUrl || defaultBaseURL).replace(/\/+$/, '')
axios.defaults.baseURL = selectedBaseUrl

// Request interceptor to attach bearer token automatically if present
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle 401 and refresh token transparently
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken && !originalRequest.url?.includes('/api/token/refresh/')) {
        originalRequest._retry = true
        try {
          const res = await axios.post('/api/token/refresh/', { refresh: refreshToken })
          const newAccess = res.data?.access
          if (newAccess) {
            localStorage.setItem('access_token', newAccess)
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return axios(originalRequest)
          }
        } catch (refreshError) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = window.location.pathname.startsWith('/employer') ? '/employer-login' : '/login'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)


// Provide a reliable fallback Google Client ID matching the backend credentials
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '93286826594-midq6hi0v5ocqd02s53rjrik55p0gidd.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
