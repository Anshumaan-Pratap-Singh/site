# Tradermath: question pack format

Artifact: https://claude.ai/artifact/UUx8zPYjNSyUsGsGBxeTRv
To import a pack, use **Load Question Pack** in the app (paste the JSON or upload a .json file). Questions are matched by `id`, so duplicates are skipped.

## tradingQuestions[]
Required: `id`, `title`, `prompt`, `answer`, `solution`
- `source`: Heard on the Street | Green Book | Fifty Challenging Problems | Blitzstein & Hwang | Putnam | AMC / AIME | WSO
- `topic`: Probability | Statistics | Math | Brainteasers | Market Making / EV
- `difficulty`: Easy | Medium | Hard
- `answer`: `{ "value": number, "display": "LaTeX", "tolerance": number }`. Leave out `value` for proof or strategy questions.
- `hints`: list of strings, shown one at a time
- `solution`: list of steps, each one rendered with LaTeX
- LaTeX: inline `$...$`, display `$$...$$`. Backslashes must be escaped in JSON (`"\\frac{1}{2}"`).

## codingQuestions[]
Required: `id`, `title`, `prompt`, and `python.solution` or `cpp.solution`
- `topic`: Order Books | Concurrency | Probability Simulation | Dynamic Programming | Data Structures | Low-Latency Systems
- Optional: `difficulty`, `constraints`, `hints[]`, `samples[{input, output}]`, `complexity{time, space}`, `editorial`
- `python`: `{ kind: "function" | "class", entry, starter, solution, tests, check?: "exact" | "approx" | "unordered", tol? }`
  - function tests: `{ "args": [...], "expected": ..., "hidden"?: true }`
  - class tests: `{ "ctor": [...], "ops": [["method", arg, ...], ...], "expected": [r1, ...] }`
- `cpp`: `{ starter, solution }`. Both should be full programs whose `main()` prints PASS/FAIL, so they run as-is in Compiler Explorer.

## Example request to Claude
"Make a Tradermath pack of 30 Medium/Hard Green Book probability questions in the pack format, each with 2–4 hints, a numeric answer where possible, and a full step-by-step LaTeX solution."
