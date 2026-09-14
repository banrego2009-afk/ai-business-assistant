from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uvicorn

from database import init_db, get_db
from ai_engine import process_prompt
from local_control import execute_command
from email_service import check_emails

app = FastAPI(title="AI Business Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

class SettingsRequest(BaseModel):
    gemini_api_key: str

class TaskRequest(BaseModel):
    title: str
    description: str = ""
    project: str = ""

class CommandRequest(BaseModel):
    command: str

@app.on_event("startup")
def startup_event():
    init_db()

@app.post("/api/chat")
async def chat(req: PromptRequest):
    response_text = process_prompt(req.prompt)
    return {"reply": response_text}

@app.get("/api/tasks")
async def get_tasks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
    tasks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"tasks": tasks}

@app.post("/api/tasks")
async def create_task(task: TaskRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tasks (title, description, project) VALUES (?, ?, ?)", 
                   (task.title, task.description, task.project))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    return {"id": task_id, "status": "success"}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, status: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE tasks SET status = ? WHERE id = ?", (status, task_id))
    conn.commit()
    conn.close()
    return {"status": "updated"}

@app.post("/api/settings")
async def update_settings(settings: SettingsRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('gemini_api_key', ?)", 
                   (settings.gemini_api_key,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/local-command")
async def run_local_command(req: CommandRequest):
    result = execute_command(req.command)
    return {"result": result}

@app.get("/api/emails")
async def get_emails():
    return {"emails": check_emails()}

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
