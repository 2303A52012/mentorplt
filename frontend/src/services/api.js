import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mentorplt-backend.onrender.com/api'

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mh_token')
      localStorage.removeItem('mh_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register:      (d) => API.post('/auth/register', d),
  login:         (d) => API.post('/auth/login', d),
  getMe:         ()  => API.get('/auth/me'),
  updateProfile: (d) => API.put('/auth/profile', d),
}
export const mentorAPI = {
  getAll:        (p)  => API.get('/mentors', { params: p }),
  getOne:        (id) => API.get(`/mentors/${id}`),
  getMyProfile:  ()   => API.get('/mentors/profile/me'),
  updateProfile: (d)  => API.put('/mentors/profile', d),
}
export const followAPI = {
  follow:       (id) => API.post(`/follow/${id}`),
  unfollow:     (id) => API.delete(`/follow/${id}`),
  getFollowing: ()   => API.get('/follow/following'),
  checkFollow:  (id) => API.get(`/follow/check/${id}`),
}
export const sessionAPI = {
  book:         (d)     => API.post('/sessions', d),
  getMy:        (p)     => API.get('/sessions', { params: p }),
  getOne:       (id)    => API.get(`/sessions/${id}`),
  updateStatus: (id, d) => API.put(`/sessions/${id}/status`, d),
  cancel:       (id)    => API.put(`/sessions/${id}/cancel`),
}
export const feedbackAPI = {
  submit:            (d)  => API.post('/feedback', d),
  getMentorFeedback: (id) => API.get(`/feedback/${id}`),
  delete:            (id) => API.delete(`/feedback/${id}`),
}
export const adminAPI = {
  getAnalytics: ()   => API.get('/users/analytics'),
  getUsers:     (p)  => API.get('/users', { params: p }),
  toggleUser:   (id) => API.put(`/users/${id}/toggle`),
  deleteUser:   (id) => API.delete(`/users/${id}`),
}
export default API
