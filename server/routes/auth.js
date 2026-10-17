import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '..', 'users.json');

// In-memory users (loads from users.json)
let users = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Could not load users:', e.message);
  users = [];
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Could not save users:', e.message);
  }
}

const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET || 'dev_secret',
  { expiresIn: '7d' }
);

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: `user_${Date.now()}`,
      name,
      email: String(email).toLowerCase(),
      password: passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers();

    const token = createToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = createToken(user);

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// PROFILE
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    if (!token) return res.status(401).json({ error: 'Authorization token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = users.find((u) => u.id === decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
