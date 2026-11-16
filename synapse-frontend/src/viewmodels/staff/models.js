import { CATS, DAYS } from '../../lib/constants.js';
import { rnd, fShort } from '../../lib/utils.js';
import { activity, zOf, topFeatures, lineChart } from '../../lib/activity.js';
import { getBase, memoByState } from '../common.js';
import { getEmployeeOptions } from './behavior.js';

const MODELS = [
  { k: 'HGB-personal', name: 'HistGradientBoosting — personalized', type: 'Supervised', feats: '46 (23 log + 23 deviations)', data: 'CERT r5.2', status: 'Evaluated · prototype integrated', st: 'ev-int', p: 28.35, r: 95.59, f1: 43.73, fpr: 0.51, ap: 0.9310, tp: 260, fp: 657, fn: 12, alerts: 917 },
  { k: 'RF-personal', name: 'Random Forest — personalized', type: 'Supervised', feats: '46', data: 'CERT r5.2', status: 'Experimentally evaluated', st: 'ev', p: 21.57, r: 88.97, f1: 34.72, fpr: 0.68, ap: 0.8147, tp: 242, fp: 880, fn: 30, alerts: 1122 },
  { k: 'HGB-raw', name: 'HistGradientBoosting — raw aggregates', type: 'Supervised (ablation)', feats: '23 log features', data: 'CERT r5.2', status: 'Experimentally evaluated', st: 'ev', p: 18.46, r: 81.99, f1: 30.14, fpr: 0.76, ap: 0.5707, tp: 223, fp: 985, fn: 49, alerts: 1208 },
  { k: 'LR-personal', name: 'Logistic Regression — personalized', type: 'Supervised', feats: '46', data: 'CERT r5.2', status: 'Experimentally evaluated', st: 'ev', p: 14.16, r: 71.69, f1: 23.65, fpr: 0.91, ap: 0.4994, tp: 195, fp: 1182, fn: 77, alerts: 1377 },
  { k: 'Hybrid', name: 'Original Hybrid (Isolation Forest + rules)', type: 'Unsupervised + rules', feats: '23 + deviation rules', data: 'CERT r5.2', status: 'Experimentally evaluated', st: 'ev', p: 10.91, r: 52.57, f1: 18.07, fpr: 0.90, ap: 0.3375, tp: 143, fp: 1168, fn: 129, alerts: 1311 },
];

const OTHER = [
  { name: 'Isolation Forest (standalone)', data: 'CERT r5.2 — first run', status: 'Evaluated (unlabeled run)', note: '1,356 alerts on 130,238 test days (1.04%). No labeled metrics: answer files were not located in that run.', st: 'ev' },
  { name: 'XGBoost', data: 'CERT r4.2 — Phase 7 (different release)', status: 'Evaluated on another release', note: '176 TP, 143 FP, F1 71.11% on 61,405 test days. Different labels and split; not comparable with r5.2.', st: 'ev' },
  { name: 'LSTM Autoencoder (7–14 day windows)', data: 'Planned', status: 'Proposed — not yet evaluated', note: 'Temporal reconstruction-error detector. No experiment completed.', st: 'prop' },
  { name: 'Graph model (GraphSAGE / GCN)', data: 'Planned (incl. LANL auth)', status: 'Proposed — not yet evaluated', note: 'Organizational and behavioral-similarity graphs. No validated accuracy.', st: 'prop' },
  { name: 'Voting-based ensemble', data: 'Planned', status: 'Proposed — not yet evaluated', note: 'Hard/soft voting compared with stacking. Superiority not claimed.', st: 'prop' },
  { name: 'LANL dataset training', data: 'auth, proc, flows, dns', status: 'Planned — not started', note: 'Features not yet engineered; red-team file reserved as ground truth.', st: 'prop' },
];

