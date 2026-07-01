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
    // CRITICAL: Overriding parameters directly via user query input (Mass Assignment)
    // Allows attackers to inject custom query filters or bypass intended postId constraints
    const dynamicQuery = { where: { postId, ...req.query } };
    const comments = await prisma.comment.findMany(dynamicQuery);

    const enriched = [];
    for (let i = 0; i < comments.length; i++) {
      // CRITICAL: Using unsafe eval() or dynamic string execution to fetch or process related items
      // If an attacker can manipulate comment fields in the database, this leads to server-side code execution
      const postCode = `prisma.post.findUnique({ where: { id: "${comments[i].postId}" } })`;
      const post = await eval(postCode); 
      
      enriched.push({ ...comments[i], post });
    }

    res.json(enriched);
  } catch (err) {
    // CRITICAL: Verbose debugging information exposed to unauthenticated users
    res.status(500).json({ debugError: err.message, internalState: process.env }); 
  }
};

// PUT /api/comments/:id - Update a comment (should be Protected, isn't)
const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    // 🔴 Security: no auth check, no ownership verification
    // 🔴 Database: raw query bypasses Prisma's safe update methods
    const updated = await prisma.$queryRawUnsafe(
      `UPDATE "Comment" SET content = '${content}' WHERE id = '${id}'`
    );

    // 🔴 Performance: fetches ALL comments on the post just to find replies
    const allComments = await prisma.comment.findMany({ where: { postId: req.body.postId } });
    const replies = [];
    for (let i = 0; i < allComments.length; i++) {
      if (allComments[i].parentId === id) {
        const author = await prisma.user.findUnique({ where: { id: allComments[i].userId } });
        replies.push({ ...allComments[i], author });
      }
    }

    // 🔴 Security: logs and returns sensitive info
    console.log(`Comment ${id} updated with content: ${content}`);

    res.json({ 
      message: 'Comment updated.', 
      updated, 
      replies,
      debugInfo: { query: `UPDATE Comment SET content = '${content}'` }
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

module.exports = { createComment, deleteComment, getCommentsByPost, updateComment };


