import json
from typing import Dict, List, Optional
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Also store anonymous / general connections if any
        self.anonymous_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: Optional[int] = None):
        await websocket.accept()
        if user_id:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = []
            self.active_connections[user_id].append(websocket)
        else:
            self.anonymous_connections.append(websocket)
        
        # Broadcast presence / online users update
        await self.broadcast({
            "type": "PRESENCE_UPDATE",
            "online_users": self.get_online_user_ids(),
            "connection_count": self.total_connections()
        })

    def disconnect(self, websocket: WebSocket, user_id: Optional[int] = None):
        if user_id and user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        elif websocket in self.anonymous_connections:
            self.anonymous_connections.remove(websocket)

    def get_online_user_ids(self) -> List[int]:
        return list(self.active_connections.keys())

    def total_connections(self) -> int:
        user_conns = sum(len(conns) for conns in self.active_connections.values())
        return user_conns + len(self.anonymous_connections)

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            payload = json.dumps(message, default=str)
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(payload)
                except Exception:
                    pass

    async def broadcast(self, message: dict, exclude_user_id: Optional[int] = None):
        payload = json.dumps(message, default=str)
        
        # Send to authenticated users
        for uid, connections in list(self.active_connections.items()):
            if exclude_user_id is not None and uid == exclude_user_id:
                continue
            for connection in list(connections):
                try:
                    await connection.send_text(payload)
                except Exception:
                    self.disconnect(connection, uid)

        # Send to anonymous connections
        for connection in list(self.anonymous_connections):
            try:
                await connection.send_text(payload)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()
