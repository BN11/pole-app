import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = process.env.PORT || 3000
const DIST = join(__dirname, 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

createServer((req, res) => {
  const url = req.url.split('?')[0]
  let filePath = join(DIST, url === '/' ? 'index.html' : url)
  if (!existsSync(filePath)) filePath = join(DIST, 'index.html')
  try {
    const data = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html; charset=utf-8' })
    res.end(data)
  } catch {
    res.writeHead(500)
    res.end('Error')
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Serving dist/ on port ${PORT}`)
})
