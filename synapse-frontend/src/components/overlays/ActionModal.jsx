// Shared modal for assigning interventions, requesting verification, registering endpoints and configuring integrations.
import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { today } from '../../lib/utils.js';

export default function ActionModal() {
  const { state, store } = useSynapse();
  const md = state.ui.modal;
  if (!md || !store.me()) return null;
  const { alertsAll, employeesOpt, refOpts } = getBase(store);
  const close = () => store.ui({ modal: null });
  const submit = () => store.submitModal();
  const mf = (k) => (e) => store.setModalField(k, e.target.value);
  const err = md.err ? <div className="errtext" role="alert">{md.err}</div> : null;
  const empName = md.kind === 'verify' ? (alertsAll.find((x) => x.id === md.alert) || {}).empName || '' : '';
  const intgName = md.kind === 'intg' ? (state.db.integrations.find((x) => x.id === md.id) || {}).name || '' : '';

  return (
    <>
      <div className="scrim modal-scrim" onClick={close} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {md.kind === 'assignTraining' && (
          <>
            <div className="modal-h"><h2 id="modal-title">Assign security-awareness intervention</h2><p className="small muted" style={{ margin: '4px 0 0' }}>The assignment appears in the employee’s portal immediately.</p></div>
            <div className="modal-b">
              <div className="field"><label htmlFor="m-emp">1 · Employee</label>
                <select id="m-emp" className="select" value={md.emp || ''} onChange={mf('emp')}>
                  <option value="">Select employee</option>
                  {employeesOpt.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="m-ref">2 · Training type</label>
                <select id="m-ref" className="select" value={md.ref || ''} onChange={mf('ref')}>
                  {refOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
              <div className="field"><label htmlFor="m-reason">3 · Reason</label><textarea id="m-reason" className="textarea" value={md.reason || ''} onChange={mf('reason')} placeholder="Why this intervention is appropriate" /></div>
              <div className="field"><label htmlFor="m-due">4 · Due date</label><input id="m-due" className="input" type="date" min={today()} value={md.due || ''} onChange={mf('due')} /></div>
              {err}
            </div>
            <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>5 · Confirm assignment</button></div>
          </>
        )}
        {md.kind === 'verify' && (
          <>
            <div className="modal-h"><h2 id="modal-title">Request verification from {empName}</h2><p className="small muted" style={{ margin: '4px 0 0' }}>The employee will see this request in their portal. This is a simulated confirmation, not identity-provider MFA.</p></div>
            <div className="modal-b"><div className="field"><label htmlFor="m-vr">Activity to confirm</label><textarea id="m-vr" className="textarea" value={md.reason || ''} onChange={mf('reason')} /></div>{err}</div>
            <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button type="button" className="btn btn-violet" onClick={submit}>Send request</button></div>
          </>
        )}
        {md.kind === 'registerEp' && (
          <>
            <div className="modal-h"><h2 id="modal-title">Register a simulated endpoint</h2><p className="small muted" style={{ margin: '4px 0 0' }}>Creates a demo record only. The real Windows endpoint agent is a separate component.</p></div>
            <div className="modal-b">
              <div className="field"><label htmlFor="m-epn">Device name</label><input id="m-epn" className="input" value={md.name || ''} onChange={mf('name')} placeholder="MLG-FIN-LT030" /></div>
              <div className="field"><label htmlFor="m-os">Operating system</label>
                <select id="m-os" className="select" value={md.os || ''} onChange={mf('os')}>
                  <option value="Windows 11 Enterprise 23H2">Windows 11 Enterprise 23H2</option>
                  <option value="Windows 10 Enterprise 22H2">Windows 10 Enterprise 22H2</option>
                </select>
              </div>
              <div className="field"><label htmlFor="m-epe">Assigned employee</label>
                <select id="m-epe" className="select" value={md.emp || ''} onChange={mf('emp')}>
                  <option value="">Shared / unassigned</option>
                  {employeesOpt.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              {err}
            </div>
            <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>Register device</button></div>
          </>
        )}
        {md.kind === 'intg' && (
          <>
            <div className="modal-h"><h2 id="modal-title">Configure {intgName}</h2><p className="small muted" style={{ margin: '4px 0 0' }}>Simulated configuration — no connection is made and no credentials are stored.</p></div>
            <div className="modal-b"><div className="field"><label htmlFor="m-ie">Connection endpoint</label><input id="m-ie" className="input" value={md.endpoint || ''} onChange={mf('endpoint')} placeholder="e.g. syslog://collector01:514" /></div>{err}</div>
            <div className="modal-f"><button type="button" className="btn btn-ghost" onClick={close}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>Save configuration</button></div>
          </>
        )}
      </div>
    </>
  );
}
