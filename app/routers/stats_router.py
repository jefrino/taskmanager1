import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Task, ActivityLog, User
from app.schemas import StatsResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/stats", tags=["Statistics & Dashboard"])


@router.get("", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total = db.query(Task).count()
    completed = db.query(Task).filter(Task.status == "completed").count()
    in_progress = db.query(Task).filter(Task.status == "in_progress").count()
    todo = db.query(Task).filter(Task.status == "todo").count()
    backlog = db.query(Task).filter(Task.status == "backlog").count()
    in_review = db.query(Task).filter(Task.status == "in_review").count()

    now = datetime.datetime.utcnow()
    overdue = db.query(Task).filter(
        Task.due_date.isnot(None),
        Task.due_date < now,
        Task.status != "completed"
    ).count()

    high_priority = db.query(Task).filter(Task.priority.in_(["high", "urgent"])).count()

    completion_rate = round((completed / total * 100), 1) if total > 0 else 0.0

    # Priority distribution
    priorities = ["urgent", "high", "medium", "low"]
    priority_dist = {}
    for p in priorities:
        priority_dist[p] = db.query(Task).filter(Task.priority == p).count()

    # Status distribution
    status_dist = {
        "backlog": backlog,
        "todo": todo,
        "in_progress": in_progress,
        "in_review": in_review,
        "completed": completed
    }

    # Recent activities (last 15)
    recent_activities = db.query(ActivityLog).order_by(
        ActivityLog.created_at.desc()
    ).limit(15).all()

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "in_progress_tasks": in_progress,
        "todo_tasks": todo,
        "backlog_tasks": backlog,
        "in_review_tasks": in_review,
        "overdue_tasks": overdue,
        "high_priority_tasks": high_priority,
        "completion_rate": completion_rate,
        "priority_distribution": priority_dist,
        "status_distribution": status_dist,
        "recent_activities": recent_activities
    }
