import React from "react";
import { AuthProvider } from "../features/auth/AuthContext.jsx";
import { AccountsProvider } from "../features/accounts/AccountsContext.jsx";
import { CategoriesProvider } from "../features/categories/CategoriesContext.jsx";
import { OperationsProvider } from "../features/operations/OperationsContext.jsx";
import { RecurringProvider } from "../features/operations/RecurringContext.jsx";
import { BudgetProvider } from "../features/operations/BudgetContext.jsx";
import { ThemeProvider } from "../features/theme/ThemeContext.jsx";

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AccountsProvider>
          <CategoriesProvider>
            <OperationsProvider>
              <RecurringProvider>
                <BudgetProvider>{children}</BudgetProvider>
              </RecurringProvider>
            </OperationsProvider>
          </CategoriesProvider>
        </AccountsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
