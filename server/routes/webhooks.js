import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../db/supabase.js';
import { sendEmail } from '../lib/resend.js';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Clerk webhook — create user in Supabase on sign-up
router.post('/clerk', async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

  try {
    const payload = JSON.stringify(req.body);
    const { type, data } = req.body;

    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      const email = email_addresses?.[0]?.email_address;

      const { error } = await supabase.from('users').upsert({
        clerk_id: id,
        email,
        name: [first_name, last_name].filter(Boolean).join(' '),
        avatar_url: image_url,
        tier: 'free',
        credits_used: 0,
        credits_reset_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Clerk webhook error:', error.message);
        return res.status(500).json({ error: error.message });
      }

      await sendEmail({
        to: email,
        subject: 'Welcome to PromptMaster!',
        html: `<h2>Welcome to PromptMaster!</h2><p>Start turning your ideas into production-grade AI workflows.</p><a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a>`,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Clerk webhook error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook — handle payment events
router.post('/stripe', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clerkId = session.metadata?.clerk_id;
        const tier = session.metadata?.tier || getTierFromPrice(session.line_items?.data?.[0]?.price?.id);

        if (clerkId) {
          await supabase
            .from('users')
            .update({ tier, stripe_customer_id: session.customer, stripe_subscription_id: session.subscription })
            .eq('clerk_id', clerkId);

          await supabase.from('subscriptions').insert({
            user_id: (await supabase.from('users').select('id').eq('clerk_id', clerkId).single()).data?.id,
            stripe_subscription_id: session.subscription,
            tier,
            status: 'active',
            current_period_start: new Date(session.created * 1000).toISOString(),
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const clerkId = subscription.metadata?.clerk_id;

        if (clerkId) {
          await supabase
            .from('users')
            .update({ tier: 'free', stripe_subscription_id: null })
            .eq('clerk_id', clerkId);

          await supabase
            .from('subscriptions')
            .update({ status: 'canceled', canceled_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const clerkId = invoice.metadata?.clerk_id || invoice.subscription_details?.metadata?.clerk_id;

        if (clerkId) {
          const { data: user } = await supabase
            .from('users')
            .select('email')
            .eq('clerk_id', clerkId)
            .single();

          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: 'Payment Failed — PromptMaster',
              html: '<h2>Payment Failed</h2><p>Your subscription payment failed. Please update your payment method.</p>',
            });
          }
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function getTierFromPrice(priceId) {
  if (priceId?.includes('pro')) return 'pro';
  if (priceId?.includes('teams')) return 'teams';
  if (priceId?.includes('lifetime')) return 'lifetime';
  if (priceId?.includes('api')) return 'api';
  return 'free';
}

export default router;
