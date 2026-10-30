from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.models import User, Task, Subtask, Comment, ActivityLog
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    TaskResponse,
    TaskDetailResponse,
    SubtaskCreate,
    SubtaskUpdate,
    SubtaskResponse,
    CommentCreate,
    CommentResponse
)
from app.auth import get_current_user
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def serialize_task(task: Task) -> dict:
    total_subtasks = len(task.subtasks) if task.subtasks else 0
    completed_subtasks = sum(1 for s in task.subtasks if s.is_completed) if task.subtasks else 0
    total_comments = len(task.comments) if task.comments else 0

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "due_date": task.due_date,
        "tags": task.tags,
        "position": task.position,
        "created_by_id": task.created_by_id,
        "assignee_id": task.assignee_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "creator": task.creator,
        "assignee": task.assignee,
        "subtask_count": total_subtasks,
        "subtask_completed_count": completed_subtasks,
        "comment_count": total_comments,
    }


def serialize_task_detail(task: Task) -> dict:
    data = serialize_task(task)
    data["subtasks"] = task.subtasks
    data["comments"] = task.comments
    data["activities"] = task.activities
    return data


@router.get("", response_model=List[TaskResponse])
def get_tasks(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    assignee_id: Optional[int] = None,
    created_by_id: Optional[int] = None,
    tag: Optional[str] = None,
    sort_by: Optional[str] = "position",
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Task)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(Task.title.ilike(search_fmt), Task.description.ilike(search_fmt), Task.tags.ilike(search_fmt))
        )

    if status_filter:
        statuses = [s.strip() for s in status_filter.split(",") if s.strip()]
        if statuses:
            query = query.filter(Task.status.in_(statuses))

    if priority_filter:
        priorities = [p.strip() for p in priority_filter.split(",") if p.strip()]
        if priorities:
            query = query.filter(Task.priority.in_(priorities))

    if assignee_id is not None:
        if assignee_id == 0:  # unassigned filter
            query = query.filter(Task.assignee_id.is_(None))
        else:
            query = query.filter(Task.assignee_id == assignee_id)

    if created_by_id is not None:
        query = query.filter(Task.created_by_id == created_by_id)

    if tag:
        query = query.filter(Task.tags.ilike(f"%{tag.strip()}%"))

    # Sorting
    sort_col = Task.position
    if sort_by == "due_date":
        sort_col = Task.due_date
    elif sort_by == "priority":
        sort_col = Task.priority
    elif sort_by == "created_at":
        sort_col = Task.created_at
    elif sort_by == "title":
        sort_col = Task.title

    if sort_order.lower() == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(asc(sort_col))

    tasks = query.all()
    return [serialize_task(t) for t in tasks]


