// Employee profile with Overview, Behavioral History, Risk History, Device Relationships and Interventions tabs.
import Tabs from '../../../components/common/Tabs.jsx';
import { MiniTrendCard, Legend } from '../../../components/common/Charts.jsx';

function OverviewTab({ prof }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Employee details</h2>
        <dl className="kv" style={{ margin: 0 }}>
          <dt>Email</dt><dd>{prof.email}</dd><dt>Department</dt><dd>{prof.dept}</dd><dt>Role</dt><dd>{prof.role}</dd><dt>Site</dt><dd>{prof.site}</dd>
          <dt>Joined</dt><dd>{prof.hired}</dd><dt>Account status</dt><dd>{prof.status}</dd><dt>Open alerts</dt><dd>{prof.open} of {prof.total} total</dd>
        </dl>
      </section>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Registered devices</h2>
        {prof.hasDevices && prof.devices.map((d) => (
          <div key={d.id} className="row small" style={{ justifyContent: 'space-between' }}><span className="row" style={{ gap: 8 }}><span className={d.cls} /><span className="mono">{d.name}</span></span><span className="muted">{d.status} · {d.last}</span></div>
        ))}
        <div className="stack" style={{ gap: 6, marginTop: 10 }}>
          {prof.removables.map((r) => <div key={r.id} className="row small" style={{ justifyContent: 'space-between' }}><span>{r.label} <span className="mono tiny muted">{r.serial}</span></span><span className={r.cls}>{r.approved}</span></div>)}
        </div>
      </section>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Recent events</h2>
        <div className="stack" style={{ gap: 6 }}>{prof.events.map((ev, i) => <div key={i} className="small"><span className="mono tiny muted">{ev.when}</span><div>{ev.detail}</div></div>)}</div>
      </section>
    </div>
  );
}

function WorkSplit({ label, off, workW, offW }) {
  return (
    <div>
      <div className="row small" style={{ justifyContent: 'space-between' }}><span>{label}</span><span className="mono">{off}% off-hours</span></div>
      <div style={{ display: 'flex', height: 22, borderRadius: 5, overflow: 'hidden', marginTop: 4 }}><div style={{ width: workW + '%', background: '#22D3EE' }} /><div style={{ width: offW + '%', background: '#8B5CF6' }} /></div>
    </div>
  );
}

