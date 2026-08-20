import { Box } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../Header";
import MainContent from "../MainContent";
import Sidebar from "../Sidebar";

const AppShell = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Header
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <MainContent>
        <Outlet />
      </MainContent>
    </Box>
  );
};

export default AppShell;