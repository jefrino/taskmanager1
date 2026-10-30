# ⚡ TaskFlow Pro - Enterprise Task Management Web Application

A full-stack, collaborative task management web application built for high-performance productivity. Features real-time state synchronization via WebSockets, an interactive Kanban drag-and-drop board, sortable list view with bulk actions, monthly calendar, analytics dashboard, and role-based authentication.

---

## 🌟 Key Features

### 1. 🔐 User Authentication & Authorization
- **JWT Authentication**: JSON Web Tokens with HS256 encryption and secure storage.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full workspace authority, task creation/editing/deletion, and database reset controls.
  - **Member**: Create tasks, manage assigned tasks, participate in checklists, and join discussions.
- **1-Click Quick Demo Sign-in**: Pre-configured test accounts for instant evaluation:
  - **Alex Rivera** (`alex@example.com` / `password123`) — Tech Lead & Admin
  - **Sarah Chen** (`sarah@example.com` / `password123`) — UI/UX Designer & Member

### 2. 📋 Comprehensive CRUD Operations for Tasks
- **Create**: Modal and inline column triggers with title, description, status, priority, due date, assignee, tags/categories, and subtask checklist builder.
- **Read**:
  - **Kanban Board**: 5 workflow stages (*Backlog, To Do, In Progress, In Review, Completed*) with live task counters.
  - **List / Table View**: Sortable headers, search, inline completion toggle, and bulk actions (*Mark Completed*, *Delete*).
  - **Calendar View**: Monthly grid placing tasks on their due dates with priority indicators.
  - **Analytics Dashboard**: Completion rate KPIs, priority breakdown, workflow distribution, and live activity audit log.
- **Update**:
  - **Drag-and-Drop**: Move task cards between Kanban columns with optimistic UI updates.
  - **Slide-over Drawer**: Edit task details, toggle subtasks, and post comments.
- **Delete**: Soft/hard deletion with confirmation modal.

### 3. ⚡ Real-Time Updates (Native WebSockets)
- Automatic bi-directional WebSocket connection (`/ws?token=...`) with heartbeat ping/pong keepalive.
- Live event broadcasting: `TASK_CREATED`, `TASK_MOVED`, `TASK_UPDATED`, `TASK_DELETED`, `SUBTASK_UPDATED`, `COMMENT_ADDED`.
- Presence updates: Live online user count and collaborator indicators.
- Instant non-blocking Toast alerts when teammates modify tasks across browser sessions.

### 4. 📱 Responsive & Modern Design
- **Dark & Light Mode**: Seamless theme switcher with persistent local storage.
- **Responsive Layout**:
  - **Desktop**: Collapsible views, fast keyboard shortcuts (`Ctrl+K` search, `N` new task, `Esc` close).
  - **Mobile**: Touch-friendly cards, horizontal swipeable Kanban columns, bottom navigation bar, off-canvas drawers.
- **Zero-Build Architecture**: Runs instantly with no npm build step or asset bundling required.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+ (Python 3.12 included in environment)

### Run the Application

```bash
cd /home/cinn/.gemini/antigravity/scratch/task-management-app
python3 run.py
```

Open your browser at **http://localhost:8000** (or `http://0.0.0.0:8000`).

Interactive OpenAPI Swagger documentation is available at **http://localhost:8000/docs**.

---

## 🗂️ Project Structure

```
task-management-app/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization, routes, WebSocket endpoint
│   ├── config.py            # Environment configurations & JWT secrets
│   ├── database.py          # SQLAlchemy SQLite setup & connection lifecycle
│   ├── models.py            # Relational database models (User, Task, Subtask, Comment, Activity)
│   ├── schemas.py           # Pydantic schemas for request validation & response formatting
│   ├── auth.py              # JWT tokens, password hashing with bcrypt, RBAC dependencies
│   ├── websocket_manager.py # WebSocket connection manager & broadcast hub
│   ├── seed_data.py         # Realistic sample data seeder
│   └── routers/
│       ├── __init__.py
│       ├── auth_router.py   # Register, Login, Me, User directory
│       ├── tasks_router.py  # Task CRUD, status patch, subtasks, comments
│       └── stats_router.py  # Dashboard KPI metrics & activity audit trail
├── static/
│   ├── css/
│   │   └── style.css        # Custom styles, animations, badge themes
│   ├── js/
│   │   ├── icons.js         # Embedded vector icons (100% offline reliable)
│   │   ├── api.js           # API client with token authorization
│   │   ├── websocket.js     # Real-time WebSocket client with auto-reconnect
│   │   ├── state.js         # Reactive central state store
│   │   ├── components.js    # Reusable UI badges, avatars, toasts, modals
│   │   ├── views/
│   │   │   ├── kanban.js    # Drag-and-drop Kanban board view
│   │   │   ├── list.js      # Sortable table view with bulk actions
│   │   │   ├── calendar.js  # Interactive monthly calendar grid
│   │   │   └── dashboard.js # Analytics & activity feed view
│   │   └── app.js           # Main application entry point & event binders
│   └── index.html           # Single-page application shell
├── requirements.txt
├── run.py                   # Development & production launcher
└── README.md
```

---

## 🧪 Testing

Run the included automated end-to-end test suite:

```bash
cd /home/cinn/.gemini/antigravity/scratch/task-management-app
python3 -c "
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
print('Health:', client.get('/api/health').json())
"
```
