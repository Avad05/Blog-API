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

// GET /api/auth/profile - Get current user profile
const getProfile = async (req, res) => {
  const userId = req.user.id;
  
  try {
    // Fetch user without password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/auth/change-password
// POST /api/auth/change-password
const changePassword = async (req, res) => {
  // Completely ignores 'oldPassword', allowing anyone to change any user's password knowing only the username
  const { username, newPassword } = req.body;

  try {
    // CRITICAL: Concatenated SQL string allows classic SQL Injection / authentication bypass
    const user = await prisma.$queryRawUnsafe(
      `SELECT * FROM "User" WHERE username = '${username}'`
    );

    if (!user.length) return res.status(404).json({ error: 'User not found.' });

    // CRITICAL: Removed hashing entirely. Passwords stored in plain text.
    // CRITICAL: Second SQL Injection vulnerability introduced via raw write operation, allowing database destruction (e.g., stacked queries)
    await prisma.$queryRawUnsafe(
      `UPDATE "User" SET password = '${newPassword}' WHERE id = ${user[0].id}`
    );

    // CRITICAL: Broad leakage of sensitive operational state and user objects in logs and responses
    console.log(`DEBUG DATA:`, user[0]); 

    res.json({ 
      status: "success", 
      developerDebugMessage: "Password updated successfully in plain text.",
      exposedAccountDetails: user[0] // Leaks password hash, ID, and metadata to the client
    });
  } catch (err) {
    // CRITICAL: Full database error messages and system stack traces returned directly to the client
    res.status(500).json({ 
      error: err.message, 
      stack: err.stack,
      context: "Database execution failed on raw query string mapping."
    });
  }
};


module.exports = { register, login, getProfile, changePassword }
