<!--
  A tool's historical dossier: headline and standfirst, an essay with figures
  (archival images and drawn diagrams, each with full provenance), dated
  dispatches that load straight into the workbench, and further reading.
  The content module is fetched on demand the first time the tool is opened.
-->
<script lang="ts">
  import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
  import CornerLeftUp from '@lucide/svelte/icons/corner-left-up';
  import { ARCHIVE } from '$lib/content/archive';
  import { loadDossier } from '$lib/content/dossiers';
  import type { Dispatch, Localized } from '$lib/content/types';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { eraLabel, toolName } from '$lib/i18n/tools';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { router } from '$lib/state/router.svelte';
  import { toasts } from '$lib/state/toasts.svelte';
  import ArchiveImage from './ArchiveImage.svelte';
  import Diagram from './Diagram.svelte';
  import Prose from './Prose.svelte';

  let { toolId, session }: { toolId: string; session: ToolSession | null } = $props();

  const dossier = $derived(loadDossier(toolId));
  const L = <T,>(text: Localized<T>): T => text[i18n.locale];

  // Arriving from an archive plate: scroll to the dossier once it has rendered.
  function arrive(node: HTMLElement) {
    if (!router.toDossier) return;
    router.toDossier = false;
    requestAnimationFrame(() => node.scrollIntoView({ block: 'start' }));
  }

  function load(dispatch: Dispatch) {
    if (!session || !dispatch.load) return;
    const { direction, input, options = {} } = dispatch.load;
    session.setDirection(direction);
    for (const [key, value] of Object.entries(options)) session.setOption(key, value);
    session.input = input;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    toasts.show(t('dossier.loaded'), 'success');
  }
</script>

