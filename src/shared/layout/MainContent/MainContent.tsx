import { Box, Toolbar, type BoxProps } from "@mui/material";
import { memo, type ReactNode } from "react";

interface MainContentProps extends BoxProps {
  children: ReactNode;
}

const MainContent = memo(function MainContent({ children, sx, ...props }: MainContentProps) {
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
      <Toolbar />
      {children}
    </Box>
  );
});

export default MainContent;