import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';

export default function AccessDenied() {
  const { store } = useSynapse();
  const { meV } = getBase(store);
  return (
    <div className="card" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <h1>Access restricted</h1>
      <p className="muted" style={{ margin: 0 }}>This page is available to System Administrators only. Your role ({meV.roleLabel}) does not include this permission.</p>
      <button type="button" className="btn btn-primary" onClick={() => store.go('overview')}>Return to Overview</button>
    </div>
  );
}
