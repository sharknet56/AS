# System Architecture and Security Implementation

## Application Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         User's Browser                            │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend                             │ │
│  │                    (Port 3000)                                │ │
│  │                                                               │ │
│  │  • User Authentication (Login/Register)                      │ │
│  │  • Image Upload & Management                                 │ │
│  │  • Browse & Comment Features                                 │ │
│  │  • JWT Token Storage (localStorage)                          │ │
│  └──────────────────┬────────────────────────────────────────────┘ │
└────────────────────┼─────────────────────────────────────────────┘
                     │
                     │ HTTPS/HTTP (REST API)
                     │ JWT Bearer Token in Headers
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│                    FastAPI Backend Server                         │
│                    (Port 8000)                                    │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Authentication Layer                          │  │
│  │  • JWT Token Validation                                   │  │
│  │  • User Session Management                                │  │
│  │  • Password Hashing (bcrypt)                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Business Logic Layer                          │  │
│  │  • Image CRUD Operations                                  │  │
│  │  • Comment Management                                     │  │
│  │  • Permission Validation                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Encryption Layer                              │  │
│  │  • File Encryption (Fernet/AES-128)                       │  │
│  │  • Encrypt on Upload                                      │  │
│  │  • Decrypt on Download                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────┬────────────────────────────┬──────────────┐   │
│  │              │                            │              │   │
└──┼──────────────┼────────────────────────────┼──────────────┼───┘
   │              │                            │              │
   │              │                            │              │
   ▼              ▼                            ▼              ▼
┌──────────┐  ┌──────────┐              ┌──────────┐  ┌──────────┐
│  SQLite  │  │  Users   │              │  Images  │  │ Comments │
│ Database │  │  Table   │              │  Table   │  │  Table   │
│          │  ├──────────┤              ├──────────┤  ├──────────┤
│ (app.db) │  │ id       │              │ id       │  │ id       │
│          │  │ username │              │ title    │  │ content  │
│          │  │ hashed_  │              │ desc     │  │ image_id │
│          │  │ password │              │ enc_path │  │ author_id│
│          │  │ created  │              │ owner_id │  │ created  │
└──────────┘  └──────────┘              └──────────┘  └──────────┘

                                    ┌──────────────────────────┐
                                    │   File System (uploads/) │
                                    │                          │
                                    │  enc_image1.jpg (🔒)    │
                                    │  enc_image2.png (🔒)    │
                                    │  enc_image3.gif (🔒)    │
                                    │                          │
                                    │  All files encrypted!    │
                                    └──────────────────────────┘
```

## Security Flow Diagrams

### 1. User Registration & Password Hashing

```
User Input                    Backend Processing                Database Storage
───────────                   ──────────────────                ────────────────

username: "alice"
password: "secret123"
         │                           
         │  POST /api/auth/register
         └──────────────►  Validate input
                          Check username unique
                                │
                          Generate bcrypt hash
                          password = bcrypt.hash("secret123")
                                │
                          Result: "$2b$12$KIX..."
                                │
                                └──────────────► Store in DB:
                                                 username: "alice"
                                                 hashed_password: "$2b$12$KIX..."
                                                 
         ◄─────────────────────────────────────
         Success: User created!
```

### 2. User Login & JWT Token Generation

```
User Input                    Backend Processing                Token Generation
───────────                   ──────────────────                ────────────────

username: "alice"
password: "secret123"
         │                           
         │  POST /api/auth/login
         └──────────────►  Query user from DB
                                │
                          Retrieve hashed password
                          hash = "$2b$12$KIX..."
                                │
                          Verify password:
                          bcrypt.verify("secret123", hash)
                                │
                                ✓ Match!
                                │
                          Generate JWT:
                          {
                            "sub": "alice",
                            "exp": timestamp
                          }
                                │
                          Sign with SECRET_KEY
                                │
         ◄─────────────────────┘
         Response:
         {
           "access_token": "eyJhbGc...",
           "token_type": "bearer"
         }
                          
Client stores token in localStorage
```

### 3. Image Upload with Encryption

```
User Action                   Backend Processing                  File System
───────────                   ──────────────────                  ───────────

