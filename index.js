const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const groqRequest = async (model, messages, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        { model, messages, max_tokens: 1024 },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          timeout: 30000,
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.response?.data || error.message);
      if (attempt === retries) throw error;
      // Wait 2 seconds before retrying
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

app.post("/api/ask", async (req, res) => {
  const { messages } = req.body;
  try {
    const text = await groqRequest("llama-3.3-70b-versatile", messages);
    res.json({ text });
  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);
    const status = error.response?.status;
    if (status === 429) {
      res.status(429).json({ error: "Rate limit reached. Please wait a moment and try again." });
    } else {
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  }
});

app.post("/api/ask-vision", async (req, res) => {
  const { messages } = req.body;
  try {
    const text = await groqRequest("meta-llama/llama-4-scout-17b-16e-instruct", messages);
    res.json({ text });
  } catch (error) {
    console.error("Vision Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

app.get("/", (req, res) => res.send("AI Doubt Solver Backend Running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep server alive
setInterval(() => {
  axios.get("https://ai-doubt-solver-backend.onrender.com")
    .then(() => console.log("Server kept alive!"))
    .catch(() => console.log("Ping failed"));
}, 14 * 60 * 1000);