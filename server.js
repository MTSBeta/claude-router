const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ========================================
// HELPER FUNCTION
// ========================================
async function callOpenAI(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// ========================================
// ROOT
// ========================================
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-outreach-system-v2" });
});

// ========================================
// 1. PERSONALIZE
// FIX: handle missing/non-array signals
// ========================================
app.post("/personalize", async (req, res) => {
  const { name, company, signals } = req.body;

  try {
    const signalsList = Array.isArray(signals) && signals.length > 0
      ? signals.join("\n")
      : (typeof signals === "string" && signals.length > 0 ? signals : "No specific signals provided");

    const prompt = `
Generate TWO outreach hooks using the signals.

Rules:
- Specific
- Natural
- No "I noticed"
- One direct, one curiosity-driven

Prospect: ${name || "Unknown"} at ${company || "Unknown"}
Signals:
${signalsList}

Return JSON:
{
  "primary": "...",
  "backup": "...",
  "confidence": 0-1
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "personalize error", details: error.message });
  }
});

// ========================================
// 2. REFINE
// ========================================
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Rewrite this outreach message.

Rules:
- Human
- Casual
- No fluff
- No "hope you're well"
- End with soft question

Message:
${message}

Return JSON:
{
  "message": "...",
  "confidence": 0-1
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "refine error", details: error.message });
  }
});

// ========================================
// 3. CLASSIFIER
// ========================================
app.post("/classify", async (req, res) => {
  const { reply } = req.body;

  try {
    const prompt = `
Classify this reply.

Categories:
- interested
- objection
- not_now
- unsubscribe
- out_of_office
- unclear

Reply:
${reply}

Return JSON:
{
  "type": "...",
  "confidence": 0-1,
  "next_step": "reply | sequence | stop | review",
  "notes": "short reasoning"
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "classify error", details: error.message });
  }
});

// ========================================
// 4. SEQUENCE
// ========================================
app.post("/sequence", async (req, res) => {
  const { original_message, reply_type, touch_number } = req.body;

  try {
    const prompt = `
Generate follow-ups.

Context:
- Original: ${original_message}
- Reply type: ${reply_type}
- Touch #: ${touch_number}

Rules:
- Each message different angle
- No "just checking in"
- Short

Return JSON:
{
  "step2": "...",
  "step3": "...",
  "step4": "...",
  "confidence": 0-1
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "sequence error", details: error.message });
  }
});

// ========================================
// 5. VARIANTS
// ========================================
app.post("/variants", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Generate 3 outreach variants:

- Direct
- Curious
- Authority

Return JSON:
{
  "direct": "...",
  "curiosity": "...",
  "authority": "...",
  "confidence": 0-1
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "variants error", details: error.message });
  }
});

// ========================================
// 6. SPAM CHECK
// ========================================
app.post("/spam-check", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Check for spam risk.

Return JSON:
{
  "risk": "low | medium | high",
  "issues": ["..."],
  "fixed": "...",
  "confidence": 0-1
}

Message:
${message}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "spam error", details: error.message });
  }
});

// ========================================
// 7. VOICE CHECK
// FIX: handle missing/non-array examples
// ========================================
app.post("/voice-check", async (req, res) => {
  const { message, examples } = req.body;

  try {
    const examplesList = Array.isArray(examples) && examples.length > 0
      ? examples.join("\n\n")
      : "Professional, warm, conversational. Not salesy. Direct and human. Short sentences.";

    const prompt = `
Match tone to examples.

Examples:
${examplesList}

Message:
${message}

Return JSON:
{
  "score": 1-10,
  "fixed": "...",
  "confidence": 0-1
}
`;

    const result = await callOpenAI(prompt);
    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: "voice error", details: error.message });
  }
});

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
