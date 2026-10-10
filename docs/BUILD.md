# Build AI Browser QA Engineer

Allow roughly three hours. You should be comfortable reading JavaScript functions and running terminal commands. Download and extract the starter ZIP; you can keep the completed reference alongside it for comparison. Your code lives in three small modules; the surrounding app lets you observe the consequences immediately.

## 1. Meet the build

Watch the full workflow on the LDS introduction page. You can optionally try it in the completed reference: run `npm ci`, `npm run setup`, and `npm start` there, then open the printed address, normally `http://localhost:3083`. The starter reaches the same behavior after you complete its learner functions.

Select all three journeys. Keep **Before the fix** selected and click **Run selected checks**. Each check should fail for a different reason:

- Signup: the practice server returns HTTP503. The confirmation never appears.
- Search: the query is ignored. All three course titles remain.
- Mobile menu: clicking the button does not change the menu's hidden state.

Switch to **After the fix** and run again. These same assertions should pass. Inspect each tab, its real screenshot, Network requests, and Console messages. Choosing a corrected version is a teaching comparison; the app is not automatically rewriting source code.

**Checkpoint:** Explain the difference between an expected failed assertion and an interrupted verification. Name one observation that proves signup failed.

## 2. Start your own workspace

Extract the downloadable starter ZIP. Open a terminal inside its `browser-qa-agent` folder. If you opened the optional completed reference in step 1, stop its server with Ctrl+C first. In the extracted starter folder:

```bash
npm ci
npm run setup
npm start
```

Setup checks Chrome and creates `.env.local` without overwriting it. No key is required. If3083 is occupied, change `PORT=3085` in `.env.local`, restart, and open the printed port. Do not edit the reference while running the starter.

If you only downloaded the completed reference, you can optionally run `npm run starter -- /absolute/path/to/browser-qa-starter` from that reference directory. Choose a new folder outside it, then use the commands above in the generated folder. This generator is unnecessary for the downloaded starter ZIP.

Open `learner/`. The starter contains three deliberately unfinished functions. The UI opens, but a browser check will stop before launching Chrome until the journey contract exists. Run `npm test`: failures in the three learner modules are expected initially.

**Checkpoint:** Find `learner/journey.mjs`, `learner/assertions.mjs`, `learner/report.mjs`, and the corresponding `checkpoints/` implementations.

## 3. Define the journey boundary

Open `learner/journey.mjs`. The starter re-exports `JOURNEYS` from its completed checkpoint; an export-from statement does not create a local variable. Add `import { JOURNEYS } from '../checkpoints/journey.mjs'` to use the catalog inside your function. Implement `selectJourneys(ids)`:

1. Require an array containing one to three IDs.
2. Reject duplicate and unknown IDs. Use `Object.hasOwn(JOURNEYS, id)`, not the `in` operator; inherited names such as `__proto__` must fail.
3. Preserve the selected order.
4. Return `{ id, ...JOURNEYS[id] }` for each.

The actual catalog has three journeys: `signup`, `search`, `menu`. Each specifies viewport dimensions, browser actions, and an explicit final assertion. The menu runs at375×667.

```bash
npm run check:journey
```

Expected: two passing tests. Try `selectJourneys(['menu', 'signup'])` and an unknown ID. Both a human selection and a Gemini suggestion pass through this function.

Follow one selection into `lib/runner.mjs`: the client connects to the actual MCP server, opens only the local practice URL, takes an accessibility snapshot, locates a unique UID for a named element, then uses `fill` or `click`. It never lets model text become an arbitrary URL, script, or tool name.

**Checkpoint:** Explain why a bounded planner cannot supply `evaluate_script` or a production-site URL.

**Recovery:** `npm run restore -- journey` backs up your file to `.backups/` and installs the reference implementation. Restart the server after edits.

## 4. Decide pass or fail from evidence

Implement `checkAssertion(kind, snapshot)` in `learner/assertions.mjs`. Return `{ passed, expected, observed }`.

- Reject missing/non-string snapshots; real snapshots include `uid=`.
- Signup passes only when the exact text `Practice account created` is present.
- Search passes only when `SQL Fundamentals` is present and neither of the two unrelated course titles remains. Finding the desired result alone is insufficient.
- Menu passes only when the snapshot contains the accessible **link** `Browse courses`. A paragraph containing those words is not a navigation control.

Use `JSON.stringify(text)` to match complete quoted strings. Do not turn a successful click into a passing assertion.

```bash
npm run check:assertions
```

Expected: three passing tests, including false-positive cases. Read `lib/security.mjs` to understand why duplicate accessible labels interrupt a run instead of clicking an arbitrary element.

**Checkpoint:** Predict what happens if SQL is visible beside two unrelated courses. Your answer should be “fail.”

**Recovery:** `npm run restore -- assertions`.

