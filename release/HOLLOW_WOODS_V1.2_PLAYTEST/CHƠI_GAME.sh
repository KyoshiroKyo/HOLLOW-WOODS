#!/bin/bash
cd "$(dirname "$0")"
echo "========================================================"
echo "  HOLLOW WOODS V1.2 - DỊ CẢNH RỪNG LIỄU (PLAYTEST)"
echo "========================================================"

if command -v python3 &>/dev/null; then
    echo "Khởi động máy chủ bằng Python 3..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    python3 -m http.server 8080
elif command -v python &>/dev/null; then
    echo "Khởi động máy chủ bằng Python..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    python -m http.server 8080
elif command -v npx &>/dev/null; then
    echo "Khởi động máy chủ bằng npx serve..."
    (sleep 1 && (open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null)) &
    npx serve -l 8080 .
else
    echo "Vui lòng cài đặt Python hoặc Node.js để chạy máy chủ tĩnh cục bộ."
    read -p "Nhấn Enter để đóng..."
fi
