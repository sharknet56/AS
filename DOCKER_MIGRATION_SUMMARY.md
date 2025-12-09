# Resumen de Cambios: Migración a Docker y Producción

Este documento resume las modificaciones realizadas para transformar el entorno de desarrollo local en una arquitectura de producción robusta y portable utilizando Docker.

## 🎯 Objetivo Principal
El objetivo era crear una versión de producción de la aplicación que fuera fácil de desplegar, segura (HTTPS) y que no dependiera de servidores de desarrollo (como `vite dev`) para funcionar.

## 🏗️ Cambios en la Arquitectura

### Antes (Desarrollo)
- **Frontend**: Ejecutado directamente con `npm run dev` (Vite).
- **Backend**: Ejecutado directamente con Python/Uvicorn.
- **HTTPS**: Gestionado individualmente por cada servicio con certificados locales.

### Ahora (Producción con Docker)
Hemos encapsulado toda la aplicación en **contenedores**, lo que garantiza que funcione igual en cualquier máquina.

1.  **Orquestación (Docker Compose)**:
    - Se creó un archivo `docker-compose.yml` que levanta y conecta todos los servicios automáticamente.
    - Gestiona la red interna para que el frontend y el backend se comuniquen de forma segura.

2.  **Frontend (NGINX + React)**:
    - Ya no usamos el servidor de desarrollo de Vite.
    - Ahora, Docker **construye** la aplicación de React (genera los archivos estáticos HTML/JS/CSS).
    - Un servidor **NGINX** de alto rendimiento sirve estos archivos y actúa como **Proxy Inverso**.

3.  **Backend (FastAPI)**:
    - Se ejecuta en su propio contenedor aislado con todas las dependencias de Python instaladas automáticamente.
    - Solo es accesible a través de la red interna de Docker o mediante el proxy de NGINX.

## 🔒 Seguridad y HTTPS
- **NGINX como Guardián**: NGINX ahora maneja la encriptación HTTPS (puerto 443). Recibe las peticiones del usuario, desencripta el tráfico y lo envía al backend o sirve el frontend según corresponda.
- **Certificados**: Se configuró el contenedor para usar certificados SSL (autofirmados para este entorno) de forma automática.

### 🛡️ Hardening y Protección Avanzada (NUEVO)
Hemos implementado medidas de seguridad adicionales para proteger la infraestructura contra ataques comunes:

1.  **Protección contra DoS (Denegación de Servicio)**:
    - **Rate Limiting**: Limitamos a 10 peticiones por segundo por IP.
    - **Connection Limiting**: Máximo 10 conexiones simultáneas por IP.
    - Esto evita que atacantes saturen el servidor con tráfico masivo.

2.  **Protección contra XSS (Cross-Site Scripting)**:
    - Implementamos una **Content Security Policy (CSP)** estricta.
    - Solo se permite ejecutar scripts del propio dominio y de Google (necesario para OAuth). Cualquier otro script inyectado será bloqueado por el navegador.

3.  **Protección de Infraestructura**:
    - **Límites de Recursos**: Los contenedores tienen límites estrictos de CPU (0.5 cores) y RAM (256MB/512MB) para evitar que un proceso descontrolado congele el servidor.
    - **Límite de Subida**: Se restringe el tamaño de archivos a 10MB para evitar saturación de disco.

4.  **Cabeceras de Seguridad HTTP**:
    - **HSTS**: Fuerza al navegador a usar siempre HTTPS.
    - **X-Frame-Options**: Evita ataques de Clickjacking.
    - **X-Content-Type-Options**: Evita ataques de tipo MIME.


## 🛠️ Soluciones Específicas Implementadas

### Compatibilidad con Google OAuth
Google Login requiere una "origen" específico registrado (en este caso, `https://localhost:3000`).
- **Solución**: Configuramos Docker para que, además de los puertos estándar (80/443), también escuche en el puerto **3000** y lo redirija internamente al servicio seguro. Esto permite que el login de Google siga funcionando sin cambiar la configuración en la consola de Google Cloud.

### Limpieza de Historial Git
Durante el proceso, se introdujeron accidentalmente credenciales en el historial de versiones.
- **Solución**: Se reescribió el historial de Git (`git reset` y `git commit --amend`) para eliminar cualquier rastro de las claves secretas antes de subir los cambios al repositorio remoto, garantizando la seguridad del proyecto.

## 🚀 Beneficios Obtenidos
- **Portabilidad Total**: Ahora puedes llevar el proyecto a cualquier ordenador con Docker instalado y funcionará con un solo comando (`docker compose up`).
- **Entorno Limpio**: No es necesario instalar Node.js, Python o bases de datos en la máquina anfitriona; todo vive dentro de Docker.
- **Persistencia**: Los datos de la base de datos se guardan en volúmenes de Docker, por lo que no se pierden al reiniciar los contenedores (a menos que se solicite explícitamente).
