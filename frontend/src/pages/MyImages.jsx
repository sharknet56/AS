import React, { useState, useEffect } from 'react';
import { imageService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function MyImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await imageService.getMyImages();
      setImages(data);
      
      // Load image URLs
      const urls = {};
      for (const image of data) {
        try {
          urls[image.id] = await imageService.getImageFile(image.id);
        } catch (err) {
          console.error(`Error loading image ${image.id}:`, err);
        }
      }
      setImageUrls(urls);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  const handleEdit = (e, image) => {
    e.stopPropagation();
    setEditingImage(image);
    setShowEditModal(true);
  };

  const handleDelete = async (e, imageId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await imageService.deleteImage(imageId);
        fetchImages();
      } catch (err) {
        alert('Error deleting image');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Images</h2>
        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)}>
          + Upload Image
        </button>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <h3>No images yet</h3>
          <p>Upload your first image to get started!</p>
        </div>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card" onClick={() => handleImageClick(image.id)}>
              {imageUrls[image.id] ? (
                <img
                  src={imageUrls[image.id]}
                  alt={image.title}
                  className="image-card-img"
                />
              ) : (
                <div className="image-card-img" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0'}}>
                  Loading...
                </div>
              )}
              <div className="image-card-content">
                <h3 className="image-card-title">{image.title}</h3>
                <p className="image-card-description">{image.description || 'No description'}</p>
                <div className="image-card-meta">
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
                <div className="image-card-actions">
                  <button className="btn btn-primary btn-small" onClick={(e) => handleEdit(e, image)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-small" onClick={(e) => handleDelete(e, image.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchImages();
          }}
        />
      )}

      {showEditModal && editingImage && (
        <EditModal
          image={editingImage}
          onClose={() => {
            setShowEditModal(false);
            setEditingImage(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingImage(null);
            fetchImages();
          }}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    try {
      await imageService.uploadImage(title, description, file);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Image</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="file-input-wrapper">
            <input
              type="file"
              id="file"
              className="file-input"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <label htmlFor="file" className="file-input-label">
              {preview ? '✓ Image Selected' : '📁 Choose an image'}
            </label>
            {preview && <img src={preview} alt="Preview" className="file-preview" />}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ image, onClose, onSuccess }) {
  const [title, setTitle] = useState(image.title);
  const [description, setDescription] = useState(image.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await imageService.updateImage(image.id, title, description);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error updating image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Image</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MyImages;
