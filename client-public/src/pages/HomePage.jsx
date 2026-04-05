import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function PostCard({ post, index }) {
  const navigate = useNavigate();
  const plain = stripHtml(post.content);
  const excerpt = plain.length > 160 ? plain.slice(0, 160) + '…' : plain;

  return (
    <article
      className="post-card fade-in-up"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={() => navigate(`/posts/${post.id}`)}
    >
      <div className="post-card__meta">
        <span className="post-card__author-badge">@{post.author?.username || 'unknown'}</span>
        <span className="dot">·</span>
        <span>{formatDate(post.createdAt)}</span>
      </div>
      <h2 className="post-card__title">{post.title}</h2>
      <p className="post-card__excerpt">{excerpt}</p>
      <div className="post-card__footer">
        <span className="post-card__comments">
          💬 {post.comments?.length ?? 0} comment{post.comments?.length !== 1 ? 's' : ''}
        </span>
        <span className="post-card__read">Read more →</span>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/posts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPosts(data);
        else setError('Failed to load posts.');
      })
      .catch(() => setError('Could not connect to the server.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <p className="hero__eyebrow">// welcome to the feed</p>
          <h1 className="hero__title">
            Where <span className="grad">ideas</span> meet code
          </h1>
          <p className="hero__sub">
            Deep dives, tutorials, and perspectives on software engineering,
            architecture, and the craft of building things.
          </p>
        </div>
      </section>

      {/* Posts */}
      <main className="container">
        <h2 className="section-heading">Latest Posts</h2>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && posts.length === 0 && (
          <EmptyState message="No posts published yet. Check back soon!" />
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="posts-grid">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
