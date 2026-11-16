import { useSynapse } from '../../store/index.js';
import { buildEmpHome } from '../../viewmodels/employee.js';
import NavIcon from '../../components/common/NavIcon.jsx';

export default function EmpHomePage() {
  const { store } = useSynapse();
  const H = buildEmpHome(store);
  return (
    <>
      <section className="ecard" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}><h1>Welcome back, {H.first}</h1><p className="muted" style={{ margin: '6px 0 0' }}>Here is what needs your attention. Security awareness activities help everyone stay safe — reporting a false alarm is always welcome.</p></div>
        <div className="row" style={{ gap: 14 }}>
          <div className="ring" style={H.ring}><div className="ring-in">{H.pct}%<span className="tiny muted" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>complete</span></div></div>
          <div className="small"><b>{H.done} of {H.total}</b> awareness activities<br /><span className="muted">completed this cycle</span></div>
        </div>
      </section>
      {H.allClear && <div className="ecard" style={{ textAlign: 'center' }}><h2>You’re all caught up</h2><p className="muted small" style={{ margin: '6px 0 0' }}>No pending training, assessments, acknowledgments or verification requests.</p></div>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
        <section className="ecard">
          <h2>Action needed</h2>
          <div style={{ marginTop: 6 }}>
            {H.verifs.map((v) => <div key={v.id} className="action-row"><span className="pill pill-violet">Verification</span><div style={{ flex: 1, minWidth: 180 }}><b className="small">Request {v.id}</b><div className="tiny muted">{v.when}</div></div><button type="button" className="btn btn-violet btn-sm" onClick={v.go}>Respond to verification</button></div>)}
            {H.training.map((t) => <div key={t.id} className="action-row"><span className="pill pill-cyan">Training</span><div style={{ flex: 1, minWidth: 180 }}><b className="small">{t.title}</b><div className="prog" style={{ margin: '4px 0' }}><div style={{ width: t.progress + '%' }} /></div><span className={t.dueCls}>Due {t.due}</span></div><button type="button" className="btn btn-primary btn-sm" onClick={t.go}>Continue training</button></div>)}
            {H.assess.map((a) => <div key={a.id} className="action-row"><span className="pill pill-warn">Assessment</span><div style={{ flex: 1, minWidth: 180 }}><b className="small">{a.title}</b><div className={a.dueCls}>Due {a.due}</div></div><button type="button" className="btn btn-secondary btn-sm" onClick={a.go}>Start assessment</button></div>)}
            {H.policies.map((p) => <div key={p.id} className="action-row"><span className="pill pill-idle">Policy</span><div style={{ flex: 1, minWidth: 180 }}><b className="small">{p.title}</b><div className={p.dueCls}>Acknowledge by {p.due}</div></div><button type="button" className="btn btn-secondary btn-sm policy-action" onClick={p.go}><NavIcon name="book" />Read Policy</button></div>)}
            {H.phish.map((p) => <div key={p.id} className="action-row"><span className="pill pill-ok">Exercise</span><div style={{ flex: 1, minWidth: 180 }}><b className="small">Phishing-recognition exercise</b><div className="due">Due {p.due}</div></div><button type="button" className="btn btn-secondary btn-sm" onClick={p.go}>Start exercise</button></div>)}
          </div>
        </section>
        <section className="ecard">
          <h2>Upcoming deadlines</h2>
          <div className="stack" style={{ gap: 8, marginTop: 10 }}>
            {H.deadlines.map((d) => <div key={d.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><span>{d.title} <span className="tiny muted">· {d.type}</span></span><span className={d.dueCls}>{d.dueL}</span></div>)}
          </div>
          <h2 style={{ marginTop: 20 }}>Recent notifications</h2>
          <div className="stack" style={{ gap: 8, marginTop: 10 }}>
            {H.notes.map((n, i) => <div key={i} className="small"><span className="tiny muted mono">{n.when}</span><div>{n.text}</div></div>)}
          </div>
          <button type="button" className="link small" style={{ marginTop: 12 }} onClick={() => store.go('history')}>View my activity history →</button>
        </section>
      </div>
      <p className="tiny muted" style={{ margin: 0 }}>SYNAPSE is transparent: security monitoring covers work devices and accounts as described in company policy. Investigation records and analyst notes are not shown here.</p>
    </>
  );
}
