/**
 * Главный компонент приложения Finance App
 * 
 * Этот компонент является точкой входа приложения и настраивает:
 * - Роутинг (навигацию между страницами)
 * - Глобальные контексты (авторизация, операции, счета, категории)
 * - Уведомления (toast notifications)
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Провайдеры контекстов (управление глобальным состоянием)
import { AuthProvider } from './features/auth/AuthContext.jsx';
import { AccountsProvider } from './features/accounts/AccountsContext.jsx';
import { CategoriesProvider } from './features/categories/CategoriesContext.jsx';
import { OperationsProvider } from './features/operations/OperationsContext.jsx';
import { ThemeProvider } from './features/theme/ThemeContext.jsx';

import { RecurringProvider } from './features/operations/RecurringContext.jsx';
import { BudgetProvider } from './features/operations/BudgetContext.jsx';
// Компонент для защиты маршрутов (доступны только авторизованным)
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

// Компонент лэйаута (общая структура страниц)
import { Layout } from './components/layout/Layout.jsx';

// Страницы приложения
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { OperationsPage } from './pages/OperationsPage.jsx';
import { OperationFormPage } from './pages/OperationFormPage.jsx';
import { AccountFormPage } from './pages/AccountFormPage.jsx';
import { CategoryFormPage } from './pages/CategoryFormPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { BudgetsPage } from './pages/BudgetsPage.jsx';

// Глобальные стили
import './styles/globals.css';

// Демо-данные для тестирования
import './utils/setupDemoData.js';

/**
 * Основной компонент приложения
 */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AccountsProvider>
            <CategoriesProvider>
              <OperationsProvider>
                <RecurringProvider>
                  <BudgetProvider>
                    <Toaster position="top-right" richColors />
                    
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
                      
                      <Route
                        path="/*"
                        element={
                          <ProtectedRoute>
                            <Layout>
                              <Routes>
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
                                <Route path="*" element={<Navigate to="/" replace />} />
                              </Routes>
                            </Layout>
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </BudgetProvider>
                </RecurringProvider>
              </OperationsProvider>
            </CategoriesProvider>
          </AccountsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
