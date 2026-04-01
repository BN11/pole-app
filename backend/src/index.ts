import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { PrismaClient } from '@prisma/client'

import { authRoutes } from './routes/auth'
import { fieldRoutes } from './routes/fields'
import { bookingRoutes } from './routes/bookings'
import { tournamentRoutes } from './routes/tournaments'
import { adminRoutes } from './routes/admin'
import { ownerRoutes } from './routes/owner'
import { telegramRoutes } from './routes/telegram'
import { uploadRoutes } from './routes/upload'
import { reviewRoutes } from './routes/reviews'
import { paymentRoutes } from './routes/payment'
import { partnerRoutes } from './routes/partner'

export const prisma = new PrismaClient()

async function main() {
  const app = Fastify({ logger: process.env.NODE_ENV !== 'production' })

  // ─── Plugins ───────────────────────────────────────────────────────────────

  await app.register(cors, {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'pole-super-secret-change-in-prod',
  })

  // ─── Decorators ─────────────────────────────────────────────────────────────

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  // ─── Routes ─────────────────────────────────────────────────────────────────

  await app.register(authRoutes,       { prefix: '/api/auth' })
  await app.register(fieldRoutes,      { prefix: '/api/fields' })
  await app.register(bookingRoutes,    { prefix: '/api/bookings' })
  await app.register(tournamentRoutes, { prefix: '/api/tournaments' })
  await app.register(adminRoutes,      { prefix: '/api/admin' })
  await app.register(ownerRoutes,      { prefix: '/api/owner' })
  await app.register(telegramRoutes,   { prefix: '/api/telegram' })
  await app.register(uploadRoutes,     { prefix: '/api/upload' })
  await app.register(reviewRoutes,     { prefix: '/api/fields' })
  await app.register(paymentRoutes,    { prefix: '/api/payment' })
  await app.register(partnerRoutes,    { prefix: '/api/partner' })

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // ─── Start ───────────────────────────────────────────────────────────────────

  const PORT = Number(process.env.PORT) || 3000
  const HOST = process.env.HOST || '0.0.0.0'

  try {
    await app.listen({ port: PORT, host: HOST })
    console.log(`🚀 ПОЛЕ API running on http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
