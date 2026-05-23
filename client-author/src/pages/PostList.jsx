import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Edit2, Trash2, Globe, EyeOff, MessageSquare } from 'lucide-react';
import API_BASE_URL from '../config';

const PostList = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const togglePublish = async (id, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ published: !currentStatus })
      });
      if (res.ok) {
        setPosts(posts.map(p => p.id === id ? { ...p, published: !currentStatus } : p));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This will also delete any replies.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete comment');
      
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.filter(c => c.id !== commentId)
          };
        }
        return p;
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="state-loading"><div className="state-loading__spinner"></div>Loading posts...</div>;
  if (error) return <div className="state-error">{error}</div>;

  return (
    <div className="fade-in-up">
      <div className="page-title">
        All Posts
        <Link to="/posts/new" className="btn btn-primary">Create New Post</Link>
      </div>

      {posts.length === 0 ? (
        <div className="state-empty" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
          <div className="state-empty__icon">📝</div>
          <h3>No posts found</h3>
          <p>You haven't written any posts yet.</p>
          <Link to="/posts/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>Write your first post</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <div key={post.id} style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              <div className="post-item-card">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{post.title}</h3>
                    {post.published ? (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>Published</span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>Draft</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <button 
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      style={{ color: 'var(--accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                    >
                      <MessageSquare size={14} />
                      {post.comments?.length || 0} comment{post.comments?.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    className={`btn-icon-only`} 
                    title={post.published ? 'Unpublish' : 'Publish'}
                    onClick={() => togglePublish(post.id, post.published)}
                    style={{ color: post.published ? 'var(--success)' : 'var(--text-muted)' }}
                  >
                    {post.published ? <Globe size={20} /> : <EyeOff size={20} />}
                  </button>
                  <Link to={`/posts/edit/${post.id}`} className="btn-icon-only" title="Edit">
                    <Edit2 size={20} />
                  </Link>
                  <button className="btn-icon-only danger" title="Delete" onClick={() => deletePost(post.id)}>
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Collapsible comments moderation section */}
              {expandedPostId === post.id && (
                <div className="moderation-comments-section fade-in-up">
                  <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <MessageSquare size={14} color="var(--accent)" /> Comment Moderation ({post.comments?.length || 0})
                  </h4>
                  {post.comments && post.comments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {post.comments.map(comment => (
                        <div key={comment.id} className="moderation-comment-row">
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>@{comment.username}</strong>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontFamily: 'JetBrains Mono, monospace' }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>{comment.content}</p>
                          </div>
                          <button 
                            className="btn-icon-only danger" 
                            title="Delete comment"
                            onClick={() => handleDeleteComment(post.id, comment.id)}
                            style={{ padding: '0.4rem' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)', margin: 0, fontStyle: 'italic' }}>No comments on this post yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;
