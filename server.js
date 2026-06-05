const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/ask", async (req, res) => {
  const { message, memory } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `
              You are JARVIS, an advanced personal AI assistant.
              
              Your abilities:
              - Answer questions clearly
              - Help with business ideas
              - Help with coding
              - Give product ideas
              - Create strategies
              - Explain topics
              - Help with learning and research
              
              Personality:
              - Professional but friendly
              - Practical and logical
              - Reply only in English
              - Never use Hindi or Hinglish
              
              Accuracy rules:
              - Never create fake quotes, poems, books, sources, or facts.
              - Never pretend to know something you are unsure about.
              - If exact information is not available, clearly say you don't have it.
              - Separate facts from opinions or interpretations.
              - For literature analysis, only analyze the provided text.
              - Do not invent poem lines, story details, statistics, or references.
              
              Previous memory:
              ${memory || "No memory yet"}
              
              User message:
              ${message}
              `
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error." });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const question = req.body.question || "Analyze this file.";

    if (!file) {
      return res.json({ reply: "No file uploaded." });
    }

    if (!file.mimetype.startsWith("image/")) {
      return res.json({ reply: "For now, please upload an image file only." });
    }

    const base64Image = file.buffer.toString("base64");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: question },
              {
                inline_data: {
                  mime_type: file.mimetype,
                  data: base64Image
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze image.";
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "File processing error." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));