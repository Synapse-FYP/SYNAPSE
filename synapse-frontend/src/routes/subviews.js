// In-page detail views (an employee profile, an open training module, a policy being read, ...).
// The shared Back button closes these first, before leaving the page.
import { buildPeople } from '../viewmodels/staff/people.js';
import { buildEmpTraining, buildEmpAssess, buildEmpPolicies, buildEmpVerify } from '../viewmodels/employee.js';

const STAFF = {
  people: (store) => { const V = buildPeople(store); return V.showProfile ? { back: V.prof.back, label: 'Back to employee directory' } : null; },
};

const EMPLOYEE = {
  training: (store) => { const V = buildEmpTraining(store); return V.tActive ? { back: V.tm.back, label: 'Back to all training' } : null; },
  assess: (store) => { const V = buildEmpAssess(store); return V.aActive ? { back: V.ar.back, label: 'Back to all assessments' } : null; },
  policyack: (store) => { const V = buildEmpPolicies(store); return V.polReadShow ? { back: V.pr.back, label: 'Back to all policies' } : null; },
  verify: (store) => { const V = buildEmpVerify(store); return V.vShow ? { back: V.vr.back, label: 'Back to all requests' } : null; },
};

export function getSubview(store, portal, page) {
  const fn = (portal === 'employee' ? EMPLOYEE : STAFF)[page];
  return fn ? fn(store) : null;
}
