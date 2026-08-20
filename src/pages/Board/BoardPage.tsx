import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
  useCreateTaskMutation,
  useDeleteBoardMutation,
  useGetBoardQuery,
  useUpdateBoardMutation,
} from "../../features/boards/api/boardsApi";

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    data: board,
    isLoading,
    error,
  } = useGetBoardQuery(boardId ?? "", { skip: !boardId });
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateBoard, { isLoading: isUpdatingBoard }] = useUpdateBoardMutation();
  const [deleteBoard, { isLoading: isDeletingBoard }] = useDeleteBoardMutation();
  const [taskColumnId, setTaskColumnId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddTask = async () => {
    if (!boardId || !taskColumnId || !taskTitle.trim()) {
      setFormError("Enter a task title.");
      return;
    }

    try {
      await createTask({
        boardId,
        columnId: taskColumnId,
        title: taskTitle,
      }).unwrap();
      setTaskTitle("");
      setFormError("");
      setTaskColumnId(null);
    } catch {
      setFormError("Unable to create the task.");
    }
  };

  const openEditBoard = () => {
    if (!board) return;
    setBoardTitle(board.title);
    setBoardDescription(board.description);
    setFormError("");
    setIsEditOpen(true);
  };

  const handleUpdateBoard = async () => {
    if (!boardId || !boardTitle.trim()) {
      setFormError("Enter a board title.");
      return;
    }

    try {
      await updateBoard({
        boardId,
        title: boardTitle,
        description: boardDescription,
      }).unwrap();
      setIsEditOpen(false);
    } catch {
      setFormError("Unable to update the board.");
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardId || !window.confirm("Delete this board?")) return;

    try {
      await deleteBoard(boardId).unwrap();
      navigate("/boards");
    } catch {
      setFormError("Unable to delete the board.");
    }
  };

  if (isLoading) return <Typography>Loading board...</Typography>;
  if (error || !board) {
    return <Alert severity="error">Unable to load this board.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Box>
          <Button
            component={RouterLink}
            to="/boards"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 1 }}
          >
            All boards
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {board.title}
          </Typography>
          {board.description && (
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {board.description}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={openEditBoard}
          >
            Edit
          </Button>
          <IconButton
            color="error"
            aria-label="Delete board"
            onClick={handleDeleteBoard}
            disabled={isDeletingBoard}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </Stack>

      {formError && <Alert severity="error">{formError}</Alert>}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: `repeat(${Math.max(board.columns.length, 1)}, minmax(0, 1fr))`,
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {board.columns.map((column) => (
          <Card key={column.id} variant="outlined">
            <CardContent>
              <Stack
                direction="row"
                sx={{
                  mb: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {column.title}
                </Typography>
                <Typography color="text.secondary">
                  {column.tasks.length}
                </Typography>
              </Stack>

              <Stack spacing={1.5}>
                {column.tasks.map((task) => (
                  <Card key={task.id} variant="outlined" sx={{ bgcolor: "action.hover" }}>
                    <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                      <Typography>{task.title}</Typography>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setTaskColumnId(column.id);
                    setTaskTitle("");
                    setFormError("");
                  }}
                  sx={{ justifyContent: "flex-start" }}
                >
                  Add task
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={Boolean(taskColumnId)}
        onClose={() => !isCreatingTask && setTaskColumnId(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task title"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            autoFocus
            fullWidth
            sx={{ mt: 1 }}
            disabled={isCreatingTask}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskColumnId(null)} disabled={isCreatingTask}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddTask} disabled={isCreatingTask}>
            Add task
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isEditOpen}
        onClose={() => !isUpdatingBoard && setIsEditOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit board</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Board title"
              value={boardTitle}
              onChange={(event) => setBoardTitle(event.target.value)}
              fullWidth
              autoFocus
              disabled={isUpdatingBoard}
            />
            <TextField
              label="Description"
              value={boardDescription}
              onChange={(event) => setBoardDescription(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={isUpdatingBoard}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditOpen(false)} disabled={isUpdatingBoard}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateBoard} disabled={isUpdatingBoard}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
