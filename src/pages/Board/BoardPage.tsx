import { Box, Typography } from "@mui/material";

export default function BoardPage() {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Board
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Board details will appear here.
      </Typography>
    </Box>
  );
};
