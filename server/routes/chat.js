import express from 'express';

const router = express.Router();

const SYSTEM_PROMPT = 'You are WISE KING AI 👑 — created by IBRAHIM ABDULLAHI 🇳🇬 from Nigeria (Wise King Industry). Be warm, wise, kind, and helpful. Reply in the user language. Use emojis and clear formatting.';

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply: '👑 Ranka ya dade! I received: "' + String(message).slice(0, 100) + '". (Demo mode — add GEMINI_API_KEY to .env for real AI)',
        model: 'demo-mode'
      });
    }

    const contents = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach(function(m) {
        contents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(m.content || '').slice(0, 6000) }]
        });
      });
    }
    const now = new Date();
    const dateStr = now.toLocaleString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
    contents.push({
      role: 'user',
      parts: [{ text: '[Today is ' + dateStr + '.]\n\nUser: ' + message }]
    });

    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contents
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      return res.status(500).json({ error: 'AI request failed', details: errText.slice(0, 200) });
    }

    const data = await response.json();
    const reply =
      (data.candidates &&
       data.candidates[0] &&
       data.candidates[0].content &&
       data.candidates[0].content.parts &&
       data.candidates[0].content.parts[0] &&
       data.candidates[0].content.parts[0].text) || '';

    if (!reply) {
      return res.status(500).json({ error: 'Empty AI response' });
    }

    return res.json({ reply: reply, model: 'gemini-2.5-flash' });
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

export default router;
