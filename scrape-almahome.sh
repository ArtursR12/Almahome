#!/bin/bash
# scrape-almahome.sh
# Скачивает весь публичный контент со старого almahome.lv для миграции
# Запуск: chmod +x scrape-almahome.sh && ./scrape-almahome.sh

set -e

OUTPUT_DIR="./almahome-old-content"
SITE_URL="https://almahome.lv"

# Проверяем что wget установлен (на Mac: brew install wget)
if ! command -v wget &> /dev/null; then
    echo "❌ wget не установлен. Установи: brew install wget"
    exit 1
fi

echo "📥 Скачиваю almahome.lv в $OUTPUT_DIR ..."
echo "   Это займёт 5-10 минут в зависимости от размера сайта"
echo ""

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

# Зеркалим сайт целиком:
# --mirror — рекурсивно, без ограничений глубины, с timestamping
# --convert-links — ссылки переписываются в относительные (можно открывать локально)
# --adjust-extension — добавляет .html где нужно
# --page-requisites — скачивает ВСЁ для отображения страницы (картинки, css, js)
# --no-parent — не выходим выше указанного URL
# --user-agent — притворяемся браузером (Joomla иногда блочит wget)
# --wait=1 — пауза между запросами чтобы не положить сайт
# --random-wait — случайный сдвиг паузы
# --tries=3 — повторы при ошибках
# -e robots=off — игнорим robots.txt (мы не злодеи, мы переносим контент с разрешения владельца)

wget \
    --mirror \
    --convert-links \
    --adjust-extension \
    --page-requisites \
    --no-parent \
    --user-agent="Mozilla/5.0 (Macintosh; Apple Silicon Mac OS X 14_0) AppleWebKit/537.36" \
    --wait=1 \
    --random-wait \
    --tries=3 \
    -e robots=off \
    "$SITE_URL"

echo ""
echo "✅ Скачивание завершено"
echo ""
echo "📁 Структура:"
find almahome.lv -maxdepth 2 -type d | head -20
echo ""

# Считаем сколько чего скачалось
IMG_COUNT=$(find almahome.lv -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) | wc -l | tr -d ' ')
HTML_COUNT=$(find almahome.lv -type f -name "*.html" | wc -l | tr -d ' ')

echo "📊 Картинок: $IMG_COUNT"
echo "📄 HTML страниц: $HTML_COUNT"
echo ""
echo "🎯 Следующие шаги:"
echo "   1. Открой almahome.lv/index.html в браузере чтобы убедиться что всё на месте"
echo "   2. Картинки квартир обычно лежат в almahome.lv/images/ или almahome.lv/media/"
echo "   3. Скопируй нужные ассеты в новый проект:"
echo "      - public/images/renders/    — рендеры интерьеров"
echo "      - public/images/floor-plans/ — планировки этажей и квартир"
echo "      - public/images/exterior/   — фото фасада"
