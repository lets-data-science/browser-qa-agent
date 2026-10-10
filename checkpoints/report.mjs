export function summarizeRun(journeys) {
  if (!Array.isArray(journeys) || !journeys.length) return {status:'error',passed:0,total:0,label:'No checks completed'};
  const passed = journeys.filter(j => j.status === 'passed').length;
  const hasErrors = journeys.some(j => j.status === 'error');
  return {status:hasErrors ? 'error' : passed === journeys.length ? 'passed' : 'failed', passed, total:journeys.length, label:hasErrors ? 'Verification interrupted' : passed === journeys.length ? 'Every selected check passed' : 'An expected result is missing'};
}
