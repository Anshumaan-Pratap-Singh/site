/* Stacked fractions everywhere (27 Nov): any plain-text fraction like 3/4 or 27/35 that is not already typeset as maths
   is shown as numerator over denominator. Skips what you type (inputs, editors), code, maths and drawings, and
   school years such as 2026/27. Counts are written "3 of 10" in the apps, so they are not touched. */
(function () {
  var RE = /(^|[^\w.\/])(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)(?![\w\/%])/g, SKIP = "input,textarea,code,pre,script,style,svg,.katex,.sfrac,[contenteditable],[data-nofrac],.cm-editor";
  function fix(node) {
    var t = node.nodeValue; if (!t || t.indexOf("/") < 0) return;
    var p = node.parentElement; if (!p || p.closest(SKIP)) return;
    RE.lastIndex = 0; var m, last = 0, frag = null;
    while ((m = RE.exec(t))) {
      if (/^\d{4}$/.test(m[2]) && /^\d{2}$/.test(m[3])) continue;          /* 2026/27 */
      frag = frag || document.createDocumentFragment();
      var s = m.index + m[1].length;
      frag.appendChild(document.createTextNode(t.slice(last, s)));
      var f = document.createElement("span"); f.className = "sfrac"; f.setAttribute("role", "math"); f.setAttribute("aria-label", m[2] + " over " + m[3]);
      var a = document.createElement("span"), b = document.createElement("span"); a.textContent = m[2]; b.textContent = m[3]; f.appendChild(a); f.appendChild(b);
      frag.appendChild(f); last = m.index + m[0].length;
    }
    if (!frag) return;
    frag.appendChild(document.createTextNode(t.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  function scan(root) {
    if (root.nodeType === 3) return fix(root);
    if (root.nodeType !== 1 || root.closest(SKIP)) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [], n;
    while ((n = w.nextNode())) if (n.nodeValue.indexOf("/") >= 0) list.push(n);
    list.forEach(fix);
  }
  function start() {
    scan(document.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { if (m.type === "characterData") fix(m.target); else m.addedNodes.forEach(scan); }); })
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
