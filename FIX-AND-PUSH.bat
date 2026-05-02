@echo off
echo =============================================
echo  STEP 1: Moving images to uploads folder...
echo =============================================
powershell -ExecutionPolicy Bypass -File ".\move-images.ps1"

echo.
echo =============================================
echo  STEP 2: Update content manifests...
echo =============================================
node build.js

echo.
echo =============================================
echo  STEP 3: Git add and commit...
echo =============================================
git add .
git commit -m "Update website content and images"

echo.
echo =============================================
echo  STEP 4: Push to GitHub...
echo =============================================
echo NOTE: A browser window will open for GitHub login.
echo Please login with Rakesh-7989 account and click AUTHORIZE!
echo.
git push -u origin main

echo.
echo =============================================
echo  ALL DONE!
echo =============================================
pause
