# PowerShell script to compress edited MP4 video
Write-Host 'SIE Wellness MP4 Compressor' -ForegroundColor Cyan
Write-Host 'Compressing edited MP4 to multiple quality levels...' -ForegroundColor Yellow

try {
    Get-Command ffmpeg -ErrorAction Stop | Out-Null
    Write-Host 'FFmpeg found' -ForegroundColor Green
}
catch {
    Write-Host 'FFmpeg not found. Install with: winget install ffmpeg' -ForegroundColor Red
    exit 1
}

# File paths
$input        = 'Sie_video.mp4'
$outputHigh   = 'Sie_video_high.mp4'
$outputMedium = 'Sie_video_medium.mp4'
$outputLow    = 'Sie_video_low.mp4'
$outputWebm   = 'Sie_video_compressed.webm'
$poster       = 'sie-video-poster.jpg'

if (-not (Test-Path $input)) {
    Write-Host "Input file '$input' not found." -ForegroundColor Red
    exit 1
}

Write-Host 'Starting compression...' -ForegroundColor Cyan

# High quality (CRF 25)
Write-Host '1. Creating high quality version (CRF 25)…' -ForegroundColor Yellow
& ffmpeg -y -i $input -movflags faststart -pix_fmt yuv420p `
    -vf 'scale=1280:-2' -c:v libx264 -preset slow -crf 25 `
    -loglevel error $outputHigh

# Medium quality (CRF 28)
Write-Host '2. Creating medium quality version (CRF 28)…' -ForegroundColor Yellow
& ffmpeg -y -i $input -movflags faststart -pix_fmt yuv420p `
    -vf 'scale=1280:-2' -c:v libx264 -preset slow -crf 28 `
    -loglevel error $outputMedium

# Low quality (CRF 32)
Write-Host '3. Creating low quality version (CRF 32)…' -ForegroundColor Yellow
& ffmpeg -y -i $input -movflags faststart -pix_fmt yuv420p `
    -vf 'scale=1280:-2' -c:v libx264 -preset slow -crf 32 `
    -loglevel error $outputLow

# WebM version (VP9)
Write-Host '4. Creating WebM version…' -ForegroundColor Yellow
& ffmpeg -y -i $input -c:v libvpx-vp9 -crf 32 -b:v 0 `
    -vf 'scale=1280:-2' -loglevel error $outputWebm

# Poster image (first frame)
Write-Host '5. Creating poster image…' -ForegroundColor Yellow
& ffmpeg -y -i $input -vframes 1 -f image2 `
    -loglevel error $poster

Write-Host 'Compression complete!' -ForegroundColor Green

# Show file sizes
$mb         = 1MB
$inputSize  = (Get-Item $input).Length / $mb
$highSize   = (Get-Item $outputHigh).Length / $mb
$medSize    = (Get-Item $outputMedium).Length / $mb
$lowSize    = (Get-Item $outputLow).Length / $mb
$webmSize   = (Get-Item $outputWebm).Length / $mb

Write-Host "`nFile size comparison:" -ForegroundColor Cyan
Write-Host ("Original MP4:    {0:N2} MB" -f $inputSize) -ForegroundColor Red
Write-Host ("High Quality:    {0:N2} MB ({1:N0}% smaller)" -f $highSize, ((1 - $highSize/$inputSize)*100)) -ForegroundColor Green
Write-Host ("Medium Quality:  {0:N2} MB ({1:N0}% smaller)" -f $medSize,  ((1 - $medSize/$inputSize)*100)) -ForegroundColor Green
Write-Host ("Low Quality:     {0:N2} MB ({1:N0}% smaller)" -f $lowSize,  ((1 - $lowSize/$inputSize)*100)) -ForegroundColor Green
Write-Host ("WebM Version:    {0:N2} MB ({1:N0}% smaller)" -f $webmSize, ((1 - $webmSize/$inputSize)*100)) -ForegroundColor Green

Write-Host "`nRecommendations:" -ForegroundColor Yellow
if ($medSize -lt 25) {
    Write-Host '✓ Medium quality version is under 25 MB – great for GitHub!' -ForegroundColor Green
}
elseif ($lowSize -lt 25) {
    Write-Host '⚠ Low quality version is under 25 MB – use that for GitHub.' -ForegroundColor Yellow
}
else {
    Write-Host '! All versions exceed 25 MB – consider external hosting.' -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host '1. Pick the best quality/size balance.' -ForegroundColor White
Write-Host "2. Rename chosen file to '$input'." -ForegroundColor White
Write-Host '3. Delete unused versions to save space.' -ForegroundColor White
