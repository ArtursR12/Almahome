<script lang="ts">
  type Status = 'available' | 'reserved' | 'sold';
  type ParkingType = 'surface' | 'surface_ev_ready';

  interface Spot {
    number: number;
    type: ParkingType;
    status: Status;
    price: number | null;
    buyer_name?: string;
    buyer_contact?: string;
    buyer_notes?: string;
    linked_apartment?: number | null;
  }
  interface Props {
    spot: Spot;
    /** All apartment numbers — used to populate the "linked apartment" dropdown. */
    apartmentNumbers?: number[];
  }
  let { spot, apartmentNumbers = [] }: Props = $props();

  let open            = $state(false);
  let status          = $state<Status>(spot.status);
  let priceInput      = $state(spot.price === null ? '' : String(spot.price));
  let buyerName       = $state(spot.buyer_name ?? '');
  let buyerContact    = $state(spot.buyer_contact ?? '');
  let buyerNotes      = $state(spot.buyer_notes ?? '');
  let linkedApartment = $state<string>(spot.linked_apartment ? String(spot.linked_apartment) : '');
  let saving          = $state(false);
  let success         = $state(false);
  let errorMsg        = $state('');

  function parsePriceInput(raw: unknown): number | null {
    const cleaned = String(raw ?? '').replace(/[^\d]/g, '');
    if (cleaned === '') return null;
    const n = Number(cleaned);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  const dirty = $derived(
    status !== spot.status ||
      parsePriceInput(priceInput) !== spot.price ||
      (buyerName.trim() || '') !== (spot.buyer_name ?? '') ||
      (buyerContact.trim() || '') !== (spot.buyer_contact ?? '') ||
      (buyerNotes.trim() || '') !== (spot.buyer_notes ?? '') ||
      (linkedApartment ? parseInt(linkedApartment, 10) : null) !==
        (spot.linked_apartment ?? null),
  );

  function openEditor() {
    status = spot.status;
    priceInput = spot.price === null ? '' : String(spot.price);
    buyerName = spot.buyer_name ?? '';
    buyerContact = spot.buyer_contact ?? '';
    buyerNotes = spot.buyer_notes ?? '';
    linkedApartment = spot.linked_apartment ? String(spot.linked_apartment) : '';
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

    let price = parsePriceInput(priceInput);
    if (price === null && String(priceInput ?? '').replace(/[^\d]/g, '') !== '') {
      errorMsg = 'Cena ir nederīga';
      return;
    }

    const linked = linkedApartment ? parseInt(linkedApartment, 10) : null;

    saving = true;
    try {
      const res = await fetch('/api/admin/update-parking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: spot.number,
          status,
          price,
          buyer_name:       buyerName.trim() || null,
          buyer_contact:    buyerContact.trim() || null,
          buyer_notes:      buyerNotes.trim() || null,
          linked_apartment: Number.isFinite(linked) ? linked : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorMsg = data?.error || `Kļūda (HTTP ${res.status})`;
        return;
      }
      spot.status = status;
      spot.price = price;
      spot.buyer_name = buyerName.trim() || undefined;
      spot.buyer_contact = buyerContact.trim() || undefined;
      spot.buyer_notes = buyerNotes.trim() || undefined;
      spot.linked_apartment = Number.isFinite(linked) ? linked : null;
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

  const typeLabel: Record<ParkingType, string> = {
    surface:          'Virszemes',
    surface_ev_ready: 'Virszemes · EV',
  };

  const formattedPrice = $derived(
    spot.price === null
      ? 'Pēc pieprasījuma'
      : spot.price.toLocaleString('lv-LV') + ' €',
  );
</script>

<div class="flex items-center gap-3">
  <span
    class:bg-emerald-500={spot.status === 'available'}
    class:bg-amber-500={spot.status === 'reserved'}
    class:bg-zinc-500={spot.status === 'sold'}
    class="inline-block h-2 w-2 rounded-full"
  ></span>
  <span class="text-sm text-zinc-300">{statusLabel[spot.status]}</span>
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
    aria-label={`Rediģēt autostāvvietu Nr.${spot.number}`}
  >
    <div class="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-100">
      <div class="flex items-baseline justify-between gap-3">
        <h3 class="font-serif text-2xl">Autostāvvieta Nr. {spot.number}</h3>
        <span class="text-xs uppercase tracking-widest text-zinc-500">
          {typeLabel[spot.type]}
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
            <label for="spot-price" class="block text-xs uppercase tracking-widest text-zinc-500">
              Cena (€)
            </label>
            <input
              id="spot-price"
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

          <fieldset class="space-y-3 rounded-md bg-zinc-950/40 border border-zinc-800 p-4">
            <legend class="text-xs uppercase tracking-widest text-zinc-500 px-2">
              Pircējs{status === 'sold' ? ' (pārdots)' : status === 'reserved' ? ' (rezervēts)' : ''}
            </legend>
            {#if status === 'available'}
              <p class="text-xs text-zinc-500 -mt-1">Pieejamām vietām šie lauki nav obligāti.</p>
            {/if}
              <div class="space-y-1.5">
                <label for="spot-buyer-name" class="block text-xs text-zinc-500">Vārds, uzvārds</label>
                <input
                  id="spot-buyer-name"
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
                <label for="spot-buyer-contact" class="block text-xs text-zinc-500">Kontakti</label>
                <input
                  id="spot-buyer-contact"
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
                <label for="spot-linked-apt" class="block text-xs text-zinc-500">Saistīts dzīvoklis</label>
                <select
                  id="spot-linked-apt"
                  bind:value={linkedApartment}
                  disabled={saving}
                  class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-burgundy disabled:opacity-50"
                >
                  <option value="">— bez saites —</option>
                  {#each apartmentNumbers as n}
                    <option value={String(n)}>Nr. {n}</option>
                  {/each}
                </select>
              </div>
              <div class="space-y-1.5">
                <label for="spot-buyer-notes" class="block text-xs text-zinc-500">Piezīmes</label>
                <textarea
                  id="spot-buyer-notes"
                  rows="2"
                  maxlength="2000"
                  bind:value={buyerNotes}
                  disabled={saving}
                  placeholder="Avansa datums, kredītbanka, citas atzīmes…"
                  class="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-burgundy disabled:opacity-50 resize-y"
                ></textarea>
              </div>
          </fieldset>

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
