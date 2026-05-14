@echo off
echo Updating content manifests...
node build.js

echo Starting Local Website...
start cmd /k "node server.js"

echo Starting CMS Admin Server...
start cmd /k "npx -y decap-server"

echo All servers starting! 
echo Website: http://localhost:5500
echo Admin: http://localhost:5500/admin/
pause
