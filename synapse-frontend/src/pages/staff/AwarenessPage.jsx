import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildAwareness } from '../../viewmodels/staff/awareness.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import { Bar } from '../../components/common/Charts.jsx';

export default function AwarenessPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const { isAnalyst } = getBase(store);
  const V = buildAwareness(store);

  return (
    <>
      <PageHeader title="Awareness & Interventions" sub="Assign proportionate, human-centered interventions and follow their outcomes. Assignments appear immediately in the employee’s portal; completion updates here. Completing training is not treated as evidence of reduced risk.">
        {isAnalyst && <button type="button" className="btn btn-primary" onClick={V.awf.assign}>Assign training</button>}
      </PageHeader>
      <Tabs tabs={V.awTabs} />

      {V.awt.overview && (
        <>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {V.awKpi.map((k) => <div key={k.label} className="kpi" style={{ cursor: 'default' }}><span className="lbl">{k.label}</span><span className="kpi-v">{k.value}</span></div>)}
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>
            <section className="card">
              <div className="card-h"><h2>Completion by intervention type</h2></div>
              <div className="card-b stack" style={{ gap: 10 }}>
                {V.awByType.map((x) => <div key={x.t} className="hbar" style={{ gridTemplateColumns: '170px 1fr 60px' }}><span className="small">{x.t}</span><Bar as="span" w={x.w} color="#34D399" style={{ height: 10 }} /><span className="mono small">{x.d}/{x.n}</span></div>)}
              </div>
            </section>
          </div>
        </>
      )}

      {V.awt.assignments && (
        <>
          <div className="row">
            <div className="field" style={{ flex: 1, minWidth: 200 }}><label htmlFor="aw-q">Search</label><input id="aw-q" className="input" value={u.awQ} onChange={V.awf.q} placeholder="Assignment ID, employee, reason" /></div>
            <div className="field" style={{ width: 200 }}><label htmlFor="aw-t">Type</label>
              <select id="aw-t" className="select" value={u.awType} onChange={V.awf.type}><option value="All">All types</option>{V.typeOpts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
            </div>
            <div className="field" style={{ width: 170 }}><label htmlFor="aw-s">Status</label>
              <select id="aw-s" className="select" value={u.awStatus} onChange={V.awf.status}>
                <option value="All">All</option><option value="Assigned">Assigned</option><option value="In progress">In progress</option><option value="Pending">Pending</option><option value="Completed">Completed</option>
              </select>
            </div>
            <button type="button" className="btn btn-secondary" style={{ alignSelf: 'flex-end' }} onClick={V.awf.export}>Export CSV</button>
          </div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Assignment</th><th>Employee</th><th>Type</th><th>Item</th><th>Reason</th><th>Assigned</th><th>Due</th><th>Status</th><th>Completion</th><th>Follow-up</th></tr></thead>
              <tbody>
                {V.awRows.map((i) => (
                  <tr key={i.id}>
                    <td className="mono">{i.id}</td><td style={{ whiteSpace: 'nowrap' }}>{i.emp}</td><td>{i.type}</td><td>{i.label}</td><td className="small" style={{ minWidth: 180 }}>{i.reason}</td>
                    <td className="mono">{i.assigned}</td><td className="mono">{i.due}</td><td><span className={i.cls}>{i.status}</span></td>
                    <td className="small"><div className="prog" style={{ width: 80 }}><div style={{ width: i.progress + '%' }} /></div><span className="mono tiny">{i.completed}</span></td>
                    <td className="small" style={{ minWidth: 180 }}>{i.followUp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {V.awEmpty && <div className="empty">No interventions match.</div>}
          </div>
        </>
      )}

      {V.awt.verifications && (
        <>
          <div className="banner banner-sim">Verification requests are simulated confirmations answered by the employee inside this prototype. They are not identity-provider MFA.</div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Request</th><th>Employee</th><th>Alert</th><th>Reason</th><th>Sent</th><th>Status</th><th>Employee comment</th><th>Review</th></tr></thead>
              <tbody>
                {V.verifRows.map((v) => (
                  <tr key={v.id}>
                    <td className="mono">{v.id}</td><td>{v.emp}</td><td><button type="button" className="link mono" onClick={v.open}>{v.alert}</button></td>
                    <td className="small" style={{ minWidth: 220 }}>{v.reason}</td><td className="mono small">{v.created}</td>
                    <td><span className={v.cls}>{v.status}</span><div className="tiny muted">{v.responded}</div></td><td className="small">{v.comment}</td>
                    <td>{v.canReview && <button type="button" className="btn btn-secondary btn-sm" onClick={v.review}>Mark reviewed</button>}<span className="tiny muted">{v.reviewed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {V.awt.assessments && (
        <>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Record</th><th>Employee</th><th>Activity</th><th>Score</th><th>Submitted</th></tr></thead>
              <tbody>{V.subRows.map((x) => <tr key={x.id}><td className="mono">{x.id}</td><td>{x.emp}</td><td>{x.title}</td><td className="mono">{x.score}</td><td className="mono small">{x.at}</td></tr>)}</tbody>
            </table>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>Awareness scores provide context for analysts. They are not used as a measure of an individual’s threat level.</p>
        </>
      )}

      {V.awt.acks && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
          {V.ackRows.map((a) => (
            <section key={a.id} className="card card-b" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}><b>{a.name}</b><span className="mono muted small">{a.id}</span></div>
              <div className="row small" style={{ flexWrap: 'nowrap', gap: 8, margin: '10px 0 6px' }}><Bar as="span" w={a.w} color="#22D3EE" style={{ height: 10 }} /><span className="mono">{a.d}/{a.n}</span></div>
              <div className="tiny muted">Recent: {a.recent}</div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
