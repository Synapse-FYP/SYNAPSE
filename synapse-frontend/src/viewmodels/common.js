// Shared derived data used across pages (ported from the original renderVals/alertView/alertDetail).
import { CAT, CATS, SEVC, STATUSES } from '../lib/constants.js';
import { sevOf, fD, fTs, fShort, initials, today, addDays } from '../lib/utils.js';
import { activity, topFeatures, employeeBaseline, seriesFor, lineChart } from '../lib/activity.js';

// Memoize a builder per state snapshot so several components can share one computation.
export function memoByState(fn) {
  const cache = new WeakMap();
  return (store, ...args) => {
    const st = store.state;
    let entry = cache.get(st);
    if (!entry) { entry = new Map(); cache.set(st, entry); }
    const key = JSON.stringify(args);
    if (!entry.has(key)) entry.set(key, fn(store, ...args));
    return entry.get(key);
  };
}

export function alertView(store, a) {
  const db = store.state.db;
  const e = db.employees.find((x) => x.id === a.emp) || { name: 'Unknown', dept: '—', role: '—' };
  const sev = sevOf(a.score);
  const statusKey = a.status.toLowerCase().replace(/\s+/g, '-');
  return Object.assign({}, a, {
    empName: e.name, dept: e.dept, role: e.role, sev, sevColor: SEVC[sev], catLabel: CAT[a.cat] ? CAT[a.cat].label : a.cat,
    date: a.ts.slice(0, 10), when: fTs(a.ts), whenShort: fShort(a.ts.slice(0, 10)) + ' ' + a.ts.slice(11, 16),
    analystName: store.userName(a.analyst), statusCls: 'st st-' + statusKey, sevCls: 'sev sev-' + sev.toLowerCase(),
    active: a.status !== 'Resolved', initials: initials(e.name),
  });
}

// Base context shared by every signed-in page.
export const getBase = memoByState((store) => {
  const { db } = store.state;
  const me = store.me();
  const alertsAll = db.alerts.map((a) => alertView(store, a));
  return {
    me,
    meV: me ? { name: me.name, title: me.title, initials: initials(me.name), role: me.role, roleLabel: me.role === 'admin' ? 'Administrator' : me.role === 'analyst' ? 'Security Analyst' : 'Employee' } : null,
    isAdmin: !!me && me.role === 'admin',
    isAnalyst: !!me && me.role === 'analyst',
    alertsAll,
    active: alertsAll.filter((a) => a.status !== 'Resolved'),
    analysts: db.users.filter((x) => x.role === 'analyst').map((x) => ({ id: x.id, name: x.name })),
    employeesOpt: db.employees.map((e) => ({ id: e.id, name: e.name + ' · ' + e.dept })),
    refOpts: [
      { v: 'TM-PHISH', l: 'Training — Recognizing Phishing Emails' },
      { v: 'TM-USB', l: 'Training — Safe USB and Removable-Media Usage' },
      { v: 'AS-01', l: 'Assessment — Security Awareness Baseline' },
      { v: 'AS-02', l: 'Assessment — Password & Authentication Hygiene' },
      { v: 'PH-01', l: 'Phishing-recognition exercise' },
    ].concat(db.policies.filter((p) => p.enabled && p.ack).map((p) => ({ v: p.id, l: 'Policy acknowledgment — ' + p.name }))),
    depts: db.departments.map((d) => ({ v: d.name })),
    statusOpts: STATUSES.map((x) => ({ v: x })),
    catOpts: CATS.map((c) => ({ v: c.k, l: c.label })),
  };
});

