# Image Sharing Platform

## Project Description
A secure functional web application that allows users to register, log in (via standard credentials or Google OAuth), manage a private encrypted image portfolio, and explore or comment on other users' images.

## Security Features
* **Certificate & HTTPS:** Implements HTTPS using a custom Certificate Authority (CA) and server certificates to enforce secure connections.
* **Authentication:** Utilizes Google OAuth 2.0 and stateless JSON Web Tokens (JWT) for secure session management.
* **Encryption at Rest:** Images are encrypted/decrypted on the server using the Fernet algorithm (AES128-CBC with HMAC-SHA256).
* **Database Encryption:** Critical database columns are automatically encrypted and decrypted using SQLAlchemy.
* **Password Protection:** User passwords are secured using bcrypt hashing to prevent compromise in case of data leaks.
* **Secret Management:** Critical keys are automatically generated, encrypted with AES-256-CBC, and only decrypted ephemerally in memory.
* **Docker Containerization:** The entire application is encapsulated in Docker containers to ensure environment isolation and reproducibility.
* **Reverse Proxy (NGINX):** Acts as a single entry point handling SSL termination and hiding the internal backend topology.
* **DoS Protection:** Implements rate limiting and resource connection limits to mitigate Denial of Service attacks.
* **Security Headers:** Enforces strict HTTP headers including HSTS, X-Frame-Options, and CSP to prevent common web attacks.
* **Dependency Auditing:** Automated vulnerability scanning using OWASP Dependency-Check and npm audit.
* **Login Protection:** Limits consecutive failed login attempts to prevent brute-force and credential-stuffing attacks.

## Development Environment
The application has been configured and tested in the following environment:
* **Node.js:** v25.2.0
* **Python:** v3.12
* **OS:** Ubuntu 24.04.3 LTS
* **Linux Kernel:** 6.14.0-36-generic

## Usage

### Prerequisites
Ensure `docker.io` is installed on your system.
```bash
sudo apt install docker.io
```

### Execution

Run the following commands in the project root directory:

**Start the application:**

```bash
docker compose up -d --build
```

### Accessing the Application

Once the application is running, open your browser and navigate to:
**https://localhost:3000**

> **Note:** If you cannot connect, ensure that port 3000 is not being used by another application.

**Important:** To avoid security warnings, you must import the CA certificate located at `certs/ca/cacert.pem` into your browser's trusted authorities.

**Stop the application:**

```bash
docker compose down
```
