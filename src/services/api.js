const API_URL = 'http://localhost:5194/api'

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && {
        Authorization: `Bearer ${token}`
      })
    }
  })

  return response
}