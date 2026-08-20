import { Navigate, Route, Routes } from "react-router-dom";

import AppShell from "../../shared/layout/AppShell";
import ProtectedRoute from "./ProtectedRoute";

import BoardPage from "../../pages/Board";
import BoardsPage from "../../pages/Boards/BoardsPage";
import DashboardPage from "../../pages/Dashboard";
import LoginPage from "../../pages/LoginPage/LoginPage";
import RegisterPage from "../../pages/RegisterPage/RegisterPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* Protected application routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/boards"
            element={<BoardsPage />}
          />

          <Route
            path="/boards/:boardId"
            element={<BoardPage />}
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
};

export default AppRouter;