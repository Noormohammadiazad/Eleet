<!--
  Pipeline builder: chain any transforms into a recipe, configure each step,
  watch every intermediate result, and share the whole recipe as a link.
-->
<script lang="ts">
  import { slidingIndicator } from '$lib/ui/attachments';
  import { untrack } from 'svelte';
  import ArrowDown from '@lucide/svelte/icons/arrow-down';
  import ArrowUp from '@lucide/svelte/icons/arrow-up';
  import CircleAlert from '@lucide/svelte/icons/circle-alert';
  import Copy from '@lucide/svelte/icons/copy';
  import Eraser from '@lucide/svelte/icons/eraser';
  import Plus from '@lucide/svelte/icons/plus';
  import Share2 from '@lucide/svelte/icons/share-2';
  import Trash from '@lucide/svelte/icons/trash';
  import Workflow from '@lucide/svelte/icons/workflow';
  import { isOptionVisible } from '$engine/core/options';
  import { getTransform, pipeline as pipelineTool, toolsByCategory } from '$engine/registry';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { actionLabel, categoryName, errorMessage, toolName } from '$lib/i18n/tools';
  import { copyText } from '$lib/platform/clipboard';
  import { EXAMPLE_RECIPES, pipeline } from '$lib/state/pipeline.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import Glyph from '$components/ui/Glyph.svelte';
  import OptionControl from '$components/workbench/OptionControl.svelte';
  import Pane from '$components/workbench/Pane.svelte';
  import ToolHeader from '$components/workbench/ToolHeader.svelte';

  const groups = toolsByCategory()
    .map((g) => ({ ...g, tools: g.tools.filter((tool) => tool.kind === 'transform') }))
    .filter((g) => g.tools.length);

  let chosen = $state('base64');

  $effect(() => {
    void pipeline.input;
    void JSON.stringify(pipeline.steps);
    untrack(() => pipeline.schedule());
  });

  $effect(() => {
    void JSON.stringify(pipeline.steps);
    untrack(() => pipeline.persist());
  });

  const finalOutput = $derived.by(() => {
    for (let i = pipeline.results.length - 1; i >= 0; i--) {
      const r = pipeline.results[i]!;
      if (r.ok === true) return r.output;
      if (r.ok === false) return '';
    }
    return pipeline.steps.length ? '' : pipeline.input;
  });

  async function copy(text: string) {
    const ok = await copyText(text);
    toasts.show(ok ? t('workbench.copied') : t('workbench.copyFailed'), ok ? 'success' : 'error');
  }

  async function share() {
    const { url, truncated } = await pipeline.shareLink();
    const ok = await copyText(url);
    if (!ok) toasts.show(t('workbench.copyFailed'), 'error');
    else
      toasts.show(
        truncated ? t('workbench.shareTooLong') : t('workbench.shareCopied'),
        truncated ? 'info' : 'success',
      );
  }

  const examples = Object.keys(EXAMPLE_RECIPES) as (keyof typeof EXAMPLE_RECIPES)[];
</script>

