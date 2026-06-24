@echo off
chcp 65001 >nul
echo ========================================
echo  花月诗境 - 十二花神诗词智能导览
echo ========================================
cd /d "%~dp0"
if not exist "backend\node_modules\" (
    echo 首次运行，正在安装依赖...
    call npm install
    if errorlevel 1 (
        echo npm install 失败，请确认已安装 Node.js 和 npm
        pause
        exit /b 1
    )
)
echo 正在启动 http://localhost:8080
call npm start
