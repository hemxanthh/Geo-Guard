@echo off
echo 🚀 Starting Geo Guard Production Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo [INFO] npm version:
npm --version

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Backend dependencies installed successfully

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd project
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed successfully

REM Build frontend for production
echo [INFO] Building frontend for production...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build frontend
    pause
    exit /b 1
)
echo [SUCCESS] Frontend built successfully

cd ..

REM Create logs directory
echo [INFO] Creating logs directory...
if not exist "logs" mkdir logs
echo [SUCCESS] Logs directory created

REM Copy environment example
if not exist ".env" (
    echo [INFO] Creating .env file from example...
    copy ".env.example" ".env"
    echo [WARNING] Please update .env file with your production values!
) else (
    echo [WARNING] .env file already exists. Please verify configuration.
)

REM Check if PM2 is installed globally
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PM2 is not installed globally. Install with: npm install -g pm2
) else (
    echo [INFO] PM2 version:
    pm2 --version
)

echo.
echo [SUCCESS] 🎉 Deployment preparation completed!
echo.
echo 📋 Next Steps:
echo 1. Update .env file with your production configuration
echo 2. Set up your production database
echo 3. Configure your domain and SSL certificates
echo 4. Start the application with: pm2 start ecosystem.config.js --env production
echo 5. Configure IIS or Nginx reverse proxy
echo 6. Test all features in production environment
echo.
echo 📖 For detailed instructions, see PRODUCTION_DEPLOYMENT_GUIDE.md
pause
