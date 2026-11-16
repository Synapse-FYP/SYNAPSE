import { fD, clone } from '../../lib/utils.js';
import { memoByState } from '../common.js';

export const POLICY_CATS = ['Approved device usage', 'Restricted resources', 'Off-hours activity monitoring', 'USB/removable-media restrictions', 'Access permissions', 'Security awareness requirements'];

export const buildPolicies = memoByState((store) => {
  const { db, ui: u } = store.state;
  const V = {};
  const q = u.polQ.trim().toLowerCase();
  const pols = db.policies.filter((p) => (u.polCat === 'All' || p.cat === u.polCat) && (!q || (p.name + ' ' + p.body + ' ' + p.id).toLowerCase().indexOf(q) >= 0));
  V.polRows = pols.map((p) => ({
    id: p.id, name: p.name, cat: p.cat, depts: p.depts.join(', '), roles: p.roles.join(', '), devices: p.devices, status: p.enabled ? 'Enabled' : 'Disabled',
    cls: 'pill ' + (p.enabled ? 'pill-ok' : 'pill-idle'), ack: p.ack ? 'Required' : 'Not required', updated: fD(p.updated), body: p.body,
    edit: () => store.ui({ polEdit: clone(p), polErr: {} }), toggle: () => store.togglePolicy(p), toggleLabel: p.enabled ? 'Disable' : 'Enable',
  }));
  V.polEmpty = pols.length === 0;
  V.polf = {
    q: (e) => store.ui({ polQ: e.target.value }), cat: (e) => store.ui({ polCat: e.target.value }),
    create: () => store.ui({ polEdit: { name: '', cat: '', depts: ['All departments'], roles: ['All roles'], devices: 'All endpoints', enabled: true, ack: false, body: '' }, polErr: {} }),
  };
  const pe = u.polEdit; V.polEditShow = !!pe;
  if (pe) {
    const setP = (k) => (e) => { const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value; store.ui((x) => ({ polEdit: Object.assign({}, x.polEdit, { [k]: v }), polErr: Object.assign({}, x.polErr, { [k]: '' }) })); };
    V.pe = Object.assign({}, pe, {
      title: pe.id ? 'Edit ' + pe.id : 'Create policy',
      set: { name: setP('name'), cat: setP('cat'), body: setP('body'), devices: setP('devices'), enabled: setP('enabled'), ack: setP('ack'), roles: (e) => { const v = e.target.value; store.ui((x) => ({ polEdit: Object.assign({}, x.polEdit, { roles: [v] }) })); } },
      err: u.polErr, rolesVal: pe.roles[0] || 'All roles',
      deptChecks: ['All departments'].concat(db.departments.map((d) => d.name)).map((d) => ({
        d, on: pe.depts.indexOf(d) >= 0,
        toggle: () => store.ui((x) => {
          let ds = x.polEdit.depts.slice();
          if (ds.indexOf(d) >= 0) ds = ds.filter((y) => y !== d);
          else ds = d === 'All departments' ? ['All departments'] : ds.filter((y) => y !== 'All departments').concat([d]);
          return { polEdit: Object.assign({}, x.polEdit, { depts: ds }), polErr: Object.assign({}, x.polErr, { depts: '' }) };
        }),
      })),
      save: () => store.savePolicy(), cancel: () => store.ui({ polEdit: null, polErr: {} }),
    });
    V.roleOpts = ['All roles'].concat(db.roles.map((r) => r.name));
  }
  return V;
});
