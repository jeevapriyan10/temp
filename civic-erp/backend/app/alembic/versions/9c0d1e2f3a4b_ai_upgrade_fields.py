"""ai upgrade fields

Revision ID: 9c0d1e2f3a4b
Revises: 8b9c0d1e2f3a
Create Date: 2026-07-31 10:50:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '9c0d1e2f3a4b'
down_revision: Union[str, None] = '8b9c0d1e2f3a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('complaints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ai_confidence', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('needs_manual_review', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('photo_verified', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('verification_note', sa.Text(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('complaints', schema=None) as batch_op:
        batch_op.drop_column('verification_note')
        batch_op.drop_column('photo_verified')
        batch_op.drop_column('needs_manual_review')
        batch_op.drop_column('ai_confidence')
