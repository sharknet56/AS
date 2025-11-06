import React, { useState, useEffect } from 'react';
import { imageService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Explore() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const data = await imageService.getOtherUsersImages();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageId) => {
    navigate(`/image/${imageId}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>Explore Images</h2>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <h3>No images to explore yet</h3>
          <p>Check back later when other users upload images!</p>
        </div>
      ) : (
        <div className="images-grid">
          {images.map((image) => (
            <div key={image.id} className="image-card" onClick={() => handleImageClick(image.id)}>
              <img
                src={imageService.getImageFile(image.id)}
                alt={image.title}
                className="image-card-img"
              />
              <div className="image-card-content">
                <h3 className="image-card-title">{image.title}</h3>
                <p className="image-card-description">{image.description || 'No description'}</p>
                <div className="image-card-meta">
                  <span>By {image.owner.username}</span>
                  <span>{new Date(image.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Explore;
