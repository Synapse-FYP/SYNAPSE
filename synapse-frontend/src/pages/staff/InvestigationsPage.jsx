import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildInvestigations } from '../../viewmodels/staff/investigations.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { ChartTicks, Legend } from '../../components/common/Charts.jsx';

function EvidencePanel({ inv }) {
  return (
    <>
      <div className="card card-b" style={{ padding: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="mono" style={{ fontWeight: 600, fontSize: 15 }}>{inv.id}</span>
              <span className={inv.sevCls}>{inv.sev}</span><span className={inv.statusCls}>{inv.status}</span><span className={inv.classCls}>{inv.classification}</span>
              {inv.closed && <span className="pill pill-idle">Closed</span>}
            </div>
            <h2 style={{ fontSize: 18 }}>{inv.reason}</h2>
            <div className="small muted">{inv.when} · {inv.catLabel} · {inv.model}</div>
          </div>
          <div className="row" style={{ gap: 6 }}><button type="button" className="btn btn-secondary btn-sm" onClick={inv.act.profile}>Employee profile</button><button type="button" className="btn btn-secondary btn-sm" onClick={inv.act.behavior}>Behavioral view</button></div>
        </div>
        <div className="divider" style={{ margin: '14px 0' }} />
        <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
          <span className="avatar avatar-lg">{inv.initials}</span>
          <dl className="kv" style={{ flex: 1, minWidth: 260, margin: 0 }}>
            <dt>Employee</dt><dd>{inv.empName} <span className="mono muted small">({inv.emp.id})</span></dd>
            <dt>Department · role</dt><dd>{inv.dept} · {inv.role}</dd>
            <dt>Endpoints</dt><dd>{inv.devices}</dd>
            <dt>Removable devices</dt><dd>{inv.rms}</dd>
            <dt>Baseline</dt><dd>{inv.baselineLabel}</dd>
          </dl>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h2>Historical behavior · {inv.catLabel}</h2><Legend items={[['#12394A', 'Expected range (mean ± 2 SD)'], ['#F0506E', 'Alert day']]} /></div>
        <div className="card-b">
          {inv.hasChart && (
            <>
              <div className="chart-wrap"><div className="chart" style={{ height: 170 }}>
                <ChartTicks ticks={inv.chart.ticks} />
                <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
                  <path d={inv.chart.bandPath} fill="#22D3EE" fillOpacity="0.14" />
                  <path d={inv.chart.meanPath} stroke="#22D3EE" strokeDasharray="4 4" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none" />
                  <path d={inv.chart.path} fill="none" stroke="#E6ECF5" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
                </svg>
                {inv.chart.hasMark && <span className="pt pt-alert" style={{ left: inv.chart.mark.left + '%', top: inv.chart.mark.top + '%' }} aria-hidden="true" />}
              </div></div>
              <div className="chart-x" style={{ paddingLeft: 34 }}><span>{inv.chart.first}</span><span>Daily {inv.catLabel} events (simulated)</span><span>{inv.chart.last}</span></div>
            </>
          )}
          {inv.noChart && <div className="empty">Baseline chart unavailable — no activity history for this employee.</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h2>Activity on {inv.date} versus baseline</h2><span className="tiny muted">Login · USB/file · email/web metadata</span></div>
        <div className="card-b">
          <table className="t"><thead><tr><th>Source</th><th>Events</th><th>Off-hours</th><th>Personal mean</th><th>Deviation</th></tr></thead>
            <tbody>{inv.dayRows.map((r) => <tr key={r.label}><td>{r.label}</td><td className="mono">{r.value}</td><td className="mono">{r.off}</td><td className="mono">{r.mean}</td><td><span className={r.cls}>{r.z} SD</span></td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function InvestigationTabs({ V, inv }) {
  return (
    <div className="card">
      <div className="card-h" style={{ paddingBottom: 0 }}><Tabs tabs={V.invTabs} style={{ flex: 1, borderBottom: 0 }} /></div>
      <div className="divider" style={{ margin: 0 }} />
      <div className="card-b">
        {V.invT.timeline && (
          <>
            <div className="tl">
              {inv.hasEvents && inv.events.map((e) => <div key={e.evId} className="tl-item"><span className="mono">{e.t}</span><span className={e.srcCls}>{e.src}</span><span>{e.detail}</span></div>)}
            </div>
            {inv.hasContext && (
              <div className="stack" style={{ gap: 6, marginTop: 12 }}><div className="lbl">Organizational context</div>{inv.context.map((c) => <div key={c} className="banner banner-info">{c}</div>)}</div>
            )}
            {inv.hasRelated && (
              <div className="stack" style={{ gap: 6, marginTop: 12 }}>
                <div className="lbl">Related alerts for this employee</div>
                {inv.related.map((r) => (
                  <div key={r.id} className="row small"><button type="button" className="link mono" onClick={r.open}>{r.id}</button><span className="muted">{r.whenShort}</span><span>{r.reason}</span><span className={r.statusCls}>{r.status}</span><span className={r.classCls}>{r.classification}</span></div>
                ))}
              </div>
            )}
          </>
        )}
        {V.invT.evidence && (
          <>
            <table className="t"><thead><tr><th>Evidence ID</th><th>Date</th><th>Time</th><th>Source</th><th>Record (metadata only)</th></tr></thead>
              <tbody>{inv.events.map((e) => <tr key={e.evId}><td className="mono">{e.evId}</td><td className="mono">{e.date}</td><td className="mono">{e.t}</td><td><span className={e.srcCls}>{e.src}</span></td><td>{e.detail}</td></tr>)}</tbody>
            </table>
            <p className="tiny muted" style={{ margin: '8px 0 0' }}>Evidence records are simulated demonstration events. Message and file contents are never collected.</p>
          </>
        )}
        {V.invT.history && (
          <div className="stack" style={{ gap: 6 }}>
            {inv.historyV.map((hx, i) => <div key={i} className="row small" style={{ flexWrap: 'nowrap', alignItems: 'baseline' }}><span className="mono tiny muted" style={{ minWidth: 130 }}>{hx.when}</span><b style={{ minWidth: 120 }}>{hx.user}</b><span>{hx.action}</span></div>)}
          </div>
        )}
      </div>
    </div>
  );
}

function DecisionPanel({ inv }) {
  const { state, store } = useSynapse();
  const { isAnalyst, isAdmin, analysts } = getBase(store);
  return (
    <aside className="stack" aria-label="Explainability and decisions">
      <div className="card card-b" style={{ padding: 16 }}>
        <h2>Why this alert</h2>
        <p className="small" style={{ margin: '8px 0 12px' }}>{inv.reason}. The score summarizes how far the day’s activity sits from this employee’s historical pattern.</p>
        <div className="row" style={{ justifyContent: 'space-between' }}><span className="lbl">Anomaly score (simulated)</span><b className="mono">{inv.score} / 100</b></div>
        <div className="scorebar" style={{ margin: '8px 0 4px' }}><span className="scorepin" style={{ left: inv.scoreW + '%' }} /></div>
        <div className="row tiny muted" style={{ justifyContent: 'space-between' }}><span>Low</span><span>Medium 45</span><span>High 70</span><span>Critical 85</span></div>
        <div className="banner banner-sim" style={{ marginTop: 10 }}>Source: {inv.model}. Period: complete day {inv.date}. Not a probability of malicious intent; uncalibrated score for prioritization.</div>
      </div>
      <div className="card card-b" style={{ padding: 16 }}>
        <h3>Main anomalous features</h3>
        {inv.hasFeatures && (
          <>
            <div className="stack" style={{ gap: 10, marginTop: 10 }}>
              {inv.features.map((f) => (
                <div key={f.key} className="stack" style={{ gap: 4 }}>
                  <div className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><span>{f.label}</span><span className="mono" style={{ fontWeight: 600 }}>{f.zLabel}</span></div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: f.w + '%', background: f.barColor }} /></div>
                  <div className="tiny muted mono">observed {f.value} · mean {f.mean} · SD {f.sd} · {f.ratio}</div>
                </div>
              ))}
            </div>
            <p className="tiny muted" style={{ margin: '10px 0 0' }}>Baseline-deviation evidence (largest deviations from the employee’s own training-period mean). These are not SHAP attributions.</p>
          </>
        )}
      </div>
      <div className="card card-b" style={{ padding: 16 }}>
        <h3>Applicable policies</h3>
        {inv.hasPolicies && <div className="stack" style={{ gap: 6, marginTop: 8 }}>{inv.policies.map((p) => <div key={p.id} className="small"><span className="mono muted">{p.id}</span> {p.name} <span className="tiny muted">· {p.cat}</span></div>)}</div>}
        <p className="tiny muted" style={{ margin: '8px 0 0' }}>A policy match is a security indicator, not proof of wrongdoing.</p>
      </div>
      {inv.hasVerif && (
        <div className="card card-b" style={{ padding: 16 }}>
          <h3>Verification requests</h3>
          {inv.verif.map((v) => (
            <div key={v.id} className="note" style={{ marginTop: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="mono">{v.id}</span><span className="pill pill-violet">{v.status}</span></div>
              <div className="tiny muted">Sent {v.when}</div>
              {v.hasResp && <div className="small" style={{ marginTop: 6 }}>Response {v.responded}: “{v.comment}”</div>}
              {v.canReview && <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={v.review}>Mark outcome reviewed</button>}
            </div>
          ))}
        </div>
      )}
      <div className="card card-b" style={{ padding: 16 }}>
        <h3>Analyst notes</h3>
        {isAnalyst && (
          <>
            <div className="field" style={{ marginTop: 8 }}><label htmlFor="inv-note" className="tiny">Add investigation note</label><textarea id="inv-note" className="textarea" value={state.ui.noteText} onChange={(e) => store.ui({ noteText: e.target.value })} placeholder="Record findings, sources checked, conversations…" /></div>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }} onClick={inv.act.note}>Save note</button>
          </>
        )}
        <div className="stack" style={{ gap: 6, marginTop: 10 }}>{inv.notesV.map((n, i) => <div key={i} className="note"><div className="tiny muted">{n.user} · {n.when}</div>{n.text}</div>)}</div>
      </div>
      {isAnalyst && (
        <div className="card card-b" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3>Investigation actions</h3>
          <div className="field"><label htmlFor="inv-assign" className="tiny">Assigned analyst</label>
            <select id="inv-assign" className="select" value={inv.analyst} onChange={inv.act.assign}><option value="">Unassigned</option>{analysts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
          </div>
          {inv.canStart && <button type="button" className="btn btn-primary" onClick={inv.act.start}>Start investigation</button>}
          {inv.canWork && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={inv.act.verify}>Request verification</button>
              <button type="button" className="btn btn-secondary" onClick={inv.act.train}>Assign training</button>
              <button type="button" className="btn btn-secondary" onClick={inv.act.fp}>Mark false positive</button>
              <button type="button" className="btn btn-secondary" onClick={inv.act.confirm}>Record concern</button>
              <button type="button" className="btn btn-danger" onClick={inv.act.escalate}>Escalate</button>
              <button type="button" className="btn btn-primary" onClick={inv.act.resolve}>Resolve</button>
            </div>
          )}
          {inv.canClose && <button type="button" className="btn btn-secondary" onClick={inv.act.close}>Close case</button>}
          <p className="tiny muted" style={{ margin: 0 }}>Lifecycle: New → Under Review → Awaiting Verification → Escalated → Resolved. Classification is recorded separately from status and severity.</p>
        </div>
      )}
      {isAdmin && <div className="banner banner-info">Investigation decisions are made by Security Analysts. Administrators have read-only access to cases.</div>}
    </aside>
  );
}

export default function InvestigationsPage() {
  const { state, store } = useSynapse();
  const V = buildInvestigations(store);
  const inv = V.inv;
  return (
    <>
      <PageHeader title="Investigation workspace" sub="Review evidence against the employee’s own baseline, record findings and choose a proportionate, human-centered response. Analyst actions never change the anomaly score and never block access automatically." />
      <div className="inv">
        <aside className="stack" style={{ gap: 10 }} aria-label="Alert queue">
          <div className="field"><label htmlFor="inv-q">Alert queue</label><input id="inv-q" className="input" value={state.ui.invQ} onChange={V.invQ} placeholder="Search ID, employee, status" /></div>
          <div className="q-list">
            {V.invEmpty && <div className="empty">No alerts match.</div>}
            {V.invList.map((a) => (
              <button key={a.id} type="button" className={a.cls} onClick={a.pick} aria-pressed={a.current}>
                <span className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><span className="mono" style={{ fontWeight: 600 }}>{a.id}</span><span className={a.sevCls}>{a.sev}</span></span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{a.empName}</span>
                <span className="row" style={{ gap: 6 }}><span className={a.statusCls}>{a.status}</span><span className="tiny muted">{a.analystName}</span></span>
              </button>
            ))}
          </div>
        </aside>
        {V.hasInv && (
          <>
            <section className="stack" aria-label="Evidence investigation">
              <EvidencePanel inv={inv} />
              <InvestigationTabs V={V} inv={inv} />
            </section>
            <DecisionPanel inv={inv} />
          </>
        )}
      </div>
    </>
  );
}
