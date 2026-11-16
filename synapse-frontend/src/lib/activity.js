// Deterministic simulated activity, personal baselines and deviation helpers.
import { CATS, DAYS, TRAIN_END } from './constants.js';
import { rnd, dow } from './utils.js';
import { PROF, INJ } from '../data/employees.js';

let ACT_MEMO = null;

export function activity() {
  if (ACT_MEMO) return ACT_MEMO;
  const out = {};
  Object.keys(PROF).forEach((id) => {
    const p = PROF[id].prof, hired = PROF[id].hired;
    out[id] = DAYS.map((d) => {
      const row = { d, active: d >= hired, c: {} };
      const we = dow(d) === 0 || dow(d) === 6;
      CATS.forEach((c) => {
        let n = 0, off = 0;
        if (row.active) {
          const r1 = rnd(id + d + c.k), r2 = rnd(c.k + d + id + 'x'), r3 = rnd(d + id + c.k + 'o');
          const f = we ? 0.12 : 1;
          if (c.k === 'device') { n = r1 < p.device * f * 1.4 ? 1 + (r2 < 0.25 ? 1 : 0) : 0; }
          else { n = Math.round(p[c.k] * f * (0.72 + 0.56 * r1)); }
          off = we ? n : Math.round(n * p.off * (0.4 + 1.2 * r3));
        }
        const inj = INJ[id + '|' + d];
        if (inj && inj[c.k]) { n = inj[c.k].n; off = inj[c.k].off; }
        row.c[c.k] = { n, off };
      });
      return row;
    });
  });
  // population stats
  const pop = {};
  CATS.forEach((c) => {
    ['n', 'off'].forEach((m) => {
      const xs = [];
      Object.keys(out).forEach((id) => out[id].forEach((r) => { if (r.active && r.d <= TRAIN_END) xs.push(r.c[c.k][m]); }));
      const mean = xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
      const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, xs.length)) || 1;
      pop[c.k + '_' + m] = { mean, sd };
    });
  });
  const base = {};
  Object.keys(out).forEach((id) => {
    const tr = out[id].filter((r) => r.active && r.d <= TRAIN_END);
    const personal = tr.length >= 10;
    base[id] = { personal, trainDays: tr.length, f: {} };
    CATS.forEach((c) => {
      ['n', 'off'].forEach((m) => {
        const key = c.k + '_' + m, P = pop[key];
        if (!personal) { base[id].f[key] = { mean: P.mean, sd: P.sd }; return; }
        const xs = tr.map((r) => r.c[c.k][m]);
        const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
        let sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / xs.length);
        sd = Math.max(sd, 0.1 * P.sd, 0.0001);
        base[id].f[key] = { mean, sd };
      });
    });
  });
  ACT_MEMO = { series: out, base, pop };
  return ACT_MEMO;
}

export function zOf(id, d, cat, m) {
  const A = activity(); const s = A.series[id]; if (!s) return 0;
  const r = s.find((x) => x.d === d); if (!r || !r.active) return 0;
  const b = A.base[id].f[cat + '_' + m];
  return Math.max(-20, Math.min(20, (r.c[cat][m] - b.mean) / b.sd));
}

export function topFeatures(id, d) {
  const A = activity(); const s = A.series[id]; if (!s) return [];
  const r = s.find((x) => x.d === d); if (!r) return [];
  const out = [];
  CATS.forEach((c) => {
    ['n', 'off'].forEach((m) => {
      const b = A.base[id].f[c.k + '_' + m]; const v = r.c[c.k][m];
      const z = Math.max(-20, Math.min(20, (v - b.mean) / b.sd));
      out.push({ key: c.k + '_' + m, cat: c.k, label: m === 'n' ? c.ev : c.off, value: v, mean: Math.round(b.mean * 10) / 10, sd: Math.round(b.sd * 10) / 10, z: Math.round(z * 10) / 10 });
    });
  });
  return out.sort((a, b) => b.z - a.z);
}

export function employeeBaseline(id) { const A = activity(); return A.base[id] || null; }

export function seriesFor(id, cat, metric, rangeN) {
  const A = activity(); const s = A.series[id]; if (!s) return null;
  const rows = s.slice(30 - rangeN);
  const b = A.base[id].f[cat + '_' + metric];
  return { rows, vals: rows.map((r) => (r.active ? r.c[cat][metric] : 0)), mean: b.mean, sd: b.sd, personal: A.base[id].personal, trainDays: A.base[id].trainDays };
}

// SVG path builder for the 600×200 line charts.
export function lineChart(vals, opts) {
  opts = opts || {};
  const W = 600, H = 200, n = vals.length;
  const band = opts.band; // {lo, hi, mean}
  let max = Math.max.apply(null, vals.concat(band ? [band.hi] : []).concat([1]));
  max = max * 1.12;
  const x = (i) => (n <= 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v) => H - (Math.max(0, v) / max) * H;
  const path = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
  const area = path + ' L' + W + ' ' + H + ' L0 ' + H + ' Z';
  let bandPath = '', meanPath = '';
  if (band) {
    const lo = Math.max(0, band.lo);
    bandPath = 'M0 ' + y(band.hi).toFixed(1) + ' L' + W + ' ' + y(band.hi).toFixed(1) + ' L' + W + ' ' + y(lo).toFixed(1) + ' L0 ' + y(lo).toFixed(1) + ' Z';
    meanPath = 'M0 ' + y(band.mean).toFixed(1) + ' L' + W + ' ' + y(band.mean).toFixed(1);
  }
  const ticks = [0, 0.5, 1].map((f) => ({ label: String(Math.round((max / 1.12) * f)), top: (100 - (f / 1.12) * 100).toFixed(1) }));
  return { path, area, bandPath, meanPath, ticks, x: (i) => (n <= 1 ? 50 : (i / (n - 1)) * 100), y: (v) => 100 - (Math.max(0, v) / max) * 100 };
}
