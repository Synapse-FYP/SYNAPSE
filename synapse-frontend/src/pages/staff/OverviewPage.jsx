import { useSynapse } from '../../store/index.js';
import { buildOverview } from '../../viewmodels/staff/overview.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import { Bar } from '../../components/common/Charts.jsx';

const SEV_LEGEND = [['#F0506E', 'Critical'], ['#FB7A4E', 'High'], ['#F2A93B', 'Medium'], ['#7B93A8', 'Low']];
const KPI_SKELETON = [0, 1, 2, 3, 4, 5];

export default function OverviewPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const V = buildOverview(store);

  return (
    <>
      <PageHeader title="Security overview" sub="Live-style operations view of the fictional Meridian Ledger Group. Alerts and activity are simulated demonstration data; scores are anomaly indicators, not probabilities of malicious intent.">
        <div className="row">
          <label className="lbl" htmlFor="ov-range" style={{ marginRight: -4 }}>Date range</label>
          <select id="ov-range" className="select" style={{ width: 160 }} value={u.range} onChange={(e) => store.ui({ range: e.target.value })}>
            {V.rangeOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => store.refresh()}>Refresh</button>
        </div>
      </PageHeader>
      <div className="tiny muted mono" style={{ marginTop: -6 }}>{V.rangeLabel}</div>
      {u.loading && (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {KPI_SKELETON.map((i) => <div key={i} className="kpi" style={{ background: '#1C2740', borderColor: '#1C2740' }} />)}
          </div>
          <div className="card" style={{ padding: 40, textAlign: 'center' }} role="status"><span className="muted">Loading dashboard data…</span></div>
        </>
      )}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        {V.kpi.map((k) => (
          <button key={k.label} type="button" className="kpi" onClick={k.go}><span className="lbl">{k.label}</span><span className="kpi-v">{k.value}</span><span className="tiny muted">{k.sub}</span></button>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Alert trend</h2><span className="tiny muted">{V.trendTotal} alerts in range · click a bar to open Detection Center</span></div>
          <div className="card-b">
            <div className="bars" role="list">
              {V.trend.map((b) => (
                <button key={b.key} type="button" className="barcol" onClick={b.open} title={b.tip} aria-label={b.tip}>
                  <div className="barstack" style={{ height: b.h + '%' }}>
                    {b.segs.map((sg) => <div key={sg.sv} style={{ height: sg.h + '%', background: sg.c }} />)}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {V.trend.map((b) => <div key={b.key} className="tiny mono muted" style={{ flex: 1, minWidth: 6, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{b.label}</div>)}
            </div>
            <div className="legend" style={{ marginTop: 10 }}>{SEV_LEGEND.map(([c, l]) => <span key={l}><i className="lg-sw" style={{ background: c }} />{l}</span>)}</div>
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Risk severity &amp; activity categories</h2><span className="tiny muted">Alerts in selected range</span></div>
          <div className="card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            <div className="stack" style={{ gap: 9 }}>
              <div className="lbl">By severity</div>
              {V.sevDist.map((x) => (
                <button key={x.sev} type="button" className="hbar" onClick={x.go} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                  <span>{x.sev}</span><Bar as="span" w={x.w} color={x.c} /><b className="mono">{x.n}</b>
                </button>
              ))}
            </div>
            <div className="stack" style={{ gap: 9 }}>
              <div className="lbl">By activity category</div>
              {V.catDist.map((x) => (
                <div key={x.label} className="hbar"><span>{x.label}</span><Bar as="span" w={x.w} color="#8B5CF6" /><b className="mono">{x.n}</b></div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Priority investigation queue</h2><span className="tiny muted">Open, by score</span></div>
          <div className="card-b stack" style={{ gap: 8 }}>
            {V.queue.map((a) => (
              <button key={a.id} type="button" className="q-item" onClick={a.go}>
                <span className="row" style={{ justifyContent: 'space-between' }}><span className="mono" style={{ fontWeight: 600 }}>{a.id}</span><span className={a.sevCls}>{a.sev} · {a.score}</span></span>
                <span style={{ fontWeight: 600 }}>{a.empName} <span className="muted small" style={{ fontWeight: 400 }}>· {a.dept}</span></span>
                <span className="small muted">{a.reason}</span>
                <span className="row" style={{ gap: 6 }}><span className={a.statusCls}>{a.status}</span><span className="tiny muted">{a.analystName}</span></span>
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Recent alerts</h2></div>
          <div className="card-b stack" style={{ gap: 10 }}>
            <div className="row" style={{ gap: 6 }} role="group" aria-label="Filter by severity">
              {V.sevChips.map((c) => <button key={c.label} type="button" className={c.cls} aria-pressed={c.pressed} onClick={c.go}>{c.label}</button>)}
            </div>
            {V.recentEmpty && <div className="empty">No alerts at this severity.</div>}
            {V.recent.map((a) => (
              <div key={a.id} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid #1C2740', paddingBottom: 8, flexWrap: 'nowrap' }}>
                <div style={{ minWidth: 0 }}><button type="button" className="link mono" onClick={a.open}>{a.id}</button> <span className="small">{a.empName}</span><div className="tiny muted">{a.whenShort} · {a.catLabel}</div></div>
                <span className={a.sevCls}>{a.sev}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Employees requiring review</h2></div>
          <div className="card-b stack" style={{ gap: 8 }}>
            {V.review.map((m) => (
              <button key={m.id} type="button" className="q-item" onClick={m.go} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <span className="avatar">{m.initials}</span>
                <span style={{ flex: 1, minWidth: 0 }}><b>{m.name}</b><br /><span className="tiny muted">{m.dept} · {m.n} open alert(s)</span></span>
                <span className={m.sevCls}>{m.sev}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Recent behavioral anomalies</h2><span className="tiny muted">Deviation ≥ 4 SD from the employee’s own baseline · last 7 days</span></div>
          <div className="card-b">
            <table className="t">
              <thead><tr><th>Day</th><th>Employee</th><th>Feature</th><th>Observed / mean</th><th>Deviation</th></tr></thead>
              <tbody>
                {V.anoms.map((x) => (
                  <tr key={x.emp + x.d}><td className="mono">{x.day}</td><td><button type="button" className="link" onClick={x.go}>{x.name}</button></td><td>{x.label}</td><td className="mono">{x.value} / {x.mean}</td><td><span className="zchip z-mid">{x.z}</span></td></tr>
                ))}
              </tbody>
            </table>
            <p className="tiny muted" style={{ margin: '8px 0 0' }}>A deviation is a behavioral indicator, not evidence of malicious intent.</p>
          </div>
        </section>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
        <section className="card">
          <div className="card-h"><h2>Pending analyst actions</h2></div>
          <div className="card-b stack" style={{ gap: 8 }}>
            {V.pendingEmpty && <div className="empty">Nothing pending.</div>}
            {V.pending.map((x) => <button key={x.text} type="button" className="link small" onClick={x.go} style={{ fontWeight: 500 }}>→ {x.text}</button>)}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Recent intervention activity</h2></div>
          <div className="card-b stack" style={{ gap: 8 }}>
            {V.recentInts.map((x) => (
              <div key={x.id} className="row small" style={{ justifyContent: 'space-between', flexWrap: 'nowrap' }}>
                <span style={{ minWidth: 0 }}><button type="button" className="link mono" onClick={x.go}>{x.id}</button> {x.name}<br /><span className="tiny muted">{x.label} · {x.when}</span></span>
                <span className={x.cls}>{x.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

