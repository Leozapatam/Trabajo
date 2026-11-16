' Abre Ciencias Sociales sin mostrar ventanas de consola (lo usa el acceso directo).
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
CreateObject("WScript.Shell").Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & dir & "\Ciencias-Sociales.ps1""", 0, False
