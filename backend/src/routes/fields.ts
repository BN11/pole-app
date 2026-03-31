import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function fieldRoutes(app: FastifyInstance) {
  // GET /api/fields
  app.get('/', async (request, reply) => {
    const { sport, search, sort = 'rating', limit = '20', page = '1' } = request.query as Record<string, string>

    const where: any = { status: 'APPROVED' }
    if (sport) where.sportTypes = { has: sport }
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const fields = await prisma.field.findMany({
      where,
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      orderBy: sort === 'rating' ? { rating: 'desc' } : { createdAt: 'desc' },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    })

    const total = await prisma.field.count({ where })

    return reply.send({
      data: fields,
      total,
      page: Number(page),
      hasMore: Number(page) * Number(limit) < total,
    })
  })

  // GET /api/fields/:id
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const field = await prisma.field.findUnique({
      where: { id },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    })
    if (!field) return reply.status(404).send({ error: 'Field not found' })
    return reply.send({ data: field })
  })

  // GET /api/fields/:id/slots
  app.get('/:id/slots', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { date } = request.query as { date: string }

    if (!date) return reply.status(400).send({ error: 'date required' })

    const field = await prisma.field.findUnique({ where: { id } })
    if (!field) return reply.status(404).send({ error: 'Field not found' })

    // Get existing bookings for that day
    const bookings = await prisma.booking.findMany({
      where: { fieldId: id, date, status: { in: ['PENDING', 'CONFIRMED'] } },
      select: { startTime: true, endTime: true },
    })

    // Generate hourly slots 8:00–22:00
    const slots = []
    for (let h = 8; h < 22; h++) {
      const time = `${String(h).padStart(2, '0')}:00`
      const endTime = `${String(h + 1).padStart(2, '0')}:00`
      const booked = bookings.some((b) => b.startTime <= time && b.endTime > time)
      slots.push({ time, endTime, available: !booked, price: field.pricePerHour })
    }

    return reply.send({ data: slots })
  })

  // POST /api/fields (owner creates field)
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const body = request.body as any

    const field = await prisma.field.create({
      data: {
        ...body,
        ownerId: userId,
        status: 'PENDING',
        rating: 0,
        reviewCount: 0,
      },
    })
    return reply.status(201).send({ data: field })
  })

  // PATCH /api/fields/:id (owner updates — goes back to PENDING)
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.user as { userId: string }
    const body = request.body as any

    const field = await prisma.field.findUnique({ where: { id } })
    if (!field) return reply.status(404).send({ error: 'Not found' })
    if (field.ownerId !== userId) return reply.status(403).send({ error: 'Forbidden' })

    const updated = await prisma.field.update({
      where: { id },
      data: { ...body, status: 'PENDING' },
    })
    return reply.send({ data: updated })
  })
}
