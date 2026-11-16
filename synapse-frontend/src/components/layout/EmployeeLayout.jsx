// Employee awareness portal shell: header, workspace sidebar and routed content.
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSynapse } from '../../store/index.js';
import { getBase } from '../../viewmodels/common.js';
import { getEmpNavBadges } from '../../viewmodels/employee.js';
import { ENAV, EMP_BASE } from '../../lib/constants.js';
import PageBack from './PageBack.jsx';
import markUrl from '../../assets/synapse-mark.png';

export default function EmployeeLayout() {
  const { store } = useSynapse();
  const { pathname } = useLocation();
  const page = pathname.split('/')[2] || 'home';
  useEffect(() => { store.syncPage(page); }, [store, page]);

  const { meV } = getBase(store);
  const badges = getEmpNavBadges(store);
  const title = (ENAV.find((n) => n.k === page) || ENAV[0]).label;

  return (
    <div className="eshell">
      <header className="etop">
        <div className="row" style={{ gap: 10 }}><img src={markUrl} alt="SYNAPSE" style={{ width: 34, height: 34, borderRadius: 8 }} /><div><div className="brand-name" style={{ fontSize: 14 }}>SYNAPSE</div><div className="brand-tag">My Security Awareness</div></div></div>
        <span className="tag-sim" style={{ background: '#2A2147', color: '#CBBDF2' }}>Demo</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="avatar" style={{ background: '#1C2A47', color: '#DDF4F6' }}>{meV.initials}</span>
          <span style={{ lineHeight: 1.2 }}><b style={{ fontSize: 13 }}>{meV.name}</b><br /><span className="tiny" style={{ color: '#9FB0C2' }}>{meV.title}</span></span>
          <button type="button" className="btn btn-sm" style={{ background: '#1C2A47', color: '#fff' }} onClick={() => store.logout()}>Sign out</button>
        </div>
      </header>
      <div className="employee-layout">
        <nav className="employee-sidebar" aria-label="Employee portal navigation">
          <div className="employee-side-label">MY WORKSPACE</div>
          {ENAV.filter((n) => n.k !== 'phish').map((n) => (
            <button key={n.k} type="button" className={'enav-item' + (n.k === page ? ' active' : '')} aria-current={n.k === page ? 'page' : 'false'} onClick={() => store.go(n.k)}>
              <span className="employee-nav-dot" aria-hidden="true" />
              <span className="employee-nav-label">{n.label}</span>
              {badges[n.k] && <span className="nav-badge">{badges[n.k]}</span>}
            </button>
          ))}
          <div className="employee-sidebar-foot"><span className="tiny muted">Security awareness · Employee portal</span></div>
        </nav>
        <main className="econtent">
          <div className="crumbs" aria-label="Breadcrumb"><span>My portal</span><span aria-hidden="true">/</span><b>{title}</b></div>
          <PageBack portal="employee" page={page} home="home" prefix={EMP_BASE} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
