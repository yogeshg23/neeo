import { Link as RouterLink } from "react-router-dom";

import {
  Box,
  Link,
  Typography,
} from "@mui/material";

import AuthLayout from "../../features/auth/components/AuthLayout";
import RegisterForm from "../../features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />

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
}