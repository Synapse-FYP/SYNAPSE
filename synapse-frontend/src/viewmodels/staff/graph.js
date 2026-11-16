import { GRAPH_RES, GRAPH_ACCESS, GRAPH_COMM } from '../../data/content.js';
import { getBase, memoByState } from '../common.js';

export const GRAPH_RELS = [['member', 'Belongs to department', '#8B5CF6'], ['role', 'Assigned role', '#94A3B8'], ['uses', 'Uses endpoint', '#60A5FA'], ['approved', 'Removable devices', '#60A5FA'], ['access', 'Accesses resource', '#F2A93B'], ['comm', 'Computer communication', '#F0506E']];

export const buildGraph = memoByState((store) => {
  const { db, ui: u } = store.state;
  const { alertsAll } = getBase(store);
  const V = {};
  const nodes = []; const H = 820;
  const col = (list, x, kind, color) => { list.forEach((it, i) => { nodes.push(Object.assign({ x, y: 60 + (H - 120) * (list.length === 1 ? 0.5 : i / (list.length - 1)), kind, color }, it)); }); };
  col(db.departments.map((d) => ({ id: 'D:' + d.name, label: d.name, sub: 'Department' })), 110, 'department', '#8B5CF6');
  col(db.employees.filter((e) => e.status === 'Active').map((e) => ({ id: e.id, label: e.name, sub: e.role })), 400, 'employee', '#22D3EE');
  col(db.endpoints.map((ep) => ({ id: ep.id, label: ep.name, sub: 'Endpoint · ' + ep.status })).concat(db.removables.map((r) => ({ id: r.id, label: r.label, sub: r.approved ? 'Approved device' : 'Unapproved device' }))), 700, 'endpoint', '#60A5FA');
  col(GRAPH_RES.map((r) => ({ id: r.id, label: r.label, sub: r.sub, rk: r.kind })), 990, 'resource', '#F2A93B');
  col(db.roles.map((r) => ({ id: 'R:' + r.name, label: r.name, sub: 'Role' })), 1290, 'role', '#94A3B8');
  const byId = {}; nodes.forEach((n) => { byId[n.id] = n; });
  const edges = []; const rel = u.gRel;
  db.employees.forEach((e) => {
    if (!byId[e.id]) return;
    if (rel.member && byId['D:' + e.dept]) edges.push({ a: e.id, b: 'D:' + e.dept, t: 'member', label: 'belongs to' });
    if (rel.role && byId['R:' + e.role]) edges.push({ a: e.id, b: 'R:' + e.role, t: 'role', label: 'assigned role' });
    if (rel.uses) db.endpoints.filter((ep) => ep.emp === e.id).forEach((ep) => edges.push({ a: e.id, b: ep.id, t: 'uses', label: 'uses endpoint' }));
    if (rel.approved) db.removables.filter((r) => r.emp === e.id).forEach((r) => edges.push({ a: e.id, b: r.id, t: 'approved', label: r.approved ? 'approved device' : 'observed unapproved device' }));
    if (rel.access) (GRAPH_ACCESS[e.id] || []).forEach((r) => edges.push({ a: e.id, b: r, t: 'access', label: 'accesses resource' }));
  });
  if (rel.uses) edges.push({ a: 'E1009', b: 'EP-1011', t: 'uses', label: 'logon from unfamiliar computer (12 Nov)' });
  if (rel.comm) GRAPH_COMM.forEach((c) => edges.push({ a: c[0], b: c[1], t: 'comm', label: 'communicates with' }));
  const focus = u.gSel || u.gFocus;
  const nbr = new Set();
  if (focus) { nbr.add(focus); edges.forEach((e) => { if (e.a === focus) nbr.add(e.b); if (e.b === focus) nbr.add(e.a); }); }
  const q = u.gq.trim().toLowerCase();
  const ecol = { member: '#8B5CF6', role: '#94A3B8', uses: '#60A5FA', approved: '#60A5FA', access: '#F2A93B', comm: '#F0506E' };
  V.gEdges = edges.filter((e) => byId[e.a] && byId[e.b]).map((e, i) => {
    const A = byId[e.a], B = byId[e.b]; const dx = B.x - A.x, dy = B.y - A.y; const len = Math.sqrt(dx * dx + dy * dy); const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    const on = !focus || (e.a === focus || e.b === focus); const unappr = e.t === 'approved' && e.label.indexOf('unapproved') >= 0;
    const style = { left: A.x + 'px', top: A.y + 'px', width: len.toFixed(1) + 'px', transform: 'rotate(' + ang.toFixed(2) + 'deg)', background: unappr ? '#F0506E' : ecol[e.t], opacity: on ? (focus ? 0.95 : 0.45) : 0.07 };
    if (e.t === 'comm' || unappr) style.height = '2px';
    return { key: e.a + '>' + e.b + ':' + e.t + ':' + i, style };
  });
  V.gNodes = nodes.map((n) => {
    const dim = focus && !nbr.has(n.id); const match = q && (n.label + ' ' + n.sub).toLowerCase().indexOf(q) >= 0;
    const dotStyle = { background: n.color };
    if (match) dotStyle.boxShadow = '0 0 0 4px #0A1020';
    if (u.gSel === n.id) dotStyle.boxShadow = '0 0 0 3px #070C18, 0 0 0 6px ' + n.color;
    return { id: n.id, label: n.label, sub: n.sub, style: { left: n.x + 'px', top: n.y + 'px', opacity: dim ? 0.22 : 1 }, dotStyle, cls: 'gnode gnode-' + n.kind, go: () => store.ui({ gSel: u.gSel === n.id ? '' : n.id }), aria: n.label + ', ' + n.sub };
  });
  V.gCanvasStyle = { transform: 'translate(' + u.gX + 'px,' + u.gY + 'px) scale(' + u.gZoom + ')', width: '1420px', height: H + 'px' };
  V.gZoomLabel = Math.round(u.gZoom * 100) + '%';
  V.gh = {
    zin: () => store.ui({ gZoom: Math.min(2, +(u.gZoom + 0.15).toFixed(2)) }), zout: () => store.ui({ gZoom: Math.max(0.4, +(u.gZoom - 0.15).toFixed(2)) }),
    reset: () => store.ui({ gZoom: 0.72, gX: 0, gY: 0, gSel: '', gFocus: '', gq: '' }),
    left: () => store.ui({ gX: u.gX + 120 }), right: () => store.ui({ gX: u.gX - 120 }), up: () => store.ui({ gY: u.gY + 100 }), down: () => store.ui({ gY: u.gY - 100 }),
    q: (e) => store.ui({ gq: e.target.value }),
    searchGo: () => { const hit = nodes.find((n) => q && (n.label + ' ' + n.sub).toLowerCase().indexOf(q) >= 0); if (hit) store.ui({ gSel: hit.id, gX: Math.round(-hit.x * u.gZoom + 420), gY: Math.round(-hit.y * u.gZoom + 260) }); else store.toast('No node matches “' + u.gq + '”', 'warn'); },
    focus: (e) => store.ui({ gFocus: e.target.value, gSel: e.target.value }),
    down0: (e) => { store.drag = { x: e.clientX, y: e.clientY, gx: u.gX, gy: u.gY }; },
    move: (e) => { const d = store.drag; if (!d) return; store.ui({ gX: d.gx + (e.clientX - d.x), gY: d.gy + (e.clientY - d.y) }); },
    up0: () => { store.drag = null; },
  };
  V.gRels = GRAPH_RELS.map((r) => ({ k: r[0], label: r[1], checked: !!rel[r[0]], sw: { background: r[2] }, toggle: () => store.ui((x) => ({ gRel: Object.assign({}, x.gRel, { [r[0]]: !x.gRel[r[0]] }) })) }));
  V.gEmpOpts = db.employees.map((e) => ({ v: e.id, l: e.name }));
  const sel = u.gSel && byId[u.gSel];
  V.gSelShow = !!sel;
  if (sel) {
    const conn = edges.filter((e) => e.a === sel.id || e.b === sel.id).map((e) => { const o = byId[e.a === sel.id ? e.b : e.a]; return o ? { id: o.id, label: o.label, sub: o.sub, rel: e.label, go: () => store.ui({ gSel: o.id }) } : null; }).filter(Boolean);
    const isEmp = sel.kind === 'employee';
    const evs = isEmp ? alertsAll.filter((a) => a.emp === sel.id).slice(0, 4).map((a) => ({ id: a.id, text: a.whenShort + ' · ' + a.reason, go: () => store.ui({ drawer: a.id }) })) : [];
    V.gSel = {
      label: sel.label, sub: sel.sub, kind: sel.kind.charAt(0).toUpperCase() + sel.kind.slice(1), conn, nConn: conn.length, isEmp, evs, hasEvs: evs.length > 0,
      profile: () => store.go('people', { profile: sel.id, pTab: 'devices' }), focus: () => store.ui({ gFocus: sel.id }), clear: () => store.ui({ gSel: '', gFocus: '' }),
    };
  }
  V.gStats = { nodes: nodes.length, edges: V.gEdges.length };
  return V;
});
