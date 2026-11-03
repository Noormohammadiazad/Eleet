<!--
  The overview: Eleet's front page. Instead of a dashboard of cards it is set
  like the opening of a printed catalogue — a masthead, a live specimen sheet
  that runs one line of text through a dozen instruments, the catalogue
  itself in its ten drawers, plates from the archive, and the house rules.
-->
<script lang="ts">
  import { CATEGORY_IDS } from '$engine/core/types';
  import { TOOLS, toolsByCategory } from '$engine/registry';
  import { PLATES } from '$lib/content/dossiers';
  import { ARCHIVE } from '$lib/content/archive';
  import { i18n, t } from '$lib/i18n/index.svelte';
  import { categoryName, categoryNote, eraLabel, toolName, toolSummary } from '$lib/i18n/tools';
  import { router } from '$lib/state/router.svelte';
  import { roman, ERAS } from '$lib/ui/catalogue';
  import ArchiveImage from '$components/dossier/ArchiveImage.svelte';
  import Glyph from '$components/ui/Glyph.svelte';
  import SpecimenSheet from './SpecimenSheet.svelte';

  const groups = toolsByCategory();
  const count = TOOLS.length;

  function scrollToId(id: string) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  function openDossier(tool: string) {
    router.toDossier = true;
    router.go(tool);
  }
</script>

