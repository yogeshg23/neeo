import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import Header from "../Header";
import MainContent from "../MainContent";
import Sidebar from "../Sidebar";
import { useAppSelector } from "../../../app/store/hooks";
import { logoutUser } from "../../../services/auth.service";
 
const AppShell = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const { user } = useAppSelector(
    (state) => state.auth
  );
  
   const handleMobileOpen = () => {
    setMobileSidebarOpen(true);
  };

  const handleMobileClose = () => {
    setMobileSidebarOpen(false);
  };
    const handleLogout = async () => {
    try {
      await logoutUser();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Header
        onMenuClick={handleMobileOpen}
        isAuthenticated={Boolean(user)}
        onLogout={handleLogout}
      />

     
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={handleMobileClose}
      />  
      <MainContent>
        <Outlet />
      </MainContent>
    </Box>
  );
};

export default AppShell;