from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, VARCHAR
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from datetime import datetime
from app.database import Base
from app.encryption import cipher_suite

class EncryptedType(TypeDecorator):
    impl = VARCHAR
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        # Fernet requiere bytes
        encrypted = cipher_suite.encrypt(value.encode())
        return encrypted.decode()

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        # Fernet requiere bytes
        decrypted = cipher_suite.decrypt(value.encode())
        return decrypted.decode()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(EncryptedType, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("Image", back_populates="owner", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(EncryptedType, nullable=False)
    description = Column(EncryptedType, nullable=True)
    encrypted_file_path = Column(String, nullable=False)
    original_filename = Column(EncryptedType, nullable=False)  # EncryptedType added for original_filename
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="images")
    comments = relationship("Comment", back_populates="image", cascade="all, delete-orphan")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    image = relationship("Image", back_populates="comments")
    author = relationship("User", back_populates="comments")
