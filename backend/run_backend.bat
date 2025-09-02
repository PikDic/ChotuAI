@echo off
REM ===========================================
REM  run_backend.bat - Chotu AI backend launcher
REM  - Creates virtual environment (first run)
REM  - Installs requirements
REM  - Starts FastAPI server with uvicorn
REM ===========================================

SETLOCAL

REM Move into the folder where this script lives
cd /d "%~dp0"

REM --- Step 1: Create venv if not exists ---
if not exist ".venv\Scripts\python.exe" (
    echo [*] Creating Python virtual environment...
    python -m venv .venv
)

REM --- Step 2: Activate venv ---
call ".venv\Scripts\activate.bat"

REM --- Step 3: Upgrade pip & install deps ---
echo [*] Installing requirements...
pip install --upgrade pip
pip install -r requirements.txt

REM --- Step 4: Start backend with uvicorn ---
echo [*] Starting Chotu AI backend on http://127.0.0.1:8000 ...
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

ENDLOCAL
