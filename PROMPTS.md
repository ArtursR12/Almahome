# PROMPTS.md — готовые промпты для Claude Code

Это пошаговая инструкция как делать сайт через Claude Code. **Каждый раздел = один промпт.** Открываешь Claude Code в терминале (`claude` в папке проекта), копируешь промпт, отправляешь, ждёшь, проверяешь результат, переходишь к следующему.

**Перед началом всех этапов:** убедись что в корне проекта лежит `CLAUDE.md` — Claude Code прочитает его как контекст автоматически.

---

## ⚙️ Этап 0. Подготовка (5 минут, делаешь руками)

```bash
cd ~/projects   # или куда удобно
mkdir almahome && cd almahome
# Скопируй сюда CLAUDE.md и PROMPTS.md из заготовок

git init
# Создай на github.com приватный repo "almahome"
git remote add origin git@github.com:<твой-username>/almahome.git

# Запусти Claude Code
claude
```

---

## 📦 Этап 1. Инициализация проекта

**Промпт:**

```
Прочитай CLAUDE.md в корне — это контекст всего проекта. Внимательно изучи разделы "Стек", "Структура проекта" и "Что НЕ делать".

Сейчас задача: инициализировать Astro проект со всеми нужными интеграциями.

Сделай:
1. Запусти `pnpm create astro@latest . -- --template minimal --typescript strict --no-install --no-git --skip-houston` (точка в конце важна — инициализируем в текущую папку)
2. Установи зависимости: `pnpm install`
3. Добавь интеграции через CLI: `pnpm astro add tailwind svelte sitemap` (соглашайся на все изменения)
4. Установи дополнительные пакеты: `pnpm add @astrojs/node resend @octokit/rest @fontsource/cormorant-garamond @fontsource/inter`
5. Установи dev зависимости: `pnpm add -D @types/node`
6. В astro.config.mjs:
   - Настрой output: 'server' (нужно для API роутов и middleware)
   - Подключи adapter @astrojs/node в standalone режиме
   - Настрой i18n: defaultLocale 'lv', locales ['lv', 'ru', 'en']
   - Site URL: 'https://almahome.lv'
7. В tsconfig.json настрой path alias `@/*` → `./src/*`
8. Создай папки согласно структуре в CLAUDE.md (src/components/{ui,layout,apartments,forms}, src/lib, src/data/content, public/images/{exterior,renders,floor-plans,logos})
9. Создай .gitignore с node_modules, dist, .env, .DS_Store
10. Создай .env.example со всеми переменными из CLAUDE.md (без значений)

После всего — покажи структуру (`ls -la` и `tree src` если есть, иначе `find src -type d`) и подтверди что astro.config.mjs выглядит правильно.

НЕ запускай dev server — мы это сделаем после следующего этапа.
```

**Что должно получиться:** рабочая Astro заготовка с Tailwind, Svelte, всеми зависимостями, правильным `astro.config.mjs`, структурой папок.

**Проверка:** `pnpm build` должен успешно собраться.

---

## 🎨 Этап 2. Дизайн-система и базовые компоненты

**Промпт:**

```
Перечитай раздел "Дизайн-система" в CLAUDE.md.

Задача: настроить тему и сделать базовые UI-компоненты.

1. tailwind.config.mjs:
   - В theme.extend.colors добавь палитру из CLAUDE.md (cream, beige, burgundy с DEFAULT/dark/light, ink с DEFAULT/muted, status с available/reserved/sold)
   - В theme.extend.fontFamily: 'serif': ['Cormorant Garamond', 'serif'], 'sans': ['Inter', 'system-ui']
   - В theme.extend.maxWidth: 'container': '1280px'

2. src/styles/globals.css:
   - Импорты @fontsource/cormorant-garamond/500.css, /600.css
   - Импорты @fontsource/inter/400.css, /500.css, /600.css
   - @tailwind base/components/utilities
   - В @layer base: html { font-family: theme(fontFamily.sans); color: theme(colors.ink.DEFAULT); background: theme(colors.cream); }
   - h1-h6 { font-family: theme(fontFamily.serif); font-weight: 500; }

3. Базовые компоненты в src/components/ui/:
   - Container.astro — центрированный max-w-container с px-6 md:px-8
   - Section.astro — обёртка с py-20 md:py-32, опциональным background prop ('cream' | 'beige')
   - Button.astro — props: variant ('primary' | 'secondary' | 'ghost'), size ('sm' | 'md' | 'lg'), href (если задан → <a>, иначе <button>). Primary = bg-burgundy text-cream hover:bg-burgundy-dark. Secondary = border border-burgundy text-burgundy hover:bg-burgundy hover:text-cream. Ghost = text-burgundy hover:bg-beige
   - Input.astro — стилизованный input с label, error state
   - Select.astro — то же для select

4. src/layouts/BaseLayout.astro:
   - <html lang> ставится из props
   - <head> с meta тегами: title, description, og:*, twitter:*, charset, viewport
   - Импорт globals.css
   - Slot для контента
   - Header и Footer из src/components/layout/ (создай их пустыми пока — заглушки с TODO)

5. Создай заглушку src/pages/index.astro которая использует BaseLayout и показывает "AlmaHome — coming soon" чтобы проверить что всё работает.

После — запусти `pnpm dev`, открой http://localhost:4321, скажи что видишь и приложи скриншот описанием. Если есть проблемы — пофикси.
```

**Что должно получиться:** работающий dev-сервер, на главной видна заглушка с правильными шрифтами и фоном.

**Проверка:** открой `localhost:4321`, должен быть бежевый фон, серифный заголовок.

---

## 🏠 Этап 3. Контент-коллекция квартир

**Промпт:**

```
Перечитай разделы "Структура данных квартир" и "Что НЕ делать" в CLAUDE.md.

Задача: настроить content collection и сгенерить JSON для всех 24 квартир.

1. src/content/config.ts:
   - Импорт defineCollection, z из 'astro:content'
   - Схема apartments из CLAUDE.md (number, floor, rooms, area_total, price, has_terrace, has_balcony, status, rooms_breakdown, floor_plan_image, render_images, description_*)
   - export const collections = { apartments }

2. src/lib/types.ts:
   - export type Apartment, ApartmentStatus, FloorData, FloorApartmentMarker
   - Используй z.infer для синхронизации с схемой

3. Сгенерь 24 JSON файла в src/content/apartments/ (apt-01.json ... apt-24.json). Используй данные с реального сайта (я приложу таблицу ниже) — на старте все статусы "available". Если каких-то полей нет в данных — ставь разумные заглушки и пометь TODO в комменте JSON-схемы (комменты в JSON через _comment поле).

Данные с almahome.lv (24 квартиры, 1 этаж — реальные данные):
- Apt 1: floor 1, 1 комн, 42.7 м², 76200 €, тераса
- Apt 2: floor 1, 3 комн, 67.2 м², 137500 €, тераса
- Apt 3: floor 1, 3 комн, 62.8 м², null цена, тераса
- Apt 4: floor 1, 2 комн, 57.3 м², null, тераса
- Apt 5: floor 1, 2 комн, 85 м², 141000 €, тераса
- Apt 6: floor 1, 4 комн, 122 м², 232500 €, тераса
- Apt 7: floor 1, 3 комн, 76.3 м², 159000 €, тераса
- Apt 8: floor 1, 2 комн, 56.9 м², 112200 €, тераса

Для квартир 9-24 (этажи 2-3) — сгенерь правдоподобные заглушки с TODO-комментом "проверить с реальным сайтом". Эти данные я докину когда зайду на сайт через креды.

rooms_breakdown — для квартиры 2 (она же detail page показывала):
- Virtuve un istaba 26.95 m² (LV), Кухня-гостиная (RU), Kitchen-living room (EN)
- Istaba 9.16 m²
- Istaba 11.26 m²
- Vannas istaba 3.79 m²
- Terase 16.02 m²

Для остальных — поставь по 2-4 правдоподобных комнаты в зависимости от количества комнат и общей площади.

floor_plan_image — пути типа "/images/floor-plans/apt-NN.jpg" (файлы пока не существуют, это нормально)
render_images — пустой массив пока

4. src/data/floor-plans.json:
   - Структура из CLAUDE.md — три этажа, image пути "/images/floor-plans/floor-1.jpg" и т.д.
   - Polygon coordinates пока заглушки — массив apartments с polygon: "TODO_REPLACE_WITH_REAL_COORDS" для каждой квартиры на нужном этаже
   - 8 квартир на 1 этаже, 8 на 2-м, 8 на 3-м (24 итого)

5. Тестовый код — добавь временную страницу src/pages/_test-apartments.astro которая выводит все квартиры из коллекции в виде <pre>{JSON.stringify(...)}</pre>. Открой её в dev и убедись что всё валидно.

В конце покажи мне структуру src/content/apartments/ и содержимое apt-01.json и apt-02.json для проверки.
```

**Что должно получиться:** 24 JSON файла в коллекции, типы выводятся, коллекция загружается без ошибок.

**Проверка:** `_test-apartments.astro` показывает все квартиры.

---

## 🏡 Этап 4. Главная страница

**Промпт:**

```
Перечитай разделы "Дизайн-система" и "Принципы UI/UX" в CLAUDE.md.

Задача: сделать главную страницу. Это маркетинговая страница, она статичная (без интерактива пока).

Структура секций:
1. Hero — большое фото фасада дома (используй placeholder /images/exterior/hero.jpg, если файла нет — заглушка), поверх затемнение, центрированный текст "ALMA HOME" (большой), подзаголовок "Mājīga dzīve Mežaparka tuvumā", CTA-кнопка "Apskatīt dzīvokļus" → ведёт на /dzivokli
2. О доме (2 колонки) — слева текст "AlmaHome — A+ energoefektivitātes klases jauns dzīvojamais nams Rīgā" + основные характеристики списком (3 этажа, 24 квартиры, 1-3 комнатные, тераса/балкон, парковка, видеонаблюдение, A+ класс). Справа фото
3. Локация (2 колонки) — слева большой текст про Mežaparks, Ķīšezers, OZO Golf Club, 15 минут до Vecāķi и центра Риги. Справа карта или фото района
4. Превью квартир — заголовок "Pieejamie dzīvokļi", сетка из 3-6 карточек квартир (бери первые available из коллекции). Карточка: фото планировки, номер, комнаты, площадь, цена, кнопка "Skatīt" → /dzivokli/N. Внизу секции CTA "Apskatīt visus dzīvokļus" → /dzivokli
5. Банки-партнёры — заголовок "Hipotekārā kredīta partneri", лого в ряд (Bigbank, Citadele, Luminor, Swedbank, SEB) — пока серые заглушки, картинки докинем позже
6. Контакты — три колонки: адрес (Mores iela 15, Rīga, LV-1034), телефон (+371 26148011), email (info@almahome.lv). Под ними короткая форма заявки или CTA "Sazināties"

Тексты — на латышском (это default lang). Делаем сразу красивые маркетинговые формулировки.

Используй компоненты Container и Section из ui/. Чередуй background='cream' и background='beige' для секций.

Картинки — везде где их нет, используй placeholder через https://placehold.co/WIDTHxHEIGHT/E8DDC9/5A1F2A?text=Photo (или можешь сгенерить простые SVG-плейсхолдеры). Размеры hero — 1920x1080, обычные секции — 800x600, карточки квартир — 400x300.

В Header (заглушку из этапа 2) добавь:
- Лого ALMA HOME слева (Cormorant Garamond, uppercase, tracking-widest)
- Навигация по центру/справа: Sākums, Par namu, Par projektu, Attēli, Dzīvokļi, Kontakti
- Переключатель языков LV / RU / EN справа
- Mobile: бургер-меню

В Footer:
- Лого
- Контакты
- Копирайт © 2026 Alma Home
- Ссылка на политику приватности (заглушка)

Когда сделаешь — покажи что страница рендерится без ошибок, опиши что видишь в браузере. Если что-то выглядит криво — поправь сразу.
```

**Что должно получиться:** красивая главная страница со всеми секциями, навигацией, футером.

**Проверка:** открой `localhost:4321`, прокрути всю страницу. Должно выглядеть как нормальный продакшн-сайт, не как студенческий проект.

---

## 📄 Этап 5. Статичные страницы

**Промпт:**

```
Задача: сделать четыре статичные страницы. Все на латышском, используем тот же BaseLayout.

1. /par-namu (src/pages/par-namu.astro):
   - Заголовок "Par namu"
   - Hero — фото фасада
   - Секции: "Arhitektūra un dizains", "Materiāli un apdare", "Energoefektivitāte (A+ klase)", "Apkārtne un infrastruktūra"
   - В каждой секции 2-3 параграфа осмысленного текста + фото
   - Внизу CTA "Apskatīt dzīvokļus" → /dzivokli

2. /par-projektu (src/pages/par-projektu.astro):
   - Заголовок "Par projektu"
   - Текст про застройщика, концепцию, сроки строительства
   - Карта с пином на Mores iela 15 (используй iframe Google Maps или статичную картинку с placehold)
   - Список достопримечательностей рядом: Mežaparks, Ķīšezers, OZO Golf Club, Kolonna ciemats, Vecāķi pludmale (с расстоянием/временем в пути)

3. /atteli (src/pages/atteli.astro):
   - Заголовок "Attēli"
   - Галерея — три категории: Eksterjers, Interjers, Stāvu plāni
   - В каждой категории — сетка фото (заглушки placehold пока)
   - Клик на фото → lightbox (используй простой Svelte-компонент Lightbox.svelte с CSS-only решением, без либ — fixed overlay, картинка по центру, клик по фону = закрыть, кнопки навигации)

4. /kontakti (src/pages/kontakti.astro):
   - Заголовок "Kontakti"
   - 2 колонки: слева форма (имя, email, телефон, сообщение, submit), справа контакты блоками (адрес, телефон, email)
   - Под формой — секция "Hipotekārā kredīta partneri" с лого банков
   - Карта с Mores iela 15

Форма пока без обработки — просто HTML, action="#". Реальная отправка будет на этапе 8.

Используй компоненты из ui/ везде где можно. Не дублируй стили.

Когда готово — покажи структуру файлов в src/pages/ и убедись что все ссылки в Header работают.
```

---

## 🗺️ Этап 6. Интерактивный план этажа (главное!)

**Это самый сложный этап. Тут не торопимся, разбиваем на под-этапы.**

### Этап 6a. Базовая структура страницы /dzivokli

**Промпт:**

```
Перечитай раздел "Интерактивный план этажа" в CLAUDE.md полностью.

Задача: каркас страницы /dzivokli без интерактивного плана пока — просто статика и таблица.

1. src/pages/dzivokli/index.astro:
   - Заголовок "Dzīvokļi"
   - Под ним легенда: 🟢 Pieejams / 🟡 Rezervēts / ⚪ Pārdots (используй CSS квадратики с цветами status-*)
   - Заглушка "TODO: интерактивный план этажа здесь" в рамке
   - Таблица всех квартир: колонки DZ.NR | STĀVS | ISTABU SKAITS | PLATĪBA | CENA | PIEZĪMES | STATUSS
   - Каждая строка кликабельна → если статус available, ведёт на /dzivokli/[number]
   - Статус в последней колонке — цветной бейдж
   - Над таблицей — фильтры (этаж checkboxes 1/2/3, комнаты checkboxes 1/2/3/4, чекбоксы Terase/Balkons, чекбоксы статусов). Пока без логики — просто HTML.

2. src/pages/dzivokli/[number].astro:
   - Динамический роут — getStaticPaths возвращает все номера квартир
   - Hero — фото фасада или рендер
   - Заголовок "Dzīvoklis NR. N"
   - 2 колонки: слева инфо (этаж, комнаты, разбивка по комнатам в виде таблицы, цена крупно), справа планировка квартиры
   - Секция галереи рендеров (если render_images не пустой)
   - Форма заявки внизу (имя, email, телефон, сообщение) — пока без обработки, поле apartmentNumber как hidden value={number}
   - Внизу — секция "Citi pieejamie dzīvokļi" с 3 другими available квартирами

3. Используй getCollection('apartments') в обоих файлах.

Покажи мне структуру и убедись что переход с главной на /dzivokli работает, и что клик по строке таблицы ведёт на детальную.
```

### Этап 6b. Интерактивный SVG-план

**Промпт:**

```
Перечитай раздел "Интерактивный план этажа" в CLAUDE.md, особенно скелет компонента FloorPlan.svelte.

Внимание: я разметил планы этажей через scripts/polygon-helper.html и сейчас обновлю src/data/floor-plans.json реальными координатами полигонов. Если поля все ещё содержат "TODO_REPLACE_WITH_REAL_COORDS" — спроси меня прежде чем продолжать.

Задача: сделать полностью рабочий интерактивный план этажа.

1. src/components/apartments/FloorPlan.svelte:
   - Props: floors (FloorData[]), apartments (Apartment[]), lang ('lv'|'ru'|'en')
   - State: activeFloor (number, default 1), hoveredApt (number|null), highlightedFromTable (number|null) через Svelte writable store
   - Табы переключения этажей сверху (из CLAUDE.md скелета, но улучши: красивые pill-buttons, smooth transition)
   - SVG с image плана + полигоны квартир
   - Полигоны: fill по статусу (status-available/reserved/sold), opacity 0.4 default, 0.7 при hover
   - На каждый полигон — mouseenter/leave handlers, click handler (если available → редирект на /dzivokli/N)
   - Tooltip позиционируется absolute по координатам мыши, показывает: №N · floor·rooms ист. · area m² · price € · статус
   - При hover из таблицы (через store) — соответствующий полигон подсвечивается
   - Smooth fade при смене этажа (200ms)

2. src/components/apartments/ApartmentTable.svelte:
   - Props: apartments (Apartment[]), filters (FilterState), lang
   - Реактивно фильтрует список по этажу/комнатам/тераса/балкон/статусу
   - При hover на строке — пишет number в общий store (тот же что слушает FloorPlan)
   - Клик по доступной строке → редирект
   - Mobile (< md): таблица превращается в карточки

3. src/components/apartments/ApartmentFilters.svelte:
   - Чекбоксы для этажей, комнат, удобств, статусов
   - Кнопка "Notīrīt visus filtrus"
   - Реактивный счётчик "Atrasti X dzīvokļi no Y"
   - Состояние через Svelte store, чтобы FloorPlan и Table его слушали

4. src/lib/stores.ts:
   - export const filtersStore = writable<FilterState>({ floors: [], rooms: [], terrace: false, balcony: false, statuses: ['available', 'reserved'] })
   - export const highlightedAptStore = writable<number | null>(null)

5. В src/pages/dzivokli/index.astro:
   - Замени заглушку на <FloorPlan client:visible {floors} {apartments} {lang} />
   - Над таблицей: <ApartmentFilters client:visible />
   - Таблица: <ApartmentTable client:visible {apartments} />
   - Передавай всё через props (в Astro это клиентские компоненты, поэтому serialize как JSON)

Важно: client:visible хидрейтит компонент только когда он попадает в viewport — экономит JS на загрузке.

Когда готово — расскажи что сделал, и попроси меня протестировать в браузере: hover, клики, фильтры, переключение этажей, mobile view.
```

---

## 📧 Этап 7. Форма заявки + Resend

**Промпт:**

```
Перечитай раздел "Форма заявки" в CLAUDE.md.

Задача: рабочая форма с отправкой email через Resend.

1. src/components/forms/InquiryForm.svelte:
   - Поля: name, email, phone (все required), message (optional), apartmentNumber (hidden, передаётся через prop)
   - Honeypot field "website" (скрытый CSS-ом, не visibility:hidden а offscreen position)
   - Валидация на клиенте: email regex, phone regex (мягкий — цифры, пробелы, +, -), name non-empty
   - При submit: fetch POST на /api/inquiry с JSON body
   - Состояния: idle / submitting / success / error
   - Success — заменяем форму на сообщение "Paldies! Sazināsimies ar Jums tuvākajā laikā"
   - Error — показываем сообщение, форму не сбрасываем

2. src/pages/api/inquiry.ts (код есть в CLAUDE.md, используй как основу):
   - Прими JSON
   - Honeypot check
   - Rate limit (5 заявок/час с IP, через Map в памяти)
   - Валидация полей
   - Resend отправка на INFO_EMAIL
   - Дополнительно: отправь подтверждение клиенту (на его email) с текстом на латышском "Paldies par jūsu interesi par AlmaHome..."
   - Логирование в console.log для отладки

3. Используй <InquiryForm /> в:
   - /kontakti — без apartmentNumber
   - /dzivokli/[number] — с apartmentNumber={number}
   - На главной (Этап 4) — упрощённая версия в секции контактов

4. Для тестирования локально — установи pnpm add -D dotenv и создай .env (gitignored) с реальным RESEND_API_KEY. Resend бесплатный аккаунт — 3000 писем/мес.

Когда готово — попроси меня дать RESEND_API_KEY чтобы протестировать локально.
```

---

## 🔐 Этап 8. Админка

**Промпт:**

```
Перечитай раздел "Админка — детальная архитектура" в CLAUDE.md полностью. Там есть готовые сниппеты для middleware, GitHub клиента, API роута и страницы — используй их как основу.

Задача: рабочая админка со сменой статусов через GitHub API.

1. src/middleware.ts — basic auth для /admin и /api/admin (код в CLAUDE.md)

2. src/lib/github.ts — клиент для коммитов в GitHub (код в CLAUDE.md)

3. src/pages/api/admin/update-status.ts — API эндпоинт (код в CLAUDE.md)

4. src/layouts/AdminLayout.astro — отдельный layout для админки:
   - Минималистичный, без публичной навигации
   - Тёмная тема (для отличия от публичного сайта): фон серый bg-slate-900, текст белый
   - Header: "AlmaHome Admin" + ссылки "Квартиры" / "Заявки" / "Logout" (basic auth logout — просто кнопка которая делает fetch с пустыми кредами)

5. src/pages/admin/index.astro — список квартир (код в CLAUDE.md, доработай):
   - Показывай статус красивым бейджем (зелёный/жёлтый/серый кружок + текст)
   - Кнопки смены статуса — отдельные кнопки на каждый возможный статус, текущий disabled
   - При клике — модалка подтверждения "Сменить статус квартиры N с X на Y?" → подтвердил → fetch API
   - После успешного запроса — toast "Изменение применится через ~1 минуту, нажмите F5 через минуту чтобы увидеть"
   - Грид адаптивный — 1 колонка mobile, 2 на md, 3 на lg

6. src/pages/admin/inquiries.astro — заглушка пока:
   - Просто страница с текстом "Заявки приходят на info@almahome.lv. В будущей версии тут будет список с возможностью пометки 'обработано'"

7. .env.example обнови всеми переменными из CLAUDE.md.

После того как сделаешь — попроси меня:
- Создать GitHub Personal Access Token (https://github.com/settings/tokens, classic, scope: repo)
- Положить токен в .env как GITHUB_TOKEN
- Прописать ADMIN_USERNAME и ADMIN_PASSWORD в .env
- Перезапустить dev и пройти на /admin

Если что-то не работает с GitHub API — попроси меня проверить scope токена.
```

---

## 🌍 Этап 9. Многоязычность

**Промпт:**

```
Перечитай раздел "Многоязычность" в CLAUDE.md.

Задача: добавить полную локализацию LV/RU/EN.

1. src/data/content/lv.ts, ru.ts, en.ts — экспорт объекта с одинаковыми ключами:
   ```typescript
   export const t = {
     nav: { home: '...', about: '...', project: '...', gallery: '...', apartments: '...', contacts: '...' },
     home: { hero: { title: '...', subtitle: '...', cta: '...' }, ... },
     apartments: { title: '...', filters: { ... }, statuses: { available: '...', reserved: '...', sold: '...' }, ... },
     // и так далее для всех страниц
   };
   ```
   Заполни все три файла полными переводами всех текстов с сайта. Для русского и английского — переведи качественно, не машинным переводом.

2. src/lib/i18n.ts:
   - export function getLang(url: URL): 'lv' | 'ru' | 'en'
   - export function getT(lang: string) → возвращает соответствующий объект t
   - export function localizedPath(path: string, lang: string): string

3. astro.config.mjs — i18n уже настроен в этапе 1, проверь что defaultLocale: 'lv', locales: ['lv','ru','en'], routing: { prefixDefaultLocale: false }

4. Создай зеркальные роуты в src/pages/ru/ и src/pages/en/ — каждая страница импортирует тот же контент-компонент но передаёт другой lang prop. Чтобы не дублировать код, вынеси содержимое страниц в src/components/pages/HomeContent.astro, AboutContent.astro и т.д., а сами страницы — тонкие обёртки.

5. Header — добавь LangSwitcher.astro:
   - Три ссылки LV / RU / EN
   - Текущий — bold + underline
   - Каждая ссылка ведёт на ту же страницу но в другом языке (используй localizedPath)

6. Все Astro страницы должны:
   - Получать lang из URL
   - Передавать его в BaseLayout
   - Использовать t из соответствующего файла

7. SEO: <link rel="alternate" hreflang="..."> для каждой языковой версии.

Когда готово — попроси меня протестировать переключение языков на нескольких страницах.
```

---

## 🔍 Этап 10. SEO + финальная полировка

**Промпт:**

```
Перечитай раздел "SEO" в CLAUDE.md.

Задача: добить всё SEO и проверить производительность.

1. BaseLayout.astro — расширь:
   - Все мета-теги: title, description, og:title, og:description, og:image, og:url, og:type, twitter:card, twitter:image
   - <link rel="canonical">
   - <link rel="alternate" hreflang="lv|ru|en|x-default">
   - Schema.org JSON-LD для организации (Organization) на главной
   - Для /dzivokli/[number] — Schema.org Apartment microdata

2. public/robots.txt:
   ```
   User-agent: *
   Allow: /
   Disallow: /admin/
   Sitemap: https://almahome.lv/sitemap-index.xml
   ```

3. Sitemap — @astrojs/sitemap уже настроен, проверь что включает все языковые версии.

4. Open Graph картинка:
   - public/og-image.jpg — 1200x630, фото фасада + лого "ALMA HOME" поверх
   - Если файла нет — сгенерь SVG-плейсхолдер с правильными размерами

5. Lighthouse проверка:
   - Запусти `pnpm build && pnpm preview`
   - Открой DevTools → Lighthouse → Mobile → Run
   - Должно быть 95+ во всех категориях
   - Если меньше — пофикси: уменьши картинки (используй Astro Image), убери лишний JS, добавь preload для шрифтов

6. .htaccess или vercel.json для редиректов и заголовков:
   - vercel.json — конфиг из CLAUDE.md
   - Добавь cache headers для /images/ (max-age=31536000)
   - Compression headers

7. Проверка: открой все страницы во всех языках, проверь что нигде нет 404, нигде нет дублей текста, мета-теги правильные.

Покажи Lighthouse скоры в конце.
```

---

## 🚀 Этап 11. Деплой на Vercel

**Это делаешь руками, но Claude Code может помочь с дебагом.**

### Шаг 11.1. Подготовка GitHub

```bash
# В терминале, в папке проекта
git add .
git commit -m "Initial commit: AlmaHome website"
git push -u origin main
```

### Шаг 11.2. Vercel (через браузер)

1. Зайди на vercel.com, логинься через GitHub
2. "Add New" → "Project"
3. Импортируй репо `almahome`
4. Framework Preset должен сам определиться как Astro
5. **Не нажимай Deploy сразу** — сначала добавь Environment Variables:
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - GITHUB_TOKEN
   - GITHUB_OWNER
   - GITHUB_REPO
   - RESEND_API_KEY
   - RESEND_FROM_EMAIL
   - INFO_EMAIL
6. Теперь Deploy. Ждёшь 1-2 минуты.
7. Получаешь URL `almahome-xxx.vercel.app` — открываешь, проверяешь.

### Шаг 11.3. Домен

1. Vercel → Project → Settings → Domains → Add `almahome.lv`
2. Vercel покажет какие DNS-записи прописать у регистратора
3. Идёшь к регистратору `almahome.lv` (заказчик должен дать доступ или сделать сам), прописываешь:
   - A record `@` → IP Vercel
   - CNAME `www` → `cname.vercel-dns.com`
4. Ждёшь 5 минут — несколько часов (DNS propagation)
5. Vercel выпустит SSL сертификат автоматически
6. Готово, сайт на `https://almahome.lv`

### Шаг 11.4. Если что-то сломалось

**Промпт для Claude Code:**

```
Деплой на Vercel сломался / выдаёт ошибку: <вставь ошибку из Vercel Build Logs>

Помоги диагностировать. Проверь:
1. astro.config.mjs — adapter @astrojs/node правильно настроен?
2. package.json scripts — есть build и start?
3. Все ли env переменные точно прописаны в Vercel?
4. node version в package.json engines — соответствует Vercel?

Покажи какие правки нужно внести и почему.
```

---

## 📋 Чеклист после деплоя

- [ ] Сайт открывается на https://almahome.lv
- [ ] Все три языка работают (LV / RU / EN)
- [ ] План этажа интерактивный, hover работает, клики работают
- [ ] Фильтры в таблице квартир работают
- [ ] Детальная страница квартиры показывает все данные
- [ ] Форма заявки отправляет email на info@almahome.lv
- [ ] Подтверждение клиенту приходит на его email
- [ ] /admin требует логин/пароль
- [ ] Смена статуса в админке коммитит в GitHub и через минуту обновляется на сайте
- [ ] Lighthouse 95+ на главной (mobile)
- [ ] /robots.txt и /sitemap-index.xml открываются
- [ ] OG-картинка показывается при шеринге в Facebook/Telegram (проверь через https://www.opengraph.xyz/)
- [ ] SSL сертификат валидный (зелёный замок)
- [ ] Mobile меню работает
- [ ] Все ссылки в Header и Footer ведут куда надо
- [ ] 404 страница есть и красивая

---

## 🛠️ После сдачи — поддержка

**Дневной workflow для правок:**

```bash
cd ~/projects/almahome
claude   # запускаешь Claude Code

# Просишь его сделать правку:
# "На главной поменяй заголовок на Y, добавь новую секцию Z"

# Когда готово:
git add . && git commit -m "Update homepage" && git push
# Vercel автодеплой через 30-60 секунд
```

**Если заказчик просит новую квартиру (вдруг что-то переразделили):**

```bash
# Просто создаёшь новый JSON в src/content/apartments/
# Обновляешь src/data/floor-plans.json с новым полигоном
# git push
```

**Если что-то сломалось на проде:**

1. Vercel → Deployments → находишь последний рабочий → "Promote to Production"
2. Откат за 5 секунд
3. Дальше дебажишь спокойно локально

---

## 💡 Полезные команды Claude Code

- `/clear` — очистить контекст если запутался
- `/init` — обновить CLAUDE.md по текущему состоянию проекта
- `/cost` — посмотреть сколько токенов потратил
- Прерви Claude Esc-ом если он пошёл не туда — лучше переформулируй промпт

**Принцип работы с Claude Code на этом проекте:**
- Не пытайся всё сделать одним мега-промптом. Разбивай на этапы.
- После каждого этапа — проверяй результат в браузере.
- Если что-то не так — описывай конкретно: "На странице X в секции Y фон не такой, должен быть beige а получился cream". Не "сделай красиво".
- Когда что-то заработало — коммить сразу. Меньше шансов потерять прогресс.
