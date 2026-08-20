import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { auth } from "../../config/firebase";
import { logoutUser } from "../../features/auth/api/authApi";
import { useGetBoardsQuery } from "../../features/boards/api/boardsApi";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [menuAnchor, setMenuAnchor] =
    useState<null | HTMLElement>(null);

  const {
    data: boards = [],
    isLoading,
    error,
  } = useGetBoardsQuery();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setMenuAnchor(null);
    navigate("/login", { replace: true });
  };

  const userLabel = user?.displayName || user?.email || "Account";
  const userInitial = userLabel.charAt(0).toUpperCase();

  console.log("Boards data:", boards);
  if (isLoading) {
    return <div>Loading boards...</div>;
  }

  if (error) {
    console.error(error);

    return <div>Failed to load boards.</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Neeo
        </Typography>

        <Box>
          <Tooltip title={userLabel}>
            <IconButton
              aria-label="Open account menu"
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => setMenuAnchor(event.currentTarget)}
              size="large"
            >
              {user ? (
                <Avatar sx={{ width: 36, height: 36 }}>
                  {userInitial}
                </Avatar>
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem disabled>{userLabel}</MenuItem>
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Boards
      </Typography>

      {boards.length === 0 ? (
        <p>No boards found.</p>
      ) : (
        <ul>
          {boards.map((board) => (
            <li key={board.id}>
              {board.name}
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}