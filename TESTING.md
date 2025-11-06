# Testing Guide

## Manual Testing Scenarios

### 1. Test User Registration and Password Hashing

#### Steps:
1. Start the application
2. Navigate to http://localhost:3000
3. Click "Register"
4. Create a user:
   - Username: `testuser1`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click "Register"

#### Verification:
- [ ] Registration succeeds
- [ ] User is automatically logged in
- [ ] Check database: `backend/app.db`
  - Open with SQLite browser or command line
  - Query: `SELECT * FROM users WHERE username='testuser1'`
  - Verify `hashed_password` starts with `$2b$` (bcrypt hash)
  - Verify password is NOT stored in plain text

#### Expected Result:
```sql
id | username   | hashed_password                                        | created_at
1  | testuser1  | $2b$12$KIXlZHHlkjsdfljksdfj... (long hash string)       | 2025-11-06...
```

✅ **Security Feature Verified**: Passwords are hashed with bcrypt

---

### 2. Test User Login and JWT Token

#### Steps:
1. Logout if already logged in
2. Click "Login"
3. Enter credentials:
   - Username: `testuser1`
   - Password: `password123`
4. Click "Login"

#### Verification:
- [ ] Login succeeds
- [ ] User is redirected to "My Images" page
- [ ] Open browser DevTools (F12)
- [ ] Go to Application → Local Storage → http://localhost:3000
- [ ] Check for `token` key
- [ ] Verify token format: three parts separated by dots (header.payload.signature)

#### Expected Result:
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlcjEiLCJleHAiOjE2OTk...
```

✅ **Security Feature Verified**: JWT token-based authentication

---

### 3. Test Image Upload and Encryption at Rest

#### Steps:
1. Login as `testuser1`
2. Go to "My Images"
3. Click "Upload Image"
4. Select an image file (e.g., a photo)
5. Enter:
   - Title: `Test Image 1`
   - Description: `This is a test image`
6. Click "Upload"

#### Verification:
- [ ] Upload succeeds
- [ ] Image appears in "My Images" page
- [ ] Check file system: `backend/uploads/` directory
- [ ] Find the encrypted file (starts with `enc_`)
- [ ] Try to open it with an image viewer
- [ ] File should be unreadable/corrupted (it's encrypted!)

#### Command to inspect encrypted file:
```bash
# Navigate to backend directory
cd backend/uploads

# List files
ls -la

# Try to view file metadata
file enc_*

# Try to display as image (should fail or show garbage)
```

#### Expected Result:
- File exists but is encrypted (appears as binary garbage)
- Cannot be viewed directly
- Can only be viewed through the application (which decrypts it)

✅ **Security Feature Verified**: Files are encrypted at rest

---

### 4. Test Image Decryption on Retrieval

#### Steps:
1. Stay logged in as `testuser1`
2. View the uploaded image in "My Images"
3. Click on the image to view details

#### Verification:
- [ ] Image displays correctly in the browser
- [ ] Image is NOT corrupted
- [ ] Image is clear and viewable

#### How it works:
1. Frontend requests: `GET /api/images/1/file`
2. Backend reads encrypted file from disk
3. Backend decrypts file in memory
4. Backend sends decrypted bytes to frontend
5. Frontend displays image

✅ **Security Feature Verified**: Files are decrypted on-the-fly when requested

---

### 5. Test Permission System (Owner Permissions)

#### Steps:
1. Login as `testuser1`
2. Go to "My Images"
3. Click on your image
4. Try to edit the image:
   - Click "Edit"
   - Change title to `Updated Test Image`
   - Click "Save"
5. Try to delete the image:
   - Click "Delete"
   - Confirm deletion

#### Verification:
- [ ] Edit succeeds (owner can edit)
- [ ] Delete succeeds (owner can delete)
- [ ] Image is removed from "My Images"
- [ ] Encrypted file is deleted from `backend/uploads/`

✅ **Security Feature Verified**: Owners have full CRUD permissions

---

### 6. Test Permission System (Non-Owner Permissions)

#### Steps:
1. Create a second user:
   - Logout
   - Register as `testuser2` with password `password456`
2. As `testuser2`, upload an image:
   - Go to "My Images"
   - Upload any image with title `User 2 Image`
3. Logout from `testuser2`
4. Login as `testuser1`
5. Go to "Explore" page
6. Click on `testuser2`'s image

#### Verification:
- [ ] Image is visible
- [ ] Can view full image details
- [ ] **Cannot see Edit button** (not the owner)
- [ ] **Cannot see Delete button** (not the owner)
- [ ] CAN add comments

#### API Test (Optional):
Try to edit another user's image via API:
```bash
# Get your token from localStorage
TOKEN="your-jwt-token-here"

# Try to update image ID 1 (owned by testuser2)
curl -X PUT http://localhost:8000/api/images/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked Title"}'

