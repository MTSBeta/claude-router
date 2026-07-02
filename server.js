const express = require("express");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ ROOT (health check)
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-router" });
});


// ========================================
// 1️⃣ REFINE OUTREACH (YOU ALREADY USE THIS)
// ========================================
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Rewrite this outreach message to sound human, natural, and not salesy.

Rules:
- Short
- No fluff
- No "I hope you're well"
- Slightly casual
- End with an easy question

Message:
${message}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "refine error" });
  }
});


// ========================================
// 2️⃣ CLASSIFY REPLIES (VERY IMPORTANT)
// ========================================
app.post("/classify", async (req, res) => {
  const { reply } = req.body;

  try {
    const prompt = `
Classify this reply into ONE category:

- interested
- objection
- not_now
- unsubscribe
- out_of_office

Also return a recommended next action.

Reply:
${reply}

Return JSON like:
{
  "type": "...",
  "action": "...",
  "tone": "..."
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "classify error" });
  }
});


// ========================================
// 3️⃣ SEQUENCE GENERATOR (FOLLOW UPS)
// ========================================
app.post("/sequence", async (req, res) => {
  const { first_message } = req.body;

  try {
    const prompt = `
Given this first outreach message, generate 3 follow-ups.

Rules:
- Each message must use a DIFFERENT angle
- No "just bumping"
- Natural tone
- Short

First message:
${first_message}

Return JSON:
{
  "step2": "...",
  "step3": "...",
  "step4": "..."
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      sequence: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "sequence error" });
  }
});


// ========================================
// 4️⃣ VARIANT GENERATION (A/B TEST)
// ========================================
app.post("/variants", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Create 3 DIFFERENT outreach versions:

1. Direct
2. Curious
3. Authority-based

Message:
${message}

Return JSON:
{
  "direct": "...",
  "curiosity": "...",
  "authority": "..."
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      variants: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "variants error" });
  }
});


// ========================================
// 5️⃣ SPAM CHECK
// ========================================
app.post("/spam-check", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Check this outreach message for spam risk.

Look for:
- spam words
- aggressive tone
- formatting issues

Message:
${message}

Return JSON:
{
  "risk": "low | medium | high",
  "issues": ["..."],
  "fixed": "clean version"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      result: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "spam error" });
  }
});


// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
