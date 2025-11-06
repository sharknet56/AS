# 🚀 Quick Reference Card

## Start/Stop Commands

```bash
# Start everything (automated)
./start.sh

# Stop everything
./stop.sh

# Manual backend start
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Manual frontend start
cd frontend
npm run dev
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Default Test Users

```
Username: testuser1
Password: password123

Username: testuser2  
Password: password456
```

## Project Structure

```
AS_test2/
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── routers/  # API endpoints
│   │   ├── main.py   # FastAPI app
│   │   ├── models.py # Database models
│   │   ├── security.py   # Password & JWT
│   │   └── encryption.py # File encryption
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # Reusable components
│   │   └── services/ # API calls
│   └── package.json
└── README.md
```

## Security Features

| Feature | Technology | Location |
|---------|-----------|----------|
| Password Hashing | bcrypt | `backend/app/security.py` |
| File Encryption | Fernet (AES-128) | `backend/app/encryption.py` |
| Authentication | JWT | `backend/app/security.py` |
| Authorization | Role-based | `backend/app/routers/*` |

## Common Tasks

### Create new user
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=newuser&password=pass123"
```

### Check database
```bash
cd backend
sqlite3 app.db "SELECT * FROM users;"
```

### View encrypted files
```bash
ls -la backend/uploads/
```

### View logs
```bash
tail -f backend.log
tail -f frontend.log
```

## API Endpoints Quick Ref

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login

### Images
- `GET /api/images/my-images` - My images
- `GET /api/images/other-users-images` - Others' images
- `POST /api/images/` - Upload image
- `GET /api/images/{id}` - Get image details
- `PUT /api/images/{id}` - Update image
- `DELETE /api/images/{id}` - Delete image
- `GET /api/images/{id}/file` - Download image

### Comments
- `POST /api/comments/` - Create comment
- `GET /api/comments/image/{id}` - Get comments

## Troubleshooting

### Port already in use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Reset database
```bash
cd backend
rm app.db
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### Reinstall dependencies
```bash
# Backend
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules
npm install
```

## File Locations

| What | Where |
|------|-------|
| Database | `backend/app.db` |
| Encrypted files | `backend/uploads/` |
| Environment config | `backend/.env` |
| Backend logs | `backend.log` |
| Frontend logs | `frontend.log` |
| JWT tokens | Browser localStorage |

## Security Keys

### Generate new SECRET_KEY
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Generate new ENCRYPTION_KEY
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Development Workflow

1. Start services: `./start.sh`
2. Open browser: http://localhost:3000
3. Register/Login
4. Upload images
5. Test features
6. Stop services: `./stop.sh`

## Testing Checklist

- [ ] Register new user → Password hashed in DB
- [ ] Login → JWT token in localStorage
- [ ] Upload image → File encrypted in uploads/
- [ ] View image → Decrypted and displayed
- [ ] Edit own image → Success
- [ ] Try edit others' image → 403 Forbidden
- [ ] Add comment → Success
- [ ] Logout → Token cleared

## Documentation

- Main README: `README.md`
- Setup Guide: `SETUP.md`
- Architecture: `ARCHITECTURE.md`
- Testing Guide: `TESTING.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

## Quick Debug

```bash
# Check if backend is running
curl http://localhost:8000/health

# Check if frontend is running
curl http://localhost:3000

# View recent logs
tail -20 backend.log
tail -20 frontend.log

# Check Python environment
cd backend
source venv/bin/activate
python --version
pip list

# Check Node environment
cd frontend
node --version
npm list
```
