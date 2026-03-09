// api/schedule-followup.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email1, email2, person1, person2, rounds, halfwayQuestion } = req.body

  // Generate a follow-up question
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `
Two people had a deep conversation. Here is what they shared:

Person 1 is from ${person1.city || ''}, ${person1.country}.
Person 2 is from ${person2.city || ''}, ${person2.country}.

Their conversation halfway question was: "${halfwayQuestion}"

${rounds.map(r => `On "${r.topic}": ${person1.city || person1.country} said "${r.answer1}" and ${person2.city || person2.country} said "${r.answer2}"`).join('\n')}

Generate ONE short follow-up question — something that would arrive a few weeks later and make both people think "how did it know to ask that?"

The question should:
- Reference something specific from their cultures or answers, unexpectedly
- Feel like a natural continuation — as if the conversation never really ended
- Be philosophical but personal — not abstract
- Be 1-2 sentences maximum

Return only the question. No preamble.
`

  let followUpQuestion = 'What if the conversation you had that day was actually the beginning of something — not just with each other, but in yourself?'

  try {
    const result = await model.generateContent([{ text: prompt }])
    followUpQuestion = result.response.text().trim()
  } catch {
    // Use fallback
  }

  // Schedule: random 1–30 days from now
  const daysFromNow = Math.floor(Math.random() * 30) + 1
  const scheduledAt = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString()

  const resend = new Resend(process.env.RESEND_API_KEY)

  const emailBody = `
<div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #2C1810; background: #F5EFE0;">
  <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #9B7653; margin-bottom: 32px;">✦ Halfway — A follow-up</p>

  <p style="font-size: 14px; color: #2C1810; opacity: 0.5; margin-bottom: 8px;">${person1.city || person1.country} · ${person2.city || person2.country}</p>

  <p style="font-size: 13px; color: #2C1810; opacity: 0.4; margin-bottom: 40px; font-style: italic;">You asked each other: "${halfwayQuestion}"</p>

  <p style="font-size: 22px; font-style: italic; line-height: 1.5; color: #2C1810; border-left: 2px solid #C4622D; padding-left: 20px; margin-bottom: 40px;">
    "${followUpQuestion}"
  </p>

  <p style="font-size: 12px; color: #9B7653; opacity: 0.7;">This question arrived on its own schedule.</p>
</div>
`

  try {
    const emails = [email1, email2].filter(Boolean)
    await Promise.all(emails.map(email =>
      resend.emails.send({
        from: 'Halfway <hello@halfwayapp.co>',
        to: email,
        subject: `A question that waited ${daysFromNow} days`,
        html: emailBody,
        scheduledAt,
      })
    ))
    res.status(200).json({ scheduled: true, daysFromNow })
  } catch (err) {
    res.status(500).json({ error: 'scheduling_failed' })
  }
}
