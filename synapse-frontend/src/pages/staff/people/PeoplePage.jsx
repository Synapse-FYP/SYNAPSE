import { useSynapse } from '../../../store/index.js';
import { getBase } from '../../../viewmodels/common.js';
import { buildPeople } from '../../../viewmodels/staff/people.js';
import PageHeader from '../../../components/common/PageHeader.jsx';
import EmployeeProfile from './EmployeeProfile.jsx';

export default function PeoplePage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const { depts, isAnalyst } = getBase(store);
  const V = buildPeople(store);

  if (V.showProfile) return <EmployeeProfile V={V} isAnalyst={isAnalyst} />;

  return (
    <>
      <PageHeader title="People & Behavior" sub="Employee directory with device, agent and investigation context. Open a profile to see personal baselines and intervention history." />
      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="p-q">Search employees</label><input id="p-q" className="input" value={u.pq} onChange={V.pf.q} placeholder="Name, ID or role" /></div>
        <div className="field" style={{ width: 220 }}><label htmlFor="p-dept">Department</label>
          <select id="p-dept" className="select" value={u.pDept} onChange={V.pf.dept}><option value="All">All departments</option>{depts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Job role</th><th>Approved devices</th><th>Agent</th><th>Recent activity</th><th>Open alerts</th><th>Investigation status</th></tr></thead>
          <tbody>
            {V.peopleRows.map((e) => (
              <tr key={e.id}>
                <td><button type="button" className="link row" onClick={e.go} style={{ gap: 8, flexWrap: 'nowrap' }}><span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{e.initials}</span>{e.name}</button></td>
                <td className="mono">{e.id}</td><td>{e.dept}</td><td>{e.role}</td>
                <td className="small"><span className="mono">{e.devices}</span><br /><span className="tiny muted">{e.rmCount} approved removable</span></td>
                <td><span className="row small" style={{ gap: 6, flexWrap: 'nowrap' }}><span className={e.agentCls} />{e.agent}</span></td>
                <td className="small">{e.recent}</td><td className="mono">{e.open}</td><td className="small">{e.inv}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {V.peopleEmpty && <div className="empty">No employees match.</div>}
      </div>
    </>
  );
}
