/* Trading Interview Practice: compile and run C++ in the browser.
   Clang/LLD from @yowasp/clang (WebAssembly), target wasm32-wasip1, run with a small WASI shim.
   Runs in a module worker so the page stays responsive and a runaway program can be stopped. */
import { runClang } from "./bundle.js";

const BITS = `#pragma once
#include <algorithm>
#include <array>
#include <atomic>
#include <bitset>
#include <cassert>
#include <cctype>
#include <chrono>
#include <climits>
#include <cmath>
#include <complex>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <deque>
#include <functional>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <limits>
#include <list>
#include <map>
#include <memory>
#include <numeric>
#include <optional>
#include <queue>
#include <random>
#include <set>
#include <sstream>
#include <stack>
#include <string>
#include <string_view>
#include <tuple>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <variant>
#include <vector>
`;

const dec = new TextDecoder();
let prev = 0;
globalThis.__tipClangProgress = (done, total) => {
  if (done - prev < 262144 && done < total) return;
  prev = done;
  postMessage({ t: "fetch", done, total });
};

/* minimal WASI preview1: stdout/stderr, clocks, random, args/env; everything else reports ENOSYS */
function wasi(mem, out) {
  const view = () => new DataView(mem().buffer);
  const bytes = () => new Uint8Array(mem().buffer);
  class Exit { constructor(code) { this.code = code; } }
  const imp = {
    fd_write(fd, iovs, n, nwritten) {
      let total = 0; const v = view();
      for (let i = 0; i < n; i++) {
        const p = v.getUint32(iovs + i * 8, true), len = v.getUint32(iovs + i * 8 + 4, true);
        const chunk = bytes().slice(p, p + len);
        if (fd === 1 || fd === 2) out(fd, chunk);
        total += len;
      }
      v.setUint32(nwritten, total, true); return 0;
    },
    fd_read(fd, iovs, n, nread) { view().setUint32(nread, 0, true); return 0; },
    fd_close() { return 0; },
    fd_seek() { return 70; },
    fd_fdstat_get(fd, buf) { const v = view(); v.setUint8(buf, fd <= 2 ? 2 : 0); v.setUint16(buf + 2, 0, true); v.setBigUint64(buf + 8, 0n, true); v.setBigUint64(buf + 16, 0n, true); return fd <= 2 ? 0 : 8; },
    fd_prestat_get() { return 8; },
    fd_prestat_dir_name() { return 8; },
    environ_sizes_get(c, s) { const v = view(); v.setUint32(c, 0, true); v.setUint32(s, 0, true); return 0; },
    environ_get() { return 0; },
    args_sizes_get(c, s) { const v = view(); v.setUint32(c, 1, true); v.setUint32(s, 5, true); return 0; },
    args_get(argv, buf) { const v = view(); v.setUint32(argv, buf, true); bytes().set([109, 97, 105, 110, 0], buf); return 0; },
    clock_time_get(id, prec, ptr) { const ns = BigInt(Math.round((id === 0 ? Date.now() : performance.now()) * 1e6)); view().setBigUint64(ptr, ns, true); return 0; },
    clock_res_get(id, ptr) { view().setBigUint64(ptr, 1000n, true); return 0; },
    random_get(p, len) { const b = new Uint8Array(len); for (let i = 0; i < len; i += 65536) crypto.getRandomValues(b.subarray(i, Math.min(len, i + 65536))); bytes().set(b, p); return 0; },
    sched_yield() { return 0; },
    poll_oneoff() { return 52; },
    proc_exit(code) { throw new Exit(code); },
  };
  const shim = new Proxy(imp, { get: (o, k) => (k in o ? o[k] : () => 52) });
  return { shim, Exit };
}

/* one job at a time: a run that arrives while the compiler is still downloading waits for it */
let chain = Promise.resolve();
self.onmessage = (ev) => { chain = chain.then(() => handle(ev)); };
async function handle(ev) {
  const { code, warm } = ev.data;
  try {
    if (warm) { try { await runClang(["clang++", "--version"], {}, { stdout: () => {}, stderr: () => {} }); } catch (e) {} postMessage({ t: "ready" }); return; }
    postMessage({ t: "compile" });
    const t0 = performance.now();
    let log = "";
    const keep = (b) => { if (b) log += dec.decode(b, { stream: true }); };
    let files;
    try {
      files = await runClang(["clang++", "-std=c++20", "-O2", "-fno-exceptions", "-Wno-unused-command-line-argument", "-I", "inc", "main.cc", "-o", "a.wasm"],
        { "main.cc": code, inc: { bits: { "stdc++.h": BITS } } }, { stdout: keep, stderr: keep });
    } catch (e) {
      postMessage({ t: "done", compile_error: (log || String(e.message || e)).replace(/\/tmp\/main-[0-9a-f]+\.o: /g, ""), compileMs: Math.round(performance.now() - t0) });
      return;
    }
    const compileMs = Math.round(performance.now() - t0);
    postMessage({ t: "run", compileMs });
    let stdout = "", stderr = "", inst = null;
    const { shim, Exit } = wasi(() => inst.exports.memory, (fd, b) => { if (fd === 1) stdout += dec.decode(b); else stderr += dec.decode(b); });
    const mod = await WebAssembly.compile(files["a.wasm"]);
    inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: shim });
    const t1 = performance.now();
    let exit = 0;
    try { inst.exports._start(); } catch (e) {
      if (e instanceof Exit) exit = e.code;
      else { stderr += (stderr ? "\n" : "") + "Runtime error: " + (e && e.message || e); exit = 134; }
    }
    postMessage({ t: "done", stdout, stderr, exit, compileMs, runMs: Math.round(performance.now() - t1) });
  } catch (e) {
    postMessage({ t: "done", fatal: String(e && e.message || e) });
  }
}
