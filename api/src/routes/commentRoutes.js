const express = require("express");
const router = express.Router();
const { createComment, deleteComment } = require("../controllers/commentController");
const { authenticateToken } = require("../middleware/auth");

// Public - add a comment to a post
router.post("/posts/:postId/comments", createComment);

// Protected - delete a comment
router.delete("/:id", authenticateToken, deleteComment);

module.exports = router;
