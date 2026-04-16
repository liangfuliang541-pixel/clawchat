@echo off
echo.
echo 🦞 ClawChat Production Deploy
echo ==============================
echo.

REM Ensure .env exists
if not exist ".env" (
    echo ⚠️  .env not found, copying from .env.example...
    copy .env.example .env >nul
    echo 📝 Please edit .env and set a secure JWT_SECRET before deploying publicly!
    echo.
)

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is required but not installed.
    pause
    exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is required but not installed.
    pause
    exit /b 1
)

echo 🚀 Building and starting production services...
docker compose -f docker-compose.prod.yml up --build -d
if errorlevel 1 (
    echo ❌ Deployment failed.
    pause
    exit /b 1
)

echo.
echo ✅ ClawChat deployed successfully!
echo.
echo    🌐 Web UI:    http://localhost
echo    🔌 API:       http://localhost/api
echo    📊 Health:    http://localhost/health
echo.
echo    View logs:    docker compose -f docker-compose.prod.yml logs -f
echo    Stop:         docker compose -f docker-compose.prod.yml down
echo.
pause
