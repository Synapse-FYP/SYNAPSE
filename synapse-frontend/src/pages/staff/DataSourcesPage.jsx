import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { buildDataSources } from '../../viewmodels/staff/dataSources.js';
import PageHeader from '../../components/common/PageHeader.jsx';
import Tabs from '../../components/common/Tabs.jsx';

function ImportsTab({ V }) {
  const { state, store } = useSynapse();
  const { isAdmin } = getBase(store);
  const { imp, imph } = V;
  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 360px)', alignItems: 'start' }}>
      <section className="card card-b" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2>Import a sample file</h2>
        <p className="small muted" style={{ margin: 0 }}>CSV or JSON up to 2 MB. Browser imports are for small samples only — the multi-gigabyte CERT dataset is processed offline in chunked notebooks.</p>
        {isAdmin && (
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ width: 240 }}><label htmlFor="imp-src">Source type</label>
              <select id="imp-src" className="select" value={state.ui.impSource} onChange={imph.source}>
                <option value="CERT r5.2 research sample">CERT r5.2 research sample</option>
                <option value="Authentication log export">Authentication log export</option>
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="imp-file">File</label><input id="imp-file" className="input" type="file" accept=".csv,.json" onChange={imph.file} /></div>
            <button type="button" className="btn btn-secondary" onClick={imph.sample}>Use demo sample</button>
          </div>
        )}
        {V.hasImpErr && <div className="banner banner-warn" role="alert">{V.impErr}</div>}
        {imp.has && (
          <>
            <div className="lbl">Preview · {imp.name} · {imp.total} rows</div>
            <div className="table-wrap">
              <table className="t">
                <thead><tr>{imp.cols.map((c, i) => <th key={i}>{c}</th>)}</tr></thead>
                <tbody>{imp.rows.map((r, ri) => <tr key={ri}>{r.map((v, ci) => <td key={ci} className="mono small">{v}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="lbl">Column mapping to the SYNAPSE event schema</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {V.impFields.map((f) => (
                <div key={f.k} className="field">
                  <label>{f.label} <span className="tiny muted">({f.req})</span></label>
                  <select className="select" value={f.val} onChange={f.set} aria-label={f.label}>
                    <option value="">— Not mapped —</option>
                    {V.impColOpts.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="row">
              <button type="button" className="btn btn-primary" onClick={imph.confirm} disabled={V.impBusy}>Validate and import</button>
              <button type="button" className="btn btn-ghost" onClick={imph.cancel}>Cancel</button>
              {V.impBusy && <span className="small muted" role="status">Validating…</span>}
            </div>
          </>
        )}
      </section>
      <section className="card">
        <div className="card-h"><h2>Import history</h2></div>
        <div className="card-b stack" style={{ gap: 8 }}>
          {V.imports.map((i) => (
            <div key={i.id} className="note">
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="mono small">{i.id}</span><span className={i.cls}>{i.status}</span></div>
              <div className="small" style={{ wordBreak: 'break-all' }}>{i.file}</div>
              <div className="tiny muted">{i.source} · {i.rows} rows · {i.by} · {i.at}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function DataSourcesPage() {
  const { store } = useSynapse();
  const V = buildDataSources(store);
  return (
    <>
      <PageHeader title="Dataset & Data Sources" sub="Review CERT research-data provenance, validate small sample imports, and inspect import history. Full CERT datasets require the offline processing pipeline; this HTML is still a browser demonstration." />
      <Tabs tabs={V.dsTabs} />
      {V.dst.imports && <ImportsTab V={V} />}
      {V.dst.provenance && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
          <section className="card card-b" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><h3>CERT r5.2 research data</h3><span className="tag-exp">Completed experiments</span></div>
            <p className="small" style={{ margin: '8px 0 0' }}>Synthetic insider-threat benchmark. 79,856,699 raw events from logon, device, file, email and HTTP; 693,649 employee-days; 2,000 employees; event-level answer audit passed. Used for model training and retrospective evaluation only — never displayed as live activity.</p>
          </section>
          <section className="card card-b" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><h3>Simulated demonstration events</h3><span className="tag-sim">This prototype</span></div>
            <p className="small" style={{ margin: '8px 0 0' }}>Deterministic daily activity for the fictional Meridian Ledger Group (16 Oct – 14 Nov 2026). Powers alerts, baselines and charts in this frontend.</p>
          </section>
        </div>
      )}
    </>
  );
}
