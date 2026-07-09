import { FastifyInstance } from 'fastify'
import { store } from '../db/store.js'

export async function courseRoutes(app: FastifyInstance) {
  // Get all courses
  app.get('/', async () => {
    return Array.from(store.courses.values()).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      language: c.language,
      level: c.level,
      isFree: c.isFree,
      order: c.order,
      chapterCount: c.chapters.length,
      lessonCount: c.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0),
      createdAt: c.createdAt,
    }))
  })

  // Get course detail with chapters and lessons
  app.get('/:courseId', async (request, reply) => {
    const { courseId } = request.params as any
    const course = store.courses.get(courseId)
    
    if (!course) {
      return reply.status(404).send({ error: '课程不存在' })
    }

    return course
  })

  // Get a single lesson
  app.get('/:courseId/chapters/:chapterId/lessons/:lessonId', async (request, reply) => {
    const { courseId, chapterId, lessonId } = request.params as any
    const course = store.courses.get(courseId)
    
    if (!course) return reply.status(404).send({ error: '课程不存在' })

    const chapter = course.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return reply.status(404).send({ error: '章节不存在' })

    const lesson = chapter.lessons.find(l => l.id === lessonId)
    if (!lesson) return reply.status(404).send({ error: '课时不存在' })

    return lesson
  })
}
