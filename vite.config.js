import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local into process.env for server-side plugin usage
try {
  const envContent = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  envContent.split('\n').forEach(line => {
    const eq = line.indexOf('=')
    if (eq > 0) process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
  })
} catch {}

// Dev-only middleware that mirrors the Vercel API function
const geminiDevPlugin = () => ({
  name: 'gemini-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/generate-question', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }

      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const { country, city, spiritualBackground, souvenirTopic, rollNumber } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          const philosophy = readFileSync(join(process.cwd(), 'docs/evangelism-philosophy.md'), 'utf8')
          const arcPhase = rollNumber === 1 ? 'Resonate' : rollNumber === 2 ? 'Dissonate' : 'Complete'

          const prompt = `You are generating a single conversation question for an ISM volunteer meeting a student from ${city}, ${country}. Spiritual background: ${spiritualBackground}. Souvenir topic: ${souvenirTopic}. Arc phase: ${arcPhase} (Roll ${rollNumber} of 3). Generate ONE culturally specific question following the ${arcPhase} phase. Be specific to ${city}, ${country}. Embed the coaching in the phrasing. Feel like genuine curiosity. Return only the question text.`

          const result = await model.generateContent([{ text: philosophy }, { text: prompt }])
          const question = result.response.text().trim()

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ question }))
        } catch (err) {
          console.error('[Gemini dev error]', err.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'generation_failed', detail: err.message }))
        }
      })
    })
  }
})

export default defineConfig({
  plugins: [react(), geminiDevPlugin()],
})
