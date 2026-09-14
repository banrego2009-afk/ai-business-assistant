import os
import google.generativeai as genai
from database import get_db

def get_api_key():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'gemini_api_key'")
    row = cursor.fetchone()
    conn.close()
    if row:
        return row['value']
    return os.environ.get("GEMINI_API_KEY")

def process_prompt(prompt: str) -> str:
    api_key = get_api_key()
    if not api_key:
        return "Nincs beállítva a Gemini API kulcs. Kérlek, add meg a beállításokban!"
    
    genai.configure(api_key=api_key)
    
    system_instruction = """Te egy intelligens üzleti asszisztens és alapszintű programozó AI vagy. 
    Képes vagy kódokat írni, magyarázni és hibakeresést végezni (pl. Python, JavaScript, HTML/CSS nyelveken).
    Segíts a feladatok kezelésében, e-mailek összegzésében és a helyi gépen végzendő alapműveletekben.
    Kódolási kérések esetén jól kommentezett, könnyen érthető alap szintű kódot adj vissza Markdown formátumban.
    Légy proaktív és tokenkímélő!"""
    
    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Hiba történt az AI hívásakor: {str(e)}"