Select image file
"vacation.jpg"
         │                           
         │  POST /api/images/
         │  Headers: Authorization: Bearer <token>
         │  Body: file + title + description
         └──────────────►  Validate JWT token
                                │
                          Extract user from token
                          user_id = 1 (alice)
                                │
                          Read file bytes
                          content = <binary data>
                                │
                          ENCRYPT with Fernet:
                          encrypted = cipher.encrypt(content)
                                │
                          Generate unique filename
                          filename = "enc_uuid_vacation.jpg"
                                │
                                ├──────────────► Save encrypted file
                                │                to uploads/ dir
                                │                
                          Save to database:             
                          - title: "My Vacation"
                          - encrypted_file_path: "uploads/enc_..."
                          - owner_id: 1
                                │
         ◄─────────────────────┘
         Success: Image uploaded!
```

### 4. Image Download with Decryption

```
User Action                   Backend Processing                  Response
───────────                   ──────────────────                  ────────

Click on image
         │                           
         │  GET /api/images/123/file
         │  Headers: Authorization: Bearer <token>
         └──────────────►  Validate JWT token
                                │
                          Query image from DB
                          image = get_image(123)
                                │
                          Read encrypted file
                          path = image.encrypted_file_path
                          encrypted_data = read(path)
                                │
                          DECRYPT with Fernet:
                          decrypted = cipher.decrypt(encrypted_data)
                                │
         ◄─────────────────────┘
         Binary image data (decrypted)
         Display in browser
```

### 5. Permission Control Flow

```
User Request                  Authorization Check                  Action
────────────                  ───────────────────                  ──────

GET /api/images/other-users-images
         │                           
         └──────────────►  Check JWT token ✓
                          Any authenticated user
                                │
                          Return all images
                          where owner_id != current_user.id
                                │
         ◄─────────────────────┘
         ✓ Success


PUT /api/images/123 (update)
         │                           
         └──────────────►  Check JWT token ✓
                          current_user.id = 1
                                │
                          Get image owner_id = 2
                                │
                          owner_id != current_user.id
                                │
         ◄─────────────────────┘
         ✗ Error: 403 Forbidden


POST /api/comments/
         │                           
         └──────────────►  Check JWT token ✓
                          Check image exists ✓
                                │
                          Any user can comment
                                │
         ◄─────────────────────┘
         ✓ Success: Comment created
```

## Data Flow

### Complete User Journey

```
1. REGISTRATION
   User → Frontend → Backend → Hash Password → Save to DB
   
2. LOGIN
   User → Frontend → Backend → Verify Hash → Generate JWT → Return Token
   
3. UPLOAD IMAGE
   User → Frontend → Backend → Verify JWT → Encrypt File → Save File → Save Metadata → Success
   
4. VIEW IMAGE
   User → Frontend → Backend → Verify JWT → Check Permissions → Decrypt File → Return Image
   
5. COMMENT
   User → Frontend → Backend → Verify JWT → Check Image Exists → Save Comment → Success
   
6. LOGOUT
   User → Frontend → Clear Token from localStorage
```

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Transport Security (Future: HTTPS/TLS)          │
│  • Encrypted communication channel                         │
└────────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication (JWT)                             │
│  • Token-based authentication                              │
│  • Stateless session management                            │
│  • Token expiration                                        │
└────────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Authorization (Permissions)                      │
│  • Owner can CRUD their images                             │
│  • Others can only Read and Comment                        │
│  • Route-level permission checks                           │
└────────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Password Security (bcrypt)                       │
│  • One-way hashing                                         │
│  • Salt per password                                       │
│  • Configurable cost factor                                │
└────────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────────┐
│  Layer 5: Data Encryption at Rest (Fernet)                │
│  • AES-128 encryption                                      │
│  • Files encrypted before disk storage                     │
│  • Symmetric key cryptography                              │
└────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

```
Frontend Stack:
├── React 18 (UI Framework)
├── React Router 6 (Navigation)
├── Axios (HTTP Client)
└── Vite (Build Tool)

Backend Stack:
├── FastAPI (Web Framework)
├── SQLAlchemy (ORM)
├── SQLite (Database)
├── Passlib + bcrypt (Password Hashing)
├── Python-Jose (JWT)
├── Cryptography/Fernet (File Encryption)
└── Uvicorn (ASGI Server)

Security Stack:
├── bcrypt (Password Hashing)
├── JWT (Authentication)
├── Fernet/AES-128 (File Encryption)
└── CORS (Cross-Origin Protection)
```
