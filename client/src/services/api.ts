const API_BASE = '/api'

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers || {}) as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `请求失败 (${res.status})`)
  }
  
  return res.json()
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  getCourses: () => request('/courses'),
  getCourse: (id: string) => request(`/courses/${id}`),
  getLesson: (courseId: string, chapterId: string, lessonId: string) =>
    request(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`),
  getProgress: () => request('/progress'),
  completeLesson: (lessonId: string, code?: string) =>
    request('/progress/complete', { method: 'POST', body: JSON.stringify({ lessonId, code }) }),
  executeCode: (code: string, language?: string) =>
    request('/sandbox/execute', { method: 'POST', body: JSON.stringify({ code, language }) }),
  getPlans: () => request('/subscriptions/plans'),
  createSubscription: (planId: string, provider?: string) =>
    request('/subscriptions/create', { method: 'POST', body: JSON.stringify({ planId, provider }) }),
  getMySubscriptions: () => request('/subscriptions/my'),
}
