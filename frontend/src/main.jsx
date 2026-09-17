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

axios.defaults.baseURL = apiBaseUrl || defaultBaseURL

// Provide a reliable fallback Google Client ID matching the backend credentials
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || '93286826594-midq6hi0v5ocqd02s53rjrik55p0gidd.apps.googleusercontent.com'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
