import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    person1City, person1Country, person1Answers,
    person2City, person2Country, person2Answers,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
You are generating one philosophical question for two people who just had a conversation together.

Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}.
Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}.

Their answers to three philosophical questions:

${person1Answers.map((a, i) => `Person 1 on "${a.topic}": "${a.answer}"`).join('\n')}

${person2Answers.map((a, i) => `Person 2 on "${a.topic}": "${a.answer}"`).join('\n')}

Generate ONE question — the "Halfway Question" — that:
- Finds the thread that runs through BOTH people's answers
- Names something neither person said explicitly but both circled around
- Lives in the shared space between their two stories
- Feels like genuine philosophical curiosity aimed at both of them equally
- Moves toward meaning, belonging, transcendence, or what lasts
- Does not mention religion, God, or faith directly
- Is warm, specific, and impossible to answer with a yes or no
- Reads beautifully in italic serif — it should feel like a line from a novel

Return only the question. No preamble, no explanation.
`;

  try {
    const result = await model.generateContent([{ text: prompt }]);
    const question = result.response.text().trim();
    res.status(200).json({ question });
  } catch (err) {
    res.status(500).json({ error: "generation_failed" });
  }
}
