import { memo, type ReactNode } from "react";

import {
  Box,
  Container,
  Paper,
  Typography,
} from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

const AuthLayout = memo(function AuthLayout({
  children,
  title = "Neeo",
}: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography
            variant="h5"
            color="primary"
            sx={{ fontWeight: 800 }}
          >
            {title}
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: {
              xs: 3,
              sm: 5,
            },
            borderRadius: 3,
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
});

export default AuthLayout;