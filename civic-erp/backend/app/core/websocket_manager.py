"""WebSocket Connection Manager for real-time broadcast events."""

import logging
from typing import Dict, Set
from fastapi import WebSocket

logger = logging.getLogger("civicos.websocket")


class ConnectionManager:
    def __init__(self):
        # Maps org_id -> Set of active WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, org_id: int):
        await websocket.accept()
        if org_id not in self.active_connections:
            self.active_connections[org_id] = set()
        self.active_connections[org_id].add(websocket)
        logger.info(f"WebSocket client connected to org {org_id}")

    def disconnect(self, websocket: WebSocket, org_id: int):
        if org_id in self.active_connections:
            self.active_connections[org_id].discard(websocket)
            if not self.active_connections[org_id]:
                del self.active_connections[org_id]
        logger.info(f"WebSocket client disconnected from org {org_id}")

    async def broadcast_event(self, org_id: int, event_type: str, data: dict):
        if org_id in self.active_connections:
            message = {"event": event_type, "data": data}
            dead_sockets = set()
            for connection in self.active_connections[org_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Failed to send to WebSocket: {e}")
                    dead_sockets.add(connection)
            for dead in dead_sockets:
                self.disconnect(dead, org_id)


ws_manager = ConnectionManager()
