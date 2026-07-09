import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import cors from '@fastify/cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { authRoutes } from './routes/auth.js'
import { courseRoutes } from './routes/courses.js'
import { sandboxRoutes } from './routes/sandbox.js'
import { subscriptionRoutes } from './routes/subscriptions.js'
import { progressRoutes } from './routes/progress.js'

const PORT = parseInt(process.env.PORT || '3001', 10)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = Fastify({ logger: true })

await app.register(cors, { origin: true, credentials: true })

const staticCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
]
const staticRoot = staticCandidates.find(p => fs.existsSync(path.join(p, 'index.html')))

if (staticRoot) {
  await app.register(fastifyStatic, { root: staticRoot, prefix: '/', wildcard: false })
  console.log('📦 静态文件:', staticRoot)
} else {
  console.warn('⚠️ 未找到前端构建文件，请先执行: cd client && npm run build')
}

app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))
await app.register(authRoutes, { prefix: '/api/auth' })
await app.register(courseRoutes, { prefix: '/api/courses' })
await app.register(sandboxRoutes, { prefix: '/api/sandbox' })
await app.register(subscriptionRoutes, { prefix: '/api/subscriptions' })
await app.register(progressRoutes, { prefix: '/api/progress' })

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api/')) {
    reply.status(404).send({ error: 'API 不存在' })
  } else if (staticRoot) {
    reply.sendFile('index.html')
  } else {
    reply.status(404).send({ error: '前端未构建' })
  }
})

try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log('🚀 CodeLearn v0.1 running at http://localhost:' + PORT)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}