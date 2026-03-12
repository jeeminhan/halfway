// api/generate-demo-conversation.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { person1, person2, setting, topic } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Generate a realistic, warm conversation between two people who just met. This is a demo conversation for an app called Halfway.

Context:
- Setting: ${setting || 'a quiet place'}
- ${person1.name} is from ${[person1.city, person1.country].filter(Boolean).join(', ')}, occupation: ${person1.occupation || 'unknown'}
- ${person2.name} is from ${[person2.city, person2.country].filter(Boolean).join(', ')}, occupation: ${person2.occupation || 'unknown'}
- Topic: ${topic.name}
- Question for ${person1.name}: ${topic.question1}
- Question for ${person2.name}: ${topic.question2}

Write a natural back-and-forth conversation (6-10 exchanges total) where each person answers their question and they find unexpected common ground. Include:
- Culturally specific details from each person's background
- Genuine emotional moments — not surface-level pleasantries
- A moment where they realize they share something deeper than expected

Format each line as:
${person1.name}: [what they say]
${person2.name}: [what they say]

Keep it conversational and authentic — like two real people talking, not a scripted dialogue. About 200-300 words total.
Return only the conversation text, no preamble or explanation.
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const conversation = result.response.text().trim();
    res.status(200).json({ conversation });
  } catch (err) {
    console.error('generate-demo-conversation error:', err);
    res.status(500).json({ error: 'generation_failed' });
  }
}
