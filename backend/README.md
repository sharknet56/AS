# Image Sharing Application - Backend

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. The `.env` file is already configured with sample keys. For production, generate new keys:
```bash
# Generate a new SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"

# Generate a new ENCRYPTION_KEY
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

4. Run the application:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Access the API documentation at: http://localhost:8000/docs

## Security Features Implemented

### 1. Password Hashing (bcrypt)
- User passwords are hashed using bcrypt before storing in the database
- Implemented in `app/security.py`
- Used during registration and login

### 2. File Encryption at Rest (Fernet)
- All uploaded images are encrypted before saving to disk
- Encryption key stored in environment variables
- Files are decrypted on-the-fly when requested
- Implemented in `app/encryption.py`

### 3. JWT Authentication
- Token-based authentication for API endpoints
- Tokens expire after 30 minutes (configurable)
- Protected routes require valid JWT token

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token
- GET `/api/auth/me` - Get current user info

### Images
- POST `/api/images/` - Upload new image (owner only)
- GET `/api/images/my-images` - Get user's own images
- GET `/api/images/other-users-images` - Get other users' images
- GET `/api/images/{image_id}` - Get image details with comments
- GET `/api/images/{image_id}/file` - Get actual image file
- PUT `/api/images/{image_id}` - Update image (owner only)
- DELETE `/api/images/{image_id}` - Delete image (owner only)

### Comments
- POST `/api/comments/` - Create comment on an image
- GET `/api/comments/image/{image_id}` - Get all comments for an image

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── security.py          # Password hashing & JWT
│   ├── encryption.py        # File encryption
│   ├── dependencies.py      # Auth dependencies
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Authentication routes
│       ├── images.py        # Image CRUD routes
│       └── comments.py      # Comment routes
├── requirements.txt
├── .env                     # Environment variables
└── README.md
```
