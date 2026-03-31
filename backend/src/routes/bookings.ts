import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function bookingRoutes(app: FastifyInstance) {
  // GET /api/bookings (my bookings)
  app.get('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { type = 'upcoming' } = request.query as { type: string }

    const now = new Date().toISOString().split('T')[0]
    const where: any = { userId }
    if (type === 'upcoming') {
      where.date = { gte: now }
      where.status = { in: ['PENDING', 'CONFIRMED'] }
    } else {
      where.OR = [{ date: { lt: now } }, { status: { in: ['CANCELLED', 'COMPLETED'] } }]
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: { field: true },
      orderBy: { date: type === 'upcoming' ? 'asc' : 'desc' },
    })

    return reply.send({ data: bookings })
  })

  // POST /api/bookings
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { fieldId, date, startTime, endTime, durationHours, paymentMethod } = request.body as any

    // Check availability
    const conflict = await prisma.booking.findFirst({
      where: {
        fieldId,
        date,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { startTime: { gte: startTime, lt: endTime } },
          { endTime: { gt: startTime, lte: endTime } },
        ],
      },
    })
    if (conflict) return reply.status(409).send({ error: 'Slot already booked' })

    const field = await prisma.field.findUnique({ where: { id: fieldId } })
    if (!field) return reply.status(404).send({ error: 'Field not found' })

    const totalPrice = field.pricePerHour * durationHours

    const booking = await prisma.booking.create({
      data: {
        fieldId,
        userId,
        date,
        startTime,
        endTime,
        durationHours,
        totalPrice,
        currency: field.currency,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
      },
      include: { field: true },
    })

    return reply.status(201).send({ data: booking })
  })

  // PATCH /api/bookings/:id/cancel
  app.patch('/:id/cancel', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.user as { userId: string }

    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) return reply.status(404).send({ error: 'Not found' })
    if (booking.userId !== userId) return reply.status(403).send({ error: 'Forbidden' })
    if (booking.status === 'CANCELLED') return reply.status(400).send({ error: 'Already cancelled' })

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    return reply.send({ data: updated })
  })
}
