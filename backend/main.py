import os
import threading
import uvicorn
import webview
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import init_db, get_db
from ai_engine import process_prompt
from local_control import execute_command
from email_service import fetch_real_emails, get_email_settings

app = FastAPI(title="AI Business Assistant Pro")

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
    email_address: str = ""
    email_password: str = ""
    imap_server: str = "imap.gmail.com"

class TaskRequest(BaseModel):
    title: str
    description: str = ""
    project: str = ""

class CommandRequest(BaseModel):
    command: str

class AppointmentRequest(BaseModel):
    client_name: str
    date_time: str
    service: str = ""
    notes: str = ""

class NoteRequest(BaseModel):
    title: str
    content: str = ""

@app.on_event("startup")
def startup_event():
    init_db()

# --- Notes Endpoints ---
@app.get("/api/notes")
async def get_notes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes ORDER BY updated_at DESC")
    notes = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"notes": notes}

@app.post("/api/notes")
async def create_note(note: NoteRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (title, content) VALUES (?, ?)", (note.title, note.content))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/notes/{note_id}")
async def delete_note(note_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

# --- Appointments Endpoints ---
@app.get("/api/appointments")
async def get_appointments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments ORDER BY date_time ASC")
    apps = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"appointments": apps}

@app.post("/api/appointments")
async def create_appointment(app_req: AppointmentRequest):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO appointments (client_name, date_time, service, notes) VALUES (?, ?, ?, ?)", 
                   (app_req.client_name, app_req.date_time, app_req.service, app_req.notes))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.delete("/api/appointments/{app_id}")
async def delete_appointment(app_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM appointments WHERE id = ?", (app_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}

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
    cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('gemini_api_key', ?)", (settings.gemini_api_key,))
    if settings.email_address:
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_address', ?)", (settings.email_address,))
    if settings.email_password:
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('email_password', ?)", (settings.email_password,))
    if settings.imap_server:
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('imap_server', ?)", (settings.imap_server,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/local-command")
async def run_local_command(req: CommandRequest):
    result = execute_command(req.command)
    return {"result": result}

@app.get("/api/emails")
async def get_emails():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'")
    row = cursor.fetchone()
    api_key = row['value'] if row else None
    
    emails = fetch_real_emails(conn, api_key)
    conn.close()
    return {"emails": emails}

frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

def start_server():
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="error")

def on_quit_clicked(icon, item):
    icon.stop()
    import sys
    import os
    os._exit(0)

def setup_tray():
    import pystray
    from PIL import Image, ImageDraw
    
    # Készítünk egy egyszerű ikont memóriában
    image = Image.new('RGB', (64, 64), color = (79, 70, 229))
    d = ImageDraw.Draw(image)
    d.text((16, 20), "AI", fill=(255, 255, 255))
    
    menu = pystray.Menu(
        pystray.MenuItem('Kilépés (Teljes leállítás)', on_quit_clicked)
    )
    
    icon = pystray.Icon("AIAssistant", image, "AI Üzleti Asszisztens", menu)
    icon.run()

if __name__ == "__main__":
    # Start FastAPI in a daemon thread
    t_server = threading.Thread(target=start_server, daemon=True)
    t_server.start()
    
    # Start Tray Icon in a daemon thread
    t_tray = threading.Thread(target=setup_tray, daemon=True)
    t_tray.start()
    
    # Start Desktop UI window (Blocks main thread)
    window = webview.create_window('AI Business Assistant Pro', 'http://127.0.0.1:8000', width=1200, height=800)
    
    def on_closing():
        # Ez akkor fut le, ha az X-re kattintanak.
        # Ha be akarjuk zárni a szervert is az X-el, akkor os._exit(0)
        # Ha csak elrejteni akarjuk, akkor a tray-ből lehetne visszahozni.
        # A feladat: "hogy valahogy könnyű módon be lehessen zárni az egészet, hogy ténylegesen bezáródjon."
        # Így az X is leállít mindent.
        import os
        os._exit(0)
        
    window.events.closed += on_closing
    
    webview.start()
