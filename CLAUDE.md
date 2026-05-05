# AlmaHome — сайт жилого комплекса

## Контекст проекта

Девелоперский сайт для жилого комплекса AlmaHome (Mores iela 15, Rīga). Цель — показать дом, район, квартиры и собирать заявки на покупку. Это **не аренда, не Booking** — это продажа квартир в новостройке.

Старый сайт сделан на Joomla, выглядит как 2014 год, не поддерживается. Мы переделываем с нуля сохраняя структуру информации, но делая всё современно и быстро.

Адрес: Mores iela 15, Rīga, LV-1034
Контакты: +371 26148011, info@almahome.lv
Дом: 3 этажа, A+ энергоэффективность, ~24 квартиры (1-3 комнатные)
Расположение: рядом Mežaparks, Ķīšezers, Vecāķi pludmale, OZO Golf Club
Партнёры по ипотеке: Bigbank, Citadele, Luminor, Swedbank, SEB

## Стек

- **Astro 4+** — статический генератор, основа
- **Tailwind CSS** — стилизация, никаких CSS файлов кроме `globals.css`
- **Svelte** (Astro islands) — только для интерактивных компонентов
- **TypeScript strict** — везде
- **Content Collections** (Astro) — для квартир
- **Resend** — отправка email
- **@octokit/rest** — GitHub API клиент для админки
- **Vercel** — хостинг с автодеплоем

## Что НЕ делать

- Не использовать React. Только Svelte для интерактива
- Не тащить тяжёлые UI-либы (MUI, Ant Design, shadcn). Только чистый Tailwind
- Не делать клиентский JS там где можно обойтись статикой
- Не использовать `localStorage` для критичных данных
- Не плодить компоненты ради компонентов
- Не использовать иконочные шрифты — только SVG inline или `lucide-svelte`
- Не использовать БД. Все данные в JSON-файлах в репозитории
- Не делать "редактирование контента в админке". Только смена статусов квартир

## Дизайн-система

### Палитра и типографика (Tailwind v4)

Проект использует **Tailwind v4** (через `@tailwindcss/vite`). В v4 нет `tailwind.config.mjs` — тема описывается через `@theme` прямо в CSS. Утилиты типа `bg-burgundy`, `text-cream`, `font-serif`, `border-status-available` автогенерируются из CSS-переменных.

Единственное место конфига темы — **`src/styles/globals.css`**:

```css
@import "tailwindcss";
@import "@fontsource/cormorant-garamond/500.css";
@import "@fontsource/cormorant-garamond/600.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";

@theme {
  --color-cream: #F5EFE6;
  --color-beige: #E8DDC9;
  --color-burgundy: #5A1F2A;
  --color-burgundy-dark: #3D1419;
  --color-burgundy-light: #7A2F3A;
  --color-ink: #2A1F1A;
  --color-ink-muted: #6B5D52;
  --color-status-available: #4A7C59;
  --color-status-reserved: #C9A961;
  --color-status-sold: #8B8680;

  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", system-ui, sans-serif;

  --container-max: 1280px;
}

@layer base {
  html {
    font-family: var(--font-sans);
    color: var(--color-ink);
    background: var(--color-cream);
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-serif);
    font-weight: 500;
  }
}
```

**Важно про именование цветов в v4:** вложенные объекты (`burgundy.DEFAULT/dark/light` из v3-стиля) превращаются в плоские токены: `--color-burgundy`, `--color-burgundy-dark`, `--color-burgundy-light`. Аналогично `ink` и `status-*`. Утилиты соответственно: `bg-burgundy`, `bg-burgundy-dark`, `text-ink-muted`, `fill-status-available`.

**Типографика:**
- Заголовки: **Cormorant Garamond** (500/600 weights, через `@fontsource/cormorant-garamond`) → `font-serif`
- Текст: **Inter** (400/500/600, через `@fontsource/inter`) → `font-sans`
- Логотип ALMA HOME — `font-serif tracking-widest uppercase`

**Container max-width 1280px** — используем `--container-max` через `max-w-[var(--container-max)]` в `Container.astro` (либо можно зарегистрировать как `--container-*` токен, чтобы получить утилиту `max-w-...`).

