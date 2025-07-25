# PowerShell script to convert GIF to video formats
Write-Host "SIE Wellness Video Converter" -ForegroundColor Cyan
Write-Host "Converting 200MB GIF to optimized video formats..." -ForegroundColor Yellow

try {
    $null = Get-Command ffmpeg -ErrorAction Stop
    Write-Host "FFmpeg found" -ForegroundColor Green
}
catch {
    Write-Host "FFmpeg not found. Install with: winget install ffmpeg" -ForegroundColor Red
    exit 1
}

$gifPath = "Sie_video.gif"
$mp4Path = "Sie_video.mp4"
$webmPath = "Sie_video.webm"
$posterPath = "sie-video-poster.jpg"

if (!(Test-Path $gifPath)) {
    Write-Host "Sie_video.gif not found" -ForegroundColor Red
    exit 1
}

Write-Host "Starting conversion..." -ForegroundColor Cyan

Write-Host "1. Converting to MP4..." -ForegroundColor Yellow
& ffmpeg -i $gifPath -movflags faststart -pix_fmt yuv420p -vf "scale=1280:-2" -c:v libx264 -preset slow -crf 22 $mp4Path -y

Write-Host "2. Converting to WebM..." -ForegroundColor Yellow
& ffmpeg -i $gifPath -c:v libvpx-vp9 -crf 30 -b:v 0 -vf "scale=1280:-2" $webmPath -y

Write-Host "3. Creating poster image..." -ForegroundColor Yellow
& ffmpeg -i $gifPath -vframes 1 -f image2 $posterPath -y

Write-Host "Conversion complete!" -ForegroundColor Green

$gifSize = (Get-Item $gifPath).Length / 1MB
$mp4Size = (Get-Item $mp4Path).Length / 1MB
$webmSize = (Get-Item $webmPath).Length / 1MB

Write-Host ("Original GIF: {0:N2} MB" -f $gifSize) -ForegroundColor Red
Write-Host ("MP4 Video: {0:N2} MB ({1:N0}% smaller)" -f $mp4Size, ((1 - $mp4Size/$gifSize) * 100)) -ForegroundColor Green
Write-Host ("WebM Video: {0:N2} MB ({1:N0}% smaller)" -f $webmSize, ((1 - $webmSize/$gifSize) * 100)) -ForegroundColor Green
