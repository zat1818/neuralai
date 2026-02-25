import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import pg from "pg";
const { Pool } = pg;
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { sendEmail } from './src/utils/email';
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "neural_secret_fallback";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "neural_admin_secret_2025";

// Single Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
});

// Alias untuk backward compatibility (akan dihapus bertahap)
const pool1 = pool;
const pool2 = pool;

// AI Signal Generator
const SIGNAL_PROMPT = (pair: string, mode: string, rr: number, tpCount: number) => {
  const tpFields = Array.from({ length: tpCount }, (_, i) => 
    `  "tp${i + 1}": "take profit ${i + 1} price"`
  ).join(',\n');

  const tpExample = Array.from({ length: tpCount }, (_, i) => {
    const base = 1.08450;
    const step = 0.00250 * (i + 1);
    return `  "tp${i + 1}": "${(base + step).toFixed(5)}"`;
  }).join(',\n');

  return `You are an expert trading analyst using Smart Money Concepts (SMC) and ICT methodology.
Analyze the ${pair} trading pair for a ${mode} strategy.

REQUIREMENTS:
- Risk:Reward ratio: minimum 1:${rr} (each TP must respect this ratio)
- Number of Take Profit levels: exactly ${tpCount}
- Timeframe: ${mode === 'scalping' ? '1-15 minute' : mode === 'intraday' ? '1-4 hour' : 'Daily'}

Provide a trading signal in the following EXACT JSON format (no markdown, no extra text, no code blocks):
{
  "direction": "BUY",
  "entry": "1.08450 - 1.08500",
  "sl": "1.08200",
${tpExample},
  "rr": "1:${rr}",
  "confidence": "82%",
  "reasoning": "detailed 2-3 sentence analysis explaining the SMC/ICT setup, key levels, and market structure"
}

Base your analysis on:
- Current market structure (BOS/CHoCH)
- Order blocks and fair value gaps
- Liquidity levels (buy/sell side)
- Each TP level should be at a key liquidity/resistance level
- TP${tpCount} should achieve at least 1:${rr} risk/reward ratio
- Confidence based on confluence of signals (50-95%)
`;
};

