import { checkRateLimit } from '../lib/redis.js';
import { supabase } from '../db/supabase.js';

export async function rateLimiter(req, res, next) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('tier')
      .eq('clerk_id', req.clerkUserId)
      .single();

    const tier = user?.tier || 'free';
    const result = await checkRateLimit(req.clerkUserId, tier);

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);

    if (!result.success) {
      return res.status(429).json({
        error: 'Daily compilation limit reached',
        message: tier === 'free'
          ? 'You\'ve used all 5 free compilations today. Upgrade to Pro for unlimited access.'
          : 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        upgradeUrl: '/pricing',
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err.message);
    next();
  }
}