{#await dossier}
  <p class="loading" aria-live="polite">{t('dossier.loading')}</p>
{:then data}
  {#if data}
    <article class="dossier" id="dossier" aria-labelledby="dossier-{toolId}" {@attach arrive}>
      <div class="fleuron" aria-hidden="true">§</div>

      <header class="head">
        <p class="eyebrow">{t('dossier.label')} · {toolName(toolId)}</p>
        <h2 class="serif headline" id="dossier-{toolId}">{L(data.headline)}</h2>
        <p class="serif dek">{L(data.dek)}</p>
      </header>

      <div class="layout" class:single={!data.figures.length}>
        <div class="essay serif">
          {#each L(data.body) as paragraph, i (i)}
            <p><Prose text={paragraph} /></p>
          {/each}
        </div>

        {#if data.figures.length}
          <div class="figures">
            {#each data.figures as figure, i (i)}
              <figure>
                {#if 'image' in figure}
                  <ArchiveImage
                    id={figure.image}
                    alt={L(ARCHIVE[figure.image].title)}
                    sizes="(max-width: 1100px) 92vw, 26rem"
                    zoomable
                  />
                {:else}
                  <Diagram id={figure.diagram} />
                {/if}
                <figcaption>
                  <span class="fig rubric">{t('dossier.figure', { n: i + 1 })}</span>
                  <Prose text={L(figure.caption)} />
                  {#if 'image' in figure}
                    {@const record = ARCHIVE[figure.image]}
                    <span class="credit">
                      {L(record.title)}{#if record.holder}. {L(record.holder)}{/if}.
                      {record.license === 'cc0' ? t('dossier.cc0') : t('dossier.publicDomain')} ·
                      <a href={record.source} target="_blank" rel="noopener noreferrer"
                        >{t('dossier.source')}<ArrowUpRight
                          aria-hidden="true"
                          class="flip-rtl"
                        /></a
                      >
                    </span>
                  {:else}
                    <span class="credit">{t('dossier.diagram')}</span>
                  {/if}
                </figcaption>
              </figure>
            {/each}
          </div>
        {/if}
      </div>

      {#if data.dispatches.length}
        <section class="dispatches" aria-labelledby="dispatches-{toolId}">
          <h3 class="caps" id="dispatches-{toolId}">{t('dossier.dispatches')}</h3>
          <ol role="list">
            {#each data.dispatches as dispatch, i (i)}
              <li class="dispatch">
                <p class="date rubric">{L(dispatch.date)}</p>
                <div class="content">
                  <h4 class="serif">
                    {L(dispatch.title)}
                    {#if dispatch.illustrative}
                      <span class="tag" title={t('dossier.illustrativeHint')}
                        >{t('dossier.illustrative')}</span
                      >
                    {/if}
                  </h4>
                  <p><Prose text={L(dispatch.body)} /></p>
                  {#if dispatch.quote}
                    <blockquote class="quote" dir="auto">{dispatch.quote}</blockquote>
                  {/if}
                  {#if dispatch.load && session}
                    <button class="btn btn-sm" onclick={() => load(dispatch)}>
                      <CornerLeftUp aria-hidden="true" class="flip-rtl" />{t('dossier.tryIt')}
                    </button>
                  {/if}
                </div>
              </li>
            {/each}
          </ol>
        </section>
      {/if}

      {#if data.reading?.length}
        <footer class="reading">
          <h3 class="caps">{t('dossier.reading')}</h3>
          <ul role="list">
            {#each data.reading as book (book.title)}
              <li>
                <span class="author">{book.author}</span>,
                <cite class="serif">{book.title}</cite>
                <span class="year">({eraLabel({ year: book.year })})</span>
              </li>
            {/each}
          </ul>
        </footer>
      {/if}
    </article>
  {/if}
{/await}

<style>
  .loading {
    margin-block-start: var(--space-8);
    color: var(--text-3);
    font-size: var(--text-sm);
    text-align: center;
  }

  .dossier {
    margin-block-start: var(--space-8);
  }

  .fleuron {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    margin-block-end: var(--space-6);
  }

  .head {
    max-inline-size: 48rem;
    margin-block-end: var(--space-6);
  }

  .headline {
    margin-block: var(--space-2) var(--space-3);
    font-size: var(--text-2xl);
    font-weight: 500;
    line-height: var(--leading-tight);
    letter-spacing: -0.012em;
  }

  .dek {
    color: var(--text-2);
    font-size: var(--text-xl);
    font-style: italic;
    line-height: 1.45;
  }

  :global(:lang(fa)) .headline {
    letter-spacing: 0;
    font-weight: 600;
  }

  :global(:lang(fa)) .dek {
    font-style: normal;
    font-size: var(--text-lg);
    line-height: 1.9;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, var(--measure)) minmax(16rem, 26rem);
    justify-content: space-between;
    gap: var(--space-7);
    align-items: start;
  }

  .layout.single {
    grid-template-columns: minmax(0, var(--measure));
  }

  .essay {
    font-size: var(--text-prose);
    line-height: var(--leading-prose);
    color: var(--text);
  }

  .essay p + p {
    margin-block-start: 1em;
  }

  /* An editorial initial: the first letter of the essay, set large in vermilion. */
  .essay p:first-child::first-letter {
    float: inline-start;
    margin-inline-end: 0.08em;
    color: var(--rubric);
    font-size: 3.35em;
    font-weight: 500;
    line-height: 0.82;
    padding-block-start: 0.08em;
  }

  :global(:lang(fa)) .essay p:first-child::first-letter {
    float: none;
    font-size: inherit;
    color: inherit;
    line-height: inherit;
    margin: 0;
    padding: 0;
  }

  .figures {
    display: grid;
    gap: var(--space-6);
  }

  figure {
    display: grid;
    gap: var(--space-3);
  }

  figcaption {
    color: var(--text-2);
    font-size: var(--text-sm);
    line-height: 1.55;
  }

  .fig {
    margin-inline-end: 0.4em;
    font-style: italic;
  }

  .credit {
    display: block;
    margin-block-start: var(--space-1);
    color: var(--text-3);
    font-size: var(--text-xs);
  }

  .credit a {
    display: inline-flex;
    align-items: center;
    gap: 0.1em;
  }

  .credit :global(svg) {
    inline-size: 0.85em;
    block-size: 0.85em;
  }

  .dispatches {
    margin-block-start: var(--space-7);
    max-inline-size: 60rem;
  }

  .dispatches h3,
  .reading h3 {
    margin-block-end: var(--space-3);
  }

  .dispatch {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr);
    gap: var(--space-5);
    padding-block: var(--space-5);
    border-block-start: 1px solid var(--border);
  }

  .date {
    font-size: var(--text-md);
    font-style: italic;
    padding-block-start: 0.15rem;
  }

  .content {
    display: grid;
    justify-items: start;
    gap: var(--space-2);
  }

  h4 {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-2);
    font-size: var(--text-xl);
    font-weight: 500;
    line-height: 1.3;
  }

  .tag {
    padding: 0.05em 0.5em;
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    color: var(--text-3);
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 500;
    cursor: help;
  }

  .content p {
    max-inline-size: var(--measure);
    color: var(--text-2);
  }

  .quote {
    max-inline-size: 100%;
    margin: 0;
    padding: var(--space-3) var(--space-4);
    border-inline-start: 2px solid var(--rubric);
    background: var(--surface-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.7;
    overflow-wrap: anywhere;
  }

  .reading {
    margin-block-start: var(--space-6);
    padding-block-start: var(--space-5);
    border-block-start: 1px solid var(--border);
    font-size: var(--text-sm);
    color: var(--text-2);
  }

  .reading li + li {
    margin-block-start: var(--space-1);
  }

  cite {
    font-size: 1.08em;
  }

  .year {
    color: var(--text-3);
  }

  @media (max-width: 1100px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-6);
    }

    .figures {
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    }
  }

  @media (max-width: 640px) {
    .dispatch {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-2);
    }
  }
</style>
