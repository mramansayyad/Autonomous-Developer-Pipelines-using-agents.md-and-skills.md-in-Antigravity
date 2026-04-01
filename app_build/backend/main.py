import json
import logging
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Real-Time Chat API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Connection closed. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error sending message: {e}")

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"status": "ok", "message": "Chat backend is running."}

@app.websocket("/ws/chat/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Construct response
            response = {
                "sender_id": client_id,
                "content": message_data.get("content", ""),
                "timestamp": datetime.now().isoformat(),
                "type": message_data.get("type", "message") # can be 'message' or 'typing'
            }
            
            # Broadcast to all connections
            await manager.broadcast(json.dumps(response))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # Notify others that this user disconnected
        await manager.broadcast(json.dumps({
            "sender_id": "system",
            "content": f"User {client_id} left the chat.",
            "timestamp": datetime.now().isoformat(),
            "type": "system"
        }))
