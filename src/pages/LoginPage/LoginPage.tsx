import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import {
  Box,
  Link,
  Typography,
} from "@mui/material";

import AuthLayout from "../../features/auth/components/AuthLayout";
import LoginForm from "../../features/auth/components/LoginForm";

const LoginPage = memo(function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <LoginForm onSuccess={() => navigate("/dashboard")} />

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Don't have an account?{" "}
          <Link
            component={RouterLink}
            to="/register"
            underline="hover"
                sx={{ fontWeight: 600 }}
          >
            Create one
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
});

export default LoginPage;