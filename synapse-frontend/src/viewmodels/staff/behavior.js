import { CATS, WD } from '../../lib/constants.js';
import { fD, fShort, dow, pad } from '../../lib/utils.js';
import { activity, zOf, seriesFor, lineChart } from '../../lib/activity.js';
import { getBase, memoByState } from '../common.js';

export const getEmployeeOptions = memoByState((store) => store.state.db.employees.filter((e) => activity().series[e.id]).map((e) => ({ v: e.id, l: e.name + ' · ' + e.dept })));

export const buildBehavior = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  V.bEmpOpts = getEmployeeOptions(store);
  const id = u.bEmp, n = +u.bRange; const ser = seriesFor(id, u.bCat, u.bMetric, n);
  V.bf = { emp: (e) => store.ui({ bEmp: e.target.value, bPoint: '' }), metric: (e) => store.ui({ bMetric: e.target.value }), range: (e) => store.ui({ bRange: e.target.value }), overlay: (e) => store.ui({ bOverlay: e.target.checked }) };
  V.bCatTabs = CATS.map((c) => ({ k: c.k, label: c.label, cls: 'seg' + (u.bCat === c.k ? ' on' : ''), pressed: u.bCat === c.k ? 'true' : 'false', go: () => store.ui({ bCat: c.k }) }));
  V.bHas = !!ser;
  if (!ser) return V;
  const lc = lineChart(ser.vals, { band: { lo: ser.mean - 2 * ser.sd, hi: ser.mean + 2 * ser.sd, mean: ser.mean } });
  const hi = ser.mean + 2 * ser.sd;
  V.bChart = Object.assign(lc, {
    bandOp: u.bOverlay ? 0.14 : 0, meanOp: u.bOverlay ? 1 : 0,
    first: fShort(ser.rows[0].d), mid: fShort(ser.rows[Math.floor(ser.rows.length / 2)].d), last: fShort(ser.rows[ser.rows.length - 1].d),
    pts: ser.rows.map((r, i) => {
      const v = ser.vals[i]; const z = (v - ser.mean) / ser.sd; const al = db.alerts.find((a) => a.emp === id && a.ts.slice(0, 10) === r.d);
      return { d: r.d, left: lc.x(i).toFixed(1), top: lc.y(v).toFixed(1), cls: 'pt' + (z >= 3 ? ' pt-hi' : '') + (al ? ' pt-alert' : '') + (u.bPoint === r.d ? ' pt-sel' : ''), tip: fShort(r.d) + ': ' + v + (z >= 3 ? ' (above expected range)' : ''), go: () => store.ui({ bPoint: r.d }) };
    }),
  });
  V.bStats = {
    mean: ser.mean.toFixed(1), sd: ser.sd.toFixed(1), hi: hi.toFixed(1),
    label: ser.personal ? 'Personal baseline · ' + ser.trainDays + ' training days (16 Oct – 7 Nov 2026)' : 'Limited history (' + ser.trainDays + ' days) — population fallback in use; interpret with caution',
    above: ser.vals.filter((v) => v > hi).length, obsMean: (ser.vals.reduce((a, b) => a + b, 0) / ser.vals.length).toFixed(1),
  };
  const pd = u.bPoint && ser.rows.find((r) => r.d === u.bPoint) ? u.bPoint : '';
  V.bPointShow = !!pd;
  if (pd) {
    const r = ser.rows.find((x) => x.d === pd); const al = db.alerts.filter((a) => a.emp === id && a.ts.slice(0, 10) === pd);
    V.bPt = {
      day: fD(pd) + ' (' + WD[dow(pd)] + ')',
      rows: CATS.map((c) => { const b = activity().base[id].f[c.k + '_n']; const z = (r.c[c.k].n - b.mean) / b.sd; return { label: c.label, n: r.c[c.k].n, off: r.c[c.k].off, mean: b.mean.toFixed(1), z: (z > 0 ? '+' : '') + Math.max(-20, Math.min(20, z)).toFixed(1), cls: z >= 6 ? 'zchip z-hi' : z >= 3 ? 'zchip z-mid' : 'zchip z-lo' }; }),
      alerts: al.map((a) => ({ id: a.id, reason: a.reason, open: () => store.ui({ drawer: a.id }), work: () => store.go('investigations', { invSel: a.id }) })),
      hasAlerts: al.length > 0, clear: () => store.ui({ bPoint: '' }),
    };
  }
  // heatmap weekday × hour
  const grid = []; for (let w = 0; w < 7; w++) grid.push(new Array(24).fill(0));
  ser.rows.forEach((r) => {
    if (!r.active) return; const w = dow(r.d); const v = r.c[u.bCat].n, off = r.c[u.bCat].off, work = Math.max(0, v - off);
    for (let h = 8; h < 18; h++) { const wt = [0.6, 1, 1.1, 1, 0.7, 0.9, 1.1, 1, 0.9, 0.6][h - 8]; grid[w][h] += work * wt / 9.9; }
    const offH = [6, 7, 18, 19, 20, 21, 22, 23]; offH.forEach((h, k) => { grid[w][h] += off * [0.15, 0.2, 0.2, 0.15, 0.1, 0.08, 0.07, 0.05][k]; });
  });
  const gmax = Math.max(0.01, ...grid.map((r) => Math.max(...r)));
  V.heat = [1, 2, 3, 4, 5, 6, 0].map((w) => ({ day: WD[w], cells: grid[w].map((v, h) => ({ cls: (h < 8 || h >= 18) ? 'heat-cell heat-off' : 'heat-cell', op: (v / gmax).toFixed(2), tip: WD[w] + ' ' + pad(h) + ':00 — ' + v.toFixed(1) + ' avg events' })) }));
  V.heatHours = [0, 3, 6, 9, 12, 15, 18, 21].map((h) => ({ label: pad(h) + ':00' }));
  // deviation table, last 7 days
  const last7 = activity().series[id].slice(-7);
  V.devTable = last7.map((r) => ({
    d: r.d, day: fShort(r.d) + ' ' + WD[dow(r.d)],
    cells: CATS.map((c) => { const z = r.active ? zOf(id, r.d, c.k, 'n') : 0; return { k: c.k, z: (z > 0 ? '+' : '') + z.toFixed(1), cls: !r.active ? 'zcell z-na' : z >= 6 ? 'zcell z-hi' : z >= 3 ? 'zcell z-mid' : z <= -2 ? 'zcell z-neg' : 'zcell z-lo', go: () => store.ui({ bCat: c.k, bPoint: r.d }) }; }),
  }));
  V.devCats = CATS.map((c) => ({ k: c.k, label: c.label }));
  const base = activity().base[id];
  V.ove = CATS.map((c) => { const s2 = seriesFor(id, c.k, 'n', 7); const obs = s2.vals.reduce((a, b) => a + b, 0) / s2.vals.length; const ex = base.f[c.k + '_n'].mean; const mx = Math.max(obs, ex, 0.1); return { label: c.label, obs: obs.toFixed(1), ex: ex.toFixed(1), ow: (obs / mx * 100).toFixed(0), ew: (ex / mx * 100).toFixed(0) }; });
  V.bAlerts = alertsAll.filter((a) => a.emp === id).map((a) => Object.assign({}, a, { open: () => store.ui({ drawer: a.id }), work: () => store.go('investigations', { invSel: a.id }) }));
  V.bEmpName = store.empName(id);
  return V;
});
