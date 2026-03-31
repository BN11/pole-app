import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'
import crypto from 'crypto'

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/telegram — validate Telegram initData and issue JWT
  app.post('/telegram', async (request, reply) => {
    const { initData } = request.body as { initData: string }

    if (!initData) return reply.status(400).send({ error: 'initData required' })

    // Validate Telegram hash
    const botToken = process.env.TELEGRAM_BOT_TOKEN!
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (computedHash !== hash && process.env.NODE_ENV === 'production') {
      return reply.status(401).send({ error: 'Invalid Telegram data' })
    }

    const userDataStr = params.get('user')
    if (!userDataStr) return reply.status(400).send({ error: 'No user data' })

    const tgUser = JSON.parse(userDataStr)

    // Upsert user
    const user = await prisma.user.upsert({
      where: { telegramId: String(tgUser.id) },
      update: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        avatar: tgUser.photo_url ?? null,
      },
      create: {
        telegramId: String(tgUser.id),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        avatar: tgUser.photo_url ?? null,
        role: 'USER',
      },
    })

    const token = app.jwt.sign({ userId: user.id, role: user.role }, { expiresIn: '30d' })

    return reply.send({ token, user })
  })

  // GET /api/auth/me
  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send({ data: user })
  })
}
