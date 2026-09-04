// lovethelipps header cart count — listens to Horizon's standard cart event and keeps "Cart · N" current.
import { StandardEvents } from '@shopify/events';

const counters = () => document.querySelectorAll('[data-wl-cart-count]');
const live = () => document.querySelector('[data-wl-cart-live]');

function render(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return;
  counters().forEach((el) => { el.textContent = String(n); });
  const region = live();
  if (region && typeof Theme !== 'undefined') region.textContent = `${Theme.translations.cart_count}: ${n}`;
}

document.addEventListener(StandardEvents.cartLinesUpdate, (event) => {
  event.promise?.then(({ cart, detail }) => {
    render(cart?.totalQuantity ?? detail?.itemCount);
  }).catch(() => {});
});

window.addEventListener('pageshow', async (event) => {
  if (!event.persisted || typeof Theme === 'undefined') return;
  try {
    const res = await fetch(`${Theme.routes.cart_url}.js`, { headers: { Accept: 'application/json' } });
    const cart = await res.json();
    render(cart.item_count);
  } catch (e) { /* leave the server-rendered count */ }
});
