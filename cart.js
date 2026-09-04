/* wetlipps preview cart — client-side only. Nothing is charged; checkout opens at launch. */
(function () {
  var KEY = 'wetlipps-cart';
  var P = {
    balm:  { name: 'The Balm Stick', price: 12, href: 'balm.html' },
    gloss: { name: 'Wetlipps',       price: 16, href: 'wetlipps.html' },
    slip:  { name: 'The intimate line', price: 25, href: 'intimate.html' }
  };
  var ORDER = ['balm', 'gloss', 'slip'];

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }
  function count(c) { var n = 0; for (var k in c) n += c[k]; return n; }
  function total(c) { var t = 0; for (var k in c) if (P[k]) t += P[k].price * c[k]; return t; }
  function money(n) { return '$' + n; }

  var css = '' +
    'nav .cart{cursor:pointer;user-select:none}' +
    '.wl-scrim{position:fixed;inset:0;background:rgba(20,16,16,.45);opacity:0;pointer-events:none;transition:opacity .2s;z-index:60}' +
    '.wl-scrim.on{opacity:1;pointer-events:auto}' +
    '.wl-drawer{position:fixed;top:0;right:0;height:100%;width:min(400px,100vw);background:var(--cream,#F8F1E6);color:var(--ink,#241B18);border-left:2px solid var(--ink,#241B18);transform:translateX(102%);transition:transform .25s;z-index:61;display:flex;flex-direction:column;font-family:"Hanken Grotesk",sans-serif;font-size:18px}' +
    '.wl-drawer.on{transform:none}' +
    '.wl-head{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 16px;border-bottom:2px solid rgba(122,37,48,.14)}' +
    '.wl-head b{font-family:"Young Serif",serif;font-weight:400;font-size:26px;color:var(--kiss,#7A2530)}' +
    '.wl-x{background:none;border:none;font-size:28px;line-height:1;cursor:pointer;color:var(--ink,#241B18);padding:4px 8px}' +
    '.wl-items{flex:1;overflow:auto;padding:8px 24px}' +
    '.wl-row{display:flex;align-items:center;gap:14px;padding:16px 0;border-bottom:1.5px solid rgba(122,37,48,.14)}' +
    '.wl-row .n{flex:1}.wl-row .n b{display:block;font-family:"Young Serif",serif;font-weight:400;font-size:18px}' +
    '.wl-row .n span{font-size:15px;color:#5d4c42}' +
    '.wl-qty{display:flex;border:2px solid var(--ink,#241B18);border-radius:999px;overflow:hidden;background:#FFFDF8}' +
    '.wl-qty button{width:34px;height:36px;background:none;border:none;font-size:18px;cursor:pointer;color:inherit}' +
    '.wl-qty i{width:30px;display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;font-size:15px}' +
    '.wl-row .p{font-weight:800;min-width:44px;text-align:right}' +
    '.wl-rm{background:none;border:none;color:#8a6f5f;font-size:13px;cursor:pointer;text-decoration:underline;padding:0}' +
    '.wl-empty{padding:40px 0;text-align:center;color:#5d4c42}' +
    '.wl-empty a{color:var(--kiss,#7A2530);font-weight:700}' +
    '.wl-foot{padding:18px 24px 26px;border-top:2px solid rgba(122,37,48,.14)}' +
    '.wl-sub{display:flex;justify-content:space-between;font-weight:800;font-size:19px}' +
    '.wl-go{display:block;width:100%;margin-top:14px;background:var(--kiss,#7A2530);color:var(--cream,#F8F1E6);border:none;border-radius:999px;padding:15px 20px;font-weight:700;font-size:17px;font-family:inherit;opacity:.55;cursor:not-allowed}' +
    '.wl-note{margin-top:10px;font-size:14px;color:#5d4c42;text-align:center}' +
    '.wl-toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,20px);background:var(--ink,#241B18);color:var(--cream,#F8F1E6);padding:12px 20px;border-radius:999px;font-family:"Hanken Grotesk",sans-serif;font-size:15.5px;font-weight:700;opacity:0;transition:all .25s;z-index:62;pointer-events:none;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}' +
    '.wl-toast.on{opacity:1;transform:translate(-50%,0);pointer-events:auto}' +
    '.wl-toast a{color:var(--rose,#ED8690);margin-left:10px;text-decoration:underline}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var scrim = document.createElement('div'); scrim.className = 'wl-scrim';
  var drawer = document.createElement('aside'); drawer.className = 'wl-drawer'; drawer.setAttribute('aria-label', 'Your cart');
  drawer.innerHTML =
    '<div class="wl-head"><b>Your cart</b><button class="wl-x" aria-label="Close">×</button></div>' +
    '<div class="wl-items"></div>' +
    '<div class="wl-foot"><div class="wl-sub"><span>Subtotal</span><span class="wl-total">$0</span></div>' +
    '<button class="wl-go" disabled>Checkout opens at launch</button>' +
    '<p class="wl-note">Preview store — nothing is charged. <a href="shipping.html" style="color:var(--kiss,#7A2530);font-weight:700">Shipping</a> · <a href="refunds.html" style="color:var(--kiss,#7A2530);font-weight:700">Refunds</a></p></div>';
  var toast = document.createElement('div'); toast.className = 'wl-toast';
  document.body.appendChild(scrim); document.body.appendChild(drawer); document.body.appendChild(toast);

  var cart = load();

  function renderNav() {
    var n = count(cart);
    document.querySelectorAll('nav .cart').forEach(function (el) {
      el.textContent = 'Cart · ' + n;
      el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 'Open cart, ' + n + ' item' + (n === 1 ? '' : 's'));
    });
  }
  function renderDrawer() {
    var box = drawer.querySelector('.wl-items'); box.innerHTML = '';
    var any = false;
    ORDER.forEach(function (k) {
      if (!cart[k]) return; any = true;
      var row = document.createElement('div'); row.className = 'wl-row'; row.dataset.k = k;
      row.innerHTML = '<div class="n"><b>' + P[k].name + '</b><span>' + money(P[k].price) + ' each · </span><button class="wl-rm">remove</button></div>' +
        '<div class="wl-qty"><button data-d="-1" aria-label="Fewer">−</button><i>' + cart[k] + '</i><button data-d="1" aria-label="More">+</button></div>' +
        '<div class="p">' + money(P[k].price * cart[k]) + '</div>';
      box.appendChild(row);
    });
    if (!any) box.innerHTML = '<div class="wl-empty">Nothing here yet.<br><a href="' + (location.pathname.indexOf('index') > -1 || /\/$/.test(location.pathname) ? '#shop' : 'index.html#shop') + '">Shop the shelf →</a></div>';
    drawer.querySelector('.wl-total').textContent = money(total(cart));
  }
  function render() { renderNav(); renderDrawer(); }
  function open() { render(); drawer.classList.add('on'); scrim.classList.add('on'); }
  function close() { drawer.classList.remove('on'); scrim.classList.remove('on'); }

  var tm;
  function showToast(label) {
    toast.innerHTML = 'Added · ' + label + '<a href="#" class="wl-open">View cart</a>';
    toast.classList.add('on'); clearTimeout(tm);
    tm = setTimeout(function () { toast.classList.remove('on'); }, 2600);
  }

  function add(id, qty) {
    qty = qty || 1;
    if (id === 'set') { ORDER.forEach(function (k) { cart[k] = (cart[k] || 0) + qty; }); save(cart); render(); showToast('the set (all three)'); return; }
    if (!P[id]) return;
    cart[id] = (cart[id] || 0) + qty; save(cart); render(); showToast(P[id].name);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-add],.wl-x,.wl-scrim,.wl-open,nav .cart,.wl-qty button,.wl-rm,.qty button') : null;
    if (!t) return;
    if (t.matches('[data-add]')) {
      e.preventDefault();
      var q = 1, row = t.closest('.qtyrow'); var qi = row && row.querySelector('.qty i');
      if (qi) q = Math.max(1, parseInt(qi.textContent, 10) || 1);
      add(t.getAttribute('data-add'), q);
      if (qi) qi.textContent = '1';
    } else if (t.matches('.qty button')) {
      var i = t.parentNode.querySelector('i'); var v = parseInt(i.textContent, 10) || 1;
      i.textContent = Math.max(1, v + (t.textContent.trim() === '+' ? 1 : -1));
    } else if (t.matches('.wl-x') || t.matches('.wl-scrim')) { close(); }
    else if (t.matches('.wl-open') || t.matches('nav .cart')) { e.preventDefault(); open(); }
    else if (t.matches('.wl-qty button')) {
      var k = t.closest('.wl-row').dataset.k; cart[k] = Math.max(0, (cart[k] || 0) + parseInt(t.dataset.d, 10));
      if (!cart[k]) delete cart[k]; save(cart); render();
    } else if (t.matches('.wl-rm')) { delete cart[t.closest('.wl-row').dataset.k]; save(cart); render(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('nav .cart')) { e.preventDefault(); open(); }
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { cart = load(); render(); } });
  render();
})();
