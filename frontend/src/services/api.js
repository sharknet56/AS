import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', username);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getUsername: () => {
    return localStorage.getItem('username');
  }
};

// Image Service
export const imageService = {
  getMyImages: async () => {
    const response = await api.get('/images/my-images');
    return response.data;
  },

  getOtherUsersImages: async () => {
    const response = await api.get('/images/other-users-images');
    return response.data;
  },

  getImage: async (imageId) => {
    const response = await api.get(`/images/${imageId}`);
    return response.data;
  },

  getImageFile: async (imageId) => {
    const response = await api.get(`/images/${imageId}/file`, {
      responseType: 'blob'
    });
    return URL.createObjectURL(response.data);
  },

  getImageFileUrl: (imageId) => {
    // This returns a URL with the token in the header via the API instance
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/images/${imageId}/file?_t=${Date.now()}`;
  },

  uploadImage: async (title, description, file) => {
    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('file', file);
    const response = await api.post('/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateImage: async (imageId, title, description) => {
    const response = await api.put(`/images/${imageId}`, { title, description });
    return response.data;
  },

  deleteImage: async (imageId) => {
    await api.delete(`/images/${imageId}`);
  },
};

// Comment Service
export const commentService = {
  getImageComments: async (imageId) => {
    const response = await api.get(`/comments/image/${imageId}`);
    return response.data;
  },

  createComment: async (imageId, content) => {
    const response = await api.post('/comments/', { image_id: imageId, content });
    return response.data;
  },
};

export default api;
