import imaplib
import email
from email.header import decode_header
import google.generativeai as genai

def get_email_settings(cursor):
    settings = {}
    cursor.execute("SELECT key, value FROM settings WHERE key IN ('email_address', 'email_password', 'imap_server')")
    for row in cursor.fetchall():
        settings[row['key']] = row['value']
    return settings

def classify_email(subject, body, api_key):
    """AI hívás az e-mail kategorizálására (Sürgős, Feladat, Információ, Érdeklődés, Spam)"""
    if not api_key:
        return "Információ"
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""Kérlek kategorizáld az alábbi e-mailt a következő kategóriák egyikébe:
    Kategóriák: Sürgős, Feladat, Érdeklődés, Információ, Spam.
    CSAK A KATEGÓRIA NEVÉT ÍRD LE, semmi mást!
    
    Tárgy: {subject}
    Szöveg részlet: {body[:300]}
    """
    try:
        response = model.generate_content(prompt)
        cat = response.text.strip().upper()
        allowed = ["SÜRGŐS", "FELADAT", "ÉRDEKLŐDÉS", "INFORMÁCIÓ", "SPAM"]
        for a in allowed:
            if a in cat:
                return a.capitalize()
        return "Információ"
    except:
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
        
        status, messages = mail.search(None, "ALL")
        if status != "OK":
            return []
            
        email_ids = messages[0].split()
        latest_ids = email_ids[-5:] # Utolsó 5 email
        
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
                    from_ = msg.get("From")
                    
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
                    
                    # AI Klasszifikáció
                    category = classify_email(subject, body, api_key)
                    
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
