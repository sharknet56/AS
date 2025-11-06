# 🚀 Quick Setup Guide

## Automated Setup (Recommended)

### Option 1: Using the Startup Script

1. Make sure you have Python 3.8+ and Node.js 16+ installed
2. Navigate to the project directory:
   ```bash
   cd AS_test2
   ```
3. Run the startup script:
   ```bash
   ./start.sh
   ```

The script will:
- Create Python virtual environment (if needed)
- Install all Python dependencies
- Install all Node.js dependencies
- Start both backend and frontend servers

To stop the application:
```bash
./stop.sh
```

---

## Manual Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate virtual environment:
   - **Linux/Mac**: `source venv/bin/activate`
   - **Windows**: `venv\Scripts\activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

Backend will run at: **http://localhost:8000**
API documentation: **http://localhost:8000/docs**

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run at: **http://localhost:3000**

---

## First Time Usage

1. Open your browser and go to http://localhost:3000
2. Click "Register" and create a new account
3. Login with your credentials
4. Start uploading images from "My Images" page
5. Explore other users' images in "Explore" page

---

## Testing the Security Features

### 1. Password Hashing
- Register a new user
- Check the database file `backend/app.db` (use SQLite browser)
- Verify that passwords are stored as bcrypt hashes, not plain text

### 2. File Encryption at Rest
- Upload an image
- Navigate to `backend/uploads/` directory
- Try to open the encrypted files - they will be unreadable
- The files are automatically decrypted when viewed through the application

### 3. JWT Authentication
- Login and check browser localStorage (F12 → Application → Local Storage)
- You'll see the JWT token stored
- This token is automatically sent with each API request

---

## Common Issues

### Port Already in Use
If port 8000 or 3000 is already in use:

**Backend (port 8000):**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Frontend (port 3000):**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Python Virtual Environment Issues
If you have issues with the virtual environment:
```bash
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Node Modules Issues
If you have issues with node_modules:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## Project Features

✅ **User Authentication**: Register, login, logout with JWT tokens
✅ **Password Security**: Bcrypt hashing for all passwords
✅ **File Encryption**: Images encrypted at rest using Fernet
✅ **Image Management**: Upload, view, edit, delete images
✅ **Comments**: Comment on any image
✅ **Permissions**: Full control over own images, read-only for others
✅ **Responsive Design**: Works on desktop and mobile
✅ **API Documentation**: Interactive Swagger UI at /docs

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   React     │  HTTP   │   FastAPI    │  ORM    │   SQLite     │
│  Frontend   │ ◄─────► │   Backend    │ ◄─────► │   Database   │
│ (Port 3000) │         │ (Port 8000)  │         │   (app.db)   │
└─────────────┘         └──────────────┘         └──────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │  Encrypted   │
                        │   Files      │
                        │ (/uploads)   │
                        └──────────────┘
```

---

## Security Implementation Summary

1. **Password Hashing** (`backend/app/security.py`):
   - Uses bcrypt for one-way password hashing
   - Configurable cost factor for hash strength
   - Never stores plain text passwords

2. **File Encryption** (`backend/app/encryption.py`):
   - Fernet symmetric encryption (AES-128 in CBC mode)
   - Files encrypted before disk storage
   - Decrypted on-the-fly when requested
   - Encryption key stored in environment variables

3. **JWT Authentication** (`backend/app/security.py`, `backend/app/dependencies.py`):
   - Stateless token-based authentication
   - Tokens signed with HS256 algorithm
   - Configurable expiration time
   - Automatic token verification on protected routes

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)

### Images
- `GET /api/images/my-images` - Get current user's images
- `GET /api/images/other-users-images` - Get other users' images
- `POST /api/images/` - Upload new image
- `GET /api/images/{id}` - Get image details with comments
- `GET /api/images/{id}/file` - Download image file (decrypted)
- `PUT /api/images/{id}` - Update image metadata
- `DELETE /api/images/{id}` - Delete image

### Comments
- `POST /api/comments/` - Create comment
- `GET /api/comments/image/{id}` - Get all comments for an image

---

## Need Help?

- Backend documentation: http://localhost:8000/docs
- Check logs: `backend.log` and `frontend.log`
- Review README files in `backend/` and `frontend/` directories
