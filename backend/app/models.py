"""
Pydantic models for request validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List


class Message(BaseModel):
    """Single message in conversation history"""
    role: str = Field(..., pattern="^(system|user|assistant)$")
    content: str = Field(..., min_length=1, max_length=50000)


class ChatRequest(BaseModel):
    """Validate chat API requests"""
    message: str = Field(
        ...,
        min_length=1,
        max_length=5000,  # Reduced from 10000 for safety
        description="User message (max 5000 characters)"
    )
    provider: Optional[str] = Field(
        default="openai",
        pattern="^(openai|claude)$",
        description="LLM provider to use"
    )
    model: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Specific model to use"
    )
    history: Optional[List[Message]] = Field(
        default_factory=list,
        description="Conversation history (max 50 messages)"
    )

    @field_validator('message')
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        """Ensure message is not just whitespace"""
        if not v.strip():
            raise ValueError('Message cannot be empty or whitespace only')
        return v.strip()

    @field_validator('history')
    @classmethod
    def validate_history(cls, v: List[Message]) -> List[Message]:
        """Validate conversation history"""
        if len(v) > 50:
            raise ValueError('Conversation history too long (max 50 messages)')
        return v
