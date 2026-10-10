# Walkthrough script

The LDS guide uses an actual local-app recording with one continuous narration take. Playback timing is adjusted to follow the narration; captions and the transcript contain the same words.

AI narration uses Prateek Gaurav’s authorized voice. Voice credentials and audio source files are not included in this code repository. Building and testing the app requires no speech credits.

Current guide film: 55.32 seconds.

## Transcript

AI Browser QA Engineer checks whether a user journey actually works. Start a fresh run against the deliberately broken practice app. Chrome DevTools MCP drives the browser through three selected journeys. The signup confirmation is missing. Open the evidence: the request returned a server error, the console records the failure, and the screenshot shows what the user saw. Search fails too, because unrelated courses remain visible. The assertion checks the result on the page. Switch to the supplied corrected version and run the same checks again. All three pass. The app verifies that fix; changing the code remains your job. Download the evidence report and return to saved runs to review what passed, what failed, and why. That record makes it easier to explain a failure before you change anything.

## Recording review

- Show actual application behavior using non-private teaching inputs.
- Keep API keys, private browser profiles and credentials out of the recording.
- Explain any edited waiting time; do not imply that replaying saved evidence starts a new run.
- Verify the final picture against this transcript, captions and the visible actions.
- Review the full script and picture before generating any replacement narration.
