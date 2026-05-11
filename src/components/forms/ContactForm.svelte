<script lang="ts">
  import { useTranslations, type Locale } from '@/i18n/utils';

  interface AvailableSpot {
    number: number;
    type: 'surface' | 'surface_ev_ready';
  }

  interface Props {
    apartmentNumber?: number;
    parkingSpot?: number;
    /** When provided, renders an optional parking-spot picker between message
        and submit. Pass only the spots that are currently available. */
    availableSpots?: AvailableSpot[];
    submitLabel?: string;
    lang?: Locale;
  }
  let {
    apartmentNumber,
    parkingSpot = $bindable(),
    availableSpots = [],
    submitLabel,
    lang = 'lv',
  }: Props = $props();

  // Local state so the <select> stays in sync without forcing parent re-render.
  // Bridged to the hidden input via `selectedSpot`.
  let selectedSpot = $state<string>(parkingSpot ? String(parkingSpot) : '');

  const t = useTranslations(lang);

  type Status = 'idle' | 'submitting' | 'success' | 'error';
  let status = $state<Status>('idle');
  let errorMsg = $state('');
  let formEl: HTMLFormElement | undefined = $state();

  const buttonText = $derived(
    submitLabel ??
      (apartmentNumber
        ? `${t('form.submit_apt')} ${apartmentNumber}`
        : parkingSpot
          ? `${t('parkings.form_submit_spot')}${parkingSpot}`
          : t('form.submit')),
  );

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    status = 'submitting';
    errorMsg = '';

    const fd = new FormData(e.currentTarget as HTMLFormElement);
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        errorMsg = data?.error || t('form.error_generic');
        status = 'error';
        return;
      }
      status = 'success';
    } catch {
      errorMsg = t('form.error_network');
      status = 'error';
    }
  }

  function reset() {
    errorMsg = '';
    status = 'idle';
  }
</script>

{#if status === 'success'}
  <div class="rounded-xl border border-status-available/30 bg-status-available/10 p-6 md:p-8 text-center">
    <div class="mx-auto h-12 w-12 rounded-full bg-status-available/20 grid place-items-center mb-4">
      <svg class="h-6 w-6 text-status-available" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
        <path d="M5 12.5l5 5 9-11" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <h3 class="font-serif text-2xl text-burgundy">{t('form.success_title')}</h3>
    <p class="mt-3 text-ink leading-relaxed">
      {t('form.success_body')}
    </p>
  </div>
{:else}
  <form bind:this={formEl} onsubmit={onSubmit} novalidate class="space-y-5">
    <input type="hidden" name="apartmentNumber" value={apartmentNumber ?? ''} />
    <input type="hidden" name="parkingSpot" value={selectedSpot || (parkingSpot ?? '')} />
    <!-- Honeypot — visible to bots, hidden from humans. -->
    <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
      <label>Website
        <input type="text" name="website" tabindex="-1" autocomplete="off" />
      </label>
    </div>

    <div class="grid md:grid-cols-2 gap-x-5 gap-y-5">
      <div class="field">
        <label for="cf-name">{t('form.name')} <span class="text-burgundy">*</span></label>
        <input id="cf-name" name="name" type="text" required maxlength="100" autocomplete="name" />
      </div>
      <div class="field">
        <label for="cf-phone">{t('form.phone')} <span class="text-burgundy">*</span></label>
        <input id="cf-phone" name="phone" type="tel" required maxlength="20" autocomplete="tel" placeholder={t('form.phone_placeholder')} />
      </div>
    </div>

    <div class="field">
      <label for="cf-email">{t('form.email')} <span class="text-burgundy">*</span></label>
      <input id="cf-email" name="email" type="email" required maxlength="254" autocomplete="email" />
    </div>

    <div class="field">
      <label for="cf-message">{t('form.message')}</label>
      <textarea
        id="cf-message"
        name="message"
        rows="4"
        maxlength="2000"
        placeholder={t('form.message_placeholder')}
      ></textarea>
    </div>

    {#if availableSpots.length > 0}
      <div class="field">
        <label for="cf-parking-spot">{t('form.parking_label')}</label>
        <select id="cf-parking-spot" bind:value={selectedSpot} class="cf-select">
          <option value="">{t('form.parking_none')}</option>
          {#if availableSpots.some((s) => s.type === 'surface')}
            <optgroup label={t('form.parking_group_surface')}>
              {#each availableSpots.filter((s) => s.type === 'surface') as s (s.number)}
                <option value={String(s.number)}>Nr. {s.number}</option>
              {/each}
            </optgroup>
          {/if}
          {#if availableSpots.some((s) => s.type === 'surface_ev_ready')}
            <optgroup label={t('form.parking_group_ev')}>
              {#each availableSpots.filter((s) => s.type === 'surface_ev_ready') as s (s.number)}
                <option value={String(s.number)}>Nr. {s.number}</option>
              {/each}
            </optgroup>
          {/if}
        </select>
      </div>
    {/if}

    {#if status === 'error'}
      <div class="rounded-lg bg-burgundy/8 border border-burgundy/20 px-4 py-3 text-sm text-burgundy flex items-start gap-3">
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" stroke-linecap="round" />
        </svg>
        <div class="flex-1">
          <p>{errorMsg}</p>
          <button type="button" onclick={reset} class="mt-1 text-burgundy underline underline-offset-2 hover:no-underline">
            {t('form.retry')}
          </button>
        </div>
      </div>
    {/if}

    <p class="text-xs text-ink-muted">
      {t('form.consent')}
    </p>

    <button
      type="submit"
      disabled={status === 'submitting'}
      class="w-full inline-flex items-center justify-center rounded-lg bg-burgundy text-cream px-8 py-4 text-base font-medium transition-colors hover:bg-burgundy-dark disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {#if status === 'submitting'}
        <svg class="h-5 w-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true">
          <circle cx="12" cy="12" r="9" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke-linecap="round" />
        </svg>
        {t('form.submitting')}
      {:else}
        {buttonText}
      {/if}
    </button>
  </form>
{/if}

<style>
  @reference "@/styles/globals.css";
  .field { @apply flex flex-col gap-2; }
  .field label { @apply text-sm font-medium text-ink; }
  .field input,
  .field textarea {
    @apply w-full bg-transparent border-0 border-b border-ink-muted/30 px-0 py-3 text-base text-ink
           placeholder-ink-muted/50 transition-colors duration-150
           focus:outline-none focus:border-burgundy focus:border-b-2;
    min-height: 44px; /* mobile touch target */
  }
  .field textarea { @apply resize-y min-h-[100px]; }
  .field .cf-select {
    @apply w-full bg-transparent border-0 border-b border-ink-muted/30 px-0 py-3 text-base text-ink
           transition-colors duration-150
           focus:outline-none focus:border-burgundy focus:border-b-2;
    min-height: 44px;
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B5D52' stroke-width='2'><path d='M6 9l6 6 6-6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    background-repeat: no-repeat;
    background-position: right 0.25rem center;
    background-size: 1.1rem;
    padding-right: 1.75rem;
  }
</style>
