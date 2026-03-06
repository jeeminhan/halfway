import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const {
        mode,
        country,
        city,
        spiritualBackground,
        souvenirTopic,
        rollNumber,
        originalQuestion,
        studentAnswer
    } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const philosophy = readFileSync(
        join(process.cwd(), "docs/evangelism-philosophy.md"), "utf-8"
    );

    const arcPrompt = `
You are generating a single conversation question for a volunteer meeting an international student from ${city}, ${country}.

Conversation topic: ${souvenirTopic}
Conversation phase: ${rollNumber === 2 ? "Dissonate" : "Complete"} (question ${rollNumber} of 3)

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
`;
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
`;

    try {
        const result = mode === "deepen"
            ? await model.generateContent([{ text: deepenPrompt }])
            : await model.generateContent([
                { text: philosophy },
                { text: arcPrompt }
            ]);
        const question = result.response.text().trim();
        res.status(200).json({ question });
    } catch (err) {
        res.status(500).json({ error: "generation_failed" });
    }
}
