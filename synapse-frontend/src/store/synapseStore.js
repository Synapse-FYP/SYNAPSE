// Central client-side store for the SYNAPSE prototype.
// Ported from the original single-file `Component` class: same state shape ({db, sess, ui}),
// same synchronous setState semantics, same actions and audit trail. No backend.
import { DEMO_KEY, staffPath, empPath, SUBVIEW_KEYS } from '../lib/constants.js';
import { rnd, pad, nowTs, today, addDays, clone, csvCell } from '../lib/utils.js';
import { seed } from '../data/seed.js';
import { MODULES, ASSESS, PHISH } from '../data/content.js';

export function freshUi() {
  return {
    loginEmail: '', loginPw: '', signupName: '', authMode: 'signin', loginErr: '', loginFieldErr: {}, showPw: false, collapsed: false,
    range: '14', sevFilter: 'All', loading: false,
    dq: '', dSev: 'All', dStatus: 'All', dDept: 'All', dModel: 'All', dCat: 'All', dAnalyst: 'All', dEmp: 'All', dRange: '30', dSort: 'ts', dDir: 'desc', dPage: 1,
    drawer: '', invSel: 'AL-2043', invQ: '', invTab: 'timeline', noteText: '',
    pq: '', pDept: 'All', profile: '', pTab: 'overview',
    bEmp: 'E1006', bCat: 'device', bMetric: 'n', bRange: '30', bOverlay: true, bPoint: '',
    gq: '', gSel: '', gZoom: 0.72, gX: 0, gY: 0, gRel: { member: true, role: false, uses: true, access: true, comm: true, approved: true }, gFocus: '',
    mSel: 'HGB-personal', mThresh: 50, mAlert: 'AL-2043', lstmEmp: 'E1006',
    awTab: 'overview', awQ: '', awType: 'All', awStatus: 'All',
    dsTab: 'imports', epQ: '', epStatus: 'All', epSel: '', intgSel: '', intgForm: {}, imp: null, impSource: 'CERT r5.2 research sample', impMap: {}, impErr: '', impBusy: false,
    polQ: '', polCat: 'All', polEdit: null, polErr: {},
    rType: 'alerts', rRange: '30', rDept: 'All', auQ: '', auAction: 'All', auPage: 1, rTab: 'reports',
    adTab: 'employees', empEdit: null, empErr: {}, userEdit: null, deptName: '', roleName: '', roleDept: 'Finance', rmForm: { label: '', serial: '', emp: 'E1002' }, rmErr: '', orgForm: null,
    modal: null, confirm: null, toasts: [],
    tModule: '', tStep: 0, tAnswers: {}, tChecked: false,
    aRun: '', aAnswers: {}, aErr: '', aResult: null,
    phIdx: 0, phAnswers: {}, phDone: false,
    polRead: '', polAgree: false,
    vSel: '', vChoice: '', vComment: '', vErr: '',
    profForm: null,
  };
}

function loadPersisted() {
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.db && p.db.v === 1) return { db: p.db, sess: p.sess || null };
    }
  } catch { /* storage unavailable */ }
  return null;
}

export class SynapseStore {
  constructor() {
    const saved = loadPersisted();
    this.state = { db: saved ? saved.db : seed(), sess: saved ? saved.sess : null, ui: freshUi() };
    this.listeners = new Set();
    this.timers = [];
    this.drag = null;
    this.navigate = null; // injected by RouterBridge
    this.persistQueued = false;
  }

  // ---------- external-store plumbing ----------
  subscribe = (fn) => { this.listeners.add(fn); return () => this.listeners.delete(fn); };
  getSnapshot = () => this.state;
  emit() {
    this.listeners.forEach((l) => l());
    if (!this.persistQueued) {
      this.persistQueued = true;
      Promise.resolve().then(() => {
        this.persistQueued = false;
        try { window.localStorage.setItem(DEMO_KEY, JSON.stringify({ db: this.state.db, sess: this.state.sess })); } catch { /* ignore */ }
      });
    }
  }
  setState(u) {
    const p = typeof u === 'function' ? u(this.state) : u;
    if (p) this.state = Object.assign({}, this.state, p);
    this.emit();
  }