# Expected response: 403 Forbidden
```

✅ **Security Feature Verified**: Non-owners have read-only permissions

---

### 7. Test Comment Functionality

#### Steps:
1. Login as `testuser1`
2. Go to "Explore"
3. Click on `testuser2`'s image
4. Scroll to comments section
5. Enter a comment: `Nice image!`
6. Click "Post Comment"

#### Verification:
- [ ] Comment is posted successfully
- [ ] Comment appears in the list
- [ ] Comment shows correct author (`testuser1`)
- [ ] Comment shows timestamp
- [ ] Logout and login as `testuser2`
- [ ] View the image
- [ ] Comment from `testuser1` is visible

✅ **Security Feature Verified**: Users can comment on any image

---

### 8. Test JWT Token Expiration

#### Steps:
1. Login to the application
2. Wait 30 minutes (or modify `.env` to reduce `ACCESS_TOKEN_EXPIRE_MINUTES` to 1 for faster testing)
3. Try to navigate to "My Images" or "Explore"

#### Verification:
- [ ] After token expires, requests fail
- [ ] User is redirected to login page
- [ ] Must login again to continue

✅ **Security Feature Verified**: JWT tokens expire and require re-authentication

---

### 9. Test Password Validation

#### Test Cases:

**Short Password:**
- Username: `testuser3`
- Password: `12345` (too short)
- Expected: Error message "Password must be at least 6 characters"

**Password Mismatch:**
- Username: `testuser3`
- Password: `password123`
- Confirm: `password456`
- Expected: Error message "Passwords do not match"

**Valid Password:**
- Username: `testuser3`
- Password: `password123`
- Confirm: `password123`
- Expected: Registration succeeds

✅ **Security Feature Verified**: Password validation works correctly

---

### 10. Test Duplicate Username Prevention

#### Steps:
1. Try to register with an existing username
2. Username: `testuser1` (already exists)
3. Password: `newpassword123`

#### Verification:
- [ ] Registration fails
- [ ] Error message: "Username already registered"

✅ **Security Feature Verified**: Duplicate usernames are prevented

---

## Security Verification Checklist

### Password Security (bcrypt)
- [ ] Passwords are hashed before storage
- [ ] Hash format: `$2b$12$...` (bcrypt identifier + cost + salt + hash)
- [ ] Plain text passwords never stored
- [ ] Password verification works correctly
- [ ] Minimum password length enforced (6 characters)

### File Encryption (Fernet)
- [ ] Files are encrypted before disk storage
- [ ] Encrypted files are unreadable when accessed directly
- [ ] Files are correctly decrypted when viewed through app
- [ ] Encryption key stored in environment variables
- [ ] Different files have different encrypted content (even if identical images)

### JWT Authentication
- [ ] Token generated on successful login
- [ ] Token stored in browser localStorage
- [ ] Token included in API requests (Authorization header)
- [ ] Token validated on protected routes
- [ ] Token contains user information (username in 'sub' claim)
- [ ] Token expires after configured time
- [ ] Expired tokens are rejected

### Authorization & Permissions
- [ ] Authenticated users required for all image/comment operations
- [ ] Owners can create, read, update, delete their images
- [ ] Non-owners can only read and comment on others' images
- [ ] API returns 403 Forbidden when unauthorized
- [ ] Frontend hides edit/delete buttons for non-owners

---

## Automated API Testing (Optional)

### Using curl

```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "apitest", "password": "password123"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=apitest&password=password123"

# Save the returned token
TOKEN="<paste-token-here>"

# 3. Upload image
curl -X POST http://localhost:8000/api/images/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=API Test Image" \
  -F "description=Uploaded via API" \
  -F "file=@/path/to/image.jpg"

# 4. Get my images
curl http://localhost:8000/api/images/my-images \
  -H "Authorization: Bearer $TOKEN"

# 5. Get specific image
curl http://localhost:8000/api/images/1 \
  -H "Authorization: Bearer $TOKEN"

# 6. Update image
curl -X PUT http://localhost:8000/api/images/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "description": "Updated description"}'

# 7. Delete image
curl -X DELETE http://localhost:8000/api/images/1 \
  -H "Authorization: Bearer $TOKEN"

# 8. Post comment
curl -X POST http://localhost:8000/api/comments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image_id": 1, "content": "Great image!"}'
```

---

## Testing the Database

### SQLite Command Line

```bash
# Navigate to backend directory
cd backend

# Open database
sqlite3 app.db

# View all tables
.tables

# View users
SELECT * FROM users;

# View images
SELECT * FROM images;

# View comments
SELECT * FROM comments;

# Check password hashes
SELECT username, hashed_password FROM users;

# Join query to see images with owners
SELECT images.id, images.title, users.username as owner 
FROM images 
JOIN users ON images.owner_id = users.id;

# Exit
.quit
```

---

## Performance Testing (Optional)

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:8000/api/auth/login

# Test image retrieval
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/images/my-images
```

---

## Security Audit Checklist

- [ ] All passwords stored as bcrypt hashes
- [ ] No plain text passwords in database
- [ ] All uploaded files encrypted on disk
- [ ] Encrypted files unreadable without decryption key
- [ ] JWT tokens required for protected routes
- [ ] Tokens expire after configured time
- [ ] Permission checks on all CRUD operations
- [ ] Input validation on all forms
- [ ] CORS properly configured
- [ ] Sensitive keys in environment variables (.env)
- [ ] Error messages don't leak sensitive information

---

## Common Test Scenarios

| Test Case | Expected Result |
|-----------|----------------|
| Register with weak password (< 6 chars) | ❌ Error: Password too short |
| Register with existing username | ❌ Error: Username already exists |
| Login with wrong password | ❌ Error: Incorrect credentials |
| Access protected route without token | ❌ Error: 401 Unauthorized |
| Edit another user's image | ❌ Error: 403 Forbidden |
| Delete another user's image | ❌ Error: 403 Forbidden |
| Comment on any image | ✅ Success |
| Upload image as authenticated user | ✅ Success + File encrypted |
| View own images | ✅ Success + Files decrypted |
| View other users' images | ✅ Success + Files decrypted |
| Logout and try to access protected route | ❌ Redirect to login |

---

## Debugging Tips

### Backend Logs
Check `backend.log` for error messages:
```bash
tail -f backend.log
```

### Frontend Logs
Check browser console (F12 → Console) for errors

### Database Inspection
```bash
cd backend
sqlite3 app.db "SELECT * FROM users;"
sqlite3 app.db "SELECT * FROM images;"
```

### Check Encrypted Files
```bash
cd backend/uploads
ls -la
hexdump -C enc_* | head  # View raw encrypted data
```
