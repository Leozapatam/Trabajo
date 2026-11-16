# Abre Ciencias Sociales con un clic:
# 1) trae la ultima version de GitHub (si hay internet y no hay cambios locales sin guardar),
# 2) instala dependencias y compila solo si hace falta,
# 3) arranca el servidor local (datos en disco) y abre Edge en modo aplicacion.
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$Port = 5176
$Url = "http://127.0.0.1:$Port/"
# Registros locales de este PC (los datos van aparte: ver server/localConfig.mjs)
$LogDir = Join-Path $env:LOCALAPPDATA 'CienciasSociales'
New-Item -ItemType Directory -Force $LogDir | Out-Null
$Log = Join-Path $LogDir 'lanzador.log'

function Write-Log($msg) {
    Add-Content -Path $Log -Value ("{0:yyyy-MM-dd HH:mm:ss}  {1}" -f (Get-Date), $msg) -Encoding UTF8
}

function Show-Error($msg) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($msg, 'Ciencias Sociales', 'OK', 'Error') | Out-Null
}

function Test-Server {
    try {
        (Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 "${Url}api/salud").StatusCode -eq 200
    } catch {
        $false
    }
}

# Ejecuta un comando por cmd (en PowerShell 5.1 los avisos por stderr detendrian el script).
# Devuelve el codigo de salida, o -1 si supero el tiempo.
function Invoke-Quiet($command, $timeoutSec = 600) {
    $p = Start-Process -FilePath "$env:ComSpec" -ArgumentList "/c $command >> `"$Log`" 2>&1" `
        -WorkingDirectory $Root -WindowStyle Hidden -PassThru
    if (-not $p.WaitForExit($timeoutSec * 1000)) {
        try { $p.Kill() } catch {}
        return -1
    }
    return $p.ExitCode
}

function Stop-Server {
    try {
        Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
            ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
        Start-Sleep -Milliseconds 400
    } catch {}
}

try {
    Write-Log '--- Inicio ---'
    $node = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $node) { throw 'No se encontro Node.js. Instalalo desde nodejs.org (version LTS) y vuelve a intentar.' }

    # 1) Actualizar desde GitHub: solo avance rapido y solo si no hay cambios locales sin guardar
    $updated = $false
    $git = (Get-Command git -ErrorAction SilentlyContinue).Source
    if ($git -and (Test-Path (Join-Path $Root '.git'))) {
        Push-Location $Root
        try {
            $dirty = (& git status --porcelain 2>$null | Measure-Object).Count -gt 0
            $branch = (& git rev-parse --abbrev-ref HEAD 2>$null)
            if (-not $dirty -and $branch -eq 'main') {
                $before = (& git rev-parse HEAD 2>$null)
                $code = Invoke-Quiet 'git pull --ff-only --quiet origin main' 30
                $after = (& git rev-parse HEAD 2>$null)
                if ($code -eq 0 -and $before -ne $after) {
                    $updated = $true
                    Write-Log "Actualizado desde GitHub: $before -> $after"
                } elseif ($code -ne 0) {
                    Write-Log 'Sin actualizar (sin internet o GitHub no respondio); se abre la version local.'
                }
            } else {
                Write-Log 'Sin actualizar: hay cambios locales o no se esta en main (modo desarrollo).'
            }
        } finally {
            Pop-Location
        }
    }

    # 2) Dependencias: si faltan o si package-lock.json cambio
    $installedLock = Join-Path $Root 'node_modules\.package-lock.json'
    $lock = Join-Path $Root 'package-lock.json'
    if (-not (Test-Path $installedLock) -or (Get-Item $lock).LastWriteTime -gt (Get-Item $installedLock).LastWriteTime) {
        Write-Log 'Instalando dependencias...'
        if ((Invoke-Quiet 'npm ci --no-audit --no-fund') -ne 0) {
            throw "No se pudieron instalar las dependencias (revisa la conexion). Registro: $Log"
        }
    }

    # 3) Compilar solo si algo en src/, public/ o index.html es mas nuevo que dist/
    $distIndex = Join-Path $Root 'dist\index.html'
    $needsBuild = -not (Test-Path $distIndex)
    if (-not $needsBuild) {
        $builtAt = (Get-Item $distIndex).LastWriteTime
        $sources = @((Join-Path $Root 'src'), (Join-Path $Root 'public'), (Join-Path $Root 'index.html'))
        $newer = Get-ChildItem -Path $sources -Recurse -File | Where-Object { $_.LastWriteTime -gt $builtAt } | Select-Object -First 1
        $needsBuild = [bool]$newer
    }
    if ($needsBuild) {
        Write-Log 'Compilando la app...'
        if ((Invoke-Quiet 'npm run build') -ne 0) {
            if (Test-Path $distIndex) {
                Write-Log 'La compilacion fallo; se abre la ultima version que funcionaba.'
            } else {
                throw "No se pudo compilar la app. Revisa el registro: $Log"
            }
        }
    }

    # 4) Servidor local: si su codigo cambio desde que arranco (por GitHub o a mano), se reinicia
    if (Test-Server) {
        $serverCode = Get-ChildItem -Path (Join-Path $Root 'server') -Filter '*.mjs' -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
        $running = $null
        try {
            $running = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
                ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } | Select-Object -First 1
        } catch {}
        if ($updated -or ($running -and $serverCode -and $serverCode.LastWriteTime -gt $running.StartTime)) {
            Write-Log 'Reiniciando el servidor con la version nueva...'
            Stop-Server
        }
    }
    if (-not (Test-Server)) {
        Write-Log 'Arrancando servidor local...'
        Start-Process -FilePath $node -ArgumentList "`"$Root\server\index.mjs`"" -WorkingDirectory $Root -WindowStyle Hidden `
            -RedirectStandardOutput (Join-Path $LogDir 'servidor.log') -RedirectStandardError (Join-Path $LogDir 'servidor-errores.log')
        $ready = $false
        for ($i = 0; $i -lt 40 -and -not $ready; $i++) {
            Start-Sleep -Milliseconds 250
            $ready = Test-Server
        }
        if (-not $ready) { throw "El servidor local no respondio. Revisa: $LogDir\servidor-errores.log" }
    }

    # 5) Edge en modo aplicacion; si no esta, el navegador predeterminado
    $edgeCandidates = @(
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    $edge = $edgeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($edge) {
        Start-Process -FilePath $edge -ArgumentList "--app=$Url", '--start-maximized'
    } else {
        Start-Process $Url
    }
    Write-Log 'Abierto.'
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    Show-Error $_.Exception.Message
}
