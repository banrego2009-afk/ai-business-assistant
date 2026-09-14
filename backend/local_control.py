import subprocess
import os
import platform

def execute_command(command: str) -> str:
    """
    Kiterjesztett helyi vezérlés OS támogatással (Mac / Windows).
    Feketelista alapú védelemmel, hogy az AI tudjon fájlokat kezelni
    és programokat megnyitni, de ne tudjon véletlenül formázni.
    """
    forbidden = ["format", "del /s", "rmdir /s", "diskpart", "rm -rf /", "mkfs"]
    
    cmd_lower = command.lower()
    for f in forbidden:
        if f in cmd_lower:
            return f"[BIZTONSÁGI ZÁR] A(z) '{command}' parancs letiltva."

    try:
        os_name = platform.system()
        
        # Ha a parancs aszinkron elindul (pl. start notepad vagy open -a), akkor azonnal visszatér.
        if os_name == "Windows" and cmd_lower.startswith("start "):
            subprocess.Popen(command, shell=True)
            return "Program elindítva Windows rendszeren."
            
        elif os_name == "Darwin" and cmd_lower.startswith("open "):
            subprocess.Popen(command, shell=True)
            return "Program elindítva macOS rendszeren."
            
        # Általános, blokkoló parancsok timeouttal
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        return f"Eredmény:\n{result.stdout}\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return "A parancs futtatása időtúllépés miatt leállt, vagy a program a háttérben fut."
    except Exception as e:
        return f"Hiba a parancs futtatásakor: {e}"
