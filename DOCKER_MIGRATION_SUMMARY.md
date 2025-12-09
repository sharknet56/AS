# Change Summary: Docker Migration and Production Setup

This document summarizes the modifications made to transform the local development environment into a robust and portable production architecture using Docker.

## 🎯 Main Objective
The goal was to create a production version of the application that is easy to deploy, secure (HTTPS), and does not rely on development servers (like `vite dev`) to function.

## 🏗️ Architecture Changes

### Before (Development)
- **Frontend**: Ran directly with `npm run dev` (Vite).
- **Backend**: Ran directly with Python/Uvicorn.
- **HTTPS**: Managed individually by each service with local certificates.

### Now (Production with Docker)
We have encapsulated the entire application in **containers**, ensuring it works identically on any machine.

1.  **Orchestration (Docker Compose)**:
    - Created a `docker-compose.yml` file that automatically starts and connects all services.
    - Manages the internal network so the frontend and backend communicate securely.

2.  **Frontend (NGINX + React)**:
    - We no longer use the Vite development server.
    - Docker now **builds** the React application (generating static HTML/JS/CSS files).
    - A high-performance **NGINX** server serves these files and acts as a **Reverse Proxy**.

3.  **Backend (FastAPI)**:
    - Runs in its own isolated container with all Python dependencies installed automatically.
    - Only accessible through the internal Docker network or via the NGINX proxy.

## 🔒 Security and HTTPS
- **NGINX as Guardian**: NGINX now handles HTTPS encryption (port 443). It receives user requests, decrypts traffic, and forwards it to the backend or serves the frontend as appropriate.
- **Certificates**: The container was configured to use SSL certificates (self-signed for this environment) automatically.

### 🛡️ Hardening and Advanced Protection (NEW)
We have implemented additional security measures to protect the infrastructure against common attacks:

1.  **DoS Protection (Denial of Service)**:
    - **Rate Limiting**: Limited to 10 requests per second per IP.
    - **Connection Limiting**: Maximum 10 simultaneous connections per IP.
    - This prevents attackers from saturating the server with massive traffic.

2.  **XSS Protection (Cross-Site Scripting)**:
    - Implemented a strict **Content Security Policy (CSP)**.
    - Only scripts from the own domain and Google (required for OAuth) are allowed to execute. Any other injected script will be blocked by the browser.

3.  **Infrastructure Protection**:
    - **Resource Limits**: Containers have strict CPU (0.5 cores) and RAM (256MB/512MB) limits to prevent a runaway process from freezing the server.
    - **Upload Limit**: File size is restricted to 10MB to prevent disk saturation.

4.  **HTTP Security Headers**:
    - **HSTS**: Forces the browser to always use HTTPS.
    - **X-Frame-Options**: Prevents Clickjacking attacks.
    - **X-Content-Type-Options**: Prevents MIME type sniffing attacks.

## 🛠️ Specific Solutions Implemented

### Google OAuth Compatibility
Google Login requires a specific registered "origin" (in this case, `https://localhost:3000`).
- **Solution**: We configured Docker to listen on port **3000** (in addition to standard ports 80/443) and redirect it internally to the secure service. This allows Google login to continue working without changing the configuration in the Google Cloud console.

### Git History Cleanup
During the process, credentials were accidentally introduced into the version history.
- **Solution**: The Git history was rewritten (`git reset` and `git commit --amend`) to remove any trace of secret keys before pushing changes to the remote repository, ensuring project security.

## 🐛 Problems Found and Solved

### 1. Image Persistence (Error 500)
- **Problem**: Uploaded images disappeared when restarting the container because they were saved in a temporary folder (`/app/uploads`). The database kept the reference, but the physical file no longer existed, causing 500 errors.
- **Solution**:
    - Configured a persistent volume in Docker for `/data`.
    - Modified the backend to save images in `/data/uploads`.
    - Now files survive container restarts and updates.

### 2. Preview Blocking (CSP vs Blob)
- **Problem**: The security policy (CSP) was so strict that it blocked `blob:` URLs that the frontend uses to preview images before uploading.
- **Solution**: Adjusted the `img-src` directive in NGINX to explicitly allow `blob:`.

### 3. Google Logo Blocked
- **Problem**: The "Sign in with Google" logo was not loading. The CSP blocked loading from `developers.google.com`, and adding external exceptions complicated security.
- **Solution**:
    - Downloaded the official logo and saved it locally in `frontend/src/assets/`.
    - Updated the Login component to serve the image from the server itself.
    - This improves speed, privacy, and eliminates unnecessary external dependencies.

## 🚀 Benefits Achieved
- **Total Portability**: You can now take the project to any computer with Docker installed, and it will work with a single command (`docker compose up`).
- **Clean Environment**: No need to install Node.js, Python, or databases on the host machine; everything lives inside Docker.
- **Persistence**: Database data is saved in Docker volumes, so it is not lost when restarting containers (unless explicitly requested).
