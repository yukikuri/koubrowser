@echo off
rem change current directory to bat directory.
cd /d %~dp0
rem SET test_mode=1
powershell.exe -NoExit -Command "npm run dev"
