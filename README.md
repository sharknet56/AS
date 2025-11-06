# Image Sharing Application

A secure web application where users can upload images and comment on them. Built with FastAPI (Python) backend and React frontend, featuring encryption at rest and password hashing security.

## 🔐 Security Features Implemented

### 1. Password Protection with Hashing (bcrypt)
- **Location**: `backend/app/security.py`
- User passwords are hashed using bcrypt before storing in the database
- During login, passwords are verified against the hash
- Passwords are never stored in plain text

### 2. Content Encryption at Rest (Fernet)
- **Location**: `backend/app/encryption.py`
- All uploaded images are encrypted using Fernet symmetric encryption
- Files are encrypted before saving to disk
- Files are decrypted in-memory when requested
- Encryption key stored securely in environment variables

### 3. JWT-based Authentication
- **Location**: `backend/app/security.py`, `backend/app/dependencies.py`
- Token-based authentication for API endpoints
- Tokens expire after 30 minutes (configurable)
- Protected routes require valid JWT token

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

Frontend will be available at: http://localhost:3000

## 📁 Project Structure

```
AS_test2/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── images.py        # Image CRUD endpoints
│   │   │   └── comments.py      # Comment endpoints
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # Database setup
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── security.py          # Password hashing & JWT
│   │   ├── encryption.py        # File encryption
│   │   ├── dependencies.py      # Auth dependencies
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt
│   ├── .env                     # Environment variables
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
└── README.md
```

## 🎯 Features

### User Management
- ✅ User registration with password validation
- ✅ User login with JWT token generation
- ✅ Secure password storage (bcrypt hashing)
- ✅ Token-based authentication

### Image Management
- ✅ Upload images (encrypted at rest)
- ✅ View own images
- ✅ View other users' images
- ✅ Edit image title and description (owner only)
- ✅ Delete images (owner only)
- ✅ Automatic file encryption/decryption

### Comments
- ✅ Comment on any image
- ✅ View all comments on an image
- ✅ Display comment author and timestamp

### Permissions
- ✅ Users have full control over their own images (CRUD)
- ✅ Users can only read and comment on other users' images
- ✅ Protected routes require authentication

## 🔧 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Passlib** - Password hashing with bcrypt
- **Python-Jose** - JWT token creation and verification
- **Cryptography** - Fernet encryption for files
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **React Router 6** - Navigation
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling

## 📖 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

#### Images
- `GET /api/images/my-images` - Get user's images
- `GET /api/images/other-users-images` - Get other users' images
- `POST /api/images/` - Upload new image
- `GET /api/images/{id}` - Get image details
- `GET /api/images/{id}/file` - Get image file (decrypted)
- `PUT /api/images/{id}` - Update image (owner only)
- `DELETE /api/images/{id}` - Delete image (owner only)

#### Comments
- `POST /api/comments/` - Create comment
- `GET /api/comments/image/{id}` - Get image comments

## 🔒 Security Implementation Details

### Password Hashing
```python
# Passwords are hashed before storage
hashed_password = get_password_hash(plain_password)

# Verification during login
verify_password(plain_password, hashed_password)
```

### File Encryption
```python
# Encryption before saving
encrypted_content = cipher_suite.encrypt(file_content)

# Decryption when serving
decrypted_content = cipher_suite.decrypt(encrypted_content)
```

### JWT Authentication
```python
# Token creation
access_token = create_access_token(data={"sub": username})

# Token verification
current_user = get_current_user(token)
```

## 🎨 Frontend Features

- Responsive design
- Modern gradient background
- Card-based layout for images
- Modal dialogs for upload/edit
- Form validation
- Error handling
- Loading states
- Protected routes

## 📝 Usage

1. **Register** a new account with username and password
2. **Login** to access the platform
3. **Upload** images from "My Images" page
4. **Browse** other users' images in "Explore" page
5. **Comment** on any image by clicking on it
6. **Edit/Delete** your own images as needed

## ⚙️ Configuration

### Backend Configuration (.env)
```env
SECRET_KEY=your-secret-key-for-jwt
ENCRYPTION_KEY=your-fernet-encryption-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Generating New Keys
```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# Generate ENCRYPTION_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## 🛡️ Security Considerations

- Passwords are hashed with bcrypt (not stored in plain text)
- Images are encrypted at rest (unreadable if server files accessed directly)
- JWT tokens for stateless authentication
- CORS configured for frontend-backend communication
- Input validation on both frontend and backend
- Protected routes require authentication

## 📄 License

This project is created for educational purposes demonstrating security features in web applications.
