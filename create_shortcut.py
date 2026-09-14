import os
import sys
import winshell
from win32com.client import Dispatch

def create_desktop_shortcut():
    desktop = winshell.desktop()
    path = os.path.join(desktop, "AI Asszisztens.lnk")
    
    # Keresünk egy pythonw.exe-t, ami elrejti a konzolt
    python_exe = sys.executable
    pythonw_exe = python_exe.replace("python.exe", "pythonw.exe")
    if not os.path.exists(pythonw_exe):
        pythonw_exe = python_exe # Fallback if pythonw doesn't exist

    target_script = os.path.join(os.path.dirname(__file__), "backend", "main.py")
    
    shell = Dispatch('WScript.Shell')
    shortcut = shell.CreateShortCut(path)
    shortcut.Targetpath = pythonw_exe
    shortcut.Arguments = f'"{target_script}"'
    shortcut.WorkingDirectory = os.path.dirname(__file__)
    shortcut.IconLocation = python_exe
    shortcut.save()
    print(f"Parancsikon létrehozva: {path}")

if __name__ == "__main__":
    create_desktop_shortcut()