  // ---------- helpers ----------
  ui(patch) { this.setState((s) => ({ ui: Object.assign({}, s.ui, typeof patch === 'function' ? patch(s.ui) : patch) })); }
  me() {
    const s = this.state.sess; if (!s) return null; const db = this.state.db;
    if (s.kind === 'staff') return db.users.find((u) => u.id === s.userId) || null;
    const e = db.employees.find((x) => x.id === s.empId);
    return e ? { id: e.id, name: e.name, role: 'employee', title: e.role, emp: e } : null;
  }
  toast(msg, tone) {
    const id = Math.random().toString(36).slice(2);
    this.ui((u) => ({ toasts: u.toasts.concat([{ id, msg, tone: tone || 'ok' }]) }));
    this.timers.push(setTimeout(() => this.ui((u) => ({ toasts: u.toasts.filter((t) => t.id !== id) })), 3800));
  }
  dismissToast(id) { this.ui((x) => ({ toasts: x.toasts.filter((y) => y.id !== id) })); }
  mut(fn, msg, tone) {
    const actor = (this.me() || { name: 'System' }).name;
    this.setState((s) => { const db = clone(s.db); fn(db, actor); return { db }; });
    if (msg) this.toast(msg, tone);
  }
  audit(db, actor, action, target, outcome) {
    db.seq.au++;
    db.audit.unshift({ id: 'AU-' + String(db.seq.au).padStart(4, '0'), ts: nowTs(), user: actor, action, target, outcome: outcome || 'Success' });
  }
  ask(title, body, label, tone, fn) { this.ui({ confirm: { title, body, label, tone: tone || 'primary', fn } }); }
  doConfirm() { const c = this.state.ui.confirm; this.ui({ confirm: null }); if (c && c.fn) c.fn(); }
  emp(id) { return this.state.db.employees.find((e) => e.id === id); }
  empName(id) { const e = this.emp(id); return e ? e.name : '—'; }
  userName(id) { const u = this.state.db.users.find((x) => x.id === id); return u ? u.name : 'Unassigned'; }
  can(action) {
    const m = this.me(); if (!m) return false;
    const r = m.role;
    const map = { investigate: r === 'analyst', configure: r === 'admin', viewSecurity: r === 'admin' || r === 'analyst' };
    return !!map[action];
  }

  // ---------- navigation ----------
  pathFor(sess, page) { return sess && sess.kind === 'employee' ? empPath(page) : staffPath(page); }
  homePath() {
    const s = this.state.sess; if (!s || !this.me()) return '/login';
    return this.pathFor(s, s.page || (s.kind === 'employee' ? 'home' : 'overview'));
  }
  go(page, extra) {
    this.setState((s) => {
      // Remember whether a detail view was opened directly from another page (Back then returns there).
      const entrySub = s.sess && s.sess.page !== page ? !!extra && SUBVIEW_KEYS.some((k) => extra[k]) : !!s.ui.entrySub;
      return { sess: Object.assign({}, s.sess, { page }), ui: Object.assign({}, s.ui, { drawer: '', modal: null, entrySub }, extra || {}) };
    });
    if (this.navigate) this.navigate(this.pathFor(this.state.sess, page));
  }
  // Called when the URL changes (back/forward, direct link) to keep the session page in sync.
  syncPage(page) {
    const s = this.state.sess;
    if (!s || s.page === page) return;
    this.setState((st) => ({ sess: Object.assign({}, st.sess, { page }), ui: Object.assign({}, st.ui, { drawer: '', modal: null, entrySub: false }) }));
  }

