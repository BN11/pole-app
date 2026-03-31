import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../index'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
}

export async function requireRole(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticate(request, reply)
    const payload = request.user as { userId: string; role: string }
    if (!roles.includes(payload.role)) {
      return reply.status(403).send({ error: 'Forbidden' })
    }
  }
}
