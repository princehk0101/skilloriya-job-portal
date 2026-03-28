import axios from 'axios'

const normalizeList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

export const fetchMyApplications = async () => {
  const token = localStorage.getItem('access_token')
  if (!token) return []

  try {
    const response = await axios.get('/api/applications/my-applications/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return normalizeList(response.data)
  } catch {
    return []
  }
}

export const createAppliedJobsMap = (applications) => {
  return applications.reduce((acc, application) => {
    if (application?.job) {
      acc[String(application.job)] = application
    }
    return acc
  }, {})
}

export const getApplicationStatusClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-700'
    case 'rejected':
      return 'bg-rose-100 text-rose-700'
    case 'shortlisted':
      return 'bg-indigo-100 text-indigo-700'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

export const getApplicationStatusLabel = (status) => {
  switch (status) {
    case 'accepted':
      return 'Accepted'
    case 'rejected':
      return 'Rejected'
    case 'shortlisted':
      return 'Shortlisted'
    default:
      return 'Under Review'
  }
}
