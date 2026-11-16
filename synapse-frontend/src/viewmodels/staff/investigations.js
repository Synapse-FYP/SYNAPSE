import { getBase, getAlertDetail, memoByState } from '../common.js';

export const buildInvestigations = memoByState((store) => {
  const { ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  const q = u.invQ.trim().toLowerCase();
  const list = alertsAll.filter((a) => !a.closed)
    .sort((x, y) => (x.status === 'Resolved') - (y.status === 'Resolved') || y.score - x.score)
    .filter((a) => !q || (a.id + ' ' + a.empName + ' ' + a.status).toLowerCase().indexOf(q) >= 0);
  V.invList = list.map((a) => Object.assign({}, a, { cls: 'q-item' + (a.id === u.invSel ? ' on' : ''), pick: () => store.ui({ invSel: a.id, noteText: '' }), current: a.id === u.invSel ? 'true' : 'false' }));
  V.invEmpty = list.length === 0;
  V.invQ = (e) => store.ui({ invQ: e.target.value });
  V.inv = getAlertDetail(store, u.invSel);
  V.hasInv = !!V.inv;
  V.invTabs = [{ k: 'timeline', l: 'Timeline' }, { k: 'evidence', l: 'Evidence records' }, { k: 'history', l: 'Case history' }]
    .map((t) => ({ k: t.k, label: t.l, cls: 'tab' + (u.invTab === t.k ? ' on' : ''), sel: u.invTab === t.k ? 'true' : 'false', go: () => store.ui({ invTab: t.k }) }));
  V.invT = { timeline: u.invTab === 'timeline', evidence: u.invTab === 'evidence', history: u.invTab === 'history' };
  return V;
});
