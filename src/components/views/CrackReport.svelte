<!-- Ranked cracking candidates, each with the recovered key and a one-click "open in tool". -->
<script lang="ts">
  import ExternalLink from '@lucide/svelte/icons/external-link';
  import type { CrackReport } from '$engine/analysis/crack';
  import { sanitizeOptions } from '$engine/core/options';
  import { getTransform } from '$engine/registry';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { toolName } from '$lib/i18n/tools';
  import { router } from '$lib/state/router.svelte';
  import { sessionFor, type ToolSession } from '$lib/state/session.svelte';

  let { report, session }: { report: CrackReport; session: ToolSession } = $props();

  function open(candidate: CrackReport['candidates'][number]) {
    const tool = getTransform(candidate.tool);
    if (!tool) return;
    const target = sessionFor(tool);
    target.options = sanitizeOptions(tool.options, {
      ...$state.snapshot(target.options),
      ...candidate.options,
    });
    target.input = session.input;
    target.setDirection('decode');
    router.go(tool.id);
  }

  const percent = (score: number) => i18n.number(Math.round(score * 100));
</script>

<section class="results">
  <p class="muted meta">{t('views.analysis.tried', { n: report.tried })}</p>
  {#if !report.candidates.length}
    <p class="panel empty">{t('views.analysis.noCandidates')}</p>
  {:else}
    <ol class="list" role="list">
      {#each report.candidates as c, i (i)}
        <li class="panel row" class:top={i === 0}>
          <div class="head">
            <span class="chip" class:chip-accent={i === 0}
              >{i18n.tr(`tools.crack.choices.cipher.${c.cipher}`)}</span
            >
            <span class="key"
              ><span class="muted">{t('views.analysis.key')}</span>
              <code dir="ltr">{c.key}</code></span
            >
            <span class="score" title={t('views.analysis.score')}>
              <span class="meter"
                ><span style:inline-size="{Math.max(3, c.score * 100)}%"></span></span
              >
              <span class="mono">{percent(c.score)}%</span>
            </span>
            <button class="btn btn-sm" onclick={() => open(c)}>
              <ExternalLink aria-hidden="true" />{t('views.analysis.open', {
                tool: toolName(c.tool),
              })}
            </button>
          </div>
          <p class="plain mono" dir="auto">{c.plaintext.slice(0, 600)}</p>
        </li>
      {/each}
    </ol>
  {/if}
</section>

<style>
  .results {
    display: grid;
    gap: var(--space-3);
  }

  .meta {
    font-size: var(--text-xs);
  }

  .empty {
    padding: var(--space-5);
    text-align: center;
    color: var(--text-3);
  }

  .list {
    display: grid;
    gap: var(--space-2);
  }

  .row {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
  }

  .row.top {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--border));
    box-shadow:
      var(--shadow-1),
      0 0 0 3px var(--accent-soft);
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .key {
    flex: 1;
    font-size: var(--text-sm);
  }

  .key .muted {
    font-size: var(--text-xs);
  }

  code {
    padding: 0.1rem 0.4rem;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text);
    font-weight: 700;
  }

  .score {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-2);
  }

  .meter {
    inline-size: 5rem;
    block-size: 6px;
    border-radius: 3px;
    background: var(--surface-3);
    overflow: hidden;
  }

  .meter span {
    display: block;
    block-size: 100%;
    background: var(--chart-1);
  }

  .plain {
    color: var(--text-2);
    font-size: var(--text-sm);
    overflow-wrap: anywhere;
  }

  .top .plain {
    color: var(--text);
  }
</style>
