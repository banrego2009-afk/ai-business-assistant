import os
import sys
import platform

def create_desktop_shortcut():
    os_name = platform.system()
    
    if os_name == "Windows":
        try:
            import winshell
            from win32com.client import Dispatch
            desktop = winshell.desktop()
            path = os.path.join(desktop, "AI Asszisztens.lnk")
            
            python_exe = sys.executable
            pythonw_exe = python_exe.replace("python.exe", "pythonw.exe")
            if not os.path.exists(pythonw_exe):
                pythonw_exe = python_exe

            target_script = os.path.join(os.path.dirname(__file__), "backend", "main.py")
            
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(path)
            shortcut.Targetpath = pythonw_exe
            shortcut.Arguments = f'"{target_script}"'
            shortcut.WorkingDirectory = os.path.dirname(__file__)
            shortcut.IconLocation = python_exe
            shortcut.save()
            print(f"Windows Parancsikon létrehozva: {path}")
        except ImportError:
            print("Hiba: 'winshell' vagy 'pywin32' modul hiányzik Windows rendszereken.")
            
    elif os_name == "Darwin": # macOS
        desktop = os.path.join(os.path.expanduser("~"), "Desktop")
        path = os.path.join(desktop, "AI Asszisztens.command")
        
        target_script = os.path.join(os.path.dirname(__file__), "backend", "main.py")
        python_exe = sys.executable
        
        script_content = f'''#!/bin/bash
cd "{os.path.dirname(__file__)}"
"{python_exe}" "{target_script}"
'''
        with open(path, 'w') as f:
            f.write(script_content)
        
        # Jogosultságok beállítása, hogy futtatható legyen a Mac-en
        os.chmod(path, 0o755)
        print(f"macOS Parancsikon létrehozva: {path}")
        
    else:
        print(f"Ezen az operációs rendszeren ({os_name}) az automatikus parancsikon készítés még nem támogatott.")

if __name__ == "__main__":
    create_desktop_shortcut()
