import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'
import crypto from 'crypto'

export async function paymentRoutes(app: FastifyInstance) {
  // POST /api/payment/payme/init — initiate Payme payment
  app.post('/payme/init', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { bookingId } = request.body as { bookingId: string }
    const { userId } = request.user as { userId: string }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { field: true },
    })
    if (!booking) return reply.status(404).send({ error: 'Booking not found' })
    if (booking.userId !== userId) return reply.status(403).send({ error: 'Forbidden' })

    const PAYME_ID = process.env.PAYME_MERCHANT_ID
    if (!PAYME_ID) return reply.status(503).send({ error: 'Payme not configured' })

    // Amount in tiyins (1 sum = 100 tiyins)
    const amount = Math.round(booking.totalPrice * 100)

    // Build Payme checkout URL
    const params = {
      m: PAYME_ID,
      ac: { booking_id: bookingId },
      a: amount,
      c: `${process.env.FRONTEND_URL}/bookings`,
    }

    const encoded = Buffer.from(JSON.stringify(params)).toString('base64')
    const checkoutUrl = `https://checkout.paycom.uz/${encoded}`

    return reply.send({ url: checkoutUrl, amount })
  })

  // POST /api/payment/click/init — initiate Click payment
  app.post('/click/init', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { bookingId } = request.body as { bookingId: string }
    const { userId } = request.user as { userId: string }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) return reply.status(404).send({ error: 'Booking not found' })
    if (booking.userId !== userId) return reply.status(403).send({ error: 'Forbidden' })

    const CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID
    const CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID
    if (!CLICK_SERVICE_ID || !CLICK_MERCHANT_ID) return reply.status(503).send({ error: 'Click not configured' })

    const amount = booking.totalPrice
    const returnUrl = encodeURIComponent(`${process.env.FRONTEND_URL}/bookings`)

    const checkoutUrl =
      `https://my.click.uz/services/pay?service_id=${CLICK_SERVICE_ID}` +
      `&merchant_id=${CLICK_MERCHANT_ID}` +
      `&amount=${amount}` +
      `&transaction_param=${bookingId}` +
      `&return_url=${returnUrl}`

    return reply.send({ url: checkoutUrl, amount })
  })

  // POST /api/payment/payme/notify — Payme server notification
  app.post('/payme/notify', async (request, reply) => {
    const body = request.body as any
    const method = body?.method

    // Verify auth header
    const authHeader = request.headers.authorization || ''
    const encoded = authHeader.replace('Basic ', '')
    const decoded = Buffer.from(encoded, 'base64').toString()
    const [, password] = decoded.split(':')

    if (password !== process.env.PAYME_SECRET_KEY) {
      return reply.send({ error: { code: -32504, message: 'Insufficient privilege' } })
    }

    if (method === 'PerformTransaction') {
      const bookingId = body.params?.account?.booking_id
      if (bookingId) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
        })
      }
    }

    return reply.send({ result: { allow: true } })
  })

  // POST /api/payment/click/notify — Click server notification
  app.post('/click/notify', async (request, reply) => {
    const body = request.body as any
    const bookingId = body?.transaction_param

    if (body?.error === 0 && bookingId) {
      // Verify sign
      const signString = `${body.click_trans_id}${body.service_id}${process.env.CLICK_SECRET_KEY}${body.merchant_trans_id}${body.amount}${body.action}${body.sign_time}`
      const expectedSign = crypto.createHash('md5').update(signString).digest('hex')

      if (body.sign_string === expectedSign) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
        })
      }
    }

    return reply.send({ error: 0, error_note: 'Success' })
  })
}
