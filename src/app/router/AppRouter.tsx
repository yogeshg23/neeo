import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "../../shared/layout/AppShell";

import BoardPage from "../../pages/Board";
import DashboardPage from "../../pages/Dashboard";
import LoginPage from "../../pages/LoginPage/LoginPage";
import RegisterPage from "../../pages/RegisterPage/RegisterPage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* Application routes */}
      <Route element={<AppShell />}>
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/boards/:boardId"
          element={<BoardPage />}
        />
      </Route>

      {/* Unknown route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default AppRouter;