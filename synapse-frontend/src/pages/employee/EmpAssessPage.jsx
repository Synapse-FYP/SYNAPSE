import { useSynapse } from '../../store/index.js';
import { buildEmpAssess } from '../../viewmodels/employee.js';
import QuizQuestion from '../../components/common/QuizQuestion.jsx';

function AssessmentRun({ ar }) {
  return (
    <>
      <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><h1 style={{ fontSize: 22 }}>{ar.title}</h1><p className="small muted" style={{ margin: '4px 0 0' }}>{ar.desc} · {ar.n} questions · no personal information is collected.</p></div>
        <div>
          <div className="row tiny muted" style={{ justifyContent: 'space-between' }}><span>{ar.answered} of {ar.n} answered</span><span>{ar.pct}%</span></div>
          <div className="prog" style={{ marginTop: 4 }}><div style={{ width: ar.pct + '%' }} /></div>
        </div>
        {ar.qs.map((q) => <QuizQuestion key={q.n} q={q} suffix={q.missing ? <span className="errtext"> — required</span> : null} />)}
        {ar.hasErr && <div className="banner banner-warn" role="alert">{ar.err}</div>}
        {ar.result && <div className="feedback fb-ok"><b>Submitted — {ar.score} of {ar.n} correct.</b> {ar.feedback}</div>}
        <div className="row"><button type="button" className="btn btn-primary" onClick={ar.submit} disabled={ar.result}>Submit assessment</button></div>
      </section>
    </>
  );
}

export default function EmpAssessPage() {
  const { store } = useSynapse();
  const V = buildEmpAssess(store);
  return (
    <>
      <section className="ecard" style={{ marginBottom: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div><h2>Security assessments &amp; phishing</h2><p className="small muted" style={{ margin: '6px 0 0' }}>Complete your assigned assessments and practice recognizing suspicious email.</p></div>
          <button type="button" className="btn btn-secondary" onClick={() => store.go('phish', { phIdx: 0, phAnswers: {}, phDone: false })}>Open phishing exercise</button>
        </div>
      </section>
      {V.aActive ? <AssessmentRun ar={V.ar} /> : (
        <div className="stack">
          <h1>Security Assessments</h1>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
            {V.asCards.map((a) => (
              <section key={a.k} className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h2>{a.title}</h2><p className="small muted" style={{ margin: 0 }}>{a.desc}</p>
                <div className="tiny muted">{a.n} questions · {a.assigned}</div><div className="small">{a.status}</div>
                <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={a.go}>{a.btn}</button>
              </section>
            ))}
          </div>
          <section className="ecard">
            <h2>Completion history</h2>
            {V.asHistory.length > 0 ? (
              <table className="t" style={{ marginTop: 8 }}>
                <thead><tr><th>Record</th><th>Assessment</th><th>Score</th><th>Submitted</th></tr></thead>
                <tbody>{V.asHistory.map((x) => <tr key={x.id}><td className="mono">{x.id}</td><td>{x.title}</td><td className="mono">{x.score}</td><td className="mono small">{x.at}</td></tr>)}</tbody>
              </table>
            ) : <div className="empty">No assessments submitted yet.</div>}
          </section>
        </div>
      )}
    </>
  );
}
