import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

const ADMIN_TG_IDS = ['495248129']

export async function partnerRoutes(app: FastifyInstance) {
  // POST /api/partner/apply — become a field owner
  app.post('/apply', { preHandler: [app.authenticate] }, async (request: any, reply: any) => {
    const { userId } = request.user as { userId: string }
    const { name, phone, city, fieldCount, message } = request.body as {
      name?: string
      phone?: string
      city?: string
      fieldCount?: number
      message?: string
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'User not found' })

    if (user.role === 'FIELD_OWNER' || user.role === 'SUPER_ADMIN') {
      return reply.send({ data: user, alreadyPartner: true })
    }

    // Promote to FIELD_OWNER immediately
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: 'FIELD_OWNER' },
    })

    // Notify all super admins
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    if (BOT_TOKEN) {
      for (const adminId of ADMIN_TG_IDS) {
        try {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: adminId,
              text: `🤝 <b>Новая заявка партнёра</b>\n\n` +
                `👤 ${user.firstName} ${user.lastName ?? ''} (@${user.username ?? 'без ника'})\n` +
                `📱 Телефон: ${phone ?? user.phone ?? '—'}\n` +
                `🏙️ Город: ${city ?? '—'}\n` +
                `🏟️ Полей: ${fieldCount ?? '—'}\n` +
                `💬 ${message ?? '—'}\n\n` +
                `✅ Роль автоматически изменена на FIELD_OWNER`,
              parse_mode: 'HTML',
            }),
          })
        } catch { /* non-critical */ }
      }
    }

    const token = app.jwt.sign({ userId: updated.id, role: updated.role }, { expiresIn: '30d' })
    return reply.send({ data: updated, token })
  })
}
