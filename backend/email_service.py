import imaplib
import email
from email.header import decode_header
import google.generativeai as genai
import json
from plyer import notification
from datetime import datetime

def get_email_settings(cursor):
    settings = {}
    cursor.execute("SELECT key, value FROM settings WHERE key IN ('email_address', 'email_password', 'imap_server')")
    for row in cursor.fetchall():
        settings[row['key']] = row['value']
    return settings

def process_email_with_ai(subject, body, api_key, sender_email, cursor, conn):
    """AI hívás az e-mail kategorizálására és entitások kinyerésére JSON formátumban"""
    if not api_key:
        return "Információ"
    
    genai.configure(api_key=api_key)
    
    # Rendszer utasítás, hogy garantáltan JSON-t adjon vissza
    system_instruction = """
    Te egy asszisztens vagy. Olvasd el az e-mailt, és keress benne konkrét kéréseket.
    Kötelezően egy érvényes JSON objektummal térj vissza, az alábbi struktúrával:
    {
      "category": "SÜRGŐS" vagy "FELADAT" vagy "ÉRDEKLŐDÉS" vagy "INFORMÁCIÓ",
      "appointment": null vagy {"client_name": "név", "date_time": "YYYY-MM-DD HH:MM", "service": "szolgáltatás neve"},
      "task": null vagy {"title": "feladat címe", "description": "leírás"},
      "note": null vagy {"title": "jegyzet címe", "content": "jegyzet tartalma"}
    }
    Ha nem találsz időpontot, feladatot vagy jegyzetet, az értékük legyen null.
    """
    
    model = genai.GenerativeModel(
        'gemini-1.5-flash',
        system_instruction=system_instruction,
        generation_config={"response_mime_type": "application/json"}
    )
    
    prompt = f"Tárgy: {subject}\nFeladó: {sender_email}\nSzöveg részlet: {body[:1000]}"
    
    category = "Információ"
    try:
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        category = data.get("category", "Információ").capitalize()
        
        notifications_to_show = []
        
        # Időpont mentése
        if data.get("appointment"):
            app = data["appointment"]
            cursor.execute("INSERT INTO appointments (client_name, date_time, service, notes) VALUES (?, ?, ?, ?)", 
                           (app.get("client_name", "Ismeretlen"), app.get("date_time", "Ismeretlen"), app.get("service", ""), f"Automatikusan generálva e-mailből: {subject}"))
            conn.commit()
            notifications_to_show.append(f"Új időpont: {app.get('client_name')}")
            
        # Feladat mentése
        if data.get("task"):
            task = data["task"]
            cursor.execute("INSERT INTO tasks (title, description, project, status) VALUES (?, ?, ?, ?)", 
                           (task.get("title", "Új feladat"), task.get("description", ""), "E-mail", "pending"))
            conn.commit()
            notifications_to_show.append(f"Új feladat: {task.get('title')}")
            
        # Jegyzet mentése
        if data.get("note"):
            note = data["note"]
            cursor.execute("INSERT INTO notes (title, content) VALUES (?, ?)", 
                           (note.get("title", "Új jegyzet"), note.get("content", "")))
            conn.commit()
            notifications_to_show.append(f"Új jegyzet: {note.get('title')}")
            
        # Rendszer értesítések küldése
        for msg in notifications_to_show:
            try:
                notification.notify(
                    title="AI Asszisztens",
                    message=msg,
                    app_name="AI Business Assistant",
                    timeout=5
                )
            except Exception as e:
                print("Nem sikerült értesítést küldeni:", e)
                
        return category
    except Exception as e:
        print("JSON Parse hiba:", e)
        return "Információ"

def fetch_real_emails(conn, api_key):
    cursor = conn.cursor()
    settings = get_email_settings(cursor)
    
    email_user = settings.get('email_address')
    email_pass = settings.get('email_password')
    imap_server = settings.get('imap_server')
    
    if not email_user or not email_pass or not imap_server:
        return [{"subject": "Hiányzó beállítások", "from": "System", "body": "Kérlek állítsd be az IMAP fiókodat a Beállításokban!", "category": "Rendszer"}]

    try:
        mail = imaplib.IMAP4_SSL(imap_server)
        mail.login(email_user, email_pass)
        mail.select("inbox")
        
        # Keresés csak az OLVASATLAN levelekre (hogy ne dolgozzuk fel újra)
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK":
            return []
            
        email_ids = messages[0].split()
        latest_ids = email_ids[-5:] # Maximum 5 egyszerre, nehogy lefagyjon a API limit miatt
        
        results = []
        for e_id in reversed(latest_ids):
            status, msg_data = mail.fetch(e_id, "(RFC822)")
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    
                    # Tárgy dekódolása
                    subject, encoding = decode_header(msg["Subject"])[0]
                    if isinstance(subject, bytes):
                        subject = subject.decode(encoding if encoding else "utf-8")
                    
                    # Feladó
                    from_ = msg.get("From", "Ismeretlen")
                    
                    # Szöveg kinyerése
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                try:
                                    body = part.get_payload(decode=True).decode()
                                except:
                                    pass
                                break
                    else:
                        try:
                            body = msg.get_payload(decode=True).decode()
                        except:
                            pass
                    
                    # AI Klasszifikáció és Adat Kinyerés
                    category = process_email_with_ai(subject, body, api_key, from_, cursor, conn)
                    
                    results.append({
                        "subject": subject,
                        "from": from_,
                        "body": body[:200] + "..." if len(body) > 200 else body,
                        "category": category
                    })
        mail.logout()
        return results
    except Exception as e:
        return [{"subject": "Hiba a csatlakozáskor", "from": "System", "body": str(e), "category": "Rendszer"}]
