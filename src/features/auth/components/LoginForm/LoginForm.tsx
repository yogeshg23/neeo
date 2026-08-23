import { memo, useState } from "react";
import { useFormik } from "formik";

import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

import { loginUser } from "../../api/authApi";
import { CustomInput } from "../common/CustomInput";
import { CustomLoader } from "../common/CustomLoader";
import GoogleButton from "../common/GoogleButton";
import { loginSchema } from "../../validation/auth.schema";
import { loginWithGoogle } from "../../../../services/auth.service";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = memo(function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: loginSchema,

    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(undefined);

        await loginUser(values.email, values.password);

        onSuccess?.();
      } catch (error) {
        console.error(error);

        setStatus("Invalid email or password. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      formik.setStatus(undefined);
      await loginWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      formik.setStatus("Unable to sign in with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      noValidate
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Welcome back
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Sign in to continue to Neeo Planner.
        </Typography>
      </Box>

      {formik.status && <Alert severity="error">{formik.status}</Alert>}

      <CustomInput
        fullWidth
        id="email"
        name="email"
        label="Email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        autoComplete="email"
      />

      <CustomInput
        fullWidth
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        autoComplete="current-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={formik.isSubmitting}
        sx={{
          minHeight: 48,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {formik.isSubmitting ? <CustomLoader /> : "Sign In"}
      </Button>

      <GoogleButton onClick={handleGoogleLogin} loading={googleLoading} />
    </Box>
  );
});

export default LoginForm;
