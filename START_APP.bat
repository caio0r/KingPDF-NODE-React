@echo off
TITLE Raikiri PDF Tools - Iniciando...
COLOR 0A

echo =====================================================
echo      INICIANDO SISTEMA DE PDF - RAIKIRI
echo =====================================================
echo.

:: Navega para o diretorio atual do script
cd /d "%~dp0"

echo [1/3] Verificando Docker...
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] O Docker nao esta rodando!
    echo Por favor, abra o Docker Desktop e tente novamente.
    pause
    exit
)

echo [2/3] Subindo servicos (Isso pode levar alguns segundos)...
docker-compose up -d

echo [3/3] Abrindo navegador...
timeout /t 3 >nul
start http://localhost:3000

echo.
echo =====================================================
echo      SUCESSO! O SISTEMA ESTA ONLINE.
echo      Pode fechar esta janela.
echo =====================================================
timeout /t 10
