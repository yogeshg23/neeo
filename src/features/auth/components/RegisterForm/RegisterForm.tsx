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

import {
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { registerUser } from "../../api/authApi";
import { CustomInput } from "../common/CustomInput";
import { CustomLoader } from "../common/CustomLoader";
import GoogleButton from "../common/GoogleButton";
import { registerSchema } from "../../validation/auth.schema";
import { loginWithGoogle } from "../../../../services/auth.service";

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = memo(function RegisterForm({
  onSuccess,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema: registerSchema,

    onSubmit: async (
      values,
      { setSubmitting, setStatus },
    ) => {
      try {
        setStatus(undefined);

        await registerUser(
          values.email,
          values.password,
        );

        onSuccess?.();
      } catch (error) {
        console.error(error);

        setStatus(
          "Unable to create your account. The email may already be registered.",
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);
      formik.setStatus(undefined);
      await loginWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      formik.setStatus("Unable to create an account with Google. Please try again.");
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
          Create account
        </Typography>

        <Typography
          variant="body2"
           sx={{ fontWeight: 700, mt:0.5
 }}
        >
          Start organizing your work with Neeo Planner. Create your account and get started today!
        </Typography>
      </Box>

      {formik.status && (
        <Alert severity="error">
          {formik.status}
        </Alert>
      )}

      <CustomInput
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

      <CustomInput
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
        autoComplete="new-password"
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

      <CustomInput
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type={
          showConfirmPassword ? "text" : "password"
        }
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={
          formik.touched.confirmPassword &&
          Boolean(formik.errors.confirmPassword)
        }
        helperText={
          formik.touched.confirmPassword &&
          formik.errors.confirmPassword
        }
        autoComplete="new-password"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous,
                    )
                  }
                  edge="end"
                >
                  {showConfirmPassword ? (
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
          <CustomLoader />
        ) : (
          "Create Account"
        )}
      </Button>

      <GoogleButton onClick={handleGoogleRegister} loading={googleLoading} />
    </Box>
  );
});

export default RegisterForm;