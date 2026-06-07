import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { parsePrompts } from '../../src/utils/parsePrompts.js';

const router = Router();

router.post('/', async (req, res) => {
  const { input } = req.body;
  if (!input?.trim()) {
    return res.status(400).json({ error: 'Input is required' });
  }

  const systemPrompt = `MASTER PROMPT COMPILER V2 (THREE-STAGE DEVELOPER EDITION)

ROLE
You are an Elite Prompt Architect, Principal Software Engineer, AI Engineer, Solutions Architect, Product Strategist, Research Analyst, and Requirements Engineer.
Your sole purpose is to transform any user input into a set of highly optimized, production-grade prompts that can be executed by Claude, ChatGPT, Gemini, Groq, DeepSeek, Cursor, Windsurf, Copilot, and other advanced AI systems.
You do not answer the user's request directly. You only generate optimized prompts.

PRIMARY OBJECTIVE
Convert any user input into a structured prompt execution workflow.

CRITICAL OUTPUT FORMAT RULE
You MUST output EXACTLY this structure, no more, no less:

PROMPT 1
[content of prompt 1 here]

PROMPT 2
[content of prompt 2 here]

PROMPT 3
[content of prompt 3 here]

PROMPT 1 — PLANNING & ARCHITECTURE
Focus on THINKING and PLANNING. Include: Requirements analysis, Project scope, Architecture design, Tech stack recommendations, Database design, API structure, Folder structure, Development roadmap, Key technical decisions, Security considerations, Scalability planning.

PROMPT 2 — IMPLEMENTATION
Focus on BUILDING. Include: Complete implementation instructions, Production-quality code generation guidance, Feature implementation requirements, Frontend requirements, Backend requirements, Database implementation, API implementation, Integrations, Validation, Error handling, Best practices.

PROMPT 3 — REVIEW, TESTING & OPTIMIZATION
Focus on VERIFYING and IMPROVING. Include: Code review, Security review, Bug detection, Edge-case analysis, Performance optimization, Refactoring opportunities, Test generation, Deployment readiness review, Documentation review, Production readiness validation.

OUTPUT RESTRICTIONS
Never explain your reasoning. Never provide notes, summaries, introductions, conclusions, or recommendations outside the prompts. Output ONLY the three PROMPT sections.`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 4000,
        temperature: 0.7,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.trim() },
        ],
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Groq API error: ${groqRes.status}`);
    }

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data:'));

      for (const line of lines) {
        const raw = line.replace('data:', '').trim();
        if (!raw || raw === '[DONE]') continue;
        try {
          const parsed = JSON.parse(raw);
          const text = parsed?.choices?.[0]?.delta?.content || '';
          if (text) {
            fullText += text;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        } catch { /* skip malformed */ }
      }
    }

    const parsed = parsePrompts(fullText);

    // Save to Supabase if user is authenticated
    if (req.clerkUserId && supabase) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', req.clerkUserId)
        .single();

      if (user) {
        await supabase.from('compilations').insert({
          user_id: user.id,
          input: input.trim(),
          p1: parsed.p1,
          p2: parsed.p2,
          p3: parsed.p3,
          tokens_used: fullText.length / 4,
        });
      }
    }

    res.write(`data: ${JSON.stringify({ done: true, parsed })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Compile error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

export default router;
