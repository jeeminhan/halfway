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
You are generating the final question of a philosophical conversation between two people who just met.

Person 1 is from ${person1City}${person1Country ? ', ' + person1Country : ''}.
Person 2 is from ${person2City}${person2Country ? ', ' + person2Country : ''}.

Here is everything they said:

${person1Answers.map(a => `Person 1 on "${a.topic}": "${a.answer}"`).join('\n')}

${person2Answers.map(a => `Person 2 on "${a.topic}": "${a.answer}"`).join('\n')}

Your job: find the ONE specific thing — a word, an image, a place, a person, a feeling — that appeared in BOTH of their answers, even if they used different words for it.

Then generate ONE question that:
- Names that specific shared thing directly — use their actual words or images, not abstractions
- Asks whether that thing points toward something — or someone — they haven't found yet
- Opens the question of whether there is a love, a home, a belonging, or a presence that could fully meet that longing — without naming God, Jesus, or religion directly
- Feels like the most honest question in the room — the one both people are secretly already asking
- Is short, specific, and impossible to answer with a yes or no
- Does NOT start with "Both of you..." or "You both..." — find a more surprising entry into the question

Examples of the right register:
- "What if the hotpot and the Sunday morning are actually the same hunger?"
- "Is there a version of home that doesn't require you to leave something behind to find it?"
- "What would it mean to be known like that — not by a place or a person who could leave — but by something that couldn't?"

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
