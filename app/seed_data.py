import datetime
from sqlalchemy.orm import Session
from app.models import User, Task, Subtask, Comment, ActivityLog
from app.auth import hash_password


def seed_database(db: Session, force_reset: bool = False):
    existing_users = db.query(User).count()
    if existing_users > 0 and not force_reset:
        return

    if force_reset:
        db.query(ActivityLog).delete()
        db.query(Comment).delete()
        db.query(Subtask).delete()
        db.query(Task).delete()
        db.query(User).delete()
        db.commit()

    print("🌱 Seeding database with initial users and tasks...")

    # Default password: "password123"
    hashed_pwd = hash_password("password123")

    # 1. Create Users
    user1 = User(
        email="alex@example.com",
        full_name="Alex Rivera",
        hashed_password=hashed_pwd,
        role="admin",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )
    user2 = User(
        email="sarah@example.com",
        full_name="Sarah Chen",
        hashed_password=hashed_pwd,
        role="member",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    )
    user3 = User(
        email="marcus@example.com",
        full_name="Marcus Vance",
        hashed_password=hashed_pwd,
        role="member",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )
    user4 = User(
        email="elena@example.com",
        full_name="Elena Rostova",
        hashed_password=hashed_pwd,
        role="member",
        avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([user1, user2, user3, user4])
    db.commit()

    now = datetime.datetime.utcnow()

    # 2. Create Tasks
    tasks_data = [
        {
            "title": "Design Dark Mode UI system tokens",
            "description": "Establish cohesive color palette, contrast ratios, and typography tokens for system-wide dark mode support across web and mobile viewports.",
            "status": "completed",
            "priority": "high",
            "due_date": now - datetime.timedelta(days=2),
            "tags": "Design,UI/UX,Tokens",
            "created_by": user1,
            "assignee": user2,
            "subtasks": [
                ("Define surface elevation color ramp", True),
                ("Establish WCAG AAA contrast for text", True),
                ("Figma library component sync", True)
            ],
            "comments": [
                (user2, "Dark theme tokens have been validated in Figma and exported to Tailwind config."),
                (user1, "Looks gorgeous! Contrast passes all accessibility checks.")
            ]
        },
        {
            "title": "Implement JWT Refresh Token rotation",
            "description": "Secure API endpoints with automatic refresh token rotation stored in HttpOnly secure cookies to prevent XSS session hijacking.",
            "status": "in_progress",
            "priority": "urgent",
            "due_date": now + datetime.timedelta(days=1),
            "tags": "Backend,Security,Auth",
            "created_by": user1,
            "assignee": user3,
            "subtasks": [
                ("Design refresh token schema and hashing", True),
                ("Add blacklist revocation mechanism", False),
                ("Implement sliding session window logic", False)
            ],
            "comments": [
                (user3, "Token blacklisting in Redis/SQLite is almost done. Testing expiration edge cases now.")
            ]
        },
        {
            "title": "Real-time WebSocket task status broadcasting",
            "description": "Ensure instant state synchronization across all connected team sessions when tasks move on Kanban boards or update status.",
            "status": "in_progress",
            "priority": "high",
            "due_date": now + datetime.timedelta(days=2),
            "tags": "WebSockets,RealTime,Frontend",
            "created_by": user1,
            "assignee": user4,
            "subtasks": [
                ("FastAPI ConnectionManager endpoint", True),
                ("Auto-reconnect with exponential backoff", True),
                ("Toast notifications for live collaborator edits", False)
            ],
            "comments": [
                (user4, "WebSocket ping/pong keepalive is humming nicely!")
            ]
        },
        {
            "title": "Kanban drag-and-drop smooth animations",
            "description": "Improve drag feedback, ghost drag preview, and column drop targets for fluid desktop and mobile touch gestures.",
            "status": "in_review",
            "priority": "medium",
            "due_date": now + datetime.timedelta(days=3),
            "tags": "Frontend,UX,Animations",
            "created_by": user2,
            "assignee": user4,
            "subtasks": [
                ("HTML5 Drag and drop dropzones", True),
                ("Touch event listener polyfill for iOS/Android", True),
                ("Optimistic UI state updates", True)
            ],
            "comments": [
                (user1, "Tested on mobile browser - silky smooth!")
            ]
        },
        {
            "title": "Audit database indexes & optimize queries",
            "description": "Profile slow queries under heavy concurrency and add composite indexes for task status, assignee, and due_date lookups.",
            "status": "todo",
            "priority": "medium",
            "due_date": now + datetime.timedelta(days=5),
            "tags": "Database,Performance,SQL",
            "created_by": user3,
            "assignee": user3,
            "subtasks": [
                ("Enable SQLite WAL mode", True),
                ("Add compound indexes on tasks table", False),
                ("Benchmark 10,000 tasks read throughput", False)
            ],
            "comments": []
        },
        {
            "title": "Setup Docker Compose & Production deployment guide",
            "description": "Create production-ready Dockerfile, multi-stage builds, and deployment instructions for VPS, Render, or Railway.",
            "status": "todo",
            "priority": "low",
            "due_date": now + datetime.timedelta(days=7),
            "tags": "DevOps,Docker,Deployment",
            "created_by": user1,
            "assignee": user1,
            "subtasks": [
                ("Write slim Python Alpine Dockerfile", False),
                ("Healthcheck endpoint verification", False),
                ("Environment variable documentation", False)
            ],
            "comments": []
        },
        {
            "title": "Integrate CSV & JSON task export/import",
            "description": "Allow team leads to export sprint task data to CSV or JSON formats for offline backups and stakeholder reporting.",
            "status": "backlog",
            "priority": "low",
            "due_date": now + datetime.timedelta(days=12),
            "tags": "Feature,Export,Reporting",
            "created_by": user2,
            "assignee": None,
            "subtasks": [
                ("Client-side CSV generator", False),
                ("JSON import validation parser", False)
            ],
            "comments": []
        },
        {
            "title": "Fix date picker timezone mismatch on safari",
            "description": "Safari users in non-UTC timezones reported due dates displaying one day earlier due to ISO parsing quirks.",
            "status": "completed",
            "priority": "urgent",
            "due_date": now - datetime.timedelta(days=1),
            "tags": "Bug,Frontend,Safari",
            "created_by": user4,
            "assignee": user4,
            "subtasks": [
                ("Reproduce issue in WebKit engine", True),
                ("Normalize date string parsing to local midnight", True)
            ],
            "comments": [
                (user4, "Patched and verified across all browsers.")
            ]
        },
        {
            "title": "Add task activity timeline & audit log",
            "description": "Record every action (creation, assignment change, status change, comments) into an immutable activity feed.",
            "status": "completed",
            "priority": "medium",
            "due_date": now - datetime.timedelta(days=3),
            "tags": "Backend,Audit,Compliance",
            "created_by": user1,
            "assignee": user3,
            "subtasks": [
                ("ActivityLog model with timestamps", True),
                ("Automatic trigger on task status change", True)
            ],
            "comments": []
        },
        {
            "title": "Mobile bottom navigation & swipe gesture navigation",
            "description": "Ensure quick switching between Board, List, and Dashboard views with native-feeling bottom tabs on mobile devices.",
            "status": "in_review",
            "priority": "high",
            "due_date": now + datetime.timedelta(days=2),
            "tags": "Mobile,UI/UX,Responsive",
            "created_by": user2,
            "assignee": user2,
            "subtasks": [
                ("Mobile bottom app bar with active indicator", True),
                ("Filter drawer sheet for touch screens", True)
            ],
            "comments": [
                (user2, "Bottom nav is responsive and collapses gracefully on larger screens.")
            ]
        }
    ]

    for idx, t_data in enumerate(tasks_data):
        task = Task(
            title=t_data["title"],
            description=t_data["description"],
            status=t_data["status"],
            priority=t_data["priority"],
            due_date=t_data["due_date"],
            tags=t_data["tags"],
            position=float(idx),
            created_by_id=t_data["created_by"].id,
            assignee_id=t_data["assignee"].id if t_data["assignee"] else None
        )
        db.add(task)
        db.commit()
        db.refresh(task)

        # Add subtasks
        for st_title, is_comp in t_data.get("subtasks", []):
            st = Subtask(task_id=task.id, title=st_title, is_completed=is_comp)
            db.add(st)

        # Add comments
        for c_user, c_text in t_data.get("comments", []):
            com = Comment(task_id=task.id, user_id=c_user.id, content=c_text)
            db.add(com)

        # Add initial activity
        act = ActivityLog(
            task_id=task.id,
            user_id=t_data["created_by"].id,
            action="created",
            details=f"Created task '{task.title}'"
        )
        db.add(act)

    db.commit()
    print("✅ Seed completed successfully with demo users and realistic tasks.")
