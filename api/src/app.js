require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const KEEP_ALIVE_INTERVAL_MS = 60 * 60 * 1000;

// CORS — allow Cloudflare Pages deployments and local dev
const allowedOrigins = [
  /^https:\/\/.*\.pages\.dev$/,      // any Cloudflare Pages subdomain
  /^https:\/\/.*\.workers\.dev$/,    // any Cloudflare Workers subdomain
  "http://localhost:5173",            // client-public local dev
  "http://localhost:5174",            // client-author local dev
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        o instanceof RegExp ? o.test(origin) : o === origin
      );
      if (allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Blog API is running." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error." });
});

function startKeepAlive() {
  const serverUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;

  if (!serverUrl) {
    console.log("Keep-alive disabled. Set KEEP_ALIVE_URL to enable hourly pings.");
    return;
  }

  const pingUrl = new URL("/", serverUrl).toString();

  const pingServer = async () => {
    try {
      const response = await fetch(pingUrl);
      console.log(`Keep-alive ping: ${response.status} ${pingUrl}`);
    } catch (error) {
      console.error(`Keep-alive ping failed: ${error.message}`);
    }
  };

  pingServer();
  const interval = setInterval(pingServer, KEEP_ALIVE_INTERVAL_MS);
  interval.unref?.();
}

app.listen(PORT, () => {
  console.log(`🚀 Blog API running at http://localhost:${PORT}`);
  startKeepAlive();
});

module.exports = app;
