import subprocess
import os

def execute_command(command: str) -> str:
    """
    Kiterjesztett helyi vezérlés. Feketelista alapú védelemmel, hogy az AI tudjon fájlokat kezelni
    és programokat megnyitni, de ne tudjon véletlenül formázni.
    """
    forbidden = ["format", "del /s", "rmdir /s", "diskpart"]
    
    cmd_lower = command.lower()
    for f in forbidden:
        if f in cmd_lower:
            return f"[BIZTONSÁGI ZÁR] A(z) '{command}' parancs letiltva."

    try:
        # A subprocess.run timeout-ot kapott, hogy ne fagyassza le a rendszert
        # Programok indításához (pl. notepad) érdemes Popen-t használni, de az egyszerűség kedvéért 
        # ha a parancs blokkoló, 5mp után leáll.
        # Ha a parancs aszinkron elindul (pl. start notepad), akkor azonnal visszatér.
        
        # Ha 'start' a parancs kezdete, futtatjuk timeout nélkül
        if cmd_lower.startswith("start "):
            subprocess.Popen(command, shell=True)
            return "Program elindítva."
            
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=10)
        return f"Eredmény:\n{result.stdout}\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return "A parancs futtatása időtúllépés miatt leállt, vagy a program a háttérben fut."
    except Exception as e:
        return f"Hiba a parancs futtatásakor: {e}"