async function generateSignalWithAI(provider: string, model: string, apiKey: string, pair: string, mode: string, rr: number = 2, tpCount: number = 2): Promise<any> {
  const prompt = SIGNAL_PROMPT(pair, mode, rr, tpCount);
  let rawText = '';

  try {
    if (provider === 'gemini') {
      const genai = new GoogleGenAI({ apiKey });
      const response = await genai.models.generateContent({
        model: model || 'gemini-1.5-flash',
        contents: prompt,
      });
      rawText = response.text || '';
    } else if (provider === 'anthropic') {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: model || 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      rawText = (message.content[0] as any).text || '';
    } else if (provider === 'groq') {
      const client = new Groq({ apiKey });
      const completion = await client.chat.completions.create({
        model: model || 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'openai') {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'mistral') {
      // Mistral uses OpenAI-compatible API
      const client = new OpenAI({ apiKey, baseURL: 'https://api.mistral.ai/v1' });
      const completion = await client.chat.completions.create({
        model: model || 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'xai') {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });
      const completion = await client.chat.completions.create({
        model: model || 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'together') {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.together.xyz/v1' });
      const completion = await client.chat.completions.create({
        model: model || 'meta-llama/Llama-3-70b-chat-hf',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'cohere') {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.cohere.ai/compatibility/v1' });
      const completion = await client.chat.completions.create({
        model: model || 'command-r-plus',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else if (provider === 'perplexity') {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.perplexity.ai' });
      const completion = await client.chat.completions.create({
        model: model || 'llama-3.1-sonar-small-128k-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
      });
      rawText = completion.choices[0]?.message?.content || '';
    } else {
      throw new Error(`Provider '${provider}' tidak didukung`);
    }

    // Parse JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI tidak mengembalikan format JSON yang valid');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required fields (tp1 is always required, others depend on tpCount)
    const required = ['direction', 'entry', 'sl', 'tp1', 'confidence', 'reasoning'];
    for (const field of required) {
      if (!parsed[field]) throw new Error(`Field '${field}' tidak ada dalam respons AI`);
    }
    
    // Validate TP fields based on tpCount
    for (let i = 1; i <= tpCount; i++) {
      if (!parsed[`tp${i}`]) {
        // If AI didn't provide enough TPs, generate them based on tp1
        if (i > 1 && parsed[`tp${i - 1}`]) {
          // Estimate next TP (not ideal but fallback)
          parsed[`tp${i}`] = parsed[`tp${i - 1}`];
        }
      }
    }
    
    // Normalize direction
    parsed.direction = parsed.direction.toUpperCase();
    if (!['BUY', 'SELL'].includes(parsed.direction)) {
      throw new Error('Direction harus BUY atau SELL');
    }
    
    // Set rr if not provided by AI
    if (!parsed.rr) {
      parsed.rr = `1:${rr}`;
    }
    
    return parsed;
  } catch (err: any) {
    throw new Error(`Gagal generate sinyal dari ${provider}: ${err.message}`);
  }
}

// Initialize Tables
async function initDB() {
  // Single DB: all tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'unverified',
      banned BOOLEAN DEFAULT FALSE,
      bannedReason TEXT,
      bannedAt TIMESTAMP,
      otp TEXT,
      bio TEXT,
      avatar TEXT,
      preferences TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bannedReason TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bannedAt TIMESTAMP;

    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      userId TEXT,
      provider TEXT,
      key TEXT,
      model TEXT,
      status TEXT DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(userId, provider)
    );

    CREATE TABLE IF NOT EXISTS usage_logs (
      id SERIAL PRIMARY KEY,
      userId TEXT,
      action TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY,
      theme TEXT,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // DB 2: signals, forum_posts, forum_comments, forum_tags, forum_likes, notifications
  await pool2.query(`
    CREATE TABLE IF NOT EXISTS signals (
      id TEXT PRIMARY KEY,
      userId TEXT,
      pair TEXT,
      mode TEXT,
      direction TEXT,
      entry TEXT,
      sl TEXT,
      tp1 TEXT,
      tp2 TEXT,
      tp3 TEXT,
      tp4 TEXT,
      rr TEXT,
      tpCount INTEGER DEFAULT 2,
      confidence TEXT,
      reasoning TEXT,
      provider TEXT,
      model TEXT,
      result TEXT DEFAULT 'PENDING',
      pnl TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE signals ADD COLUMN IF NOT EXISTS tp3 TEXT;
    ALTER TABLE signals ADD COLUMN IF NOT EXISTS tp4 TEXT;
    ALTER TABLE signals ADD COLUMN IF NOT EXISTS rr TEXT;
    ALTER TABLE signals ADD COLUMN IF NOT EXISTS tpCount INTEGER DEFAULT 2;

    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      title TEXT,
      content TEXT,
      category TEXT,
      tags TEXT,
      likes INTEGER DEFAULT 0,
      commentsCount INTEGER DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forum_comments (
      id TEXT PRIMARY KEY,
      postId TEXT,
      userId TEXT,
      content TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS forum_likes (
      userId TEXT,
      postId TEXT,
      PRIMARY KEY(userId, postId)
    );

    CREATE TABLE IF NOT EXISTS forum_tags (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT,
      type TEXT,
      text TEXT,
      isRead INTEGER DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bug_reports (
      id TEXT PRIMARY KEY,
      userId TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open',
      adminNote TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Database initialized");
}

async function startServer() {
  await initDB();
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  const PORT = 3000;

  app.use(express.json());

  // Middleware: Auth
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak valid." });
    
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Cek status banned dari database
      const userResult = await pool.query(
        "SELECT banned, bannedReason FROM users WHERE id = $1",
        [decoded.id]
      );
      const user = userResult.rows[0];
      
      if (user?.banned) {
        return res.status(403).json({ 
          message: "Akun Anda telah dibanned.", 
          reason: user.bannedReason || "Pelanggaran kebijakan",
          banned: true 
        });
      }
      
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token tidak valid." });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Akses ditolak." });
    next();
  };

  // --- Public Data Routes ---
  app.get("/api/public/news-ticker", (req, res) => {
    res.json([
      { category: "GOLD", text: "XAUUSD mitigates H1 Order Block at $2025. Neural Core predicts 87% bullish continuation." },
      { category: "CRYPTO", text: "BTC Liquidity sweep at $52,000 confirmed. AI sentiment shifts to neutral-bullish." },
      { category: "FOREX", text: "EURUSD Bearish divergence on H4. Target liquidity at 1.0750." },
      { category: "STOCKS", text: "NVDA: Neural analysis shows institutional accumulation before earnings report." },
      { category: "GOLD", text: "XAUUSD mitigates H1 Order Block at $2025. Neural Core predicts 87% bullish continuation." },
      { category: "CRYPTO", text: "BTC Liquidity sweep at $52,000 confirmed. AI sentiment shifts to neutral-bullish." },
    ]);
  });

  app.get("/api/public/market-broadcast", (req, res) => {
    res.json({
      mainNews: {
        category: "GOLD",
        title: "XAUUSD BREAKOUT: NEURAL MODELS PREDICT BULLISH MOMENTUM",
        description: "Analisis SMC menunjukkan akumulasi besar di zona $2020. AI memprediksi target $2050 dalam 24 jam ke depan.",
        imageUrl: "/images/market-broadcast-placeholder.jpg",
        time: "1h ago",
      },
      smallNews: [
        { category: "CRYPTO", title: "BTC Halving Sentiment Analysis", time: "2h ago" },
        { category: "FOREX", title: "EURUSD Liquidity Grab Detected", time: "4h ago" },
        { category: "STOCKS", title: "NVDA Earnings: AI Impact Report", time: "6h ago" },
        { category: "GOLD", title: "DXY Correlation Shift Alert", time: "8h ago" },
      ],
    });
  });

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    const { username, email, password } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substring(2, 15);

    try {
      await pool1.query(
        "INSERT INTO users (id, username, email, password, otp) VALUES ($1, $2, $3, $4, $5)",
        [id, username, email, hashedPassword, otp]
      );
      
      console.log(`OTP for ${email}: ${otp}`);
      await sendEmail(email, 'NeuralAI Verification Code', `Your verification code is: ${otp}`);
      res.json({ message: "OTP sent to email" });
    } catch (err: any) {
      res.status(400).json({ message: err.message.includes('unique') ? "Username atau Email sudah terdaftar" : "Registration failed" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const result = await pool1.query("SELECT * FROM users WHERE email = $1 AND otp = $2", [email, otp]);
    const user = result.rows[0];
    
    if (!user) return res.status(400).json({ message: "OTP salah atau tidak valid" });

    await pool1.query("UPDATE users SET status = 'verified', otp = NULL WHERE id = $1", [user.id]);
    
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await pool1.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Email atau Password salah" });
    }

    if (user.status !== 'verified') {
      return res.status(403).json({ message: "Akun belum diverifikasi" });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, bio: user.bio, avatar: user.avatar } });
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await pool1.query("UPDATE users SET otp = $1 WHERE email = $2", [otp, email]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Email tidak ditemukan" });
    console.log(`New OTP for ${email}: ${otp}`);
    await sendEmail(email, 'NeuralAI New Verification Code', `Your new verification code is: ${otp}`);
    res.json({ message: "OTP resent" });
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const result = await pool1.query("SELECT id, username, email, role, bio, avatar, preferences FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  });

  // --- User Routes ---
  app.put("/api/user/apikey", authenticate, async (req: any, res) => {
    const { provider, key, model } = req.body;
    await pool1.query(
      "INSERT INTO api_keys (userId, provider, key, model) VALUES ($1, $2, $3, $4) ON CONFLICT (userId, provider) DO UPDATE SET key = EXCLUDED.key, model = EXCLUDED.model",
      [req.user.id, provider, key, model]
    );
    io.to(req.user.id).emit('apikey:update', { provider, model, status: 'active' });
    res.json({ message: "API Key saved" });
  });

  app.get("/api/user/apikey", authenticate, async (req: any, res) => {
    try {
      const result = await pool1.query("SELECT provider, model, status FROM api_keys WHERE userId = $1", [req.user.id]);
      res.json(result.rows || []);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil API Key" });
    }
  });

  app.post("/api/user/apikey/test", authenticate, async (req: any, res) => {
    const { provider } = req.body;
    const result = await pool1.query("SELECT key FROM api_keys WHERE userId = $1 AND provider = $2", [req.user.id, provider]);
    const apiKey = result.rows[0]?.key;

    if (apiKey) {
      // In a real app, you'd make an actual API call to the provider to validate the key.
      // For now, we'll just check if it's not empty.
      res.json({ valid: true, message: "API Key valid" });
    } else {
      res.status(404).json({ valid: false, message: "API Key not found" });
    }
  });

  app.delete("/api/user/apikey/:provider", authenticate, async (req: any, res) => {
    const { provider } = req.params;
    await pool1.query("DELETE FROM api_keys WHERE userId = $1 AND provider = $2", [req.user.id, provider]);
    io.to(req.user.id).emit('apikey:delete', { provider });
    res.json({ message: "API Key deleted" });
  });

  app.get("/api/user/usage", authenticate, async (req: any, res) => {
    res.json({ dailySignals: 5, dailyLimit: 100 });
  });

  app.put("/api/user/profile", authenticate, async (req: any, res) => {
    const { bio, avatar } = req.body;
    await pool1.query("UPDATE users SET bio = $1, avatar = $2 WHERE id = $3", [bio, avatar, req.user.id]);
    const result = await pool1.query("SELECT id, username, email, role, bio, avatar FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  });

  app.put("/api/user/settings", authenticate, async (req: any, res) => {
    const { theme } = req.body;
    await pool1.query("UPDATE users SET preferences = $1 WHERE id = $2", [JSON.stringify({ theme }), req.user.id]);
    res.json({ message: "Settings updated" });
  });

  // --- Signal Routes ---
  app.post("/api/signal/generate", authenticate, async (req: any, res) => {
    const { pair, mode, provider, model, rr = 2, tpCount = 2 } = req.body;

    if (!pair || !mode || !provider) {
      return res.status(400).json({ message: "pair, mode, dan provider wajib diisi" });
    }

    const rrNum = Math.max(1, Math.min(10, parseInt(rr) || 2));
    const tpCountNum = Math.max(1, Math.min(4, parseInt(tpCount) || 2));

    // Ambil API key user untuk provider yang dipilih
    const keyResult = await pool1.query(
      "SELECT key FROM api_keys WHERE userId = $1 AND provider = $2",
      [req.user.id, provider]
    );
    const apiKey = keyResult.rows[0]?.key;

    if (!apiKey) {
      return res.status(400).json({ 
        message: `API Key untuk provider '${provider}' belum dikonfigurasi. Silakan tambahkan di halaman API Keys.` 
      });
    }

    try {
      // Generate sinyal menggunakan AI yang sebenarnya
      const aiResult = await generateSignalWithAI(provider, model, apiKey, pair, mode, rrNum, tpCountNum);
      
      const id = "SIG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const signal: any = {
        id,
        userId: req.user.id,
        pair,
        mode,
        direction: aiResult.direction,
        entry: aiResult.entry,
        sl: aiResult.sl,
        tp1: aiResult.tp1,
        tp2: aiResult.tp2 || null,
        tp3: aiResult.tp3 || null,
        tp4: aiResult.tp4 || null,
        rr: aiResult.rr || `1:${rrNum}`,
        tpCount: tpCountNum,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
        provider,
        model: model || ''
      };

      await pool2.query(`
        INSERT INTO signals (id, userId, pair, mode, direction, entry, sl, tp1, tp2, tp3, tp4, rr, tpCount, confidence, reasoning, provider, model)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        signal.id, signal.userId, signal.pair, signal.mode, signal.direction,
        signal.entry, signal.sl, signal.tp1, signal.tp2, signal.tp3, signal.tp4,
        signal.rr, signal.tpCount, signal.confidence, signal.reasoning,
        signal.provider, signal.model
      ]);

      // Log usage
      await pool1.query(
        "INSERT INTO usage_logs (userId, action) VALUES ($1, $2)",
        [req.user.id, `signal:generate:${provider}:${pair}`]
      );

      io.to(req.user.id).emit('signal:new', signal);
      res.json(signal);
    } catch (err: any) {
      console.error('Signal generation error:', err.message);
      res.status(500).json({ message: err.message || "Gagal generate sinyal" });
    }
  });

  app.get("/api/signal/history", authenticate, async (req: any, res) => {
    try {
      const result = await pool2.query("SELECT * FROM signals WHERE userId = $1 ORDER BY createdAt DESC", [req.user.id]);
      res.json(result.rows || []);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil riwayat sinyal" });
    }
  });

  app.get("/api/signal/:id", authenticate, async (req: any, res) => {
    try {
      const result = await pool2.query("SELECT * FROM signals WHERE id = $1 AND userId = $2", [req.params.id, req.user.id]);
      if (!result.rows[0]) return res.status(404).json({ message: "Signal not found" });
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil sinyal" });
    }
  });

  app.patch("/api/signal/:id/result", authenticate, async (req: any, res) => {
    const { result, pnl } = req.body;
    try {
      await pool2.query("UPDATE signals SET result = $1, pnl = $2 WHERE id = $3 AND userId = $4", [result, pnl, req.params.id, req.user.id]);
      const updated = await pool2.query("SELECT * FROM signals WHERE id = $1", [req.params.id]);
      res.json(updated.rows[0]);
    } catch (err) {
      res.status(500).json({ message: "Gagal memperbarui hasil sinyal" });
    }
  });

  app.get("/api/models", authenticate, (req, res) => {
    const { provider } = req.query;
    const models: { id: string; name: string; provider: string }[] = [
      // OpenAI
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
      // Anthropic
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
      // Gemini
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'gemini' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini' },
      // Groq
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq' },
      // Mistral
      { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'mistral' },
      { id: 'mistral-small-latest', name: 'Mistral Small', provider: 'mistral' },
      { id: 'codestral-latest', name: 'Codestral', provider: 'mistral' },
      // xAI
      { id: 'grok-beta', name: 'Grok Beta', provider: 'xai' },
      { id: 'grok-2-latest', name: 'Grok 2', provider: 'xai' },
      // Together AI
      { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B', provider: 'together' },
      { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', provider: 'together' },
      // Cohere
      { id: 'command-r-plus', name: 'Command R+', provider: 'cohere' },
      { id: 'command-r', name: 'Command R', provider: 'cohere' },
      // Perplexity
      { id: 'llama-3.1-sonar-large-128k-online', name: 'Sonar Large (Online)', provider: 'perplexity' },
      { id: 'llama-3.1-sonar-small-128k-online', name: 'Sonar Small (Online)', provider: 'perplexity' },
    ];
    
    if (provider) {
      res.json(models.filter(m => m.provider === provider));
    } else {
      res.json(models);
    }
  });

  // --- Forum Routes ---
  app.get("/api/forum/posts", async (req, res) => {
    // This is tricky because users are in pool1 and posts are in pool2.
    // We'll fetch posts first, then fetch user info.
    const postsResult = await pool2.query("SELECT * FROM forum_posts ORDER BY createdAt DESC");
    const posts = postsResult.rows;
    
    if (posts.length === 0) return res.json([]);

    const userIds = [...new Set(posts.map(p => p.userid))];
    const usersResult = await pool1.query("SELECT id, username FROM users WHERE id = ANY($1)", [userIds]);
    const userMap = usersResult.rows.reduce((acc: any, u: any) => {
      acc[u.id] = u.username;
      return acc;
    }, {});

    const enrichedPosts = posts.map(p => ({
      ...p,
      author: userMap[p.userid] || 'Unknown'
    }));

    res.json(enrichedPosts);
  });

  app.post("/api/forum/posts", authenticate, async (req: any, res) => {
    const { title, content, category, tags } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    await pool2.query(
      "INSERT INTO forum_posts (id, userId, title, content, category, tags) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, req.user.id, title, content, category, JSON.stringify(tags || [])]
    );
    
    const postResult = await pool2.query("SELECT * FROM forum_posts WHERE id = $1", [id]);
    const post = postResult.rows[0];
    post.author = req.user.username;

    io.emit('forum:post:new', post);
    res.json(post);
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    const postResult = await pool2.query("SELECT * FROM forum_posts WHERE id = $1", [req.params.id]);
    const post = postResult.rows[0];
    if (!post) return res.status(404).json({ message: "Post not found" });

    const authorResult = await pool1.query("SELECT username FROM users WHERE id = $1", [post.userid]);
    post.author = authorResult.rows[0]?.username || 'Unknown';

    const commentsResult = await pool2.query("SELECT * FROM forum_comments WHERE postId = $1 ORDER BY createdAt ASC", [req.params.id]);
    const comments = commentsResult.rows;

    if (comments.length > 0) {
      const commenterIds = [...new Set(comments.map(c => c.userid))];
      const commentersResult = await pool1.query("SELECT id, username FROM users WHERE id = ANY($1)", [commenterIds]);
      const commenterMap = commentersResult.rows.reduce((acc: any, u: any) => {
        acc[u.id] = u.username;
        return acc;
      }, {});

      post.comments = comments.map(c => ({
        ...c,
        author: commenterMap[c.userid] || 'Unknown'
      }));
    } else {
      post.comments = [];
    }

    res.json(post);
  });

  app.delete("/api/forum/posts/:id", authenticate, async (req: any, res) => {
    try {
      const postResult = await pool2.query("SELECT * FROM forum_posts WHERE id = $1", [req.params.id]);
      const post = postResult.rows[0];
      if (!post) return res.status(404).json({ message: "Post not found" });
      
      // Allow admin or post owner to delete
      if (post.userid !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak" });
      }
      
      await pool2.query("DELETE FROM forum_comments WHERE postId = $1", [req.params.id]);
      await pool2.query("DELETE FROM forum_likes WHERE postId = $1", [req.params.id]);
      await pool2.query("DELETE FROM forum_posts WHERE id = $1", [req.params.id]);
      
      io.emit('forum:post:delete', { postId: req.params.id });
      res.json({ message: "Post deleted" });
    } catch (err) {
      res.status(500).json({ message: "Gagal menghapus post" });
    }
  });

  app.post("/api/forum/posts/:id/comments", authenticate, async (req: any, res) => {
    const { content } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    
    await pool2.query(
      "INSERT INTO forum_comments (id, postId, userId, content) VALUES ($1, $2, $3, $4)",
      [id, req.params.id, req.user.id, content]
    );
    
    await pool2.query("UPDATE forum_posts SET commentsCount = commentsCount + 1 WHERE id = $1", [req.params.id]);
    
    const commentResult = await pool2.query("SELECT * FROM forum_comments WHERE id = $1", [id]);
    const comment = commentResult.rows[0];
    comment.author = req.user.username;

    io.emit('forum:post:comment', { postId: req.params.id, comment });
    res.json(comment);
  });

  app.get("/api/forum/leaderboard", async (req, res) => {
    const postsCountResult = await pool2.query(`
      SELECT userId, COUNT(id) as postsCount 
      FROM forum_posts 
      GROUP BY userId 
      ORDER BY postsCount DESC 
      LIMIT 10
    `);
    const counts = postsCountResult.rows;

    if (counts.length === 0) return res.json([]);

    const userIds = counts.map(c => c.userid);
    const usersResult = await pool1.query("SELECT id, username FROM users WHERE id = ANY($1)", [userIds]);
    const userMap = usersResult.rows.reduce((acc: any, u: any) => {
      acc[u.id] = u.username;
      return acc;
    }, {});

    const leaderboard = counts.map(c => ({
      username: userMap[c.userid] || 'Unknown',
      postsCount: parseInt(c.postscount)
    }));

    res.json(leaderboard);
  });

  app.get("/api/forum/search/users", authenticate, async (req: any, res) => {
    const { q } = req.query;
    const result = await pool1.query("SELECT username FROM users WHERE username ILIKE $1 LIMIT 5", [`%${q}%`]);
    res.json(result.rows);
  });

  app.post("/api/forum/posts/:id/like", authenticate, async (req: any, res) => {
    try {
      await pool2.query("INSERT INTO forum_likes (userId, postId) VALUES ($1, $2)", [req.user.id, req.params.id]);
      await pool2.query("UPDATE forum_posts SET likes = likes + 1 WHERE id = $1", [req.params.id]);
      const result = await pool2.query("SELECT likes FROM forum_posts WHERE id = $1", [req.params.id]);
      const post = result.rows[0];
      io.emit('forum:post:like', { postId: req.params.id, likes: post.likes });
      res.json({ likes: post.likes });
    } catch (err) {
      res.status(400).json({ message: "Already liked" });
    }
  });

  app.delete("/api/forum/posts/:id/like", authenticate, async (req: any, res) => {
    const result = await pool2.query("DELETE FROM forum_likes WHERE userId = $1 AND postId = $2", [req.user.id, req.params.id]);
    if (result.rowCount && result.rowCount > 0) {
      await pool2.query("UPDATE forum_posts SET likes = likes - 1 WHERE id = $1", [req.params.id]);
    }
    const postResult = await pool2.query("SELECT likes FROM forum_posts WHERE id = $1", [req.params.id]);
    const post = postResult.rows[0];
    io.emit('forum:post:like', { postId: req.params.id, likes: post.likes });
    res.json({ likes: post.likes });
  });

  // --- Admin Routes ---
  app.post("/api/admin/bootstrap", async (req, res) => {
    const { secret, username, email, password } = req.body;
    if (secret !== ADMIN_SECRET) return res.status(403).json({ message: "Invalid secret" });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = "ADMIN-" + Math.random().toString(36).substring(2, 10);

    try {
      await pool1.query(
        "INSERT INTO users (id, username, email, password, role, status) VALUES ($1, $2, $3, $4, 'admin', 'verified')",
        [id, username, email, hashedPassword]
      );
      res.json({ message: "Admin bootstrapped successfully" });
    } catch (err: any) {
      res.status(400).json({ message: "Admin already exists or error: " + err.message });
    }
  });

  app.get("/api/admin/dashboard", authenticate, isAdmin, async (req, res) => {
    const usersCount = await pool1.query("SELECT COUNT(*) as count FROM users");
    const signalsCount = await pool2.query("SELECT COUNT(*) as count FROM signals");
    const postsCount = await pool2.query("SELECT COUNT(*) as count FROM forum_posts");
    
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalSignals: parseInt(signalsCount.rows[0].count),
      totalPosts: parseInt(postsCount.rows[0].count),
      newUsersToday: 5,
      signalsToday: 12,
      postsToday: 3
    });
  });

  app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
    const result = await pool1.query("SELECT id, username, email, role, status, createdat FROM users");
    res.json(result.rows);
  });

  // --- Notifications ---
  app.get("/api/notifications", authenticate, async (req: any, res) => {
    try {
      const result = await pool2.query("SELECT * FROM notifications WHERE userId = $1 ORDER BY createdAt DESC", [req.user.id]);
      res.json(result.rows || []);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil notifikasi" });
    }
  });

  app.get("/api/notifications/count", authenticate, async (req: any, res) => {
    const result = await pool2.query("SELECT COUNT(*) as count FROM notifications WHERE userId = $1 AND isRead = 0", [req.user.id]);
    res.json({ count: parseInt(result.rows[0].count) });
  });

  app.patch("/api/notifications/read-all", authenticate, async (req: any, res) => {
    await pool2.query("UPDATE notifications SET isRead = 1 WHERE userId = $1", [req.user.id]);
    res.json({ message: "All marked as read" });
  });

  app.patch("/api/notifications/:id/read", authenticate, async (req: any, res) => {
    await pool2.query("UPDATE notifications SET isRead = 1 WHERE id = $1 AND userId = $2", [req.params.id, req.user.id]);
    res.json({ message: "Marked as read" });
  });

  app.delete("/api/notifications/:id", authenticate, async (req: any, res) => {
    await pool2.query("DELETE FROM notifications WHERE id = $1 AND userId = $2", [req.params.id, req.user.id]);
    res.json({ message: "Notification deleted" });
  });

  app.delete("/api/notifications", authenticate, async (req: any, res) => {
    await pool2.query("DELETE FROM notifications WHERE userId = $1", [req.user.id]);
    res.json({ message: "All notifications deleted" });
  });

  // --- Admin Extended Routes ---
  app.get("/api/admin/users/:id", authenticate, isAdmin, async (req, res) => {
    const result = await pool1.query("SELECT id, username, email, role, status, createdAt FROM users WHERE id = $1", [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  });

  app.patch("/api/admin/users/:id/role", authenticate, isAdmin, async (req: any, res) => {
    const { role } = req.body;
    await pool1.query("UPDATE users SET role = $1 WHERE id = $2", [role, req.params.id]);
    res.json({ message: "Role updated" });
  });

  app.patch("/api/admin/users/:id/verify", authenticate, isAdmin, async (req: any, res) => {
    await pool1.query("UPDATE users SET status = 'verified' WHERE id = $1", [req.params.id]);
    res.json({ message: "User verified" });
  });

  app.delete("/api/admin/users/:id", authenticate, isAdmin, async (req: any, res) => {
    await pool1.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "User deleted" });
  });

  app.get("/api/admin/signals", authenticate, isAdmin, async (req, res) => {
    try {
      const result = await pool2.query("SELECT * FROM signals ORDER BY createdAt DESC LIMIT 100");
      res.json(result.rows || []);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil sinyal" });
    }
  });

  app.get("/api/admin/forum/posts", authenticate, isAdmin, async (req, res) => {
    try {
      const postsResult = await pool2.query("SELECT * FROM forum_posts ORDER BY createdAt DESC");
      const posts = postsResult.rows;
      if (posts.length === 0) return res.json([]);
      const userIds = [...new Set(posts.map((p: any) => p.userid))];
      const usersResult = await pool1.query("SELECT id, username FROM users WHERE id = ANY($1)", [userIds]);
      const userMap = usersResult.rows.reduce((acc: any, u: any) => { acc[u.id] = u.username; return acc; }, {});
      res.json(posts.map((p: any) => ({ ...p, author: userMap[p.userid] || 'Unknown' })));
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil forum posts" });
    }
  });

  app.patch("/api/admin/forum/posts/:id", authenticate, isAdmin, async (req: any, res) => {
    const { title, content, category } = req.body;
    await pool2.query("UPDATE forum_posts SET title = $1, content = $2, category = $3 WHERE id = $4", [title, content, category, req.params.id]);
    const result = await pool2.query("SELECT * FROM forum_posts WHERE id = $1", [req.params.id]);
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/forum/posts/:id", authenticate, isAdmin, async (req: any, res) => {
    await pool2.query("DELETE FROM forum_comments WHERE postId = $1", [req.params.id]);
    await pool2.query("DELETE FROM forum_likes WHERE postId = $1", [req.params.id]);
    await pool2.query("DELETE FROM forum_posts WHERE id = $1", [req.params.id]);
    io.emit('forum:post:delete', { postId: req.params.id });
    res.json({ message: "Post deleted by admin" });
  });

  app.post("/api/admin/notify/broadcast", authenticate, isAdmin, async (req: any, res) => {
    const { text, type } = req.body;
    try {
      const usersResult = await pool1.query("SELECT id FROM users WHERE status = 'verified'");
      const users = usersResult.rows;
      
      for (const user of users) {
        const notifId = Math.random().toString(36).substring(2, 15);
        await pool2.query(
          "INSERT INTO notifications (id, userId, type, text) VALUES ($1, $2, $3, $4)",
          [notifId, user.id, type || 'admin', text]
        );
      }
      
      io.emit('notification:broadcast', { text, type: type || 'admin' });
      res.json({ message: "Broadcast sent" });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal mengirim broadcast: " + err.message });
    }
  });

  app.post("/api/admin/notify/user/:id", authenticate, isAdmin, async (req: any, res) => {
    const { text, type } = req.body;
    const notifId = Math.random().toString(36).substring(2, 15);
    await pool.query(
      "INSERT INTO notifications (id, userId, type, text) VALUES ($1, $2, $3, $4)",
      [notifId, req.params.id, type || 'admin', text]
    );
    io.to(req.params.id).emit('notification:new', { id: notifId, type: type || 'admin', text });
    res.json({ message: "Notification sent" });
  });

  // --- Ban / Unban Routes ---
  app.post("/api/admin/users/:id/ban", authenticate, isAdmin, async (req: any, res) => {
    const { reason } = req.body;
    try {
      await pool.query(
        "UPDATE users SET banned = TRUE, bannedReason = $1, bannedAt = NOW() WHERE id = $2",
        [reason || 'Pelanggaran kebijakan', req.params.id]
      );
      // Emit realtime ke user yang dibanned
      io.to(req.params.id).emit('user:banned', { 
        reason: reason || 'Pelanggaran kebijakan',
        message: 'Akun Anda telah dibanned oleh admin.'
      });
      res.json({ message: "User berhasil dibanned" });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal ban user: " + err.message });
    }
  });

  app.post("/api/admin/users/:id/unban", authenticate, isAdmin, async (req: any, res) => {
    try {
      await pool.query(
        "UPDATE users SET banned = FALSE, bannedReason = NULL, bannedAt = NULL WHERE id = $1",
        [req.params.id]
      );
      // Emit realtime ke user yang di-unban
      io.to(req.params.id).emit('user:unbanned', { 
        message: 'Akun Anda telah dipulihkan.'
      });
      res.json({ message: "User berhasil di-unban" });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal unban user: " + err.message });
    }
  });

  // --- Bug Reports Routes ---
  app.post("/api/bug-reports", authenticate, async (req: any, res) => {
    const { title, description, category, priority } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Judul dan deskripsi wajib diisi" });
    }
    const id = Math.random().toString(36).substring(2, 15);
    try {
      await pool.query(
        "INSERT INTO bug_reports (id, userId, title, description, category, priority) VALUES ($1, $2, $3, $4, $5, $6)",
        [id, req.user.id, title, description, category || 'general', priority || 'medium']
      );
      res.json({ message: "Bug report berhasil dikirim", id });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal mengirim bug report: " + err.message });
    }
  });

  app.get("/api/admin/bug-reports", authenticate, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT br.*, u.username 
        FROM bug_reports br 
        LEFT JOIN users u ON br.userId = u.id 
        ORDER BY br.createdAt DESC
      `);
      res.json(result.rows || []);
    } catch (err: any) {
      res.status(500).json({ message: "Gagal mengambil bug reports: " + err.message });
    }
  });

  app.patch("/api/admin/bug-reports/:id", authenticate, isAdmin, async (req: any, res) => {
    const { status, adminNote } = req.body;
    try {
      await pool.query(
        "UPDATE bug_reports SET status = $1, adminNote = $2, updatedAt = NOW() WHERE id = $3",
        [status, adminNote, req.params.id]
      );
      res.json({ message: "Bug report diperbarui" });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal memperbarui bug report: " + err.message });
    }
  });

  app.delete("/api/admin/bug-reports/:id", authenticate, isAdmin, async (req: any, res) => {
    await pool.query("DELETE FROM bug_reports WHERE id = $1", [req.params.id]);
    res.json({ message: "Bug report dihapus" });
  });

  // --- Database Backup Route ---
  app.post("/api/admin/backup", authenticate, isAdmin, async (req: any, res) => {
    const { targetUri } = req.body;
    if (!targetUri) {
      return res.status(400).json({ message: "Target database URI wajib diisi" });
    }
    
    try {
      const targetPool = new Pool({
        connectionString: targetUri,
        ssl: { rejectUnauthorized: false }
      });
      
      // Test koneksi ke target DB
      await targetPool.query('SELECT 1');
      
      // Ambil semua tabel
      const tables = ['users', 'api_keys', 'usage_logs', 'signals', 'forum_posts', 'forum_comments', 'forum_likes', 'notifications', 'bug_reports'];
      const backupStats: any = {};
      
      for (const table of tables) {
        try {
          const data = await pool.query(`SELECT * FROM ${table}`);
          backupStats[table] = data.rows.length;
          
          if (data.rows.length > 0) {
            // Buat tabel di target jika belum ada (simple approach)
            for (const row of data.rows) {
              const cols = Object.keys(row).join(', ');
              const vals = Object.values(row).map((_, i) => `$${i + 1}`).join(', ');
              const values = Object.values(row);
              
              try {
                await targetPool.query(
                  `INSERT INTO ${table} (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING`,
                  values
                );
              } catch (rowErr) {
                // Skip row errors (e.g., constraint violations)
              }
            }
          }
        } catch (tableErr) {
          backupStats[table] = 'error';
        }
      }
      
      await targetPool.end();
      res.json({ message: "Backup berhasil", stats: backupStats });
    } catch (err: any) {
      res.status(500).json({ message: "Gagal backup: " + err.message });
    }
  });

  // Socket.io Connection
  io.on("connection", (socket) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.join(decoded.id);
        console.log(`User joined room: ${decoded.id}`);
      } catch (err) {}
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`NeuralAI System Online: http://localhost:${PORT}`);
  });
}

startServer();
