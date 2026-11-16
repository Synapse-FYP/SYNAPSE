import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildDetection } from '../../viewmodels/staff/detection.js';
import PageHeader from '../../components/common/PageHeader.jsx';

function SortHeader({ h }) {
  return <th><button type="button" className="th-btn" onClick={h.go} aria-sort={h.aria}>{h.label} {h.ind}</button></th>;
}

export default function DetectionPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const { employeesOpt, depts, statusOpts, catOpts, analysts } = getBase(store);
  const V = buildDetection(store);
  const df = V.df;

  return (
    <>
      <PageHeader title="Detection Center" sub="All alerts with filtering, sorting and export. Risk values are simulated anomaly scores (0–100) from the demo scoring interface; they rank unusual behavior and are not confirmed probabilities of malicious intent.">
        <div className="row"><button type="button" className="btn btn-secondary" onClick={df.clear}>Clear filters</button><button type="button" className="btn btn-primary" onClick={df.export}>Export CSV</button></div>
      </PageHeader>
      <div className="card card-b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, padding: 14 }}>
        <div className="field" style={{ gridColumn: 'span 2' }}><label htmlFor="d-q">Search</label><input id="d-q" className="input" value={u.dq} onChange={df.q} placeholder="Alert ID, employee, reason, model" /></div>
        <div className="field"><label htmlFor="d-emp">Employee</label>
          <select id="d-emp" className="select" value={u.dEmp} onChange={df.emp}><option value="All">All employees</option>{employeesOpt.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-dept">Department</label>
          <select id="d-dept" className="select" value={u.dDept} onChange={df.dept}><option value="All">All</option>{depts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-sev">Severity</label>
          <select id="d-sev" className="select" value={u.dSev} onChange={df.sev}>
            <option value="All">All</option><option value="High+">High + Critical</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
        </div>
        <div className="field"><label htmlFor="d-st">Status</label>
          <select id="d-st" className="select" value={u.dStatus} onChange={df.status}><option value="All">All</option><option value="Open">Open (not resolved)</option>{statusOpts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-model">Detection model</label>
          <select id="d-model" className="select" value={u.dModel} onChange={df.model}><option value="All">All</option>{V.models.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-cat">Activity type</label>
          <select id="d-cat" className="select" value={u.dCat} onChange={df.cat}><option value="All">All</option>{catOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-an">Assigned analyst</label>
          <select id="d-an" className="select" value={u.dAnalyst} onChange={df.analyst}><option value="All">All</option><option value="none">Unassigned</option>{analysts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="d-range">Date range</label>
          <select id="d-range" className="select" value={u.dRange} onChange={df.range}><option value="7">Last 7 days</option><option value="14">Last 14 days</option><option value="30">Last 30 days</option></select>
        </div>
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}><span className="small muted">{V.dShowing}</span><span className="tiny muted">Click a column heading to sort</span></div>
      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              {V.dh.map((h) => <SortHeader key={h.label} h={h} />)}
              <th>Detection reason</th><th>Model / source</th>
              {V.dhTail.map((h) => <SortHeader key={h.label} h={h} />)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {V.dPageRows.map((a) => (
              <tr key={a.id}>
                <td><button type="button" className="link mono" onClick={a.open}>{a.id}</button></td>
                <td style={{ whiteSpace: 'nowrap' }}>{a.empName}</td><td>{a.dept}</td><td className="mono" style={{ whiteSpace: 'nowrap' }}>{a.whenShort}</td><td>{a.catLabel}</td>
                <td><span className={a.sevCls}>{a.sev} · {a.score}</span></td>
                <td style={{ minWidth: 220 }}>{a.reason}</td><td className="small muted" style={{ minWidth: 160 }}>{a.model}</td>
                <td><span className={a.statusCls}>{a.status}</span></td><td style={{ whiteSpace: 'nowrap' }}>{a.analystName}</td>
                <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><button type="button" className="btn btn-secondary btn-sm" onClick={a.open}>Details</button><button type="button" className="btn btn-ghost btn-sm" onClick={a.work}>Investigate</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {V.dEmpty && <div className="empty">No alerts match these filters. <button type="button" className="link" onClick={df.clear}>Clear filters</button></div>}
      </div>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={V.dPrev} disabled={V.dPrevDis}>Previous</button>
        <span className="small muted">{V.dPageLabel}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={V.dNext} disabled={V.dNextDis}>Next</button>
      </div>
    </>
  );
}
