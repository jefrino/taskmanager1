import os
import json
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal, get_db
from app.routers import auth_router, tasks_router, stats_router
from app.websocket_manager import ws_manager
from app.seed_data import seed_database
from app.auth import decode_token, get_current_user
from app.models import User

# Ensure database tables are created
Base.metadata.create_all(bind=engine)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed initial data if DB is empty
    db = SessionLocal()
    try:
        seed_database(db, force_reset=False)
    finally:
        db.close()
    yield


app = FastAPI(
    title="TaskFlow Pro - Enterprise Task Management",
    description="Modern, collaborative real-time task management web application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router.router)
app.include_router(tasks_router.router)
app.include_router(stats_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "TaskFlow Pro", "version": "1.0.0"}


@app.post("/api/seed")
def trigger_seed(
    force: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can re-seed the database")
    seed_database(db, force_reset=force)
    return {"message": "Database seeded successfully"}


# ================= Real-time WebSocket Endpoint =================
@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(None)
):
    user_id = None
    user_name = "Anonymous"

    if token:
        payload = decode_token(token)
        if payload and "sub" in payload:
            user_id = int(payload["sub"])
            user_name = payload.get("email", f"User #{user_id}")

    await ws_manager.connect(websocket, user_id=user_id)

    try:
        while True:
            # Receive text or keepalive ping from client
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                msg_type = msg.get("type")
                if msg_type == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG"}))
                elif msg_type == "TYPING":
                    await ws_manager.broadcast({
                        "type": "USER_TYPING",
                        "user_id": user_id,
                        "task_id": msg.get("task_id"),
                        "user_name": user_name
                    }, exclude_user_id=user_id)
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id=user_id)
        # Notify clients about presence update
        await ws_manager.broadcast({
            "type": "PRESENCE_UPDATE",
            "online_users": ws_manager.get_online_user_ids(),
            "connection_count": ws_manager.total_connections()
        })


# Mount static assets
if not STATIC_DIR.exists():
    STATIC_DIR.mkdir(parents=True, exist_ok=True)

# Mount subdirectories to support relative paths in index.html (for GitHub Pages & Netlify)
if (STATIC_DIR / "css").exists():
    app.mount("/css", StaticFiles(directory=str(STATIC_DIR / "css")), name="css")
if (STATIC_DIR / "js").exists():
    app.mount("/js", StaticFiles(directory=str(STATIC_DIR / "js")), name="js")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "TaskFlow Pro API is running. UI index.html not yet installed."}

