// Employee profile: header card + personal information, editable preferences and notification settings.
// Layout and card styling mirror the staff Employee Profile (avatar header, kv detail cards).
import { useSynapse } from '../../store/index.js';
import { buildEmpProfile } from '../../viewmodels/employee.js';
import NavIcon from '../../components/common/NavIcon.jsx';

export default function EmpProfilePage() {
  const { store } = useSynapse();
  const p = buildEmpProfile(store);
  return (
    <>
      <div>
        <h1>Profile &amp; Settings</h1>
        <p className="small muted" style={{ margin: '4px 0 0' }}>Your account details and personal preferences for the security awareness portal.</p>
      </div>

      <section className="ecard profile-head" aria-label="Profile summary">
        <span className="avatar avatar-lg">{p.initials}</span>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2>{p.name}</h2>
          <div className="muted small" style={{ marginTop: 2 }}>{p.role} · {p.dept}</div>
          <div className="profile-meta tiny muted">
            <span><NavIcon name="user" /><span className="mono">{p.id}</span></span>
            <span><NavIcon name="mail" />{p.email}</span>
          </div>
        </div>
        <span className={p.statusCls}>{p.status} account</span>
      </section>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', alignItems: 'start' }}>
        <section className="ecard">
          <div className="profile-sec-h"><h2>Personal information</h2><span className="tiny muted">Managed by your administrator</span></div>
          <dl className="kv profile-kv" style={{ margin: 0 }}>
            <dt>Full name</dt><dd>{p.name}</dd>
            {p.savedPref && <><dt>Preferred name</dt><dd>{p.savedPref}</dd></>}
            <dt>Employee ID</dt><dd className="mono">{p.id}</dd>
            <dt>Email</dt><dd>{p.email}</dd>
            <dt>Department</dt><dd>{p.dept}</dd>
            <dt>Job title</dt><dd>{p.role}</dd>
            {p.savedExt && <><dt>Desk extension</dt><dd className="mono">{p.savedExt}</dd></>}
          </dl>
          <p className="tiny muted" style={{ margin: '14px 0 0' }}>Name, department and role are managed by your administrator. Contact them if something is incorrect.</p>
        </section>

        <div className="stack" style={{ gap: 14 }}>
          <section className="ecard" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="profile-sec-h" style={{ marginBottom: 0 }}><h2>Profile preferences</h2><span className="tiny muted">Editable by you</span></div>
            <div className="field"><label htmlFor="pf-n">Preferred first name</label><input id="pf-n" className="input" value={p.prefName} onChange={p.setPref} placeholder="Optional" /></div>
            <div className="field"><label htmlFor="pf-e">Desk phone extension</label><input id="pf-e" className="input" inputMode="numeric" value={p.ext} onChange={p.setExt} placeholder="e.g. 4417" /></div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-primary" onClick={p.save} disabled={p.saveDis}>Save profile</button>
            </div>
          </section>

          <section className="ecard">
            <div className="profile-sec-h" style={{ marginBottom: 4 }}><h2>Notifications</h2><span className="tiny muted">Saved automatically</span></div>
            <div className="profile-switches">
              {p.notif.map((n) => <label key={n.k} className="switch"><input type="checkbox" checked={n.on} onChange={n.toggle} /><span className="small">{n.label}</span></label>)}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
