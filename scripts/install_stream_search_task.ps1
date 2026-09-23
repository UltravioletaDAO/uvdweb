# Registra la tarea programada que mantiene al dia la memoria de los streams: el
# indice de busqueda de /stream-summaries y de la tool WebMCP search_stream_memory.
#
# Corre refresh_stream_search.py con pythonw.exe (sin ventana) cada hora. Cada
# corrida mira si AbraKadabra dejo una transcripcion nueva o cambiada; si la hay,
# reconstruye el indice completo (16 s), lo sube a S3 y reinicia la Lambda. Una vez
# al dia lo republica aunque no haya streams nuevos, para que built_at en /stats
# sirva de latido: mas de 3 dias sin moverse = la tarea no esta corriendo.
#
# Este archivo, refresh_stream_search.py y build_stream_search_index.py van en la
# misma carpeta y la tarea apunta a esa carpeta: no depende de en que rama este
# ningun checkout. Estado (state.json), log (refresh.log) y la ultima copia
# publicada (search.db) quedan en %LOCALAPPDATA%\uvd-stream-search.
#
# Instalar:                 .\install_stream_search_task.ps1
# Ver que hara sin hacerlo: .\install_stream_search_task.ps1 -DryRun
# Quitar:                   .\install_stream_search_task.ps1 -Uninstall

[CmdletBinding()]
param(
    [int]$IntervalMinutes = 60,
    [string]$TaskName = 'uvd-stream-search-refresh',
    [string]$Corpus = 'Z:\ultravioleta\ai\cursor\abracadabra\streamers\0xultravioleta',
    [switch]$DryRun,
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$stateDir = Join-Path $env:LOCALAPPDATA 'uvd-stream-search'

if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[OK] Tarea '$TaskName' quitada. Estado y log siguen en $stateDir." -ForegroundColor Green
    return
}

$refresh = Join-Path $PSScriptRoot 'refresh_stream_search.py'
$builder = Join-Path $PSScriptRoot 'build_stream_search_index.py'
foreach ($file in @($refresh, $builder)) {
    if (-not (Test-Path $file)) {
        throw "No existe $file. Los tres archivos van en la misma carpeta que este instalador."
    }
}
if (-not (Test-Path $Corpus)) { throw "No existe el corpus $Corpus" }
if ($IntervalMinutes -lt 5 -or $IntervalMinutes -gt 1440) {
    throw "IntervalMinutes debe estar entre 5 y 1440 (recibido: $IntervalMinutes)"
}

# pythonw.exe es el interprete SIN consola. Sin el, la tarea abriria una ventana.
$python = (Get-Command python).Source
$pythonw = Join-Path (Split-Path -Parent $python) 'pythonw.exe'
if (-not (Test-Path $pythonw)) {
    throw "No se encontro pythonw.exe junto a $python. Sin el, la tarea abriria una ventana."
}

# Bajo pythonw un import roto o unas credenciales faltantes fallan en silencio:
# se comprueban aca, con el mismo python, antes de registrar nada.
& $python -c "import boto3, sqlite3; sqlite3.connect(':memory:').execute('create virtual table t using fts5(x)'); boto3.client('sts').get_caller_identity(); print('python, boto3, FTS5 y credenciales AWS: OK')"
if ($LASTEXITCODE -ne 0) {
    throw "El python de la tarea ($python) no tiene boto3, FTS5 o credenciales AWS."
}

$arguments = "`"$refresh`" --corpus `"$Corpus`""

Write-Host ''
Write-Host 'Tarea a registrar' -ForegroundColor Cyan
Write-Host "  Nombre    : $TaskName"
Write-Host "  Ejecuta   : $pythonw $arguments"
Write-Host "  Cada      : $IntervalMinutes minutos, indefinidamente (primera en 2 minutos)"
Write-Host "  Publica en: s3://ultravioletadao/stream-search/search.db + reinicio de la Lambda uvd-stream-search"
Write-Host "  Estado/log: $stateDir"
Write-Host "  Usuario   : $env:USERNAME (sin privilegios elevados)"
Write-Host ''

if ($DryRun) {
    Write-Host 'DryRun: no se registro nada.' -ForegroundColor Yellow
    return
}

$action = New-ScheduledTaskAction -Execute $pythonw -Argument $arguments `
    -WorkingDirectory $PSScriptRoot

$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(2) `
    -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes)

# StartWhenAvailable: si la maquina estuvo apagada, corre apenas vuelve.
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable -Hidden `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 20) `
    -MultipleInstances IgnoreNew

try { Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop } catch {}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Settings $settings `
    -Description 'uvdweb: reindexa la memoria de los streams (busqueda de /stream-summaries) cuando AbraKadabra termina una transcripcion, y una vez al dia. Sin ventana.' `
    | Out-Null

Write-Host "[OK] Tarea '$TaskName' registrada, cada $IntervalMinutes minutos, sin ventana." -ForegroundColor Green
Write-Host ''
Write-Host "Comprobar  : Get-ScheduledTaskInfo -TaskName $TaskName"
Write-Host "Correr ya  : Start-ScheduledTask -TaskName $TaskName"
Write-Host "Ver el log : Get-Content '$stateDir\refresh.log' -Tail 20"
Write-Host "Estado     : Get-Content '$stateDir\state.json'"
Write-Host "Quitar     : .\install_stream_search_task.ps1 -Uninstall"
