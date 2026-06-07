import { Router } from 'express';
import { supabase } from '../db/supabase.js';

const router = Router();

// Get user's compilations
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', req.clerkUserId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    let query = supabase
      .from('compilations')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.ilike('input', `%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({ compilations: data, total: count, page, limit });
  } catch (err) {
    console.error('History error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get single compilation
router.get('/:id', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', req.clerkUserId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { data, error } = await supabase
      .from('compilations')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', user.id)
      .single();

    if (error) return res.status(404).json({ error: 'Compilation not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete compilation
router.delete('/:id', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', req.clerkUserId)
      .single();

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { error } = await supabase
      .from('compilations')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', user.id);

    if (error) return res.status(404).json({ error: 'Compilation not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