  // ---------- auth ----------
  googleAuth() {
    // OAuth authorization-code flow must be started and verified by the backend.
    // Configure the backend route /auth/google/start (redirect URI + CSRF state + PKCE).
    if (window.location.protocol === 'file:') {
      this.ui({ loginErr: 'Google sign-in requires SYNAPSE to be hosted with a configured OAuth backend. It cannot authenticate from a local HTML file.' }); return;
    }
    window.location.assign('/auth/google/start?intent=' + (this.state.ui.authMode === 'signup' ? 'signup' : 'signin'));
  }
  async signup() {
    const u = this.state.ui; const name = (u.signupName || '').trim(), email = (u.loginEmail || '').trim().toLowerCase(), password = u.loginPw;
    if (!name || !email || !password || !/^\S+@\S+\.\S+$/.test(email)) {
      this.ui({ loginErr: 'Enter your full name, a valid work email and a password to request an account.' }); return;
    }
    if (window.location.protocol === 'file:') {
      this.ui({ loginErr: 'Account creation requires a configured SYNAPSE backend. This offline HTML is a demo and will not store your password.' }); return;
    }
    try {
      const r = await fetch('/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ name, email, password, role: 'employee' }) });
      if (!r.ok) throw new Error(r.status === 404 ? 'Signup service is not configured yet.' : 'Unable to request account. Contact your administrator.');
      this.ui({ authMode: 'signin', loginPw: '', loginErr: 'Account request received. Follow the instructions from your administrator.' });
    } catch (err) { this.ui({ loginErr: err.message || 'Signup service is unavailable.' }); }
  }
  login() {
    const u = this.state.ui; const email = u.loginEmail.trim().toLowerCase(); const pw = u.loginPw;
    const fe = {};
    if (!email) fe.email = 'Enter your work email.'; else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fe.email = 'Enter a valid email address.';
    if (!pw) fe.pw = 'Enter your password.';
    if (Object.keys(fe).length) { this.ui({ loginFieldErr: fe, loginErr: '' }); return; }
    const db = this.state.db;
    const staff = db.users.find((x) => x.email.toLowerCase() === email);
    if (staff) {
      if (staff.pw !== pw) { this.ui({ loginErr: 'Incorrect email or password. Use one of the demo accounts below.', loginFieldErr: {} }); return; }
      if (staff.status !== 'Active') { this.ui({ loginErr: 'This account is disabled. Contact your administrator.', loginFieldErr: {} }); return; }
      this.setState({ sess: { kind: 'staff', userId: staff.id, page: 'overview' }, ui: freshUi() });
      this.mut((d) => this.audit(d, staff.name, 'Login', staff.role === 'admin' ? 'Administrator portal' : 'Analyst portal'));
      if (this.navigate) this.navigate(staffPath('overview'));
      return;
    }
    const e = db.employees.find((x) => x.email.toLowerCase() === email);
    if (e && pw === 'Employee#2026') {
      if (e.status !== 'Active') { this.ui({ loginErr: 'This account is inactive. Contact your administrator.', loginFieldErr: {} }); return; }
      this.setState({ sess: { kind: 'employee', empId: e.id, page: 'home' }, ui: freshUi() });
      this.mut((d) => this.audit(d, e.name, 'Login', 'Employee portal'));
      if (this.navigate) this.navigate(empPath('home'));
      return;
    }
    this.ui({ loginErr: 'Incorrect email or password. Use one of the demo accounts below.', loginFieldErr: {} });
  }
  logout() {
    const m = this.me();
    if (m) this.mut((d) => this.audit(d, m.name, 'Logout', m.role === 'employee' ? 'Employee portal' : 'Security portal'));
    this.setState({ sess: null, ui: freshUi() });
    if (this.navigate) this.navigate('/login');
  }
  resetDemo() {
    this.ask('Reset demonstration data?', 'All changes made in this prototype (alerts, interventions, policies, imports, audit entries) are replaced with the original seeded data. You will be signed out.', 'Reset demo data', 'danger', () => {
      try { window.localStorage.removeItem(DEMO_KEY); } catch { /* ignore */ }
      this.setState({ db: seed(), sess: null, ui: freshUi() });
      if (this.navigate) this.navigate('/login');
    });
  }

  // ---------- alert actions ----------
  alertAct(id, kind, extra) {
    const a = this.state.db.alerts.find((x) => x.id === id); if (!a) return;
    const me = this.me();
    const apply = (fn, msg, auditAction, auditTarget) => this.mut((db, actor) => { const al = db.alerts.find((x) => x.id === id); fn(al, db, actor); this.audit(db, actor, auditAction, auditTarget || id); }, msg);
    if (kind === 'start') apply((al, db, actor) => { al.status = 'Under Review'; if (!al.analyst) al.analyst = me.id; al.history.push({ ts: nowTs(), user: actor, action: 'Investigation started' }); al.history.push({ ts: nowTs(), user: actor, action: 'Status → Under Review' }); }, 'Investigation started for ' + id, 'Investigation started');
    if (kind === 'assign') apply((al, db, actor) => { al.analyst = extra; al.history.push({ ts: nowTs(), user: actor, action: 'Assigned to ' + (extra ? db.users.find((u) => u.id === extra).name : 'Unassigned') }); }, id + ' assigned to ' + this.userName(extra), 'Alert assignment', id + ' → ' + this.userName(extra));
    if (kind === 'status') apply((al, db, actor) => { al.status = extra; al.history.push({ ts: nowTs(), user: actor, action: 'Status → ' + extra }); }, id + ' status updated to ' + extra, 'Alert status changed', id + ' → ' + extra);
    if (kind === 'note') {
      const t = (this.state.ui.noteText || '').trim(); if (!t) { this.toast('Write a note before saving.', 'warn'); return; }
      apply((al, db, actor) => { al.notes.push({ ts: nowTs(), user: actor, text: t }); al.history.push({ ts: nowTs(), user: actor, action: 'Investigation note added' }); }, 'Note saved to ' + id, 'Investigation note added'); this.ui({ noteText: '' });
    }
    if (kind === 'fp') this.ask('Mark ' + id + ' as a false positive?', 'The alert will be classified as a false positive and resolved. The anomaly score is not changed. This feedback is recorded for future model review (simulated).', 'Mark false positive', 'primary', () => apply((al, db, actor) => { al.classification = 'False positive'; al.status = 'Resolved'; al.history.push({ ts: nowTs(), user: actor, action: 'Marked false positive' }); al.history.push({ ts: nowTs(), user: actor, action: 'Status → Resolved' }); }, id + ' marked as false positive and resolved', 'Investigation decision', id + ' → False positive'));
    if (kind === 'confirm') this.ask('Record a confirmed security concern for ' + id + '?', 'This records the analyst’s judgement that the activity is a genuine security concern. It does not establish intent and does not block the employee’s access. Consider escalating.', 'Record concern', 'danger', () => apply((al, db, actor) => { al.classification = 'Confirmed security concern'; al.history.push({ ts: nowTs(), user: actor, action: 'Recorded confirmed security concern' }); }, 'Confirmed concern recorded for ' + id, 'Investigation decision', id + ' → Confirmed security concern'));
    if (kind === 'escalate') this.ask('Escalate ' + id + '?', 'The case is escalated for senior review (status → Escalated). No automated enforcement is applied.', 'Escalate', 'danger', () => apply((al, db, actor) => { al.status = 'Escalated'; al.history.push({ ts: nowTs(), user: actor, action: 'Escalated for senior review' }); }, id + ' escalated', 'Investigation decision', id + ' → Escalated'));
    if (kind === 'resolve') this.ask('Resolve ' + id + '?', a.classification === 'Unclassified' ? 'No classification has been recorded, so the alert will be resolved as Undetermined.' : 'The alert will be resolved with classification: ' + a.classification + '.', 'Resolve', 'primary', () => apply((al, db, actor) => { if (al.classification === 'Unclassified') al.classification = 'Undetermined'; al.status = 'Resolved'; al.history.push({ ts: nowTs(), user: actor, action: 'Status → Resolved (' + al.classification + ')' }); }, id + ' resolved', 'Investigation decision', id + ' → Resolved'));
    if (kind === 'close') this.ask('Close case ' + id + '?', 'Closing archives a resolved case. History and notes remain available in reports.', 'Close case', 'primary', () => apply((al, db, actor) => { al.closed = true; al.history.push({ ts: nowTs(), user: actor, action: 'Case closed' }); }, 'Case ' + id + ' closed', 'Case closed'));
  }
  reviewVerification(vid, alertId, msg) {
    this.mut((d, actor) => {
      const x = d.verifications.find((y) => y.id === vid); x.reviewed = true;
      const al = d.alerts.find((y) => y.id === alertId);
      if (al) al.history.push({ ts: nowTs(), user: actor, action: 'Verification outcome reviewed (' + vid + ')' });
      this.audit(d, actor, 'Verification reviewed', vid);
    }, msg);
  }

  // ---------- modals ----------
  openModal(kind, data) { this.ui({ modal: Object.assign({ kind, err: '' }, data || {}) }); }
  setModalField(k, val) { this.ui((x) => ({ modal: Object.assign({}, x.modal, { [k]: val, err: '' }) })); }
  submitModal() {
    const m = this.state.ui.modal; if (!m) return;
    if (m.kind === 'assignTraining') {
      if (!m.emp || !m.ref || !(m.reason || '').trim() || !m.due) { this.ui({ modal: Object.assign({}, m, { err: 'Select an employee, intervention, reason and due date.' }) }); return; }
      if (m.due < today()) { this.ui({ modal: Object.assign({}, m, { err: 'Due date cannot be in the past.' }) }); return; }
      const type = m.ref.indexOf('TM-') === 0 ? 'Training' : m.ref.indexOf('AS-') === 0 ? 'Assessment' : m.ref.indexOf('PH-') === 0 ? 'Phishing exercise' : 'Policy acknowledgment';
      const label = this.refLabel(m.ref);
      this.mut((db, actor) => {
        db.seq.int++; const id = 'INT-' + db.seq.int;
        db.interventions.unshift({ id, emp: m.emp, type, ref: m.ref, reason: m.reason.trim(), assigned: today(), due: m.due, status: 'Assigned', progress: 0, step: 0, completed: '', followUp: '', alert: m.alert || '', by: actor });
        if (m.alert) { const al = db.alerts.find((x) => x.id === m.alert); if (al) al.history.push({ ts: nowTs(), user: actor, action: type + ' assigned: ' + label + ' (' + id + ')' }); }
        this.audit(db, actor, 'Training assignment', id + ' ' + label + ' → ' + db.employees.find((e) => e.id === m.emp).name);
      }, label + ' assigned to ' + this.empName(m.emp));
      this.ui({ modal: null }); return;
    }
    if (m.kind === 'verify') {
      if (!(m.reason || '').trim()) { this.ui({ modal: Object.assign({}, m, { err: 'Describe the activity the employee should confirm.' }) }); return; }
      const a = this.state.db.alerts.find((x) => x.id === m.alert);
      this.mut((db, actor) => {
        db.seq.vr++; const vid = 'VR-' + db.seq.vr; db.seq.int++; const iid = 'INT-' + db.seq.int;
        db.verifications.unshift({ id: vid, emp: a.emp, alert: a.id, reason: m.reason.trim(), instructions: 'Please confirm whether you performed this activity and describe its purpose. This is a simulated confirmation inside the prototype, not multi-factor authentication.', created: nowTs(), status: 'Pending', response: '', comment: '', respondedAt: '', reviewed: false });
        db.interventions.unshift({ id: iid, emp: a.emp, type: 'Verification', ref: vid, reason: m.reason.trim(), assigned: today(), due: addDays(today(), 3), status: 'Pending', progress: 0, step: 0, completed: '', followUp: '', alert: a.id, by: actor });
        const al = db.alerts.find((x) => x.id === a.id); al.status = 'Awaiting Verification';
        al.history.push({ ts: nowTs(), user: actor, action: 'Verification requested (' + vid + ')' }); al.history.push({ ts: nowTs(), user: actor, action: 'Status → Awaiting Verification' });
        this.audit(db, actor, 'Verification requested', vid + ' → ' + db.employees.find((e) => e.id === a.emp).name);
      }, 'Verification request sent to ' + this.empName(a.emp));
      this.ui({ modal: null }); return;
    }
    if (m.kind === 'registerEp') {
      if (!(m.name || '').trim() || !m.os) { this.ui({ modal: Object.assign({}, m, { err: 'Enter a device name and operating system.' }) }); return; }
      if (this.state.db.endpoints.some((e) => e.name.toLowerCase() === m.name.trim().toLowerCase())) { this.ui({ modal: Object.assign({}, m, { err: 'A device with this name is already registered.' }) }); return; }
      this.mut((db, actor) => { const id = 'EP-' + db.seq.ep++; db.endpoints.push({ id, name: m.name.trim().toUpperCase(), emp: m.emp || '', os: m.os, ver: '0.3.0-proto', status: 'Pending first sync', lastSync: '', collecting: false, extra: 0, telemetry: ['Login/logout', 'USB connections', 'File activity'], ingest: [] }); this.audit(db, actor, 'Device registration', id + ' ' + m.name.trim().toUpperCase()); }, 'Simulated endpoint registered');
      this.ui({ modal: null }); return;
    }
    if (m.kind === 'intg') {
      if (!(m.endpoint || '').trim()) { this.ui({ modal: Object.assign({}, m, { err: 'Enter a connection endpoint (simulated — no connection is made).' }) }); return; }
      this.mut((db, actor) => { const g = db.integrations.find((x) => x.id === m.id); g.endpoint = m.endpoint.trim(); g.status = 'Configured (simulated)'; g.last = nowTs(); this.audit(db, actor, 'Integration configured', g.name); }, 'Integration configuration saved (simulated)');
      this.ui({ modal: null }); return;
    }
  }
  refLabel(ref) {
    if (MODULES[ref]) return MODULES[ref].title;
    if (ASSESS[ref]) return ASSESS[ref].title;
    if (ref === 'PH-01') return 'Phishing-recognition exercise';
    const p = this.state.db.policies.find((x) => x.id === ref); if (p) return p.name + ' (acknowledgment)';
    if (ref.indexOf('VR-') === 0) return 'Verification ' + ref;
    return ref;
  }

  // ---------- employee actions ----------
  completeIntervention(db, actor, iid, followUp) {
    const it = db.interventions.find((x) => x.id === iid); if (!it) return;
    it.status = 'Completed'; it.progress = 100; it.completed = today(); if (followUp) it.followUp = followUp;
    if (it.alert) { const al = db.alerts.find((x) => x.id === it.alert); if (al) al.history.push({ ts: nowTs(), user: actor, action: it.type + ' completed by employee (' + iid + ')' }); }
  }
  trainingNext(iid) {
    const it = this.state.db.interventions.find((x) => x.id === iid); const mod = MODULES[it.ref]; const total = mod.sections.length;
    const step = this.state.ui.tStep;
    if (step < total) {
      const ns = step + 1; this.ui({ tStep: ns, tChecked: false });
      this.mut((db) => { const x = db.interventions.find((y) => y.id === iid); x.step = Math.max(x.step || 0, ns); x.progress = Math.max(x.progress, Math.round(ns / (total + 1) * 100)); if (x.status === 'Assigned') x.status = 'In progress'; });
    }
  }
  trainingCheck(iid) {
    const it = this.state.db.interventions.find((x) => x.id === iid); const mod = MODULES[it.ref]; const ans = this.state.ui.tAnswers;
    if (mod.qs.some((q, i) => ans[i] === undefined)) { this.toast('Answer every review question first.', 'warn'); return; }
    const correct = mod.qs.filter((q, i) => ans[i] === q.a).length;
    this.ui({ tChecked: true });
    if (correct >= mod.qs.length - 1) {
      this.mut((db, actor) => { this.completeIntervention(db, actor, iid, 'Review score ' + correct + '/' + mod.qs.length + '.'); this.audit(db, actor, 'Training completed', iid + ' ' + mod.title); }, 'Training completed — your progress has been recorded');
    } else this.toast('Score ' + correct + '/' + mod.qs.length + '. Review the highlighted answers and try again.', 'warn');
  }
  submitAssessment(ref) {
    const as = ASSESS[ref]; const ans = this.state.ui.aAnswers;
    const missing = as.qs.map((q, i) => (ans[i] === undefined ? i + 1 : 0)).filter(Boolean);
    if (missing.length) { this.ui({ aErr: 'Answer all questions before submitting. Unanswered: ' + missing.join(', ') + '.' }); return; }
    const score = as.qs.filter((q, i) => ans[i] === q.a).length;
    const me = this.me();
    this.mut((db, actor) => {
      db.seq.sub++; db.assessSubs.unshift({ id: 'SUB-' + db.seq.sub, emp: me.id, assess: ref, score, total: as.qs.length, at: nowTs() });
      const it = db.interventions.find((x) => x.emp === me.id && x.ref === ref && x.status !== 'Completed'); if (it) this.completeIntervention(db, actor, it.id, 'Score ' + score + '/' + as.qs.length + '.');
      this.audit(db, actor, 'Assessment submitted', ref + ' ' + as.title, score + '/' + as.qs.length);
    }, 'Assessment submitted');
    this.ui({ aResult: { ref, score, total: as.qs.length, answers: Object.assign({}, ans) }, aErr: '' });
  }
  phishAnswer(i, val) { this.ui((u) => ({ phAnswers: Object.assign({}, u.phAnswers, { [i]: val }) })); }
  phishFinish() {
    const ans = this.state.ui.phAnswers; const score = PHISH.filter((p, i) => ans[i] === p.phish).length; const me = this.me();
    this.mut((db, actor) => {
      db.seq.pr++; db.phishRuns.unshift({ id: 'PR-' + db.seq.pr, emp: me.id, score, total: PHISH.length, at: nowTs() });
      const it = db.interventions.find((x) => x.emp === me.id && x.ref === 'PH-01' && x.status !== 'Completed'); if (it) this.completeIntervention(db, actor, it.id, 'Score ' + score + '/' + PHISH.length + '.');
      this.audit(db, actor, 'Phishing exercise completed', 'PH-01', score + '/' + PHISH.length);
    }, 'Exercise complete — ' + score + ' of ' + PHISH.length + ' correct');
    this.ui({ phDone: true });
  }
  ackPolicy(pid) {
    if (!this.state.ui.polAgree) { this.toast('Tick the confirmation box to acknowledge.', 'warn'); return; }
    const me = this.me();
    this.mut((db, actor) => {
      db.acks.push({ policy: pid, emp: me.id, at: nowTs() });
      const it = db.interventions.find((x) => x.emp === me.id && x.ref === pid && x.status !== 'Completed'); if (it) this.completeIntervention(db, actor, it.id, 'Acknowledged.');
      this.audit(db, actor, 'Policy acknowledged', pid + ' ' + db.policies.find((p) => p.id === pid).name);
    }, 'Policy acknowledged');
    this.ui({ polRead: '', polAgree: false });
  }
  respondVerify(vid) {
    const u = this.state.ui; if (!u.vChoice) { this.ui({ vErr: 'Choose a response.' }); return; }
    if (u.vChoice === 'confirmed' && !(u.vComment || '').trim()) { this.ui({ vErr: 'Briefly describe the business purpose.' }); return; }
    const label = { confirmed: 'Confirmed — this was me', disputed: 'Not recognised by employee', unsure: 'Employee unsure' }[u.vChoice];
    this.mut((db, actor) => {
      const v = db.verifications.find((x) => x.id === vid); v.status = label; v.response = u.vChoice; v.comment = (u.vComment || '').trim(); v.respondedAt = nowTs();
      const it = db.interventions.find((x) => x.ref === vid); if (it) this.completeIntervention(db, actor, it.id, label + (v.comment ? ': ' + v.comment : ''));
      const al = db.alerts.find((x) => x.id === v.alert); if (al) al.history.push({ ts: nowTs(), user: actor, action: 'Verification response: ' + label });
      this.audit(db, actor, 'Verification response', vid, label);
    }, 'Response sent to the security team');
    this.ui({ vSel: '', vChoice: '', vComment: '', vErr: '' });
  }
  saveEmployeeProfile(eid, pf) {
    this.mut((d, actor) => { const x = d.employees.find((y) => y.id === eid); x.prefName = pf.prefName.trim(); x.ext = pf.ext; this.audit(d, actor, 'Profile updated', eid); }, 'Profile saved');
    this.ui({ profForm: null });
  }
  toggleEmpNotify(eid, key) {
    this.mut((d, actor) => {
      d.settings.empNotify[eid] = Object.assign({ email: true, reminders: true, digest: false }, d.settings.empNotify[eid] || {});
      d.settings.empNotify[eid][key] = !d.settings.empNotify[eid][key];
      this.audit(d, actor, 'Notification preference changed', key);
    }, 'Preference saved');
  }

  // ---------- data / admin actions ----------
  syncEp(id) {
    this.mut((db, actor) => {
      const ep = db.endpoints.find((x) => x.id === id); const add = 40 + Math.round(rnd(id + nowTs()) * 260);
      ep.extra = (ep.extra || 0) + add; ep.lastSync = nowTs(); if (ep.status !== 'Connected') { ep.status = 'Connected'; ep.collecting = true; }
      ep.ingest.unshift({ ts: nowTs(), events: add, result: 'Simulated batch accepted' }); this.audit(db, actor, 'Simulated synchronization', id + ' (+' + add + ' events)');
    }, 'Simulated sync complete — demo events added');
  }
  testIntg(id) {
    this.ui({ intgSel: id });
    this.timers.push(setTimeout(() => {
      this.mut((db, actor) => { const g = db.integrations.find((x) => x.id === id); const ok = !!g.endpoint; g.status = ok ? 'Connection test passed (simulated)' : 'Test failed (simulated)'; g.last = nowTs(); this.audit(db, actor, 'Integration connection test', g.name, ok ? 'Passed (simulated)' : 'Failed (simulated)'); }, null);
      this.ui({ intgSel: '' });
      const g = this.state.db.integrations.find((x) => x.id === id);
      this.toast(g.endpoint ? 'Connection test passed (simulated)' : 'Test failed — configure an endpoint first', g.endpoint ? 'ok' : 'warn');
    }, 900));
  }
  parseImport(name, text) {
    let rows = [], cols = [], err = '';
    try {
      if (/\.json$/i.test(name)) {
        const j = JSON.parse(text); const arr = Array.isArray(j) ? j : (j.records || j.events || []);
        if (!arr.length) throw new Error('No records array found.');
        cols = Object.keys(arr[0]); rows = arr.slice(0, 500).map((o) => cols.map((c) => (o[c] == null ? '' : String(o[c]))));
      } else {
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) throw new Error('The file needs a header row and at least one data row.');
        cols = lines[0].split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
        rows = lines.slice(1, 501).map((l) => l.split(',').map((s) => s.trim().replace(/^"|"$/g, '')));
      }
    } catch (e) { err = 'Could not read file: ' + e.message; }
    const guess = {}; const fields = ['user', 'date', 'activity', 'pc'];
    fields.forEach((f) => {
      const hit = cols.find((c) => c.toLowerCase().indexOf(f) >= 0 || (f === 'user' && /emp|employee/i.test(c)) || (f === 'activity' && /event|action|type/i.test(c)) || (f === 'pc' && /host|device|computer/i.test(c)));
      guess[f] = hit || '';
    });
    this.ui({ imp: { name, cols, rows, total: rows.length }, impMap: guess, impErr: err });
  }
  onFile(e) {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (!/\.(csv|json)$/i.test(f.name)) { this.ui({ impErr: 'Only .csv or .json files are supported.', imp: null }); return; }
    if (f.size > 2 * 1024 * 1024) { this.ui({ impErr: 'File is larger than 2 MB. Browser imports are limited to small sample files; process full datasets offline.', imp: null }); return; }
    const r = new FileReader(); r.onload = () => this.parseImport(f.name, String(r.result)); r.readAsText(f);
  }
  sampleImport() {
    const lines = ['id,date,user,pc,activity'];
    const users = ['E1001', 'E1002', 'E1006', 'E1009'];
    for (let i = 0; i < 24; i++) { const u = users[i % 4]; lines.push('{S' + (1000 + i) + '},11/' + pad(10 + (i % 4)) + '/2026 ' + pad(8 + (i % 10)) + ':' + pad((i * 7) % 60) + ':00,' + u + ',MLG-' + u + ',' + (i % 5 === 0 ? 'Connect' : i % 2 ? 'Logon' : 'Logoff')); }
    this.parseImport('demo_sample_events.csv', lines.join('\n'));
  }
  confirmImport() {
    const u = this.state.ui; const m = u.impMap;
    if (!m.user || !m.date || !m.activity) { this.ui({ impErr: 'Map the required columns: user, date and activity.' }); return; }
    this.ui({ impBusy: true });
    this.timers.push(setTimeout(() => {
      this.mut((db, actor) => { const id = 'IMP-' + String(db.seq.imp++).padStart(2, '0'); db.imports.unshift({ id, file: u.imp.name, source: u.impSource, rows: u.imp.total, status: 'Validated — staged (not scored)', at: nowTs(), by: actor }); this.audit(db, actor, 'Dataset import', id + ' ' + u.imp.name, 'Validated'); }, 'Import validated and staged — ' + u.imp.total + ' rows (not scored)');
      this.ui({ imp: null, impMap: {}, impErr: '', impBusy: false });
    }, 900));
  }
  savePolicy() {
    const p = this.state.ui.polEdit; const err = {};
    if (!(p.name || '').trim()) err.name = 'Policy name is required.';
    if (!p.cat) err.cat = 'Choose a category.';
    if (!(p.body || '').trim() || p.body.trim().length < 30) err.body = 'Describe the policy (at least 30 characters).';
    if (!p.depts.length) err.depts = 'Select at least one department.';
    if (Object.keys(err).length) { this.ui({ polErr: err }); return; }
    this.mut((db, actor) => {
      if (p.id) { const i = db.policies.findIndex((x) => x.id === p.id); db.policies[i] = Object.assign({}, db.policies[i], p, { name: p.name.trim(), body: p.body.trim(), updated: today() }); this.audit(db, actor, 'Policy updated', p.id + ' ' + p.name.trim()); }
      else { const id = 'POL-' + pad(db.seq.pol++); db.policies.push(Object.assign({}, p, { id, name: p.name.trim(), body: p.body.trim(), updated: today() })); this.audit(db, actor, 'Policy created', id + ' ' + p.name.trim()); }
    }, p.id ? 'Policy saved' : 'Policy created');
    this.ui({ polEdit: null, polErr: {} });
  }
  togglePolicy(p) {
    this.ask((p.enabled ? 'Disable ' : 'Enable ') + p.name + '?', p.enabled ? 'Disabled policies are no longer shown as applicable context on alerts or assigned for acknowledgment.' : 'The policy becomes applicable context for the selected departments.', p.enabled ? 'Disable policy' : 'Enable policy', p.enabled ? 'danger' : 'primary',
      () => this.mut((d, actor) => { const x = d.policies.find((y) => y.id === p.id); x.enabled = !x.enabled; x.updated = today(); this.audit(d, actor, x.enabled ? 'Policy enabled' : 'Policy disabled', p.id + ' ' + p.name); }, p.name + (p.enabled ? ' disabled' : ' enabled')));
  }
  saveEmployee() {
    const e = this.state.ui.empEdit; const err = {}; const db = this.state.db;
    if (!(e.name || '').trim()) err.name = 'Name is required.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.email || '')) err.email = 'Enter a valid email.';
    else if (db.employees.some((x) => x.email.toLowerCase() === e.email.toLowerCase() && x.id !== e.id)) err.email = 'This email is already used.';
    if (!e.dept) err.dept = 'Choose a department.';
    if (!e.role) err.role = 'Choose a job role.';
    if (Object.keys(err).length) { this.ui({ empErr: err }); return; }
    this.mut((d, actor) => {
      if (e.id) { const i = d.employees.findIndex((x) => x.id === e.id); d.employees[i] = Object.assign({}, d.employees[i], { name: e.name.trim(), email: e.email.trim(), dept: e.dept, role: e.role, status: e.status, site: e.site }); this.audit(d, actor, 'Employee updated', e.id + ' ' + e.name.trim()); }
      else { const id = 'E' + d.seq.emp++; d.employees.push({ id, name: e.name.trim(), email: e.email.trim(), dept: e.dept, role: e.role, status: e.status || 'Active', hired: today(), site: e.site || 'Karachi HQ', ext: '', prefName: '' }); this.audit(d, actor, 'Employee created', id + ' ' + e.name.trim()); }
    }, e.id ? 'Employee updated' : 'Employee created — baseline unavailable until activity history exists');
    this.ui({ empEdit: null, empErr: {} });
  }
  toggleUser(x) {
    const me = this.me();
    if (x.id === me.id) { this.toast('You cannot disable your own account.', 'warn'); return; }
    this.ask((x.status === 'Active' ? 'Disable ' : 'Enable ') + x.name + '?', 'Disabled accounts cannot sign in to the prototype.', x.status === 'Active' ? 'Disable account' : 'Enable account', x.status === 'Active' ? 'danger' : 'primary',
      () => this.mut((d, actor) => { const y = d.users.find((z) => z.id === x.id); y.status = y.status === 'Active' ? 'Disabled' : 'Active'; this.audit(d, actor, 'User account ' + (y.status === 'Active' ? 'enabled' : 'disabled'), y.name); }, 'Account updated'));
  }
  addDepartment() {
    const u = this.state.ui, db = this.state.db; const n = u.deptName.trim();
    if (!n) { this.toast('Enter a department name.', 'warn'); return; }
    if (db.departments.some((d) => d.name.toLowerCase() === n.toLowerCase())) { this.toast('That department already exists.', 'warn'); return; }
    this.mut((d, actor) => { d.departments.push({ id: 'D' + d.seq.dept++, name: n }); this.audit(d, actor, 'Department created', n); }, 'Department added');
    this.ui({ deptName: '' });
  }
  addRole() {
    const u = this.state.ui; const n = u.roleName.trim();
    if (!n) { this.toast('Enter a job role.', 'warn'); return; }
    this.mut((d, actor) => { d.roles.push({ id: 'R' + d.seq.role++, name: n, dept: u.roleDept }); this.audit(d, actor, 'Job role created', n + ' (' + u.roleDept + ')'); }, 'Job role added');
    this.ui({ roleName: '' });
  }
  saveRemovable() {
    const f = this.state.ui.rmForm;
    if (!(f.label || '').trim() || !(f.serial || '').trim() || !f.emp) { this.ui({ rmErr: 'Enter the device label, serial and assigned employee.' }); return; }
    this.mut((db, actor) => { const id = 'RM-' + pad(db.seq.rm++); db.removables.push({ id, label: f.label.trim(), serial: f.serial.trim().toUpperCase(), emp: f.emp, approved: true, added: today() }); this.audit(db, actor, 'Device registration', id + ' ' + f.label.trim() + ' (approved removable device)'); }, 'Approved device registered');
    this.ui({ rmForm: { label: '', serial: '', emp: f.emp }, rmErr: '' });
  }
  toggleRemovable(r) {
    this.ask((r.approved ? 'Revoke approval for ' : 'Approve ') + r.label + '?', 'This changes the approved-device context used when reviewing removable-media alerts. It does not block the device in this prototype.', r.approved ? 'Revoke approval' : 'Approve device', r.approved ? 'danger' : 'primary',
      () => this.mut((d, actor) => { const x = d.removables.find((y) => y.id === r.id); x.approved = !x.approved; this.audit(d, actor, x.approved ? 'Device approved' : 'Device approval revoked', r.id + ' ' + r.label); }, 'Device updated'));
  }
  toggleNotify(k) {
    this.mut((d, actor) => { d.settings.notify[k] = !d.settings.notify[k]; this.audit(d, actor, 'Notification preference changed', k); }, 'Preference saved');
  }
  saveOrg(of) {
    if (!(of.name || '').trim()) { this.toast('Organization name is required.', 'warn'); return; }
    this.mut((d, actor) => { d.settings.org = Object.assign({}, of); this.audit(d, actor, 'Organization settings updated', of.name); }, 'Organization settings saved');
    this.ui({ orgForm: null });
  }
  exportCsv(name, header, rows) {
    try {
      const csv = [header].concat(rows).map((r) => r.map(csvCell).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.toast('Exported ' + rows.length + ' rows to ' + name);
    } catch { this.toast('Export is not available in this viewer.', 'warn'); }
    this.mut((db, actor) => this.audit(db, actor, 'Export', name, rows.length + ' rows'));
  }
  refresh() {
    this.ui({ loading: true });
    this.timers.push(setTimeout(() => { this.ui({ loading: false }); this.toast('Dashboard refreshed from demo data'); }, 700));
  }
}
