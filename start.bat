@echo off
echo Starting Spice Garden Restaurant App...
echo.

echo [1/2] Starting Python Backend (FastAPI) on http://localhost:8000
start "FastAPI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Next.js Frontend on http://localhost:3000
start "Next.js Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ✅ Both servers are starting!
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:3000
echo    API Docs: http://localhost:8000/docs
echo.
pause

