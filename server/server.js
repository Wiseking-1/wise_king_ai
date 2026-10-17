import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';
import fileRoutes from './routes/files.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '..');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Wise King AI',
    owner: 'Oga Ibrahim 🇳🇬',
    mode: process.env.DEEPSEEK_API_KEY ? 'live-deepseek' : 'demo-mode',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/files', fileRoutes);

// Serve static frontend
app.use(express.static(frontendDir));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Only listen when running locally (Vercel handles it in production)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`👑 Wise King AI running at http://localhost:${port}`);
  });
}

export default app;
