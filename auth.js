/* Sign-in screens and account menu (27 Nov), the same as the Maths Workbook's. Outside Claude (GitHub Pages, the
   Home Screen app, the Android app) an account is required; window.tipCloud (cloud.js) does the signing in and sync.
   Inside the Claude artifact this file does nothing. Backdrop: option C (order books, trade tape, candles, formulas
   in the KaTeX fonts the app already ships). */
(function () {
  if (window.claude || window.__tipNoGate) return;   /* __tipNoGate: the automated tests */
  const doc = document, H = (t, a, ...k) => { const e = doc.createElement(t); for (const n in a || {}) n === "class" ? e.className = a[n] : n.startsWith("on") ? e.addEventListener(n.slice(2), a[n]) : e.setAttribute(n, a[n]); k.flat().forEach(c => c != null && e.append(c.nodeType ? c : doc.createTextNode(c))); return e; };
  const html = s => { const t = doc.createElement("template"); t.innerHTML = s; return t.content; };
  doc.documentElement.classList.add("au-gate");   /* app hidden until signed in */

  const MSG = {
    "auth/invalid-credential": "Wrong email or password.", "auth/wrong-password": "Wrong email or password.", "auth/user-not-found": "No account with that email.",
    "auth/invalid-email": "That email doesn't look right.", "auth/email-already-in-use": "There's already an account with that email. Sign in instead.",
    "auth/weak-password": "Use at least 8 characters, including a number.", "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
    "auth/network-request-failed": "You're offline. Connect to the internet to sign in.", "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "",
    "auth/unauthorized-domain": "Google sign-in isn't set up for this address yet.", "auth/user-disabled": "This account has been turned off."
  };
  const msg = e => (e && e.code in MSG) ? MSG[e.code] : (e && e.message) || "Something went wrong. Try again.";
  const G = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.9 6.2C12.4 13.7 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>';
  const MS = '<span class="au-ms" aria-hidden="true"><i style="background:#f25022"></i><i style="background:#7fba00"></i><i style="background:#00a4ef"></i><i style="background:#ffb900"></i></span>';

  /* ---------- backdrop C, in the KaTeX fonts ---------- */
  const bb = c => '<b class="bb">' + c + '</b>';           /* blackboard bold E and P */
  const F = [bb("E") + "[P&amp;L]", bb("E") + "[X]", bb("P") + "(A | B)", "σ√<i>T</i>", "bid / ask", "Δ = ∂<i>V</i>/∂<i>S</i>", "Γ", "θ", "ν", "Var(<i>X</i>)",
    "<i>N</i>(<i>d</i><sub>1</sub>)", "<i>e</i><sup>−<i>rT</i></sup>", "<i>f</i>* = <i>p</i> − <i>q</i>/<i>b</i>", "edge × size", "fair = 10.5", "σ<sup>2</sup>", "ρ",
    "<i>C</i> − <i>P</i> = <i>S</i> − <i>Ke</i><sup>−<i>rT</i></sup>", "log(<i>S</i>/<i>K</i>)", "β", "√252", "<i>p</i>(1 − <i>p</i>)", "(<i>n</i> choose <i>k</i>)",
    bb("E") + "[<i>X</i><sup>2</sup>] − " + bb("E") + "[<i>X</i>]<sup>2</sup>", bb("P") + "(win) = 5/36", "1/6", "EV &gt; 0", "spread", "<i>d</i><sub>1</sub>", "μ ± 2σ"];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)];
  function backdrop() {
    seed = 7;
    let s = "";
    for (let i = 0; i < 85; i++) s += `<span class="tx" style="left:${(rnd() * 104 - 4).toFixed(1)}%;top:${(rnd() * 100 - 2).toFixed(1)}%;font-size:${pick([14, 18, 22, 28, 36, 44])}px;opacity:${pick([.08, .12, .16, .22])}">${pick(F)}</span>`;
    const book = (x, y, o) => { let b = `<div class="ob" style="left:${x}%;top:${y}%;opacity:${o}">`; for (let i = 6; i > 0; i--) b += `<div class="a">${(100.5 + i * .5).toFixed(2)}&nbsp;&nbsp;${String(1 + Math.floor(rnd() * 39)).padStart(3, " ")}</div>`; b += '<hr>'; for (let i = 0; i < 6; i++) b += `<div class="b">${(100.5 - i * .5).toFixed(2)}&nbsp;&nbsp;${String(1 + Math.floor(rnd() * 39)).padStart(3, " ")}</div>`; return b + "</div>"; };
    const tape = (x, y, o) => { let t = `<div class="ob" style="left:${x}%;top:${y}%;opacity:${o}">`; for (let i = 0; i < 8; i++) { const buy = rnd() < .5; t += `<div class="${buy ? "b" : "a"}">${buy ? "BUY&nbsp;" : "SELL"} ${String(1 + Math.floor(rnd() * 19)).padStart(2, " ")} @ ${(100 + rnd() * 4 - 2).toFixed(2)}</div>`; } return t + "</div>"; };
    const candles = (x, y, w, h, n, o) => { let c = `<svg class="cd" style="left:${x}%;top:${y}%" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`, p = h / 2; const cw = w / n;
      for (let i = 0; i < n; i++) { const a = p, z = Math.max(h * .15, Math.min(h * .85, p + (rnd() + rnd() + rnd() - 1.5) * h * .1)), hi = Math.min(a, z) - 2 - rnd() * h * .06, lo = Math.max(a, z) + 2 + rnd() * h * .06, col = z < a ? "#3ecf8e" : "#ff6b6b", cx = i * cw + cw / 2; p = z;
        c += `<line x1="${cx}" x2="${cx}" y1="${hi}" y2="${lo}" stroke="${col}" stroke-width="1.5" opacity="${o}"/><rect x="${cx - cw * .3}" y="${Math.min(a, z)}" width="${cw * .6}" height="${Math.max(2, Math.abs(z - a))}" fill="${col}" opacity="${o}"/>`; }
      return c + "</svg>"; };
    s += book(3, 4, .13) + book(16, 47, .13) + tape(3, 52, .13) + book(88, 5, .13) + tape(75, 7, .13) + tape(74, 52, .13) + book(88, 56, .13) + candles(69, 31, 400, 150, 24, .1);
    return s;
  }

  /* LaTeX look for the backdrop (27 Nov): single letters in KaTeX math italic, words (log, Var, bid), digits, brackets
     and operators upright in KaTeX roman, as LaTeX sets them; x^{..} and x_{..} become raised and lowered text */
  function texify(root) {
    const walk = n => {
      for (const c of [...n.childNodes]) {
        if (c.nodeType === 1) { if (!c.classList.contains("bb") && c.tagName !== "I") walk(c); continue; }
        if (c.nodeType !== 3 || !c.textContent) continue;
        let t = c.textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        t = t.replace(/\^\{([^}]*)\}/g, "\u0001sup\u0002$1\u0001/sup\u0002").replace(/_\{([^}]*)\}/g, "\u0001sub\u0002$1\u0001/sub\u0002");
        t = t.replace(/[A-Za-z]{2,}|[A-Za-zα-ωϕϑϵ]/g, m => m.length > 1 ? m : "\u0001i\u0002" + m + "\u0001/i\u0002");
        const s = document.createElement("span"); s.innerHTML = t.replace(/\u0001/g, "<").replace(/\u0002/g, ">");
        c.replaceWith(...s.childNodes);
      }
    };
    walk(root);
  }

  /* ---------- screens ---------- */
  let root = null, mode = "login", busy = false, err = "", info = "", form = { name: "", email: "", pw: "" }, show = false;
  const C = () => window.tipCloud;
  function field(label, type, key, auto) {
    const inp = H("input", { type: type === "password" && show ? "text" : type, autocomplete: auto, autocapitalize: "none", spellcheck: "false", oninput: e => { form[key] = e.target.value; if (mode === "create" && key === "pw") rules(); } });
    inp.value = form[key];
    return H("label", { class: "au-f" }, H("span", null, label), H("span", { class: "au-inp" }, inp,
      type === "password" ? H("button", { type: "button", class: "au-eye", onclick: () => { show = !show; draw(); } }, show ? "Hide" : "Show") : null));
  }
  function rules() {
    const r = root.querySelectorAll(".au-rule"); if (!r.length) return;
    const ok = form.pw.length >= 8, num = /\d/.test(form.pw);
    r[0].className = "au-rule" + (ok ? " ok" : ""); r[0].textContent = (ok ? "✓" : "○") + " At least 8 characters";
    r[1].className = "au-rule" + (num ? " ok" : ""); r[1].textContent = (num ? "✓" : "○") + " Includes a number";
  }
  const go = m => { mode = m; err = ""; info = ""; draw(); };
  async function run(f) { err = ""; info = ""; busy = true; draw(); try { await f(); } catch (e) { err = msg(e); } busy = false; draw(); }
  function sso(verb) {
    const g = H("button", { type: "button", class: "au-sso", onclick: () => run(() => C().google()) }); g.append(html(G), verb + " with Google"); if (busy) g.disabled = true;
    const m = H("button", { type: "button", class: "au-sso", onclick: () => { info = "Microsoft sign-in is coming soon. Use Google or email for now."; err = ""; draw(); } }); m.append(html(MS), verb + " with Microsoft");
    return [g, m, H("div", { class: "au-or" }, "or with email")];
  }
  const note = () => [err ? H("div", { class: "au-err", role: "alert" }, err) : null, info ? H("div", { class: "au-note" }, info) : null];
  const pri = (t, bt) => { const b = H("button", { class: "au-pri" }, busy ? bt : t); if (busy) b.disabled = true; return b; };
  function body() {
    const u = C().user;
    if (mode === "login") return H("form", { onsubmit: e => { e.preventDefault(); if (!form.email || !form.pw) { err = "Enter your email and password."; return draw(); } run(() => C().signIn(form.email, form.pw)); } },
      H("h2", null, "Sign in"), H("p", { class: "au-sub" }, "Welcome back. Pick up where you left off."), sso("Continue"),
      field("Email", "email", "email", "email"), field("Password", "password", "pw", "current-password"), note(), pri("Sign in", "Signing in…"),
      H("div", { class: "au-links" }, H("button", { type: "button", onclick: () => go("forgot") }, "Forgot password?"), H("button", { type: "button", onclick: () => go("create") }, "Create account")));
    if (mode === "create") {
      const f = H("form", { onsubmit: e => { e.preventDefault();
          if (!form.name.trim() || !form.email.trim()) { err = "Enter your name and email."; return draw(); }
          if (form.pw.length < 8 || !/\d/.test(form.pw)) { err = "Use at least 8 characters, including a number."; return draw(); }
          run(() => C().signUp(form.name, form.email, form.pw)); } },
        H("h2", null, "Create your account"), H("p", { class: "au-sub" }, "Save your progress and use it on any device."), sso("Sign up"),
        field("Name", "text", "name", "name"), field("Email", "email", "email", "email"), field("Password", "password", "pw", "new-password"),
        H("div", { class: "au-rule" }), H("div", { class: "au-rule", style: "margin-bottom:14px" }), note(), pri("Create account", "Creating…"),
        H("p", { class: "au-center" }, "Already have an account? ", H("button", { type: "button", onclick: () => go("login") }, "Sign in")));
      return f;
    }
    if (mode === "forgot") return H("form", { onsubmit: e => { e.preventDefault(); if (!form.email.trim()) { err = "Enter your account email."; return draw(); } run(async () => { await C().resetPassword(form.email); info = "If there's an account for that email, a reset link is on its way. Check spam too."; }); } },
      H("h2", null, "Reset your password"), H("p", { class: "au-sub" }, "Enter your account email and we'll send you a link to choose a new password."),
      field("Email", "email", "email", "email"), note(), pri("Send reset link", "Sending…"),
      H("div", { class: "au-note" }, "Signed up with Google or Microsoft? You don't have a password here. Use those buttons on the sign-in screen instead."),
      H("p", { class: "au-center" }, H("button", { type: "button", onclick: () => go("login") }, "Back to sign in")));
    const em = (u && u.email) || form.email, cont = pri("I've verified, continue", "Checking…"), again = H("button", { class: "au-sec" }, "Resend email");
    cont.onclick = () => run(async () => { if (await C().checkVerified()) location.reload(); else err = "Not verified yet. Open the link in the email first."; });
    again.onclick = () => run(async () => { await C().resendVerification(); info = "Sent again. Check spam too."; }); if (busy) again.disabled = true;
    return H("div", null, H("h2", null, "Check your email"), H("p", { class: "au-sub" }, "We sent a verification link to ", H("b", null, em), ". Open it on any device, then come back here."),
      note(), cont, again, H("p", { class: "au-center" }, "Can't find it? Check spam, or ", H("button", { type: "button", onclick: () => C().signOut().then(() => go("create")) }, "use a different email"), "."));
  }
  function draw() {
    if (!root) { root = H("div", { class: "au" }); root.append(H("div", { class: "au-bg", "aria-hidden": "true" })); root.firstChild.innerHTML = backdrop(); root.firstChild.querySelectorAll(".tx").forEach(texify); root.append(H("main", { class: "au-main" })); doc.body.append(root); }
    const focus = doc.activeElement && root.contains(doc.activeElement) ? [...root.querySelectorAll("input")].indexOf(doc.activeElement) : -1;
    const card = H("div", { class: "au-card" + (mode === "create" ? " au-compact" : "") },
      H("div", { class: "au-top" }, H("img", { class: "au-logo", src: "icons/icon-192.png", alt: "", width: 64, height: 64 }), H("b", null, "Trading Interview Practice")), body());
    root.lastChild.replaceChildren(card); rules();
    if (focus >= 0) { const i = root.querySelectorAll("input")[focus]; if (i) { i.focus(); i.setSelectionRange && i.type !== "email" && i.setSelectionRange(i.value.length, i.value.length); } }
  }
  function splash() { root = H("div", { class: "au-splash" }, H("img", { class: "au-logo-s", src: "icons/icon-192.png", alt: "" })); doc.body.append(root); }
  function open() { doc.documentElement.classList.remove("au-gate"); if (root) { root.remove(); root = null; } accountBtn(); }

  /* ---------- account menu, the initial in the header ---------- */
  function accountBtn() {
    const put = () => {
      const top = doc.querySelector(".top .theme-dd:not(.au-acc)"); if (!top || doc.querySelector(".au-acc")) return;
      const u = C().user; if (!u) return;
      const ini = ((u.displayName || u.email || "?").trim()[0] || "?").toUpperCase(), pw = u.providerData.some(p => p.providerId === "password");
      const wrap = H("div", { class: "theme-dd au-acc" }), btn = H("button", { class: "au-av", "aria-label": "Account", "aria-haspopup": "menu", "aria-expanded": "false" }, ini);
      let menu = null;
      const close = () => { if (menu) { menu.remove(); menu = null; btn.setAttribute("aria-expanded", "false"); } };
      btn.onclick = () => {
        if (menu) return close();
        const inf = H("div", { class: "au-minfo" });
        menu = H("div", { class: "theme-menu au-menu", role: "menu" }, H("div", { class: "au-who" }, H("b", null, u.displayName || "Your account"), H("span", null, u.email)),
          pw ? H("button", { type: "button", class: "theme-opt", onclick: () => C().resetPassword(u.email).then(() => inf.textContent = "Password reset link sent to your email.").catch(e => inf.textContent = msg(e)) }, H("span", null, "Change password")) : null,
          inf, H("button", { type: "button", class: "theme-opt", onclick: () => { close(); C().signOut(); } }, H("span", null, "Sign out")));
        wrap.append(menu); btn.setAttribute("aria-expanded", "true");
      };
      doc.addEventListener("pointerdown", e => { if (!(e.target.closest && e.target.closest(".au-acc"))) close(); });
      doc.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
      wrap.append(btn); top.after(wrap);
    };
    put(); new MutationObserver(put).observe(doc.getElementById("root") || doc.body, { childList: true, subtree: true });
  }

  /* ---------- gate ---------- */
  function start() {
    if (!C()) { open(); return; }               /* cloud.js failed to load (offline first visit): keep the device-only app */
    splash();
    C().ready().then(() => {
      if (root) { root.remove(); root = null; }
      if (C().on) return open();
      if (C().needsVerify()) mode = "verify";
      draw();
      C().onChange(() => { if (C().on) location.reload(); else if (C().needsVerify()) { if (mode !== "verify") go("verify"); } });
    });
  }
  doc.readyState === "loading" ? doc.addEventListener("DOMContentLoaded", start) : start();
})();
