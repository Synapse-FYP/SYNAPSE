import { MON } from './constants.js';

// Deterministic pseudo-random number in [0, 1) derived from a string (FNV-1a based).
export function rnd(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 13; h = Math.imul(h, 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export function dow(d) { return new Date(d + 'T12:00:00Z').getUTCDay(); }
export function pad(n) { return (n < 10 ? '0' : '') + n; }
export function nowTs() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
export function today() { return nowTs().slice(0, 10); }
export function fD(s) { if (!s) return '—'; const p = s.slice(0, 10).split('-'); return parseInt(p[2], 10) + ' ' + MON[+p[1] - 1] + ' ' + p[0]; }
export function fTs(s) { if (!s) return '—'; const t = s.slice(11, 16); return fD(s) + (t ? ', ' + t : ''); }
export function fShort(d) { const p = d.split('-'); return parseInt(p[2], 10) + ' ' + MON[+p[1] - 1]; }
export function addDays(d, n) { return new Date(Date.parse(d + 'T12:00:00Z') + n * 86400000).toISOString().slice(0, 10); }
export function initials(n) { return n.split(' ').map((x) => x[0]).slice(0, 2).join(''); }
export function clone(o) { return JSON.parse(JSON.stringify(o)); }
export function sevOf(sc) { return sc >= 85 ? 'Critical' : sc >= 70 ? 'High' : sc >= 45 ? 'Medium' : 'Low'; }
export function csvCell(v) { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
export function statusCls(status) { return 'st st-' + status.toLowerCase().replace(/\s+/g, '-'); }
