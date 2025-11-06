from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Image Schemas
class ImageBase(BaseModel):
    title: str
    description: Optional[str] = None

class ImageCreate(ImageBase):
    pass

class ImageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Image(ImageBase):
    id: int
    owner_id: int
    original_filename: str
    created_at: datetime
    updated_at: datetime
    owner: User

    class Config:
        from_attributes = True

class ImageWithComments(Image):
    comments: List['Comment'] = []

    class Config:
        from_attributes = True

# Comment Schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    image_id: int

class Comment(CommentBase):
    id: int
    image_id: int
    author_id: int
    author: User
    created_at: datetime

    class Config:
        from_attributes = True

# Update forward references
ImageWithComments.model_rebuild()
