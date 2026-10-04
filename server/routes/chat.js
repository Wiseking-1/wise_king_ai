import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const defaultSystemPrompt = 'You are Wise King AI, a helpful and friendly assistant.';

const mockReply = (message) => {
  const trimmed = String(message || '').trim();

  if (!trimmed) {
    return 'How can I help you today?';
  }

  return `This is a demo response for: "${trimmed}"

Your app is now connected to a backend. To switch from demo mode to live AI responses, add your OpenAI API key in the .env file and restart the server.`;
};

router.post('/', async (req, res) => {
  try {
    const { message, systemPrompt = defaultSystemPrompt } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: mockReply(message),
        model: 'demo-mode'
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: String(message) }
      ],
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || 'No response generated.';

    return res.json({
      reply,
      model: 'gpt-4o-mini'
    });
  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      details: error?.message || 'Unknown error'
    });
  }
});

export default router;
