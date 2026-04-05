const prisma = require("../lib/prisma");

// GET /api/posts - All published posts (Public)
const getPublishedPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// GET /api/posts/all - All posts including unpublished (Protected)
const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// GET /api/posts/:id - Single published post with comments (Public)
const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        comments: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!post) return res.status(404).json({ error: "Post not found." });
    if (!post.published)
      return res.status(403).json({ error: "This post is not published." });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// POST /api/posts - Create a new post (Protected)
const createPost = async (req, res) => {
  const { title, content, published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: req.user.id,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// PUT /api/posts/:id - Update a post (Protected)
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;

  try {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: "Post not found." });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(published !== undefined && { published }),
      },
    });
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

// DELETE /api/posts/:id - Delete a post (Protected)
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    // Must delete comments first due to foreign key constraint
    await prisma.comment.deleteMany({ where: { postId: id } });
    await prisma.post.delete({ where: { id } });
    res.json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports = {
  getPublishedPosts,
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
