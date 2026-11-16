import { DEMO_TODAY, SEV_ORDER } from '../../lib/constants.js';
import { addDays } from '../../lib/utils.js';
import { getBase, memoByState } from '../common.js';

export const buildDetection = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  let rows = alertsAll.slice();
  const q = u.dq.trim().toLowerCase();
  if (q) rows = rows.filter((a) => (a.id + ' ' + a.empName + ' ' + a.reason + ' ' + a.dept + ' ' + a.model).toLowerCase().indexOf(q) >= 0);
  if (u.dSev === 'High+') rows = rows.filter((a) => a.sev === 'High' || a.sev === 'Critical'); else if (u.dSev !== 'All') rows = rows.filter((a) => a.sev === u.dSev);
  if (u.dStatus === 'Open') rows = rows.filter((a) => a.status !== 'Resolved'); else if (u.dStatus !== 'All') rows = rows.filter((a) => a.status === u.dStatus);
  if (u.dDept !== 'All') rows = rows.filter((a) => a.dept === u.dDept);
  if (u.dModel !== 'All') rows = rows.filter((a) => a.model === u.dModel);
  if (u.dCat !== 'All') rows = rows.filter((a) => a.cat === u.dCat);
  if (u.dEmp !== 'All') rows = rows.filter((a) => a.emp === u.dEmp);
  if (u.dAnalyst !== 'All') rows = rows.filter((a) => (a.analyst || 'none') === u.dAnalyst);
  const start = addDays(DEMO_TODAY, -(+u.dRange - 1)); rows = rows.filter((a) => a.date >= start);
  const key = u.dSort, dir = u.dDir === 'asc' ? 1 : -1;
  rows.sort((x, y) => {
    let a = x[key], b = y[key];
    if (key === 'sev') { a = SEV_ORDER[x.sev]; b = SEV_ORDER[y.sev]; }
    if (key === 'score') { a = x.score; b = y.score; }
    return (a < b ? -1 : a > b ? 1 : 0) * dir;
  });
  const per = 8, pages = Math.max(1, Math.ceil(rows.length / per)), pg = Math.min(u.dPage, pages);
  V.dPageRows = rows.slice((pg - 1) * per, pg * per).map((a) => Object.assign({}, a, { open: () => store.ui({ drawer: a.id }), work: () => store.go('investigations', { invSel: a.id }) }));
  V.dEmpty = rows.length === 0;
  V.dPageLabel = 'Page ' + pg + ' of ' + pages;
  V.dPrev = () => store.ui({ dPage: Math.max(1, pg - 1) });
  V.dNext = () => store.ui({ dPage: Math.min(pages, pg + 1) });
  V.dPrevDis = pg <= 1; V.dNextDis = pg >= pages;
  V.dShowing = rows.length ? ((pg - 1) * per + 1) + '–' + Math.min(rows.length, pg * per) + ' of ' + rows.length : '0 results';
  const sortH = (k, l) => ({
    label: l, ind: u.dSort === k ? (u.dDir === 'asc' ? '▲' : '▼') : '', aria: u.dSort === k ? (u.dDir === 'asc' ? 'ascending' : 'descending') : 'none',
    go: () => store.ui({ dSort: k, dDir: u.dSort === k && u.dDir === 'desc' ? 'asc' : 'desc', dPage: 1 }),
  });
  V.dh = [sortH('id', 'Alert ID'), sortH('empName', 'Employee'), sortH('dept', 'Department'), sortH('ts', 'Timestamp'), sortH('catLabel', 'Activity'), sortH('score', 'Risk')];
  V.dhTail = [sortH('status', 'Status'), sortH('analystName', 'Analyst')];
  const f = (k) => (e) => store.ui({ [k]: e.target.value, dPage: 1 });
  V.df = {
    q: f('dq'), sev: f('dSev'), status: f('dStatus'), dept: f('dDept'), model: f('dModel'), cat: f('dCat'), analyst: f('dAnalyst'), emp: f('dEmp'), range: f('dRange'),
    clear: () => store.ui({ dq: '', dSev: 'All', dStatus: 'All', dDept: 'All', dModel: 'All', dCat: 'All', dAnalyst: 'All', dEmp: 'All', dRange: '30', dPage: 1 }),
    export: () => store.exportCsv('synapse_alerts_filtered.csv', ['Alert ID', 'Employee', 'Department', 'Timestamp', 'Activity', 'Anomaly score (simulated)', 'Severity', 'Reason', 'Model/source', 'Status', 'Classification', 'Analyst'],
      rows.map((a) => [a.id, a.empName, a.dept, a.ts, a.catLabel, a.score, a.sev, a.reason, a.model, a.status, a.classification, a.analystName])),
  };
  V.models = Array.from(new Set(db.alerts.map((a) => a.model))).map((m) => ({ v: m }));
  return V;
});
