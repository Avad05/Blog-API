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
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.status(201).json({ message: "Author registered successfully.", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
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

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, username: user.username, userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = { register, login };
