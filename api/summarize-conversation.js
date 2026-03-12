// api/summarize-conversation.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    audioBase64,
    audioMimeType,
    transcript,
    setting,
    topic,
    person1,
    person2,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const context = [
    `Setting: ${setting || 'unknown'}`,
    `Topic: ${topic?.name || 'unknown'}`,
    `Person 1 is from ${[person1.city, person1.country].filter(Boolean).join(', ')}, occupation: ${person1.occupation || 'unknown'}`,
    `Person 2 is from ${[person2.city, person2.country].filter(Boolean).join(', ')}, occupation: ${person2.occupation || 'unknown'}`,
    topic?.question1 ? `Question to Person 1: ${topic.question1}` : null,
    topic?.question2 ? `Question to Person 2: ${topic.question2}` : null,
  ].join('\n')

  const outputInstructions = `
From this conversation, generate a keepsake JSON object with exactly these fields:

- "thread": The ONE specific connecting point — the halfway point — where their two answers touched. Name it using their actual words. 1-2 sentences. Specific, not abstract. If no clear shared thread, create a poetic bridge between the closest things they mentioned.
- "person1Answer": A concise 1-2 sentence rendering of what Person 1 actually shared in response to the topic. Preserve the emotional specifics and concrete details they mentioned.
- "person2Answer": A concise 1-2 sentence rendering of what Person 2 actually shared in response to the topic. Preserve the emotional specifics and concrete details they mentioned.
- "person1Window": One beautiful insight Person 2 now has about ${[person1.city, person1.country].filter(Boolean).join(', ')}'s world. What did they learn? 1-2 sentences, specific.
- "person2Window": One beautiful insight Person 1 now has about ${[person2.city, person2.country].filter(Boolean).join(', ')}'s world. 1-2 sentences, specific.
- "reflection": A short poetic closing (3-5 sentences). Name the longing underneath what they shared — the thing that both their answers were quietly reaching toward. Then quietly point toward a Person — not a place, not a feeling, not a memory — who could meet that hunger fully and permanently. Be specific to what they actually said. Warm and honest, not preachy.
- "continuePrompt": A single warm, human next-step suggestion (1-2 sentences). Encourage them to stay connected or go deeper together. Not a question — a nudge. Example: "Exchange numbers. You're not done yet."
- "transcript": A faithful transcription of what was said in the conversation. Attribute each segment to "Person 1" or "Person 2" where possible. Preserve the natural flow, pauses, and tone. If you cannot distinguish speakers, write it as a single block. Do not editorialize or summarize — transcribe.

Return ONLY valid JSON. No preamble, no markdown code fences, no explanation:
{
  "thread": "...",
  "person1Answer": "...",
  "person2Answer": "...",
  "person1Window": "...",
  "person2Window": "...",
  "reflection": "...",
  "continuePrompt": "...",
  "transcript": "..."
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
