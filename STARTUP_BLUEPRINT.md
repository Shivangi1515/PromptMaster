# PromptMaster V2 — Startup Blueprint

## 1. Product Positioning

### Target Audience
| Segment | Pain Point | Our Solution |
|---------|-----------|--------------|
| Solo Devs | Spend hours crafting AI prompts per task | Generate 3-stage production prompts instantly |
| Startup Founders | Need structured project breakdowns fast | Architecture → Implementation → Review in one shot |
| AI Engineers | Building complex AI workflows | Systematic prompt engineering pipeline |
| Freelancers | Delivering quality code faster | Professional-grade prompt templates |
| Students | Learning AI-assisted development | Structured learning with practical prompts |

### Value Proposition
> "From idea to production-ready AI prompt in 60 seconds — Plan, Build, Optimize."

### Differentiators vs Competitors
| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| PromptBase | Static prompt marketplace, no workflow | Three-stage execution pipeline + generation |
| FlowGPT | Consumer-grade, low quality prompts | Developer-first, production-grade output |
| ChatGPT | Requires manual prompt crafting | Automated structured prompt compilation |

### Brand Voice
Premium developer tool. Like Vercel for prompts. Not a toy — a professional architecture system.

---

## 2. Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 5 compilations/day, watermarked output, basic prompts |
| **Pro** | $9/mo | Unlimited compilations, no watermark, prompt history, export (JSON/MD) |
| **Teams** | $29/mo | Shared workspace, team prompt library, API access, 5 seats |
| **Lifetime** | $49 | One-time, early adopter hook, all Pro features forever |
| **API** | $19/mo | 10K requests/month, embed in own tools, webhooks |
| **Marketplace** | 15% cut | Users sell prompt packs; commission on each sale |

### Additional Revenue
- **Affiliate program**: 30% recurring commission
- **Prompt Packs**: Premium curated packs ($5–$20 each)
- **White-label**: Enterprise licensing ($199/mo)

---

## 3. Website Structure & Pages

```
/
├── (Landing Page)
│   ├── Hero
│   ├── Features grid
│   ├── Live demo embed
│   ├── Pricing section
│   ├── Testimonials
│   ├── FAQ
│   └── CTA
│
├── /dashboard
│   ├── Input / Compile
│   ├── Output (3 stages)
│   └── Quick examples
│
├── /history
│   ├── Past compilations list
│   └── Search & filter
│
├── /saved
│   ├── Saved prompts
│   └── Folders/collections
│
├── /marketplace
│   ├── Browse prompt packs
│   ├── Search & categories
│   └── Purchase flow
│
├── /pricing
│   ├── Comparison table
│   └── FAQ
│
├── /docs
│   ├── API reference
│   ├── Getting started
│   └── SDK/guides
│
├── /blog
│   ├── Articles
│   └── SEO content
│
├── /settings
│   ├── Profile
│   ├── Billing
│   └── API keys
│
└── /auth
    ├── /login
    ├── /register
    └── /forgot-password
```

---

## 4. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite + Tailwind | Developer fast, dark-mode native |
| Backend | Node.js + Express | Keep existing stack, extend |
| Auth | Clerk | Drop-in, social login, multi-tenant |
| Payments | Stripe | Subscriptions + one-time + marketplace |
| Database | PostgreSQL (Supabase) | Relational, RLS, real-time |
| Rate Limiting | Redis (Upstash) | Serverless, per-tier limits |
| Email | Resend | Transactional + marketing |
| Analytics | Posthog | Product analytics + session recording |
| Hosting FE | Vercel | Edge, preview deploys |
| Hosting BE | Render | Docker, auto-scaling |
| CDN | Cloudflare | Caching, DDoS protection |

---

## 5. Database Schema (Supabase/PostgreSQL)

### users
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default gen_random_uuid() |
| clerk_id | text | Clerk user ID |
| email | text | unique |
| name | text | |
| tier | text | 'free' | 'pro' | 'teams' | 'lifetime' | 'api' |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |
| credits_remaining | int | resets daily for free tier |
| credits_reset_at | timestamptz | |
| created_at | timestamptz | |

### compilations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id |
| input | text | raw user input |
| output_p1 | text | Prompt 1 |
| output_p2 | text | Prompt 2 |
| output_p3 | text | Prompt 3 |
| tokens_used | int | |
| model | text | 'llama-3.3-70b-versatile' |
| created_at | timestamptz | |