### Принципы UI/UX

- **Воздуха много.** `py-20`, `py-32` между секциями
- **Минимум теней-бордеров.** Только где функционально нужно
- **Hover везде.** Кликабельное выглядит кликабельным
- **Анимации тонкие.** `transition-all duration-200`
- **Mobile first.** Container max-width 1280px, центрированный

## Структура проекта

```
src/
├── components/
│   ├── ui/                  # Button, Container, Section, Input, Select
│   ├── layout/              # Header, Footer, MobileMenu, LangSwitcher
│   ├── apartments/          # FloorPlan.svelte, ApartmentTable.svelte, ApartmentCard.svelte
│   └── forms/               # InquiryForm.svelte
├── layouts/
│   ├── BaseLayout.astro
│   └── AdminLayout.astro
├── pages/
│   ├── index.astro
│   ├── par-namu.astro
│   ├── par-projektu.astro
│   ├── atteli.astro
│   ├── kontakti.astro
│   ├── dzivokli/
│   │   ├── index.astro
│   │   └── [number].astro
│   ├── admin/
│   │   ├── index.astro
│   │   └── inquiries.astro
│   ├── api/
│   │   ├── inquiry.ts
│   │   └── admin/
│   │       └── update-status.ts
│   └── ru/, en/
├── content/
│   ├── config.ts
│   └── apartments/          # apt-01.json ... apt-24.json
├── data/
│   ├── floor-plans.json
│   └── content/
│       ├── lv.ts, ru.ts, en.ts
├── lib/
│   ├── github.ts
│   ├── auth.ts
│   ├── resend.ts
│   └── i18n.ts
├── styles/
│   └── globals.css
└── middleware.ts

public/
├── images/
│   ├── exterior/
│   ├── renders/
│   ├── floor-plans/
│   └── logos/
└── og-image.jpg
```

## Многоязычность

- Языки: **LV** (default), **RU**, **EN**
- Astro i18n config в `astro.config.mjs`
- URL: `/dzivokli`, `/ru/dzivokli`, `/en/dzivokli`
- Тексты в `src/data/content/{lv,ru,en}.ts` как объекты с одинаковыми ключами
- Переключатель LV/RU/EN в Header

## Структура данных квартир

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const apartments = defineCollection({
  type: 'data',
  schema: z.object({
    number: z.number(),
    floor: z.number().min(1).max(3),
    rooms: z.number(),
    area_total: z.number(),
    price: z.number().nullable(),
    has_terrace: z.boolean(),
    has_balcony: z.boolean(),
    status: z.enum(['available', 'reserved', 'sold']),
    rooms_breakdown: z.array(z.object({
      name_lv: z.string(),
      name_ru: z.string(),
      name_en: z.string(),
      area: z.number(),
    })),
    floor_plan_image: z.string(),
    render_images: z.array(z.string()),
    description_lv: z.string().optional(),
    description_ru: z.string().optional(),
    description_en: z.string().optional(),
  }),
});

export const collections = { apartments };
```

Полигоны на планах этажей — отдельно в `src/data/floor-plans.json`:
```json
{
  "floors": [
    {
      "floor": 1,
      "image": "/images/floor-plans/floor-1.jpg",
      "image_width": 1920,
      "image_height": 1080,
      "apartments": [
        { "number": 1, "polygon": "120,340 280,340 280,520 120,520" }
      ]
    }
  ]
}
```

## Интерактивный план этажа

Главная фича. Компонент `src/components/apartments/FloorPlan.svelte`.

### Требования

- SVG inline в Svelte, **не картинка с overlay**
- Каждая квартира — `<polygon>` с `fill` по статусу
- Hover на полигоне → подсветка + tooltip (номер, комнаты, площадь, цена)
- Клик на available → `/dzivokli/[number]`
- Клик на reserved/sold → tooltip "недоступно", без редиректа
- Табы 1/2/3 этаж сверху, плавная смена SVG (fade)
- Под планом — таблица всех квартир с фильтрами
- **Двусторонняя синхронизация:** hover на строке таблицы → подсветка на плане
- Фильтры (этаж, комнаты, тераса/балкон, статус) — мгновенные
- Mobile: план скейлится, таблица → карточки

### Скелет компонента

```svelte
<!-- src/components/apartments/FloorPlan.svelte -->
<script lang="ts">
  import type { Apartment, FloorData } from '@/lib/types';
  export let floors: FloorData[];
  export let apartments: Apartment[];
  export let lang: 'lv' | 'ru' | 'en' = 'lv';

  let activeFloor = 1;
  let hoveredApt: number | null = null;

  $: currentFloor = floors.find(f => f.floor === activeFloor)!;
  $: getStatus = (num: number) => apartments.find(a => a.number === num)?.status;

  function handleClick(num: number) {
    const apt = apartments.find(a => a.number === num);
    if (apt?.status === 'available') {
      window.location.href = `${lang === 'lv' ? '' : '/' + lang}/dzivokli/${num}`;
    }
  }
