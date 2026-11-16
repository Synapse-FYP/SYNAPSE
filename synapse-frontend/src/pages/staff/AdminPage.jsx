import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildAdmin } from '../../viewmodels/staff/admin.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import NavIcon from '../../components/common/NavIcon.jsx';

// Icon for each settings section in the horizontal settings bar.
const TAB_ICONS = { employees: 'users', users: 'shield', org: 'sitemap', devices: 'device', notify: 'bell', orginfo: 'building', status: 'pulse', account: 'user' };

function FieldError({ msg }) {
  return msg ? <span className="errtext">{msg}</span> : null;
}

function EmployeesSection({ V }) {
  const ee = V.ee;
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between' }}><h2>Employee management</h2><button type="button" className="btn btn-primary" onClick={V.adNewEmp}>Create employee</button></div>
      {V.empEditShow && (
        <section className="card" style={{ borderColor: '#2F6E8C' }}>
          <div className="card-h"><h3>{ee.title}</h3></div>
          <div className="card-b grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
            <div className="field"><label htmlFor="ee-n">Full name</label><input id="ee-n" className="input" value={ee.name} onChange={ee.set.name} /><FieldError msg={ee.err.name} /></div>
            <div className="field"><label htmlFor="ee-e">Work email</label><input id="ee-e" className="input" value={ee.email} onChange={ee.set.email} /><FieldError msg={ee.err.email} /></div>
            <div className="field"><label htmlFor="ee-d">Department</label>
              <select id="ee-d" className="select" value={ee.dept} onChange={ee.set.dept}><option value="">Select department</option>{V.depts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
              <FieldError msg={ee.err.dept} />
            </div>
            <div className="field"><label htmlFor="ee-r">Job role</label>
              <select id="ee-r" className="select" value={ee.role} onChange={ee.set.role}><option value="">Select role</option>{ee.roleOpts.map((r) => <option key={r} value={r}>{r}</option>)}</select>
              <FieldError msg={ee.err.role} />
            </div>
            <div className="field"><label htmlFor="ee-s">Account status</label>
              <select id="ee-s" className="select" value={ee.status} onChange={ee.set.status}><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
            </div>
            <div className="field"><label htmlFor="ee-site">Site</label><input id="ee-site" className="input" value={ee.site || ''} onChange={ee.set.site} /></div>
          </div>
          <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={ee.cancel}>Cancel</button><button type="button" className="btn btn-primary" onClick={ee.save}>Save employee</button></div>
        </section>
      )}
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead>
          <tbody>
            {V.adEmps.map((e) => <tr key={e.id}><td className="mono">{e.id}</td><td>{e.name}</td><td className="small">{e.email}</td><td>{e.dept}</td><td>{e.role}</td><td className="mono small">{e.hired}</td><td><span className={e.cls}>{e.status}</span></td><td><button type="button" className="btn btn-secondary btn-sm" onClick={e.edit}>Edit</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

function UsersSection({ V }) {
  return (
    <>
      <h2>User accounts</h2>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th /></tr></thead>
          <tbody>{V.adUsers.map((x) => <tr key={x.id}><td>{x.name}</td><td className="mono small">{x.email}</td><td>{x.role}</td><td><span className={x.cls}>{x.status}</span></td><td><button type="button" className="btn btn-ghost btn-sm" onClick={x.toggle}>{x.toggleLabel}</button></td></tr>)}</tbody>
        </table>
      </div>
      <h2>Roles and permissions</h2>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Permission</th><th>Administrator</th><th>Security Analyst</th><th>Employee</th></tr></thead>
          <tbody>{V.perm.map((r) => <tr key={r.label}><td>{r.label}</td><td className="mono">{r.a}</td><td className="mono">{r.s}</td><td className="mono">{r.e}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="banner banner-info">Role checks in this prototype run in the browser. Production authorization must be enforced by the backend API gateway.</div>
    </>
  );
}

function OrgSection({ V }) {
  const { state } = useSynapse();
  const u = state.ui;
  return (
    <>
      <h2>Departments &amp; job roles</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
        <section className="card card-b" style={{ padding: 16 }}>
          <h3>Add department</h3>
          <div className="row" style={{ marginTop: 10, flexWrap: 'nowrap' }}><input className="input" aria-label="Department name" value={u.deptName} onChange={V.adOrg.dept} placeholder="e.g. Procurement" /><button type="button" className="btn btn-primary" onClick={V.adOrg.addDept}>Add</button></div>
        </section>
        <section className="card card-b" style={{ padding: 16 }}>
          <h3>Add job role</h3>
          <div className="stack" style={{ gap: 8, marginTop: 10 }}>
            <input className="input" aria-label="Job role name" value={u.roleName} onChange={V.adOrg.role} placeholder="e.g. Procurement Officer" />
            <div className="row" style={{ flexWrap: 'nowrap' }}>
              <select className="select" aria-label="Department for role" value={u.roleDept} onChange={V.adOrg.roleDept}>{V.depts.map((o) => <option key={o.v} value={o.v}>{o.v}</option>)}</select>
              <button type="button" className="btn btn-primary" onClick={V.adOrg.addRole}>Add</button>
            </div>
          </div>
        </section>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>Department</th><th>Employees</th><th>Job roles</th></tr></thead>
          <tbody>{V.depts.map((d) => <tr key={d.id}><td>{d.v}</td><td className="mono">{d.n}</td><td className="small">{d.roles}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

function DevicesSection({ V }) {
  const { state, store } = useSynapse();
  const { employeesOpt } = getBase(store);
  const f = state.ui.rmForm;
  return (
    <>
      <h2>Approved removable devices</h2>
      <section className="card card-b" style={{ padding: 16 }}>
        <h3>Register an approved device</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 10, alignItems: 'end' }}>
          <div className="field"><label htmlFor="rm-l">Device label</label><input id="rm-l" className="input" value={f.label} onChange={V.rmf.label} placeholder="e.g. Kingston IronKey" /></div>
          <div className="field"><label htmlFor="rm-s">Serial</label><input id="rm-s" className="input" value={f.serial} onChange={V.rmf.serial} placeholder="e.g. KIK-90011" /></div>
          <div className="field"><label htmlFor="rm-e">Assigned employee</label>
            <select id="rm-e" className="select" value={f.emp} onChange={V.rmf.emp}>{employeesOpt.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
          </div>
          <button type="button" className="btn btn-primary" onClick={V.rmf.save}>Register device</button>
        </div>
        {V.hasRmErr && <span className="errtext">{V.rmErr}</span>}
      </section>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ID</th><th>Device</th><th>Serial</th><th>Employee</th><th>Status</th><th>Added</th><th /></tr></thead>
          <tbody>{V.adRm.map((r) => <tr key={r.id}><td className="mono">{r.id}</td><td>{r.label}</td><td className="mono small">{r.serial}</td><td>{r.emp}</td><td><span className={r.cls}>{r.approved}</span></td><td className="mono small">{r.added}</td><td><button type="button" className="btn btn-ghost btn-sm" onClick={r.toggle}>{r.toggleLabel}</button></td></tr>)}</tbody>
        </table>
      </div>
      <h2>Registered endpoints</h2>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>ID</th><th>Device</th><th>Employee</th><th>Status</th></tr></thead>
          <tbody>{V.adEps.map((e) => <tr key={e.id}><td className="mono">{e.id}</td><td className="mono">{e.name}</td><td>{e.emp}</td><td>{e.status}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="tiny muted" style={{ margin: 0 }}>Register new endpoints and configure integrations from Data Sources &amp; Agents. Policy settings live in Security Policies.</p>
    </>
  );
}

function OrgInfoSection({ V }) {
  const o = V.orgf;
  return (
    <>
      <h2>Organization information</h2>
      <section className="card card-b grid" style={{ padding: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
        <div className="field"><label htmlFor="o-n">Organization name</label><input id="o-n" className="input" value={o.name} onChange={V.orgSet.name} /></div>
        <div className="field"><label htmlFor="o-tz">Time zone</label><input id="o-tz" className="input" value={o.timezone} onChange={V.orgSet.timezone} /></div>
        <div className="field"><label htmlFor="o-r">Data retention</label>
          <select id="o-r" className="select" value={o.retention} onChange={V.orgSet.retention}><option value="90 days">90 days</option><option value="180 days">180 days</option><option value="365 days">365 days</option></select>
        </div>
        <div className="field"><label htmlFor="o-s">Off-hours start</label><input id="o-s" className="input" value={o.offStart} onChange={V.orgSet.offStart} /></div>
        <div className="field"><label htmlFor="o-e">Off-hours end</label><input id="o-e" className="input" value={o.offEnd} onChange={V.orgSet.offEnd} /></div>
        <div className="row" style={{ alignSelf: 'end' }}><button type="button" className="btn btn-primary" onClick={o.save}>Save organization settings</button></div>
      </section>
    </>
  );
}

export default function AdminPage() {
  const { store } = useSynapse();
  const { meV } = getBase(store);
  const V = buildAdmin(store);
  const t = V.adt;

  return (
    <>
      <PageHeader title="Administration & Settings" sub="Manage the organization model SYNAPSE relies on for context: employees, accounts, departments, roles, devices and system preferences." />
      <div className="stack">
        <nav className="settings-bar" aria-label="Settings sections">
          {V.adTabs.map((x) => (
            <button key={x.k} type="button" className={'settings-tab' + (x.sel === 'true' ? ' on' : '')} aria-current={x.sel === 'true' ? 'page' : undefined} onClick={x.go}>
              <NavIcon name={TAB_ICONS[x.k]} />
              <span>{x.label}</span>
            </button>
          ))}
        </nav>
        <div className="settings-body">
          {t.employees && <EmployeesSection V={V} />}
          {t.users && <UsersSection V={V} />}
          {t.org && <OrgSection V={V} />}
          {t.devices && <DevicesSection V={V} />}
          {t.notify && (
            <>
              <h2>Notification preferences</h2>
              <section className="card card-b" style={{ padding: '8px 16px' }}>
                {V.notif.map((n) => <label key={n.k} className="switch" style={{ borderBottom: '1px solid #1C2740' }}><input type="checkbox" checked={n.on} onChange={n.toggle} /><span className="small">{n.label}</span></label>)}
              </section>
              <p className="tiny muted" style={{ margin: 0 }}>Notifications are not sent from this prototype; preferences are stored for the planned real-time alert service.</p>
            </>
          )}
          {t.orginfo && <OrgInfoSection V={V} />}
          {t.status && (
            <>
              <h2>System status</h2>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
                {V.sysStatus.map((x) => (
                  <section key={x.name} className="card card-b" style={{ padding: 14 }}>
                    <div className="row" style={{ justifyContent: 'space-between' }}><b className="small">{x.name}</b><span className="row small" style={{ gap: 6 }}><span className={x.cls} />{x.st}</span></div>
                    <div className="tiny muted" style={{ marginTop: 6 }}>{x.note}</div>
                  </section>
                ))}
              </div>
            </>
          )}
          {t.account && (
            <>
              <h2>Account settings</h2>
              <section className="card card-b" style={{ padding: 16 }}>
                <dl className="kv" style={{ margin: 0 }}><dt>Name</dt><dd>{meV.name}</dd><dt>Role</dt><dd>{meV.title}</dd><dt>Authentication</dt><dd>Simulated demo login. Password changes and MFA will be handled by the organization’s identity provider in production.</dd></dl>
                <div className="row" style={{ marginTop: 14 }}><button type="button" className="btn btn-secondary" onClick={() => store.logout()}>Sign out</button></div>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
