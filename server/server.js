import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '..');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Wise King AI',
    mode: process.env.GEMINI_API_KEY ? 'live-gemini' : 'demo-mode' 
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

app.use(express.static(frontendDir));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Wise King AI is running at http://localhost:${port}`);
});
