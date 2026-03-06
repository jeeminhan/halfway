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
You are generating a single conversation question for a volunteer meeting an international student from ${city}, ${country}.

Conversation topic: ${souvenirTopic}
Conversation phase: ${rollNumber === 2 ? 'Dissonate' : 'Complete'} (question ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local places, traditions, or cultural concepts
- For Dissonate phase: gently surface a philosophical tension or longing within their culture —
  something about meaning, belonging, identity, or what truly satisfies. Use their own cultural
  framework to name something they may already quietly feel.
- For Complete phase: open territory around deeper meaning — what would it look like if that
  longing were fully met? What do they ultimately live for? Frame it as genuine curiosity, not a conclusion.
- Feel like warm philosophical curiosity, not an interview or ministry script
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.
`
          const deepenPrompt = `
You are a thoughtful conversation partner helping someone go deeper with a student they just met.

The student from ${city}, ${country} just answered this question:
"${originalQuestion}"

Their answer:
"${studentAnswer}"

Generate ONE follow-up question that:
- Picks up on something emotionally specific they said — a word, a detail, a feeling
- Moves from the surface topic toward something philosophical: belonging, longing, home, identity,
  what they're searching for, what truly satisfies, what they miss
- Feels like genuine curiosity — you are truly listening and interested in their inner world
- Is warm, conversational, and flows naturally from their exact words
- References something specific from their answer, not a generic follow-up
- Does not mention religion, God, or faith directly — it opens a door through philosophy and feeling

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

    server.middlewares.use('/api/halfway-question', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const {
            person1City, person1Country, person1Answers,
            person2City, person2Country, person2Answers,
          } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

          const prompt = `
You are generating the final question of a philosophical conversation between two people who just met.

Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}.
Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}.

Here is everything they said:

${person1Answers.map(a => `Person 1 on "${a.topic}": "${a.answer}"`).join('\n')}

${person2Answers.map(a => `Person 2 on "${a.topic}": "${a.answer}"`).join('\n')}

Your job: find the ONE specific thing — a word, an image, a place, a person, a feeling — that appeared in BOTH of their answers, even if they used different words for it.

Then generate ONE question that:
- Names that specific shared thing directly — use their actual words or images, not abstractions
- Asks whether that thing points toward something — or someone — they haven't found yet
- Opens the question of whether there is a love, a home, a belonging, or a presence that could fully meet that longing — without naming God, Jesus, or religion directly
- Feels like the most honest question in the room — the one both people are secretly already asking
- Is short, specific, and impossible to answer with a yes or no
- Does NOT start with "Both of you..." or "You both..." — find a more surprising entry into the question

Examples of the right register:
- "What if the hotpot and the Sunday morning are actually the same hunger?"
- "Is there a version of home that doesn't require you to leave something behind to find it?"
- "What would it mean to be known like that — not by a place or a person who could leave — but by something that couldn't?"

Return only the question. No preamble, no explanation.
`
          const result = await model.generateContent([{ text: prompt }])
          const question = result.response.text().trim()
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ question }))
        } catch (err) {
          console.error('[Halfway dev error]', err.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'generation_failed', detail: err.message }))
        }
      })
    })

    server.middlewares.use('/api/generate-topics', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const {
            person1City, person1Country,
            person2City, person2Country,
            topics,
          } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

          const prompt = `
You are generating conversation questions for two people who just met:
- Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}
- Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}

Generate one question for each of these ${topics.length} topics: ${topics.map(t => t.name).join(', ')}

For each question:
- Reference something culturally specific to BOTH cities — an actual place, tradition, food, ritual, season, or social norm that exists in those cultures
- Frame it so both people can answer from their own world — it should feel like genuine curiosity between two people from different places
- Have philosophical depth underneath — the surface is cultural, the underneath is about meaning, loss, belonging, or identity
- Be a single conversational question, not an interview prompt
- Feel warm and specific — "In Seoul, ___" or "Growing up in Toronto, ___" is better than "In your culture, ___"

Return a JSON array with exactly ${topics.length} objects, one per topic, in the same order as the topics list:
[
  { "id": "topic-id", "question": "the question text" },
  ...
]
Return only the JSON array. No preamble, no markdown code fences.
`
          const result = await model.generateContent([{ text: prompt }])
          const text = result.response.text().trim()
          const questions = JSON.parse(text)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ questions }))
        } catch (err) {
          console.error('[Generate topics dev error]', err.message)
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
