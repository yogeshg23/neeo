import { useState } from "react";
import { useFormik } from "formik";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { loginUser } from "../../api/authApi";
import { loginSchema } from "../../validation/auth.schema";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({
  onSuccess,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: loginSchema,

    onSubmit: async (values, { setSubmitting, setStatus }) => {
      try {
        setStatus(undefined);

        await loginUser(
          values.email,
          values.password,
        );

        onSuccess?.();
      } catch (error) {
        console.error(error);

        setStatus(
          "Invalid email or password. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

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

        <Typography
          variant="body2"
          color="text.secondary"
              sx={{ mt: 0.5 }}
        >
          Sign in to continue to Neeo Planner.
        </Typography>
      </Box>

      {formik.status && (
        <Alert severity="error">
          {formik.status}
        </Alert>
      )}

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.email &&
          Boolean(formik.errors.email)
        }
        helperText={
          formik.touched.email &&
          formik.errors.email
        }
        autoComplete="email"
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.password &&
          Boolean(formik.errors.password)
        }
        helperText={
          formik.touched.password &&
          formik.errors.password
        }
        autoComplete="current-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  edge="end"
                  aria-label="toggle password visibility"
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
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
        {formik.isSubmitting ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Sign In"
        )}
      </Button>
    </Box>
  );
}