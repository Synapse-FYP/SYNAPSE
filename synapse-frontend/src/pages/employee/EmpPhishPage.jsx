import { useSynapse } from '../../store/index.js';
import { buildEmpPhish } from '../../viewmodels/employee.js';

export default function EmpPhishPage() {
  const { store } = useSynapse();
  const ph = buildEmpPhish(store);
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}><h1>Phishing Awareness</h1><span className="tag-sim">Simulated exercise · no real emails are sent</span></div>
      {ph.done && (
        <section className="ecard" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <h2>Exercise complete</h2>
          <div className="kpi-v" style={{ fontSize: 36 }}>{ph.score} / {ph.total}</div>
          <p className="small muted" style={{ margin: 0 }}>Your result has been recorded. Keep checking senders, links and urgency in real messages.</p>
          <button type="button" className="btn btn-secondary" onClick={ph.restart}>Practice again</button>
        </section>
      )}
      <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="row tiny muted" style={{ justifyContent: 'space-between' }}><span>Message {ph.idx} of {ph.total}</span><span>{ph.pct}% answered</span></div>
          <div className="prog" style={{ marginTop: 4 }}><div style={{ width: ph.pct + '%' }} /></div>
        </div>
        <div className="mail">
          <div className="mail-h"><span><span className="muted">From:</span> <span className="mono">{ph.msg.from}</span></span><span><span className="muted">Subject:</span> <b>{ph.msg.subject}</b></span></div>
          <div style={{ padding: '16px 14px', lineHeight: 1.6 }}>{ph.msg.body}</div>
        </div>
        <div className="row">
          <span className="small" style={{ fontWeight: 600 }}>Is this message phishing?</span>
          <button type="button" className={ph.yesCls} onClick={ph.yes}>Report as phishing</button>
          <button type="button" className={ph.noCls} onClick={ph.no}>Looks legitimate</button>
        </div>
        {ph.answered && (
          <div className={ph.fbCls} role="status"><b>{ph.verdict}</b><ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{ph.ind.map((t) => <li key={t}>{t}</li>)}</ul></div>
        )}
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={ph.prev} disabled={ph.prevDis}>Previous</button>
          <button type="button" className="btn btn-secondary" onClick={ph.next} disabled={ph.isLast}>Next message</button>
          <button type="button" className="btn btn-primary" onClick={ph.finish} disabled={ph.finishDis}>Finish exercise</button>
        </div>
      </section>
      {ph.history.length > 0 && (
        <section className="ecard">
          <h2>Previous results</h2>
          {ph.history.map((r) => <div key={r.id} className="row small" style={{ justifyContent: 'space-between', padding: '6px 0' }}><span className="mono">{r.id}</span><span>{r.score}</span><span className="mono muted">{r.at}</span></div>)}
        </section>
      )}
    </>
  );
}
