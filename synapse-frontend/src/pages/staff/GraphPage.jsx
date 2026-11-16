import { useSynapse } from '../../store/index.js';
import { buildGraph } from '../../viewmodels/staff/graph.js';
import PageHeader from '../../components/common/PageHeader.jsx';

function SelectionCard({ sel }) {
  return (
    <section className="card card-b" style={{ padding: 16 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}><span className="pill pill-cyan">{sel.kind}</span><button type="button" className="btn btn-ghost btn-sm" onClick={sel.clear} aria-label="Clear selection">✕</button></div>
      <h2 style={{ marginTop: 8 }}>{sel.label}</h2><div className="small muted">{sel.sub}</div>
      <div className="lbl" style={{ marginTop: 12 }}>{sel.nConn} connections</div>
      <div className="stack" style={{ gap: 4, marginTop: 6, maxHeight: 240, overflowY: 'auto' }}>
        {sel.conn.map((c, i) => <button key={c.id + i} type="button" className="link small" onClick={c.go} style={{ fontWeight: 500 }}>{c.label} <span className="tiny muted">· {c.rel}</span></button>)}
      </div>
      {sel.hasEvs && (
        <>
          <div className="lbl" style={{ marginTop: 12 }}>Related events</div>
          <div className="stack" style={{ gap: 4, marginTop: 6 }}>
            {sel.evs.map((e) => <button key={e.id} type="button" className="link small" onClick={e.go} style={{ fontWeight: 500 }}><span className="mono">{e.id}</span> {e.text}</button>)}
          </div>
        </>
      )}
      <div className="row" style={{ marginTop: 12 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={sel.focus}>Highlight connections</button>
        {sel.isEmp && <button type="button" className="btn btn-primary btn-sm" onClick={sel.profile}>Employee profile</button>}
      </div>
    </section>
  );
}

export default function GraphPage() {
  const { state, store } = useSynapse();
  const u = state.ui;
  const V = buildGraph(store);
  const gh = V.gh;

  return (
    <>
      <PageHeader title="Graph Explorer" sub="Organizational relationships between employees, endpoints, departments, roles, devices, resources and network destinations. This is a visual exploration of simulated relationship data — the proposed graph model (GraphSAGE / GCN) has not been trained or validated.">
        <span className="tag-plan">Proposed capability · simulated data</span>
      </PageHeader>
      <div className="card card-b" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', padding: 14 }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}><label htmlFor="g-q">Search nodes</label>
          <div className="row" style={{ flexWrap: 'nowrap', gap: 6 }}><input id="g-q" className="input" value={u.gq} onChange={gh.q} placeholder="e.g. MLG-SHR-PC09, Finance share" /><button type="button" className="btn btn-secondary" onClick={gh.searchGo}>Find</button></div>
        </div>
        <div className="field" style={{ width: 220 }}><label htmlFor="g-focus">Focus on employee</label>
          <select id="g-focus" className="select" value={u.gFocus} onChange={gh.focus}><option value="">None</option>{V.gEmpOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
        </div>
        <button type="button" className="btn btn-secondary" onClick={gh.reset}>Reset view</button>
      </div>
      <div className="row" style={{ gap: 14 }}>
        <span className="lbl">Relationship types</span>
        {V.gRels.map((r) => (
          <label key={r.k} className="switch" style={{ minHeight: 32 }}><input type="checkbox" checked={r.checked} onChange={r.toggle} /><span className="lg-sw" style={r.sw} /><span className="small">{r.label}</span></label>
        ))}
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(260px, 320px)', alignItems: 'start' }}>
        <div className="gwrap" onPointerDown={gh.down0} onPointerMove={gh.move} onPointerUp={gh.up0} onPointerLeave={gh.up0}>
          <div className="gcanvas" style={V.gCanvasStyle}>
            {V.gEdges.map((e) => <span key={e.key} className="gedge" style={e.style} />)}
            {V.gNodes.map((n) => (
              <button key={n.id} type="button" className={n.cls} style={n.style} onClick={n.go} aria-label={n.aria}>
                <span className="gnode-dot" style={n.dotStyle} />
                <span className="gnode-text"><span className="gnode-label">{n.label}</span><span className="gnode-sub">{n.sub}</span></span>
              </button>
            ))}
          </div>
          <div className="gctl" style={{ right: 12, top: 12 }}>
            <button type="button" className="gbtn" onClick={gh.zin} aria-label="Zoom in">+</button>
            <button type="button" className="gbtn" onClick={gh.zout} aria-label="Zoom out">−</button>
            <span className="gbtn" style={{ display: 'inline-flex', alignItems: 'center', padding: '0 8px', fontWeight: 500, fontSize: 12 }}>{V.gZoomLabel}</span>
          </div>
          <div className="gctl" style={{ right: 12, bottom: 12 }}>
            <button type="button" className="gbtn" onClick={gh.left} aria-label="Pan left">←</button>
            <button type="button" className="gbtn" onClick={gh.up} aria-label="Pan up">↑</button>
            <button type="button" className="gbtn" onClick={gh.down} aria-label="Pan down">↓</button>
            <button type="button" className="gbtn" onClick={gh.right} aria-label="Pan right">→</button>
          </div>
          <div className="gctl tiny" style={{ left: 12, bottom: 12, color: '#8FA0B3', gap: 12 }}>
            <span>Departments · Employees · Endpoints &amp; devices · Resources &amp; destinations · Roles</span>
            <span>{V.gStats.nodes} nodes · {V.gStats.edges} edges · drag to pan</span>
          </div>
        </div>
        <aside className="stack">
          {V.gSelShow && <SelectionCard sel={V.gSel} />}
          <section className="card card-b" style={{ padding: 16 }}>
            <h3>Reading the graph</h3>
            <ul className="small" style={{ margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Select a node to highlight its neighbours and inspect details.</li>
              <li>Red links mark computer-to-computer communication and an unapproved removable device observed on 13 Nov.</li>
              <li>Priya Nair’s link to shared kiosk MLG-SHR-PC09 reflects the unfamiliar-computer logon in AL-2041.</li>
              <li>Graph features (roles, shared devices, peer links) are proposed inputs; no validated graph-model output is shown.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
