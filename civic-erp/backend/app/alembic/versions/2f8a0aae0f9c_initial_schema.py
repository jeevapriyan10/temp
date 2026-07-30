"""initial schema

Revision ID: 2f8a0aae0f9c
Revises: 
Create Date: 2026-07-30 22:25:21.572747
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = '2f8a0aae0f9c'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'organizations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('country', sa.String(length=100), nullable=False, server_default='India'),
        sa.Column('state', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('city', sa.String(length=100), nullable=False, server_default=''),
        sa.Column('address', sa.String(length=500), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=False, server_default='Asia/Kolkata'),
        sa.Column('language', sa.String(length=20), nullable=False, server_default='en'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'locations',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('parent_location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
    )

    op.create_table(
        'roles',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(length=50), unique=True, nullable=False),
        sa.Column('permissions', sa.JSON(), nullable=False),
    )

    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), unique=True, nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role_id', sa.Integer(), sa.ForeignKey('roles.id'), nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('working_area_location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
        sa.Column('shift', sa.String(length=50), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    op.create_table(
        'departments',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('org_id', sa.Integer(), sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('working_hours', sa.String(length=100), nullable=True),
        sa.Column('escalation_time_minutes', sa.Integer(), nullable=True),
        sa.Column('manager_user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('location_id', sa.Integer(), sa.ForeignKey('locations.id'), nullable=True),
    )

    op.create_foreign_key(
        'fk_users_department_id',
        'users', 'departments',
        ['department_id'], ['id']
    )

    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('department_id', sa.Integer(), sa.ForeignKey('departments.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('default_priority', sa.String(length=20), nullable=False, server_default='medium'),
    )


def downgrade() -> None:
    op.drop_table('services')
    op.drop_constraint('fk_users_department_id', 'users', type_='foreignkey')
    op.drop_table('departments')
    op.drop_table('users')
    op.drop_table('roles')
    op.drop_table('locations')
    op.drop_table('organizations')
