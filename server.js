const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ========================================
// 🔧 HELPER FUNCTION (OpenAI call)
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
// ✅ ROOT
// ========================================
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-outreach-system" });
});


// ========================================
// 1️⃣ SIGNAL-BASED PERSONALIZATION
// ========================================
app.post("/personalize", async (req, res) => {
  const { name, company, signals } = req.body;

  try {
    const prompt = `
You are writing a hyper-specific outreach hook.

Use the signals to create ONE sharp, natural opening line.
Avoid generic phrases like "I noticed..."

Prospect: ${name} at ${company}
Signals:
${signals.join("\n")}

Output only the hook.
`;

    const reply = await callOpenAI(prompt);

    res.json({ hook: reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "personalize error", details: error.message });
  }
});


// ========================================
// 2️⃣ REFINE OUTREACH
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

    const reply = await callOpenAI(prompt);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "refine error", details: error.message });
  }
});


// ========================================
// 3️⃣ REPLY CLASSIFIER
// ========================================
app.post("/classify", async (req, res) => {
  const { reply } = req.body;

  try {
    const prompt = `
Classify this reply into ONE:

- interested
- objection
- not_now
- unsubscribe
- out_of_office

Also include:
- tone
- recommended next action

Reply:
${reply}

Return JSON only.
`;

    const result = await callOpenAI(prompt);

    res.json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "classify error", details: error.message });
  }
});


// ========================================
// 4️⃣ SEQUENCE GENERATOR
// ========================================
app.post("/sequence", async (req, res) => {
  const { first_message } = req.body;

  try {
    const prompt = `
Generate 3 follow-ups for this outreach.

Rules:
- Each message = different angle
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

    const sequence = await callOpenAI(prompt);

    res.json({ sequence });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "sequence error", details: error.message });
  }
});


// ========================================
// 5️⃣ VARIANT GENERATION
// ========================================
app.post("/variants", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Create 3 structurally different outreach versions:

1. Direct
2. Curious
3. Authority-based

Message:
${message}

Return JSON.
`;

    const variants = await callOpenAI(prompt);

    res.json({ variants });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "variants error", details: error.message });
  }
});


// ========================================
// 6️⃣ SPAM CHECK
// ========================================
app.post("/spam-check", async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = `
Check this message for spam risk.

Return:
- risk (low/medium/high)
- issues
- improved version

Message:
${message}

Return JSON.
`;

    const result = await callOpenAI(prompt);

    res.json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "spam error", details: error.message });
  }
});


// ========================================
// 7️⃣ VOICE / BRAND CONSISTENCY
// ========================================
app.post("/voice-check", async (req, res) => {
  const { message, examples } = req.body;

  try {
    const prompt = `
Match this message to the tone of these examples.

Examples:
${examples.join("\n\n")}

Message:
${message}

Return:
- score (1-10)
- improved version matching tone
`;

    const result = await callOpenAI(prompt);

    res.json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "voice error", details: error.message });
  }
});


// ========================================
// 🚀 START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
