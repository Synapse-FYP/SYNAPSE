// Policy acknowledgments. Action terminology is standardized:
//   "Read Policy"  – opens the full policy document (every card, same button);
//   "Acknowledge"  – confirms the policy was read and understood (only inside the reader, after ticking the box);
//   "Acknowledged" – non-actionable status once confirmed.
import { useSynapse } from '../../store/index.js';
import { buildEmpPolicies } from '../../viewmodels/employee.js';
import NavIcon from '../../components/common/NavIcon.jsx';

function AcknowledgedStatus({ className = '' }) {
  return <span className={'pill pill-ok status-done ' + className}><NavIcon name="check" />Acknowledged</span>;
}

function PolicyReader({ pr }) {
  return (
    <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div><span className="mono muted small">{pr.id}</span><h1 style={{ fontSize: 22 }}>{pr.name}</h1><div className="tiny muted">{pr.cat} · updated {pr.updated}</div></div>
        {pr.acked && <AcknowledgedStatus />}
      </div>
      <p style={{ margin: 0, lineHeight: 1.7 }}>{pr.body}</p>
      {pr.acked && <div className="feedback fb-ok">You acknowledged this policy on {pr.ackAt}.</div>}
      {pr.needs && (
        <>
          <label className="switch" style={{ border: '1px solid #22304D', borderRadius: 9, padding: '10px 12px' }}><input type="checkbox" checked={pr.agree} onChange={pr.setAgree} /><span className="small">I have read and understood this policy.</span></label>
          <div className="row"><button type="button" className="btn btn-primary policy-action" onClick={pr.ack} disabled={pr.ackDis}><NavIcon name="check" />Acknowledge</button></div>
        </>
      )}
    </section>
  );
}

export default function EmpPolicyAckPage() {
  const { store } = useSynapse();
  const V = buildEmpPolicies(store);
  if (V.polReadShow) return <PolicyReader pr={V.pr} />;
  return (
    <div className="stack">
      <h1>Policy Acknowledgments</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        {V.epol.map((p) => (
          <section key={p.id} className="ecard policy-card">
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}><h2>{p.name}</h2><span className="mono muted small policy-id">{p.id}</span></div>
            <div className="tiny muted">{p.cat} · updated {p.updated}</div>
            <div className="stack" style={{ gap: 4, marginTop: 4 }}>
              {p.done ? <AcknowledgedStatus /> : <span className={p.cls} style={{ alignSelf: 'flex-start' }}>{p.status}</span>}
              <span className={p.noteCls}>{p.note}</span>
            </div>
            <div className="policy-card-f">
              <button type="button" className="btn btn-secondary btn-sm policy-action" onClick={p.go} aria-label={'Read Policy: ' + p.name}><NavIcon name="book" />Read Policy</button>
            </div>
          </section>
        ))}
      </div>
      <section className="ecard">
        <h2>Completed acknowledgments</h2>
        <div className="stack" style={{ gap: 6, marginTop: 8 }}>{V.epolDone.map((a) => <div key={a.key} className="row small" style={{ justifyContent: 'space-between' }}><span>{a.name}</span><span className="mono muted">{a.at}</span></div>)}</div>
      </section>
    </div>
  );
}