## 5. Keep the report honest

Implement `summarizeRun(journeys)` in `learner/report.mjs`:

- An empty run is `error` with zero completed checks.
- Count journeys whose status is `passed`.
- If any journey has status `error`, the whole summary is `error`, even if another journey passed.
- Otherwise, all passed means `passed`; a failed assertion means `failed`.
- Return the count, total, and an accurate label.

```bash
npm run check:report
npm test
```

Expected: all tests pass, including the run-completion and persistence checks. In `lib/runner.mjs`, find `take_screenshot`, `list_network_requests`, and `list_console_messages`. Screenshots contain actual browser pixels; the report keeps MCP text and assertion observations. It does not invent a root cause from a screenshot alone.

**Checkpoint:** A browser crash after two passing checks must not become a successful three-check run.

**Recovery:** `npm run restore -- report`.

## 6. Reproduce, inspect, verify

Restart `npm start`, then run the broken version in the UI. Expand its screenshots. Inspect signup's HTTP503 and console message. Switch to the corrected version and rerun the same journeys.

With the server still running, use a second terminal in the same project:

```bash
npm run test:integration
```

If you changed the port, set `TEST_ORIGIN` in the terminal to that complete local origin before running. On macOS/Linux: `TEST_ORIGIN=http://127.0.0.1:3085 npm run test:integration`. On PowerShell: `$env:TEST_ORIGIN='http://127.0.0.1:3085'; npm run test:integration`.

This invokes the real Chrome DevTools MCP server and real isolated Chrome. Expect three failed journeys in `broken`, three passed in `fixed`, nonempty screenshot/network/console evidence, and a rejected cross-origin HTTP request.

Open `ui/practice.js` and compare the broken and fixed handlers. Describe the actual fix: filter the array using the query; update the menu's hidden state; return the confirmation on successful signup. The supplied code shows both variants so the same check can be demonstrated repeatedly.

**Checkpoint:** Download a report, reopen the app, and confirm saved runs are still available. A test covers its explicit assertions, not every possible behavior of the application.

## 7. Add a constrained AI planner

This step is optional for API usage, but read the provider code even if you skip the paid call. In `.env.local`, set your own `GEMINI_API_KEY`, restart, and expand **Let AI suggest a plan**. Do not put the key in `ui/`.

Enter: “Check signup and the mobile menu.” Click **Suggest with Gemini** once. Read the explanation, choose **Use this plan**, confirm the selected boxes, then explicitly run. Only your typed goal goes to Google. Screenshots and reports remain local.

Inspect `lib/planner.mjs`: a JSON schema limits the allowed IDs, `selectJourneys()` validates them again, the request has a25-second timeout and no automatic retry, and the response never counts as a completed test. The browser runner remains deterministic. This is constrained AI planning plus scripted verification, not an autonomous general-purpose tester.

**Checkpoint:** Explain what would happen if the model returned an unknown journey or a production URL: validation rejects it; no action executes.

## 8. Extend one behavior deliberately

Add a new fixture behavior, such as an empty search result. First write the expected observable outcome. Add a journey and assertion, then test a deliberately faulty version and the corrected version. Update the planner enum if you want AI to select that new journey, and review the fixed call/time budget.

Keep this first project confined to its practice app. Supporting a learner's own local app is a separate extension requiring target configuration, request restrictions, selector/label mapping, and explicit write permissions. Do not simply accept an arbitrary URL or model-generated JavaScript.

Before sharing code, confirm `.env.local`, `.data/`, `.backups/`, browser profiles, and `node_modules/` are excluded. Use the source-only packaging process rather than zipping your entire working directory.

**Final checkpoint:** You can trace an input goal → validated journey IDs → actual MCP actions → evidence → explicit assertions → honest report, and you can explain the boundary between the planner and verifier.

## Troubleshooting

- **Chrome not found:** install stable Chrome149+ or set an absolute `CHROME_PATH`, then rerun setup.
- **Connection times out:** ensure Chrome can start locally, use the pinned packages via `npm ci`, stop stale copies of this app, and rerun once. Do not disable the browser sandbox.
- **Unknown browser UID:** the target UI changed or labels are ambiguous. Inspect the snapshot in the JSON report and give the control a stable accessible name.
- **Interrupted / missing screenshot:** read the error and tool log. An unavailable MCP tool is not a failed application assertion.
- **Before version is all red:** expected. Inspect evidence, then compare After.
- **Gemini disabled or unavailable:** continue with manual journey selection; the complete verification workflow needs no key. Check provider access before spending another request.
- **Changes not visible:** restart the Node server, hard-refresh the browser, and confirm the terminal's working folder and port.
- **Saved run limit:** stop the server and move `.data/runs` to a private archive outside this project. Restart to create a new evidence directory.
