$uploadsFolder = "c:\Users\boyap\Downloads\garchitectsandinteriors-main\garchitectsandinteriors-main\images\uploads"

Write-Host "Moving all images to uploads root folder..." -ForegroundColor Cyan

$images = Get-ChildItem -Path $uploadsFolder -Recurse -File -Include "*.jpg","*.jpeg","*.png","*.webp","*.gif","*.JPG","*.JPEG","*.PNG"

$moved = 0
$skipped = 0

foreach ($img in $images) {
    $destPath = Join-Path $uploadsFolder $img.Name
    
    if ($img.DirectoryName -eq $uploadsFolder) {
        continue
    }
    
    if (Test-Path $destPath) {
        $newName = [System.IO.Path]::GetFileNameWithoutExtension($img.Name) + "_" + $img.Directory.Name + $img.Extension
        $destPath = Join-Path $uploadsFolder $newName
    }
    
    try {
        Move-Item -Path $img.FullName -Destination $destPath -Force
        Write-Host "Moved: $($img.Name)" -ForegroundColor Green
        $moved++
    } catch {
        Write-Host "Skipped: $($img.Name) - $($_.Exception.Message)" -ForegroundColor Yellow
        $skipped++
    }
}

Write-Host ""
Write-Host "Done! Moved: $moved images, Skipped: $skipped" -ForegroundColor Cyan
Write-Host "Now refresh your Admin panel Media Library!" -ForegroundColor Yellow
