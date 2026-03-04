import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Loader } from "./components/common/Loader.jsx";
import { AppProviders } from "./app/AppProviders.jsx";
import { AppRoutes } from "./app/AppRoutes.jsx";

// Глобальные стили
import "./styles/globals.css";

// Демо-данные для тестирования
import "./utils/setupDemoData.js";

function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<Loader text="Загрузка страницы..." fullScreen />}>
          <AppRoutes />
        </Suspense>
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
