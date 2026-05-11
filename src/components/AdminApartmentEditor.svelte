<script lang="ts">
  type Status = 'available' | 'reserved' | 'sold';
  interface Apartment {
    number: number;
    floor: number;
    rooms: number;
    area_total: number;
    status: Status;
    price: number | null;
    buyer_name?: string;
    buyer_contact?: string;
    buyer_notes?: string;
  }
  interface Props { apartment: Apartment }
  let { apartment }: Props = $props();

  let open         = $state(false);
  let status       = $state<Status>(apartment.status);
  let priceInput   = $state(apartment.price === null ? '' : String(apartment.price));
  let buyerName    = $state(apartment.buyer_name ?? '');
  let buyerContact = $state(apartment.buyer_contact ?? '');
  let buyerNotes   = $state(apartment.buyer_notes ?? '');
  let saving       = $state(false);
  let success      = $state(false);
  let errorMsg     = $state('');

  function parsePriceInput(raw: unknown): number | null {
    const cleaned = String(raw ?? '').replace(/[^\d]/g, '');
    if (cleaned === '') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  const dirty = $derived(
    status !== apartment.status ||
      parsePriceInput(priceInput) !== apartment.price ||
      (buyerName.trim() || '') !== (apartment.buyer_name ?? '') ||
      (buyerContact.trim() || '') !== (apartment.buyer_contact ?? '') ||
      (buyerNotes.trim() || '') !== (apartment.buyer_notes ?? ''),
  );

  function openEditor() {
    status = apartment.status;
    priceInput = apartment.price === null ? '' : String(apartment.price);
    buyerName = apartment.buyer_name ?? '';
    buyerContact = apartment.buyer_contact ?? '';
    buyerNotes = apartment.buyer_notes ?? '';
    success = false;
    errorMsg = '';
    open = true;
  }

  function cancel() {
    if (saving) return;
    open = false;
    success = false;
    errorMsg = '';
  }

  async function save() {
    if (saving || !dirty) return;
    errorMsg = '';
    success = false;

    // Be lenient about formatting: "76200", "76 200", "€76,200" all → 76200.
    let price = parsePriceInput(priceInput);
    if (price === null && String(priceInput ?? '').replace(/[^\d]/g, '') !== '') {
      errorMsg = 'Cena ir nederīga';
      return;
    }

    saving = true;
    try {
      const res = await fetch('/api/admin/update-apartment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: apartment.number,
          status,
          price,
          buyer_name:    buyerName.trim() || null,
          buyer_contact: buyerContact.trim() || null,
          buyer_notes:   buyerNotes.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorMsg = data?.error || `Kļūda (HTTP ${res.status})`;
        return;
      }
      // Locally reflect the change so the row matches the new state.
      apartment.status = status;
      apartment.price = price;
      apartment.buyer_name = buyerName.trim() || undefined;
      apartment.buyer_contact = buyerContact.trim() || undefined;
      apartment.buyer_notes = buyerNotes.trim() || undefined;
      success = true;
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Tīkla kļūda';
    } finally {
      saving = false;
    }
  }

  const statusLabel: Record<Status, string> = {
    available: 'Pieejams',
    reserved:  'Rezervēts',
    sold:      'Pārdots',
  };

  const formattedPrice = $derived(
    apartment.price === null
      ? 'Pēc pieprasījuma'
      : apartment.price.toLocaleString('lv-LV') + ' €',
  );
</script>

<div class="flex items-center gap-3">
  <span
    class:bg-emerald-500={apartment.status === 'available'}
    class:bg-amber-500={apartment.status === 'reserved'}
    class:bg-zinc-500={apartment.status === 'sold'}
    class="inline-block h-2 w-2 rounded-full"
  ></span>
  <span class="text-sm text-zinc-300">{statusLabel[apartment.status]}</span>
  <span class="text-sm text-zinc-400 tabular-nums">· {formattedPrice}</span>
  <button
    type="button"
    onclick={openEditor}
    class="ml-auto rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs px-3 py-1.5 transition-colors"
  >
    Rediģēt
  </button>
</div>

{#if open}
  <div
    class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
    role="dialog"
    aria-modal="true"
    aria-label={`Rediģēt dzīvokli Nr.${apartment.number}`}
  >
    <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-100">
      <div class="flex items-baseline justify-between">
        <h3 class="font-serif text-2xl">Dzīvoklis Nr. {apartment.number}</h3>
        <span class="text-xs uppercase tracking-widest text-zinc-500">
          {apartment.floor}. stāvs · {apartment.rooms} ist. · {apartment.area_total} m²
        </span>
      </div>

      {#if success}
        <div class="mt-6 rounded-lg border border-emerald-700/50 bg-emerald-700/10 p-4 text-sm">
          <p class="text-emerald-300 font-medium">Saglabāts!</p>
          <p class="mt-1 text-zinc-300">
            Izmaiņas redzamas pēc ~30 sekundēm (Vercel deploy).
          </p>
          <button
            type="button"
            onclick={cancel}
            class="mt-4 rounded-md bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm"
          >
            Aizvērt
          </button>
        </div>
      {:else}
        <form
          onsubmit={(e) => { e.preventDefault(); save(); }}
          class="mt-6 space-y-5"
        >
          <fieldset class="space-y-2">
            <legend class="text-xs uppercase tracking-widest text-zinc-500 mb-1">Statuss</legend>
            {#each (['available', 'reserved', 'sold'] as Status[]) as opt}
              <label class="flex items-center gap-3 cursor-pointer rounded-md px-3 py-2 hover:bg-zinc-800/60">
                <input
                  type="radio"
                  name="status"
                  value={opt}
                  bind:group={status}
                  disabled={saving}
                  class="accent-burgundy"
                />
                <span class:bg-emerald-500={opt === 'available'} class:bg-amber-500={opt === 'reserved'} class:bg-zinc-500={opt === 'sold'} class="inline-block h-2 w-2 rounded-full"></span>
                <span class="text-sm">{statusLabel[opt]}</span>
              </label>
            {/each}
          </fieldset>

          <div class="space-y-2">
            <label for="apt-price" class="block text-xs uppercase tracking-widest text-zinc-500">
              Cena (€)
            </label>
            <!-- type="text" + inputmode="numeric" so bind:value stays a string.
                 Svelte 5's bind:value on type="number" coerces to number, which
                 broke the priceInput.trim() calls in the dirty/save logic. -->
            <input
              id="apt-price"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="Atstāj tukšu — Pēc pieprasījuma"
              bind:value={priceInput}
              disabled={saving}
              class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50 tabular-nums"
            />
            <p class="text-xs text-zinc-500">Tukšs lauks → "Pēc pieprasījuma".</p>
          </div>

          {#if status !== 'available'}
            <fieldset class="space-y-3 rounded-md bg-zinc-950/40 border border-zinc-800 p-4">
              <legend class="text-xs uppercase tracking-widest text-zinc-500 px-2">
                Pircējs ({status === 'sold' ? 'pārdots' : 'rezervēts'})
              </legend>
              <div class="space-y-1.5">
                <label for="apt-buyer-name" class="block text-xs text-zinc-500">Vārds, uzvārds</label>
                <input
                  id="apt-buyer-name"
                  type="text"
                  autocomplete="off"
                  maxlength="200"
                  bind:value={buyerName}
                  disabled={saving}
                  placeholder="Jānis Bērziņš"
                  class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50"
                />
              </div>
              <div class="space-y-1.5">
                <label for="apt-buyer-contact" class="block text-xs text-zinc-500">Kontakti (tālr. / e-pasts)</label>
                <input
                  id="apt-buyer-contact"
                  type="text"
                  autocomplete="off"
                  maxlength="200"
                  bind:value={buyerContact}
                  disabled={saving}
                  placeholder="+371 ... / vards@example.com"
                  class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50"
                />
              </div>
              <div class="space-y-1.5">
                <label for="apt-buyer-notes" class="block text-xs text-zinc-500">Piezīmes</label>
                <textarea
                  id="apt-buyer-notes"
                  rows="2"
                  maxlength="2000"
                  bind:value={buyerNotes}
                  disabled={saving}
                  placeholder="Avansa datums, kredītbanka, citas atzīmes…"
                  class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50 resize-y"
                ></textarea>
              </div>
            </fieldset>
          {/if}

          {#if errorMsg}
            <div class="rounded-lg border border-red-700/50 bg-red-700/10 p-3 text-sm text-red-300">
              {errorMsg}
            </div>
          {/if}

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onclick={cancel}
              disabled={saving}
              class="rounded-md bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
            >
              Atcelt
            </button>
            <button
              type="submit"
              disabled={saving || !dirty}
              class="rounded-md bg-burgundy hover:bg-burgundy-dark text-cream px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saglabā…' : 'Saglabāt'}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </div>
{/if}
