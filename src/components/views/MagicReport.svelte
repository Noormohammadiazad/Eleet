<!-- Ranked Magic candidates: the decoding chain, a confidence meter and the decoded text. -->
<script lang="ts">
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Copy from '@lucide/svelte/icons/copy';
  import Workflow from '@lucide/svelte/icons/workflow';
  import { defaultOptions, sanitizeOptions } from '$engine/core/options';
  import type { MagicReport } from '$engine/analysis/magic';
  import { getTransform } from '$engine/registry';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { actionLabel, toolName } from '$lib/i18n/tools';
  import { copyText } from '$lib/platform/clipboard';
  import { pipeline } from '$lib/state/pipeline.svelte';
  import { router } from '$lib/state/router.svelte';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { toasts } from '$lib/state/toasts.svelte';

  let { report, session }: { report: MagicReport; session: ToolSession } = $props();

  async function copy(text: string) {
    const ok = await copyText(text);
    toasts.show(ok ? t('workbench.copied') : t('workbench.copyFailed'), ok ? 'success' : 'error');
  }

  function openInPipeline(candidate: MagicReport['candidates'][number]) {
    pipeline.steps = candidate.steps.flatMap((step, i) => {
      const tool = getTransform(step.tool);
      if (!tool) return [];
      return [
        {
          uid: `${Date.now()}-${i}`,
          tool: tool.id,
          direction: step.direction,
          options: sanitizeOptions(tool.options, {
            ...defaultOptions(tool.options),
            ...step.options,
          }),
          enabled: true,
        },
      ];
    });
    pipeline.input = session.input;
    router.go('pipeline');
  }

  const percent = (score: number) => i18n.number(Math.round(Math.max(0, Math.min(1, score)) * 100));
</script>

<section class="results" aria-live="polite">
  <p class="muted meta">
    {t('views.analysis.explored', { n: report.explored })}
    {#if report.inputScore > 0.6}· {t('views.analysis.inputScore', {
        score: `${percent(report.inputScore)}%`,
      })}{/if}
  </p>

  {#if !report.candidates.length}
    <p class="panel empty">{t('views.analysis.noCandidates')}</p>
  {:else}
    <ol class="list" role="list">
      {#each report.candidates as candidate, i (i)}
        <li class="panel candidate" class:top={i === 0}>
          <div class="head">
            <span class="rank mono">#{i18n.number(i + 1)}</span>
            <ol class="steps" role="list" aria-label={t('views.analysis.steps')}>
              {#each candidate.steps as step, s (s)}
                <li>
                  {#if s > 0}<ChevronRight class="sep flip-rtl" aria-hidden="true" />{/if}
                  <span class="chip" class:chip-accent={i === 0}>
                    {toolName(step.tool)}
                    <span class="hint">{step.hint ?? actionLabel(step.tool, step.direction)}</span>
                  </span>
                </li>
              {/each}
            </ol>
            <span class="score" title={t('views.analysis.score')}>
              <span class="meter"
                ><span style:inline-size="{Math.max(3, candidate.score * 100)}%"></span></span
              >
              <span class="mono">{percent(candidate.score)}%</span>
            </span>
          </div>
          <pre class="output" dir="auto">{candidate.output.slice(0, 1200)}</pre>
          <div class="actions">
            <button class="btn btn-sm" onclick={() => openInPipeline(candidate)}>
              <Workflow aria-hidden="true" />{t('views.analysis.open', {
                tool: toolName('pipeline'),
              })}
            </button>
            <button class="btn btn-sm btn-ghost" onclick={() => copy(candidate.output)}>
              <Copy aria-hidden="true" />{t('workbench.copy')}
            </button>
          </div>
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
    gap: var(--space-3);
  }

  .candidate {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .candidate.top {
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

  .rank {
    color: var(--text-3);
    font-weight: 700;
  }

  .top .rank {
    color: var(--accent);
  }

  .steps {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    flex: 1;
  }

  .steps li {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
  }

  .steps :global(.sep) {
    inline-size: 0.9rem;
    block-size: 0.9rem;
    color: var(--text-3);
  }

  .hint {
    color: var(--text-3);
    font-weight: 500;
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

  .output {
    max-block-size: 10rem;
    overflow: auto;
    padding: var(--space-3);
    border-radius: var(--radius);
    background: var(--surface-2);
    font-size: var(--text-sm);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
</style>
