from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    plan = Column(String(50), default="free")
    is_admin = Column(Boolean, default=False)
    is_launch_price = Column(Boolean, default=False)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    individual_credits = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    analyses = relationship("Analysis", back_populates="user")
    generations = relationship("Generation", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    scheduled_posts = relationship("ScheduledPost", back_populates="user")


class Analysis(Base):
    __tablename__ = "analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    category = Column(String(20), nullable=False)
    platform = Column(String(50), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    global_score = Column(Float, nullable=True)
    criteria_scores = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)
    strengths = Column(JSON, nullable=True)
    weaknesses = Column(JSON, nullable=True)
    suggestions = Column(JSON, nullable=True)
    views_prediction = Column(JSON, nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="analyses")


class Generation(Base):
    __tablename__ = "generations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    category = Column(String(20), nullable=False)
    platform = Column(String(50), nullable=False)
    filename = Column(String(255), nullable=False)
    title = Column(String(500), nullable=True)
    concept = Column(Text, nullable=True)
    content_type = Column(String(100), nullable=True)
    subject = Column(String(500), nullable=True)
    target_score = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    video_analysis = Column(JSON, nullable=True)
    script = Column(JSON, nullable=True)
    music_recommendations = Column(JSON, nullable=True)
    editing_tips = Column(JSON, nullable=True)
    viral_hooks = Column(JSON, nullable=True)
    cta_options = Column(JSON, nullable=True)
    hashtags = Column(JSON, nullable=True)
    ai_prompt = Column(Text, nullable=True)
    estimated_improvement = Column(Text, nullable=True)
    full_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="generations")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=True)
    platform = Column(String(50), nullable=True)
    analysis_score = Column(Float, nullable=True)
    messages = Column(JSON, nullable=True)
    script_data = Column(JSON, nullable=True)
    video_url = Column(String(500), nullable=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="chat_sessions")


class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=True)
    platform = Column(String(50), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    video_filename = Column(String(255), nullable=True)
    caption = Column(Text, nullable=True)
    hashtags = Column(Text, nullable=True)
    status = Column(String(20), default="scheduled")
    notified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="scheduled_posts")


class IPTracker(Base):
    __tablename__ = "ip_tracker"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String(45), unique=True, index=True, nullable=False)
    analysis_count = Column(Integer, default=0)
    generation_count = Column(Integer, default=0)
    boost_count = Column(Integer, default=0)
    first_analysis_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_analysis_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))