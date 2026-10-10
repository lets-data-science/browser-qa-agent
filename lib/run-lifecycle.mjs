/** Publish a terminal result only after Chrome is closed and evidence is durable. */
export async function finalizeRun(run, result, { close, persist }, notify = () => {}) {
  await close();
  const saved = { ...run, ...result, finishedAt: Date.now() };
  await persist(saved);
  Object.assign(run, saved);
  notify();
}
