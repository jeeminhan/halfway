import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";
import { join } from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { country, city, spiritualBackground, souvenirTopic, rollNumber } = req.body;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const philosophy = readFileSync(
        join(process.cwd(), "docs/evangelism-philosophy.md"), "utf-8"
    );

    const arcPhase = rollNumber === 1 ? "Resonate"
        : rollNumber === 2 ? "Dissonate"
        : "Complete";

    const prompt = `
You are generating a single conversation question for an ISM (International Student Ministry)
volunteer who is meeting a student from ${city}, ${country}.

Student spiritual background: ${spiritualBackground}
Souvenir Die topic: ${souvenirTopic}
Sam Chan arc phase: ${arcPhase} (Roll ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local practices,
  landmarks, traditions, or cultural concepts where possible
- Follow the ${arcPhase} phase of Sam Chan's Resonate/Dissonate/Complete arc
- Have the coaching embedded in the phrasing — no separate explanation needed
- Feel like genuine human curiosity, not a ministry script
- Be appropriate for the student's ${spiritualBackground} background
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.
`;

    try {
        const result = await model.generateContent([
            { text: philosophy },
            { text: prompt }
        ]);
        const question = result.response.text().trim();
        res.status(200).json({ question });
    } catch (err) {
        res.status(500).json({ error: "generation_failed" });
    }
}