</script>

<div class="space-y-8">
  <div class="flex gap-2">
    {#each floors as f}
      <button
        on:click={() => activeFloor = f.floor}
        class="px-6 py-3 rounded-lg font-medium transition-colors"
        class:bg-burgundy={activeFloor === f.floor}
        class:text-cream={activeFloor === f.floor}
        class:bg-beige={activeFloor !== f.floor}
      >
        {f.floor}. stāvs
      </button>
    {/each}
  </div>

  <div class="relative bg-cream rounded-xl overflow-hidden">
    <svg
      viewBox={`0 0 ${currentFloor.image_width} ${currentFloor.image_height}`}
      class="w-full h-auto"
    >
      <image href={currentFloor.image} width={currentFloor.image_width} height={currentFloor.image_height} />
      {#each currentFloor.apartments as apt (apt.number)}
        {@const status = getStatus(apt.number)}
        <polygon
          points={apt.polygon}
          class="cursor-pointer transition-opacity"
          class:fill-status-available={status === 'available'}
          class:fill-status-reserved={status === 'reserved'}
          class:fill-status-sold={status === 'sold'}
          fill-opacity={hoveredApt === apt.number ? 0.7 : 0.4}
          on:mouseenter={() => hoveredApt = apt.number}
          on:mouseleave={() => hoveredApt = null}
          on:click={() => handleClick(apt.number)}
        />
      {/each}
    </svg>
  </div>
</div>
```

## Форма заявки

Поля: имя*, email*, телефон*, сообщение, ID квартиры (hidden если с детальной).

- Валидация на клиенте (Svelte) + на сервере (API route)
- Honeypot field `website` — заполнен = бот, игнорим
- Rate limit по IP (простая Map в памяти, 5 заявок в час с одного IP)
- Отправка через Resend на `info@almahome.lv` + копия клиенту с подтверждением
- Никаких внешних форм-сервисов

```typescript
// src/pages/api/inquiry.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const rateLimits = new Map<string, number[]>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const data = await request.json();

  if (data.website) return new Response(null, { status: 200 });

  const now = Date.now();
  const recent = (rateLimits.get(clientAddress) || []).filter(t => now - t < 3600_000);
  if (recent.length >= 5) return new Response('Rate limit', { status: 429 });
  rateLimits.set(clientAddress, [...recent, now]);

  const { name, email, phone, message, apartmentNumber } = data;
  if (!name || !email || !phone) return new Response('Missing fields', { status: 400 });

  await resend.emails.send({
    from: import.meta.env.RESEND_FROM_EMAIL,
    to: import.meta.env.INFO_EMAIL,
    subject: `Pieprasījums: ${apartmentNumber ? `Dzīvoklis Nr.${apartmentNumber}` : 'Vispārīgs'}`,
    html: `<h2>Jauns pieprasījums</h2>
           <p><b>Vārds:</b> ${escapeHtml(name)}</p>
           <p><b>E-pasts:</b> ${escapeHtml(email)}</p>
           <p><b>Tālrunis:</b> ${escapeHtml(phone)}</p>
           ${apartmentNumber ? `<p><b>Dzīvoklis:</b> Nr.${apartmentNumber}</p>` : ''}
           <p><b>Ziņojums:</b><br>${escapeHtml(message || '—')}</p>`,
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

function escapeHtml(s: string) {
  return s.replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]!));
}
```

## Админка — детальная архитектура

### Концепция

`/admin` (basic auth) → список квартир со статусами и кнопками смены.
Клик на кнопку → POST `/api/admin/update-status` → коммит в GitHub → ребилд → новый прод через ~1 минуту.

### Auth middleware

```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    const auth = context.request.headers.get('authorization');
    if (!auth || !checkBasicAuth(auth)) {
      return new Response('Authentication required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="AlmaHome Admin"' }
      });
    }
  }
  return next();
});

