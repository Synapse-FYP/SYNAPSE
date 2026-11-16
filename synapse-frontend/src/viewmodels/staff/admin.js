import { fD, clone } from '../../lib/utils.js';
import { memoByState } from '../common.js';

export const ADMIN_TABS = [['employees', 'Employees'], ['users', 'Users & permissions'], ['org', 'Departments & roles'], ['devices', 'Registered devices'], ['notify', 'Notifications'], ['orginfo', 'Organization'], ['status', 'System status'], ['account', 'Account']];

const PERMISSIONS = [['View security dashboards & alerts', true, true, false], ['Investigate, classify and escalate alerts', false, true, false], ['Assign training & request verification', false, true, false], ['Manage employees, users & devices', true, false, false], ['Configure policies & integrations', true, false, false], ['View audit records', true, true, false], ['Complete training & respond to verification', false, false, true]];
const NOTIFY_LABELS = { critical: 'Email me for Critical and High alerts', verification: 'Notify when an employee responds to a verification request', training: 'Notify when assigned training is completed', weekly: 'Weekly summary report' };
const SYS_STATUS = [
  { name: 'Frontend prototype', st: 'Running', note: 'Client-side state with browser storage', cls: 'dot dot-ok' },
  { name: 'Express API gateway', st: 'Not connected', note: 'Planned — routing, authentication, role-based access', cls: 'dot dot-idle' },
  { name: 'Python ML scoring service', st: 'Not connected', note: 'Frozen HGB package (GET /health, POST /score) tested locally: 21/21 checks', cls: 'dot dot-idle' },
  { name: 'MongoDB', st: 'Not connected', note: 'Planned persistence for scores, alerts, interventions and audit', cls: 'dot dot-idle' },
  { name: 'Real-time alerts (WebSocket)', st: 'Not connected', note: 'Planned Socket.IO push', cls: 'dot dot-idle' },
  { name: 'Endpoint agent ingestion', st: 'Simulated', note: 'Separate Windows agent component — not part of this frontend', cls: 'dot dot-warn' },
];

export const buildAdmin = memoByState((store) => {
  const { db, ui: u } = store.state;
  const V = {};
  V.adTabs = ADMIN_TABS.map((t) => ({ k: t[0], label: t[1], cls: 'vtab' + (u.adTab === t[0] ? ' on' : ''), sel: u.adTab === t[0] ? 'true' : 'false', go: () => store.ui({ adTab: t[0] }) }));
  V.adt = {}; ADMIN_TABS.forEach((t) => { V.adt[t[0]] = u.adTab === t[0]; });
  V.adEmps = db.employees.map((e) => ({ id: e.id, name: e.name, email: e.email, dept: e.dept, role: e.role, status: e.status, hired: fD(e.hired), cls: 'pill ' + (e.status === 'Active' ? 'pill-ok' : 'pill-idle'), edit: () => store.ui({ empEdit: clone(e), empErr: {} }) }));
  V.adNewEmp = () => store.ui({ empEdit: { name: '', email: '', dept: '', role: '', status: 'Active', site: 'Karachi HQ' }, empErr: {} });
  const ee = u.empEdit; V.empEditShow = !!ee;
  if (ee) {
    const setE = (k) => (e) => { const v = e.target.value; store.ui((x) => ({ empEdit: Object.assign({}, x.empEdit, { [k]: v }, k === 'dept' ? { role: '' } : {}), empErr: Object.assign({}, x.empErr, { [k]: '' }) })); };
    V.ee = Object.assign({}, ee, {
      title: ee.id ? 'Edit ' + ee.id : 'Create employee',
      set: { name: setE('name'), email: setE('email'), dept: setE('dept'), role: setE('role'), status: setE('status'), site: setE('site') },
      err: u.empErr, save: () => store.saveEmployee(), cancel: () => store.ui({ empEdit: null, empErr: {} }),
      roleOpts: db.roles.filter((r) => !ee.dept || r.dept === ee.dept).map((r) => r.name),
    });
  }
  V.depts = db.departments.map((d) => ({ v: d.name, id: d.id, n: db.employees.filter((e) => e.dept === d.name).length, roles: db.roles.filter((r) => r.dept === d.name).map((r) => r.name).join(', ') || '—' }));
  V.adUsers = db.users.map((x) => ({ id: x.id, name: x.name, email: x.email, role: x.role === 'admin' ? 'System Administrator' : 'Security Analyst', status: x.status, cls: 'pill ' + (x.status === 'Active' ? 'pill-ok' : 'pill-idle'), toggle: () => store.toggleUser(x), toggleLabel: x.status === 'Active' ? 'Disable' : 'Enable' }));
  V.perm = PERMISSIONS.map((r) => ({ label: r[0], a: r[1] ? '✓' : '—', s: r[2] ? '✓' : '—', e: r[3] ? '✓' : '—' }));
  V.adOrg = {
    dept: (e) => store.ui({ deptName: e.target.value }), role: (e) => store.ui({ roleName: e.target.value }), roleDept: (e) => store.ui({ roleDept: e.target.value }),
    addDept: () => store.addDepartment(), addRole: () => store.addRole(),
  };
  V.adRm = db.removables.map((r) => ({ id: r.id, label: r.label, serial: r.serial, emp: store.empName(r.emp), approved: r.approved ? 'Approved' : 'Not approved', cls: 'pill ' + (r.approved ? 'pill-ok' : 'pill-bad'), added: fD(r.added), toggle: () => store.toggleRemovable(r), toggleLabel: r.approved ? 'Revoke' : 'Approve' }));
  const setRm = (k, clearErr) => (e) => { const v = e.target.value; store.ui((x) => Object.assign({ rmForm: Object.assign({}, x.rmForm, { [k]: v }) }, clearErr ? { rmErr: '' } : {})); };
  V.rmf = { label: setRm('label', true), serial: setRm('serial', true), emp: setRm('emp', false), save: () => store.saveRemovable() };
  V.rmErr = u.rmErr; V.hasRmErr = !!u.rmErr;
  V.adEps = db.endpoints.map((ep) => ({ id: ep.id, name: ep.name, emp: ep.emp ? store.empName(ep.emp) : 'Shared', status: ep.status }));
  V.notif = Object.keys(db.settings.notify).map((k) => ({ k, label: NOTIFY_LABELS[k], on: db.settings.notify[k], toggle: () => store.toggleNotify(k) }));
  const of = u.orgForm || db.settings.org;
  const setOrg = (k) => (e) => { const v = e.target.value; store.ui((x) => ({ orgForm: Object.assign({}, x.orgForm || db.settings.org, { [k]: v }) })); };
  V.orgf = Object.assign({}, of, { save: () => store.saveOrg(of) });
  V.orgSet = { name: setOrg('name'), timezone: setOrg('timezone'), retention: setOrg('retention'), offStart: setOrg('offStart'), offEnd: setOrg('offEnd') };
  V.sysStatus = SYS_STATUS;
  return V;
});
