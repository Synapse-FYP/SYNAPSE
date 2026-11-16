// Route guards: session checks and role-based page access (client-side only, as in the prototype).
import { Navigate } from 'react-router-dom';
import { useSynapse } from '../store/index.js';
import { ANALYST_PAGES, NAV } from '../lib/constants.js';
import AccessDenied from '../pages/staff/AccessDenied.jsx';

export function RequireStaff({ children }) {
  const { store } = useSynapse();
  const me = store.me();
  if (!me) return <Navigate to="/login" replace />;
  if (me.role === 'employee') return <Navigate to={store.homePath()} replace />;
  return children;
}

export function RequireEmployee({ children }) {
  const { store } = useSynapse();
  const me = store.me();
  if (!me) return <Navigate to="/login" replace />;
  if (me.role !== 'employee') return <Navigate to={store.homePath()} replace />;
  return children;
}

export function RedirectIfSignedIn({ children }) {
  const { store } = useSynapse();
  if (store.me()) return <Navigate to={store.homePath()} replace />;
  return children;
}

// Administrators may open every staff page; analysts are limited to ANALYST_PAGES.
export function StaffPage({ page, children }) {
  const { store } = useSynapse();
  const me = store.me();
  const allowed = me.role === 'admin' ? NAV.map((n) => n.k) : ANALYST_PAGES;
  if (allowed.indexOf(page) < 0) return <AccessDenied />;
  return children;
}
