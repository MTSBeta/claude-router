const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

// ✅ ROOT
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-router" });
});


// ========================================
// 1️⃣ REFINE OUTREACH
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

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      error: "refine error",
      details: error.message
    });
  }
});


// ========================================
// 2️⃣ CLASSIFY
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

Reply:
${reply}

Return JSON:
{
  "type": "...",
  "action": "...",
  "tone": "..."
}
`;

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

    res.json({
      result: data.choices[0].message.content
    });

  } catch (error) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      error: "classify error",
      details: error.message
    });
  }
});


// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
