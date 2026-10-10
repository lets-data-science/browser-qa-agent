# Local verification record

## Release recheck · October 10, 2026

All 12 offline tests pass, including two new regressions that keep completion pending until Chrome cleanup and report persistence finish. A real MCP run again produced three failures before the supplied fix and three passes afterward; cross-origin requests were rejected. Fresh reference and restored starter packages pass. One live Gemini request returned the requested search and menu journeys. The complete eight-step guide passed desktop/mobile checks, and all three step recordings expanded and played with captions. The reviewed continuous narrated walkthrough was retained; no new speech was generated during this recheck. No public repository or website deployment was performed.

## Original implementation checks

Verified on October3,2026, using Node23.7.0, Google Chrome154.0.8037.95, chrome-devtools-mcp1.10.1 and MCP SDK1.32.0.

- Ten offline tests passed: journey validation, exact assertions/false positives, report failures, origin/token checks, target validation and unique accessibility labels.
- Real MCP integration ran all three journeys against each practice version. Broken: signup, search and mobile menu each failed their expected assertion. Fixed: all three passed.
- Integration produced nine genuine Chrome screenshots per version plus network/console evidence. The deliberately broken signup returned503; the corrected handler displayed the expected confirmation.
- An untrusted-origin POST was rejected with403.
- Desktop1440×900, tablet768×1024, mobile375×667: no horizontal document overflow and no uncaught browser errors after reload. Screenshots inspected visually.
- One live Gemini planning request, using the already authorized local key, returned the expected bounded signup/menu plan. No screenshots or reports were sent. The shipped reference has no key and keeps AI planning optional.
- Source-only starter and reference ZIPs were extracted into fresh folders. Starter tests failed at the intended learner TODOs; restoring all three checkpoints passed all ten tests. The fresh reference passed all ten. Archive entries excluded credentials, evidence, dependencies and browser profiles.
- npm audit reported zero known vulnerabilities in the pinned production dependencies at verification time.
- A real 1440×900 browser recording captures both runs and evidence inspection. The overview and three silent step clips have action captions; no speech was generated.

Limits: the assertions verify known practice flows and accessible content. They do not certify visual fidelity, discover arbitrary bugs, or support arbitrary websites. The optional planner chooses known checks; it does not operate an unconstrained autonomous browser. Chrome149+ is required for network allowlisting. Browser profiles, credentials, evidence screenshots, recordings and generated audio are not included in the source packages.

No repository publication, deployment, or TTS generation was performed for this local preview.
