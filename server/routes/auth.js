import express from 'express';
const router = express.Router();

// Since Firebase handles the real login on the frontend, 
// the backend just verifies the user.
router.get('/profile', (req, res) => {
  const uid = req.headers['x-firebase-uid'];
  if (!uid) {
    return res.status(401).json({ error: 'No user logged in' });
  }
  res.json({ status: 'ok', message: 'Firebase Auth Active' });
});

export default router;
