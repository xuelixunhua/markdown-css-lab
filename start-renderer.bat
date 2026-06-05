@echo off
setlocal

cd /d "%~dp0"

set PORT=8787
set URL=http://127.0.0.1:%PORT%/wechat-renderer/
set PYTHON_EXE=C:\Users\xueli\anaconda3\python.exe

echo Opening %URL%
start "" "%URL%"

if exist "%PYTHON_EXE%" (
  "%PYTHON_EXE%" -m http.server %PORT% --bind 127.0.0.1
) else (
  python -m http.server %PORT% --bind 127.0.0.1
)

pause
