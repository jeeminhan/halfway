import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    person1City, person1Country,
    person2City, person2Country,
    topics,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const text = result.response.text().trim();
    const questions = JSON.parse(text);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(500).json({ error: "generation_failed" });
  }
}
