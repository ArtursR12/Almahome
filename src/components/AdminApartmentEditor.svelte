<script lang="ts">
  type Status = 'available' | 'reserved' | 'sold';
  interface Apartment {
    number: number;
    floor: number;
    rooms: number;
    area_total: number;
    status: Status;
    price: number | null;
  }
  interface Props { apartment: Apartment }
  let { apartment }: Props = $props();

  let open       = $state(false);
  let status     = $state<Status>(apartment.status);
  let priceInput = $state(apartment.price === null ? '' : String(apartment.price));
  let saving     = $state(false);
  let success    = $state(false);
  let errorMsg   = $state('');

  const dirty = $derived(
    status !== apartment.status ||
      (priceInput.trim() === '' ? apartment.price !== null : Number(priceInput) !== apartment.price),
  );

  function openEditor() {
    status = apartment.status;
    priceInput = apartment.price === null ? '' : String(apartment.price);
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

    const trimmed = priceInput.trim();
    let price: number | null;
    if (trimmed === '') {
      price = null;
    } else {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n <= 0) {
        errorMsg = 'Cena ir nederīga';
        return;
      }
      price = Math.round(n);
    }

    saving = true;
    try {
      const res = await fetch('/api/admin/update-apartment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: apartment.number, status, price }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorMsg = data?.error || `Kļūda (HTTP ${res.status})`;
        return;
      }
      // Locally reflect the change so the row matches the new state.
      apartment.status = status;
      apartment.price = price;
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
            <input
              id="apt-price"
              type="number"
              min="0"
              step="100"
              placeholder="Atstāj tukšu — Pēc pieprasījuma"
              bind:value={priceInput}
              disabled={saving}
              class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50"
            />
            <p class="text-xs text-zinc-500">Tukšs lauks → "Pēc pieprasījuma".</p>
          </div>

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
