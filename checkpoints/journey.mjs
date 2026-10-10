export const JOURNEYS = {
  signup: { name: 'Create an account', detail: 'Submit the practice form and verify its confirmation.', width: 1280, height: 800,
    steps: [{ type:'fill', role:'textbox', label:'Your name', value:'Alex Learner' }, { type:'fill', role:'textbox', label:'Email address', value:'alex@example.test' }, { type:'click', role:'button', label:'Create practice account' }, { type:'expect', assertion:'signup' }] },
  search: { name: 'Find a course', detail: 'Search for SQL and verify only the matching course remains.', width:1280, height:800,
    steps:[{ type:'fill', role:'searchbox', label:'Search courses', value:'SQL' }, { type:'click', role:'button', label:'Search' }, { type:'expect', assertion:'search' }] },
  menu: { name: 'Open the mobile menu', detail: 'Check the menu at 375 pixels and verify its course link appears.', width:375, height:667,
    steps:[{ type:'click', role:'button', label:'Open navigation' }, { type:'expect', assertion:'menu' }] },
};
/** The planner can select known journeys, never invent commands or destinations. */
export function selectJourneys(ids) {
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3) throw new Error('Choose one to three journeys.');
  if (new Set(ids).size !== ids.length || ids.some(id => !Object.hasOwn(JOURNEYS,id))) throw new Error('Unknown or duplicate journey.');
  return ids.map(id => ({id,...JOURNEYS[id]}));
}
