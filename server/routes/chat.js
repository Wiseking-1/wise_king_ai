import express from 'express';

const router = express.Router();

// Your System Prompt (Keep this exactly as it is)
const SYSTEM_PROMPT = `You are WISE KING AI... [PASTE YOUR ENTIRE SYSTEM PROMPT HERE] ...Ranka ya dade! 👑🇳🇬💛`;

// Free Web Search Function (Using DuckDuckGo)
async function performWebSearch(query) {
  try {
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
    const data = await res.json();
    let results = "";
    if (data.AbstractText) results += `${data.AbstractText}\n`;
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 3).forEach(topic => {
        if (topic.Text) results += `- ${topic.Text}\n`;
      });
    }
    return results || "No direct search results found.";
  } catch (error) {
    console.error("Search failed:", error);
    return "Search unavailable.";
  }
}

router.post('/', async (req, res) => {
  try {
    const { message, history, useSearch, useThink } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return res.json({ reply: "⚠️ Demo Mode: Add DEEPSEEK_API_KEY to Vercel to activate me.", model: 'demo-mode' });

    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];

    // Add History
    if (Array.isArray(history)) {
      history.slice(-6).forEach((m) => {
        messages.push({ role: m.role, content: m.content });
      });
    }

    let finalMessage = message;

    // 🔍 WEB SEARCH LOGIC
    if (useSearch) {
      const searchResults = await performWebSearch(message);
      finalMessage = `[WEB SEARCH RESULTS FOR "${message}"]:\n${searchResults}\n\nUsing the search results above, answer the user's question: ${message}`;
    }

    messages.push({ role: 'user', content: finalMessage });

    // 🧠 CHOOSE MODEL BASED ON BUTTONS
    // Use deepseek-reasoner for "Think" mode, otherwise deepseek-chat
    const modelToUse = useThink ? 'deepseek-reasoner' : 'deepseek-chat';

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: modelToUse, 
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    const data = await response.json();
    
    if (data.error) {
       return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || '';

    return res.json({ reply, model: modelToUse });

  } catch (error) {
    console.error('Chat route error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
