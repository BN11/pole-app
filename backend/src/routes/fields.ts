import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

// Adds nested `amenities` object that frontend Field type expects
function toFieldDto(field: any) {
  if (!field) return field
  const { hasLockerRoom, hasParking, hasLighting, hasCafeteria, hasShower, hasBallRent } = field
  return {
    ...field,
    amenities: { hasLockerRoom, hasParking, hasLighting, hasCafeteria, hasShower, hasBallRent },
  }
}

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
      data: fields.map(toFieldDto),
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
    return reply.send({ data: toFieldDto(field) })
  })

  // GET /api/fields/:id/slots
  app.get('/:id/slots', async (request, reply) => {
    const { id } = request.params as { id: string }
    const { date } = request.query as { date: string }

    if (!date) return reply.status(400).send({ error: 'date required' })

    const field = await prisma.field.findUnique({ where: { id } })
    if (!field) return reply.status(404).send({ error: 'Field not found' })

    const bookings = await prisma.booking.findMany({
      where: { fieldId: id, date, status: { in: ['PENDING', 'CONFIRMED'] } },
      select: { startTime: true, endTime: true },
    })

    const slots = []
    for (let h = 8; h < 22; h++) {
      const time = `${String(h).padStart(2, '0')}:00`
      const endTime = `${String(h + 1).padStart(2, '0')}:00`
      const booked = bookings.some((b) => b.startTime <= time && b.endTime > time)
      slots.push({ time, endTime, available: !booked, price: field.pricePerHour })
    }

    return reply.send({ data: slots })
  })

  // POST /api/fields — owner creates a new field
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const {
      name, description, address, sportTypes,
      pricePerHour, photos = [],
      hasLockerRoom = false, hasParking = false, hasLighting = false,
      hasCafeteria = false, hasShower = false, hasBallRent = false,
    } = request.body as any

    const field = await prisma.field.create({
      data: {
        name,
        description,
        address,
        sportTypes,
        pricePerHour: Number(pricePerHour),
        photos,
        hasLockerRoom,
        hasParking,
        hasLighting,
        hasCafeteria,
        hasShower,
        hasBallRent,
        ownerId: userId,
        status: 'PENDING',
        rating: 0,
        reviewCount: 0,
      },
    })
    return reply.status(201).send({ data: toFieldDto(field) })
  })

  // PATCH /api/fields/:id — owner edits their field (status reset to PENDING for re-review)
  app.patch('/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { userId } = request.user as { userId: string }

    const field = await prisma.field.findUnique({ where: { id } })
    if (!field) return reply.status(404).send({ error: 'Not found' })
    if (field.ownerId !== userId) return reply.status(403).send({ error: 'Forbidden' })

    const {
      name, description, address, sportTypes, pricePerHour, photos,
      hasLockerRoom, hasParking, hasLighting, hasCafeteria, hasShower, hasBallRent,
    } = request.body as any

    const updated = await prisma.field.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(sportTypes !== undefined && { sportTypes }),
        ...(pricePerHour !== undefined && { pricePerHour: Number(pricePerHour) }),
        ...(photos !== undefined && { photos }),
        ...(hasLockerRoom !== undefined && { hasLockerRoom }),
        ...(hasParking !== undefined && { hasParking }),
        ...(hasLighting !== undefined && { hasLighting }),
        ...(hasCafeteria !== undefined && { hasCafeteria }),
        ...(hasShower !== undefined && { hasShower }),
        ...(hasBallRent !== undefined && { hasBallRent }),
      },
    })
    return reply.send({ data: toFieldDto(updated) })
  })
}
