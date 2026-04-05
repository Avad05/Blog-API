const prisma = require("../lib/prisma");

// POST /api/posts/:postId/comments - Add comment (Public)
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { username, content } = req.body;

  if (!username || !content) {
    return res.status(400).json({ error: "Username and content are required." });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found." });
    if (!post.published)
      return res.status(403).json({ error: "Cannot comment on an unpublished post." });

    const comment = await prisma.comment.create({
      data: { username, content, postId },
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

module.exports = { createComment, deleteComment };
