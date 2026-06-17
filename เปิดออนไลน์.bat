@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Ad Ops Dashboard - เปิดแบบออนไลน์
echo   (ได้ลิงก์ให้ทีมเข้าจากมือถือ/ที่อื่นได้)
echo ============================================
echo.

REM ติดตั้ง dependency ครั้งแรก (ถ้ายังไม่มี)
if not exist "node_modules" (
  echo ติดตั้งครั้งแรก กรุณารอสักครู่...
  call npm install
)

REM ดาวน์โหลด cloudflared ครั้งแรก (ตัวสร้างลิงก์ออนไลน์ของ Cloudflare - ฟรี)
if not exist "cloudflared.exe" (
  echo กำลังดาวน์โหลด cloudflared ^(ครั้งแรกครั้งเดียว ~60MB^)...
  powershell -Command "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
  if not exist "cloudflared.exe" (
    echo ดาวน์โหลดไม่สำเร็จ - ตรวจอินเทอร์เน็ตแล้วลองใหม่
    pause
    exit /b 1
  )
)

node src/jobs/online.js
pause
