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
          const {
            mode,
            country,
            city,
            spiritualBackground,
            souvenirTopic,
            rollNumber,
            originalQuestion,
            studentAnswer,
          } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          const philosophy = readFileSync(join(process.cwd(), 'docs/evangelism-philosophy.md'), 'utf8')
          const arcPrompt = `
You are generating a single conversation question for an ISM (International Student Ministry)
volunteer who is meeting a student from ${city}, ${country}.

Student spiritual background: ${spiritualBackground}
Souvenir Die topic: ${souvenirTopic}
Sam Chan arc phase: ${rollNumber === 1 ? 'Resonate' : rollNumber === 2 ? 'Dissonate' : 'Complete'} (Roll ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local practices,
  landmarks, traditions, or cultural concepts where possible
- Follow the ${rollNumber === 1 ? 'Resonate' : rollNumber === 2 ? 'Dissonate' : 'Complete'} phase of Sam Chan's Resonate/Dissonate/Complete arc
- Have the coaching embedded in the phrasing — no separate explanation needed
- Feel like genuine human curiosity, not a ministry script
- Be appropriate for the student's ${spiritualBackground} background
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.
`
          const deepenPrompt = `
You are a follow-up question generator for an ISM (International Student Ministry) volunteer.

The volunteer just asked a student from ${city}, ${country} (spiritual background: ${spiritualBackground}) this question:
"${originalQuestion}"

The student answered:
"${studentAnswer}"

Generate ONE follow-up question that:
- Picks up on something emotionally specific the student said — a word, a detail, a feeling
- Moves from the surface topic (food/music/place/etc.) toward something deeper: belonging, longing, home, identity, what satisfies, what they miss
- Feels like genuine empathetic curiosity — the volunteer is truly listening
- Does NOT mention Jesus, God, or religion directly — it opens a door naturally
- Is warm, conversational, and flows naturally from their exact answer
- References something specific from their answer, not a generic follow-up

Return only the question text. No preamble, no explanation.
`

          const result = mode === 'deepen'
            ? await model.generateContent([{ text: deepenPrompt }])
            : await model.generateContent([{ text: philosophy }, { text: arcPrompt }])
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
