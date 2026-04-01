import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function reviewRoutes(app: FastifyInstance) {
  // GET /api/fields/:id/reviews
  app.get('/:fieldId/reviews', async (request, reply) => {
    const { fieldId } = request.params as { fieldId: string }
    const reviews = await prisma.review.findMany({
      where: { fieldId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return reply.send({ data: reviews })
  })

  // POST /api/fields/:id/reviews
  app.post('/:fieldId/reviews', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { fieldId } = request.params as { fieldId: string }
    const { userId } = request.user as { userId: string }
    const { rating, comment } = request.body as { rating: number; comment?: string }

    if (rating < 1 || rating > 5) return reply.status(400).send({ error: 'Rating must be 1-5' })

    // Check user has a completed booking for this field
    const booking = await prisma.booking.findFirst({
      where: { fieldId, userId, status: 'COMPLETED' },
    })
    if (!booking) return reply.status(403).send({ error: 'You must complete a booking to review' })

    // Upsert (one review per user per field)
    const review = await prisma.review.upsert({
      where: { fieldId_userId: { fieldId, userId } },
      update: { rating, comment: comment ?? null },
      create: { fieldId, userId, rating, comment: comment ?? null },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    })

    // Recalculate field rating
    const agg = await prisma.review.aggregate({
      where: { fieldId },
      _avg: { rating: true },
      _count: true,
    })
    await prisma.field.update({
      where: { id: fieldId },
      data: {
        rating: Number((agg._avg.rating ?? 0).toFixed(1)),
        reviewCount: agg._count,
      },
    })

    return reply.status(201).send({ data: review })
  })
}
