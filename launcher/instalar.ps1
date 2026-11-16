# Instala Ciencias Sociales en este computador (se puede repetir sin problema).
# Uso: doble clic en "Instalar.cmd" en la raiz del proyecto.
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$ConfigFile = Join-Path $env:USERPROFILE '.ciencias-sociales.json'

function Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Yellow }
function Ok($msg) { Write-Host "   $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "   $msg" -ForegroundColor DarkYellow }
function Fail($msg) {
    Write-Host "`n   $msg" -ForegroundColor Red
    Read-Host "`nPresiona Enter para cerrar"
    exit 1
}

Write-Host '==============================================' -ForegroundColor Cyan
Write-Host '   CIENCIAS SOCIALES - Instalacion en este PC' -ForegroundColor Cyan
Write-Host '==============================================' -ForegroundColor Cyan

Step 'Revisando Node.js y Git'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Fail 'Falta Node.js. Instala la version LTS desde https://nodejs.org y vuelve a abrir este instalador.' }
$nodeVersion = (& node -v).TrimStart('v')
if ([version]$nodeVersion -lt [version]'22.12.0') { Fail "Node.js $nodeVersion es muy antiguo. Instala la version LTS (22.12 o superior) desde https://nodejs.org." }
Ok "Node.js $nodeVersion"
if (Get-Command git -ErrorAction SilentlyContinue) {
    Ok 'Git instalado: la app se actualizara sola desde GitHub al abrirla.'
} else {
    Warn 'Git no esta instalado: la app funciona, pero no se actualizara sola. Instalalo desde https://git-scm.com'
}

Step 'Instalando dependencias (unos minutos la primera vez)'
Push-Location $Root
try {
    cmd /c "npm ci --no-audit --no-fund"
    if ($LASTEXITCODE -ne 0) { Fail 'No se pudieron instalar las dependencias. Revisa la conexion a internet.' }
    Ok 'Dependencias listas.'

    Step 'Compilando la app'
    cmd /c "npm run build"
    if ($LASTEXITCODE -ne 0) { Fail 'La compilacion fallo. Revisa los mensajes de arriba.' }
    Ok 'App compilada.'

    Step 'Buscando tu carpeta de Clases en Google Drive'
    $paths = (& node --input-type=module -e "import('./server/localConfig.mjs').then(m => console.log(JSON.stringify(m.resolvePaths())))") | ConvertFrom-Json
    if (-not $paths.clasesDir) {
        Warn 'No encontre "Mi unidad\1. Trabajo\1. Clases" en ninguna unidad.'
        Warn 'Si usas Google Drive para escritorio, abrelo e inicia sesion, o pega aqui la ruta de tu carpeta "1. Clases".'
        $custom = Read-Host '   Ruta de la carpeta Clases (Enter para guardar los datos solo en este PC)'
        if ($custom -and (Test-Path $custom)) {
            $json = @{ clasesDir = $custom } | ConvertTo-Json
            [IO.File]::WriteAllText($ConfigFile, $json, (New-Object Text.UTF8Encoding $false))
            Ok "Guardado en $ConfigFile"
            $paths = (& node --input-type=module -e "import('./server/localConfig.mjs').then(m => console.log(JSON.stringify(m.resolvePaths())))") | ConvertFrom-Json
        } elseif ($custom) {
            Warn "Esa carpeta no existe: $custom"
        }
    }
    Ok "Datos de la app:   $($paths.dataDir)"
    if ($paths.socialesDir) { Ok "Banco de Recursos: $($paths.socialesDir)" } else { Warn 'Banco de Recursos: no encontrado (la pestana Recursos quedara vacia).' }
    if ($paths.dataDir -notlike "$($paths.clasesDir)*" -or -not $paths.clasesDir) {
        Warn 'Los datos quedan solo en este PC: no se veran en otros computadores.'
    }
} finally {
    Pop-Location
}

Step 'Creando el acceso directo en el Escritorio'
& (Join-Path $PSScriptRoot 'crear-acceso-directo.ps1')

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host '   Listo. Abre "Ciencias Sociales" desde el Escritorio.' -ForegroundColor Cyan
Write-Host '==============================================' -ForegroundColor Cyan
Read-Host "`nPresiona Enter para cerrar"
