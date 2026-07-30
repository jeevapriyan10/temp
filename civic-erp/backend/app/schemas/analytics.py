"""Analytics summary schemas."""

from typing import Dict, List
from pydantic import BaseModel


class DeptCount(BaseModel):
    department_id: int
    department_name: str
    count: int


class PriorityCount(BaseModel):
    priority: str
    count: int


class StatusCount(BaseModel):
    status: str
    count: int


class DailyCount(BaseModel):
    date: str
    count: int


class AnalyticsSummary(BaseModel):
    total_complaints: int
    status_counts: Dict[str, int]
    priority_counts: Dict[str, int]
    department_counts: List[DeptCount]
    daily_trend: List[DailyCount]
    avg_resolution_time_minutes: float
