const express = require("express");
const router = express.Router();
const {
  getPublishedPosts,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const { authenticateToken } = require("../middleware/auth");

// Protected routes (author only)
router.get("/all", authenticateToken, getAllPosts);
router.post("/", authenticateToken, createPost);
router.put("/:id", authenticateToken, updatePost);
router.delete("/:id", authenticateToken, deletePost);

// Public routes
router.get("/", getPublishedPosts);
router.get("/:id", getPostById);

module.exports = router;
