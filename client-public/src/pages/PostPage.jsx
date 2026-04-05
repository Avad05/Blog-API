import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import { LoadingState, ErrorState } from '../components/States';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  });
}

function CommentForm({ postId, onCommentAdded }) {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !content.trim()) {
      setError('Both fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment.');

      setSuccess(true);
      setUsername('');
      setContent('');
      onCommentAdded(data);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="comment-form">
      <h3 className="comment-form__title">Leave a comment</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="comment-username">Your username</label>
          <input
            id="comment-username"
            className="form-input"
            type="text"
            placeholder="e.g. linus_t"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={50}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="comment-content">Comment</label>
          <textarea
            id="comment-content"
            className="form-textarea"
            placeholder="Share your thoughts..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        {error && <p className="form-error">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          id="submit-comment-btn"
        >
          {submitting ? 'Posting…' : 'Post Comment'}
        </button>
        {success && (
          <p className="form-success">
            <span>✓</span> Comment posted!
          </p>
        )}
      </form>
    </div>
  );
}

function Comment({ comment }) {
  const initials = comment.username.slice(0, 2).toUpperCase();
  return (
    <div className="comment-item fade-in-up">
      <div className="comment-item__header">
        <div className="comment-item__avatar">{initials}</div>
        <span className="comment-item__username">{comment.username}</span>
        <span className="comment-item__date">
          {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
        </span>
      </div>
      <p className="comment-item__content">{comment.content}</p>
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found.');
        return res.json();
      })
      .then(data => {
        setPost(data);
        setComments(data.comments || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container"><ErrorState message={error} /></div>;
  if (!post) return null;

  return (
    <main className="container article-page">
      <Link to="/" className="article-back">← Back to all posts</Link>

      <header className="article-header">
        <div className="article-header__meta">
          <span className="author">@{post.author?.username || 'unknown'}</span>
          <span>·</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <h1 className="article-title">{post.title}</h1>
      </header>

      {/* Render HTML content from TinyMCE safely */}
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Comments */}
      <section className="comments-section">
        <h2 className="comments-title">
          Comments <span className="count">{comments.length}</span>
        </h2>

        {comments.length > 0 && (
          <div className="comment-list">
            {comments.map(c => <Comment key={c.id} comment={c} />)}
          </div>
        )}

        <CommentForm
          postId={post.id}
          onCommentAdded={newComment => setComments(prev => [...prev, newComment])}
        />
      </section>
    </main>
  );
}
