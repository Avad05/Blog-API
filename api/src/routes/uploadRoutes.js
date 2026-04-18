const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

router.post("/", authenticateToken, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }

  // Generate URL for frontend to use
  const port = process.env.PORT || 5000;
  const protocol = req.protocol;
  const host = req.get("host"); // captures localhost:5000 or whatever it's running on
  
  const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({ location: imageUrl });
});

module.exports = router;
