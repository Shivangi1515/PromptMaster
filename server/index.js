import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { clerkAuth } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import compileRoutes from './routes/compile.js';
import stripeRoutes from './routes/stripe.js';
import webhookRoutes from './routes/webhooks.js';
import historyRoutes from './routes/history.js';
import userRoutes from './routes/user.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// Raw body for Stripe webhooks (needs signature verification)
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use('/api/webhooks', express.json());

// JSON body parser for all other routes
app.use(express.json());

// ─── Routes ────────────────────────────────────────

// Webhooks (no auth required)
app.use('/api/webhooks', webhookRoutes);

// Compile (auth + rate limiting)
app.use('/api/compile', clerkAuth, rateLimiter, compileRoutes);

// Stripe checkout (auth required)
app.use('/api/stripe', clerkAuth, stripeRoutes);

// History (auth required)
app.use('/api/history', clerkAuth, historyRoutes);

// User (auth required)
app.use('/api/user', clerkAuth, userRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  🚀 PromptMaster server running at http://localhost:${PORT}`);
  console.log(`  🎯 Frontend: ${FRONTEND_URL}`);
  console.log(`  🔑 Groq: ${process.env.GROQ_API_KEY ? '✓' : '✗'}`);
  console.log(`  💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓' : '✗'}`);
  console.log(`  🗄️  Supabase: ${process.env.SUPABASE_URL ? '✓' : '✗'}`);
  console.log(`  📊 Redis: ${process.env.UPSTASH_REDIS_URL ? '✓' : '✗'}`);
  console.log(`  📧 Resend: ${process.env.RESEND_API_KEY ? '✓' : '✗'}\n`);
});
