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
You are generating a single conversation question for an ISM (International Student Ministry)
volunteer who is meeting a student from ${city}, ${country}.

Student spiritual background: ${spiritualBackground}
Souvenir Die topic: ${souvenirTopic}
Sam Chan arc phase: ${rollNumber === 1 ? "Resonate" : rollNumber === 2 ? "Dissonate" : "Complete"} (Roll ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local practices,
  landmarks, traditions, or cultural concepts where possible
- Follow the ${rollNumber === 1 ? "Resonate" : rollNumber === 2 ? "Dissonate" : "Complete"} phase of Sam Chan's Resonate/Dissonate/Complete arc
- Have the coaching embedded in the phrasing — no separate explanation needed
- Feel like genuine human curiosity, not a ministry script
- Be appropriate for the student's ${spiritualBackground} background
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.
`;
    const deepenPrompt = `
You are a follow-up question generator for an ISM (International Student Ministry) volunteer.

The volunteer just asked a student from ${city}, ${country} (spiritual background: ${spiritualBackground}) this question:
"${originalQuestion}"

The student answered:
"${studentAnswer}"

Generate ONE follow-up question that:
- Picks up on something emotionally specific the student said — a word, a detail, a feeling
- Moves from the surface topic (food/music/place/etc.) toward something deeper: belonging, longing, home, identity, what satisfies, what they miss
- Feels like genuine empathetic curiosity — the volunteer is truly listening
- Does NOT mention Jesus, God, or religion directly — it opens a door naturally
- Is warm, conversational, and flows naturally from their exact answer
- References something specific from their answer, not a generic follow-up

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
