import { useSynapse } from '../../store/index.js';
import { buildEmpTraining } from '../../viewmodels/employee.js';
import QuizQuestion from '../../components/common/QuizQuestion.jsx';

function TrainingModule({ tm }) {
  return (
    <>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(200px, 260px) minmax(0, 1fr)', alignItems: 'start' }}>
        <aside className="ecard" style={{ padding: 12 }}>
          <div className="lbl" style={{ padding: '4px 8px 8px' }}>{tm.title}</div>
          {tm.steps.map((s) => <button key={s.n} type="button" className={s.cls} onClick={s.go}><span className="tstep-n">{s.n}</span>{s.h}</button>)}
          <div className="prog" style={{ margin: '12px 8px 4px' }}><div style={{ width: tm.pct + '%' }} /></div>
          <div className="tiny muted" style={{ padding: '0 8px' }}>{tm.pct}% complete</div>
        </aside>
        <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 360 }}>
          <div className="tiny muted">{tm.stepLabel}</div>
          {tm.onQuiz && (
            <>
              <h2>Review questions</h2>
              <p className="small muted" style={{ margin: 0 }}>Answer every question, then check your answers. You need at least {tm.total} sections reviewed and all but one answer correct to complete the module.</p>
              {tm.qs.map((q) => <QuizQuestion key={q.n} q={q} />)}
              {tm.done && <div className="feedback fb-ok"><b>Module completed.</b> Your completion has been recorded and shared with the security team.</div>}
              <div className="row"><button type="button" className="btn btn-secondary" onClick={tm.prev}>Back</button><button type="button" className="btn btn-primary" onClick={tm.check} disabled={tm.done}>Check answers &amp; complete</button></div>
            </>
          )}
          {tm.sec && (
            <>
              <h2 style={{ fontSize: 20 }}>{tm.sec.h}</h2>
              <p style={{ margin: 0, lineHeight: 1.65 }}>{tm.sec.p}</p>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>{tm.sec.pts.map((p) => <li key={p}>{p}</li>)}</ul>
              <div className="row" style={{ marginTop: 'auto' }}><button type="button" className="btn btn-secondary" onClick={tm.prev} disabled={tm.prevDis}>Previous</button><button type="button" className="btn btn-primary" onClick={tm.next}>Next section</button></div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default function EmpTrainingPage() {
  const { store } = useSynapse();
  const V = buildEmpTraining(store);
  if (V.tActive) return <TrainingModule tm={V.tm} />;
  return (
    <div className="stack">
      <h1>My Training</h1>
      {V.trEmpty && <div className="ecard empty">No training assigned right now.</div>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        {V.trCards.map((t) => (
          <section key={t.id} className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}><h2>{t.title}</h2><span className={t.cls}>{t.status}</span></div>
            <p className="small muted" style={{ margin: 0 }}>{t.desc}</p>
            <div className="tiny muted">About {t.mins} minutes · assigned {t.assigned} · <span className={t.dueCls}>due {t.due}</span></div>
            <div className="prog"><div style={{ width: t.progress + '%' }} /></div><div className="tiny muted">{t.progress}% complete</div>
            <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={t.go}>{t.btn}</button>
          </section>
        ))}
      </div>
    </div>
  );
}
