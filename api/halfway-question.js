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
- Finds the thread of longing that runs through BOTH people's answers
- Names what both people are searching for but haven't found yet — belonging, home,
  being fully known, something that lasts, something that can't be taken away
- Gently opens the question of whether that longing points toward something —
  or someone — beyond what either of them has already found
- Is the kind of question that makes both people go quiet and lean forward
- Does not mention Jesus, God, or religion by name — but should make someone
  who knows the gospel immediately recognize the door it just opened
- Feels like genuine human curiosity, not a script
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
