const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

// 🔑 Your Gemini API key
const API_KEY = process.env.GEMINI_API_KEY;

// 🌐 Serve frontend (index.html)
app.get("/", (req, res) => {
  console.log("Serving index.html...");
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🤖 AI Route
app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{
                text: "You are a smart AI assistant like Jarvis. Be helpful, short, and friendly. Reply in Hinglish. " + userMessage
              }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("Gemini Response:", data);

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI";

    res.json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ reply: "Error connecting to Gemini" });
  }
});

// 🚀 Start server (ONLY ONCE)
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});