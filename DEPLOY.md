# Guía de Despliegue con Docker

Este proyecto está contenerizado para facilitar su despliegue en cualquier máquina que tenga Docker instalado.

## Requisitos Previos

- [Docker](https://www.docker.com/get-started) instalado.
- [Docker Compose](https://docs.docker.com/compose/install/) (normalmente viene con Docker Desktop o las versiones recientes de Docker).

## Pasos para Desplegar

1. **Copiar el proyecto**: Asegúrate de tener toda la carpeta del proyecto en tu máquina.

2. **Configurar variables de entorno**:
   - Copia el archivo `.env.example` y renómbralo a `.env`:
     ```bash
     cp .env.example .env
     ```
   - (Opcional) Edita el archivo `.env` con tus propias claves si es necesario. Para probar, las claves de ejemplo pueden servir, pero necesitarás credenciales válidas de Google para el login.

3. **Certificados SSL**:
   - El proyecto ya incluye certificados autofirmados en `certs/nginx/` para que funcione HTTPS en `localhost`.
   - Si necesitas regenerarlos o usar los tuyos propios, colócalos en `certs/nginx/` con los nombres `server.crt` y `server.key`.

4. **Iniciar la aplicación**:
   Abre una terminal en la raíz del proyecto y ejecuta:

   ```bash
   docker compose up -d --build
   ```

   Esto descargará las imágenes necesarias, construirá el frontend y el backend, y levantará los servicios.

5. **Acceder a la aplicación**:
   - Abre tu navegador en: **https://localhost:3000**
   - (Nota: Al usar certificados autofirmados, el navegador te mostrará una advertencia de seguridad. Debes aceptarla para continuar).

## Comandos Útiles

- **Ver logs**: `docker compose logs -f`
- **Detener la aplicación**: `docker compose down`
- **Reiniciar desde cero (borrando datos)**: `docker compose down -v`
