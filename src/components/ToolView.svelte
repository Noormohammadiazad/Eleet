<!--
  Resolves the routed tool and mounts the right view for its kind. Also
  applies a share payload from the URL once, then removes it from the address
  bar so later edits are not confused with the shared state.
-->
<script lang="ts">
  import { getTool } from '$engine/registry';
  import { router } from '$lib/state/router.svelte';
  import { pipeline } from '$lib/state/pipeline.svelte';
  import { sessionFor, type SessionTool } from '$lib/state/session.svelte';
  import PipelineView from '$components/views/PipelineView.svelte';
  import AnalyzerView from '$components/workbench/AnalyzerView.svelte';
  import Workbench from '$components/workbench/Workbench.svelte';
  import Dossier from '$components/dossier/Dossier.svelte';
  import { hasDossier } from '$lib/content/dossiers';

  let { toolId }: { toolId: string } = $props();

  const tool = $derived(getTool(toolId)!);
  const session = $derived(tool.kind === 'workspace' ? null : sessionFor(tool as SessionTool));

  $effect(() => {
    const payload = router.share;
    if (!payload) return;
    const apply = session ? session.applyShare(payload) : pipeline.applyShare(payload);
    void apply.finally(() => router.consumeShare());
  });
</script>

<div class="view" data-tool={tool.id}>
  {#if session && tool.kind === 'transform'}
    <Workbench {session} />
  {:else if session}
    <AnalyzerView {session} />
  {:else}
    <PipelineView />
  {/if}
  {#if hasDossier(tool.id)}
    <Dossier toolId={tool.id} {session} />
  {/if}
</div>

<style>
  .view {
    max-inline-size: var(--content-max);
    margin-inline: auto;
    animation: enter var(--normal) var(--ease);
  }

  /* Opacity only: a translate here would briefly grow the document and nudge the scroll position. */
  @keyframes enter {
    from {
      opacity: 0;
    }
  }
</style>
