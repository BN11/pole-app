import type { FastifyInstance } from 'fastify'
import { prisma } from '../index'

export async function tournamentRoutes(app: FastifyInstance) {
  // GET /api/tournaments
  app.get('/', async (request, reply) => {
    const { sport, status = 'APPROVED' } = request.query as Record<string, string>
    const where: any = { status }
    if (sport) where.sportType = sport

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: { operator: { select: { id: true, firstName: true, lastName: true } } },
    })
    return reply.send({ data: tournaments })
  })

  // GET /api/tournaments/:id
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { operator: { select: { id: true, firstName: true, lastName: true } } },
    })
    if (!tournament) return reply.status(404).send({ error: 'Not found' })
    return reply.send({ data: tournament })
  })

  // POST /api/tournaments (operator applies)
  app.post('/', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { userId } = request.user as { userId: string }
    const body = request.body as any

    const tournament = await prisma.tournament.create({
      data: { ...body, operatorId: userId, status: 'PENDING', registeredTeams: 0 },
    })
    return reply.status(201).send({ data: tournament })
  })

  // POST /api/tournaments/:id/register — register a team
  app.post('/:id/register', { preHandler: [app.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { teamName, captainName } = request.body as { teamName: string; captainName: string }

    const tournament = await prisma.tournament.findUnique({ where: { id } })
    if (!tournament) return reply.status(404).send({ error: 'Not found' })
    if (tournament.status !== 'APPROVED') return reply.status(400).send({ error: 'Registration closed' })
    if (tournament.registeredTeams >= tournament.maxTeams) return reply.status(400).send({ error: 'No slots' })
    if (new Date(tournament.registrationDeadline) < new Date()) return reply.status(400).send({ error: 'Deadline passed' })

    const updated = await prisma.tournament.update({
      where: { id },
      data: { registeredTeams: { increment: 1 } },
    })

    return reply.send({ data: updated, teamName, captainName })
  })
}
