// Employee portal derived data (ported from the original renderEmployee).
import { DEMO_TODAY } from '../lib/constants.js';
import { fD, fTs, today, addDays, statusCls, initials } from '../lib/utils.js';
import { MODULES, ASSESS, PHISH } from '../data/content.js';
import { memoByState } from './common.js';

const dueCls = (d) => (d < today() ? 'due due-over' : d <= addDays(today(), 3) ? 'due due-soon' : 'due');

function ctx(store) {
  const { db } = store.state; const me = store.me(); const eid = me.id; const e = me.emp;
  const mine = db.interventions.filter((i) => i.emp === eid);
  const open = mine.filter((i) => i.status !== 'Completed');
  return { db, me, eid, e, mine, open };
}

export const getEmpNavBadges = memoByState((store) => {
  const { db, eid } = ctx(store);
  const v = db.verifications.filter((x) => x.emp === eid && !x.respondedAt).length;
  const t = db.interventions.filter((i) => i.emp === eid && i.type === 'Training' && i.status !== 'Completed').length;
  return { verify: v ? String(v) : '', training: t ? String(t) : '' };
});

export const buildEmpHome = memoByState((store) => {
  const { db, eid, e, mine, open } = ctx(store);
  const first = (e.prefName || e.name).split(' ')[0];
  const H = {
    first,
    training: open.filter((i) => i.type === 'Training').map((i) => ({ id: i.id, title: store.refLabel(i.ref), due: fD(i.due), dueCls: dueCls(i.due), progress: i.progress, go: () => store.go('training', { tModule: i.id, tStep: Math.min(i.step || 0, MODULES[i.ref].sections.length), tAnswers: {}, tChecked: false }) })),
    assess: open.filter((i) => i.type === 'Assessment').map((i) => ({ id: i.id, title: store.refLabel(i.ref), due: fD(i.due), dueCls: dueCls(i.due), go: () => store.go('assess', { aRun: i.ref, aAnswers: {}, aErr: '', aResult: null }) })),
    phish: open.filter((i) => i.type === 'Phishing exercise').map((i) => ({ id: i.id, due: fD(i.due), go: () => store.go('phish', { phIdx: 0, phAnswers: {}, phDone: false }) })),
    policies: open.filter((i) => i.type === 'Policy acknowledgment').map((i) => ({ id: i.id, title: store.refLabel(i.ref).replace(' (acknowledgment)', ''), due: fD(i.due), dueCls: dueCls(i.due), go: () => store.go('policyack', { polRead: i.ref, polAgree: false }) })),
    verifs: db.verifications.filter((v) => v.emp === eid && !v.respondedAt).map((v) => ({ id: v.id, reason: v.reason, when: fTs(v.created), go: () => store.go('verify', { vSel: v.id, vChoice: '', vComment: '', vErr: '' }) })),
    done: mine.filter((i) => i.status === 'Completed').length, total: mine.length,
  };
  H.pct = H.total ? Math.round(H.done / H.total * 100) : 100;
  H.ring = { background: 'conic-gradient(#22D3EE 0, #8B5CF6 ' + H.pct + '%, #1C2740 ' + H.pct + '% 100%)' };
  H.allClear = open.length === 0 && H.verifs.length === 0;
  H.deadlines = open.map((i) => ({ id: i.id, title: store.refLabel(i.ref), type: i.type, due: i.due })).sort((a, b) => (a.due < b.due ? -1 : 1)).slice(0, 5).map((x) => Object.assign(x, { dueL: fD(x.due), dueCls: dueCls(x.due) }));
  const notes = [];
  mine.forEach((i) => notes.push({ ts: i.assigned + ' 09:00', text: 'New ' + i.type.toLowerCase() + ' assigned: ' + store.refLabel(i.ref) }));
  db.verifications.filter((v) => v.emp === eid).forEach((v) => notes.push({ ts: v.created, text: 'Verification request ' + v.id + ' received' }));
  db.policies.filter((p) => p.ack && (p.depts.indexOf('All departments') >= 0 || p.depts.indexOf(e.dept) >= 0) && p.updated >= addDays(DEMO_TODAY, -14)).forEach((p) => notes.push({ ts: p.updated + ' 08:00', text: 'Policy updated: ' + p.name }));
  H.notes = notes.sort((a, b) => (a.ts < b.ts ? 1 : -1)).slice(0, 5).map((n) => Object.assign(n, { when: fD(n.ts) }));
  return H;
});

