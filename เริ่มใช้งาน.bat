@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Ad Ops Dashboard - กำลังเปิดระบบ...
echo ============================================
echo.

REM ติดตั้ง dependency ครั้งแรก (ถ้ายังไม่มี)
if not exist "node_modules" (
  echo ติดตั้งครั้งแรก กรุณารอสักครู่...
  call npm install
)

REM เปิดเบราว์เซอร์หลังเซิร์ฟเวอร์เริ่ม
start "" cmd /c "timeout /t 2 >nul && start http://localhost:3200"

echo เปิดเบราว์เซอร์ไปที่ http://localhost:3200
echo ปิดหน้าต่างนี้เพื่อหยุดระบบ
echo.
call npm start
pause
