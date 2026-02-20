/**
 * NPS IntelliPension AI — Chat Route with Claude API
 */

const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NPS_SYSTEM_PROMPT = `You are NPS IntelliPension AI, an AI-powered multilingual pension advisory assistant built for India's National Pension System (NPS) regulated by PFRDA (Pension Fund Regulatory and Development Authority).

Your role:
- Help users estimate retirement corpus and monthly pension
- Guide contribution optimization
- Explain NPS rules, Tier I & Tier II accounts, tax benefits
- Provide multilingual responses (Hindi, Tamil, Telugu, Bengali, etc.)
- Promote financial literacy around compounding, inflation, annuity

Key rules:
1. ALWAYS clarify projections are estimates, not guarantees
2. NEVER recommend specific stocks or non-NPS investments
3. Encourage users to verify with official PFRDA sources (npscra.nsdl.co.in)
4. Use simple language, Indian context, ₹ currency
5. Be encouraging but realistic about retirement planning
6. If user writes in Hindi or regional language, respond in that language

NPS Key Facts:
- Min contribution: ₹500/month (Tier I)
- 40% must be used to purchase annuity at retirement
- Tax benefits: ₹1.5L under 80C + extra ₹50,000 under 80CCD(1B)
- Investment options: E (equity), C (corporate bonds), G (government securities), A (alternative assets)
- Auto Choice and Active Choice options available

Return assumptions to use (for estimates):
- Conservative (25% equity): ~8% p.a.
- Moderate (50% equity): ~10% p.a.
- Aggressive (75% equity): ~12% p.a.

Always end with: "⚠️ These are estimates. Please verify with PFRDA official sources."`;

/**
 * POST /api/chat/message
 * Main chat endpoint
 */
router.post("/message", async (req, res) => {
  try {
    const { message, history = [], language = "en" } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Message cannot be empty" });
    }

    // Build conversation history
    const messages = [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: NPS_SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content[0]?.text || "I couldn't process your request. Please try again.";

    res.json({
      success: true,
      data: {
        reply,
        usage: response.usage,
        language,
      },
    });
  } catch (err) {
    console.error("Chat error:", err.message);
    console.log("CLAUDE ERROR:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "AI service temporarily unavailable. Please try again.",
    });
  }
});

module.exports = router;
