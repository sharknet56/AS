from app.database import SessionLocal
from app.models import User, Image, Comment
from datetime import datetime

# Crea una nueva sesión de base de datos
db = SessionLocal()

# --- Usuarios de ejemplo ---
def get_or_create_user(username, raw_password):
    user = db.query(User).filter_by(username=username).first()
    if user is None:
        user = User(
            username=username,
            hashed_password=raw_password,  # Asignación directa ahora que EncryptedType maneja la encriptación
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

user1 = get_or_create_user("usuario1", "password123")
user2 = get_or_create_user("usuario2", "password456")

# --- Imágenes de ejemplo ---
image1 = Image(
    encrypted_file_path="/ruta/falsa/imagen1.enc",
    original_filename="foto1.jpg",
    owner_id=user1.id,
    title="Imagen de prueba 1",  # Asignación directa ahora que EncryptedType maneja la encriptación
    description="Descripción de la imagen 1",  # Asignación directa ahora que EncryptedType maneja la encriptación
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)

image2 = Image(
    encrypted_file_path="/ruta/falsa/imagen2.enc",
    original_filename="foto2.jpg",
    owner_id=user2.id,
    title="Imagen de prueba 2",  # Asignación directa ahora que EncryptedType maneja la encriptación
    description="Descripción de la imagen 2",  # Asignación directa ahora que EncryptedType maneja la encriptación
    created_at=datetime.utcnow(),
    updated_at=datetime.utcnow()
)

db.add_all([image1, image2])
db.commit()
db.refresh(image1)
db.refresh(image2)

# --- Comentarios de ejemplo ---
comment1 = Comment(
    content="¡Qué buena foto!",
    image_id=image1.id,
    author_id=user2.id,
    created_at=datetime.utcnow()
)
comment2 = Comment(
    content="Gracias!",
    image_id=image1.id,
    author_id=user1.id,
    created_at=datetime.utcnow()
)

db.add_all([comment1, comment2])
db.commit()

db.close()

print("Base de datos inicializada con datos de ejemplo.")