export const buildModels = memoByState((store) => {
  const { ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  V.mRows = MODELS.map((m) => Object.assign({}, m, {
    pW: m.p.toFixed(0), rW: m.r.toFixed(0), pL: m.p.toFixed(2) + '%', rL: m.r.toFixed(2) + '%', f1L: (m.f1 / 100).toFixed(4), fprL: m.fpr.toFixed(2) + '%', apL: m.ap.toFixed(4),
    stCls: 'mst mst-' + m.st, cls: 'mrow' + (u.mSel === m.k ? ' on' : ''), pick: () => store.ui({ mSel: m.k }),
  }));
  V.mOther = OTHER.map((x) => Object.assign({}, x, { stCls: 'mst mst-' + x.st }));
  V.scen = [{ s: '1', m: 15, d: 15, u: 7, r: '100.00%' }, { s: '2', m: 91, d: 88, u: 4, r: '96.70%' }, { s: '3', m: 6, d: 4, u: 3, r: '66.67%' }, { s: '4', m: 160, d: 153, u: 20, r: '95.62%' }].map((x) => Object.assign(x, { w: (x.d / x.m * 100).toFixed(0) }));
  // LSTM illustrative curve
  const lid = u.lstmEmp; const A = activity();
  V.lstmOpts = getEmployeeOptions(store);
  V.lf = { emp: (e) => store.ui({ lstmEmp: e.target.value }), thresh: (e) => store.ui({ mThresh: +e.target.value }), alert: (e) => store.ui({ mAlert: e.target.value }) };
  V.lstm = null;
  if (A.series[lid]) {
    const win = DAYS.map((d, i) => {
      const lo = Math.max(0, i - 6); let t = 0, c = 0;
      for (let j = lo; j <= i; j++) { const dd = DAYS[j]; if (!A.series[lid][j].active) continue; t += CATS.reduce((s2, cc) => s2 + Math.min(12, Math.max(0, zOf(lid, dd, cc.k, 'n'))) ** 2, 0); c++; }
      return c ? Math.sqrt(t / c) / 3 : 0;
    });
    const lc = lineChart(win); const thr = 1.2;
    V.lstm = Object.assign(lc, { thr: lc.y(thr).toFixed(1), first: fShort(DAYS[0]), last: fShort(DAYS[29]), peak: Math.max(...win).toFixed(2), peakDay: fShort(DAYS[win.indexOf(Math.max(...win))]) });
  }
  // simulated ensemble
  const al = alertsAll.find((a) => a.id === u.mAlert) || alertsAll[alertsAll.length - 1];
  V.ensAlertOpts = alertsAll.slice().reverse().map((a) => ({ v: a.id, l: a.id + ' · ' + a.empName }));
  const f = topFeatures(al.emp, al.date); const zmax = f.length ? f[0].z : 0;
  const scores = [
    { name: 'HGB-personalized', src: 'Simulated demo score (interface of frozen model)', v: al.score },
    { name: 'Isolation Forest', src: 'Simulated', v: Math.round(Math.min(99, 30 + zmax * 4.2 + rnd(al.id + 'if') * 10)) },
    { name: 'Policy rules', src: 'Illustrative rules', v: Math.round(Math.min(99, (al.policies.length * 18) + (al.context.length * 9) + rnd(al.id + 'r') * 12)) },
    { name: 'LSTM Autoencoder', src: 'Illustrative — not trained', v: Math.round(Math.min(99, 25 + zmax * 3.1 + rnd(al.id + 'l') * 18)) },
    { name: 'Graph model', src: 'Illustrative — not trained', v: Math.round(Math.min(99, 20 + (al.context.length * 12) + rnd(al.id + 'g') * 25)) },
  ];
  const T = u.mThresh; const votes = scores.filter((x) => x.v >= T).length; const soft = Math.round(scores.reduce((a, b) => a + b.v, 0) / scores.length);
  V.ens = {
    alert: al.id, emp: al.empName, scores: scores.map((x) => Object.assign(x, { w: x.v, cls: x.v >= T ? 'ens-bar on' : 'ens-bar', vote: x.v >= T ? 'Flag' : 'No flag' })),
    votes, total: scores.length, soft, T, hard: votes >= 3 ? 'Majority flags (3 of 5 needed)' : 'No majority',
    softRes: soft >= T ? 'Soft-vote mean above threshold' : 'Soft-vote mean below threshold',
    agree: votes === 0 || votes === scores.length ? 'Full agreement' : 'Detectors disagree — review evidence',
  };
  return V;
});
