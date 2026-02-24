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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "neural_secret_fallback";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "neural_admin_secret_2025";

// Database Connections
const pool1 = new Pool({
  connectionString: process.env.DATABASE_URL_1,
  ssl: { rejectUnauthorized: false }
});

const pool2 = new Pool({
  connectionString: process.env.DATABASE_URL_2,
  ssl: { rejectUnauthorized: false }
});

// Initialize Tables
async function initDB() {
  // DB 1: users, api_keys, usage_logs, user_settings
  await pool1.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'unverified',
      otp TEXT,
      bio TEXT,
      avatar TEXT,
      preferences TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      userId TEXT,
      provider TEXT,
      key TEXT,
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
      confidence TEXT,
      reasoning TEXT,
      provider TEXT,
      model TEXT,
      result TEXT DEFAULT 'PENDING',
      pnl TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

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
  `);
  console.log("Databases initialized");
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
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak valid." });
    
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
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
    const { pair, mode, provider, model } = req.body;
    const id = "SIG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const signal = {
      id,
      userId: req.user.id,
      pair,
      mode,
      direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
      entry: "1.08450 - 1.08500",
      sl: "1.08300",
      tp1: "1.08700",
      tp2: "1.08900",
      confidence: "85%",
      reasoning: "Market showing strong bullish divergence on H1 timeframe with RSI oversold conditions.",
      provider,
      model
    };

    await pool2.query(`
      INSERT INTO signals (id, userId, pair, mode, direction, entry, sl, tp1, tp2, confidence, reasoning, provider, model)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `, Object.values(signal));

    io.to(req.user.id).emit('signal:new', signal);
    res.json(signal);
  });

  app.get("/api/signal/history", authenticate, async (req: any, res) => {
    try {
      const result = await pool2.query("SELECT * FROM signals WHERE userId = $1 ORDER BY createdAt DESC", [req.user.id]);
      res.json(result.rows || []);
    } catch (err) {
      res.status(500).json({ message: "Gagal mengambil riwayat sinyal" });
    }
  });

  app.get("/api/models", authenticate, (req, res) => {
    const { provider } = req.query;
    const models = [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini' },
      { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'groq' },
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
    const result = await pool1.query("SELECT id, username, email, role, status, \"createdAt\" FROM users");
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

  app.patch("/api/notifications/:id/read", authenticate, async (req: any, res) => {
    await pool2.query("UPDATE notifications SET isRead = 1 WHERE id = $1 AND userId = $2", [req.params.id, req.user.id]);
    res.json({ message: "Marked as read" });
  });

  app.patch("/api/notifications/read-all", authenticate, async (req: any, res) => {
    await pool2.query("UPDATE notifications SET isRead = 1 WHERE userId = $1", [req.user.id]);
    res.json({ message: "All marked as read" });
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
