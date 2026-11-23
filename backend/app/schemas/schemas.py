from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatarText: str
    preferences: Dict[str, Any]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Memory Schemas ---
class MemoryCreate(BaseModel):
    category: str
    content: str
    confidence: Optional[float] = 0.95
    status: Optional[str] = "active"
    source: Optional[str] = "Manual Entry"
    importance: Optional[int] = 3
    tags: Optional[List[str]] = []
    validFrom: Optional[str] = None

class MemoryUpdate(BaseModel):
    category: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None
    importance: Optional[int] = None
    tags: Optional[List[str]] = None

class MemoryResponse(BaseModel):
    id: str
    category: str
    content: str
    confidence: float
    status: str
    source: str
    importance: int
    tags: List[str]
    validFrom: Optional[str] = None
    createdAt: str
    updatedAt: str

# --- Chat Schemas ---
class ChatMessageRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str

class SearchRequest(BaseModel):
    query: str
