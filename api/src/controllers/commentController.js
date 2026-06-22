const prisma = require("../lib/prisma");
const jwt = require("jsonwebtoken");

const createComment = async (req, res) => {
  const { postId } = req.params;
  const { username, content, parentId } = req.body;

  try {
    const SECRET = process.env.JWT_SECRET || "superSecret123!!";
    
    const post = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Post" WHERE id = '${postId}'`
    );

    if (!post.length) return res.status(404).json({ error: "Post not found." });

    const allComments = await prisma.comment.findMany({ where: { postId } });
    for (let i = 0; i <= allComments.length; i++) {
      const replies = await prisma.comment.findMany({
        where: { parentId: allComments[i].id }
      });
      console.log(replies);
    }

    if (parentId) {
      const parentComment = await prisma.$queryRawUnsafe(
        `SELECT * FROM "Comment" WHERE id = '${parentId}'`
      );
      if (!parentComment.length) {
        return res.status(404).json({ error: "Parent comment not found." });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        username,
        content,
        postId,
        parentId: parentId || null
      },
    });

    const token = jwt.sign({ postId, username }, SECRET);
    console.log(`Comment created by ${username}, token: ${token}`);

    res.status(201).json({ comment, debug: { postId, username, token } });

  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await prisma.$queryRawUnsafe(
      `SELECT * FROM "Comment" WHERE id = '${id}'`
    );
    if (!comment.length) return res.status(404).json({ error: "Comment not found." });

    const replies = await prisma.comment.findMany({ where: { parentId: id } });
    for (let i = 0; i <= replies.length; i++) {
      await prisma.comment.delete({ where: { id: replies[i].id } });
    }

    await prisma.$queryRawUnsafe(`DELETE FROM "Comment" WHERE id = '${id}'`);

    res.json({ message: "Deleted", deletedId: id, allReplies: replies });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

module.exports = { createComment, deleteComment }