export const buildEmpTraining = memoByState((store) => {
  const { ui: u } = store.state; const { mine } = ctx(store);
  const V = {};
  const tr = mine.filter((i) => i.type === 'Training');
  V.trCards = tr.map((i) => {
    const m = MODULES[i.ref];
    return {
      id: i.id, title: m.title, desc: m.desc, mins: m.mins, assigned: fD(i.assigned), due: fD(i.due), dueCls: dueCls(i.due), progress: i.progress, status: i.status, cls: statusCls(i.status),
      btn: i.status === 'Completed' ? 'Review' : i.progress > 0 ? 'Continue' : 'Start',
      go: () => store.ui({ tModule: i.id, tStep: i.status === 'Completed' ? 0 : Math.min(i.step || 0, m.sections.length), tAnswers: {}, tChecked: false }),
    };
  });
  V.trEmpty = tr.length === 0;
  const ti = tr.find((i) => i.id === u.tModule); V.tActive = !!ti;
  if (ti) {
    const m = MODULES[ti.ref]; const total = m.sections.length; const st = u.tStep; const onQuiz = st >= total; const done = ti.status === 'Completed';
    V.tm = {
      title: m.title, total, stepLabel: onQuiz ? 'Review questions' : 'Section ' + (st + 1) + ' of ' + total, onQuiz, sec: onQuiz ? null : m.sections[st], done,
      back: () => store.ui({ tModule: '' }),
      steps: m.sections.map((x, k) => ({ n: k + 1, h: x.h, cls: 'tstep' + (k === st ? ' on' : '') + (k < st || done ? ' done' : ''), go: () => store.ui({ tStep: k }) }))
        .concat([{ n: '✓', h: 'Review questions', cls: 'tstep' + (onQuiz ? ' on' : '') + (done ? ' done' : ''), go: () => store.ui({ tStep: total }) }]),
      pct: done ? 100 : Math.round(st / (total + 1) * 100), prev: () => store.ui({ tStep: Math.max(0, st - 1) }), prevDis: st === 0,
      next: () => store.trainingNext(ti.id), check: () => store.trainingCheck(ti.id),
      qs: m.qs.map((q, qi) => ({
        q: q.q, n: qi + 1,
        opts: q.o.map((o, oi) => {
          const picked = u.tAnswers[qi] === oi; const show = u.tChecked || done;
          return { o, name: 'tq' + qi, checked: picked, cls: 'opt' + (picked ? ' picked' : '') + (show && oi === q.a ? ' right' : '') + (show && picked && oi !== q.a ? ' wrong' : ''), pick: () => store.ui((x) => ({ tAnswers: Object.assign({}, x.tAnswers, { [qi]: oi }), tChecked: false })) };
        }),
      })),
    };
  }
  return V;
});

