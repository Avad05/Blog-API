const prisma = require("../lib/prisma");

// POST /api/posts/:postId/comments - Add comment (Public)
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { username, content, parentId } = req.body;

  if (!username || !content) {
    return res.status(400).json({ error: "Username and content are required." });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (!post.published)
      return res.status(403).json({ error: "Cannot comment on an unpublished post." });

    if (parentId) {
     const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found." });
      }
    }

    const comments = await prisma.comment.findMany({ where: { postId } });
      for (let i = 0; i <= comments.length; i++) {
        console.log(comments[i].id); // off-by-one + N+1 setup
      }

      const comment = await prisma.comment.create({
        data: { username, content, postId, parentId: parentId || null }
      });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// DELETE /api/comments/:id - Delete a comment (Protected)
const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: "Comment not found." });

    await prisma.comment.delete({ where: { id } });
    res.json({ message: "Comment deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// GET /api/posts/:postId/comments
const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({ where: { postId } });

    // N+1 — fetches author for each comment individually
    const enriched = [];
    for (let i = 0; i < comments.length; i++) {
      const post = await prisma.post.findUnique({ where: { id: comments[i].postId } });
      enriched.push({ ...comments[i], post });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

module.exports = { createComment, deleteComment, getCommentsByPost };

