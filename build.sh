#!/bin/sh
# Збірка для Cloudflare (Build command: sh build.sh).
# Підставляє хеш коміту в ?v= для CSS/JS, щоб браузери не тримали старі файли.
set -e
V=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
find . -name "*.html" -not -path "./.git/*" -exec sed -i "s/?v=dev/?v=$V/g" {} +
echo "cache-bust: $V"