export const buildEmpAssess = memoByState((store) => {
  const { db, ui: u } = store.state; const { eid, mine } = ctx(store);
  const V = {};
  const asg = mine.filter((i) => i.type === 'Assessment');
  const subs = db.assessSubs.filter((x) => x.emp === eid);
  V.asCards = Object.keys(ASSESS).map((k) => {
    const a = ASSESS[k]; const it = asg.find((i) => i.ref === k); const last = subs.find((x) => x.assess === k);
    return { k, title: a.title, desc: a.desc, n: a.qs.length, assigned: it ? 'Assigned · due ' + fD(it.due) : 'Optional', status: last ? 'Submitted ' + fD(last.at) + ' · ' + last.score + '/' + last.total : it ? 'Not started' : 'Available', btn: last ? 'Retake' : 'Start', go: () => store.ui({ aRun: k, aAnswers: {}, aErr: '', aResult: null }) };
  });
  V.asHistory = subs.map((x) => ({ id: x.id, title: ASSESS[x.assess].title, score: x.score + '/' + x.total, at: fTs(x.at) }));
  V.aActive = !!u.aRun && !!ASSESS[u.aRun];
  if (V.aActive) {
    const a = ASSESS[u.aRun]; const answered = Object.keys(u.aAnswers).length; const res = u.aResult;
    V.ar = {
      title: a.title, desc: a.desc, n: a.qs.length, answered, pct: Math.round(answered / a.qs.length * 100), err: u.aErr, hasErr: !!u.aErr, result: !!res, score: res ? res.score : 0,
      back: () => store.ui({ aRun: '', aResult: null }), submit: () => store.submitAssessment(u.aRun),
      qs: a.qs.map((q, qi) => ({
        n: qi + 1, q: q.q, missing: !!u.aErr && u.aAnswers[qi] === undefined,
        opts: q.o.map((o, oi) => {
          const picked = u.aAnswers[qi] === oi;
          return { o, name: 'aq' + qi, checked: picked, cls: 'opt' + (picked ? ' picked' : '') + (res && oi === q.a ? ' right' : '') + (res && picked && oi !== q.a ? ' wrong' : ''), pick: () => { if (res) return; store.ui((x) => ({ aAnswers: Object.assign({}, x.aAnswers, { [qi]: oi }), aErr: '' })); } };
        }),
      })),
    };
    V.ar.feedback = res ? (res.score === res.total ? 'Excellent — every answer was correct.' : res.score >= res.total - 1 ? 'Good result. Review the highlighted question.' : 'Review the highlighted questions; the explanations in My Training can help.') : '';
  }
  return V;
});

export const buildEmpPhish = memoByState((store) => {
  const { db, ui: u } = store.state; const { eid } = ctx(store);
  const ph = PHISH[u.phIdx]; const ans = u.phAnswers[u.phIdx];
  const myRuns = db.phishRuns.filter((x) => x.emp === eid);
  const canFinish = Object.keys(u.phAnswers).length === PHISH.length;
  return {
    idx: u.phIdx + 1, total: PHISH.length, pct: Math.round(Object.keys(u.phAnswers).length / PHISH.length * 100), msg: ph, answered: ans !== undefined,
    verdict: ph.phish ? 'This was a phishing message.' : 'This message was legitimate.', ind: ph.ind,
    yes: () => store.phishAnswer(u.phIdx, true), no: () => store.phishAnswer(u.phIdx, false),
    next: () => store.ui({ phIdx: Math.min(PHISH.length - 1, u.phIdx + 1) }), prev: () => store.ui({ phIdx: Math.max(0, u.phIdx - 1) }),
    prevDis: u.phIdx === 0, isLast: u.phIdx === PHISH.length - 1, finish: () => store.phishFinish(), done: u.phDone,
    finishDis: !canFinish || !!u.phDone, restart: () => store.ui({ phIdx: 0, phAnswers: {}, phDone: false }),
    score: PHISH.filter((p, i) => u.phAnswers[i] === p.phish).length, history: myRuns.map((r) => ({ id: r.id, score: r.score + '/' + r.total, at: fTs(r.at) })),
    fbCls: ans === ph.phish ? 'feedback fb-ok' : 'feedback fb-bad', yesCls: 'btn ' + (ans === true ? 'btn-primary' : 'btn-secondary'), noCls: 'btn ' + (ans === false ? 'btn-primary' : 'btn-secondary'),
  };
});

