/* Trading Interview Practice: UI motion layer (23 Nov 2026).
   Adds motion without touching the React code. Timings match motion.css:
   fast 150ms (hover, colour), base 250ms (movement), pop-ups in 200ms / out 150ms.
   - top tabs: a pill that slides to the selected tab
   - page change (tab or sub-tab): content rises in, cards stagger in, numbers count up,
     readiness rings fill and skill bars grow
   - search / filter results: new rows and cards fade in
   - accordions (Tracker, Formula sheet, <details> such as "How it's graded"): slide open and closed
   - pop-ups (modals, theme menu, filter dropdowns, toasts): short exit instead of vanishing
   - question window: next / previous question fades in
   - glossary: the letter you jump to gets a short highlight */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var EASE = 'cubic-bezier(.3,.7,.3,1)', FAST = 150, BASE = 250, IN = 200, OUT = 150;
  var pageBusy = false;   // true while a page entrance is running, so list fades don't double up

  function rise(el, delay, dist) {
    return el.animate([{ opacity: 0, transform: 'translateY(' + (dist || 8) + 'px)' }, { opacity: 1, transform: 'none' }],
      { duration: BASE, delay: delay || 0, easing: EASE, fill: 'backwards' });
  }

  /* ---------- sliding tab pill ---------- */
  function placePill(tabs, animate) {
    var on = tabs.querySelector('.tab.on');
    if (!on) { tabs.style.setProperty('--pill-o', '0'); return; }
    if (!animate) tabs.classList.add('pill-still');
    tabs.style.setProperty('--pill-x', on.offsetLeft + 'px');
    tabs.style.setProperty('--pill-y', on.offsetTop + 'px');
    tabs.style.setProperty('--pill-w', on.offsetWidth + 'px');
    tabs.style.setProperty('--pill-h', on.offsetHeight + 'px');
    tabs.style.setProperty('--pill-o', '1');
    if (!animate) { void tabs.offsetWidth; tabs.classList.remove('pill-still'); }
  }
  var tabsSeen = new WeakSet();
  function hookTabs() {
    document.querySelectorAll('.top .tabs').forEach(function (tabs) {
      if (tabsSeen.has(tabs)) return;
      tabsSeen.add(tabs);
      tabs.classList.add('has-pill');
      placePill(tabs, false);
      new MutationObserver(function () { placePill(tabs, true); })
        .observe(tabs, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
      if (window.ResizeObserver) new ResizeObserver(function () { placePill(tabs, false); }).observe(tabs);
    });
  }

  /* ---------- numbers count up, rings fill, bars grow ---------- */
  var NUM = /^(\d{1,6})$/;
  function countUp(el) {
    var t = el.firstChild;
    if (!t || t.nodeType !== 3 || el.childNodes.length !== 1) return;
    var m = t.nodeValue.trim().match(NUM);
    if (!m) return;
    var end = +m[1];
    if (end < 2) return;
    var t0 = performance.now(), last = '0', dur = 600;
    t.nodeValue = '0';
    (function step(now) {
      if (t.nodeValue !== last) return;            // React changed it: stop
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      last = String(Math.round(end * e));
      t.nodeValue = last;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function fillRing(c) {
    var d = (c.getAttribute('stroke-dasharray') || '').split(/[ ,]+/);
    if (d.length < 2 || !(+d[0] > 0)) return;
    c.animate([{ strokeDasharray: '0 ' + d[1] }, { strokeDasharray: d[0] + ' ' + d[1] }], { duration: 700, easing: EASE });
  }
  function growBar(i) {
    var w = i.style.width;
    if (!w || w === '0%') return;
    i.animate([{ width: '0%' }, { width: w }], { duration: 600, easing: EASE });
  }
  function dressUp(root) {
    root.querySelectorAll('.rd-num, .stat-big, .rd-ring > div').forEach(countUp);
    root.querySelectorAll('circle.rd-arc').forEach(fillRing);
    root.querySelectorAll('.rd-bar > i, .tip-wbar > i').forEach(growBar);
  }

  /* ---------- page entrance: rise, cards stagger ---------- */
  function enter(nodes) {
    pageBusy = true;
    nodes.forEach(function (el) { rise(el, 0); });
    var cards = [];
    nodes.forEach(function (el) { el.querySelectorAll('.card, .tcard').forEach(function (c) { cards.push(c); }); });
    var vh = window.innerHeight, k = 0;
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      if (r.top > vh || r.bottom < 0 || k > 11) return;   // only what is on screen, at most 12
      rise(c, 40 + 30 * k++, 10);
    });
    nodes.forEach(dressUp);
    setTimeout(function () { pageBusy = false; }, BASE + 400);
  }
  function pageIn() {
    var app = document.querySelector('.app');
    if (!app) return;
    enter(Array.prototype.filter.call(app.children, function (el) { return el.tagName !== 'HEADER'; }));
  }
  window.addEventListener('hashchange', function () { requestAnimationFrame(pageIn); });
  /* sub-tabs (Firms > Tracker etc.) don't change the address: animate what follows the switcher */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tip-seg button');
    if (!b || b.classList.contains('on')) return;
    var seg = b.closest('.tip-seg');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var row = seg.isConnected ? seg : null;
        while (row && row.parentElement && !row.parentElement.classList.contains('view') && row.parentElement !== document.body) row = row.parentElement;
        if (!row) { pageIn(); return; }
        var after = [], n = row.nextElementSibling;
        while (n) { after.push(n); n = n.nextElementSibling; }
        if (after.length) enter(after); else pageIn();
      });
    });
  }, true);

  /* ---------- accordions slide open and closed ---------- */
  var BODY = '.trk-accp, .trk-fl, .trk2-body, .tip-sheet-grid';
  function slide(el, open, done) {
    var h = el.scrollHeight;
    el.style.overflow = 'hidden';
    var a = el.animate(open
      ? [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }]
      : [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: BASE, easing: EASE });
    a.onfinish = a.oncancel = function () { el.style.overflow = ''; if (done) done(); };
  }
  /* every native <details> (Tracker by month, "How it's graded", reviews) */
  document.addEventListener('click', function (e) {
    var sum = e.target.closest && e.target.closest('details > summary');
    if (!sum || e.target.closest('a, button, select, input')) return;
    var det = sum.parentNode;
    e.preventDefault();
    if (det.__anim) return;
    var startH = det.offsetHeight;
    det.__anim = true;
    det.style.overflow = 'hidden';
    if (det.open) {
      var a = det.animate([{ height: startH + 'px' }, { height: sum.offsetHeight + 'px' }], { duration: BASE, easing: EASE });
      a.onfinish = a.oncancel = function () { det.open = false; det.style.overflow = ''; det.__anim = false; };
    } else {
      det.open = true;
      var endH = det.offsetHeight;
      var b = det.animate([{ height: startH + 'px' }, { height: endH + 'px' }], { duration: BASE, easing: EASE });
      b.onfinish = b.oncancel = function () { det.style.overflow = ''; det.__anim = false; };
    }
  }, true);

  /* ---------- pop-ups: exit animation ---------- */
  var POP = '.scrim, .theme-menu, .tf-pop, .oa-pop, .toast';
  function putBack(node, parent, next) {
    try {
      if (next && next.parentNode === parent) parent.insertBefore(node, next); else parent.appendChild(node);
      return true;
    } catch (_) { return false; }
  }
  function exitPop(node) {
    node.style.pointerEvents = 'none';
    var inner = node.classList.contains('scrim') ? node.firstElementChild : null;
    if (inner) inner.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: OUT, easing: 'ease-in', fill: 'forwards' });
    var a = node.animate(inner
      ? [{ opacity: 1 }, { opacity: 0 }]
      : node.classList.contains('toast')
        ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px) scale(.98)' }]
        : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96) translateY(-4px)' }],
      { duration: OUT, easing: 'ease-in', fill: 'forwards' });
    a.onfinish = a.oncancel = function () { if (node.parentNode) node.parentNode.removeChild(node); };
  }

  /* ---------- list rows / cards that appear after a search or filter change ---------- */
  var ROW = '.qrow, .tcard, .trk-acc, .trk2-r, .trk-det, .tip-gloss-sec, .trk2-sec, .trk-month';
  var queued = [], qTimer = 0;
  function queueRow(n) {
    if (pageBusy) return;
    queued.push(n);
    if (!qTimer) qTimer = requestAnimationFrame(function () {
      var k = 0, vh = window.innerHeight;
      queued.forEach(function (el) {
        if (!el.isConnected) return;
        var r = el.getBoundingClientRect();
        if (r.top > vh || r.bottom < 0) return;
        el.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
          { duration: IN, delay: Math.min(k++, 10) * 18, easing: EASE, fill: 'backwards' });
      });
      queued = []; qTimer = 0;
    });
  }

  /* one observer for everything that enters or leaves */
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1 || n.__leaving) return;
        if (n.matches(BODY)) { slide(n, true); dressUp(n); }
        else if (n.matches(ROW)) { queueRow(n); dressUp(n); }
        else if (m.target.closest && m.target.closest('.scrim') && !n.matches('.scrim')) {
          /* question window: content swapped for the next / previous question */
          n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: IN, easing: EASE });
        }
        if (n.matches('.tabs') || n.querySelector('.top .tabs')) hookTabs();
      });
      m.removedNodes.forEach(function (n) {
        if (n.nodeType !== 1 || n.__leaving || !m.target.isConnected) return;
        if (n.matches(BODY)) {
          n.__leaving = true;
          if (!putBack(n, m.target, m.nextSibling)) return;
          n.style.pointerEvents = 'none';
          slide(n, false, function () { if (n.parentNode) n.parentNode.removeChild(n); });
        } else if (n.matches(POP)) {
          n.__leaving = true;
          if (putBack(n, m.target, m.nextSibling)) exitPop(n);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------- glossary: highlight the letter you jumped to ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tip-az button');
    if (!b) return;
    var el = document.getElementById('gl-' + b.textContent.trim());
    if (!el) return;
    setTimeout(function () { el.classList.remove('mo-land'); void el.offsetWidth; el.classList.add('mo-land'); }, 350);
  });

  hookTabs();
  if (document.querySelector('.app .view')) pageIn();
  else {
    var first = new MutationObserver(function () {
      if (document.querySelector('.app .view')) { first.disconnect(); hookTabs(); pageIn(); }
    });
    first.observe(document.body, { childList: true, subtree: true });
  }
})();