### saved_prompts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id |
| name | text | user-given name |
| content | text | full prompt text |
| folder_id | uuid | nullable, FK -> folders |
| created_at | timestamptz | |

### folders
| Column | Type |
|--------|------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id |
| name | text |
| created_at | timestamptz |

### prompt_packs (Marketplace)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| seller_id | uuid | FK -> users.id |
| title | text | |
| description | text | |
| tags | text[] | |
| price | int | cents |
| content | jsonb | structured prompts |
| downloads | int | |
| rating_avg | float | |
| created_at | timestamptz | |

### purchases
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| buyer_id | uuid | FK -> users.id |
| pack_id | uuid | FK -> prompt_packs.id |
| amount | int | cents |
| platform_fee | int | cents (15%) |
| created_at | timestamptz | |

### api_keys
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id |
| key_hash | text | hashed |
| name | text | label |
| last_used_at | timestamptz | |
| created_at | timestamptz | |

### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK -> users.id |
| stripe_subscription_id | text | |
| tier | text | |
| status | text | 'active' | 'canceled' | 'past_due' |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| canceled_at | timestamptz | |

---

## 6. Auth Flow (Clerk)

```
Browser ─────▶ Clerk Middleware ─────▶ App
                │
                ├── Sign Up → Email/Google/GitHub
                ├── Sign In
                └── Webhook → POST /api/webhooks/clerk
                                │
                                ▼
                         Create user in PostgreSQL
                         Welcome email via Resend
```

**Pages:**
- `/auth/sign-in` — Clerk `<SignIn />`
- `/auth/sign-up` — Clerk `<SignUp />`
- Protected routes via Clerk `auth()` middleware

---

## 7. Stripe Integration Plan

### Subscription Flow
```
User clicks "Upgrade" ──▶ Stripe Checkout Session
                                │
                          Webhook: checkout.session.completed
                                │
                          Update user.tier in DB
                          Create subscription record
                                │
                          Send confirmation email
```

### Marketplace Flow
```
Buyer purchases pack ──▶ Stripe Payment Intent
                               │
                         Webhook: payment_intent.succeeded
                               │
                         Create purchase record
                         Release prompt pack access
                         Add balance to seller
```

### Webhook Endpoints
```
POST /api/webhooks/stripe
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - checkout.session.completed
  - invoice.payment_failed
  - payment_intent.succeeded
```

---

## 8. Rate Limiting Strategy (Redis + Upstash)

| Tier | Requests / min | Compilations / day | Burst |
|------|---------------|-------------------|-------|
| Free | 3 | 5 | 1 |
| Pro | 30 | Unlimited | 5 |
| Teams | 60 | Unlimited | 10 |
| API | 100 | Unlimited | 20 |

Implementation:
```js
// middleware/rateLimit.js
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL, token: process.env.UPSTASH_REDIS_TOKEN })

const limits = {
  free:  { requests: 3, window: "1 m" },
  pro:   { requests: 30, window: "1 m" },
  teams: { requests: 60, window: "1 m" },
  api:   { requests: 100, window: "1 m" },
}

export const rateLimit = async (userId, tier) => {
  const config = limits[tier] || limits.free
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window),
    analytics: true,
  })
  return ratelimit.limit(userId)
}
```

Credit reset (free tier):
```sql
-- Daily cron (pg_cron or external scheduler):
UPDATE users
SET credits_remaining = 5,
    credits_reset_at = NOW()
WHERE tier = 'free'
  AND credits_reset_at < NOW() - INTERVAL '1 day';
```

---

## 9. 90-Day Go-To-Market Roadmap

### Days 1–15: Foundation
- [ ] Set up Clerk auth (sign-in, sign-up, middleware)
- [ ] Set up Supabase + write schema migrations
- [ ] Set up Stripe products/prices in dashboard
- [ ] Implement rate limiting with Upstash/Redis
- [ ] Create landing page (Hero, Features, Pricing)
- [ ] Build /dashboard (ported from current app)
- [ ] Deploy: Vercel (FE) + Render (BE)

