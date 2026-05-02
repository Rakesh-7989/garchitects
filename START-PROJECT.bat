@echo off
echo Updating content manifests...
node build.js

echo Starting Local Website...
start powershell -NoExit -Command "npx serve ."

echo Starting CMS Admin Server...
start powershell -NoExit -Command "npx decap-server"

echo All servers starting! 
echo Website: http://localhost:3000
echo Admin: http://localhost:3000/admin/
pause
