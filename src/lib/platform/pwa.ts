/**
 * Service-worker registration with a safe update flow.
 *
 * A new deployment installs in the background but does not take over until the
 * user accepts the "new version" toast — so an open tab never mixes JavaScript
 * chunks from two different builds.
 */
import { t } from '$lib/i18n/index.svelte';
import { toasts } from '$lib/state/toasts.svelte';
import { readJSON, writeJSON } from './storage';

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    let registration: ServiceWorkerRegistration;
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    } catch {
      return;
    }

    const promptUpdate = (worker: ServiceWorker) => {
      toasts.show(t('app.updateAvailable'), 'info', {
        timeout: 0,
        action: { label: t('app.reload'), run: () => worker.postMessage('SKIP_WAITING') },
      });
    };

    if (registration.waiting && navigator.serviceWorker.controller)
      promptUpdate(registration.waiting);

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state !== 'installed') return;
        if (navigator.serviceWorker.controller) promptUpdate(installing);
        else if (!readJSON('offline-ready')) {
          writeJSON('offline-ready', true);
          toasts.show(t('app.offlineReady'), 'success');
        }
      });
    });

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      reloading = true;
      location.reload();
    });

    // Check for a new deployment every hour while the tab stays open.
    setInterval(() => void registration.update().catch(() => {}), 60 * 60 * 1000);
  });
}
