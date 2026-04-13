/**
 * Smart Travel Companion — Frontend API Service
 * Drop this file into: src/services/api.js
 *
 * Usage in any component:
 *   import api from '../services/api'
 *   const { data } = await api.ai.generateItinerary({ destination: 'Tokyo', days: 5, budget: 80000 })
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://smart-travel-companion-backend.vercel.app/api'

// ── Axios instance ───────────────────────────────────────────────────────────
const http = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s for AI calls
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token from localStorage on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('stc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally — redirect to sign in
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stc_token')
      localStorage.removeItem('stc_user')
      window.location.href = '/signin'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => http.post('/auth/register', data),
  login: (data) => http.post('/auth/login', data),
  getMe: () => http.get('/auth/me'),
  updateProfile: (data) => http.put('/auth/profile', data),
  changePassword: (data) => http.put('/auth/change-password', data),
}

// ── AI (Gemini) ──────────────────────────────────────────────────────────────
export const aiAPI = {
  generateItinerary: (data) => http.post('/ai/itinerary', data),
  generatePackingList: (data) => http.post('/ai/packing-list', data),
  getVisaInfo: (data) => http.post('/ai/visa-info', data),
  chat: (data) => http.post('/ai/chat', data),
  getCultureTips: (data) => http.post('/ai/culture', data),
}

// ── Trips ────────────────────────────────────────────────────────────────────
export const tripsAPI = {
  getAll: (params) => http.get('/trips', { params }),
  getOne: (id) => http.get(`/trips/${id}`),
  create: (data) => http.post('/trips', data),
  update: (id, data) => http.put(`/trips/${id}`, data),
  delete: (id) => http.delete(`/trips/${id}`),
}

// ── Expenses ─────────────────────────────────────────────────────────────────
export const expensesAPI = {
  getAll: (params) => http.get('/expenses', { params }),
  getSummary: (params) => http.get('/expenses/summary', { params }),
  create: (data) => http.post('/expenses', data),
  update: (id, data) => http.put(`/expenses/${id}`, data),
  delete: (id) => http.delete(`/expenses/${id}`),
}

// ── Documents ────────────────────────────────────────────────────────────────
export const documentsAPI = {
  getAll: () => http.get('/documents'),
  upload: (formData) => http.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => http.delete(`/documents/${id}`),
  download: (id) => http.get(`/documents/${id}/download`, { responseType: 'blob' }),
}

// ── Weather ──────────────────────────────────────────────────────────────────
export const weatherAPI = {
  get: (params) => http.get('/weather', { params }),
}

// ── Currency ─────────────────────────────────────────────────────────────────
export const currencyAPI = {
  getRates: (params) => http.get('/currency/rates', { params }),
  convert: (params) => http.get('/currency/convert', { params }),
  getPopular: (params) => http.get('/currency/popular', { params }),
}

// ── Places ───────────────────────────────────────────────────────────────────
export const placesAPI = {
  getNearby: (params) => http.get('/places/nearby', { params }),
  getDetails: (placeId) => http.get(`/places/details/${placeId}`),
  geocode: (params) => http.get('/places/geocode', { params }),
}

// ── Safety ───────────────────────────────────────────────────────────────────
export const safetyAPI = {
  getContacts: () => http.get('/safety/contacts'),
  addContact: (data) => http.post('/safety/contacts', data),
  removeContact: (id) => http.delete(`/safety/contacts/${id}`),
  triggerSOS: (data) => http.post('/safety/sos', data),
  getNumbers: (params) => http.get('/safety/numbers', { params }),
}

// ── Rewards ──────────────────────────────────────────────────────────────────
export const rewardsAPI = {
  get: () => http.get('/rewards'),
  awardBadge: (badgeId) => http.post('/rewards/award-badge', { badgeId }),
  addXP: (amount, reason) => http.post('/rewards/add-xp', { amount, reason }),
}

// ── Health ───────────────────────────────────────────────────────────────────
export const healthAPI = {
  check: () => http.get('/health'),
}

const api = { authAPI, aiAPI, tripsAPI, expensesAPI, documentsAPI, weatherAPI, currencyAPI, placesAPI, safetyAPI, rewardsAPI, healthAPI }
export default api
