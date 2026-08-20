import { Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AuthActionsProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const AuthActions = ({
  isAuthenticated,
  onLogout,
}: AuthActionsProps) => {
  if (isAuthenticated) {
    return (
      <Button color="inherit" onClick={onLogout}>
        Logout
      </Button>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <Button
        color="inherit"
        component={RouterLink}
        to="/login"
      >
        Login
      </Button>

      <Button
        color="inherit"
        component={RouterLink}
        to="/register"
      >
        Register
      </Button>
    </Stack>
  );
};

export default AuthActions;
