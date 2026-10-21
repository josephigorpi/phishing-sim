// === frontend/src/App.jsx ===
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import DashboardGeneral from './pages/DashboardGeneral.jsx';
import DashboardByDepartment from './pages/DashboardByDepartment.jsx';
import CampaignsPage from './pages/CampaignsPage.jsx';
import CampaignDetailPage from './pages/CampaignDetailPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/**
 * Definición central de rutas.
 * Todas las vistas de negocio viven dentro del Layout (Sidebar + Header).
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardGeneral />} />
          <Route path="dashboard/department" element={<DashboardByDepartment />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
