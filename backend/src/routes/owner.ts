import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

function toFieldDto(field: any) {
  if (!field) return field
  const { hasLockerRoom, hasParking, hasLighting, hasCafeteria, hasShower, hasBallRent } = field
  return { ...field, amenities: { hasLockerRoom, hasParking, hasLighting, hasCafeteria, hasShower, hasBallRent } }
}

export async function ownerRoutes(app: FastifyInstance) {
  // GET /api/owner/stats
  app.get('/stats', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }

    const today = new Date().toISOString().split('T')[0]

    // Get owner's fields
    const fields = await prisma.field.findMany({
      where: { ownerId: userId },
      select: { id: true, rating: true },
    })
    const fieldIds = fields.map((f) => f.id)

    if (fieldIds.length === 0) {
      return reply.send({
        data: {
          todayRevenue: 0,
          todayBookings: 0,
          rating: 0,
          occupancyPercent: 0,
          weeklyRevenue: [],
        },
      })
    }

    // Today's bookings
    const todayBookings = await prisma.booking.findMany({
      where: {
        fieldId: { in: fieldIds },
        date: today,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    })

    const todayRevenue = todayBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    // Average rating
    const avgRating =
      fields.reduce((sum, f) => sum + f.rating, 0) / fields.length

    // Weekly revenue (last 7 days)
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - 6 + i)
      return d.toISOString().split('T')[0]
    })

    const weeklyBookings = await prisma.booking.findMany({
      where: {
        fieldId: { in: fieldIds },
        date: { in: days },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    })

    const weeklyRevenue = days.map((day) => ({
      day: new Date(day).toLocaleDateString('ru-RU', { weekday: 'short' }),
      amount: weeklyBookings
        .filter((b) => b.date === day)
        .reduce((sum, b) => sum + b.totalPrice, 0),
    }))

    // Occupancy (today's booked slots / total available slots 8:00-22:00 = 14 hours)
    const maxSlots = fieldIds.length * 14
    const occupancyPercent = maxSlots > 0
      ? Math.round((todayBookings.reduce((sum, b) => sum + b.durationHours, 0) / maxSlots) * 100)
      : 0

    return reply.send({
      data: {
        todayRevenue,
        todayBookings: todayBookings.length,
        rating: Number(avgRating.toFixed(1)),
        occupancyPercent,
        weeklyRevenue,
      },
    })
  })

  // GET /api/owner/fields
  app.get('/fields', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const fields = await prisma.field.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ data: fields.map(toFieldDto) })
  })

  // GET /api/owner/bookings
  app.get('/bookings', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }

    const fields = await prisma.field.findMany({
      where: { ownerId: userId },
      select: { id: true },
    })
    const fieldIds = fields.map((f) => f.id)

    const bookings = await prisma.booking.findMany({
      where: { fieldId: { in: fieldIds } },
      include: { field: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return reply.send({ data: bookings })
  })

  // DELETE /api/owner/fields/:id
  app.delete('/fields/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const { id } = request.params as { id: string }

    const field = await prisma.field.findUnique({ where: { id } })
    if (!field) return reply.status(404).send({ error: 'Not found' })
    if (field.ownerId !== userId) return reply.status(403).send({ error: 'Forbidden' })

    await prisma.field.delete({ where: { id } })
    return reply.send({ message: 'Deleted' })
  })
}
