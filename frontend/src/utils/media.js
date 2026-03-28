const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const DEFAULT_MEDIA_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' rx='28' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='62' r='26' fill='%2394a3b8'/%3E%3Cpath d='M34 132c10-24 31-36 46-36s36 12 46 36' fill='%2394a3b8'/%3E%3C/svg%3E"

export const resolveMediaUrl = (path) => {
  if (!path) return DEFAULT_MEDIA_PLACEHOLDER
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export { DEFAULT_MEDIA_PLACEHOLDER }
