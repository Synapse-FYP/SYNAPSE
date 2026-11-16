// Slide-in alert detail drawer for staff pages.
import { useSynapse } from '../../store/index.js';
import { getBase, getAlertDetail } from '../../viewmodels/common.js';

export default function AlertDrawer() {
  const { state, store } = useSynapse();
  const id = state.ui.drawer;
  if (!id) return null;
  const d = getAlertDetail(store, id);
  if (!d) return null;
  const { isAnalyst, analysts, statusOpts } = getBase(store);
  const close = () => store.ui({ drawer: '' });
  return (
    <>
      <div className="scrim" onClick={close} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Alert details">
        <div className="drawer-h">
          <span className="mono" style={{ fontWeight: 600 }}>{d.id}</span>
          <span className={d.sevCls}>{d.sev} · {d.score}</span>
          <span className={d.statusCls}>{d.status}</span>
          <button type="button" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={close} aria-label="Close alert details">✕ Close</button>
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <section className="card card-b" style={{ padding: 16 }}>
            <h2>{d.reason}</h2>
            <div className="small muted" style={{ marginTop: 4 }}>{d.when} · {d.catLabel} · {d.model}</div>
            <div className="scorebar" style={{ margin: '14px 0 4px' }}><span className="scorepin" style={{ left: d.scoreW + '%' }} /></div>
            <div className="tiny muted">Anomaly score {d.score}/100 (simulated). Indicates deviation from the employee’s baseline — not a probability of malicious intent.</div>
          </section>
          <section className="card card-b" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Employee</h3>
            <dl className="kv" style={{ margin: 0 }}>
              <dt>Name</dt><dd>{d.empName}</dd>
              <dt>Department · role</dt><dd>{d.dept} · {d.role}</dd>
              <dt>Devices</dt><dd>{d.devices}</dd>
              <dt>Removable devices</dt><dd>{d.rms}</dd>
              <dt>Baseline</dt><dd>{d.baselineLabel}</dd>
              <dt>Classification</dt><dd><span className={d.classCls}>{d.classification}</span></dd>
              <dt>Assigned analyst</dt><dd>{d.analystName}</dd>
            </dl>
          </section>
          <section className="card card-b" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Behavioral deviation &amp; baseline comparison</h3>
            {d.hasFeatures && (
              <table className="t"><thead><tr><th>Feature</th><th>Observed</th><th>Personal mean</th><th>Deviation</th></tr></thead>
                <tbody>{d.features.map((f) => <tr key={f.key}><td>{f.label}</td><td className="mono">{f.value}</td><td className="mono">{f.mean}</td><td><span className="zchip z-mid">{f.zLabel}</span></td></tr>)}</tbody>
              </table>
            )}
          </section>
          {d.hasContext && (
            <section className="card card-b" style={{ padding: 16 }}>
              <h3 style={{ marginBottom: 8 }}>Organizational context</h3>
              <div className="stack" style={{ gap: 6 }}>{d.context.map((c) => <div key={c} className="banner banner-info">{c}</div>)}</div>
            </section>
          )}
          <section className="card card-b" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Triggering activity &amp; associated events</h3>
            <div className="tl">{d.events.map((e) => <div key={e.evId} className="tl-item"><span className="mono">{e.t}</span><span className={e.srcCls}>{e.src}</span><span>{e.detail}</span></div>)}</div>
          </section>
          <section className="card card-b" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Applicable policies</h3>
            {d.policies.map((p) => <div key={p.id} className="small"><span className="mono muted">{p.id}</span> {p.name}</div>)}
            <p className="tiny muted" style={{ margin: '6px 0 0' }}>Policy matches are indicators, not proof.</p>
          </section>
          <section className="card card-b" style={{ padding: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Investigation history</h3>
            <div className="stack" style={{ gap: 5 }}>
              {d.historyV.map((h, i) => <div key={i} className="small"><span className="mono tiny muted">{h.when}</span> · <b>{h.user}</b> — {h.action}</div>)}
            </div>
          </section>
          <section className="card card-b" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h3>Analyst actions</h3>
            {isAnalyst && (
              <div className="row" style={{ alignItems: 'flex-end' }}>
                <div className="field" style={{ width: 200 }}><label htmlFor="dr-as">Assign analyst</label>
                  <select id="dr-as" className="select" value={d.analyst} onChange={d.act.assign}>
                    <option value="">Unassigned</option>
                    {analysts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div className="field" style={{ width: 220 }}><label htmlFor="dr-st">Update status</label>
                  <select id="dr-st" className="select" value={d.status} onChange={d.act.status}>
                    {statusOpts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={d.act.workspace}>Open in Investigation Workspace</button>
              <button type="button" className="btn btn-secondary" onClick={d.act.profile}>Employee profile</button>
              <button type="button" className="btn btn-secondary" onClick={d.act.behavior}>Behavioral view</button>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
