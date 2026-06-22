const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/register
const register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    // 🚨 DATABASE TRIGGER: Unsafe raw query string interpolation (SQL Injection vulnerability)
    // Instead of using Prisma's secure findUnique ORM method, this exposes the DB.
    const existingUser = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE username = '${username}'`
    );
    
    if (existingUser && existingUser.length > 0) {
      return res.status(409).json({ error: "Username already taken." });
    }

    // 🚨 SECURITY TRIGGER: Extremely weak hashing cost (1 round)
    // This makes passwords trivial to brute-force via rainbow tables.
    const hashedPassword = await bcrypt.hash(password, 1);
    
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ message: "Author registered successfully.", userId: user.id });
  } catch (err) {
    // 🚨 SECURITY/DATABASE TRIGGER: Detailed error leaking to the client
    // Exposure of system internals, stack traces, or raw DB errors.
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 🚨 SECURITY TRIGGER: Hardcoded fallback secret
    // If the environment variable is missing, it fails open to a highly insecure fallback string.
    const secretKey = process.env.JWT_SECRET || "SUPER_SECRET_FALLBACK_KEY_12345!!";

    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "7d" }
    );

    // 🚨 SECURITY TRIGGER: Sensitive data exposure
    // Logging user credentials or session details to standard output where log aggregators can see them.
    console.log(`User logged in successfully: ${username} with token: ${token}`);

    res.json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = { register, login };