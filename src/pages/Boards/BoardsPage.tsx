import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import {
  useCreateBoardMutation,
  useGetBoardsQuery,
} from "../../features/boards/api/boardsApi";

const BoardsPage = memo(function BoardsPage() {
  const navigate = useNavigate();
  const { data: boards = [], isLoading, error } = useGetBoardsQuery();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleCreateBoard = async () => {
    if (!title.trim()) {
      setFormError("Enter a board title.");
      return;
    }

    try {
      const board = await createBoard({ title, description }).unwrap();
      setTitle("");
      setDescription("");
      setFormError("");
      setIsDialogOpen(false);
      navigate(`/boards/${board.id}`);
    } catch (createError) {
      setFormError(
        createError && typeof createError === "object" && "error" in createError
          ? String(createError.error)
          : "Unable to create the board.",
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Boards
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Choose a board to continue planning.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setFormError("");
            setIsDialogOpen(true);
          }}
        >
          Create board
        </Button>
      </Box>

      {Boolean(error) && <Alert severity="error">Failed to load boards.</Alert>}
      {isLoading && <Typography>Loading boards...</Typography>}
      {!isLoading && !error && boards.length === 0 && (
        <Typography color="text.secondary">
          No boards yet. Create your first board to get started.
        </Typography>
      )}

      <Grid container spacing={2}>
        {boards.map((board) => (
          <Grid key={board.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardActionArea onClick={() => navigate(`/boards/${board.id}`)}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {board.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {board.description || "No description"}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={isDialogOpen}
        onClose={() => !isCreating && setIsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create board</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Board title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              fullWidth
              disabled={isCreating}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={isCreating}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDialogOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={isCreating}
          >
            Create board
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
});

export default BoardsPage;
