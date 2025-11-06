from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import uuid
from app.database import get_db
from app.models import User, Image
from app.schemas import Image as ImageSchema, ImageCreate, ImageUpdate, ImageWithComments
from app.dependencies import get_current_user
from app.encryption import save_encrypted_file, read_and_decrypt_file, delete_encrypted_file

router = APIRouter()

@router.post("/", response_model=ImageSchema, status_code=status.HTTP_201_CREATED)
async def create_image(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a new image with encryption at rest
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only images are allowed."
        )
    
    # Read file content
    file_content = await file.read()
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    
    # Encrypt and save file
    encrypted_path = save_encrypted_file(file_content, unique_filename)
    
    # Create database entry
    db_image = Image(
        title=title,
        description=description,
        encrypted_file_path=encrypted_path,
        original_filename=file.filename,
        owner_id=current_user.id
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return db_image

@router.get("/my-images", response_model=List[ImageSchema])
def get_my_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all images owned by the current user
    """
    images = db.query(Image).filter(Image.owner_id == current_user.id).all()
    return images

@router.get("/other-users-images", response_model=List[ImageSchema])
def get_other_users_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all images from other users (not owned by current user)
    """
    images = db.query(Image).filter(Image.owner_id != current_user.id).all()
    return images

@router.get("/{image_id}", response_model=ImageWithComments)
def get_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific image with its comments
    """
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    return image

@router.get("/{image_id}/file")
async def get_image_file(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the actual image file (decrypted)
    """
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    try:
        # Decrypt the file content
        decrypted_content = read_and_decrypt_file(image.encrypted_file_path)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(decrypted_content),
            media_type="image/jpeg",
            headers={"Content-Disposition": f"inline; filename={image.original_filename}"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving image: {str(e)}"
        )

@router.put("/{image_id}", response_model=ImageSchema)
def update_image(
    image_id: int,
    image_update: ImageUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an image (only owner can update)
    """
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check if user is the owner
    if image.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this image"
        )
    
    # Update fields
    if image_update.title is not None:
        image.title = image_update.title
    if image_update.description is not None:
        image.description = image_update.description
    
    db.commit()
    db.refresh(image)
    
    return image

@router.delete("/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an image (only owner can delete)
    """
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Check if user is the owner
    if image.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this image"
        )
    
    # Delete encrypted file from disk
    delete_encrypted_file(image.encrypted_file_path)
    
    # Delete from database
    db.delete(image)
    db.commit()
    
    return None
