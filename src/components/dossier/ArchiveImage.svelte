<!--
  An archival image: AVIF with a WebP fallback at several widths, intrinsic
  width/height (no layout shift), a ~300-byte blurred placeholder painted
  until the real image arrives, and lazy loading. Optionally zoomable into a
  native <dialog> showing the largest rendition.
-->
<script lang="ts">
  import X from '@lucide/svelte/icons/x';
  import { ARCHIVE_MEDIA, type ArchiveId } from '$lib/content/archive-media';
  import { t } from '$lib/i18n/index.svelte';

  interface Props {
    id: ArchiveId;
    alt: string;
    /** The `sizes` attribute: how wide the image is rendered. */
    sizes?: string;
    zoomable?: boolean;
    eager?: boolean;
  }

  let {
    id,
    alt,
    sizes = '(max-width: 700px) 100vw, 480px',
    zoomable = false,
    eager = false,
  }: Props = $props();

  const media = $derived(ARCHIVE_MEDIA[id]);
  const base = import.meta.env.BASE_URL;
  const srcset = (ext: string) =>
    media.widths.map((w) => `${base}archive/${id}-${w}.${ext} ${w}w`).join(', ');
  const largest = $derived(media.widths.at(-1)!);

  let loaded = $state(false);
  let dialog = $state<HTMLDialogElement>();
</script>

{#snippet picture(full: boolean)}
  <picture>
    <source type="image/avif" srcset={srcset('avif')} sizes={full ? '100vw' : sizes} />
    <img
      src="{base}archive/{id}-{full ? largest : media.widths[0]}.webp"
      srcset={srcset('webp')}
      sizes={full ? '100vw' : sizes}
      width={media.width}
      height={media.height}
      {alt}
      loading={eager || full ? 'eager' : 'lazy'}
      decoding="async"
      onload={() => (loaded = true)}
    />
  </picture>
{/snippet}

{#if zoomable}
  <button
    class="frame zoom"
    class:loaded
    style:--lqip="url({media.lqip})"
    style:aspect-ratio="{media.width} / {media.height}"
    aria-label={t('dossier.enlarge', { title: alt })}
    onclick={() => dialog?.showModal()}
  >
    {@render picture(false)}
  </button>
  <dialog
    class="lightbox"
    bind:this={dialog}
    aria-label={alt}
    onclick={(event) => event.target === dialog && dialog?.close()}
  >
    <button
      class="btn btn-icon close"
      aria-label={t('dossier.close')}
      onclick={() => dialog?.close()}
    >
      <X aria-hidden="true" />
    </button>
    {@render picture(true)}
  </dialog>
{:else}
  <div
    class="frame"
    class:loaded
    style:--lqip="url({media.lqip})"
    style:aspect-ratio="{media.width} / {media.height}"
  >
    {@render picture(false)}
  </div>
{/if}

<style>
  .frame {
    position: relative;
    display: block;
    inline-size: 100%;
    overflow: hidden;
    border-radius: var(--radius-sm);
    background-color: var(--surface-3);
    box-shadow: 0 0 0 1px var(--border);
  }

  /* The placeholder: a 24-pixel image, blurred smooth and slightly overscaled to hide its edges. */
  .frame::before {
    content: '';
    position: absolute;
    inset: -8%;
    background: var(--lqip) center / cover no-repeat;
    filter: blur(14px);
    transition: opacity var(--slow) var(--ease);
  }

  .frame.loaded::before {
    opacity: 0;
  }

  .frame img {
    position: relative;
    display: block;
    inline-size: 100%;
    block-size: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity var(--slow) var(--ease);
  }

  .frame.loaded img {
    opacity: 1;
  }

  .zoom {
    padding: 0;
    cursor: zoom-in;
    transition:
      box-shadow var(--fast) var(--ease),
      transform var(--slow) var(--ease-spring);
  }

  .zoom:hover {
    box-shadow:
      0 0 0 1px var(--border-strong),
      var(--shadow-2);
  }

  .zoom:active {
    transform: scale(0.99);
    transition-duration: 60ms;
  }

  .lightbox {
    max-inline-size: min(96vw, 1400px);
    max-block-size: 94dvh;
    padding: 0;
    border: 0;
    border-radius: var(--radius);
    background: var(--surface-1);
    box-shadow: var(--shadow-3);
    overflow: hidden;
  }

  .lightbox[open] {
    animation: open var(--normal) var(--ease-out);
  }

  .lightbox::backdrop {
    background: var(--overlay);
  }

  .lightbox img {
    display: block;
    max-inline-size: min(96vw, 1400px);
    max-block-size: 94dvh;
    inline-size: auto;
    block-size: auto;
    object-fit: contain;
  }

  .close {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-end: var(--space-2);
    z-index: 1;
    box-shadow: var(--shadow-2);
  }

  @keyframes open {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
  }
</style>