export const buildEmpPolicies = memoByState((store) => {
  const { db, ui: u } = store.state; const { eid, e, open } = ctx(store);
  const V = {};
  const applicable = db.policies.filter((p) => p.enabled && (p.depts.indexOf('All departments') >= 0 || p.depts.indexOf(e.dept) >= 0));
  V.epol = applicable.map((p) => {
    const ack = db.acks.filter((a) => a.policy === p.id && a.emp === eid).slice(-1)[0]; const req = open.find((i) => i.ref === p.id);
    return {
      id: p.id, name: p.name, cat: p.cat, updated: fD(p.updated),
      // Status is display-only; opening a policy never acknowledges it.
      done: !!ack, status: ack ? 'Acknowledged' : p.ack ? (req ? 'Acknowledgment required' : 'Acknowledgment requested') : 'For information',
      note: ack ? 'Acknowledged on ' + fTs(ack.at) : p.ack ? (req ? 'Due ' + fD(req.due) + ' · open the policy to acknowledge it' : 'Open the policy to acknowledge it') : 'No acknowledgment needed',
      noteCls: 'tiny ' + (!ack && req ? dueCls(req.due) : 'muted'),
      cls: 'pill ' + (ack ? 'pill-ok' : p.ack ? 'pill-warn' : 'pill-idle'), go: () => store.ui({ polRead: p.id, polAgree: false }),
    };
  });
  const pr = db.policies.find((p) => p.id === u.polRead); V.polReadShow = !!pr;
  if (pr) {
    const ack = db.acks.filter((a) => a.policy === pr.id && a.emp === eid).slice(-1)[0];
    V.pr = {
      id: pr.id, name: pr.name, cat: pr.cat, body: pr.body, updated: fD(pr.updated), acked: !!ack, ackAt: ack ? fTs(ack.at) : '', needs: pr.ack && !ack, agree: u.polAgree,
      setAgree: (ev) => store.ui({ polAgree: ev.target.checked }), ack: () => store.ackPolicy(pr.id), back: () => store.ui({ polRead: '', polAgree: false }), ackDis: !u.polAgree,
    };
  }
  V.epolDone = db.acks.filter((a) => a.emp === eid).map((a, i) => ({ key: a.policy + a.at + i, name: (db.policies.find((p) => p.id === a.policy) || { name: a.policy }).name, at: fTs(a.at) })).reverse();
  return V;
});

const VERIFY_CHOICES = [['confirmed', 'Yes — this was me', 'I performed this activity for a legitimate work reason.'], ['disputed', 'No — I don’t recognise this', 'I did not perform this activity.'], ['unsure', 'I’m not sure', 'I need help from the security team.']];

export const buildEmpVerify = memoByState((store) => {
  const { db, ui: u } = store.state; const { eid } = ctx(store);
  const V = {};
  const vs = db.verifications.filter((v) => v.emp === eid);
  V.ev = vs.map((v) => ({ id: v.id, reason: v.reason, when: fTs(v.created), status: v.status, cls: 'st ' + (v.respondedAt ? 'st-completed' : 'st-pending'), go: () => store.ui({ vSel: v.id, vChoice: '', vComment: '', vErr: '' }) }));
  V.evEmpty = vs.length === 0;
  const vsel = vs.find((v) => v.id === u.vSel); V.vShow = !!vsel;
  if (vsel) {
    V.vr = {
      id: vsel.id, reason: vsel.reason, instructions: vsel.instructions, when: fTs(vsel.created), pending: !vsel.respondedAt, status: vsel.status, comment: vsel.comment, responded: fTs(vsel.respondedAt),
      err: u.vErr, hasErr: !!u.vErr, comm: u.vComment, back: () => store.ui({ vSel: '' }), submit: () => store.respondVerify(vsel.id),
      setComment: (ev) => store.ui({ vComment: ev.target.value, vErr: '' }),
      choices: VERIFY_CHOICES.map((c) => ({ v: c[0], l: c[1], d: c[2], checked: u.vChoice === c[0], cls: 'choice' + (u.vChoice === c[0] ? ' on' : ''), pick: () => store.ui({ vChoice: c[0], vErr: '' }) })),
    };
  }
  return V;
});

