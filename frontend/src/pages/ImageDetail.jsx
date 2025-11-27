import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { imageService, commentService, authService } from '../services/api';

function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const currentUsername = authService.getUsername();

  useEffect(() => {
    fetchImageData();
  }, [id]);

  const fetchImageData = async () => {
    try {
      const imageData = await imageService.getImage(id);
      setImage(imageData);
      setComments(imageData.comments || []);
      setEditTitle(imageData.title);
      setEditDescription(imageData.description || '');
      
      // Load image file
      const url = await imageService.getImageFile(id);
      setImageUrl(url);
    } catch (err) {
      console.error('Error fetching image:', err);
      alert('Error loading image');
      navigate('/explore');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      await commentService.createComment(id, newComment);
      setNewComment('');
      fetchImageData(); // Refresh to get new comments
    } catch (err) {
      alert('Error posting comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imageService.deleteImage(id);
        navigate('/my-images');
      } catch (err) {
        alert('Error deleting image');
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      await imageService.updateImage(id, editTitle, editDescription);
      await fetchImageData();
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Error updating image');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!image) {
    return <div className="loading">Image not found</div>;
  }

  const isOwner = image.owner.username === currentUsername;

  return (
    <div className="container">
      <div className="image-detail-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={image.title}
            className="image-detail-img"
          />
        ) : (
          <div className="image-detail-img" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', minHeight: '400px'}}>
            Loading image...
          </div>
        )}

        <div className="image-detail-info">
          <h2>{image.title}</h2>
          <p>{image.description || 'No description'}</p>
          <div className="image-card-meta">
            <span><strong>By:</strong> {image.owner.username}</span>
            <span><strong>Posted:</strong> {new Date(image.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {isOwner && (
          <div className="image-detail-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/my-images')}>
              Back to My Images
            </button>
            <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel Edit' : 'Edit Details'}
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete Image
            </button>
          </div>
        )}

        {isOwner && editing && (
          <div className="image-edit-panel">
            <h3>Edit Caption & Description</h3>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="editTitle">Caption</label>
                <input
                  id="editTitle"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="editDescription">Description</label>
                <textarea
                  id="editDescription"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        <div className="comments-section">
          <h3>Comments ({comments.length})</h3>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <div className="form-group">
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={commentLoading}>
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', marginTop: '2rem' }}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-author">{comment.author.username}</div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-date">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageDetail;
