import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildReports } from '../../viewmodels/staff/reports.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Tabs from '../../components/common/Tabs.jsx';

export default function ReportsPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const { depts } = getBase(store);
  const V = buildReports(store);
  const r = V.report;

  return (
    <>
      <PageHeader title="Reports & Audit Logs" sub="Generate operational reports from the shared prototype records and review every recorded action." />
      <Tabs tabs={V.rTabs} />
      {V.rt.reports && (
        <>
          <div className="card card-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', padding: 14 }}>
            <div className="field" style={{ width: 260 }}><label htmlFor="r-type">Report type</label>
              <select id="r-type" className="select" value={u.rType} onChange={V.rf.type}>{V.rTypes.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
            </div>
            <div className="field" style={{ width: 170 }}><label htmlFor="r-range">Date range</label>
              <select id="r-range" className="select" value={u.rRange} onChange={V.rf.range}><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select>
            </div>
            <div className="field" style={{ width: 220 }}><label htmlFor="r-dept">Department</label>
              <select id="r-dept" className="select" value={u.rDept} onChange={V.rf.dept}><option value="All">All departments</option>{depts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
            </div>
            <button type="button" className="btn btn-primary" onClick={r.export}>Export CSV</button>
          </div>
          <section className="card">
            <div className="card-h"><div><h2>{r.title}</h2><div className="tiny muted mono" style={{ marginTop: 3 }}>{r.period}</div></div></div>
            <div className="card-b stack">
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
                {r.summary.map((s) => <div key={s.k} className="note"><div className="lbl">{s.k}</div><div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 18 }}>{s.v}</div></div>)}
              </div>
              <div className="table-wrap">
                <table className="t">
                  <thead><tr>{r.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                  <tbody>
                    {r.rows.map((row, i) => (
                      <tr key={i}>
                        {row.cells.map((v, ci) => <td key={ci} className="small">{v}</td>)}
                        {row.hasLink && <td><button type="button" className="btn btn-ghost btn-sm" onClick={row.open}>Open record</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {r.empty && <div className="empty">No records for this report and filter.</div>}
              </div>
            </div>
          </section>
        </>
      )}
      {V.rt.audit && (
        <>
          <div className="row">
            <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="au-q">Search audit log</label><input id="au-q" className="input" value={u.auQ} onChange={V.rf.auQ} placeholder="User, action or target" /></div>
            <div className="field" style={{ width: 260 }}><label htmlFor="au-a">Action</label>
              <select id="au-a" className="select" value={u.auAction} onChange={V.rf.auAction}><option value="All">All actions</option>{V.auActions.map((a) => <option key={a} value={a}>{a}</option>)}</select>
            </div>
            <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-end' }} onClick={V.auExport}>Export CSV</button>
          </div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>ID</th><th>Timestamp</th><th>User</th><th>Action</th><th>Target</th><th>Outcome</th></tr></thead>
              <tbody>
                {V.audit.map((x) => <tr key={x.id}><td className="mono small">{x.id}</td><td className="mono small" style={{ whiteSpace: 'nowrap' }}>{x.when}</td><td style={{ whiteSpace: 'nowrap' }}>{x.user}</td><td>{x.action}</td><td className="small">{x.target}</td><td><span className={x.cls}>{x.outcome}</span></td></tr>)}
              </tbody>
            </table>
            {V.auEmpty && <div className="empty">No audit entries match.</div>}
          </div>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span className="tiny muted">Entries come from actions performed in this prototype plus seeded demonstration history.</span>
            <span className="row">
              <button type="button" className="btn btn-secondary btn-sm" onClick={V.auPrev} disabled={V.auPrevDis}>Previous</button>
              <span className="small muted">{V.auPageLabel}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={V.auNext} disabled={V.auNextDis}>Next</button>
            </span>
          </div>
        </>
      )}
    </>
  );
}
