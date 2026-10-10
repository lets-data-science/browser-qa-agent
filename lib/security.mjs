import { timingSafeEqual } from 'node:crypto';
export function validHost(host, port) { return host === `localhost:${port}` || host === `127.0.0.1:${port}`; }
export function authorizedMutation(req, port, token) {
  const origin = req.headers.origin;
  const expected = `http://${req.headers.host}`;
  if (!validHost(req.headers.host,port) || origin !== expected || req.headers['content-type'] !== 'application/json') return false;
  const provided = req.headers['x-lds-token'];
  return typeof provided === 'string' && provided.length === token.length && timingSafeEqual(Buffer.from(provided),Buffer.from(token));
}
export function practiceUrl(origin,variant,journey) {
  const url = new URL(origin);
  if (!['127.0.0.1','localhost'].includes(url.hostname) || url.protocol !== 'http:' || url.username || url.password || url.pathname !== '/') throw new Error('Only this local practice server is supported.');
  if (!['broken','fixed'].includes(variant) || !['signup','search','menu'].includes(journey)) throw new Error('Invalid practice target.');
  return `${url.origin}/practice/?variant=${variant}&journey=${journey}`;
}
export async function readJson(req) {
  let body='';
  for await (const chunk of req) { body += chunk; if(Buffer.byteLength(body)>12000) throw new Error('Request too large.'); }
  return JSON.parse(body || '{}');
}
export function findUid(snapshot,role,label) {
  const lines=snapshot.split('\n').filter(line => line.includes(`${role} ${JSON.stringify(label)}`));
  if(lines.length !== 1) throw new Error(`Expected one ${role} named ${label}; found ${lines.length}.`);
  const uid=lines[0].match(/uid=([\w-]+)/)?.[1];
  if(!uid) throw new Error('Browser did not provide an element UID.');
  return uid;
}
