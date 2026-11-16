# Abre Ciencias Sociales con un clic:
# 1) compila la app si hubo cambios, 2) arranca el servidor local (datos en disco),
# 3) abre Microsoft Edge en modo aplicacion (sin barras del navegador).
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$Port = 5176
$Url = "http://127.0.0.1:$Port/"
$DataDir = Join-Path $env:USERPROFILE 'Documents\Expedicion6-Datos'
New-Item -ItemType Directory -Force $DataDir | Out-Null
$Log = Join-Path $DataDir 'lanzador.log'

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

try {
    Write-Log '--- Inicio ---'
    $node = (Get-Command node -ErrorAction SilentlyContinue).Source
    if (-not $node) { throw 'No se encontro Node.js. Instalalo desde nodejs.org y vuelve a intentar.' }

    # 1) Compilar solo si algo en src/, public/ o index.html es mas nuevo que dist/
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
        # Via cmd: en PowerShell 5.1 los avisos de npm por stderr detendrian el script
        $build = Start-Process -FilePath "$env:ComSpec" -ArgumentList "/c npm run build >> `"$Log`" 2>&1" `
            -WorkingDirectory $Root -WindowStyle Hidden -Wait -PassThru
        $buildOk = ($build.ExitCode -eq 0)
        if (-not $buildOk) {
            if (Test-Path $distIndex) {
                Write-Log 'La compilacion fallo; se abre la ultima version que funcionaba.'
            } else {
                throw "No se pudo compilar la app. Revisa el registro: $Log"
            }
        }
    }

    # 2) Servidor local (si ya corre, se reutiliza)
    if (-not (Test-Server)) {
        Write-Log 'Arrancando servidor local...'
        Start-Process -FilePath $node -ArgumentList "`"$Root\server\index.mjs`"" -WorkingDirectory $Root -WindowStyle Hidden `
            -RedirectStandardOutput (Join-Path $DataDir 'servidor.log') -RedirectStandardError (Join-Path $DataDir 'servidor-errores.log')
        $ready = $false
        for ($i = 0; $i -lt 40 -and -not $ready; $i++) {
            Start-Sleep -Milliseconds 250
            $ready = Test-Server
        }
        if (-not $ready) { throw "El servidor local no respondio. Revisa: $DataDir\servidor-errores.log" }
    }

    # 3) Edge en modo aplicacion; si no esta, el navegador predeterminado
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
