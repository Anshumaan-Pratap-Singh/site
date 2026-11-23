/* Trading Interview Practice: UI motion layer (23 Nov 2026).
   Adds motion without touching the React code:
   - top tabs: a pill that slides to the selected tab
   - page change (tab or sub-tab): content rises in
   - Firms > Tracker accordions and sections: slide open and closed
   - pop-ups (modals, theme menu, filter dropdowns): short exit instead of vanishing
   Filter chip transitions live in ui.css. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var EASE = 'cubic-bezier(.3,.7,.3,1)';

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

  /* ---------- page content rises in ---------- */
  function riseIn() {
    var app = document.querySelector('.app');
    if (!app) return;
    Array.prototype.forEach.call(app.children, function (el) {
      if (el.tagName === 'HEADER') return;
      el.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 280, easing: EASE });
    });
  }
  window.addEventListener('hashchange', function () { requestAnimationFrame(riseIn); });

  /* ---------- accordions slide open and closed ---------- */
  var BODY = '.trk-accp, .trk-fl, .trk2-body, .tip-sheet-grid';
  function slide(el, open, done) {
    var h = el.scrollHeight;
    el.style.overflow = 'hidden';
    var a = el.animate(open
      ? [{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }]
      : [{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: Math.min(380, 180 + h / 6), easing: EASE });
    a.onfinish = a.oncancel = function () { el.style.overflow = ''; if (done) done(); };
  }
  /* native <details> in the Tracker (by month view) */
  document.addEventListener('click', function (e) {
    var sum = e.target.closest && e.target.closest('details.trk-det > summary');
    if (!sum) return;
    var det = sum.parentNode;
    if (det.__anim) { e.preventDefault(); return; }
    var startH = det.offsetHeight;
    if (det.open) {
      e.preventDefault();
      det.__anim = true;
      det.style.overflow = 'hidden';
      var a = det.animate([{ height: startH + 'px' }, { height: sum.offsetHeight + 'px' }], { duration: 240, easing: EASE });
      a.onfinish = a.oncancel = function () { det.open = false; det.style.overflow = ''; det.__anim = false; };
    } else {
      e.preventDefault();
      det.open = true;
      var endH = det.offsetHeight;
      det.__anim = true;
      det.style.overflow = 'hidden';
      var b = det.animate([{ height: startH + 'px' }, { height: endH + 'px' }], { duration: 260, easing: EASE });
      b.onfinish = b.oncancel = function () { det.style.overflow = ''; det.__anim = false; };
    }
  }, true);

  /* ---------- pop-ups: exit animation ---------- */
  var POP = '.scrim, .theme-menu, .tf-pop, .oa-pop';
  function exitPop(node, parent, next) {
    try {
      if (next && next.parentNode === parent) parent.insertBefore(node, next); else parent.appendChild(node);
    } catch (_) { return; }
    node.style.pointerEvents = 'none';
    var inner = node.classList.contains('scrim') ? node.firstElementChild : null;
    if (inner) inner.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 160, easing: 'ease-in', fill: 'forwards' });
    var a = node.animate(inner
      ? [{ opacity: 1 }, { opacity: 0 }]
      : [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96) translateY(-4px)' }],
      { duration: 160, easing: 'ease-in', fill: 'forwards' });
    a.onfinish = a.oncancel = function () { if (node.parentNode) node.parentNode.removeChild(node); };
  }

  /* one observer for accordions (enter + exit), pop-up exits and new tab bars */
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.matches(BODY) && !n.__leaving) slide(n, true);
        if (n.matches('.tabs') || n.querySelector('.top .tabs')) hookTabs();
      });
      m.removedNodes.forEach(function (n) {
        if (n.nodeType !== 1 || n.__leaving || !m.target.isConnected) return;
        if (n.matches(BODY)) {
          n.__leaving = true;
          try {
            if (m.nextSibling && m.nextSibling.parentNode === m.target) m.target.insertBefore(n, m.nextSibling); else m.target.appendChild(n);
          } catch (_) { return; }
          n.style.pointerEvents = 'none';
          slide(n, false, function () { if (n.parentNode) n.parentNode.removeChild(n); });
        } else if (n.matches(POP)) {
          n.__leaving = true;
          exitPop(n, m.target, m.nextSibling);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  hookTabs();
  document.addEventListener('DOMContentLoaded', hookTabs);
  setTimeout(hookTabs, 500);
})();
