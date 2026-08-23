import { memo, type ReactNode } from "react";
import {
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import { theme } from "../../theme/theme";
import AuthProvider from "./AuthProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = memo(function AppProviders({
  children,
}: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
});