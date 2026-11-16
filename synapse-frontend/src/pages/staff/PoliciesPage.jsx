import { useSynapse } from '../../store/index.js';
import { buildPolicies, POLICY_CATS } from '../../viewmodels/staff/policies.js';
import PageHeader from '../../components/common/PageHeader.jsx';

function FieldError({ msg }) {
  return msg ? <span className="errtext">{msg}</span> : null;
}

function PolicyEditor({ pe, roleOpts }) {
  return (
    <section className="card" style={{ borderColor: '#2F6E8C' }}>
      <div className="card-h"><h2>{pe.title}</h2></div>
      <div className="card-b grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 14 }}>
        <div className="field"><label htmlFor="pe-name">Policy name</label><input id="pe-name" className="input" value={pe.name} onChange={pe.set.name} /><FieldError msg={pe.err.name} /></div>
        <div className="field"><label htmlFor="pe-cat">Category</label>
          <select id="pe-cat" className="select" value={pe.cat} onChange={pe.set.cat}><option value="">Select category</option>{POLICY_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
          <FieldError msg={pe.err.cat} />
        </div>
        <div className="field"><label htmlFor="pe-roles">Applicable roles</label>
          <select id="pe-roles" className="select" value={pe.rolesVal} onChange={pe.set.roles}>{roleOpts.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="pe-dev">Relevant devices</label><input id="pe-dev" className="input" value={pe.devices} onChange={pe.set.devices} /></div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <span className="lbl">Departments</span>
          <div className="row" style={{ gap: 6 }}>
            {pe.deptChecks.map((d) => (
              <label key={d.d} className="switch" style={{ minHeight: 32, border: '1px solid #22304D', borderRadius: 7, padding: '0 10px' }}><input type="checkbox" checked={d.on} onChange={d.toggle} /><span className="small">{d.d}</span></label>
            ))}
          </div>
          <FieldError msg={pe.err.depts} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}><label htmlFor="pe-body">Policy text</label><textarea id="pe-body" className="textarea" value={pe.body} onChange={pe.set.body} /><FieldError msg={pe.err.body} /></div>
        <label className="switch"><input type="checkbox" checked={!!pe.enabled} onChange={pe.set.enabled} /><span className="small">Policy enabled</span></label>
        <label className="switch"><input type="checkbox" checked={!!pe.ack} onChange={pe.set.ack} /><span className="small">Requires employee acknowledgment</span></label>
      </div>
      <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={pe.cancel}>Cancel</button><button type="button" className="btn btn-primary" onClick={pe.save}>Save policy</button></div>
    </section>
  );
}

export default function PoliciesPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const V = buildPolicies(store);
  return (
    <>
      <PageHeader title="Security Policies" sub="Organizational policies used as context for behavioral alerts and employee acknowledgments. A policy violation is a security indicator, not automatic proof of malicious intent.">
        <button type="button" className="btn btn-primary" onClick={V.polf.create}>Create policy</button>
      </PageHeader>
      {V.polEditShow && <PolicyEditor pe={V.pe} roleOpts={V.roleOpts} />}
      <div className="row">
        <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="pol-q">Search policies</label><input id="pol-q" className="input" value={u.polQ} onChange={V.polf.q} placeholder="Name, ID or text" /></div>
        <div className="field" style={{ width: 260 }}><label htmlFor="pol-c">Category</label>
          <select id="pol-c" className="select" value={u.polCat} onChange={V.polf.cat}><option value="All">All categories</option>{POLICY_CATS.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
        {V.polRows.map((p) => (
          <section key={p.id} className="card card-b" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}><div><span className="mono muted small">{p.id}</span><h3 style={{ fontSize: 15 }}>{p.name}</h3></div><span className={p.cls}>{p.status}</span></div>
            <span className="pill pill-violet" style={{ alignSelf: 'flex-start' }}>{p.cat}</span>
            <p className="small" style={{ margin: 0 }}>{p.body}</p>
            <dl className="kv small" style={{ margin: 0 }}><dt>Departments</dt><dd>{p.depts}</dd><dt>Roles</dt><dd>{p.roles}</dd><dt>Devices</dt><dd>{p.devices}</dd><dt>Acknowledgment</dt><dd>{p.ack}</dd><dt>Updated</dt><dd>{p.updated}</dd></dl>
            <div className="row" style={{ marginTop: 'auto' }}><button type="button" className="btn btn-secondary btn-sm" onClick={p.edit}>Edit</button><button type="button" className="btn btn-ghost btn-sm" onClick={p.toggle}>{p.toggleLabel}</button></div>
          </section>
        ))}
      </div>
      {V.polEmpty && <div className="empty card">No policies match.</div>}
    </>
  );
}
