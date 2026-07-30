"""module3 fields

Revision ID: 8b9c0d1e2f3a
Revises: 7a8b9c0d1e2f
Create Date: 2026-07-30 23:05:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '8b9c0d1e2f3a'
down_revision: Union[str, None] = '7a8b9c0d1e2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('complaints', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_duplicate', sa.Boolean(), server_default='0', nullable=False))
        batch_op.add_column(sa.Column('parent_complaint_id', sa.Integer(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('complaints', schema=None) as batch_op:
        batch_op.drop_column('parent_complaint_id')
        batch_op.drop_column('is_duplicate')