export const buildEmpHistory = memoByState((store) => {
  const { db } = store.state; const { eid, mine } = ctx(store);
  const subs = db.assessSubs.filter((x) => x.emp === eid);
  const myRuns = db.phishRuns.filter((x) => x.emp === eid);
  const vs = db.verifications.filter((v) => v.emp === eid);
  const hist = [];
  mine.forEach((i) => {
    hist.push({ ts: i.assigned + ' 09:00', type: i.type, text: i.type + ' assigned: ' + store.refLabel(i.ref), cls: 'hdot hdot-assign' });
    if (i.status === 'Completed') hist.push({ ts: (i.completed || i.assigned) + ' 17:00', type: i.type, text: i.type + ' completed: ' + store.refLabel(i.ref), cls: 'hdot hdot-done' });
  });
  subs.forEach((x) => hist.push({ ts: x.at, type: 'Assessment', text: 'Assessment submitted: ' + ASSESS[x.assess].title + ' (' + x.score + '/' + x.total + ')', cls: 'hdot hdot-done' }));
  myRuns.forEach((x) => hist.push({ ts: x.at, type: 'Phishing exercise', text: 'Phishing exercise result ' + x.score + '/' + x.total, cls: 'hdot hdot-done' }));
  db.acks.filter((a) => a.emp === eid).forEach((a) => hist.push({ ts: a.at, type: 'Policy', text: 'Policy acknowledged: ' + (db.policies.find((p) => p.id === a.policy) || { name: a.policy }).name, cls: 'hdot hdot-done' }));
  vs.filter((v) => v.respondedAt).forEach((v) => hist.push({ ts: v.respondedAt, type: 'Verification', text: 'Verification ' + v.id + ' answered: ' + v.status, cls: 'hdot hdot-done' }));
  return hist.sort((a, b) => (a.ts < b.ts ? 1 : -1)).map((h) => Object.assign(h, { when: fTs(h.ts) }));
});

export const buildEmpProfile = memoByState((store) => {
  const { db, ui: u } = store.state; const { eid, e } = ctx(store);
  const pf = u.profForm || { prefName: e.prefName || '', ext: e.ext || '' };
  const np = db.settings.empNotify[eid] || { email: true, reminders: true, digest: false };
  const baseForm = (x) => x.profForm || { prefName: e.prefName || '', ext: e.ext || '' };
  return {
    name: e.name, id: e.id, dept: e.dept, role: e.role, email: e.email, site: e.site, hired: fD(e.hired), prefName: pf.prefName, ext: pf.ext,
    initials: initials(e.name), status: e.status || 'Active', statusCls: 'pill ' + (e.status === 'Inactive' ? 'pill-idle' : 'pill-ok'),
    savedPref: e.prefName || '', savedExt: e.ext || '',
    devices: db.endpoints.filter((x) => x.emp === eid).map((x) => ({ name: x.name, os: x.os })).concat(db.removables.filter((r) => r.emp === eid && r.approved).map((r) => ({ name: r.label, os: 'Approved removable device' }))),
    setPref: (ev) => { const v = ev.target.value; store.ui((x) => ({ profForm: Object.assign({}, baseForm(x), { prefName: v }) })); },
    setExt: (ev) => { const v = ev.target.value.replace(/[^0-9]/g, '').slice(0, 5); store.ui((x) => ({ profForm: Object.assign({}, baseForm(x), { ext: v }) })); },
    save: () => store.saveEmployeeProfile(eid, pf), saveDis: !u.profForm,
    notif: [['email', 'Email me when something new is assigned'], ['reminders', 'Send reminders 2 days before a due date'], ['digest', 'Weekly summary of my awareness activities']]
      .map((n) => ({ k: n[0], label: n[1], on: !!np[n[0]], toggle: () => store.toggleEmpNotify(eid, n[0]) })),
  };
});
