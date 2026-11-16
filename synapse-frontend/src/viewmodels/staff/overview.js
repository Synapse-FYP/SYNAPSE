import { CATS, SEVC, DEMO_TODAY } from '../../lib/constants.js';
import { addDays, fShort, fD, initials, statusCls } from '../../lib/utils.js';
import { activity, topFeatures } from '../../lib/activity.js';
import { getBase, memoByState } from '../common.js';

export const buildOverview = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll, active } = getBase(store);
  const V = {};
  const n = +u.range; const start = addDays(DEMO_TODAY, -(n - 1));
  const inRange = alertsAll.filter((a) => a.date >= start && a.date <= DEMO_TODAY);
  const underInv = new Set(active.filter((a) => a.status !== 'New').map((a) => a.emp));
  const pendInt = db.interventions.filter((i) => i.status !== 'Completed').length;
  V.kpi = [
    { label: 'Active alerts', value: active.length, sub: 'Not yet resolved', go: () => store.go('detection', { dStatus: 'Open' }) },
    { label: 'High-priority alerts', value: active.filter((a) => a.sev === 'High' || a.sev === 'Critical').length, sub: 'High or Critical severity', go: () => store.go('detection', { dSev: 'High+', dStatus: 'Open' }) },
    { label: 'Employees under investigation', value: underInv.size, sub: 'With alerts in review', go: () => store.go('people') },
    { label: 'Pending investigations', value: active.filter((a) => a.status === 'New').length, sub: 'New, awaiting triage', go: () => store.go('detection', { dStatus: 'New' }) },
    { label: 'Pending interventions', value: pendInt, sub: 'Training, verification, acknowledgments', go: () => store.go('awareness', { awTab: 'assignments' }) },
  ];
  const days = []; for (let i = 0; i < n; i++) days.push(addDays(start, i));
  const counts = days.map((d) => inRange.filter((a) => a.date === d));
  const maxC = Math.max(1, ...counts.map((c) => c.length));
  V.trend = days.map((d, i) => ({
    key: d, label: n <= 14 || i % 3 === 0 ? fShort(d) : '', h: (counts[i].length / maxC * 100).toFixed(0), n: counts[i].length,
    tip: fShort(d) + ': ' + counts[i].length + ' alert(s)',
    segs: ['Critical', 'High', 'Medium', 'Low'].map((sv) => ({ sv, c: SEVC[sv], h: counts[i].length ? (counts[i].filter((a) => a.sev === sv).length / counts[i].length * 100).toFixed(0) : '0' })),
    open: () => store.go('detection', { dq: '', dRange: String(n) }),
  }));
  V.trendTotal = inRange.length;
  const sevC = ['Critical', 'High', 'Medium', 'Low'].map((sv) => ({ sev: sv, n: inRange.filter((a) => a.sev === sv).length, c: SEVC[sv] }));
  const maxS = Math.max(1, ...sevC.map((x) => x.n));
  V.sevDist = sevC.map((x) => Object.assign(x, { w: (x.n / maxS * 100).toFixed(0), go: () => store.go('detection', { dSev: x.sev, dRange: String(n) }) }));
  const catC = CATS.map((c) => ({ label: c.label, n: inRange.filter((a) => a.cat === c.k).length }));
  const maxK = Math.max(1, ...catC.map((x) => x.n));
  V.catDist = catC.map((x) => Object.assign(x, { w: (x.n / maxK * 100).toFixed(0) }));
  // anomalies (last 7 days, ≥ 4 SD)
  const A = activity(); const anoms = [];
  Object.keys(A.series).forEach((id) => {
    if (!db.employees.find((e) => e.id === id)) return;
    A.series[id].slice(-7).forEach((r) => {
      if (!r.active) return;
      topFeatures(id, r.d).filter((f) => f.z >= 4).slice(0, 1).forEach((f) => anoms.push({ emp: id, name: store.empName(id), d: r.d, day: fShort(r.d), label: f.label, z: '+' + f.z.toFixed(1) + ' SD', zv: f.z, value: f.value, mean: f.mean }));
    });
  });
  V.anoms = anoms.sort((x, y) => (y.d < x.d ? -1 : y.d > x.d ? 1 : y.zv - x.zv)).slice(0, 6).map((x) => Object.assign(x, { go: () => store.go('behavior', { bEmp: x.emp, bPoint: x.d }) }));
  V.queue = active.slice().sort((x, y) => y.score - x.score).slice(0, 5).map((a) => Object.assign({}, a, { go: () => store.go('investigations', { invSel: a.id }) }));
  V.sevChips = ['All', 'Critical', 'High', 'Medium', 'Low'].map((x) => ({ label: x, cls: 'chip' + (u.sevFilter === x ? ' on' : ''), pressed: u.sevFilter === x ? 'true' : 'false', go: () => store.ui({ sevFilter: x }) }));
  const rec = alertsAll.slice().sort((x, y) => (x.ts < y.ts ? 1 : -1)).filter((a) => u.sevFilter === 'All' || a.sev === u.sevFilter).slice(0, 6);
  V.recent = rec.map((a) => Object.assign({}, a, { open: () => store.ui({ drawer: a.id }) }));
  V.recentEmpty = rec.length === 0;
  const empMap = {};
  active.forEach((a) => { empMap[a.emp] = empMap[a.emp] || { id: a.emp, name: a.empName, dept: a.dept, n: 0, top: 0, sev: 'Low' }; const m = empMap[a.emp]; m.n++; if (a.score > m.top) { m.top = a.score; m.sev = a.sev; } });
  V.review = Object.values(empMap).sort((x, y) => y.top - x.top).map((m) => Object.assign(m, { sevCls: 'sev sev-' + m.sev.toLowerCase(), initials: initials(m.name), go: () => store.go('people', { profile: m.id, pTab: 'risk' }) }));
  const pend = [];
  active.filter((a) => a.status === 'New' && !a.analyst).forEach((a) => pend.push({ text: a.id + ' is unassigned (' + a.sev + ')', go: () => store.go('investigations', { invSel: a.id }) }));
  db.verifications.filter((v) => v.respondedAt && !v.reviewed).forEach((v) => pend.push({ text: v.id + ' response from ' + store.empName(v.emp) + ' awaits review', go: () => store.go('investigations', { invSel: v.alert }) }));
  db.verifications.filter((v) => !v.respondedAt).forEach((v) => pend.push({ text: v.id + ' awaiting response from ' + store.empName(v.emp), go: () => store.go('awareness', { awTab: 'verifications' }) }));
  V.pending = pend.slice(0, 6); V.pendingEmpty = pend.length === 0;
  V.recentInts = db.interventions.slice().sort((x, y) => ((y.completed || y.assigned) > (x.completed || x.assigned) ? 1 : -1)).slice(0, 5)
    .map((i) => ({ id: i.id, name: store.empName(i.emp), label: store.refLabel(i.ref), status: i.status, when: fD(i.completed || i.assigned), cls: statusCls(i.status), go: () => store.go('awareness', { awTab: 'assignments', awQ: i.id }) }));
  V.rangeOpts = [{ v: '7', l: 'Last 7 days' }, { v: '14', l: 'Last 14 days' }, { v: '30', l: 'Last 30 days' }];
  V.rangeLabel = 'Demo period ending ' + fD(DEMO_TODAY);
  return V;
});
