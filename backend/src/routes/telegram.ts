import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function telegramRoutes(app: FastifyInstance) {
  // POST /api/telegram/webhook
  app.post('/webhook', async (request, reply) => {
    const update = request.body as any

    // Handle /start command — send welcome message via bot
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id
      const firstName = update.message.from?.first_name || 'друг'

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `👋 Привет, ${firstName}!\n\nДобро пожаловать в ПОЛЕ — платформу для бронирования спортивных полей.\n\n⚽ Футбол  🏀 Баскетбол  🎾 Теннис  🏐 Волейбол\n\nНажмите кнопку ниже, чтобы открыть приложение:`,
            reply_markup: {
              inline_keyboard: [[
                {
                  text: '🏟️ Открыть ПОЛЕ',
                  web_app: { url: process.env.FRONTEND_URL || 'https://pole-frontend-production.up.railway.app' },
                },
              ]],
            },
          }),
        },
      )
    }

    // Handle booking notifications — future use
    return reply.send({ ok: true })
  })
}
