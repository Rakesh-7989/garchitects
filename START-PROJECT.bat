@echo off
echo Updating content manifests...
node build.js

echo Starting Local Website...
start cmd /k "npx -y serve ."

echo Starting CMS Admin Server...
start cmd /k "npx -y decap-server"

echo All servers starting! 
echo Website: http://localhost:3000
echo Admin: http://localhost:3000/admin/
pause
