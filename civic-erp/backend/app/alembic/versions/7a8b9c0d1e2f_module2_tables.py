"""module2 tables

Revision ID: 7a8b9c0d1e2f
Revises: 2f8a0aae0f9c
Create Date: 2026-07-30 22:55:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = '7a8b9c0d1e2f'
down_revision: Union[str, None] = '2f8a0aae0f9c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'complaints',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('service_id', sa.Integer(), sa.ForeignKey('services.id'), nullable=False),
        sa.Column('citizen_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=False),
        sa.Column('assigned_department_id', sa.Integer(), sa.ForeignKey('departments.id'), nullable=False),
        sa.Column('assigned_officer_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('photo_url', sa.Text(), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='reported'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'complaint_history',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('complaint_id', sa.Integer(), sa.ForeignKey('complaints.id'), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('changed_by_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('note', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('related_complaint_id', sa.Integer(), sa.ForeignKey('complaints.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'notification_rules',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('trigger_event', sa.String(length=50), nullable=False),
        sa.Column('notify_role', sa.String(length=50), nullable=False),
        sa.Column('template_text', sa.Text(), nullable=False),
    )

    op.create_table(
        'inventory_items',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('department_id', sa.Integer(), sa.ForeignKey('departments.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('unit', sa.String(length=50), nullable=False, server_default='units'),
    )


def downgrade() -> None:
    op.drop_table('inventory_items')
    op.drop_table('notification_rules')
    op.drop_table('notifications')
    op.drop_table('complaint_history')
    op.drop_table('complaints')
