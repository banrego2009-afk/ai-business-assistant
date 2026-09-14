import subprocess

def execute_command(command: str) -> str:
    """
    Biztonsági okokból alapértelmezetten csak engedélyezett parancsokat futtat.
    """
    safe_commands = ["dir", "echo", "date", "time", "whoami", "ipconfig"]
    cmd_base = command.split(" ")[0].lower()
    
    if cmd_base in safe_commands:
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=5)
            return f"Eredmény:\n{result.stdout}\n{result.stderr}"
        except Exception as e:
            return f"Hiba a parancs futtatásakor: {e}"
    else:
        return f"[BIZTONSÁGI ZÁR] A(z) '{command}' parancs végrehajtása letiltva biztonsági okokból. Csak alapvető lekérdező parancsok engedélyezettek."
