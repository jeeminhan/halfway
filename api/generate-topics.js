// api/generate-topics.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    person1City, person1Country, person1Occupation,
    person2City, person2Country, person2Occupation,
    setting,
    topics,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const questions = JSON.parse(cleaned);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: "generation_failed" });
  }
}
