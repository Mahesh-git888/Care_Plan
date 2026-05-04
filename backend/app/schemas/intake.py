from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

ALLOWED_VERTICALS = {"elder-care", "dementia", "post-discharge"}


class IntakeCreateRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=8, max_length=32)
    city: str = Field(min_length=1, max_length=255)
    situation: str = Field(min_length=1)
    vertical: str = Field(min_length=1, max_length=64)
    ab_variant: str | None = Field(default=None, max_length=32)

    @field_validator("full_name", "phone", "city", "situation", "vertical", mode="before")
    @classmethod
    def strip_required_values(cls, value: str) -> str:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("full_name", "phone", "city", "situation", "vertical")
    @classmethod
    def require_non_empty(cls, value: str) -> str:
        if not value:
            raise ValueError("This field is required.")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if len("".join(character for character in value if character.isdigit())) < 8:
            raise ValueError("Please provide a valid phone number.")
        return value

    @field_validator("vertical")
    @classmethod
    def validate_vertical(cls, value: str) -> str:
        if value not in ALLOWED_VERTICALS:
            raise ValueError("Please provide a valid vertical.")
        return value


class IntakeCreateResponse(BaseModel):
    patient_id: UUID
    status: Literal["PENDING_CM_ASSIGNMENT"] = "PENDING_CM_ASSIGNMENT"
