import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import { useAppSelector } from "../store/hooks";

const ProtectedRoute = () => {
  const { user, initialized } = useAppSelector(
    (state) => state.auth
  );

  const location = useLocation();

  // Firebase is still checking the authentication state
  if (!initialized) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // User is not authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // User is authenticated
  return <Outlet />;
};

export default ProtectedRoute;