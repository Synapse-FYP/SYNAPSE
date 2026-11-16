import { CATS, DEMO_TODAY } from '../../lib/constants.js';
import { addDays, fD, fTs } from '../../lib/utils.js';
import { activity } from '../../lib/activity.js';
import { getBase, memoByState } from '../common.js';

export const REPORT_TYPES = [['alerts', 'Alert summary'], ['outcomes', 'Investigation outcomes'], ['risk', 'Risk history'], ['behavior', 'Behavioral activity'], ['model', 'Model evaluation (CERT r5.2)'], ['sources', 'Data-source health'], ['training', 'Awareness training'], ['interventions', 'Intervention completion'], ['workload', 'Analyst workload'], ['fp', 'False-positive reviews']];

export const buildReports = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  V.rTabs = [['reports', 'Reports'], ['audit', 'Audit log']].map((t) => ({ k: t[0], label: t[1], cls: 'tab' + (u.rTab === t[0] ? ' on' : ''), sel: u.rTab === t[0] ? 'true' : 'false', go: () => store.ui({ rTab: t[0] }) }));
  V.rt = { reports: u.rTab === 'reports', audit: u.rTab === 'audit' };
  V.rTypes = REPORT_TYPES.map((t) => ({ v: t[0], l: t[1] }));
  const start = addDays(DEMO_TODAY, -(+u.rRange - 1));
  const al = alertsAll.filter((a) => a.date >= start && (u.rDept === 'All' || a.dept === u.rDept));
  let cols = [], rows = [], summary = [], links = false;
  const empInDept = (id) => { const e = store.emp(id); return u.rDept === 'All' || (e && e.dept === u.rDept); };
  if (u.rType === 'alerts') {
    cols = ['Alert', 'Employee', 'Department', 'Date', 'Activity', 'Score', 'Severity', 'Status'];
    rows = al.map((a) => [a.id, a.empName, a.dept, fD(a.ts), a.catLabel, a.score, a.sev, a.status]);
    summary = [['Alerts', al.length], ['Open', al.filter((a) => a.active).length], ['High/Critical', al.filter((a) => a.sev === 'High' || a.sev === 'Critical').length], ['Resolved', al.filter((a) => !a.active).length]]; links = true;
  }
  if (u.rType === 'outcomes') {
    const xs = al.filter((a) => a.status === 'Resolved' || a.classification !== 'Unclassified');
    cols = ['Alert', 'Employee', 'Classification', 'Status', 'Analyst', 'Last action'];
    rows = xs.map((a) => [a.id, a.empName, a.classification, a.status, a.analystName, fTs(a.history[a.history.length - 1].ts)]);
    summary = [['Classified', xs.length], ['False positives', xs.filter((a) => a.classification === 'False positive').length], ['Confirmed concerns', xs.filter((a) => a.classification === 'Confirmed security concern').length], ['Undetermined', xs.filter((a) => a.classification === 'Undetermined').length]]; links = true;
  }
  if (u.rType === 'risk') {
    const ids = Array.from(new Set(al.map((a) => a.emp)));
    cols = ['Employee', 'Department', 'Alerts', 'Highest score', 'Latest alert', 'Open'];
    rows = ids.map((id) => { const xs = al.filter((a) => a.emp === id); return [store.empName(id), xs[0].dept, xs.length, Math.max(...xs.map((a) => a.score)), fD(xs.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0].ts), xs.filter((a) => a.active).length]; });
    summary = [['Employees with alerts', ids.length], ['Alerts', al.length], ['Scores are simulated', '0–100']];
  }
  if (u.rType === 'behavior') {
    const A = activity();
    cols = ['Employee', 'Department', 'Baseline', 'Avg logons/day', 'Avg file events/day', 'Removable-media connects', 'Off-hours share'];
    rows = db.employees.filter((e) => A.series[e.id] && empInDept(e.id)).map((e) => {
      const rs = A.series[e.id].filter((r) => r.active && r.d >= start); const avg = (k) => (rs.reduce((t, r) => t + r.c[k].n, 0) / Math.max(1, rs.length)).toFixed(1);
      let t = 0, o = 0; rs.forEach((r) => CATS.forEach((c) => { t += r.c[c.k].n; o += r.c[c.k].off; }));
      return [e.name, e.dept, A.base[e.id].personal ? 'Personal' : 'Population fallback', avg('logon'), avg('file'), rs.reduce((x, r) => x + r.c.device.n, 0), (t ? o / t * 100 : 0).toFixed(1) + '%'];
    });
    summary = [['Employees', rows.length], ['Source', 'Simulated demonstration events']];
  }
  if (u.rType === 'model') {
    cols = ['Model', 'Precision', 'Recall', 'F1', 'FPR', 'TP', 'FP', 'FN'];
    rows = [['HGB personalized (selected)', '28.35%', '95.59%', '0.4373', '0.51%', 260, 657, 12], ['RF personalized', '21.57%', '88.97%', '0.3472', '0.68%', 242, 880, 30], ['HGB raw', '18.46%', '81.99%', '0.3014', '0.76%', 223, 985, 49], ['Logistic personalized', '14.16%', '71.69%', '0.2365', '0.91%', 195, 1182, 77], ['Original Hybrid', '10.91%', '52.57%', '0.1807', '0.90%', 143, 1168, 129]];
    summary = [['Dataset', 'CERT r5.2 (synthetic)'], ['Test days', '130,238'], ['Positives', '272'], ['Status', 'Retrospective experiment']];
  }
  if (u.rType === 'sources') {
    cols = ['Source', 'Type', 'Status', 'Last activity'];
    rows = db.endpoints.map((e) => [e.name, 'Endpoint agent (simulated)', e.status, fTs(e.lastSync)]).concat(db.integrations.map((g) => [g.name, 'Integration (simulated)', g.status, g.last ? fTs(g.last) : 'Never']));
    summary = [['Agents connected', db.endpoints.filter((e) => e.status === 'Connected').length + ' / ' + db.endpoints.length], ['Integrations configured', db.integrations.filter((g) => g.status !== 'Not configured').length + ' / ' + db.integrations.length]];
  }
  if (u.rType === 'training') {
    const xs = db.interventions.filter((i) => (i.type === 'Training' || i.type === 'Assessment' || i.type === 'Phishing exercise') && empInDept(i.emp));
    cols = ['ID', 'Employee', 'Item', 'Assigned', 'Due', 'Status', 'Progress'];
    rows = xs.map((i) => [i.id, store.empName(i.emp), store.refLabel(i.ref), fD(i.assigned), fD(i.due), i.status, i.progress + '%']);
    summary = [['Assigned', xs.length], ['Completed', xs.filter((i) => i.status === 'Completed').length], ['Note', 'Completion is not treated as reduced risk']];
  }
  if (u.rType === 'interventions') {
    const xs = db.interventions.filter((i) => empInDept(i.emp)); const types2 = ['Training', 'Assessment', 'Phishing exercise', 'Policy acknowledgment', 'Verification'];
    cols = ['Type', 'Assigned', 'Completed', 'Completion rate'];
    rows = types2.map((t) => { const ys = xs.filter((i) => i.type === t); const d = ys.filter((i) => i.status === 'Completed').length; return [t, ys.length, d, ys.length ? Math.round(d / ys.length * 100) + '%' : '—']; });
    summary = [['Total', xs.length], ['Completed', xs.filter((i) => i.status === 'Completed').length]];
  }
  if (u.rType === 'workload') {
    cols = ['Analyst', 'Assigned alerts', 'Open', 'Resolved', 'Notes written'];
    rows = db.users.filter((x) => x.role === 'analyst').map((x) => { const xs = al.filter((a) => a.analyst === x.id); return [x.name, xs.length, xs.filter((a) => a.active).length, xs.filter((a) => !a.active).length, db.alerts.reduce((t, a) => t + a.notes.filter((n) => n.user === x.name).length, 0)]; })
      .concat([['Unassigned', al.filter((a) => !a.analyst).length, al.filter((a) => !a.analyst && a.active).length, 0, 0]]);
    summary = [['Alerts in period', al.length], ['Historical reference', 'CERT r5.2: mean 8.82 alerts/day, p95 19']];
  }
  if (u.rType === 'fp') {
    const xs = al.filter((a) => a.classification === 'False positive');
    cols = ['Alert', 'Employee', 'Reason', 'Resolution note', 'Analyst'];
    rows = xs.map((a) => [a.id, a.empName, a.reason, (a.notes[a.notes.length - 1] || { text: (a.history.find((h) => h.action.indexOf('false positive') >= 0) || { action: '—' }).action }).text, a.analystName]);
    const classified = al.filter((a) => a.classification !== 'Unclassified').length;
    summary = [['False positives', xs.length], ['Share of classified alerts', classified ? Math.round(xs.length / classified * 100) + '%' : '—']]; links = true;
  }
  V.report = {
    title: (REPORT_TYPES.find((t) => t[0] === u.rType) || REPORT_TYPES[0])[1], cols,
    rows: rows.map((r) => ({ cells: r.map((v) => String(v)), hasLink: links, open: links ? () => store.ui({ drawer: String(r[0]) }) : null })),
    summary: summary.map((x) => ({ k: x[0], v: String(x[1]) })), empty: rows.length === 0,
    period: u.rType === 'model' ? 'Historical experiment (2 Jan 2010 – 2 Jun 2011 dataset period)' : fD(start) + ' – ' + fD(DEMO_TODAY),
    export: () => store.exportCsv('synapse_report_' + u.rType + '.csv', cols, rows),
  };
  V.rf = { type: (e) => store.ui({ rType: e.target.value }), range: (e) => store.ui({ rRange: e.target.value }), dept: (e) => store.ui({ rDept: e.target.value }), auQ: (e) => store.ui({ auQ: e.target.value, auPage: 1 }), auAction: (e) => store.ui({ auAction: e.target.value, auPage: 1 }) };
  const aq = u.auQ.trim().toLowerCase();
  const au = db.audit.filter((x) => (u.auAction === 'All' || x.action === u.auAction) && (!aq || (x.user + ' ' + x.action + ' ' + x.target).toLowerCase().indexOf(aq) >= 0));
  const per = 12, pages = Math.max(1, Math.ceil(au.length / per)), pg = Math.min(u.auPage, pages);
  V.audit = au.slice((pg - 1) * per, pg * per).map((x) => Object.assign({}, x, { when: fTs(x.ts), cls: 'pill ' + (x.outcome === 'Rejected' || x.outcome.indexOf('Fail') >= 0 ? 'pill-bad' : 'pill-ok') }));
  V.auEmpty = au.length === 0; V.auPageLabel = 'Page ' + pg + ' of ' + pages + ' · ' + au.length + ' entries';
  V.auPrev = () => store.ui({ auPage: Math.max(1, pg - 1) }); V.auNext = () => store.ui({ auPage: Math.min(pages, pg + 1) }); V.auPrevDis = pg <= 1; V.auNextDis = pg >= pages;
  V.auActions = Array.from(new Set(db.audit.map((x) => x.action))).sort();
  V.auExport = () => store.exportCsv('synapse_audit_log.csv', ['ID', 'Timestamp', 'User', 'Action', 'Target', 'Outcome'], au.map((x) => [x.id, x.ts, x.user, x.action, x.target, x.outcome]));
  return V;
});
