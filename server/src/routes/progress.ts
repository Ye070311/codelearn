import { FastifyInstance } from 'fastify'
import { store } from '../db/store.js'

export async function progressRoutes(app: FastifyInstance) {
  // Get user progress
  app.get('/', async (request, reply) => {
    const auth = request.headers.authorization
    if (!auth) return reply.status(401).send({ error: '请先登录' })

    try {
      const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString())
      const progress = store.progress.get(payload.userId) || []
      
      const completedLessons = progress.filter(p => p.completed).map(p => ({
        lessonId: p.lessonId,
        completedAt: p.completedAt,
      }))

      return {
        userId: payload.userId,
        completedLessons,
        totalCompleted: completedLessons.length,
      }
    } catch {
      return reply.status(401).send({ error: '认证失败' })
    }
  })

  // Mark lesson as completed
  app.post('/complete', async (request, reply) => {
    const { lessonId, code } = request.body as any
    const auth = request.headers.authorization

    if (!auth) return reply.status(401).send({ error: '请先登录' })

    try {
      const payload = JSON.parse(Buffer.from(auth.replace('Bearer ', ''), 'base64').toString())
      
      const userProgress = store.progress.get(payload.userId) || []
      const existing = userProgress.find(p => p.lessonId === lessonId)
      
      if (existing) {
        existing.completed = true
        existing.completedAt = new Date().toISOString()
        if (code) existing.code = code
      } else {
        userProgress.push({
          userId: payload.userId,
          lessonId,
          completed: true,
          code,
          completedAt: new Date().toISOString(),
        })
      }
      
      store.progress.set(payload.userId, userProgress)
      
      return { success: true, message: '🎉 课时已完成！' }
    } catch {
      return reply.status(401).send({ error: '认证失败' })
    }
  })
}
