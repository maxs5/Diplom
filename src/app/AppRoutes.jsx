import React, { lazy } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute.jsx';
import { Layout } from '../components/layout/Layout.jsx';

const AuthPage = lazy(() =>
  import('../pages/AuthPage.jsx').then((module) => ({ default: module.AuthPage }))
);
const DashboardPage = lazy(() =>
  import('../pages/DashboardPage.jsx').then((module) => ({ default: module.DashboardPage }))
);
const OperationsPage = lazy(() =>
  import('../pages/OperationsPage.jsx').then((module) => ({ default: module.OperationsPage }))
);
const OperationFormPage = lazy(() =>
  import('../pages/OperationFormPage.jsx').then((module) => ({ default: module.OperationFormPage }))
);
const AccountFormPage = lazy(() =>
  import('../pages/AccountFormPage.jsx').then((module) => ({ default: module.AccountFormPage }))
);
const CategoryFormPage = lazy(() =>
  import('../pages/CategoryFormPage.jsx').then((module) => ({ default: module.CategoryFormPage }))
);
const SettingsPage = lazy(() =>
  import('../pages/SettingsPage.jsx').then((module) => ({ default: module.SettingsPage }))
);
const BudgetsPage = lazy(() =>
  import('../pages/BudgetsPage.jsx').then((module) => ({ default: module.BudgetsPage }))
);

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/operations" element={<OperationsPage />} />
        <Route path="/operations/new" element={<OperationFormPage />} />
        <Route path="/operations/:id" element={<OperationFormPage />} />
        <Route path="/accounts/new" element={<AccountFormPage />} />
        <Route path="/accounts/:id" element={<AccountFormPage />} />
        <Route path="/categories/new" element={<CategoryFormPage />} />
        <Route path="/categories/:id" element={<CategoryFormPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
