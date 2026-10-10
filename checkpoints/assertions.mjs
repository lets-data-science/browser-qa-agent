const has = (snapshot, text) => snapshot.includes(JSON.stringify(text));
/** Accessibility snapshots describe visible/accessible page content, not visual appearance. */
export function checkAssertion(kind, snapshot) {
  if (typeof snapshot !== 'string' || !snapshot.includes('uid=')) throw new Error('A real browser snapshot is required.');
  if (kind === 'signup') return { passed:has(snapshot,'Practice account created'), expected:'Practice account created', observed: has(snapshot,'Practice account created') ? 'Confirmation is present.' : 'Confirmation is missing. Inspect the signup response and console.' };
  if (kind === 'search') {
    const titles = ['SQL Fundamentals','Python Essentials','Statistics in Practice'].filter(t => has(snapshot,t));
    return { passed:titles.length === 1 && titles[0] === 'SQL Fundamentals', expected:'Only SQL Fundamentals remains', observed:`Visible course titles: ${titles.join(', ') || 'none'}` };
  }
  if (kind === 'menu') return { passed: /link "Browse courses"/.test(snapshot), expected:'Browse courses link appears after opening the mobile menu', observed:/link "Browse courses"/.test(snapshot) ? 'Mobile navigation link is accessible.' : 'Mobile navigation link is missing.' };
  throw new Error('Unknown assertion.');
}