function checkBasicAuth(authHeader: string): boolean {
  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  try {
    const decoded = atob(encoded);
    const [user, pass] = decoded.split(':');
    return user === import.meta.env.ADMIN_USERNAME &&
           pass === import.meta.env.ADMIN_PASSWORD;
  } catch { return false; }
}
```

### GitHub API клиент

```typescript
// src/lib/github.ts
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: import.meta.env.GITHUB_TOKEN });
const owner = import.meta.env.GITHUB_OWNER;
const repo = import.meta.env.GITHUB_REPO;

export async function updateApartmentStatus(
  aptNumber: number,
  newStatus: 'available' | 'reserved' | 'sold'
): Promise<void> {
  const path = `src/content/apartments/apt-${String(aptNumber).padStart(2, '0')}.json`;

  const { data: file } = await octokit.repos.getContent({ owner, repo, path });
  if (Array.isArray(file) || file.type !== 'file') throw new Error('Not a file');

  const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf-8'));
  content.status = newStatus;

  const newContent = JSON.stringify(content, null, 2);
  const encoded = Buffer.from(newContent, 'utf-8').toString('base64');

  await octokit.repos.createOrUpdateFileContents({
    owner, repo, path,
    message: `admin: apt-${aptNumber} → ${newStatus}`,
    content: encoded,
    sha: file.sha,
    branch: 'main',
  });
}
```

### API роут смены статуса

```typescript
// src/pages/api/admin/update-status.ts
import type { APIRoute } from 'astro';
import { updateApartmentStatus } from '@/lib/github';

export const POST: APIRoute = async ({ request }) => {
  const { aptNumber, newStatus } = await request.json();
  if (!['available', 'reserved', 'sold'].includes(newStatus)) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400 });
  }
  try {
    await updateApartmentStatus(aptNumber, newStatus);
    return new Response(JSON.stringify({
      success: true,
      message: 'Изменение применится через ~1 минуту'
    }), { status: 200 });
  } catch (e) {
    console.error('GitHub API error:', e);
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};
```

### Страница админки

```astro
---
// src/pages/admin/index.astro
import AdminLayout from '@/layouts/AdminLayout.astro';
import { getCollection } from 'astro:content';
const apartments = (await getCollection('apartments')).sort((a, b) => a.data.number - b.data.number);
---
<AdminLayout title="Админка — Квартиры">
  <h1 class="text-3xl font-serif mb-8">Управление статусами квартир</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    {apartments.map(apt => (
      <div class="bg-white rounded-lg p-4 flex items-center justify-between" data-apt={apt.data.number}>
        <div>
          <div class="font-bold">№{apt.data.number} · {apt.data.floor}. stāvs · {apt.data.rooms} ist.</div>
          <div class="text-sm text-ink-muted">{apt.data.area_total} m² · {apt.data.price ? apt.data.price + ' €' : 'pēc pieprasījuma'}</div>
          <div class="text-xs mt-1" id={`status-${apt.data.number}`}>Статус: {apt.data.status}</div>
        </div>
        <div class="flex gap-2">
          <button class="status-btn" data-status="available" data-apt={apt.data.number}>🟢</button>
          <button class="status-btn" data-status="reserved" data-apt={apt.data.number}>🟡</button>
          <button class="status-btn" data-status="sold" data-apt={apt.data.number}>⚪</button>
        </div>
      </div>
    ))}
  </div>
  <script>
    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const aptNumber = parseInt(target.dataset.apt!);
        const newStatus = target.dataset.status!;
        target.disabled = true;
        const res = await fetch('/api/admin/update-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aptNumber, newStatus }),
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message);
          document.getElementById(`status-${aptNumber}`)!.textContent = `Статус: ${newStatus} (применится через ~1 мин)`;
        } else {
          alert('Ошибка: ' + data.error);
        }
        target.disabled = false;
      });
    });
  </script>
