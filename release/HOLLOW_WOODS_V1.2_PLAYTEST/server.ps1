param([int]$Port = 8080)

$Root = $PSScriptRoot
if (-not $Root) { $Root = Get-Location }

# Tự động chọn port khả dụng
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
try {
    $listener.Prefixes.Add($prefix)
    $listener.Start()
} catch {
    $Port = 8081
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    try {
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    } catch {
        $Port = 8888
        $prefix = "http://localhost:$Port/"
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add($prefix)
        $listener.Start()
    }
}

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  HOLLOW WOODS V1.2 - DI CANH RUNG LIEU (PLAYTEST)" -ForegroundColor Cyan
Write-Host "  May chu dang chay tai: $prefix" -ForegroundColor Yellow
Write-Host "  Dang tu dong mo trinh duyet..." -ForegroundColor White
Write-Host "  Nhan [Ctrl + C] de thoat khi choi xong." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Green

Start-Process $prefix

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".mjs"  = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".json" = "application/json; charset=utf-8"
    ".wav"  = "audio/wav"
    ".mp3"  = "audio/mpeg"
    ".ogg"  = "audio/ogg"
    ".ico"  = "image/x-icon"
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        if ($rawUrl -eq "/" -or [string]::IsNullOrEmpty($rawUrl)) {
            $rawUrl = "/index.html"
        }
        $relPath = $rawUrl.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $filePath = [System.IO.Path]::Combine($Root, $relPath)

        if ([System.IO.File]::Exists($filePath)) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = "application/octet-stream"
            if ($mimeMap.ContainsKey($ext)) {
                $mime = $mimeMap[$ext]
            }
            $response.ContentType = $mime
            $response.Headers.Add("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }
        $response.OutputStream.Close()
    } catch {
        # Bo qua loi khi client ngat ket noi
    }
}
