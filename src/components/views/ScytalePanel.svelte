<!-- The live scytale under the workbench: winds whatever is being encoded (or decoded). -->
<script lang="ts">
  import type { ToolSession } from '$lib/state/session.svelte';
  import { t } from '$lib/i18n/index.svelte';
  import ScytaleRod from '$components/dossier/diagrams/ScytaleRod.svelte';

  let { session }: { session: ToolSession } = $props();
  const plain = $derived(session.direction === 'encode' ? session.input : session.output);
  const diameter = $derived(Number(session.options.diameter) || 4);
</script>

<section class="panel" aria-label={t('views.scytale.title')}>
  <header class="panel-header">
    <h3 class="panel-title">{t('views.scytale.title')}</h3>
  </header>
  <div class="panel-body">
    <ScytaleRod text={plain} {diameter} />
  </div>
</section>
