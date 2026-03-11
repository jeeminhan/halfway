// api/summarize-conversation.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    audioBase64,
    audioMimeType,
    transcript,
    setting,
    person1,
    person2,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = [
    `Setting: ${setting || 'unknown'}`,
    `Person 1 is from ${[person1.city, person1.country].filter(Boolean).join(', ')}, occupation: ${person1.occupation || 'unknown'}`,
    `Person 2 is from ${[person2.city, person2.country].filter(Boolean).join(', ')}, occupation: ${person2.occupation || 'unknown'}`,
  ].join('\n')

  const outputInstructions = `
From this conversation, generate a keepsake JSON object with exactly these fields:

- "thread": The ONE specific thing — a word, image, memory, feeling — that appeared in both their worlds. Name it using their actual words. 1-2 sentences. Specific, not abstract. If no clear shared thread, create a poetic bridge between the closest things they mentioned.
- "person1Window": One beautiful insight Person 2 now has about ${[person1.city, person1.country].filter(Boolean).join(', ')}'s world. What did they learn? 1-2 sentences, specific.
- "person2Window": One beautiful insight Person 1 now has about ${[person2.city, person2.country].filter(Boolean).join(', ')}'s world. 1-2 sentences, specific.
- "reflection": A short poetic closing (3-5 sentences). Name the longing underneath what they shared — the thing that both their answers were quietly reaching toward. Then quietly point toward a Person — not a place, not a feeling, not a memory — who could meet that hunger fully and permanently. Be specific to what they actually said. Warm and honest, not preachy.
- "continuePrompt": A single warm, human next-step suggestion (1-2 sentences). Encourage them to stay connected or go deeper together. Not a question — a nudge. Example: "Exchange numbers. You're not done yet."

Return ONLY valid JSON. No preamble, no markdown code fences, no explanation:
{
  "thread": "...",
  "person1Window": "...",
  "person2Window": "...",
  "reflection": "...",
  "continuePrompt": "..."
}`;

  try {
    let result;

    if (audioBase64 && audioMimeType) {
      // Audio path: send audio directly to Gemini
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
      ]);
    } else {
      // Text fallback path
      const text = transcript || '(no conversation summary provided)';
      result = await model.generateContent([
        {
          text: `Here is a written summary of a conversation between two people who just met.\n\n${context}\n\nConversation:\n${text}\n\n${outputInstructions}`,
        },
      ]);
    }

    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const keepsake = JSON.parse(cleaned);

    // Validate required fields
    if (!keepsake.thread || !keepsake.reflection) {
      throw new Error('Missing required fields');
    }

    res.status(200).json(keepsake);
  } catch (err) {
    console.error('summarize-conversation error:', err);
    res.status(500).json({ error: 'generation_failed' });
  }
}
