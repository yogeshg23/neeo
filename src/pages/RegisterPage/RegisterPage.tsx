import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { memo } from "react";

import {
  Box,
  Link,
  Typography,
} from "@mui/material";

import AuthLayout from "../../features/auth/components/AuthLayout";
import RegisterForm from "../../features/auth/components/RegisterForm";

const RegisterPage = memo(function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <RegisterForm onSuccess={() => navigate("/dashboard")} />

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link
            component={RouterLink}
            to="/login"
            underline="hover"
                sx={{ fontWeight: 600 }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
});

export default RegisterPage;