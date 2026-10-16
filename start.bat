@echo off
cd /d "%~dp0"
if not exist node_modules (echo Installing packages... & call npm install)
echo Starting Coco's Mall on http://localhost:3000
start http://localhost:3000
node server.js
