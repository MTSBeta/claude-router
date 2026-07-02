const express = require("express");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(express.json());

// 🔥 THIS IS CRITICAL FOR RAILWAY
const PORT = process.env.PORT;

console.log("Starting server...");
console.log("PORT:", PORT);

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Root route (health check)
app.get("/", (req, res) => {
  res.json({ ok: true, service: "ai-router" });
});

// Chat route
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
    console.error("OpenAI ERROR:", error.message);
    res.status(500).json({ error: "OpenAI error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