</AdminLayout>
```

### Переменные окружения (Vercel)

```
ADMIN_USERNAME=alma_admin
ADMIN_PASSWORD=<сильный пароль>
GITHUB_TOKEN=<personal access token со скоупом repo>
GITHUB_OWNER=<github username>
GITHUB_REPO=almahome
RESEND_API_KEY=<resend key>
RESEND_FROM_EMAIL=noreply@almahome.lv
INFO_EMAIL=info@almahome.lv
```

## SEO

- Meta-теги через BaseLayout (title, description, og:*, twitter:*)
- `@astrojs/sitemap` интеграция
- `public/robots.txt` с `Disallow: /admin`
- Schema.org `Apartment` микроразметка на детальной странице квартиры
- Lighthouse target: 95+ всё
- `hreflang` теги для языковых версий, canonical URLs

## Производительность

- Astro `<Image>` компонент → автоматом WebP/AVIF + lazy load
- Шрифты `@fontsource/*` с `display=swap`, только нужные веса (400, 500, 600)
- Никакого clientside JS на главной кроме мобильного меню
- Tailwind purge включён (по умолчанию)

## Конвенции кода

- Компоненты: `PascalCase.{astro,svelte}`
- Страницы: `kebab-case.astro`
- Утилиты: `camelCase.ts` в `src/lib/`
- Без `default exports` для компонентов (кроме страниц Astro)
- Типы для всего публичного API
- Импорты с `@/` алиасом (через `tsconfig.json` paths)
- Комментарии — только **зачем**, не **что**

## Деплой

### Первичная настройка (один раз)

1. GitHub: создать приватный repo `almahome`
2. `git init && git remote add origin <url> && git push -u origin main`
3. Vercel: Add New Project → импортировать GitHub repo → Deploy
4. Vercel → Settings → Environment Variables → добавить все из секции выше
5. Vercel → Settings → Domains → добавить `almahome.lv`
6. У регистратора (где куплен домен) прописать DNS-записи которые показывает Vercel
7. Vercel автоматически выпустит SSL
8. Готово, дальше каждый push в `main` = автодеплой за 30-60 сек

### Daily workflow

```bash
git checkout -b feat/something
# работаешь
git push origin feat/something
# Vercel создаёт preview deploy на отдельном URL — проверяешь
git checkout main && git merge feat/something && git push
# автодеплой на прод
```

### `vercel.json`

```json
{
  "framework": "astro",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/admin/:path*",
      "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }]
    }
  ]
}
```

## Что Arturs делает руками (один раз перед стартом разработки)

1. Запускает `scripts/scrape-almahome.sh` → выгребает картинки со старого сайта
2. Сортирует картинки в `public/images/{exterior,renders,floor-plans,logos}/`
3. Размечает планы этажей через `scripts/polygon-helper.html` → получает JSON координат
4. Создаёт GitHub repo, аккаунты на Vercel и Resend, получает GitHub PAT
5. Прописывает env переменные на Vercel

## Что Claude Code делает

Всё остальное — код, компоненты, стили, интеграции, тексты-заглушки, тесты при необходимости.

## Этапы (см. `PROMPTS.md` для готовых промптов под каждый этап)

1. Инициализация Astro + интеграции
2. Layout, шрифты, палитра, базовые UI компоненты
3. Контент-коллекция квартир + JSON всех 24 квартир (заглушки)
4. Главная страница (статика)
5. Статичные страницы /par-namu, /par-projektu, /atteli, /kontakti
6. Страница /dzivokli — интерактивный план + таблица + фильтры
7. Детальная страница квартиры
8. Форма заявки + API + Resend
9. Админка + middleware + GitHub API
10. i18n (LV/RU/EN)
11. SEO, sitemap, OG
12. Деплой
