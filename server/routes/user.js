import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { getUsage } from '../lib/redis.js';

const router = Router();

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', req.clerkUserId)
      .single();

    if (error) return res.status(404).json({ error: 'User not found' });

    const usage = await getUsage(req.clerkUserId, user.tier);

    res.json({ ...user, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.patch('/me', async (req, res) => {
  const { name } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name })
      .eq('clerk_id', req.clerkUserId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
