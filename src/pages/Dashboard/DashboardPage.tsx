import {
  Box,
  Typography,
} from "@mui/material";

import { useGetBoardsQuery } from "../../features/boards/api/boardsApi";

export default function DashboardPage() {
  const {
    data: boards = [],
    isLoading,
    error,
  } = useGetBoardsQuery();

  if (isLoading) {
    return <div>Loading boards...</div>;
  }

  if (error) {
    console.error(error);

    return <div>Failed to load boards.</div>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        Dashboard
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Welcome to NEO.
      </Typography>

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