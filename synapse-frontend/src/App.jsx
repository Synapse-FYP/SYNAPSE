import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store, useSynapse } from './store/index.js';
import RouterBridge from './routes/RouterBridge.jsx';
import { RequireStaff, RequireEmployee, RedirectIfSignedIn, StaffPage } from './routes/guards.jsx';
import StaffLayout from './components/layout/StaffLayout.jsx';
import EmployeeLayout from './components/layout/EmployeeLayout.jsx';
import ActionModal from './components/overlays/ActionModal.jsx';
import ConfirmDialog from './components/overlays/ConfirmDialog.jsx';
import Toasts from './components/overlays/Toasts.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import OverviewPage from './pages/staff/OverviewPage.jsx';
import DetectionPage from './pages/staff/DetectionPage.jsx';
import InvestigationsPage from './pages/staff/InvestigationsPage.jsx';
import PeoplePage from './pages/staff/people/PeoplePage.jsx';
import BehaviorPage from './pages/staff/BehaviorPage.jsx';
import GraphPage from './pages/staff/GraphPage.jsx';
import ModelsPage from './pages/staff/ModelsPage.jsx';
import AwarenessPage from './pages/staff/AwarenessPage.jsx';
import DataSourcesPage from './pages/staff/DataSourcesPage.jsx';
import PoliciesPage from './pages/staff/PoliciesPage.jsx';
import ReportsPage from './pages/staff/ReportsPage.jsx';
import AdminPage from './pages/staff/AdminPage.jsx';
import AccessDenied from './pages/staff/AccessDenied.jsx';

import EmpHomePage from './pages/employee/EmpHomePage.jsx';
import EmpTrainingPage from './pages/employee/EmpTrainingPage.jsx';
import EmpAssessPage from './pages/employee/EmpAssessPage.jsx';
import EmpPhishPage from './pages/employee/EmpPhishPage.jsx';
import EmpPolicyAckPage from './pages/employee/EmpPolicyAckPage.jsx';
import EmpVerifyPage from './pages/employee/EmpVerifyPage.jsx';
import EmpHistoryPage from './pages/employee/EmpHistoryPage.jsx';
import EmpProfilePage from './pages/employee/EmpProfilePage.jsx';

const STAFF_ROUTES = [
  ['overview', OverviewPage], ['detection', DetectionPage], ['investigations', InvestigationsPage], ['people', PeoplePage],
  ['behavior', BehaviorPage], ['graph', GraphPage], ['models', ModelsPage], ['awareness', AwarenessPage],
  ['data', DataSourcesPage], ['policies', PoliciesPage], ['reports', ReportsPage], ['admin', AdminPage],
];

const EMP_ROUTES = [
  ['home', EmpHomePage], ['training', EmpTrainingPage], ['assess', EmpAssessPage], ['phish', EmpPhishPage],
  ['policyack', EmpPolicyAckPage], ['verify', EmpVerifyPage], ['history', EmpHistoryPage], ['profile', EmpProfilePage],
];

function HomeRedirect() {
  useSynapse(); // re-evaluate when the session changes
  return <Navigate to={store.homePath()} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterBridge />
      <div style={{ minHeight: '100vh', background: '#0A1020' }}>
        <Routes>
          <Route path="/login" element={<RedirectIfSignedIn><LoginPage /></RedirectIfSignedIn>} />
          <Route path="/security" element={<RequireStaff><StaffLayout /></RequireStaff>}>
            <Route index element={<Navigate to="overview" replace />} />
            {STAFF_ROUTES.map(([k, Page]) => (
              <Route key={k} path={k} element={<StaffPage page={k}><Page /></StaffPage>} />
            ))}
            <Route path="*" element={<AccessDenied />} />
          </Route>
          <Route path="/portal" element={<RequireEmployee><EmployeeLayout /></RequireEmployee>}>
            <Route index element={<Navigate to="home" replace />} />
            {EMP_ROUTES.map(([k, Page]) => <Route key={k} path={k} element={<Page />} />)}
            <Route path="*" element={<Navigate to="home" replace />} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
        <ActionModal />
        <ConfirmDialog />
        <Toasts />
      </div>
    </BrowserRouter>
  );
}
