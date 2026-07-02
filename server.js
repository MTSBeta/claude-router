const express = require("express");
require("dotenv").config();

const OpenAI = require("openai");

// ✅ DEBUG (keep for now)
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);

const app = express();
app.use(express.json());

const PORT = 3000;

// ✅ OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Root route
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-router" });
});

// ✅ Chat route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: message }
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);
    res.status(500).json({ error: "OpenAI error" });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
