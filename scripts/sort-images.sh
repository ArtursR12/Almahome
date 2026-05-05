#!/bin/bash
# ============================================================
# AlmaHome — sorter for downloaded Joomla media (v2)
#
# Изменения с v1:
#  - Ловит формат dz_10_001 (квартира 10) — раньше пропускал
#  - При дублях не затирает, а добавляет суффикс -copy/-copy2/...
#    Так ты потом руками выберешь лучший вариант из нескольких
#
# Запуск:
#   ./sort-images.sh           ← dry run
#   ./sort-images.sh --apply   ← реальное перемещение
# ============================================================

set -e

SOURCE="$HOME/Downloads/AlmaAssets"
PROJECT="$HOME/Desktop/Almahome"
IMG_DIR="$PROJECT/public/images"

EXTERIOR="$IMG_DIR/exterior"
RENDERS="$IMG_DIR/renders"
FLOOR_PLANS="$IMG_DIR/floor-plans"
LOGOS="$IMG_DIR/logos"
MISC="$IMG_DIR/_misc"
TRASH="$IMG_DIR/_trash"

APPLY=0
if [ "$1" = "--apply" ]; then
    APPLY=1
fi

if [ ! -d "$SOURCE" ]; then
    echo "❌ Папка $SOURCE не существует."
    exit 1
fi

if [ ! -d "$PROJECT" ]; then
    echo "❌ Папка проекта $PROJECT не найдена."
    exit 1
fi

if [ "$APPLY" = "1" ]; then
    mkdir -p "$EXTERIOR" "$RENDERS" "$FLOOR_PLANS" "$LOGOS" "$MISC" "$TRASH"
fi

if [ "$APPLY" = "1" ]; then
    echo "🚀 РЕАЛЬНЫЙ РЕЖИМ — файлы будут ПЕРЕМЕЩЕНЫ"
else
    echo "👀 DRY RUN — ничего не трогаем, только показываем что будет"
    echo "   Чтобы применить, запусти: ./sort-images.sh --apply"
fi
echo "📂 Источник: $SOURCE"
echo "📂 Цель:     $IMG_DIR"
echo ""

# ===== Хелпер: уникальное имя если файл уже существует =====
# Если "apt-14.jpg" занят — вернёт "apt-14--copy.jpg", потом "apt-14--copy2.jpg" итд
unique_name() {
    local dst="$1"
    if [ "$APPLY" = "0" ]; then
        # В dry-run не проверяем диск, проверяем только в текущем сеансе через массив
        if [ "${dry_targets[$dst]}" = "1" ]; then
            local base="${dst%.*}"
            local ext="${dst##*.}"
            local i=1
            while [ "${dry_targets[${base}--copy${i}.${ext}]}" = "1" ]; do
                i=$((i+1))
            done
            local newdst
            if [ $i -eq 1 ]; then
                newdst="${base}--copy.${ext}"
            else
                newdst="${base}--copy${i}.${ext}"
            fi
            dry_targets["$newdst"]=1
            echo "$newdst"
        else
            dry_targets["$dst"]=1
            echo "$dst"
        fi
    else
        # В реальном режиме проверяем существует ли файл на диске
        if [ -e "$dst" ]; then
            local base="${dst%.*}"
            local ext="${dst##*.}"
            local i=1
            while [ -e "${base}--copy${i}.${ext}" ]; do
                i=$((i+1))
            done
            if [ $i -eq 1 ]; then
                echo "${base}--copy.${ext}"
            else
                echo "${base}--copy${i}.${ext}"
            fi
        else
            echo "$dst"
        fi
    fi
}

declare -A dry_targets

move_to() {
    local src="$1"
    local dst="$2"
    local label="$3"

    # Получаем уникальное имя если файл уже занят
    local final_dst
    final_dst=$(unique_name "$dst")

    if [ "$APPLY" = "1" ]; then
        mv "$src" "$final_dst"
    fi

    local short_dst=$(echo "$final_dst" | sed "s|$IMG_DIR/||")
    if [ "$dst" != "$final_dst" ]; then
        echo "$label  $(basename "$src")  →  $short_dst  ⚠️  (был дубль)"
    else
        echo "$label  $(basename "$src")  →  $short_dst"
    fi
}

SORTED=0
TRASHED=0
MISC_COUNT=0
DUPLICATES=0

cd "$SOURCE"
shopt -s nullglob nocaseglob

