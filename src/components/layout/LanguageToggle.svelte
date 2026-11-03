<!-- Switches between English (LTR) and Persian (RTL). The label is always written in the *target* language. -->
<script lang="ts">
  import Languages from '@lucide/svelte/icons/languages';
  import { t } from '$lib/i18n/index.svelte';
  import { prefs } from '$lib/state/prefs.svelte';
</script>

<button
  class="btn btn-ghost toggle"
  onclick={() => prefs.toggleLocale()}
  aria-label={t('app.switchLanguageLabel')}
  title={t('app.switchLanguageLabel')}
  lang={prefs.locale === 'en' ? 'fa' : 'en'}
>
  <Languages aria-hidden="true" />
  <span>{t('app.switchLanguage')}</span>
</button>

<style>
  .toggle span {
    font-family: 'Vazirmatn Variable', 'Inter Variable', sans-serif;
  }

  .toggle:lang(en) span {
    font-family: 'Inter Variable', sans-serif;
  }

  @media (max-width: 480px) {
    .toggle span {
      display: none;
    }
  }
</style>
