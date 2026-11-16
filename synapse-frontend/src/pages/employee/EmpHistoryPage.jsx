import { useSynapse } from '../../store/index.js';
import { buildEmpHistory } from '../../viewmodels/employee.js';

export default function EmpHistoryPage() {
  const { store } = useSynapse();
  const hist = buildEmpHistory(store);
  return (
    <>
      <h1>My Activity History</h1>
      <p className="small muted" style={{ margin: 0 }}>Your awareness activities only. Security investigations and other employees’ information are never shown here.</p>
      <section className="ecard">
        {hist.length === 0 && <div className="empty">No activity yet.</div>}
        {hist.map((h, i) => (
          <div key={i} className="hist"><span className={h.cls} /><div><div className="small">{h.text}</div><div className="tiny muted mono">{h.when} · {h.type}</div></div></div>
        ))}
      </section>
    </>
  );
}