@router.post("", response_model=TaskDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Compute next position
    max_pos = db.query(Task).filter(Task.status == (task_in.status or "todo")).count()

    new_task = Task(
        title=task_in.title,
        description=task_in.description or "",
        status=task_in.status or "todo",
        priority=task_in.priority or "medium",
        due_date=task_in.due_date,
        tags=task_in.tags or "",
        position=float(max_pos),
        created_by_id=current_user.id,
        assignee_id=task_in.assignee_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Add initial subtasks if any
    if task_in.subtasks:
        for st_title in task_in.subtasks:
            st_title = st_title.strip()
            if st_title:
                subtask = Subtask(task_id=new_task.id, title=st_title, is_completed=False)
                db.add(subtask)
        db.commit()

    # Log activity
    log = ActivityLog(
        task_id=new_task.id,
        user_id=current_user.id,
        action="created",
        details=f"Created task '{new_task.title}'"
    )
    db.add(log)
    db.commit()
    db.refresh(new_task)

    serialized = serialize_task_detail(new_task)

    # Broadcast via WebSocket
    await ws_manager.broadcast({
        "type": "TASK_CREATED",
        "task": serialize_task(new_task),
        "user_name": current_user.full_name
    })

    return serialized


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_task_detail(task)


@router.put("/{task_id}", response_model=TaskDetailResponse)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Authorization check: admin, creator, or assignee can edit
    if current_user.role != "admin" and task.created_by_id != current_user.id and task.assignee_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to modify this task"
        )

    changes = []
    if task_in.title is not None and task_in.title != task.title:
        changes.append(f"title to '{task_in.title}'")
        task.title = task_in.title
    if task_in.description is not None and task_in.description != task.description:
        task.description = task_in.description
    if task_in.status is not None and task_in.status != task.status:
        changes.append(f"status to '{task_in.status}'")
        task.status = task_in.status
    if task_in.priority is not None and task_in.priority != task.priority:
        changes.append(f"priority to '{task_in.priority}'")
        task.priority = task_in.priority
    if task_in.due_date is not None or "due_date" in task_in.model_dump(exclude_unset=True):
        task.due_date = task_in.due_date
    if task_in.tags is not None:
        task.tags = task_in.tags
    if task_in.assignee_id is not None or "assignee_id" in task_in.model_dump(exclude_unset=True):
        if task.assignee_id != task_in.assignee_id:
            assignee_user = db.query(User).filter(User.id == task_in.assignee_id).first() if task_in.assignee_id else None
            assignee_name = assignee_user.full_name if assignee_user else "Unassigned"
            changes.append(f"assigned to {assignee_name}")
            task.assignee_id = task_in.assignee_id
    if task_in.position is not None:
        task.position = task_in.position

    task.updated_at = datetime.datetime.utcnow()

    if changes:
        log = ActivityLog(
            task_id=task.id,
            user_id=current_user.id,
            action="updated",
            details=f"Updated: {', '.join(changes)}"
        )
        db.add(log)

    db.commit()
    db.refresh(task)

    serialized = serialize_task_detail(task)

    await ws_manager.broadcast({
        "type": "TASK_UPDATED",
        "task": serialize_task(task),
        "user_name": current_user.full_name
    })

    return serialized


@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_task_status(
    task_id: int,
    status_in: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_status = task.status
    task.status = status_in.status
    if status_in.position is not None:
        task.position = status_in.position
    task.updated_at = datetime.datetime.utcnow()

    log = ActivityLog(
        task_id=task.id,
        user_id=current_user.id,
        action="moved",
        details=f"Moved from '{old_status}' to '{task.status}'"
    )
    db.add(log)
    db.commit()
    db.refresh(task)

    serialized = serialize_task(task)

    await ws_manager.broadcast({
        "type": "TASK_MOVED",
        "task": serialized,
        "old_status": old_status,
        "new_status": task.status,
        "user_name": current_user.full_name
    })

    return serialized


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != "admin" and task.created_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators or the task creator can delete this task"
        )

    task_title = task.title
    db.delete(task)
    db.commit()

    await ws_manager.broadcast({
        "type": "TASK_DELETED",
        "task_id": task_id,
        "task_title": task_title,
        "user_name": current_user.full_name
    })

    return {"message": "Task deleted successfully", "task_id": task_id}


# ================= Subtask Endpoints =================
@router.post("/{task_id}/subtasks", response_model=SubtaskResponse, status_code=status.HTTP_201_CREATED)
async def add_subtask(
    task_id: int,
    subtask_in: SubtaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    subtask = Subtask(
        task_id=task_id,
        title=subtask_in.title.strip(),
        is_completed=False
    )
    db.add(subtask)

    log = ActivityLog(
        task_id=task.id,
        user_id=current_user.id,
        action="subtask_added",
        details=f"Added subtask: {subtask.title}"
    )
    db.add(log)
    db.commit()
    db.refresh(subtask)

    await ws_manager.broadcast({
        "type": "SUBTASK_ADDED",
        "task_id": task_id,
        "subtask": {
            "id": subtask.id,
            "task_id": subtask.task_id,
            "title": subtask.title,
            "is_completed": subtask.is_completed,
            "created_at": str(subtask.created_at)
        },
        "user_name": current_user.full_name
    })

    return subtask


@router.patch("/{task_id}/subtasks/{subtask_id}", response_model=SubtaskResponse)
async def update_subtask(
    task_id: int,
    subtask_id: int,
    subtask_in: SubtaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtask = db.query(Subtask).filter(Subtask.id == subtask_id, Subtask.task_id == task_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    if subtask_in.title is not None:
        subtask.title = subtask_in.title
    if subtask_in.is_completed is not None:
        subtask.is_completed = subtask_in.is_completed

    log = ActivityLog(
        task_id=task_id,
        user_id=current_user.id,
        action="subtask_toggled",
        details=f"{'Completed' if subtask.is_completed else 'Unchecked'} subtask: {subtask.title}"
    )
    db.add(log)
    db.commit()
    db.refresh(subtask)

    await ws_manager.broadcast({
        "type": "SUBTASK_UPDATED",
        "task_id": task_id,
        "subtask": {
            "id": subtask.id,
            "task_id": subtask.task_id,
            "title": subtask.title,
            "is_completed": subtask.is_completed
        },
        "user_name": current_user.full_name
    })

    return subtask


@router.delete("/{task_id}/subtasks/{subtask_id}", status_code=status.HTTP_200_OK)
async def delete_subtask(
    task_id: int,
    subtask_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subtask = db.query(Subtask).filter(Subtask.id == subtask_id, Subtask.task_id == task_id).first()
    if not subtask:
        raise HTTPException(status_code=404, detail="Subtask not found")

    title = subtask.title
    db.delete(subtask)
    db.commit()

    await ws_manager.broadcast({
        "type": "SUBTASK_DELETED",
        "task_id": task_id,
        "subtask_id": subtask_id,
        "subtask_title": title,
        "user_name": current_user.full_name
    })

    return {"message": "Subtask deleted successfully"}


# ================= Comment Endpoints =================
@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(
    task_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment_in.content.strip()
    )
    db.add(comment)

    log = ActivityLog(
        task_id=task_id,
        user_id=current_user.id,
        action="commented",
        details=f"Added a comment on '{task.title}'"
    )
    db.add(log)
    db.commit()
    db.refresh(comment)

    comment_data = {
        "id": comment.id,
        "task_id": comment.task_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "created_at": str(comment.created_at),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": current_user.role,
            "avatar_url": current_user.avatar_url
        }
    }

    await ws_manager.broadcast({
        "type": "COMMENT_ADDED",
        "task_id": task_id,
        "comment": comment_data,
        "user_name": current_user.full_name
    })

    return comment
