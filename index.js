const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/ask", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: messages,
        max_tokens: 1024,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );
    res.json({ text: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Groq Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/api/ask-vision", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: messages,
        max_tokens: 1024,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );
    res.json({ text: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Vision Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/", (req, res) => res.send("AI Doubt Solver Backend Running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep server alive - ping every 14 minutes
setInterval(() => {
  axios.get("https://ai-doubt-solver-backend.onrender.com")
    .then(() => console.log("Server kept alive!"))
    .catch(() => console.log("Ping failed"));
}, 14 * 60 * 1000);