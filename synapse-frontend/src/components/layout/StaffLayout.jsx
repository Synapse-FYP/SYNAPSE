// Security portal shell: collapsible sidebar, top bar and routed page content.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { NAV, ADMIN_NAV, SOC_NAV, STAFF_BASE } from '../../lib/constants.js';
import NavIcon from '../common/NavIcon.jsx';
import PageBack from './PageBack.jsx';
import AlertDrawer from '../alerts/AlertDrawer.jsx';
import markUrl from '../../assets/synapse-mark.png';

export default function StaffLayout() {
  const { state, store } = useSynapse();
  const { pathname } = useLocation();
  const page = pathname.split('/')[2] || 'overview';
  useEffect(() => { store.syncPage(page); }, [store, page]);

  const { db, ui: u } = state;
  const { meV, isAdmin, alertsAll } = getBase(store);
  const visibleNav = isAdmin ? ADMIN_NAV : SOC_NAV;
  const newCount = alertsAll.filter((a) => a.status === 'New').length;
  const toReview = db.verifications.filter((v) => v.respondedAt && !v.reviewed).length;
  const nav = NAV.filter((n) => visibleNav.indexOf(n.k) >= 0).map((n) => ({
    ...n,
    badge: n.k === 'detection' ? (newCount ? String(newCount) : '') : n.k === 'awareness' ? (toReview ? String(toReview) : '') : '',
  }));
  const cur = NAV.find((n) => n.k === page) || NAV[0];
  const collapseLabel = u.collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <>
      <div className={'shell' + (u.collapsed ? ' collapsed' : '')}>
        <nav className="side" aria-label="Security portal navigation">
          <div className="side-brand">
            <img src={markUrl} alt="SYNAPSE" />
            <div className="side-brand-text"><div className="brand-name">SYNAPSE</div><div className="brand-tag">Security intelligence</div></div>
          </div>
          {nav.map((n) => (
            <button key={n.k} type="button" className={'nav-item' + (n.k === page ? ' active' : '')} onClick={() => store.go(n.k)} aria-current={n.k === page ? 'page' : 'false'} title={n.label}>
              <NavIcon name={n.icon} />
              <span className="nav-label">{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
          <div className="side-foot">
            <button type="button" className="nav-item" onClick={() => store.ui({ collapsed: !u.collapsed })} aria-label={collapseLabel}>
              <NavIcon name="collapse" />
              <span className="nav-label">{collapseLabel}</span>
            </button>
            <div className="side-foot-text tiny" style={{ color: '#7F91A5', padding: '6px 10px' }}>Prototype · simulated data · CERT r5.2 results are retrospective</div>
          </div>
        </nav>

        <div className="main">
          <header className="topbar">
            <div className="crumbs" aria-label="Breadcrumb"><span>SYNAPSE</span><span aria-hidden="true">/</span><span>{meV.roleLabel} portal</span><span aria-hidden="true">/</span><b>{cur.label}</b></div>
            <span className="tag-sim" style={{ marginLeft: 8 }}>Demo environment</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="userchip"><span className="avatar">{meV.initials}</span><span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}><b style={{ fontSize: 13 }}>{meV.name}</b><span className="tiny muted">{meV.title}</span></span></div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => store.logout()}>Sign out</button>
            </div>
          </header>
          <main className="content">
            <PageBack portal="staff" page={page} home="overview" prefix={STAFF_BASE} />
            <Outlet />
          </main>
        </div>
      </div>
      <AlertDrawer />
    </>
  );
}
