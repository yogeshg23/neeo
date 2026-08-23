import { memo, useEffect, useState, type MouseEvent } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { auth } from "../../../config/firebase";
import {
  logoutUser,
  updateUserProfile,
} from "../../../features/auth/api/authApi";

const ProfileMenu = memo(function ProfileMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [displayName, setDisplayName] = useState(
    auth.currentUser?.displayName ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser);
        setDisplayName(nextUser?.displayName ?? "");
      }),
    [],
  );

  const userLabel = user?.displayName || user?.email || "Account";
  const userInitial = userLabel.charAt(0).toUpperCase();

  const handleProfileEdit = () => {
    setMenuAnchor(null);
    setDisplayName(user?.displayName ?? "");
    setSaveError("");
    setIsEditOpen(true);
  };

  const handleProfileSave = async () => {
    const nextDisplayName = displayName.trim();

    if (!nextDisplayName) {
      setSaveError("Please enter a display name.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await updateUserProfile(nextDisplayName);
      setUser(auth.currentUser);
      setIsEditOpen(false);
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setMenuAnchor(null);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <Tooltip title={userLabel}>
        <IconButton
          color="inherit"
          aria-label="Open profile menu"
          onClick={(event: MouseEvent<HTMLButtonElement>) =>
            setMenuAnchor(event.currentTarget)
          }
          size="large"
          sx={{ ml: "auto" }}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled>{userLabel}</MenuItem>
        <MenuItem onClick={handleProfileEdit}>Edit profile</MenuItem>
        <MenuItem onClick={handleLogout}>Log out</MenuItem>
      </Menu>

      <Dialog
        open={isEditOpen}
        onClose={() => !isSaving && setIsEditOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {saveError && <Alert severity="error">{saveError}</Alert>}
            <TextField
              label="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              fullWidth
              autoFocus
              disabled={isSaving}
            />
            <TextField
              label="Email"
              value={user?.email ?? ""}
              fullWidth
              disabled
              helperText="Email changes require a recent sign-in."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsEditOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProfileSave}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default ProfileMenu;