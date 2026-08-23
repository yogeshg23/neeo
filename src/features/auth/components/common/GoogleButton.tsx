import { Button } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { memo, type MouseEventHandler } from "react";

const GoogleButton = memo(function GoogleButton({ onClick, loading = false }: { onClick: MouseEventHandler<HTMLButtonElement>; loading?: boolean }) {
  return (
    <Button
      type="button"
      fullWidth
      variant="outlined"
      size="large"
      startIcon={<GoogleIcon />}
      onClick={onClick}
      disabled={loading}
      sx={{ minHeight: 48, textTransform: "none", fontWeight: 600 }}
    >
      {loading ? "Signing in..." : "Continue with Google"}
    </Button>
  );
});

export default GoogleButton;