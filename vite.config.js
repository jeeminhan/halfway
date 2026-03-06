import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { readFileSync } from 'fs'
import { join } from 'path'

// Dev-only middleware that mirrors the Vercel API function
const geminiDevPlugin = () => ({
  name: 'gemini-dev-api',
  configureServer(server) {
    server.middlewares.use('/api/generate-question', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }

      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { country, city, spiritualBackground, souvenirTopic, rollNumber } = JSON.parse(body);
          const apiKey = process.env.GEMINI_API_KEY;
          if (!apiKey) throw new Error('No GEMINI_API_KEY');

          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
          const philosophy = readFileSync(join(process.cwd(), 'docs/evangelism-philosophy.md'), 'utf-8');
          const arcPhase = rollNumber === 1 ? 'Resonate' : rollNumber === 2 ? 'Dissonate' : 'Complete';

          const prompt = `You are generating a single conversation question for an ISM (International Student Ministry) volunteer who is meeting a student from ${city}, ${country}.

Student spiritual background: ${spiritualBackground}
Souvenir Die topic: ${souvenirTopic}
Sam Chan arc phase: ${arcPhase} (Roll ${rollNumber} of 3)

Generate ONE question. The question must:
- Be culturally specific to ${city}, ${country} — reference actual local practices, landmarks, traditions, or cultural concepts where possible
- Follow the ${arcPhase} phase of Sam Chan's Resonate/Dissonate/Complete arc
- Have the coaching embedded in the phrasing — no separate explanation needed
- Feel like genuine human curiosity, not a ministry script
- Be appropriate for the student's ${spiritualBackground} background
- Be a single question only — no multiple questions, no lists

Return only the question text. No preamble, no explanation.`;

          const result = await model.generateContent([{ text: philosophy }, { text: prompt }]);
          const question = result.response.text().trim();

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ question }));
        } catch (err) {
          console.error('[Gemini dev]', err.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'generation_failed', detail: err.message }));
        }
      });
    });
  }
});

export default defineConfig({
  plugins: [react(), geminiDevPlugin()],
})
