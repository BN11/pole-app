import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'
import { notifyFieldApproved, notifyFieldRejected } from '../utils/notify'

async function requireSuperAdmin(request: any, reply: any) {
  await request.jwtVerify()
  if ((request.user as any).role !== 'SUPER_ADMIN') {
    return reply.status(403).send({ error: 'Super admin only' })
  }
}

export async function adminRoutes(app: FastifyInstance) {
  // GET /api/admin/stats
  app.get('/stats', { preHandler: [requireSuperAdmin] }, async (_request, reply) => {
    const [totalFields, activeBookings, activeTournaments, totalUsers, pendingFields, pendingTournaments] =
      await Promise.all([
        prisma.field.count({ where: { status: 'APPROVED' } }),
        prisma.booking.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
        prisma.tournament.count({ where: { status: 'APPROVED' } }),
        prisma.user.count(),
        prisma.field.count({ where: { status: 'PENDING' } }),
        prisma.tournament.count({ where: { status: 'PENDING' } }),
      ])

    return reply.send({ data: { totalFields, activeBookings, activeTournaments, totalUsers, pendingFields, pendingTournaments } })
  })

  // GET /api/admin/pending/fields
  app.get('/pending/fields', { preHandler: [requireSuperAdmin] }, async (_request, reply) => {
    const fields = await prisma.field.findMany({
      where: { status: 'PENDING' },
      include: { owner: { select: { id: true, firstName: true, lastName: true } } },
    })
    return reply.send({ data: fields })
  })

  // PATCH /api/admin/fields/:id/approve
  app.patch('/fields/:id/approve', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const field = await prisma.field.update({ where: { id }, data: { status: 'APPROVED' }, include: { owner: true } })
    notifyFieldApproved((field as any).owner.telegramId, field.name)
    return reply.send({ data: field })
  })

  // PATCH /api/admin/fields/:id/reject
  app.patch('/fields/:id/reject', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const field = await prisma.field.update({ where: { id }, data: { status: 'REJECTED' }, include: { owner: true } })
    notifyFieldRejected((field as any).owner.telegramId, field.name)
    return reply.send({ data: field })
  })

  // GET /api/admin/pending/tournaments
  app.get('/pending/tournaments', { preHandler: [requireSuperAdmin] }, async (_request, reply) => {
    const tournaments = await prisma.tournament.findMany({
      where: { status: 'PENDING' },
      include: { operator: { select: { id: true, firstName: true, lastName: true } } },
    })
    return reply.send({ data: tournaments })
  })

  // PATCH /api/admin/tournaments/:id/approve
  app.patch('/tournaments/:id/approve', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tournament = await prisma.tournament.update({ where: { id }, data: { status: 'APPROVED' } })
    return reply.send({ data: tournament })
  })

  // PATCH /api/admin/tournaments/:id/reject
  app.patch('/tournaments/:id/reject', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const tournament = await prisma.tournament.update({ where: { id }, data: { status: 'CANCELLED' } })
    return reply.send({ data: tournament })
  })

  // GET /api/admin/users
  app.get('/users', { preHandler: [requireSuperAdmin] }, async (_request, reply) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return reply.send({ data: users })
  })

  // PATCH /api/admin/users/:id/role
  app.patch('/users/:id/role', { preHandler: [requireSuperAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { role } = request.body as { role: string }
    const user = await prisma.user.update({ where: { id }, data: { role: role as any } })
    return reply.send({ data: user })
  })
}
