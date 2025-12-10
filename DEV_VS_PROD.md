# Development vs. Production Architecture

This document explains the architectural differences between the local development environment and the production Docker setup, specifically focusing on the role of Vite and NGINX.

## 1. Why Vite for Development?

Vite is used in the development phase primarily to enhance the **developer experience**. It solves the latency issues common in modern frontend development.

*   **Hot Module Replacement (HMR)**: This is the key feature. When you save a `.jsx` or `.css` file, Vite injects the change into the browser **instantly** without reloading the entire page. This preserves the application state (e.g., open modals or form data are not lost).
*   **Instant Start**: Unlike older tools (like Webpack) that had to "bundle" the entire application before starting, Vite serves files as they are (using native browser ES modules). The server starts in milliseconds.
*   **Development Proxy**: Vite acts as an intermediary. As seen in `vite.config.js`, if the frontend requests `/api/login`, Vite silently proxies it to the backend at `https://localhost:8000`. This avoids CORS issues and simulates how the application will work in production.

## 2. Architecture Comparison

### A. Development Version (Vite)
*Goal: Coding speed and debugging.*

1.  **Execution**: You run `npm run dev`. This starts a **Node.js** server on your machine.
2.  **Processing**:
    *   The browser requests `App.jsx`.
    *   The Vite server reads the file from disk, compiles it "on the fly" (converts JSX to JS), and sends it to the browser.
    *   **No final file exists**: Everything happens in memory and on demand.
3.  **Traffic**:
    *   **Frontend**: Served by the Vite development server (port 3000).
    *   **Backend**: Vite proxies API requests to the Python process.

### B. Production Version (NGINX + Docker)
*Goal: Performance, security, and portability.*

1.  **Build Process**:
    *   Before starting, Docker runs `npm run build`.
    *   Vite takes all the source code and creates optimized static files (`index.html`, `assets/index-a1b2.js`, `assets/style-c3d4.css`).      
    *   **Node.js is no longer needed**: The result is simple text/binary files.
2.  **Execution**:
    *   The NGINX container starts and simply "serves" these generated static files.
    *   It is significantly faster because there is no compilation or logic involved; it is just delivering files.
3.  **Traffic**:
    *   NGINX receives all requests. If the path is `/api`, it forwards the request to the backend (internal Docker network). If it is `/`, it serves the `index.html`.

## 3. Summary Comparison

| Feature | Development (Vite) | Production (NGINX) |
| :--- | :--- | :--- |
| **Engine** | Node.js (JavaScript) | NGINX (Optimized C binary) |
| **Code** | Compiled in real-time upon request | Pre-compiled and minified (Build) |
| **Changes** | HMR (Instant reflection on save) | Requires rebuilding the Docker image |
| **Files** | Hundreds of small files loading | Few optimized and cached files |
| **Role** | Productivity Tool | High-Performance Web Server |
