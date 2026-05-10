<script lang="ts">
  interface Props {
    apartmentNumber?: number;
    submitLabel?: string;
  }
  let { apartmentNumber, submitLabel }: Props = $props();

  type Status = 'idle' | 'submitting' | 'success' | 'error';
  let status = $state<Status>('idle');
  let errorMsg = $state('');
  let formEl: HTMLFormElement | undefined = $state();

  const buttonText = $derived(
    submitLabel ??
      (apartmentNumber ? `Nosūtīt pieteikumu par Nr. ${apartmentNumber}` : 'Nosūtīt pieteikumu'),
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
        errorMsg = data?.error || 'Nezināma kļūda. Lūdzu mēģiniet vēlreiz.';
        status = 'error';
        return;
      }
      status = 'success';
    } catch {
      errorMsg = 'Tīkla kļūda. Pārbaudiet savienojumu un mēģiniet vēlreiz.';
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
    <h3 class="font-serif text-2xl text-burgundy">Paldies!</h3>
    <p class="mt-3 text-ink leading-relaxed">
      Mēs sazināsimies ar jums tuvāko 24 stundu laikā darba dienās.
    </p>
  </div>
{:else}
  <form bind:this={formEl} onsubmit={onSubmit} novalidate class="space-y-5">
    <input type="hidden" name="apartmentNumber" value={apartmentNumber ?? ''} />
    <!-- Honeypot — visible to bots, hidden from humans. -->
    <div aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
      <label>Website
        <input type="text" name="website" tabindex="-1" autocomplete="off" />
      </label>
    </div>

    <div class="grid md:grid-cols-2 gap-x-5 gap-y-5">
      <div class="field">
        <label for="cf-name">Vārds, uzvārds <span class="text-burgundy">*</span></label>
        <input id="cf-name" name="name" type="text" required maxlength="100" autocomplete="name" />
      </div>
      <div class="field">
        <label for="cf-phone">Tālrunis <span class="text-burgundy">*</span></label>
        <input id="cf-phone" name="phone" type="tel" required maxlength="20" autocomplete="tel" placeholder="+371 ..." />
      </div>
    </div>

    <div class="field">
      <label for="cf-email">E-pasts <span class="text-burgundy">*</span></label>
      <input id="cf-email" name="email" type="email" required maxlength="254" autocomplete="email" />
    </div>

    <div class="field">
      <label for="cf-message">Ziņojums</label>
      <textarea
        id="cf-message"
        name="message"
        rows="4"
        maxlength="2000"
        placeholder="Jautājumi vai komentāri"
      ></textarea>
    </div>

    {#if status === 'error'}
      <div class="rounded-lg bg-burgundy/8 border border-burgundy/20 px-4 py-3 text-sm text-burgundy flex items-start gap-3">
        <svg class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" stroke-linecap="round" />
        </svg>
        <div class="flex-1">
          <p>{errorMsg}</p>
          <button type="button" onclick={reset} class="mt-1 text-burgundy underline underline-offset-2 hover:no-underline">
            Mēģināt vēlreiz
          </button>
        </div>
      </div>
    {/if}

    <p class="text-xs text-ink-muted">
      Nospiežot pogu, jūs piekrītat, ka jūsu kontaktinformācija tiks izmantota tikai šī pieteikuma apstrādei.
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
        Sūta…
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
    @apply w-full bg-transparent border-0 border-b border-ink-muted/30 px-0 py-2.5 text-ink
           placeholder-ink-muted/50 transition-colors duration-150
           focus:outline-none focus:border-burgundy focus:border-b-2;
  }
  .field textarea { @apply resize-y min-h-[100px]; }
</style>
