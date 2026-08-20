import { Box, type BoxProps } from "@mui/material";
import type { ReactNode } from "react";

interface MainContentProps extends BoxProps {
  children: ReactNode;
}

const MainContent = ({ children, sx, ...props }: MainContentProps) => {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "auto",
        p: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default MainContent;