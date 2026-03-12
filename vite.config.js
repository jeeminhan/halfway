import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'
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
            person1City, person1Country, person1Occupation,
            person2City, person2Country, person2Occupation,
            setting,
            topics,
          } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

          const prompt = `
You are generating conversation questions for two people who just met.

Context:
- Setting: ${setting || 'unknown'}
- Person 1 is from ${person1City || ''}${person1Country ? ', ' + person1Country : ''}, occupation: ${person1Occupation || 'unknown'}
- Person 2 is from ${person2City || ''}${person2Country ? ', ' + person2Country : ''}, occupation: ${person2Occupation || 'unknown'}

Generate TWO directional questions for each of these ${topics.length} topics: ${topics.map(t => t.name).join(', ')}

For each topic:
- question1: Asked TO Person 1 (from ${person1City || person1Country}). Invites them to share something about their world that helps Person 2 understand it better.
- question2: Asked TO Person 2 (from ${person2City || person2Country}). Invites them to share something about their world that helps Person 1 understand it better.

For each question:
- Reference something culturally specific to that person's city/country — an actual place, tradition, food, ritual, or social norm
- Frame it with warmth and specificity — "Growing up in Lagos..." or "In Seoul..." not "In your culture..."
- Let the surface be cultural but the underneath probe toward: longing, permanence, being fully known, or something that never leaves
- Reflect their occupation and setting naturally — a student at a campus asks differently than a professional in an office
- Be a single conversational question (not an interview prompt)

Return a JSON array with exactly ${topics.length} objects:
[
  { "id": "topic-id", "question1": "...", "question2": "..." },
  ...
]
Return only the JSON array. No preamble, no markdown code fences.
`
          const result = await model.generateContent([{ text: prompt }])
          const text = result.response.text().trim()
          const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
          const questions = JSON.parse(cleaned)
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

    server.middlewares.use('/api/summarize-conversation', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const {
            audioBase64,
            audioMimeType,
            transcript,
            setting,
            topic,
            person1,
            person2,
          } = JSON.parse(body)
          const apiKey = process.env.GEMINI_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

          const context = [
            `Setting: ${setting || 'unknown'}`,
            `Topic: ${topic?.name || 'unknown'}`,
            `Person 1 is from ${[person1?.city, person1?.country].filter(Boolean).join(', ')}, occupation: ${person1?.occupation || 'unknown'}`,
            `Person 2 is from ${[person2?.city, person2?.country].filter(Boolean).join(', ')}, occupation: ${person2?.occupation || 'unknown'}`,
            topic?.question1 ? `Question to Person 1: ${topic.question1}` : null,
            topic?.question2 ? `Question to Person 2: ${topic.question2}` : null,
          ].join('\n')

          const outputInstructions = `
From this conversation, generate a keepsake JSON object with exactly these fields:

- "thread": The ONE specific connecting point — the halfway point — where their two answers touched. Name it using their actual words. 1-2 sentences. Specific, not abstract. If no clear shared thread, create a poetic bridge between the closest things they mentioned.
- "person1Answer": A concise 1-2 sentence rendering of what Person 1 actually shared in response to the topic. Preserve the emotional specifics and concrete details they mentioned.
- "person2Answer": A concise 1-2 sentence rendering of what Person 2 actually shared in response to the topic. Preserve the emotional specifics and concrete details they mentioned.
- "person1Window": One beautiful insight Person 2 now has about ${[person1?.city, person1?.country].filter(Boolean).join(', ')}'s world. What did they learn? 1-2 sentences, specific.
- "person2Window": One beautiful insight Person 1 now has about ${[person2?.city, person2?.country].filter(Boolean).join(', ')}'s world. 1-2 sentences, specific.
- "reflection": A short poetic closing (3-5 sentences). Name the longing underneath what they shared — the thing that both their answers were quietly reaching toward. Then quietly point toward a Person — not a place, not a feeling, not a memory — who could meet that hunger fully and permanently. Be specific to what they actually said. Warm and honest, not preachy.
- "continuePrompt": A single warm, human next-step suggestion (1-2 sentences). Encourage them to stay connected or go deeper together. Not a question — a nudge.

Return ONLY valid JSON. No preamble, no markdown code fences:
{
  "thread": "...",
  "person1Answer": "...",
  "person2Answer": "...",
  "person1Window": "...",
  "person2Window": "...",
  "reflection": "...",
  "continuePrompt": "..."
}`

          let result

          if (audioBase64 && audioMimeType) {
            result = await model.generateContent([
              {
                inlineData: {
                  mimeType: audioMimeType,
                  data: audioBase64,
                },
              },
              {
                text: `This is an audio recording of a conversation between two people who just met.\n\n${context}\n\n${outputInstructions}`,
              },
            ])
          } else {
            result = await model.generateContent([
              {
                text: `Here is a written summary of a conversation between two people who just met.\n\n${context}\n\nConversation:\n${transcript || '(no conversation summary provided)'}\n\n${outputInstructions}`,
              },
            ])
          }

          const raw = result.response.text().trim()
          const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
          const keepsake = JSON.parse(cleaned)

          if (!keepsake.thread || !keepsake.reflection) throw new Error('Missing required fields')

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(keepsake))
        } catch (err) {
          console.error('[Summarize conversation dev error]', err.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'generation_failed', detail: err.message }))
        }
      })
    })

    server.middlewares.use('/api/schedule-followup', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
      let body = ''
      req.on('data', chunk => { body += chunk })
      req.on('end', async () => {
        try {
          const {
            email1,
            email2,
            person1,
            person2,
            topic,
            halfwayPoint,
            reflection,
            continuePrompt,
            rounds = [],
            halfwayQuestion,
          } = JSON.parse(body)

          const apiKey = process.env.GEMINI_API_KEY
          const resendApiKey = process.env.RESEND_API_KEY
          if (!apiKey) throw new Error('No GEMINI_API_KEY in .env.local')
          if (!resendApiKey) throw new Error('No RESEND_API_KEY in .env.local')

          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
          const sharedQuestion = halfwayPoint || halfwayQuestion || continuePrompt || 'Something between them still felt unfinished.'
          const promptTopic = topic?.name || rounds[0]?.topic || 'their shared conversation'
          const directionalContext = topic?.question1 && topic?.question2
            ? `The AI asked them these questions:\n- To Person 1: "${topic.question1}"\n- To Person 2: "${topic.question2}"`
            : rounds.length
              ? rounds.map(r => `On "${r.topic}": ${person1.city || person1.country} said "${r.answer1}" and ${person2.city || person2.country} said "${r.answer2}"`).join('\n')
              : 'Use the shared halfway point below as the main context.'

          const prompt = `
Two people had a meaningful conversation and should receive one follow-up question sometime next month.

Person 1 is from ${person1.city || ''}, ${person1.country}.
Person 2 is from ${person2.city || ''}, ${person2.country}.

Topic: ${promptTopic}
Their halfway point was: "${sharedQuestion}"
Closing reflection: "${reflection || ''}"

${directionalContext}

Generate ONE short follow-up question that should feel like the conversation quietly resumed on its own.

The question should:
- Reference something specific from what they shared, unexpectedly
- Feel serendipitous, warm, and a little uncanny in the best way
- Be a natural continuation, not a recap
- Be philosophical but personal, not abstract
- Be 1-2 sentences maximum

Return only the question. No preamble.
`

          let followUpQuestion = 'What part of that conversation is still quietly following you around — and what would happen if you actually answered it together?'

          try {
            const result = await model.generateContent([{ text: prompt }])
            followUpQuestion = result.response.text().trim()
          } catch {
            // Use fallback
          }

          const daysFromNow = Math.floor(Math.random() * 25) + 21
          const scheduledAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()
          const resend = new Resend(resendApiKey)

          const emailBody = `
<div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #2C1810; background: #F5EFE0;">
  <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9B7653; margin-bottom: 32px;">✦ Halfway</p>

  <p style="font-size: 14px; color: #2C1810; opacity: 0.5; margin-bottom: 8px;">${person1.city || person1.country} · ${person2.city || person2.country}</p>

  <p style="font-size: 13px; color: #2C1810; opacity: 0.4; margin-bottom: 40px; font-style: italic;">Your halfway point was: "${sharedQuestion}"</p>

  <p style="font-size: 15px; line-height: 1.7; color: #2C1810; margin-bottom: 28px;">
    ${reflection || continuePrompt || 'Something worth keeping happened in this conversation.'}
  </p>

  <p style="font-size: 12px; color: #9B7653; opacity: 0.7;">You asked Halfway to send this back to you so you would not lose it.</p>
</div>
`

          const followUpEmailBody = `
<div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #2C1810; background: #F5EFE0;">
  <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9B7653; margin-bottom: 32px;">✦ Halfway — Later</p>

  <p style="font-size: 14px; color: #2C1810; opacity: 0.5; margin-bottom: 8px;">${person1.city || person1.country} · ${person2.city || person2.country}</p>

  <p style="font-size: 13px; color: #2C1810; opacity: 0.4; margin-bottom: 40px; font-style: italic;">Your halfway point was: "${sharedQuestion}"</p>

  <p style="font-size: 22px; font-style: italic; line-height: 1.5; color: #2C1810; border-left: 2px solid #C4622D; padding-left: 20px; margin-bottom: 40px;">
    "${followUpQuestion}"
  </p>

  <p style="font-size: 12px; color: #9B7653; opacity: 0.7;">This question arrived on its own schedule.</p>
</div>
`

          const emails = [email1, email2].filter(Boolean)
          await Promise.all(emails.flatMap(email => ([
            resend.emails.send({
              from: 'Halfway <hello@halfwayapp.co>',
              to: email,
              subject: 'Your Halfway note',
              html: emailBody,
            }),
            resend.emails.send({
              from: 'Halfway <hello@halfwayapp.co>',
              to: email,
              subject: 'A question for the conversation you never really finished',
              html: followUpEmailBody,
              scheduledAt,
            }),
          ])))

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ scheduled: true, daysFromNow }))
        } catch (err) {
          console.error('[Schedule followup dev error]', err.message)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'scheduling_failed', detail: err.message }))
        }
      })
    })
  }
})

export default defineConfig({
  plugins: [react(), geminiDevPlugin()],
})
