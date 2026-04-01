import type { FastifyInstance } from 'fastify'

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/upload/photos — upload to Cloudinary
  app.post('/photos', { preHandler: [app.authenticate] }, async (request, reply) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return reply.status(503).send({ error: 'Cloudinary not configured' })
    }

    const parts = request.files()
    const urls: string[] = []

    for await (const part of parts) {
      if (part.type !== 'file') continue

      // Read file buffer
      const chunks: Buffer[] = []
      for await (const chunk of part.file) {
        chunks.push(chunk as Buffer)
      }
      const buffer = Buffer.concat(chunks)

      // Upload to Cloudinary via REST API
      const formData = new FormData()
      const blob = new Blob([buffer], { type: part.mimetype })
      formData.append('file', blob, part.filename)
      formData.append('upload_preset', 'pole_app')
      formData.append('folder', 'pole-fields')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      )

      if (!res.ok) {
        // Fallback: try with api_key/signature auth
        const timestamp = Math.floor(Date.now() / 1000)
        const crypto = await import('crypto')
        const signature = crypto
          .createHash('sha1')
          .update(`folder=pole-fields&timestamp=${timestamp}${apiSecret}`)
          .digest('hex')

        const fd2 = new FormData()
        fd2.append('file', blob, part.filename)
        fd2.append('folder', 'pole-fields')
        fd2.append('timestamp', String(timestamp))
        fd2.append('api_key', apiKey)
        fd2.append('signature', signature)

        const res2 = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: fd2 },
        )
        const data2 = await res2.json() as any
        if (data2.secure_url) urls.push(data2.secure_url)
      } else {
        const data = await res.json() as any
        if (data.secure_url) urls.push(data.secure_url)
      }
    }

    return reply.send({ urls })
  })
}
