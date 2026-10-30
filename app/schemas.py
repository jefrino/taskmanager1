import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ================= User Schemas =================
class UserBase(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    full_name: str
    role: Optional[str] = "member"
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str



class UserSimple(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(UserSimple):
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ================= Subtask Schemas =================
class SubtaskBase(BaseModel):
    title: str


class SubtaskCreate(SubtaskBase):
    pass


class SubtaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None


class SubtaskResponse(SubtaskBase):
    id: int
    task_id: int
    is_completed: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# ================= Comment Schemas =================
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    content: str
    created_at: datetime.datetime
    user: Optional[UserSimple] = None

    class Config:
        from_attributes = True


# ================= Activity Schemas =================
class ActivityLogResponse(BaseModel):
    id: int
    task_id: int
    user_id: Optional[int] = None
    action: str
    details: Optional[str] = None
    created_at: datetime.datetime
    user: Optional[UserSimple] = None

    class Config:
        from_attributes = True


# ================= Task Schemas =================
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = ""
    status: Optional[str] = "todo"
    priority: Optional[str] = "medium"
    due_date: Optional[datetime.datetime] = None
    tags: Optional[str] = ""
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    subtasks: Optional[List[str]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    tags: Optional[str] = None
    assignee_id: Optional[int] = None
    position: Optional[float] = None


class TaskStatusUpdate(BaseModel):
    status: str
    position: Optional[float] = None


class TaskResponse(TaskBase):
    id: int
    position: float
    created_by_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    creator: Optional[UserSimple] = None
    assignee: Optional[UserSimple] = None
    subtask_count: int = 0
    subtask_completed_count: int = 0
    comment_count: int = 0

    class Config:
        from_attributes = True


class TaskDetailResponse(TaskResponse):
    subtasks: List[SubtaskResponse] = []
    comments: List[CommentResponse] = []
    activities: List[ActivityLogResponse] = []

    class Config:
        from_attributes = True


# ================= Stats Schema =================
class StatsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    todo_tasks: int
    backlog_tasks: int
    in_review_tasks: int
    overdue_tasks: int
    high_priority_tasks: int
    completion_rate: float
    priority_distribution: dict
    status_distribution: dict
    recent_activities: List[ActivityLogResponse] = []
