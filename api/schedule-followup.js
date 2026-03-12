// api/schedule-followup.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

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
  } = req.body

  // Generate a follow-up question
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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

  // Schedule: sometime next month, not immediately
  const daysFromNow = Math.floor(Math.random() * 25) + 21
  const scheduledAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()

  const resend = new Resend(process.env.RESEND_API_KEY)

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

  try {
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
    res.status(200).json({ scheduled: true, daysFromNow })
  } catch (err) {
    res.status(500).json({ error: 'scheduling_failed' })
  }
}
