import os
import platform
import google.generativeai as genai
from database import get_db
from local_control import execute_command

def get_api_key():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'")
    row = cursor.fetchone()
    conn.close()
    if row:
        return row['value']
    return os.environ.get("GEMINI_API_KEY")

# --- Gemini Function Calling Definitions ---
def run_system_command(command: str) -> str:
    """
    Végrehajt egy parancssori (shell) utasítást a felhasználó gépén.
    Használd ezt fájlok listázására, programok megnyitására (Windows: 'start app', macOS: 'open app'),
    vagy fájlkezelésre.
    """
    return execute_command(command)

def process_prompt(prompt: str) -> str:
    api_key = get_api_key()
    if not api_key:
        return "Nincs beállítva a Gemini API kulcs. Kérlek, add meg a beállításokban!"
    
    genai.configure(api_key=api_key)
    
    os_name = platform.system()
    launch_cmd = "'start <program_neve>'" if os_name == "Windows" else "'open <program_neve>'"
    
    system_instruction = f"""Te egy intelligens üzleti asszisztens és programozó AI vagy. 
    Képes vagy kódokat írni és a helyi gépen parancsokat végrehajtani a 'run_system_command' eszközzel.
    Jelenlegi operációs rendszer: {os_name}.
    Program indításhoz használd a {launch_cmd} parancsot!
    Légy proaktív!"""
    
    try:
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash', 
            system_instruction=system_instruction,
            tools=[run_system_command]
        )
        chat = model.start_chat(enable_automatic_function_calling=True)
        response = chat.send_message(prompt)

        return response.text
    except Exception as e:
        return f"Hiba történt az AI hívásakor: {str(e)}"