function BehaviorTab({ prof }) {
  if (prof.noBaseline) return <div className="card empty">Baseline unavailable — no activity history exists yet for this employee. SYNAPSE will not draw conclusions until enough history is collected.</div>;
  return (
    <>
      {prof.limited && <div className="banner banner-warn">Limited history: fewer than 10 baseline days, so the population baseline is used. Deviations are less reliable for this employee.</div>}
      <div className="banner banner-sim">Behavioral history uses simulated demonstration events. Baselines follow the CERT r5.2 method: training-period mean and standard deviation per employee and feature, SD floor 10% of the population SD, deviations clipped to ±20, population fallback below 10 training days.</div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Current week versus historical average</h2><Legend items={[['#E6ECF5', 'Last 7 days'], ['#2F6E8C', 'Baseline']]} /></div>
          <div className="card-b stack" style={{ gap: 12 }}>
            {prof.compare.map((c) => (
              <div key={c.label} className="stack" style={{ gap: 4 }}>
                <div className="row small" style={{ justifyContent: 'space-between' }}><span>{c.label}</span><span className="mono">{c.cur} vs {c.base}/day · {c.delta}</span></div>
                <div className="bar-track" style={{ height: 7 }}><div className="bar-fill" style={{ width: c.cw + '%', background: '#E6ECF5' }} /></div>
                <div className="bar-track" style={{ height: 7 }}><div className="bar-fill" style={{ width: c.bw + '%', background: '#2F6E8C' }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Normal versus unusual working time</h2><span className="tiny muted">Share of events outside 08:00–18:00 or at weekends</span></div>
          <div className="card-b stack" style={{ gap: 14 }}>
            <WorkSplit label="Baseline period" off={prof.work.baseOff} workW={prof.work.baseW} offW={prof.work.baseOffW} />
            <WorkSplit label="Last 7 days" off={prof.work.curOff} workW={prof.work.curW} offW={prof.work.curOffW} />
            <div className="legend"><span><i className="lg-sw" style={{ background: '#22D3EE' }} />Working hours</span><span><i className="lg-sw" style={{ background: '#8B5CF6' }} />Off-hours / weekend</span></div>
            <p className="tiny muted" style={{ margin: 0 }}>Off-hours boundaries are illustrative engineering assumptions; working late is not a violation.</p>
          </div>
        </section>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
        <MiniTrendCard title="Device activity trend" chart={prof.devChart} first={prof.first} last={prof.last} />
        <MiniTrendCard title="File access frequency" chart={prof.fileChart} first={prof.first} last={prof.last} />
        <MiniTrendCard title="Login behavior" chart={prof.logonChart} first={prof.first} last={prof.last} />
        <section className="card">
          <div className="card-h"><h3>Behavioral deviation over time</h3><span className="tiny muted">Max deviation per day (SD)</span></div>
          <div className="card-b">
            <div className="chart" style={{ height: 120 }}>
              <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
                <path d={'M0 ' + prof.devzChart.thresh + ' L600 ' + prof.devzChart.thresh} stroke="#F2A93B" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" fill="none" />
                <path d={prof.devzChart.area} fill="#8B5CF6" fillOpacity="0.12" />
                <path d={prof.devzChart.path} fill="none" stroke="#8B5CF6" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className="chart-x"><span>{prof.first}</span><span>dashed = 3 SD</span><span>{prof.last}</span></div>
          </div>
        </section>
      </div>
    </>
  );
}

function RiskTab({ prof }) {
  return (
    <>
      <section className="card">
        <div className="card-h"><h2>Risk timeline</h2><span className="tiny muted">Alert scores across the 30-day window · click a marker for details</span></div>
        <div className="card-b">
          <div style={{ position: 'relative', height: 140, borderLeft: '1px solid #22304D', borderBottom: '1px solid #22304D', marginLeft: 26, background: 'linear-gradient(#3A1622 0 15%, #3A2016 15% 30%, #3A2C12 30% 55%, #121B30 55%)' }}>
            {prof.riskDots.map((d) => (
              <button key={d.id} type="button" title={d.tip} aria-label={d.tip} onClick={d.go}
                style={{ position: 'absolute', left: d.left + '%', bottom: d.bottom + '%', width: 14, height: 14, margin: '0 0 -7px -7px', borderRadius: '50%', border: '2px solid #fff', background: d.c, cursor: 'pointer', padding: 0 }} />
            ))}
            <span className="tiny mono muted" style={{ position: 'absolute', left: -26, top: -6 }}>100</span><span className="tiny mono muted" style={{ position: 'absolute', left: -16, bottom: -6 }}>0</span>
          </div>
          <div className="chart-x" style={{ marginLeft: 26 }}><span>{prof.first}</span><span>{prof.last}</span></div>
        </div>
      </section>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Alert</th><th>Date</th><th>Activity</th><th>Severity</th><th>Explanation</th><th>Status</th><th>Outcome</th></tr></thead>
          <tbody>
            {prof.risk.map((a) => (
              <tr key={a.id}><td><button type="button" className="link mono" onClick={a.go}>{a.id}</button></td><td className="mono">{a.whenShort}</td><td>{a.catLabel}</td><td><span className={a.sevCls}>{a.sev} · {a.score}</span></td><td>{a.reason}</td><td><span className={a.statusCls}>{a.status}</span></td><td><span>{a.classification}</span></td></tr>
            ))}
          </tbody>
        </table>
        {prof.noRisk && <div className="empty">No alerts recorded for this employee.</div>}
      </div>
    </>
  );
}

function DevicesTab({ prof }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Approved and observed removable devices</h2>
        {prof.removables.map((r) => <div key={r.id} className="row small" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1C2740' }}><span>{r.label} <span className="mono tiny muted">{r.serial}</span></span><span className={r.cls}>{r.approved}</span></div>)}
      </section>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Resource connections</h2>
        {prof.resources.map((r) => <div key={r.id} className="small" style={{ padding: '4px 0' }}>{r.label} <span className="mono tiny muted">{r.sub}</span></div>)}
        <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 10 }} onClick={prof.graph}>Open in Graph Explorer</button>
      </section>
      <section className="card card-b" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 10 }}>Organizational context &amp; policies</h2>
        {prof.policies.map((p) => <div key={p.id} className="row small" style={{ justifyContent: 'space-between', padding: '4px 0' }}><span><span className="mono muted">{p.id}</span> {p.name}</span><span className="tiny muted">{p.acked}</span></div>)}
      </section>
    </div>
  );
}

function InterventionsTab({ prof }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)', gap: 14 }}>
      <section className="card card-b" style={{ padding: 16, textAlign: 'center' }}>
        <div className="lbl">Awareness progress</div>
        <div className="kpi-v" style={{ fontSize: 34, margin: '8px 0' }}>{prof.awareness}%</div>
        <div className="tiny muted">{prof.awDone} of {prof.awTotal} interventions completed. Completion is tracked for follow-up; it is not treated as reduced risk.</div>
      </section>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ID</th><th>Type</th><th>Item</th><th>Assigned</th><th>Due</th><th>Status</th><th>Progress</th><th>Follow-up</th></tr></thead>
          <tbody>
            {prof.ints.map((i) => <tr key={i.id}><td className="mono">{i.id}</td><td>{i.type}</td><td>{i.label}</td><td className="mono">{i.assigned}</td><td className="mono">{i.due}</td><td><span className={i.cls}>{i.status}</span></td><td className="mono">{i.progress}%</td><td className="small">{i.followUp}</td></tr>)}
          </tbody>
        </table>
        {prof.noInts && <div className="empty">No interventions assigned.</div>}
      </div>
    </div>
  );
}

export default function EmployeeProfile({ V, isAnalyst }) {
  const prof = V.prof;
  return (
    <>
      <div className="card card-b" style={{ padding: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="avatar avatar-lg">{prof.initials}</span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ fontSize: 22 }}>{prof.name}</h1>
          <div className="muted small">{prof.role} · {prof.dept} · <span className="mono">{prof.id}</span></div>
          <div className="tiny muted" style={{ marginTop: 4 }}>{prof.baselineLabel}</div>
        </div>
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={prof.behavior}>Behavioral Intelligence</button>
          <button type="button" className="btn btn-secondary" onClick={prof.graph}>Show in graph</button>
          {isAnalyst && <button type="button" className="btn btn-primary" onClick={prof.assign}>Assign intervention</button>}
        </div>
      </div>
      <Tabs tabs={V.pTabs} />
      {V.pt.overview && <OverviewTab prof={prof} />}
      {V.pt.behavior && <BehaviorTab prof={prof} />}
      {V.pt.risk && <RiskTab prof={prof} />}
      {V.pt.devices && <DevicesTab prof={prof} />}
      {V.pt.interventions && <InterventionsTab prof={prof} />}
    </>
  );
}
