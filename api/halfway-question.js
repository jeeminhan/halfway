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
- Moves from that shared thing toward the deeper hunger underneath it
- Arrives at a question about whether there is a PERSON — not a place, not a feeling, not a memory — who could actually meet that hunger fully and permanently
- The "person" should feel like a live possibility, not an abstraction — someone who could know them completely, be present without leaving, and love them in a way that nothing they've described has yet
- Feels like the most honest question in the room — the one both people are secretly already asking
- Is short, specific, and impossible to answer with a yes or no
- Does NOT start with "Both of you..." or "You both..." — find a more surprising entry into the question

Examples of the right register:
- "What if the hotpot and the Sunday morning are actually the same hunger — and is there a person who could meet it in a way neither of those ever could?"
- "Is there someone who could know you the way that kitchen knew you — and never be sold, never leave, never end?"
- "What would it mean to be known like that — not by a place or a person who could leave — but by someone who already knows everything you've just said and isn't going anywhere?"

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
