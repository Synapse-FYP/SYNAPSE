import { useSynapse } from '../../store/index.js';
import { buildBehavior } from '../../viewmodels/staff/behavior.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { ChartTicks, Legend } from '../../components/common/Charts.jsx';

function DayDetail({ pt }) {
  return (
    <section className="card card-b" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><h3>{pt.day}</h3><button type="button" className="btn btn-ghost btn-sm" onClick={pt.clear} aria-label="Close day details">✕</button></div>
      <table className="t" style={{ marginTop: 8 }}>
        <thead><tr><th>Source</th><th>Events</th><th>Off</th><th>Dev.</th></tr></thead>
        <tbody>{pt.rows.map((r) => <tr key={r.label}><td className="small">{r.label}</td><td className="mono">{r.n}</td><td className="mono">{r.off}</td><td><span className={r.cls}>{r.z}</span></td></tr>)}</tbody>
      </table>
      {pt.hasAlerts && (
        <div className="stack" style={{ gap: 8, marginTop: 10 }}>
          <div className="lbl">Related alerts</div>
          {pt.alerts.map((a) => (
            <div key={a.id} className="note"><button type="button" className="link mono" onClick={a.open}>{a.id}</button><div className="small">{a.reason}</div><button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={a.work}>Open investigation</button></div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function BehaviorPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const V = buildBehavior(store);

  return (
    <>
      <PageHeader title="Behavioral Intelligence" sub="Explore one employee’s observed activity against their own expected range. Click any point to inspect the underlying day, open related alerts or move to an investigation.">
        <span className="tag-sim">Simulated demonstration events</span>
      </PageHeader>
      <div className="card card-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', padding: 14 }}>
        <div className="field" style={{ minWidth: 240, flex: 1 }}><label htmlFor="b-emp">Employee</label>
          <select id="b-emp" className="select" value={u.bEmp} onChange={V.bf.emp}>{V.bEmpOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        </div>
        <div className="field" style={{ width: 170 }}><label htmlFor="b-metric">Measure</label>
          <select id="b-metric" className="select" value={u.bMetric} onChange={V.bf.metric}><option value="n">Daily events</option><option value="off">Off-hours events</option></select>
        </div>
        <div className="field" style={{ width: 150 }}><label htmlFor="b-range">Time range</label>
          <select id="b-range" className="select" value={u.bRange} onChange={V.bf.range}><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select>
        </div>
        <label className="switch"><input type="checkbox" checked={u.bOverlay} onChange={V.bf.overlay} /> <span className="small" style={{ fontWeight: 600 }}>Baseline overlay</span></label>
      </div>
      <div className="row" role="group" aria-label="Activity category" style={{ gap: 0 }}>
        {V.bCatTabs.map((c) => <button key={c.k} type="button" className={c.cls} aria-pressed={c.pressed} onClick={c.go}>{c.label}</button>)}
      </div>
      {V.bHas && (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', alignItems: 'start' }}>
            <section className="card">
              <div className="card-h"><h2>{V.bEmpName} · observed versus expected</h2><Legend items={[['#12394A', 'Expected range'], ['#F2A93B', '> 3 SD'], ['#F0506E', 'Alert raised']]} /></div>
              <div className="card-b">
                <div className="chart-wrap"><div className="chart" style={{ height: 260 }}>
                  <ChartTicks ticks={V.bChart.ticks} />
                  <svg viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
                    <path d={V.bChart.bandPath} fill="#22D3EE" fillOpacity={V.bChart.bandOp} />
                    <path d={V.bChart.meanPath} stroke="#22D3EE" strokeOpacity={V.bChart.meanOp} strokeDasharray="5 4" strokeWidth="1.2" vectorEffect="non-scaling-stroke" fill="none" />
                    <path d={V.bChart.path} fill="none" stroke="#E6ECF5" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </svg>
                  {V.bChart.pts.map((pt) => <button key={pt.d} type="button" className={pt.cls} style={{ left: pt.left + '%', top: pt.top + '%' }} title={pt.tip} aria-label={pt.tip} onClick={pt.go} />)}
                </div></div>
                <div className="chart-x" style={{ paddingLeft: 34 }}><span>{V.bChart.first}</span><span>{V.bChart.mid}</span><span>{V.bChart.last}</span></div>
                <div className="banner banner-info" style={{ marginTop: 12 }}>{V.bStats.label}. Expected range = personal mean {V.bStats.mean} ± 2 × SD {V.bStats.sd} (upper {V.bStats.hi}). {V.bStats.above} day(s) in range exceed it. Exceeding the range is an indicator for review, never a verdict.</div>
              </div>
            </section>
            <aside className="stack">
              {V.bPointShow && <DayDetail pt={V.bPt} />}
              <section className="card card-b" style={{ padding: 16 }}>
                <h3>Range summary</h3>
                <dl className="kv" style={{ margin: '10px 0 0' }}><dt>Observed mean</dt><dd className="mono">{V.bStats.obsMean}/day</dd><dt>Expected mean</dt><dd className="mono">{V.bStats.mean}/day</dd><dt>Upper bound</dt><dd className="mono">{V.bStats.hi}</dd><dt>Days above</dt><dd className="mono">{V.bStats.above}</dd></dl>
              </section>
              <section className="card card-b" style={{ padding: 16 }}>
                <h3>Alerts for this employee</h3>
                <div className="stack" style={{ gap: 6, marginTop: 8 }}>
                  {V.bAlerts.map((a) => <div key={a.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}><button type="button" className="link mono" onClick={a.work}>{a.id}</button><span className="muted">{a.whenShort}</span><span className={a.sevCls}>{a.sev}</span></div>)}
                </div>
              </section>
            </aside>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))' }}>
            <section className="card">
              <div className="card-h"><h2>Temporal activity heatmap</h2><Legend items={[['#22D3EE', 'Working hours'], ['#8B5CF6', 'Off-hours']]} /></div>
              <div className="card-b">
                <div className="heat">
                  <span />
                  {V.heatHours.map((hh) => <span key={hh.label} className="tiny mono muted" style={{ gridColumn: 'span 3' }}>{hh.label}</span>)}
                  {V.heat.map((r) => [
                    <span key={r.day} className="tiny muted" style={{ alignSelf: 'center' }}>{r.day}</span>,
                    ...r.cells.map((c, h) => <span key={r.day + h} className="heat-bg" title={c.tip}><span className={c.cls} style={{ display: 'block', opacity: c.op }} /></span>),
                  ])}
                </div>
                <p className="tiny muted" style={{ margin: '8px 0 0' }}>Average events per hour slot for the selected category and range, by weekday.</p>
              </div>
            </section>
            <section className="card">
              <div className="card-h"><h2>Observed versus expected (last 7 days)</h2><Legend items={[['#E6ECF5', 'Observed'], ['#2F6E8C', 'Expected']]} /></div>
              <div className="card-b stack" style={{ gap: 12 }}>
                {V.ove.map((o) => (
                  <div key={o.label}>
                    <div className="row small" style={{ justifyContent: 'space-between' }}><span>{o.label}</span><span className="mono">{o.obs} / {o.ex}</span></div>
                    <div className="bar-track" style={{ height: 7, marginTop: 3 }}><div className="bar-fill" style={{ width: o.ow + '%', background: '#E6ECF5' }} /></div>
                    <div className="bar-track" style={{ height: 7, marginTop: 3 }}><div className="bar-fill" style={{ width: o.ew + '%', background: '#2F6E8C' }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <section className="card">
            <div className="card-h"><h2>Historical deviation analysis</h2><span className="tiny muted">Deviation from personal baseline in SD · click a cell to inspect</span></div>
            <div className="card-b" style={{ overflowX: 'auto' }}>
              <table className="t" style={{ minWidth: 640 }}>
                <thead><tr><th>Day</th>{V.devCats.map((c) => <th key={c.k}>{c.label}</th>)}</tr></thead>
                <tbody>
                  {V.devTable.map((r) => (
                    <tr key={r.d}><td className="mono small">{r.day}</td>{r.cells.map((c) => <td key={c.k} style={{ padding: '4px 6px' }}><button type="button" className={c.cls} onClick={c.go}>{c.z}</button></td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}
