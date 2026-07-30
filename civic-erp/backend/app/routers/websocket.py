"""WebSocket router endpoint."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import ws_manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/{org_id}")
async def websocket_endpoint(websocket: WebSocket, org_id: int):
    await ws_manager.connect(websocket, org_id)
    try:
        while True:
            # Keep connection alive with heartbeat / ping-pong
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, org_id)