### Days 16–30: Core Features
- [ ] Compilation history page (/history)
- [ ] Save prompts + folders (/saved)
- [ ] Export prompts (JSON, Markdown)
- [ ] Stripe Checkout integration (Pro, Teams, Lifetime)
- [ ] Stripe webhooks + user tier sync
- [ ] Email: welcome, receipt, payment failure
- [ ] Free tier credit enforcement
- [ ] Settings page (profile, billing managed by Portal)

### Days 31–45: Marketplace + API
- [ ] Marketplace page with search/tags
- [ ] Seller onboarding
- [ ] Purchase flow + Stripe marketplace connect
- [ ] API key management page
- [ ] API endpoint for prompts generation
- [ ] API docs page
- [ ] Rate limiting per API key

### Days 46–60: Content & SEO
- [ ] Blog: "How to write production prompts for Cursor"
- [ ] Blog: "Prompt engineering patterns for developers"
- [ ] Blog: "PromptMaster vs PromptBase vs FlowGPT"
- [ ] SEO meta tags on all pages
- [ ] Open Graph images
- [ ] Sitemap.xml
- [ ] Affiliate program landing page

### Days 61–75: Launch Prep
- [ ] Product Hunt listing — prepare maker profile, assets, video
- [ ] Hacker News — write "Show HN" post
- [ ] Twitter/X — 7-day pre-launch thread series
- [ ] Beta test with 50 users
- [ ] Fix bugs + polish UX
- [ ] Monitoring (Posthog, Sentry)
- [ ] Loading states + error boundaries everywhere

### Days 76–90: Launch + Post-Launch
- [ ] Launch on Product Hunt
- [ ] Post on HN, Reddit r/SaaS, r/webdev, r/programming
- [ ] Launch affiliate program
- [ ] Monitor + fix issues
- [ ] Post-launch retrospective
- [ ] Plan v2.1 features (user feedback)

---

## 10. Page-by-Page Content Plan

### Landing Page
```
HEADER:    PromptMaster — Plan. Build. Optimize.
SUB:       Transform any idea into 3 production-grade AI prompts in 60 seconds.
CTA:       Start Compiling Free → [link to /auth/sign-up]

FEATURES:
  ⇨ Three-Stage Pipeline (Architecture → Implementation → Review)
  ⇨ Streaming Preview — watch prompts compile in real-time
  ⇨ Copy with one click — per stage or all three
  ⇨ Export to JSON/MD (Pro)
  ⇨ Save & organize prompts (Pro)
  ⇨ Team workspace (Teams)

SOCIAL PROOF:
  "Used by 500+ developers at [logos]"

PRICING:
  Free / Pro $9 / Teams $29 / Lifetime $49

FAQ:
  - How does it work?
  - What models does it use?
  - Can I try before paying?
  - Is my data private?
```

### Dashboard
```
Layout: Left (header + input) | Right (output)

INPUT:
  Textarea with placeholder
  Quick example buttons

OUTPUT:
  Stage 1 card — amber accent
  Stage 2 card — green accent
  Stage 3 card — purple accent
  Copy All button
  Save button (Pro)

STATUS: AWAITING → COMPILING → DONE / ERROR
```

### Pricing Page
```
Table layout with highlighted "Lifetime" row.

FAQ accordion:
  - Can I cancel anytime?
  - What payment methods?
  - Can I upgrade/downgrade?
  - What happens if I exceed credits?
```

---

## 11. Security Checklist

- [ ] All API routes behind Clerk auth (except public)
- [ ] CORS locked to production domain
- [ ] Rate limiting on /api/compile
- [ ] API keys hashed via bcrypt
- [ ] Stripe webhook signature verification
- [ ] Helmet.js for HTTP headers
- [ ] Input sanitization on all user text
- [ ] SQL injection prevention via parameterized queries
- [ ] Environment variables via .env (never committed)
- [ ] Regular dependency audits (`npm audit`)
- [ ] GDPR-compliant user data export/deletion

---

## 12. Key Metrics to Track (Posthog)

| Metric | Where |
|--------|-------|
| Sign-ups / day | Posthog |
| Compilations / day | Database |
| Conversion rate (free → paid) | Posthog + Stripe |
| Churn rate | Stripe |
| Marketplace GMV | Database |
| Avg session duration | Posthog |
| Most used example prompts | Posthog events |
| API request volume | Server logs |
| Top referring channels | Posthog UTM |
