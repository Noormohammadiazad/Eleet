<!-- Computes every supported digest of the input in parallel (in the engine worker). -->
<script lang="ts">
  import { untrack } from 'svelte';
  import Copy from '@lucide/svelte/icons/copy';
  import Terminal from '@lucide/svelte/icons/terminal';
  import {
    HASH_ALGORITHMS,
    HASH_LABELS,
    type HashAlgorithm,
  } from '$engine/transforms/crypto/digest';
  import { t } from '$lib/i18n/index.svelte';
  import { copyText } from '$lib/platform/clipboard';
  import { engine } from '$lib/platform/engine';
  import type { ToolSession } from '$lib/state/session.svelte';
  import { toasts } from '$lib/state/toasts.svelte';

  let { session }: { session: ToolSession } = $props();

  const BITS: Record<HashAlgorithm, number> = {
    md5: 128,
    sha1: 160,
    sha256: 256,
    sha384: 384,
    sha512: 512,
    'sha3-256': 256,
    'sha3-512': 512,
    keccak256: 256,
    crc32: 32,
  };
  const BROKEN = new Set<HashAlgorithm>(['md5', 'sha1', 'crc32']);

  let digests = $state<Partial<Record<HashAlgorithm, string>>>({});
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const input = session.input;
    const format = String(session.options.format ?? 'hex');
    clearTimeout(timer);
    timer = setTimeout(() => {
      untrack(() => {
        for (const algorithm of HASH_ALGORITHMS) {
          void engine
            .transform('hash', 'encode', input, { algorithm, format })
            .promise.then((result) => {
              if ('ok' in result && result.ok) digests[algorithm] = result.value;
            });
        }
      });
    }, 150);
  });

  async function copy(value: string) {
    const ok = await copyText(value);
    toasts.show(ok ? t('workbench.copied') : t('workbench.copyFailed'), ok ? 'success' : 'error');
  }
</script>

<section class="panel" aria-labelledby="hash-table">
  <header class="panel-header">
    <h2 class="panel-title" id="hash-table">
      <Terminal aria-hidden="true" />{t('views.hash.title')}
    </h2>
  </header>
  <div class="table-wrap">
    <table>
      <tbody>
        {#each HASH_ALGORITHMS as algorithm (algorithm)}
          <tr class:current={session.options.algorithm === algorithm}>
            <th scope="row">
              <span class="name">{HASH_LABELS[algorithm]}</span>
              <span class="meta">
                <span class="muted">{t('views.hash.bits', { n: BITS[algorithm] })}</span>
                {#if BROKEN.has(algorithm)}<span class="chip chip-warning"
                    >{t('views.hash.broken')}</span
                  >{/if}
              </span>
            </th>
            <td class="digest mono" dir="ltr">{digests[algorithm] ?? '…'}</td>
            <td class="action">
              <button
                class="btn btn-ghost btn-icon btn-sm"
                aria-label="{t('workbench.copy')} {HASH_LABELS[algorithm]}"
                disabled={!digests[algorithm]}
                onclick={() => copy(digests[algorithm]!)}
              >
                <Copy aria-hidden="true" />
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .table-wrap {
    overflow-x: auto;
    padding: var(--space-2);
  }

  table {
    inline-size: 100%;
  }

  tr {
    border-block-end: 1px solid var(--border);
  }

  tr:last-child {
    border-block-end: 0;
  }

  tr.current {
    background: var(--accent-soft);
  }

  th,
  td {
    padding: var(--space-2) var(--space-3);
    vertical-align: middle;
    text-align: start;
  }

  th {
    inline-size: 11rem;
    font-weight: 600;
  }

  .name {
    display: block;
    font-size: var(--text-sm);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
  }

  .meta .muted {
    font-size: var(--text-xs);
  }

  .digest {
    font-size: var(--text-sm);
    word-break: break-all;
    color: var(--text-2);
  }

  .action {
    inline-size: 2.5rem;
  }
</style>
