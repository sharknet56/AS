from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Comment, Image
from app.schemas import Comment as CommentSchema, CommentCreate
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=CommentSchema, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a comment on an image
    """
    # Check if image exists
    image = db.query(Image).filter(Image.id == comment.image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Create comment
    db_comment = Comment(
        content=comment.content,
        image_id=comment.image_id,
        author_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

@router.get("/image/{image_id}", response_model=List[CommentSchema])
def get_image_comments(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all comments for a specific image
    """
    # Check if image exists
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    comments = db.query(Comment).filter(Comment.image_id == image_id).all()
    return comments
