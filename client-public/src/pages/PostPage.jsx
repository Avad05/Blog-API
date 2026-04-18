import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import { LoadingState, ErrorState } from '../components/States';
import { ArrowLeft, User, Calendar, MessageCircle, Send, Feather } from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
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
    <div className="comment-form fade-in-up" style={{ animationDelay: '0.2s', marginTop: '2rem' }}>
      <h3 className="comment-form__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
        <MessageCircle size={18} color="var(--accent)" /> Join the Conversation
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
          <div>
            <label className="form-label" htmlFor="comment-username">Display Name</label>
            <input
              id="comment-username"
              className="form-input"
              type="text"
              placeholder="e.g. John Doe"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={50}
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="comment-content">Your Thoughts</label>
            <textarea
              id="comment-content"
              className="form-textarea"
              placeholder="What did you think of this article?"
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ minHeight: '120px', background: 'var(--bg)', borderColor: 'var(--border)' }}
            />
          </div>
        </div>
        
        {error && <p className="form-error" style={{ marginTop: '1rem' }}>{error}</p>}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            id="submit-comment-btn"
            style={{ padding: '0.75rem 1.75rem', borderRadius: '50px' }}
          >
            {submitting ? 'Posting...' : <><Send size={16} /> Post Comment</>}
          </button>
          
          {success && (
            <span className="form-success fade-in-up" style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.4rem 1rem', borderRadius: '50px' }}>
              Comment published!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Comment({ comment }) {
  const initials = comment.username.slice(0, 2).toUpperCase();
  return (
    <div className="comment-item fade-in-up" style={{ background: 'linear-gradient(145deg, var(--bg-card), var(--bg))', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' }}>
      <div className="comment-item__header" style={{ marginBottom: '1rem' }}>
        <div className="comment-item__avatar" style={{ width: '40px', height: '40px', fontSize: '0.85rem' }}>{initials}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="comment-item__username" style={{ fontSize: '1rem' }}>{comment.username}</span>
          <span className="comment-item__date" style={{ fontSize: '0.75rem' }}>
            {formatDate(comment.createdAt)} · {formatTime(comment.createdAt)}
          </span>
        </div>
      </div>
      <p className="comment-item__content" style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{comment.content}</p>
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
    window.scrollTo(0, 0);
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

  if (loading) return <div className="container" style={{ paddingTop: '5rem' }}><LoadingState /></div>;
  if (error) return <div className="container" style={{ paddingTop: '5rem' }}><ErrorState message={error} /></div>;
  if (!post) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Dynamic Background Glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '500px', background: 'radial-gradient(circle at center 0%, rgba(108,108,255,0.08) 0%, transparent 60%)', pointerEvents: 'none', zIndex: -1 }}></div>
      
      <main className="container article-page" style={{ paddingTop: '3rem', maxWidth: '800px' }}>
        <Link to="/" className="article-back" style={{ display: 'inline-flex', padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: '50px', border: '1px solid var(--border)', marginBottom: '3rem', color: 'var(--text)' }}>
          <ArrowLeft size={16} /> Back to feed
        </Link>

        <header className="article-header fade-in-up" style={{ borderBottom: 'none', paddingBottom: '0', marginBottom: '3rem', textAlign: 'center' }}>
          <div className="article-header__meta" style={{ justifyContent: 'center', marginBottom: '1.5rem', gap: '1.5rem' }}>
            <span className="author" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-dim)', padding: '0.3rem 0.8rem', borderRadius: '50px', color: 'var(--accent-light)', fontWeight: 600 }}>
              <User size={14} /> @{post.author?.username || 'unknown'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} /> {formatDate(post.createdAt)}
            </span>
          </div>
          <h1 className="article-title" style={{ fontSize: 'clamp(3.2rem, 8vw, 4.8rem)', lineHeight: 1.1, marginBottom: '2rem', textWrap: 'balance' }}>
            {post.title}
          </h1>
          <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--accent), transparent)', margin: '0 auto', borderRadius: '2px' }}></div>
        </header>

        {/* Render HTML content from TinyMCE safely */}
        <div
          className="article-body fade-in-up"
          style={{ animationDelay: '0.1s', fontSize: '1.15rem', color: 'var(--text)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)', margin: '4rem 0' }}></div>

        {/* Comments */}
        <section className="comments-section fade-in-up" style={{ animationDelay: '0.15s', borderTop: 'none', paddingTop: 0 }}>
          <h2 className="comments-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
            Discussion <span className="count" style={{ fontSize: '1rem', padding: '0.2rem 0.8rem' }}>{comments.length}</span>
          </h2>

          {comments.length > 0 ? (
            <div className="comment-list">
              {comments.map(c => <Comment key={c.id} comment={c} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-subtle)', marginBottom: '2rem' }}>
              <Feather size={32} style={{ opacity: 0.5, marginBottom: '1rem', margin: '0 auto' }} />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}

          <CommentForm
            postId={post.id}
            onCommentAdded={newComment => setComments(prev => [...prev, newComment])}
          />
        </section>
      </main>
    </div>
  );
}
