// Shared constants ported from SYNAPSE.html.

export const DEMO_KEY = 'synapse-nightwatch-v1';

export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 30-day simulated demo window: 16 Oct – 14 Nov 2026.
export const DAYS = (() => {
  const o = [];
  const s = Date.UTC(2026, 9, 16);
  for (let i = 0; i < 30; i++) o.push(new Date(s + i * 86400000).toISOString().slice(0, 10));
  return o;
})();

export const TRAIN_END = '2026-11-07';
export const DEMO_TODAY = '2026-11-14';

export const CATS = [
  { k: 'logon', label: 'Logon', ev: 'Logon events', off: 'Off-hours logons' },
  { k: 'device', label: 'Removable media', ev: 'Removable-media connects', off: 'Off-hours device events' },
  { k: 'file', label: 'File activity', ev: 'File events', off: 'Off-hours file events' },
  { k: 'email', label: 'Email', ev: 'Emails sent', off: 'Off-hours emails' },
  { k: 'http', label: 'Web (HTTP)', ev: 'Web requests', off: 'Off-hours web requests' },
];
export const CAT = {};
CATS.forEach((c) => { CAT[c.k] = c; });

export const SEVC = { Critical: '#F0506E', High: '#FB7A4E', Medium: '#F2A93B', Low: '#7B93A8' };
export const SEV_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };
export const STATUSES = ['New', 'Under Review', 'Awaiting Verification', 'Escalated', 'Resolved'];

export const ANALYST_PAGES = ['overview', 'detection', 'investigations', 'people', 'behavior', 'graph', 'models', 'awareness', 'reports'];
export const ADMIN_ONLY = ['policies', 'admin', 'data'];
export const ADMIN_NAV = ['overview', 'people', 'policies', 'data', 'awareness', 'models', 'reports', 'admin'];
export const SOC_NAV = ['overview', 'detection', 'investigations', 'people', 'graph', 'models', 'awareness', 'reports'];

export const NAV = [
  { k: 'overview', label: 'Overview', icon: 'grid' },
  { k: 'detection', label: 'Detection Center', icon: 'radar' },
  { k: 'investigations', label: 'Investigations', icon: 'search' },
  { k: 'people', label: 'Employee Behavior & Risk', icon: 'users' },
  { k: 'behavior', label: 'Behavioral Intelligence', icon: 'pulse' },
  { k: 'graph', label: 'Graph Explorer', icon: 'graph' },
  { k: 'models', label: 'Model Intelligence', icon: 'cpu' },
  { k: 'awareness', label: 'Awareness & Interventions', icon: 'book' },
  { k: 'data', label: 'Dataset & Data Sources', icon: 'server' },
  { k: 'policies', label: 'Security Policies', icon: 'shield' },
  { k: 'reports', label: 'Reports & Audit Logs', icon: 'file' },
  { k: 'admin', label: 'Administration & Settings', icon: 'gear' },
];

export const ENAV = [
  { k: 'home', label: 'Home' },
  { k: 'training', label: 'My Training' },
  { k: 'assess', label: 'Assessments & Phishing' },
  { k: 'phish', label: 'Phishing Awareness' },
  { k: 'policyack', label: 'Policy Acknowledgments' },
  { k: 'verify', label: 'Verification Requests' },
  { k: 'history', label: 'My Activity History' },
  { k: 'profile', label: 'Profile & Settings' },
];

// Route prefixes for the two portals.
export const STAFF_BASE = '/security';
export const EMP_BASE = '/portal';
export const staffPath = (page) => `${STAFF_BASE}/${page}`;
export const empPath = (page) => `${EMP_BASE}/${page}`;

// ui keys that open an in-page detail view (employee profile, training module, assessment run,
// policy reader, verification request). store.go() uses them to remember that a detail view was
// opened straight from another page, so Back can return to that page.
export const SUBVIEW_KEYS = ['profile', 'tModule', 'aRun', 'polRead', 'vSel'];
