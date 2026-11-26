/* Tradermath: game animation layer.
   Watches the game screens and adds motion without changing game logic:
   number ticks + flashes, countdown rings, order-book fills, results count-up
   and a personal-best badge. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var written = new WeakMap();   // text node -> last value this script wrote
  var timerMax = new WeakMap();  // timer element -> largest seconds seen
  var ticking = new WeakMap();   // text node -> animation frame id

  /* ---------- number parsing / formatting ---------- */
  var NUM = /^([^\d]*?)(\d[\d,]*(?:\.\d+)?)([^\d]*)$/;
  function parse(s) {
    if (s == null) return null;
    s = String(s).trim();
    if (!s || s.indexOf('±') >= 0) return null;
    var m = s.match(NUM);
    if (!m) return null;
    var pre = m[1], core = pre.replace(/[+\-−]/g, '');
    if (/[^$£%x\s]/.test(core)) return null;
    var neg = /[\-−]/.test(pre);
    var dec = (m[2].split('.')[1] || '').length;
    var v = parseFloat(m[2].replace(/,/g, ''));
    if (!isFinite(v)) return null;
    return {
      v: neg ? -v : v, dec: dec, core: core, suf: m[3],
      plus: pre.indexOf('+') >= 0, minus: pre.indexOf('-') >= 0 ? '-' : '−',
      comma: m[2].indexOf(',') >= 0 || Math.abs(v) >= 1000
    };
  }
  function fmt(v, t) {
    var a = Math.abs(v);
    var s = t.comma
      ? a.toLocaleString('en-GB', { minimumFractionDigits: t.dec, maximumFractionDigits: t.dec })
      : a.toFixed(t.dec);
    var zero = parseFloat(s.replace(/,/g, '')) === 0;
    var sign = zero ? '' : v < 0 ? t.minus : t.plus ? '+' : '';
    return sign + t.core + s + t.suf;
  }

  function onlyText(el) {
    return el && el.childNodes.length === 1 && el.firstChild.nodeType === 3 ? el.firstChild : null;
  }

  function restartClass(el, add, remove) {
    if (remove) el.classList.remove(remove);
    el.classList.remove(add);
    void el.offsetWidth;
    el.classList.add(add);
    clearTimeout(el.__tmT);
    el.__tmT = setTimeout(function () { el.classList.remove(add); }, 1200);
  }

  function tick(node, from, to, dur) {
    var t = parse(to);
    if (!t || reduce) return;
    var f = typeof from === 'number' ? from : (parse(from) || {}).v;
    if (f == null || f === t.v) return;
    cancelAnimationFrame(ticking.get(node));
    var start = performance.now();
    function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var out = p >= 1 ? to : fmt(f + (t.v - f) * e, t);
      written.set(node, out);
      node.nodeValue = out;
      if (p < 1) ticking.set(node, requestAnimationFrame(step));
    }
    ticking.set(node, requestAnimationFrame(step));
  }

  /* ---------- metrics ---------- */
  function metricChanged(b, oldText) {
    var node = onlyText(b);
    if (!node) return;
    var now = node.nodeValue;
    var a = parse(oldText), c = parse(now);
    if (!a || !c || a.v === c.v) return;
    var metric = b.closest('.metric');
    if (metric) restartClass(metric, c.v > a.v ? 'tm-up' : 'tm-down', c.v > a.v ? 'tm-down' : 'tm-up');
    tick(node, a.v, now, 450);
  }

  /* ---------- table cells ---------- */
  function cellChanged(td, oldText) {
    var a = parse((oldText || '').split(/\s/)[0]), c = parse((td.textContent || '').split(/\s/)[0]);
    if (!a || !c || a.v === c.v) return;
    restartClass(td, c.v > a.v ? 'tm-up' : 'tm-down', c.v > a.v ? 'tm-down' : 'tm-up');
  }

  /* ---------- HUD: big clock + progress bar + score ---------- */
  function hudFor(el) { var v = el.closest('.playing-view'); return v ? v : null; }
  function updateTimer(el) {
    var m = (el.textContent || '').match(/(\d+(?:\.\d+)?)/);
    if (!m) return;
    var s = parseFloat(m[1]);
    var max = timerMax.get(el) || 0;
    var reset = false;
    if (s > max + 0.15) { max = s; timerMax.set(el, max); reset = true; }
    var view = hudFor(el);
    if (!view) return;
    var clock = view.querySelector('.tm-clock'), bar = view.querySelector('.tm-bar');
    var low = s > 0 && s <= 5 && max > 6;
    if (clock) {
      var txt = s >= 60 ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : (el.textContent || '').trim();
      if (clock.textContent !== txt) clock.textContent = txt;
      clock.classList.toggle('low', low);
    }
    if (bar) {
      var fill = bar.firstElementChild;
      if (!fill) { fill = document.createElement('div'); fill.className = 'bar-fill'; bar.appendChild(fill); }
      bar.classList.add('on');
      if (reset) { fill.style.transition = 'none'; fill.style.width = '100%'; void fill.offsetWidth; fill.style.transition = ''; }
      fill.style.width = (max ? Math.max(0, Math.min(1, s / max)) * 100 : 100).toFixed(2) + '%';
      bar.classList.toggle('low', low);
    }
  }
  var SCORE_RX = [/P&L/i, /locked profit/i, /score|points/i, /bankroll|balance|wealth/i, /edge/i];
  function updateScore(view) {
    var slot = view.querySelector('.tm-score');
    if (!slot) return;
    var clock = view.querySelector('.tm-clock'), tbar = view.querySelector('.tm-bar');
    if (!view.querySelector('.timer') || view.querySelector('.game-over')) {
      if (clock && clock.textContent) clock.textContent = '';
      if (tbar) tbar.classList.remove('on');
    }
    var metrics = Array.prototype.slice.call(view.querySelectorAll('.metric'));
    if (view.querySelector('.game-over')) { slot.style.visibility = 'hidden'; return; }
    var pick = null, label = '';
    for (var i = 0; i < SCORE_RX.length && !pick; i++) {
      for (var j = 0; j < metrics.length; j++) {
        var l = metrics[j].firstElementChild && metrics[j].firstElementChild.textContent || '';
        if (SCORE_RX[i].test(l)) { pick = metrics[j]; label = /P&L/i.test(l) ? 'P&L' : l; break; }
      }
    }
    if (!pick) { slot.style.visibility = 'hidden'; return; }
    slot.style.visibility = '';
    var b = pick.querySelector('b');
    var val = b ? b.textContent : '';
    var cls = b ? b.className : '';
    if (!slot.firstChild) slot.innerHTML = '<div class="score-lbl"></div><div class="score"></div>';
    var L = slot.firstChild, V = slot.lastChild;
    if (L.textContent !== label) L.textContent = label;
    if (V.textContent !== val) V.textContent = val;
    V.className = 'score ' + cls;
  }
  var scoreQueued = false;
  function queueScore() {
    if (scoreQueued) return; scoreQueued = true;
    requestAnimationFrame(function () { scoreQueued = false; document.querySelectorAll('.playing-view').forEach(updateScore); });
  }

  /* ---------- results ---------- */
  function resultsShown(card) {
    if (card.__tmDone) return;
    card.__tmDone = true;
    var big = card.querySelector('.big');
    var node = onlyText(big);
    if (node) {
      var final = node.nodeValue, t = parse(final);
      if (t && t.v !== 0 && !reduce) { written.set(node, fmt(0, t)); node.nodeValue = fmt(0, t); setTimeout(function () { tick(node, 0, final, 900); }, 250); }
    }
    card.querySelectorAll('.stat-v').forEach(function (b) {
      var n = onlyText(b), v = n && n.nodeValue, t = parse(v);
      if (t && t.v !== 0 && !reduce) { written.set(n, fmt(0, t)); n.nodeValue = fmt(0, t); setTimeout(function () { tick(n, 0, v, 700); }, 300); }
    });
    // personal best: the wrapper records the previous best just before saving
    setTimeout(function () {
      var f = window.__tmFinish;
      if (!f || !f.res || !card.isConnected) return;
      var val = f.metric === 'pnl' ? f.res.pnl : f.res.score;
      if (typeof val === 'number' && typeof f.prev === 'number' && val > f.prev) {
        var row = card.querySelector('.tm-pb-slot');
        if (row && !row.querySelector('.tm-pb')) {
          var b = document.createElement('span');
          b.className = 'tm-pb';
          b.textContent = '★ New best';
          row.appendChild(b);
        }
      }
      window.__tmFinish = null;
    }, 200);
  }

  /* ---------- scanning ---------- */
  function markViews(root) {
    (root.querySelectorAll ? root.querySelectorAll('.view') : []).forEach(function (v) {
      var h2 = v.querySelector(':scope > .sec-h h2');
      v.classList.toggle('tm-games', !!(h2 && /Market Games/.test(h2.textContent)));
    });
  }
  function scan(el) {
    if (el.nodeType !== 1) return;
    if (el.matches('.timer')) updateTimer(el);
    el.querySelectorAll('.timer').forEach(updateTimer);
    if (el.matches('.game-over')) resultsShown(el);
    el.querySelectorAll('.game-over').forEach(resultsShown);
  }

  var obs = new MutationObserver(function (list) {
    var structural = false;
    list.forEach(function (m) {
      if (m.type === 'childList' && m.addedNodes.length) structural = true;
      var target = m.target;
      if (m.type === 'characterData') {
        if (written.get(target) === target.nodeValue) return;
        var el = target.parentElement;
        if (!el) return;
        var timer = el.closest('.timer');
        if (timer) { updateTimer(timer); return; }
        if (el.matches('.metric b')) { metricChanged(el, m.oldValue); return; }
        var td = el.closest('.game-view .tbl td');
        if (td) cellChanged(td, m.oldValue);
        return;
      }
      // childList
      if (target.nodeType === 1) {
        var t2 = target.closest('.timer');
        if (t2) updateTimer(t2);
        if (target.matches('.metric b') && m.removedNodes.length && m.addedNodes.length) {
          var old = m.removedNodes[0].nodeValue;
          var node = onlyText(target);
          if (node && written.get(node) !== node.nodeValue) metricChanged(target, old);
        }
        var td2 = target.closest('.game-view .tbl td');
        if (td2 && m.removedNodes.length) {
          var oldTxt = Array.prototype.map.call(m.removedNodes, function (n) { return n.textContent; }).join('');
          cellChanged(td2, oldTxt);
        }
      }
      m.addedNodes.forEach(scan);
    });
    if (structural) markViews(document);
    queueScore();
  });

  /* fills: sweep the row whose trade button was pressed */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.game-view .tbl button');
    if (!btn || btn.disabled) return;
    var tr = btn.closest('tr');
    var buy = /buy|lift/i.test(btn.textContent);
    if (tr) restartClass(tr, buy ? 'tm-buy' : 'tm-sell', buy ? 'tm-sell' : 'tm-buy');
  }, true);

  function start() {
    var root = document.getElementById('root') || document.body;
    obs.observe(root, { childList: true, subtree: true, characterData: true, characterDataOldValue: true });
    markViews(document);
    scan(root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
