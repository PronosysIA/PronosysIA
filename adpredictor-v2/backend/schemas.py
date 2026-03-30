from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    plan: str
    is_admin: bool
    individual_credits: int
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TagSchema(BaseModel):
    label: str
    type: str


class CriteriaSchema(BaseModel):
    label: str
    score: float
    description: str


class ViewsPredictionSchema(BaseModel):
    views_min: int
    views_max: int
    potential_label: str
    confidence: str
    note: str


class AnalysisResponse(BaseModel):
    id: int
    category: str
    platform: str
    filename: str
    global_score: Optional[float]
    criteria_scores: Optional[List[CriteriaSchema]]
    summary: Optional[str]
    tags: Optional[List[TagSchema]]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    suggestions: Optional[List[str]]
    views_prediction: Optional[ViewsPredictionSchema]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisListResponse(BaseModel):
    analyses: List[AnalysisResponse]
    total: int


class FreeUsageResponse(BaseModel):
    used: int
    remaining: int
    max_free: int = 3


class SubscriptionStatusResponse(BaseModel):
    plan: str
    is_launch_price: bool
    individual_credits: int
    is_admin: bool