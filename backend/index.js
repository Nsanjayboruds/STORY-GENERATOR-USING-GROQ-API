const fetch = require('node-fetch'); // ✅ Correct for CommonJS
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Replicate = require("replicate");
// ✅ Top-level declaration
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});


const User = require("./model/User");

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "https://story-generator-using-groq-api-yral.vercel.app/", // frontend URL
  credentials: true
}));
app.use(express.json()); // ✅ Required to parse JSON body

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Signup route
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Groq AI call
const groqRequest = async (prompt, model = "llama3-8b-8192") => {
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Groq API error");
  }

  return response.json();
};

// ✅ AI route
app.post("/api/ai", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const data = await groqRequest(prompt, model);
    res.json({
      response: data.choices[0].message.content,
      usage: data.usage
    });
  } catch (err) {
    console.error("AI Error:", {
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    res.status(500).json({
      error: "AI Processing Failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// ✅ AI Image Generation via Replicate SDXL
// ✅ AI Image Generation route
app.post("/api/image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Hugging Face API error:", errText);
      return res.status(500).json({ error: "Hugging Face API error", details: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:image/png;base64,${base64}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: "Image generation failed", details: error.message });
  }
});







// ✅ Default route
app.get("/", (req, res) => {
  res.send("🎉 Ai-Craft backend is running");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
