# AI Browser QA Engineer

Built by **LDS Team** · An LDS project · version **1.0.0**

Build a local browser-verification desk with **Chrome DevTools MCP**, then add a tightly scoped Gemini planner. Watch real browser actions, inspect screenshots and network/console evidence, and prove that the same checks fail before a fix and pass after it.

This LDS build-along ships with a deliberately broken and a corrected **practice app**. It does not connect to your personal Chrome profile or arbitrary websites. Scripted verification works without an API key. Optional Gemini suggests a plan from the known journeys; it does not discover arbitrary bugs or execute unrestricted commands.

## Run your downloaded project

Requirements: Node.js **22.13+**, Google Chrome **149+**, and npm. Internet is required once to install dependencies; browser verification then runs locally. Windows users may need to set `CHROME_PATH` in `.env.local`.

```bash
npm ci
npm run setup
npm start
```

Extract the starter or reference ZIP, open a terminal in its `browser-qa-agent` folder, and run those commands there. Open **http://localhost:3083** and keep the terminal running.

**Starter:** the interface opens, but the three functions in `learner/` are intentionally unfinished. Follow [the eight-step build guide](docs/BUILD.md); initial learner-test failures are expected. You do not need to generate another starter.

**Completed reference:** select all three checks and choose **Before the fix**, then **Run selected checks**. You should see three failed assertions. Choose **After the fix** and run again: all three should pass. Expand screenshots and inspect Network requests and Console messages. Download the complete JSON evidence report. Your starter can do the same after you complete its learner functions.

The practice app is at `http://localhost:3083/practice/`. It uses fictional learner details; it creates no accounts and sends no email.

## Build it yourself

The downloadable starter already includes the unfinished learner modules, focused tests, and completed checkpoints. Work in that extracted folder. The guide includes recovery commands that back up your work first.

If you downloaded the completed reference and would prefer a separate exercise folder, optionally create one:

```bash
npm run starter -- /absolute/path/to/browser-qa-starter
```

Use a new, empty location **outside the reference folder**. The generator copies only source, lesson files, and locked dependencies; never `.env.local`, `.data`, `node_modules`, or existing screenshots. In the generated folder, run the same installation and setup commands. Skip this optional generator when you already downloaded the starter ZIP.

## Optional AI planning

Set your own `GEMINI_API_KEY` in `.env.local`, restart, and expand **Let AI suggest a plan**. One click sends only the text you wrote to Google. It does not send screenshots or saved reports. Provider charges may apply; there are no automatic retries. Review the result, choose **Use this plan**, and explicitly run the selected checks. The planner can only select `signup`, `search`, or `menu`; every returned ID is validated.

The default model is `gemini-2.5-flash`; set `GEMINI_MODEL` to another compatible model available in your account if needed. Do not place keys in browser code, recordings, commits, or release files.

## Tests and evidence

```bash
npm test                    # Offline contracts, assertions and security tests
npm run test:integration    # With npm start already running: real MCP + Chrome
```

The integration check makes six real browser journeys and stores their evidence. It intentionally triggers a 503 signup response in the broken app. A red failed assertion is expected for this version; **Interrupted** means verification itself failed.

Reports and screenshots persist in `.data/runs/<run-id>/`. Keep them local. The app stops accepting new runs at 50 rather than silently deleting evidence. To start fresh, stop the server, move `.data/runs` to an archive folder outside the project, and restart. No personal browser profile is accessed.

## Ports and safety boundaries

The server binds to loopback only. `PORT` defaults to3083; changing it in `.env.local` moves the dashboard and practice app together. Open the printed address. Only one browser run can execute at a time. Each run has a 150-second deadline and a 65-call maximum; tools have 20-second timeouts.

Chrome DevTools MCP is pinned to1.10.1. It launches a fresh isolated, headless Chrome, disables JavaScript evaluation, turns off usage statistics/CrUX integration, and restricts browser requests to this server's `/practice/*` paths. Chrome149+ is required for that request restriction. HTTP mutations require same-origin JSON and a per-process token. MCP filesystem writes are restricted to the current run's directory. These are app safeguards, not an operating-system security sandbox for untrusted code.

## Useful files

- `learner/journey.mjs`: approved journey-selection contract.
- `learner/assertions.mjs`: evidence-based pass/fail decisions.
- `learner/report.mjs`: honest summary, including interrupted runs.
- `lib/runner.mjs`: genuine MCP client, browser actions and evidence capture.
- `lib/planner.mjs`: optional Gemini request and response validation.
- `ui/practice.js`: deliberately faulty and corrected practice handlers.
- `server.mjs`: loopback API, request protection, and saved-run handling.

## License and attribution

LDS source is Apache-2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). Third-party packages retain their own licenses. LDS marks are not an endorsement license. This is a local educational project, not an official Google product.

Official references: [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp), [tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md), [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output).