<ToolHeader tool={pipelineTool}>
  {#snippet actions()}
    <button class="btn" onclick={share} title={t('workbench.shareLabel')}
      ><Share2 aria-hidden="true" />{t('workbench.share')}</button
    >
  {/snippet}
</ToolHeader>

<div class="stack">
  <Pane
    id="pipeline-input"
    label={t('workbench.input')}
    value={pipeline.input}
    placeholder={t('workbench.placeholder')}
    oninput={(value) => (pipeline.input = value)}
  >
    {#snippet actions()}
      <button
        class="btn btn-ghost btn-sm btn-icon"
        onclick={() => (pipeline.input = '')}
        aria-label={t('workbench.clear')}
        title={t('workbench.clear')}
        disabled={!pipeline.input}
      >
        <Eraser aria-hidden="true" />
      </button>
    {/snippet}
  </Pane>

  <section class="panel recipe" aria-labelledby="recipe-title">
    <header class="panel-header">
      <h2 class="panel-title" id="recipe-title">
        <Workflow aria-hidden="true" />{t('views.pipeline.steps')}
      </h2>
      <div class="examples">
        <span class="muted">{t('views.pipeline.examples')}:</span>
        {#each examples as name (name)}
          <button class="btn btn-ghost btn-sm" onclick={() => pipeline.loadExample(name)}
            >{i18n.tr(`views.pipeline.${name}`)}</button
          >
        {/each}
        {#if pipeline.steps.length}
          <button class="btn btn-ghost btn-sm" onclick={() => pipeline.clear()}
            ><Trash aria-hidden="true" />{t('views.pipeline.clear')}</button
          >
        {/if}
      </div>
    </header>

    <div class="panel-body steps">
      {#if !pipeline.steps.length}
        <p class="muted empty">{t('views.pipeline.empty')}</p>
      {/if}

      <ol class="step-list" role="list">
        {#each pipeline.steps as step, i (step.uid)}
          {@const tool = getTransform(step.tool)!}
          {@const result = pipeline.results[i]}
          {@const reversible = !!tool.decode && !tool.involution}
          {@const visible = tool.options.filter(
            (spec) =>
              spec.type !== 'json' &&
              isOptionVisible(spec, reversible ? step.direction : 'encode', step.options),
          )}
          <li class="step" class:disabled={!step.enabled}>
            <div class="step-head">
              <span class="index mono">{i18n.number(i + 1)}</span>
              <span class="tool"><Glyph id={step.tool} />{toolName(step.tool)}</span>
              {#if reversible}
                <div
                  class="segmented dir"
                  role="radiogroup"
                  aria-label={t('workbench.direction')}
                  {@attach slidingIndicator}
                >
                  {#each ['encode', 'decode'] as const as d (d)}
                    <button
                      role="radio"
                      aria-checked={step.direction === d}
                      onclick={() => (step.direction = d)}>{actionLabel(step.tool, d)}</button
                    >
                  {/each}
                </div>
              {/if}
              <span class="spacer"></span>
              <button
                role="switch"
                class="btn btn-ghost btn-sm"
                aria-checked={step.enabled}
                aria-label={step.enabled ? t('views.pipeline.disable') : t('views.pipeline.enable')}
                title={step.enabled ? t('views.pipeline.disable') : t('views.pipeline.enable')}
                onclick={() => (step.enabled = !step.enabled)}
              >
                <span class="dot" class:on={step.enabled}></span>
              </button>
              <button
                class="btn btn-ghost btn-sm btn-icon"
                aria-label={t('views.pipeline.moveUp')}
                disabled={i === 0}
                onclick={() => pipeline.move(step.uid, -1)}><ArrowUp aria-hidden="true" /></button
              >
              <button
                class="btn btn-ghost btn-sm btn-icon"
                aria-label={t('views.pipeline.moveDown')}
                disabled={i === pipeline.steps.length - 1}
                onclick={() => pipeline.move(step.uid, 1)}><ArrowDown aria-hidden="true" /></button
              >
              <button
                class="btn btn-ghost btn-sm btn-icon"
                aria-label={t('views.pipeline.remove')}
                onclick={() => pipeline.remove(step.uid)}><Trash aria-hidden="true" /></button
              >
            </div>

            {#if visible.length}
              <div class="options">
                {#each visible as spec (spec.key)}
                  <OptionControl
                    toolId={tool.id}
                    {spec}
                    value={step.options[spec.key]}
                    onchange={(v) => (step.options[spec.key] = v)}
                  />
                {/each}
              </div>
            {/if}

            {#if result?.ok === true}
              <div class="result">
                <pre dir="auto">{result.output.slice(0, 600)}{result.output.length > 600
                    ? '…'
                    : ''}</pre>
                <span class="ms"
                  >{t('workbench.duration', { n: Number(result.ms.toFixed(1)) })}</span
                >
              </div>
            {:else if result?.ok === false}
              <p class="result error" role="alert">
                <CircleAlert aria-hidden="true" />{errorMessage(result.error)}
              </p>
            {:else if result?.ok === 'skipped'}
              <p class="result muted">{t('views.pipeline.skipped')}</p>
            {/if}
          </li>
        {/each}
      </ol>

      <form
        class="add"
        onsubmit={(e) => {
          e.preventDefault();
          pipeline.add(chosen);
        }}
      >
        <label class="visually-hidden" for="add-step">{t('views.pipeline.addPlaceholder')}</label>
        <select id="add-step" class="select" bind:value={chosen}>
          {#each groups as group (group.category)}
            <optgroup label={categoryName(group.category)}>
              {#each group.tools as tool (tool.id)}<option value={tool.id}
                  >{toolName(tool.id)}</option
                >{/each}
            </optgroup>
          {/each}
        </select>
        <button class="btn btn-primary" type="submit"
          ><Plus aria-hidden="true" />{t('views.pipeline.add')}</button
        >
      </form>
    </div>
  </section>

  <Pane
    id="pipeline-output"
    label={t('views.pipeline.final')}
    value={finalOutput}
    readonly
    busy={pipeline.busy}
    placeholder={t('workbench.emptyOutput')}
  >
    {#snippet actions()}
      <button
        class="btn btn-primary btn-sm"
        onclick={() => copy(finalOutput)}
        disabled={!finalOutput}><Copy aria-hidden="true" />{t('workbench.copy')}</button
      >
    {/snippet}
  </Pane>
</div>

<style>
  .stack {
    display: grid;
    gap: var(--space-4);
  }

  .stack :global(textarea) {
    min-block-size: 8rem;
  }

  .examples {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
  }

  .examples .muted {
    font-size: var(--text-xs);
    margin-inline-end: var(--space-1);
  }

  .steps {
    display: grid;
    gap: var(--space-3);
  }

  .empty {
    padding: var(--space-3);
    text-align: center;
  }

  .step-list {
    display: grid;
    gap: var(--space-3);
    counter-reset: step;
  }

  .step {
    position: relative;
    display: grid;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface-2);
  }

  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    inset-block-start: 100%;
    inset-inline-start: 1.6rem;
    inline-size: 2px;
    block-size: var(--space-3);
    background: var(--accent);
  }

  .step.disabled {
    opacity: 0.55;
  }

  .step-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .index {
    display: grid;
    place-items: center;
    inline-size: 1.6rem;
    block-size: 1.6rem;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: var(--text-xs);
    font-weight: 800;
  }

  .tool {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 650;
  }

  .tool :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
    color: var(--accent);
  }

  .dir button {
    min-block-size: 1.6rem;
    font-size: var(--text-xs);
  }

  .spacer {
    flex: 1;
  }

  .dot {
    inline-size: 0.65rem;
    block-size: 0.65rem;
    border-radius: 50%;
    border: 2px solid var(--text-3);
  }

  .dot.on {
    border-color: var(--accent);
    background: var(--accent);
  }

  .options {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr));
    gap: var(--space-3) var(--space-4);
  }

  .result {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);
  }

  .result pre {
    flex: 1;
    max-block-size: 7rem;
    overflow: auto;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    font-size: var(--text-xs);
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .ms {
    color: var(--text-3);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .result.error {
    align-items: center;
    color: var(--danger);
    font-size: var(--text-sm);
  }

  .result.error :global(svg) {
    inline-size: 1rem;
    block-size: 1rem;
  }

  .add {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .add .select {
    flex: 0 1 20rem;
  }
</style>
