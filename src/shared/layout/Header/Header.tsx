import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import AuthActions from "../../components/AuthActions";
import ProfileMenu from "./ProfileMenu";

interface HeaderProps {
  onMenuClick: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header = ({
  onMenuClick,
  isAuthenticated,
  onLogout,
}: HeaderProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{
            display: {
              xs: "inline-flex",
              md: "none",
            },
            mr: 1,
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 700,
          }}
        >
          NEO
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {isAuthenticated ? (
          <ProfileMenu />
        ) : (
          <AuthActions
            isAuthenticated={false}
            onLogout={onLogout}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;