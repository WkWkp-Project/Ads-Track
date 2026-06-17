@echo off
chcp 65001 >nul
cd /d "%~dp0"
REM สคริปต์นี้สำหรับให้ Windows Task Scheduler เรียกทุกเช้า เพื่อส่งสรุปงานเข้า LINE
call npm run notify
