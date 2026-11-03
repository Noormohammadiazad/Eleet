/**
 * Application entry point.
 *
 * Fonts are self-hosted (bundled from @fontsource) instead of loaded from a CDN:
 * no third-party requests, no tracking, and the Content-Security-Policy can
 * forbid every foreign origin. `unicode-range` subsetting means a browser only
 * downloads the Persian or Latin files it actually needs.
 */
import '@fontsource-variable/inter';
import '@fontsource-variable/vazirmatn';
import '@fontsource-variable/jetbrains-mono';
// Display and prose: Newsreader with its optical-size axis (roman and italic), Naskh for Persian.
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource-variable/noto-naskh-arabic/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { mount } from 'svelte';
import App from './App.svelte';
import { registerServiceWorker } from '$lib/platform/pwa';

const app = mount(App, { target: document.getElementById('app')! });

registerServiceWorker();

export default app;
