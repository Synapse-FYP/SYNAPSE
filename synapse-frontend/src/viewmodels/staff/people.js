import { CATS, DAYS, TRAIN_END } from '../../lib/constants.js';
import { fD, fTs, fShort, initials, addDays, today, statusCls } from '../../lib/utils.js';
import { activity, zOf, employeeBaseline, seriesFor, lineChart } from '../../lib/activity.js';
import { GRAPH_RES, GRAPH_ACCESS } from '../../data/content.js';
import { getBase, memoByState } from '../common.js';

export const PROFILE_TABS = [['overview', 'Overview'], ['behavior', 'Behavioral History'], ['risk', 'Risk History'], ['devices', 'Device Relationships'], ['interventions', 'Interventions']];

export const buildPeople = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll, active } = getBase(store);
  const V = {};
  const q = u.pq.trim().toLowerCase();
  const emps = db.employees.filter((e) => (u.pDept === 'All' || e.dept === u.pDept) && (!q || (e.name + ' ' + e.id + ' ' + e.role).toLowerCase().indexOf(q) >= 0));
  V.peopleRows = emps.map((e) => {
    const open = active.filter((a) => a.emp === e.id); const ep = db.endpoints.filter((x) => x.emp === e.id); const rm = db.removables.filter((r) => r.emp === e.id && r.approved);
    const s = activity().series[e.id]; const last = s ? s.slice().reverse().find((r) => r.active) : null;
    const invSt = open.some((a) => a.status === 'Escalated') ? 'Escalated' : open.some((a) => a.status !== 'New') ? 'Under investigation' : open.length ? 'Alert pending triage' : 'No open case';
    return {
      id: e.id, name: e.name, initials: initials(e.name), dept: e.dept, role: e.role, devices: ep.map((x) => x.name).join(', ') || '—', rmCount: rm.length,
      agent: ep.length ? ep[0].status : 'Not enrolled',
      agentCls: 'dot ' + (ep.length && ep[0].status === 'Connected' ? 'dot-ok' : ep.length && ep[0].status === 'Stale' ? 'dot-warn' : ep.length ? 'dot-bad' : 'dot-idle'),
      recent: last ? fShort(last.d) + ' · ' + (last.c.logon.n + last.c.file.n + last.c.email.n) + ' events' : 'No activity history',
      open: open.length, inv: invSt, status: e.status, go: () => store.ui({ profile: e.id, pTab: 'overview' }),
    };
  });
  V.peopleEmpty = emps.length === 0;
  V.pf = { q: (e) => store.ui({ pq: e.target.value }), dept: (e) => store.ui({ pDept: e.target.value }) };
  V.showProfile = !!u.profile && !!db.employees.find((e) => e.id === u.profile);
  if (!V.showProfile) return V;

  const e = db.employees.find((x) => x.id === u.profile); const base = employeeBaseline(e.id); const A = activity();
  V.pTabs = PROFILE_TABS.map((t) => ({ k: t[0], label: t[1], cls: 'tab' + (u.pTab === t[0] ? ' on' : ''), sel: u.pTab === t[0] ? 'true' : 'false', go: () => store.ui({ pTab: t[0] }) }));
  V.pt = {}; PROFILE_TABS.forEach((t) => { V.pt[t[0]] = u.pTab === t[0]; });
  const ea = alertsAll.filter((a) => a.emp === e.id).sort((x, y) => (x.ts < y.ts ? 1 : -1));
  const ep = db.endpoints.filter((x) => x.emp === e.id);
  const P = {
    id: e.id, name: e.name, initials: initials(e.name), dept: e.dept, role: e.role, email: e.email, site: e.site, hired: fD(e.hired), status: e.status,
    back: () => store.ui({ profile: '' }),
    open: ea.filter((a) => a.active).length, total: ea.length,
    baselineLabel: base ? (base.personal ? 'Personal baseline from ' + base.trainDays + ' training days' : 'Limited history (' + base.trainDays + ' days) — population fallback') : 'Baseline unavailable — no activity history yet',
    hasBaseline: !!base, noBaseline: !base, personal: base ? base.personal : false, limited: !!base && !base.personal,
    devices: ep.map((x) => ({ id: x.id, name: x.name, os: x.os, status: x.status, last: fTs(x.lastSync), cls: 'dot ' + (x.status === 'Connected' ? 'dot-ok' : x.status === 'Stale' ? 'dot-warn' : 'dot-bad') })),
    hasDevices: ep.length > 0,
    removables: db.removables.filter((r) => r.emp === e.id).map((r) => ({ id: r.id, label: r.label, serial: r.serial, approved: r.approved ? 'Approved' : 'Not approved', cls: r.approved ? 'pill pill-ok' : 'pill pill-bad' })),
    resources: (GRAPH_ACCESS[e.id] || []).map((id) => GRAPH_RES.find((r) => r.id === id)).filter(Boolean),
    policies: db.policies.filter((p) => p.enabled && (p.depts.indexOf('All departments') >= 0 || p.depts.indexOf(e.dept) >= 0))
      .map((p) => ({ id: p.id, name: p.name, acked: db.acks.some((a) => a.policy === p.id && a.emp === e.id) ? 'Acknowledged' : p.ack ? 'Not acknowledged' : 'No acknowledgment required' })),
    behavior: () => store.go('behavior', { bEmp: e.id }), graph: () => store.go('graph', { gFocus: e.id, gSel: e.id }),
    assign: () => store.openModal('assignTraining', { emp: e.id, ref: 'TM-PHISH', reason: '', due: addDays(today(), 14) }),
  };
  P.risk = ea.map((a) => Object.assign({}, a, { go: () => store.go('investigations', { invSel: a.id }) }));
  P.noRisk = ea.length === 0;
  P.riskDots = ea.filter((a) => a.date >= DAYS[0]).map((a) => ({ id: a.id, left: (DAYS.indexOf(a.date) / 29 * 100).toFixed(1), bottom: a.score, c: a.sevColor, tip: a.id + ' · ' + a.score + ' · ' + fShort(a.date), go: () => store.ui({ drawer: a.id }) }));
  P.events = []; ea.slice(0, 3).forEach((a) => a.events.slice(0, 2).forEach((ev) => P.events.push({ when: fTs(ev.t), detail: ev.detail })));
  if (base) {
    const s = A.series[e.id];
    const recent = s.slice(-7).filter((r) => r.active), train = s.filter((r) => r.active && r.d <= TRAIN_END);
    P.compare = CATS.map((c) => {
      const cur = recent.reduce((t, r) => t + r.c[c.k].n, 0) / Math.max(1, recent.length); const b = base.f[c.k + '_n'].mean; const mx = Math.max(cur, b, 0.1);
      return { label: c.label, cur: cur.toFixed(1), base: b.toFixed(1), cw: (cur / mx * 100).toFixed(0), bw: (b / mx * 100).toFixed(0), delta: b > 0 ? ((cur - b) / b * 100).toFixed(0) + '%' : '—', up: cur > b * 1.5 };
    });
    const sumOff = (rows) => { let t = 0, o = 0; rows.forEach((r) => CATS.forEach((c) => { t += r.c[c.k].n; o += r.c[c.k].off; })); return t ? o / t : 0; };
    const ob = sumOff(train), oc = sumOff(recent);
    P.work = { baseOff: (ob * 100).toFixed(1), curOff: (oc * 100).toFixed(1), baseW: (100 - ob * 100).toFixed(1), curW: (100 - oc * 100).toFixed(1), baseOffW: (ob * 100).toFixed(1), curOffW: (oc * 100).toFixed(1) };
    const mk = (cat) => { const ser = seriesFor(e.id, cat, 'n', 30); const lc = lineChart(ser.vals, { band: { lo: ser.mean - 2 * ser.sd, hi: ser.mean + 2 * ser.sd, mean: ser.mean } }); return Object.assign(lc, { mean: ser.mean.toFixed(1) }); };
    P.devChart = mk('device'); P.fileChart = mk('file'); P.logonChart = mk('logon');
    const devz = s.map((r) => { if (!r.active) return 0; return Math.max(0, ...CATS.map((c) => zOf(e.id, r.d, c.k, 'n'))); });
    const lcz = lineChart(devz); P.devzChart = Object.assign(lcz, { thresh: lcz.y(3).toFixed(1) });
    P.first = fShort(DAYS[0]); P.last = fShort(DAYS[29]);
  }
  const ints = db.interventions.filter((i) => i.emp === e.id);
  P.ints = ints.map((i) => ({ id: i.id, type: i.type, label: store.refLabel(i.ref), assigned: fD(i.assigned), due: fD(i.due), status: i.status, progress: i.progress, cls: statusCls(i.status), followUp: i.followUp || '—' }));
  P.noInts = ints.length === 0;
  const done = ints.filter((i) => i.status === 'Completed').length;
  P.awareness = ints.length ? Math.round(done / ints.length * 100) : 0; P.awDone = done; P.awTotal = ints.length;
  V.prof = P;
  return V;
});
