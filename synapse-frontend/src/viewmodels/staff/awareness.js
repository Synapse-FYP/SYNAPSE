import { ASSESS } from '../../data/content.js';
import { fD, fTs, today, addDays, statusCls } from '../../lib/utils.js';
import { memoByState } from '../common.js';

export const AW_TABS = [['overview', 'Overview'], ['assignments', 'Assignments'], ['verifications', 'Verification requests'], ['assessments', 'Assessments & phishing'], ['acks', 'Policy acknowledgments']];
export const INT_TYPES = ['Training', 'Assessment', 'Phishing exercise', 'Policy acknowledgment', 'Verification'];

export const buildAwareness = memoByState((store) => {
  const { db, ui: u } = store.state;
  const V = {};
  const ints = db.interventions; const done = ints.filter((i) => i.status === 'Completed').length;
  V.awTabs = AW_TABS.map((t) => ({ k: t[0], label: t[1], cls: 'tab' + (u.awTab === t[0] ? ' on' : ''), sel: u.awTab === t[0] ? 'true' : 'false', go: () => store.ui({ awTab: t[0] }) }));
  V.awt = {}; AW_TABS.forEach((t) => { V.awt[t[0]] = u.awTab === t[0]; });
  V.awKpi = [
    { label: 'Active interventions', value: ints.filter((i) => i.status !== 'Completed').length },
    { label: 'Completed', value: done },
    { label: 'Overdue', value: ints.filter((i) => i.status !== 'Completed' && i.due < today()).length },
    { label: 'Verification responses to review', value: db.verifications.filter((v) => v.respondedAt && !v.reviewed).length },
  ];
  V.awByType = INT_TYPES.map((t) => { const xs = ints.filter((i) => i.type === t); const d = xs.filter((i) => i.status === 'Completed').length; return { t, n: xs.length, d, w: xs.length ? (d / xs.length * 100).toFixed(0) : '0' }; });
  const q = u.awQ.trim().toLowerCase();
  const rows = ints.filter((i) => (u.awType === 'All' || i.type === u.awType) && (u.awStatus === 'All' || i.status === u.awStatus) && (!q || (i.id + ' ' + store.empName(i.emp) + ' ' + i.reason + ' ' + store.refLabel(i.ref)).toLowerCase().indexOf(q) >= 0));
  V.awRows = rows.map((i) => {
    const overdue = i.status !== 'Completed' && i.due < today();
    return {
      id: i.id, emp: store.empName(i.emp), type: i.type, label: store.refLabel(i.ref), reason: i.reason, assigned: fD(i.assigned), due: fD(i.due),
      status: overdue ? 'Overdue' : i.status, cls: overdue ? 'st st-overdue' : statusCls(i.status), progress: i.progress, completed: i.completed ? fD(i.completed) : '—', followUp: i.followUp || '—',
    };
  });
  V.awEmpty = rows.length === 0;
  V.awf = {
    q: (e) => store.ui({ awQ: e.target.value }), type: (e) => store.ui({ awType: e.target.value }), status: (e) => store.ui({ awStatus: e.target.value }),
    assign: () => store.openModal('assignTraining', { emp: '', ref: 'TM-PHISH', reason: '', due: addDays(today(), 14) }),
    export: () => store.exportCsv('synapse_interventions.csv', ['Assignment ID', 'Employee', 'Type', 'Item', 'Reason', 'Assigned', 'Due', 'Status', 'Completed', 'Follow-up'],
      rows.map((i) => [i.id, store.empName(i.emp), i.type, store.refLabel(i.ref), i.reason, i.assigned, i.due, i.status, i.completed, i.followUp])),
  };
  V.typeOpts = INT_TYPES.map((t) => ({ v: t }));
  V.verifRows = db.verifications.map((v) => ({
    id: v.id, emp: store.empName(v.emp), alert: v.alert, reason: v.reason, created: fTs(v.created), status: v.status, comment: v.comment || '—',
    responded: v.respondedAt ? fTs(v.respondedAt) : '—', reviewed: v.reviewed ? 'Reviewed' : v.respondedAt ? 'Awaiting review' : '—',
    cls: 'st ' + (v.status === 'Pending' ? 'st-pending' : v.response === 'confirmed' ? 'st-completed' : 'st-escalated'),
    canReview: !!v.respondedAt && !v.reviewed, review: () => store.reviewVerification(v.id, v.alert, v.id + ' marked as reviewed'),
    open: () => store.go('investigations', { invSel: v.alert }),
  }));
  V.subRows = db.assessSubs.map((x) => ({ id: x.id, emp: store.empName(x.emp), title: ASSESS[x.assess].title, score: x.score + '/' + x.total, at: fTs(x.at) }))
    .concat(db.phishRuns.map((x) => ({ id: x.id, emp: store.empName(x.emp), title: 'Phishing-recognition exercise', score: x.score + '/' + x.total, at: fTs(x.at) })))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  V.ackRows = db.policies.filter((p) => p.ack).map((p) => {
    const applicable = db.employees.filter((e) => p.depts.indexOf('All departments') >= 0 || p.depts.indexOf(e.dept) >= 0);
    const ackd = applicable.filter((e) => db.acks.some((a) => a.policy === p.id && a.emp === e.id));
    return { id: p.id, name: p.name, n: applicable.length, d: ackd.length, w: applicable.length ? (ackd.length / applicable.length * 100).toFixed(0) : '0', recent: db.acks.filter((a) => a.policy === p.id).slice(-3).reverse().map((a) => store.empName(a.emp) + ' · ' + fTs(a.at)).join('; ') || 'None yet' };
  });
  return V;
});
