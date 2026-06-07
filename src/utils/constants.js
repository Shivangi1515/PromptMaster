export const EXAMPLES = [
  "Build a SaaS dashboard for team task management with AI prioritization",
  "Create a mobile app for tracking personal finances with ML insights",
  "Design a real-time collaborative code editor with AI pair programming",
  "Build an e-commerce platform with recommendation engine",
];

export const STAGE_CONFIG = {
  1: { accent: "#f59e0b", label: "PLANNING & ARCHITECTURE", icon: "🗺️", bg: "rgba(245,158,11,0.05)" },
  2: { accent: "#10b981", label: "IMPLEMENTATION", icon: "⚙️", bg: "rgba(16,185,129,0.05)" },
  3: { accent: "#8b5cf6", label: "REVIEW & OPTIMIZATION", icon: "🔬", bg: "rgba(139,92,246,0.05)" },
};

export const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For developers getting started with AI prompt engineering.",
    features: [
      "5 compilations per day",
      "Basic prompt structure",
      "Watermarked output",
      "Community support",
    ],
    cta: "Start Free",
    href: "/auth/sign-up",
    featured: false,
    priceId: null,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals who need unlimited prompt engineering power.",
    features: [
      "Unlimited compilations",
      "No watermark",
      "Prompt history & search",
      "Export as JSON / Markdown",
      "Save & organize prompts",
      "Priority support",
    ],
    cta: "Subscribe",
    href: null,
    featured: true,
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO || "price_pro",
  },
  {
    name: "Teams",
    price: "$29",
    period: "/month",
    description: "For teams collaborating on AI-driven development workflows.",
    features: [
      "Everything in Pro",
      "5 team seats",
      "Shared prompt library",
      "Team workspace",
      "API access (10K req/mo)",
      "Admin dashboard",
    ],
    cta: "Subscribe",
    href: null,
    featured: false,
    priceId: import.meta.env.VITE_STRIPE_PRICE_TEAMS || "price_teams",
  },
];

export const FAQ_ITEMS = [
  {
    q: "How does PromptMaster work?",
    a: "You describe your idea or project in plain text. PromptMaster analyzes your input and generates three optimized prompts: one for Planning & Architecture, one for Implementation, and one for Review & Optimization. Each is ready to use with any AI tool.",
  },
  {
    q: "What AI models does it use?",
    a: "PromptMaster uses Groq's LLaMA 3.3 70B model for fast, high-quality prompt generation. We're actively adding support for GPT-4, Claude 3.5, and other models.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes! The free tier gives you 5 compilations per day with basic prompt structure and a subtle watermark. No credit card required.",
  },
  {
    q: "Can I try before paying?",
    a: "Absolutely. Sign up for free and start compiling immediately. Upgrade to Pro when you need unlimited access and advanced features.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your prompts and compilations are private to your account. We do not train on your data. See our Privacy Policy for details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your subscription at any time. Your access continues until the end of your billing period. No hidden fees.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Founder @ DevForge",
    avatar: "AC",
    quote: "PromptMaster cut our project planning time by 80%. The three-stage output is exactly what we need to go from idea to execution.",
  },
  {
    name: "Sarah Mitchell",
    role: "Senior Developer @ TechCorp",
    avatar: "SM",
    quote: "I use PromptMaster for every project now. The architecture prompts alone are worth the subscription. Game changer for AI-assisted development.",
  },
  {
    name: "Marcus Johnson",
    role: "Indie Hacker",
    avatar: "MJ",
    quote: "Built my entire SaaS MVP using prompts from PromptMaster. The implementation stage gives you production-quality code structure every time.",
  },
  {
    name: "Priya Patel",
    role: "AI Engineer @ ScaleAI",
    avatar: "PP",
    quote: "As someone who works with AI daily, PromptMaster's prompt engineering is on another level. The review stage catches edge cases I'd miss.",
  },
];
