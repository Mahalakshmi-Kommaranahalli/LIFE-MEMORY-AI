import datetime
from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="CSE Student & AI Engineer")
    avatar_text = Column(String, default="MK")
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String, default="New Conversation")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), index=True, nullable=False)
    role = Column(String, nullable=False) # user or assistant
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    grounded_memories = Column(JSON, default=list)
    extracted_memories = Column(JSON, default=list)

    conversation = relationship("Conversation", back_populates="messages")

class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    category = Column(String, index=True, nullable=False) # career, education, skills, projects, etc.
    content = Column(Text, nullable=False)
    confidence = Column(Float, default=0.95)
    status = Column(String, default="active") # active, updated, archived
    source = Column(String, default="Conversation with Assistant")
    importance = Column(Integer, default=3)
    tags = Column(JSON, default=list)
    valid_from = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="memories")

class MemoryRelationship(Base):
    __tablename__ = "memory_relationships"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    source_id = Column(String, ForeignKey("memories.id"), nullable=False)
    target_id = Column(String, ForeignKey("memories.id"), nullable=False)
    relation_type = Column(String, nullable=False) # applied_in, enabled_skill, motivates, etc.
    label = Column(String, nullable=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    filename = Column(String, nullable=False)
    size_str = Column(String, default="1.0 MB")
    page_count = Column(Integer, default=1)
    status = Column(String, default="processed")
    summary = Column(Text, nullable=True)
    extracted_memories_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")
