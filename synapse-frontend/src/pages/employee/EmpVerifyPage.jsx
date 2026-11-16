import { useSynapse } from '../../store/index.js';
import { buildEmpVerify } from '../../viewmodels/employee.js';

function VerificationResponse({ vr }) {
  return (
    <>
      <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
        <div><span className="mono muted small">{vr.id} · received {vr.when}</span><h1 style={{ fontSize: 22 }}>Please confirm recent activity</h1></div>
        <div className="banner banner-info">{vr.reason}</div>
        <p className="small" style={{ margin: 0 }}>{vr.instructions}</p>
        {vr.pending ? (
          <>
            <div className="stack" style={{ gap: 8 }} role="radiogroup" aria-label="Your response">
              {vr.choices.map((c) => (
                <label key={c.v} className={c.cls}>
                  <input type="radio" name="vchoice" checked={c.checked} onChange={c.pick} style={{ marginTop: 3, accentColor: '#22D3EE' }} />
                  <span><b className="small">{c.l}</b><br /><span className="tiny muted">{c.d}</span></span>
                </label>
              ))}
            </div>
            <div className="field"><label htmlFor="v-c">Comment <span className="tiny muted">(required if you confirm the activity)</span></label><textarea id="v-c" className="textarea" value={vr.comm} onChange={vr.setComment} placeholder="e.g. Copied release builds for the client demo on Thursday." /></div>
            {vr.hasErr && <div className="errtext" role="alert">{vr.err}</div>}
            <div className="row"><button type="button" className="btn btn-primary" onClick={vr.submit}>Send response</button></div>
          </>
        ) : (
          <div className="feedback fb-ok">You responded on {vr.responded}: <b>{vr.status}</b>. {vr.comment}</div>
        )}
      </section>
    </>
  );
}

export default function EmpVerifyPage() {
  const { store } = useSynapse();
  const V = buildEmpVerify(store);
  if (V.vShow) return <VerificationResponse vr={V.vr} />;
  return (
    <div className="stack">
      <h1>Verification Requests</h1>
      <p className="small muted" style={{ margin: 0 }}>Occasionally the security team may ask you to confirm activity on your account or devices. This is a simulated confirmation in the prototype — not multi-factor authentication.</p>
      {V.evEmpty && <div className="ecard empty">You have no verification requests.</div>}
      {V.ev.map((v) => (
        <section key={v.id} className="ecard" style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="row" style={{ gap: 8 }}><span className="mono small">{v.id}</span><span className={v.cls}>{v.status}</span></div>
            <p className="small" style={{ margin: '6px 0 0' }}>{v.reason}</p>
            <div className="tiny muted" style={{ marginTop: 4 }}>Received {v.when}</div>
          </div>
          <button type="button" className="btn btn-primary" onClick={v.go}>Open request</button>
        </section>
      ))}
    </div>
  );
}
