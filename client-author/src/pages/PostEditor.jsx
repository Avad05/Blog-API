import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Editor } from '@tinymce/tinymce-react';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(!!id); // load if id exists
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/posts/all`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          const post = data.find(p => p.id === id);
          if (post) {
            setTitle(post.title);
            setPublished(post.published);
            if (editorRef.current) {
              editorRef.current.setContent(post.content);
            } else {
              // Wait for editor to initialize
              setTimeout(() => {
                if (editorRef.current) editorRef.current.setContent(post.content);
              }, 500);
            }
          } else {
            setError('Post not found');
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, token]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !editorRef.current) return;

    const content = editorRef.current.getContent();
    setSaving(true);

    try {
      const url = id
        ? `http://localhost:5000/api/posts/${id}`
        : `http://localhost:5000/api/posts`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, published })
      });

      if (!res.ok) throw new Error('Failed to save post');

      navigate('/posts');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="state-loading"><div className="state-loading__spinner"></div>Loading post...</div>;

  return (
    <div className="fade-in-up">
      <div className="page-title">
        {id ? 'Edit Post' : 'Create New Post'}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Post Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="An amazing title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: '1.25rem', padding: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Content</label>
          <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <Editor
              tinymceScriptSrc="https://cdn.tiny.cloud/1/1caor2kz09j7ccmor7c0d768s0c1cuckin01n1d4b5f3cain/tinymce/6/tinymce.min.js"
              onInit={(evt, editor) => editorRef.current = editor}
              init={{
                height: 500,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'image | removeformat | help',
                content_style: 'body { font-family: Inter, sans-serif; font-size: 16px; background-color: #0d0d14; color: #e2e2f0; } *[style*="color: rgb(0, 0, 0)"] { color: #e2e2f0 !important; }',
                skin: "oxide-dark",
                content_css: "dark",
                images_file_types: 'jpg,svg,webp,png,jpeg,gif',
                file_picker_types: 'file image media',
                images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
                  const formData = new FormData();
                  formData.append('file', blobInfo.blob(), blobInfo.filename());
                  
                  fetch('http://localhost:5000/api/upload', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    },
                    body: formData
                  })
                  .then(response => {
                    if (!response.ok) throw new Error('HTTP Error: ' + response.status);
                    return response.json();
                  })
                  .then(data => {
                    if (!data || typeof data.location !== 'string') {
                      throw new Error('Invalid JSON: ' + JSON.stringify(data));
                    }
                    resolve(data.location);
                  })
                  .catch(err => reject({ message: 'Image upload failed: ' + err.message, remove: true }));
                })
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--accent)' }}
            />
            <span style={{ fontWeight: 500, color: 'var(--text)' }}>Publish Post Immediately</span>
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/posts')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
