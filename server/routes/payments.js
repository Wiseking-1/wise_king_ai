import express from 'express';

const router = express.Router();

router.post('/initialize', async (req, res) => {
  try {
    const { email, amount } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({ error: 'Paystack not configured' });
    }
    if (!email || !amount) {
      return res.status(400).json({ error: 'Email and amount required' });
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        email,
        amount: Math.round(Number(amount) * 100),
        callback_url: `${req.protocol}://${req.get('host')}/payment-success`
      })
    });

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Payment error:', error);
    return res.status(500).json({ error: 'Payment initialization failed' });
  }
});

router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Paystack not configured' });

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${secretKey}` }
    });
    const data = await response.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export default router;
