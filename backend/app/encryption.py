import os
from cryptography.fernet import Fernet
from app.config import get_settings
import base64

settings = get_settings()

# Initialize Fernet cipher with the encryption key from settings
cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_file(file_content: bytes) -> bytes:
    """
    Encrypt file content using Fernet symmetric encryption
    """
    return cipher_suite.encrypt(file_content)

def decrypt_file(encrypted_content: bytes) -> bytes:
    """
    Decrypt file content using Fernet symmetric encryption
    """
    return cipher_suite.decrypt(encrypted_content)

def save_encrypted_file(file_content: bytes, filename: str, upload_dir: str = "uploads") -> str:
    """
    Encrypt and save a file to disk
    Returns the path to the encrypted file
    """
    # Create uploads directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Encrypt the file content
    encrypted_content = encrypt_file(file_content)
    
    # Generate a unique filename for the encrypted file
    encrypted_filename = f"enc_{filename}"
    file_path = os.path.join(upload_dir, encrypted_filename)
    
    # Save the encrypted content to disk
    with open(file_path, "wb") as f:
        f.write(encrypted_content)
    
    return file_path

def read_and_decrypt_file(file_path: str) -> bytes:
    """
    Read an encrypted file from disk and decrypt it
    Returns the decrypted file content
    """
    # Read the encrypted file
    with open(file_path, "rb") as f:
        encrypted_content = f.read()
    
    # Decrypt and return the content
    return decrypt_file(encrypted_content)

def delete_encrypted_file(file_path: str) -> bool:
    """
    Delete an encrypted file from disk
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False
