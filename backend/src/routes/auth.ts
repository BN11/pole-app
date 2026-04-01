import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'
import crypto from 'crypto'

const SUPER_ADMIN_TG_IDS = ['495248129']

function generateReferralCode(length = 8): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length).toUpperCase()
}

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/telegram — validate Telegram initData and issue JWT
  app.post('/telegram', async (request, reply) => {
    const { initData, startParam } = request.body as { initData: string; startParam?: string }

    if (!initData) return reply.status(400).send({ error: 'initData required' })

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
    const tgId = String(tgUser.id)
    const isSuperAdmin = SUPER_ADMIN_TG_IDS.includes(tgId)

    // Generate unique referral code
    let referralCode: string
    while (true) {
      const code = generateReferralCode()
      const exists = await prisma.user.findFirst({ where: { referralCode: code } })
      if (!exists) { referralCode = code; break }
    }

    const user = await prisma.user.upsert({
      where: { telegramId: tgId },
      update: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        avatar: tgUser.photo_url ?? null,
        ...(isSuperAdmin ? { role: 'SUPER_ADMIN' } : {}),
      },
      create: {
        telegramId: tgId,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
        avatar: tgUser.photo_url ?? null,
        role: isSuperAdmin ? 'SUPER_ADMIN' : 'USER',
        referralCode,
        // track who referred this new user
        referredBy: startParam ?? null,
      },
    })

    const token = app.jwt.sign({ userId: user.id, role: user.role }, { expiresIn: '30d' })
    return reply.send({ token, user })
  })

  // POST /api/auth/phone — save phone number
  app.post('/phone', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { phone } = request.body as { phone: string }
    const { userId } = request.user as { userId: string }
    if (!phone) return reply.status(400).send({ error: 'phone required' })
    const user = await prisma.user.update({
      where: { id: userId },
      data: { phone },
    })
    return reply.send({ data: user })
  })

  // GET /api/auth/me
  app.get('/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send({ data: user })
  })
}