<article class="home">
  <header class="masthead">
    <p class="eyebrow"><span class="rubric">Eleet</span><span>{t('home.kicker')}</span></p>
    <h1 class="serif display">{t('home.title')}</h1>
    <p class="serif lede">{t('home.lede', { n: count })}</p>
    <div class="jump">
      <button class="btn btn-primary" onclick={() => scrollToId('specimen')}>
        {t('home.begin')}
      </button>
      <button class="btn btn-ghost" onclick={() => scrollToId('catalogue')}>
        {t('home.browse')}
      </button>
    </div>
  </header>

  <section class="section" id="specimen" aria-labelledby="specimen-title">
    <header class="section-head">
      <h2 class="serif" id="specimen-title">{t('home.specimen.title')}</h2>
      <p>{t('home.specimen.hint')}</p>
    </header>
    <SpecimenSheet />
  </section>

  <section class="section" id="catalogue" aria-labelledby="catalogue-title">
    <header class="section-head">
      <h2 class="serif" id="catalogue-title">{t('home.catalogue.title')}</h2>
      <p>{t('home.catalogue.hint', { n: count, m: CATEGORY_IDS.length })}</p>
    </header>
    <div class="drawers">
      {#each groups as group, g (group.category)}
        <section class="drawer" aria-labelledby="drawer-{group.category}">
          <h3 class="drawer-title" id="drawer-{group.category}">
            <span class="numeral rubric">{roman(g + 1)}</span>
            <span class="serif">{categoryName(group.category)}</span>
          </h3>
          <p class="note">{categoryNote(group.category)}</p>
          <ul role="list">
            {#each group.tools as tool (tool.id)}
              {@const era = eraLabel(ERAS[tool.id])}
              <li>
                <a class="entry" href="#/{tool.id}">
                  <Glyph id={tool.id} />
                  <span class="entry-text">
                    <span class="entry-name">
                      {toolName(tool.id)}
                      {#if era}<span class="entry-era">{era}</span>{/if}
                    </span>
                    <span class="entry-summary">{toolSummary(tool.id)}</span>
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </section>

  <section class="section" aria-labelledby="archive-title">
    <header class="section-head">
      <h2 class="serif" id="archive-title">{t('home.archive.title')}</h2>
      <p>{t('home.archive.hint')}</p>
    </header>
    <ul class="plates" role="list">
      {#each PLATES as plate (plate.tool)}
        <li>
          <a
            class="plate"
            href="#/{plate.tool}"
            onclick={(event) => {
              event.preventDefault();
              openDossier(plate.tool);
            }}
          >
            <span class="plate-image">
              <ArchiveImage
                id={plate.image}
                alt={ARCHIVE[plate.image].title[i18n.locale]}
                sizes="(max-width: 560px) 46vw, (max-width: 1180px) 30vw, 12rem"
              />
            </span>
            <span class="plate-tool eyebrow">{toolName(plate.tool)}</span>
            <span class="plate-title serif">{plate.headline[i18n.locale]}</span>
            <span class="plate-read">{t('home.archive.read', { tool: toolName(plate.tool) })}</span>
          </a>
        </li>
      {/each}
    </ul>
  </section>

  <section class="section rules" aria-labelledby="rules-title">
    <header class="section-head">
      <h2 class="serif" id="rules-title">{t('home.rules.title')}</h2>
    </header>
    <ol class="rule-list" role="list">
      <li>
        <span class="numeral rubric">i.</span>
        <h3 class="serif">{t('home.rules.local')}</h3>
        <p>{t('home.rules.localBody')}</p>
      </li>
      <li>
        <span class="numeral rubric">ii.</span>
        <h3 class="serif">{t('home.rules.offline')}</h3>
        <p>{t('home.rules.offlineBody')}</p>
      </li>
      <li>
        <span class="numeral rubric">iii.</span>
        <h3 class="serif">{t('home.rules.open')}</h3>
        <p>{t('home.rules.openBody')}</p>
      </li>
    </ol>
  </section>

  <footer class="colophon">
    <div class="fleuron" aria-hidden="true">❦</div>
    <p>{t('home.colophon')}</p>
    <p>
      {t('app.version', { version: __APP_VERSION__ })} · {t('app.footer')} ·
      <a href="https://github.com/Noormohammadiazad/Eleet" target="_blank" rel="noopener noreferrer"
        >GitHub</a
      >
    </p>
  </footer>
</article>

<style>
  .home {
    max-inline-size: 76rem;
    margin-inline: auto;
    animation: enter var(--slow) var(--ease-out);
  }

  @keyframes enter {
    from {
      opacity: 0;
    }
  }

  /* --------------------------------------------------------------- Masthead */
  .masthead {
    padding-block: var(--space-7) var(--space-8);
    border-block-end: 1px solid var(--border);
  }

  .masthead .eyebrow .rubric {
    font-size: var(--text-md);
    font-style: italic;
    letter-spacing: 0;
    text-transform: none;
  }

  .display {
    max-inline-size: 15ch;
    margin-block: var(--space-4) var(--space-5);
    font-size: var(--text-3xl);
    font-weight: 450;
    line-height: 1.02;
    letter-spacing: -0.028em;
  }

  :global(:lang(fa)) .display {
    max-inline-size: 16ch;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: 0;
  }

  .lede {
    max-inline-size: 40rem;
    color: var(--text-2);
    font-size: var(--text-xl);
    line-height: 1.5;
  }

  :global(:lang(fa)) .lede {
    font-size: var(--text-lg);
    line-height: 2;
  }

  .jump {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-block-start: var(--space-6);
  }

  .jump .btn {
    min-block-size: 2.6rem;
    padding-inline: var(--space-4);
    font-size: var(--text-md);
  }

  /* --------------------------------------------------------------- Sections */
  .section {
    padding-block: var(--space-8) 0;
    scroll-margin-block-start: calc(var(--header-h) + var(--space-4));
  }

  .section-head {
    display: grid;
    gap: var(--space-2);
    margin-block-end: var(--space-6);
    max-inline-size: 44rem;
  }

  .section-head h2 {
    font-size: var(--text-2xl);
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: var(--leading-tight);
  }

  :global(:lang(fa)) .section-head h2 {
    font-weight: 600;
    letter-spacing: 0;
  }

  .section-head p {
    color: var(--text-2);
  }

  /* -------------------------------------------------------------- Catalogue */
  .drawers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 21rem), 1fr));
    gap: var(--space-7) var(--space-6);
  }

  .drawer {
    padding-block-start: var(--space-3);
    border-block-start: 2px solid var(--text);
  }

  .drawer-title {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    font-size: var(--text-xl);
    font-weight: 500;
  }

  .numeral {
    font-size: var(--text-md);
    font-style: italic;
    min-inline-size: 1.6em;
  }

  .note {
    margin-block: var(--space-1) var(--space-3);
    color: var(--text-3);
    font-size: var(--text-sm);
  }

  .entry {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: 0.55rem var(--space-2);
    margin-inline: calc(-1 * var(--space-2));
    border-radius: var(--radius);
    color: var(--text);
    text-decoration: none;
    transition: background var(--fast) var(--ease);
  }

  li + li .entry {
    border-block-start: 1px solid var(--border);
    border-radius: 0;
  }

  .entry :global(.glyph) {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    margin-block-start: 0.1rem;
    color: var(--text-3);
    transition:
      color var(--fast) var(--ease),
      transform var(--slow) var(--ease-spring);
  }

  .entry:hover {
    background: var(--surface-2);
  }

  .entry:hover :global(.glyph) {
    color: var(--rubric);
    transform: scale(1.08);
  }

  .entry-text {
    display: grid;
    min-inline-size: 0;
  }

  .entry-name {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0 var(--space-2);
    font-weight: 600;
    font-size: var(--text-md);
  }

  .entry-era {
    color: var(--rubric);
    font-family: var(--font-serif);
    font-size: var(--text-sm);
    font-style: italic;
    font-weight: 400;
  }

  .entry-summary {
    color: var(--text-3);
    font-size: var(--text-sm);
  }

  /* ---------------------------------------------------------------- Archive */
  .plates {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: var(--space-6) var(--space-4);
  }

  @media (max-width: 1180px) {
    .plates {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .plates {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .plate {
    display: grid;
    gap: var(--space-2);
    color: var(--text);
    text-decoration: none;
  }

  .plate-image {
    display: block;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    border-radius: var(--radius-sm);
  }

  .plate-image :global(.frame) {
    block-size: 100%;
    aspect-ratio: auto !important;
    transition: transform var(--slow) var(--ease-out);
  }

  .plate:hover .plate-image :global(.frame) {
    transform: scale(1.03);
  }

  .plate-tool {
    margin-block-start: var(--space-1);
  }

  .plate-title {
    font-size: var(--text-lg);
    font-weight: 500;
    line-height: 1.3;
  }

  .plate-read {
    color: var(--accent);
    font-size: var(--text-sm);
    text-decoration: underline;
    text-decoration-color: var(--accent-line);
    text-underline-offset: 0.22em;
  }

  .plate:hover .plate-read {
    text-decoration-color: currentColor;
  }

  /* ------------------------------------------------------------ House rules */
  .rule-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: var(--space-6);
  }

  .rule-list li {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    padding-block-start: var(--space-3);
    border-block-start: 1px solid var(--border-strong);
  }

  .rule-list h3 {
    font-size: var(--text-xl);
    font-weight: 500;
    line-height: 1.25;
  }

  .rule-list p {
    color: var(--text-2);
    font-size: var(--text-sm);
  }

  /* --------------------------------------------------------------- Colophon */
  .colophon {
    display: grid;
    justify-items: center;
    gap: var(--space-2);
    margin-block: var(--space-9) var(--space-5);
    color: var(--text-3);
    font-size: var(--text-sm);
    text-align: center;
  }

  .colophon .fleuron {
    inline-size: min(100%, 22rem);
    margin-block-end: var(--space-4);
    font-size: var(--text-lg);
  }

  .colophon p {
    max-inline-size: 38rem;
  }

  @media (max-width: 640px) {
    .masthead {
      padding-block: var(--space-5) var(--space-7);
    }

    .section {
      padding-block-start: var(--space-7);
    }
  }
</style>