for f in *.jpg *.jpeg *.png *.webp; do
    [ -f "$f" ] || continue

    # ===== ШАГ 1: МУСОР =====
    case "$f" in
        *_spmedia_thumbs__*)
            move_to "$f" "$TRASH/$f" "🗑"
            TRASHED=$((TRASHED+1))
            continue
            ;;
        joomla_black.png|powered_by.png|transparent.png|quote.png|favicon.jpg|favicon.png|logo-light.png|logo.png)
            move_to "$f" "$TRASH/$f" "🗑"
            TRASHED=$((TRASHED+1))
            continue
            ;;
        about__*.jpg|gallery__*.jpg|portfolio__*.jpg)
            move_to "$f" "$TRASH/$f" "🗑"
            TRASHED=$((TRASHED+1))
            continue
            ;;
        29.png|image00*.jpg|image00*.png|kuhnja_*.jpg|santeh*.jpg|rozet*.jpg|durvi*.jpg|gridas*.jpg)
            move_to "$f" "$TRASH/$f" "🗑"
            TRASHED=$((TRASHED+1))
            continue
            ;;
        *zastavka*|banner.jpg|banner-2.jpg)
            move_to "$f" "$TRASH/$f" "🗑"
            TRASHED=$((TRASHED+1))
            continue
            ;;
    esac

    # Префикс даты с _29.png — кидаем в trash
    if [[ "$f" =~ ^[0-9]{4}__[0-9]{2}__[0-9]{2}__29\.png$ ]]; then
        move_to "$f" "$TRASH/$f" "🗑"
        TRASHED=$((TRASHED+1))
        continue
    fi

    # ===== ШАГ 2: ФАСАД =====
    case "$f" in
        *1920_alma_summer-drone*)
            move_to "$f" "$EXTERIOR/hero.jpg" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
        *winter-drone*)
            move_to "$f" "$EXTERIOR/exterior-winter.jpg" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
        *autumn-drone*)
            move_to "$f" "$EXTERIOR/exterior-autumn.jpg" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
        *summer-drone*)
            move_to "$f" "$EXTERIOR/exterior-summer.jpg" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
        *alma_0003*|*alma_0006*|*alma_0000*)
            clean=$(echo "$f" | sed -E 's/^[0-9]{4}__[0-9]{2}__[0-9]{2}__//')
            clean=$(echo "$clean" | sed -E 's/^[0-9]+([a-z])/\1/')
            move_to "$f" "$EXTERIOR/$clean" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
        2stavs.jpg|3stavs.jpg)
            move_to "$f" "$EXTERIOR/$f" "🏢"
            SORTED=$((SORTED+1))
            continue
            ;;
    esac

    # ===== ШАГ 3: ПЛАНЫ ЭТАЖЕЙ =====
    case "$f" in
        *STAVS_01*|*Stavs_01*|*stavs_01*)
            move_to "$f" "$FLOOR_PLANS/floor-1.png" "📐"
            SORTED=$((SORTED+1))
            continue
            ;;
        *STAVS_02*|*Stavs_02*|*stavs_02*)
            move_to "$f" "$FLOOR_PLANS/floor-2.png" "📐"
            SORTED=$((SORTED+1))
            continue
            ;;
        *STAVS_03*|*Stavs_03*|*stavs_03*)
            move_to "$f" "$FLOOR_PLANS/floor-3.png" "📐"
            SORTED=$((SORTED+1))
            continue
            ;;
    esac

    # ===== ШАГ 4: КВАРТИРЫ =====
    # Дубль *_001-2 — мусор
    if [[ "$f" =~ dz[0-9]+_001-2 ]] || [[ "$f" =~ dz_[0-9]+_001-2 ]]; then
        move_to "$f" "$TRASH/$f" "🗑"
        TRASHED=$((TRASHED+1))
        continue
    fi

    # Формат "dz_10_001" — двузначный после dz_ (через подчёркивание)
    # ВАЖНО: проверять до однозначного, иначе [1-9] поймает только "1" из "10"
    if [[ "$f" =~ dz_([0-9]{2})_001\. ]]; then
        num="${BASH_REMATCH[1]}"
        move_to "$f" "$FLOOR_PLANS/apt-${num}.jpg" "📐"
        SORTED=$((SORTED+1))
        continue
    fi
    if [[ "$f" =~ dz_([0-9]{2})_002\. ]]; then
        num="${BASH_REMATCH[1]}"
        move_to "$f" "$RENDERS/apt-${num}-alt.jpg" "🎨"
        SORTED=$((SORTED+1))
        continue
    fi

    # Однозначные dz_1_001 ... dz_9_001
    if [[ "$f" =~ dz_([1-9])_001\. ]]; then
        num="${BASH_REMATCH[1]}"
        padded=$(printf "%02d" "$num")
        move_to "$f" "$FLOOR_PLANS/apt-${padded}.jpg" "📐"
        SORTED=$((SORTED+1))
        continue
    fi
    if [[ "$f" =~ dz_([1-9])_002\. ]]; then
        num="${BASH_REMATCH[1]}"
        padded=$(printf "%02d" "$num")
        move_to "$f" "$RENDERS/apt-${padded}-alt.jpg" "🎨"
        SORTED=$((SORTED+1))
        continue
    fi

    # Двузначные без подчёркивания: dz11_001 ... dz30_001
    if [[ "$f" =~ dz([0-9]{2})_001\. ]]; then
        num="${BASH_REMATCH[1]}"
        move_to "$f" "$FLOOR_PLANS/apt-${num}.jpg" "📐"
        SORTED=$((SORTED+1))
        continue
    fi
    if [[ "$f" =~ dz([0-9]{2})_002\. ]]; then
        num="${BASH_REMATCH[1]}"
        move_to "$f" "$RENDERS/apt-${num}-alt.jpg" "🎨"
        SORTED=$((SORTED+1))
        continue
    fi

    # Типовые планировки 1b/2a/3a
    if [[ "$f" =~ STAVS_([0-9])([a-z]) ]]; then
        rooms="${BASH_REMATCH[1]}"
        variant="${BASH_REMATCH[2]}"
        move_to "$f" "$FLOOR_PLANS/type-${rooms}-room-${variant}.png" "📐"
        SORTED=$((SORTED+1))
        continue
    fi

    # ===== ШАГ 5: РЕНДЕРЫ =====
    case "$f" in
        *bedroom*|*kidsroom*|*kitchen*|*livingroom*|*living1*|*living2*|*living3*|*wc-final*|*wc_final*)
            clean=$(echo "$f" | sed -E 's/^[0-9]{4}__[0-9]{2}__[0-9]{2}__//')
            clean=$(echo "$clean" | sed -E 's/^0+([a-z])/\1/')
            move_to "$f" "$RENDERS/$clean" "🎨"
            SORTED=$((SORTED+1))
            continue
            ;;
        *alma_dz16-living*)
            clean=$(echo "$f" | sed -E 's/^[0-9]{4}__[0-9]{2}__[0-9]{2}__//')
            move_to "$f" "$RENDERS/$clean" "🎨"
            SORTED=$((SORTED+1))
            continue
            ;;
    esac

    # ===== ШАГ 6: БАНКИ =====
    case "$f" in
        *bigbank*)
            ext="${f##*.}"
            ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
            move_to "$f" "$LOGOS/bigbank.${ext_lower}" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
        *citadele*)
            ext="${f##*.}"
            ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
            move_to "$f" "$LOGOS/citadele.${ext_lower}" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
        *luminor*)
            ext="${f##*.}"
            ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
            move_to "$f" "$LOGOS/luminor.${ext_lower}" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
        *swedbank*)
            ext="${f##*.}"
            ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
            move_to "$f" "$LOGOS/swedbank.${ext_lower}" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
        *seb*)
            ext="${f##*.}"
            ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
            move_to "$f" "$LOGOS/seb.${ext_lower}" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
    esac

    case "$f" in
        *alma_logo*)
            move_to "$f" "$LOGOS/alma-home-logo.png" "🏦"
            SORTED=$((SORTED+1))
            continue
            ;;
    esac

    # ===== Остаток =====
    move_to "$f" "$MISC/$f" "❓"
    MISC_COUNT=$((MISC_COUNT+1))
done

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Готово!"
echo "   Распределено по папкам: $SORTED"
echo "   В _trash (мусор):       $TRASHED"
echo "   В _misc (на ручной разбор): $MISC_COUNT"
echo "═══════════════════════════════════════════"
echo ""

if [ "$APPLY" = "0" ]; then
    echo "👆 Это был DRY RUN — ничего не перемещено."
    echo "   Если выглядит правильно — применяй:"
    echo "     ./sort-images.sh --apply"
    echo ""
    echo "💡 Файлы помеченные ⚠️ (был дубль) — это второй+ файл с тем же именем."
    echo "   Они получат суффикс --copy, --copy2 итд. Потом сравнишь и удалишь хуже."
else
    echo "📁 Проверь:"
    echo "   public/images/exterior/    — фасад"
    echo "   public/images/renders/     — рендеры интерьеров"
    echo "   public/images/floor-plans/ — планы этажей и квартир"
    echo "   public/images/logos/       — лого банков"
    echo "   public/images/_misc/       — что не распознали"
    echo "   public/images/_trash/      — мусор (можно удалить: rm -rf public/images/_trash)"
    echo ""
    echo "🚀 После проверки перезапусти dev: pnpm dev"
fi