// Full detail for one alert (drawer + investigation workspace).
export const getAlertDetail = memoByState((store, id) => {
  const { db } = store.state;
  const { alertsAll } = getBase(store);
  const a = alertsAll.find((x) => x.id === id); if (!a) return null;
  const emp = db.employees.find((e) => e.id === a.emp) || {};
  const base = employeeBaseline(a.emp);
  const feats = base ? topFeatures(a.emp, a.date).slice(0, 5) : [];
  const maxZ = Math.max(1, ...feats.map((f) => Math.abs(f.z)));
  const features = feats.map((f) => Object.assign({}, f, {
    w: Math.min(100, Math.abs(f.z) / maxZ * 100).toFixed(0), zLabel: (f.z > 0 ? '+' : '') + f.z.toFixed(1) + ' SD',
    barColor: f.z >= 6 ? '#F0506E' : f.z >= 3 ? '#F2A93B' : '#22D3EE', ratio: f.mean > 0 ? (f.value / f.mean).toFixed(1) + '×' : 'new',
  }));
  const policies = (a.policies || []).map((pid) => db.policies.find((p) => p.id === pid)).filter(Boolean).map((p) => ({ id: p.id, name: p.name, cat: p.cat, enabled: p.enabled }));
  const dayRows = CATS.map((c) => {
    const s = activity().series[a.emp]; const r = s ? s.find((x) => x.d === a.date) : null; const b = base ? base.f[c.k + '_n'] : null;
    const v = r ? r.c[c.k].n : 0; const off = r ? r.c[c.k].off : 0; const z = b ? (v - b.mean) / b.sd : 0;
    return { label: c.label, value: v, off, mean: b ? Math.round(b.mean * 10) / 10 : '—', z: (z > 0 ? '+' : '') + Math.max(-20, Math.min(20, z)).toFixed(1), flag: z >= 3, cls: z >= 6 ? 'zchip z-hi' : z >= 3 ? 'zchip z-mid' : 'zchip z-lo' };
  });
  const evIcon = { logon: 'LOG', device: 'USB', file: 'FILE', email: 'MAIL', http: 'WEB' };
  const events = (a.events.length ? a.events : dayRows.filter((r) => r.flag).map((r) => ({ t: a.ts, src: CATS.find((c) => c.label === r.label).k, detail: r.label + ': ' + r.value + ' events (personal mean ' + r.mean + ')' })))
    .slice().sort((x, y) => (x.t < y.t ? -1 : 1))
    .map((e, i) => ({ t: e.t.slice(11, 16), date: fD(e.t), src: evIcon[e.src] || e.src.toUpperCase(), detail: e.detail, evId: 'EV-' + a.id.slice(3) + '-' + (i + 1), srcCls: 'evsrc evsrc-' + e.src }));
  const series = seriesFor(a.emp, a.cat, 'n', 30);
  let chart = null;
  if (series) {
    const lc = lineChart(series.vals, { band: { lo: series.mean - 2 * series.sd, hi: series.mean + 2 * series.sd, mean: series.mean } });
    const idx = series.rows.findIndex((r) => r.d === a.date);
    chart = Object.assign({}, lc, { mark: idx >= 0 ? { left: lc.x(idx).toFixed(1), top: lc.y(series.vals[idx]).toFixed(1) } : null, hasMark: idx >= 0, first: fShort(series.rows[0].d), last: fShort(series.rows[series.rows.length - 1].d) });
  }
  const related = alertsAll.filter((x) => x.emp === a.emp && x.id !== a.id).sort((x, y) => (x.ts < y.ts ? 1 : -1))
    .map((x) => Object.assign({}, x, { open:() => store.ui({ invSel: x.id, drawer: store.state.ui.drawer ? x.id : '' }) }));
  const devices = db.endpoints.filter((ep) => ep.emp === a.emp).map((ep) => ep.name + ' (' + ep.status + ')');
  const rms = db.removables.filter((r) => r.emp === a.emp).map((r) => r.label + (r.approved ? ' — approved' : ' — not approved'));
  const verif = db.verifications.filter((v) => v.alert === a.id).map((v) => Object.assign({}, v, {
    when: fTs(v.created), responded: v.respondedAt ? fTs(v.respondedAt) : '', hasResp: !!v.respondedAt,
    review: () => store.reviewVerification(v.id, a.id, 'Verification outcome marked as reviewed'), canReview: !!v.respondedAt && !v.reviewed,
  }));
  const ints = db.interventions.filter((i) => i.alert === a.id).map((i) => Object.assign({}, i, { label: store.refLabel(i.ref) }));
  const isNew = a.status === 'New', isResolved = a.status === 'Resolved';
  return Object.assign({}, a, {
    emp, hire: fD(emp.hired || ''),
    baselineLabel: base ? (base.personal ? 'Personal baseline · ' + base.trainDays + ' training days (16 Oct – 7 Nov)' : 'Limited history (' + base.trainDays + ' days) — population fallback applied') : 'Baseline unavailable — no activity history',
    baselinePersonal: base ? base.personal : false, features, hasFeatures: features.length > 0, policies, hasPolicies: policies.length > 0, dayRows, events, hasEvents: events.length > 0,
    chart, hasChart: !!chart, noChart: !chart,
    related, hasRelated: related.length > 0, devices: devices.join(', ') || 'None registered', rms: rms.join('; ') || 'None', context: a.context, hasContext: a.context.length > 0,
    notesV: a.notes.slice().reverse().map((n) => Object.assign({}, n, { when: fTs(n.ts) })), hasNotes: a.notes.length > 0,
    historyV: a.history.slice().reverse().map((h) => Object.assign({}, h, { when: fTs(h.ts) })), verif, hasVerif: verif.length > 0, ints, hasInts: ints.length > 0,
    canStart: isNew, canWork: !isResolved, canClose: isResolved && !a.closed, closedLabel: a.closed ? 'Closed' : '',
    scoreW: a.score, classCls: 'cls cls-' + a.classification.toLowerCase().replace(/[^a-z]+/g, '-'),
    act: {
      start: () => store.alertAct(a.id, 'start'), fp: () => store.alertAct(a.id, 'fp'), confirm: () => store.alertAct(a.id, 'confirm'), escalate: () => store.alertAct(a.id, 'escalate'),
      resolve: () => store.alertAct(a.id, 'resolve'), close: () => store.alertAct(a.id, 'close'), note: () => store.alertAct(a.id, 'note'),
      assign: (e) => store.alertAct(a.id, 'assign', e.target.value), status: (e) => store.alertAct(a.id, 'status', e.target.value),
      verify: () => store.openModal('verify', { alert: a.id, reason: a.reason + ' on ' + fD(a.ts) + '. Please confirm whether you performed this activity.' }),
      train: () => store.openModal('assignTraining', { emp: a.emp, alert: a.id, ref: a.cat === 'device' ? 'TM-USB' : a.cat === 'email' || a.cat === 'http' ? 'TM-PHISH' : 'AS-02', reason: 'Follow-up to ' + a.id + ': ' + a.reason.toLowerCase(), due: addDays(today(), 7) }),
      workspace: () => store.go('investigations', { invSel: a.id }), profile: () => store.go('people', { profile: a.emp, pTab: 'overview' }),
      behavior: () => store.go('behavior', { bEmp: a.emp, bCat: a.cat, bPoint: a.date }),
    },
  });
});
