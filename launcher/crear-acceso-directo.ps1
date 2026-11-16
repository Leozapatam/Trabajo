# Crea (o actualiza) el acceso directo "Ciencias Sociales" en el Escritorio.
# Uso: powershell -ExecutionPolicy Bypass -File launcher\crear-acceso-directo.ps1
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'Ciencias Sociales.lnk'

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnk)
$shortcut.TargetPath = "$env:WINDIR\System32\wscript.exe"
$shortcut.Arguments = "`"$PSScriptRoot\Ciencias-Sociales.vbs`""
$shortcut.WorkingDirectory = Split-Path -Parent $PSScriptRoot
$shortcut.IconLocation = "$PSScriptRoot\ciencias-sociales.ico,0"
$shortcut.Description = 'Ciencias Sociales - I.E.R. Boyaca'
$shortcut.Save()

Write-Output "Acceso directo listo: $lnk"
