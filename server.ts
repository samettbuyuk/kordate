import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function startServer() {
  const app = express();
  app.use(express.json());

  // API endpoint for AI conversation harmony analysis
  app.post('/api/analyze-chat', async (req, res) => {
    try {
      const { messages, userInterests } = req.body;
      
      if (!messages || messages.length === 0) {
        return res.json({ score: 75, advice: 'Sohbeti başlatmak için derin bir soru sorun.' });
      }

      // If Gemini AI is available, evaluate via Gemini
      if (ai) {
        const prompt = `Sen VerbaMatch adında yapay zeka tabanlı bir "yavaş date" ve derin sohbet asistanısın. 
Aşağıdaki sohbet geçmişini ve kullanıcıların ilgi alanlarını (${JSON.stringify(userInterests)}) analiz et.
Sohbet kalitesini, kelime derinliğini, anlamlı bağları 0 ile 100 arasında bir "Sohbet Uyum Puanı" (score) ile puanla.
Ayrıca sohbete katkı sağlayacak 1 adet yapıcı öneri veya derin sohbet sorusu (advice) üret.
Yalnızca JSON formatında yanıt ver: {"score": number, "advice": "string"}.

Sohbet Geçmişi:
${JSON.stringify(messages.slice(-10))}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      }

      // Fallback calculation if no AI key or parse failure
      const totalWords = messages.reduce((acc: number, m: { text: string }) => acc + (m.text ? m.text.split(/\s+/).length : 0), 0);
      const avgWords = totalWords / messages.length;
      let score = Math.min(98, Math.max(40, Math.round(50 + avgWords * 6 + messages.length * 2)));

      let advice = 'Harika gidiyorsunuz! Ortak ilgi alanlarınız üzerine derinleşebilirsiniz.';
      if (avgWords < 4) {
        advice = 'Uyarı: Mesajlarınız çok kısa! 3 kelimeden uzun anlamlı cümleler kurarak sohbet uyumunuzu artırın.';
      }

      res.json({ score, advice });
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      res.json({ score: 70, advice: 'Karşılıklı empati kurarak sohbeti derinleştirebilirsiniz.' });
    }
  });

  // Vite middleware setup in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`VerbaMatch server running on http://localhost:${port}`);
  });
}

startServer();
