"""create intake tables

Revision ID: 20260504_000001
Revises: 
Create Date: 2026-05-04 17:25:00.000000
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260504_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("city", sa.String(length=255), nullable=False),
        sa.Column("situation", sa.Text(), nullable=False),
        sa.Column("vertical", sa.String(length=64), nullable=False),
        sa.Column(
            "lifecycle_state",
            sa.String(length=64),
            nullable=False,
            server_default=sa.text("'fresh'"),
        ),
        sa.Column(
            "pipeline_substate",
            sa.String(length=64),
            nullable=False,
            server_default=sa.text("'PENDING_CM_ASSIGNMENT'"),
        ),
        sa.Column("ab_variant", sa.String(length=32), nullable=True),
        sa.Column(
            "intake_source",
            sa.String(length=64),
            nullable=False,
            server_default=sa.text("'chatbot'"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "intake_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("patient_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vertical", sa.String(length=64), nullable=False),
        sa.Column("ab_variant", sa.String(length=32), nullable=True),
        sa.Column("raw_payload", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "submitted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_token"),
    )
    op.create_index(
        "ix_intake_sessions_patient_id",
        "intake_sessions",
        ["patient_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_intake_sessions_patient_id", table_name="intake_sessions")
    op.drop_table("intake_sessions")
    op.drop_table("patients")
