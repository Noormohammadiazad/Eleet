/**
 * Small DOM behaviours, written as Svelte attachments (`{@attach fn}`).
 */

const CHECKED = ':scope > [aria-checked="true"], :scope > [aria-pressed="true"]';

/**
 * Gives a `.segmented` control a single indicator that slides to the selected
 * option instead of each option repainting its own background. The indicator
 * is a pseudo-element positioned from CSS custom properties, so without
 * JavaScript (or before this runs) the static per-button style still applies.
 * Physical offsets are used on purpose: they are correct in RTL as well.
 */
export function slidingIndicator(node: HTMLElement): () => void {
  const place = () => {
    const active = node.querySelector<HTMLElement>(CHECKED);
    if (!active || !active.offsetWidth) {
      node.classList.remove('has-indicator');
      return;
    }
    node.style.setProperty('--seg-x', `${active.offsetLeft}px`);
    node.style.setProperty('--seg-y', `${active.offsetTop}px`);
    node.style.setProperty('--seg-w', `${active.offsetWidth}px`);
    node.style.setProperty('--seg-h', `${active.offsetHeight}px`);
    node.classList.add('has-indicator');
  };

  const resize = new ResizeObserver(place);
  const watchChildren = () => {
    resize.disconnect();
    resize.observe(node);
    for (const child of node.children) resize.observe(child);
  };
  const mutations = new MutationObserver((records) => {
    if (records.some((r) => r.type === 'childList')) watchChildren();
    place();
  });
  mutations.observe(node, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['aria-checked', 'aria-pressed'],
  });
  watchChildren();
  place();
  // Enable the transition only after the first placement, so nothing slides in on load.
  const frame = requestAnimationFrame(() => node.classList.add('indicator-ready'));

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    mutations.disconnect();
  };
}
