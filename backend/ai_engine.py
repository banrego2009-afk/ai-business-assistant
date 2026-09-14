import os
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
    Végrehajt egy parancssori (shell) utasítást a felhasználó gépén (Windows).
    Használd ezt fájlok listázására, programok megnyitására (pl. 'start notepad'),
    vagy fájlkezelésre.
    """
    return execute_command(command)

def process_prompt(prompt: str) -> str:
    api_key = get_api_key()
    if not api_key:
        return "Nincs beállítva a Gemini API kulcs. Kérlek, add meg a beállításokban!"
    
    genai.configure(api_key=api_key)
    
    system_instruction = """Te egy intelligens üzleti asszisztens és programozó AI vagy. 
    Képes vagy kódokat írni és a helyi gépen parancsokat végrehajtani a 'run_system_command' eszközzel.
    Ha a felhasználó arra kér, hogy indíts el egy programot (pl. jegyzettömb, számológép), hozz létre egy mappát,
    vagy végezz el egy helyi gépvezérlési feladatot, használd a függvényhívást!
    Windows rendszert használsz. Program indításhoz használd a 'start <program_neve>' parancsot.
    Légy proaktív!"""
    
    # Modell inicializálása eszközzel (Function Calling)
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash', 
        system_instruction=system_instruction,
        tools=[run_system_command]
    )
    
    try:
        # Chat session indítása, hogy a tool call működjön
        chat = model.start_chat()
        response = chat.send_message(prompt)
        
        # Ha a modell úgy döntött, hogy hív egy függvényt, a chat objektum automatikusan lekezeli 
        # az újabb Google Generative AI Python SDK verziókban, de biztos ami biztos, kézzel is feldolgozzuk, 
        # ha szükséges. Az `start_chat(enable_automatic_function_calling=True)` lenne a legjobb, de
        # manuálisan is ellenőrizhetjük.
        
        # Enable automatic function calling is much easier:
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
