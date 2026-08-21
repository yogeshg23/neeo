import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  useMoveTaskMutation,
  useUpdateBoardMutation,
} from "../../features/boards/api/boardsApi";

function SortableTask({ task }: { task: { id: string; title: string } }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      {...attributes}
      {...listeners}
      sx={{
        bgcolor: "action.hover",
        cursor: "grab",
        opacity: isDragging ? 0.35 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: "none",
      }}
    >
      <CardContent sx={{ "&:last-child": { pb: 2 } }}>
        <Typography>{task.title}</Typography>
      </CardContent>
    </Card>
  );
}

function TaskColumn({
  column,
  onAddTask,
}: {
  column: { id: string; title: string; tasks: Array<{ id: string; title: string }> };
  onAddTask: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${column.id}` });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          sx={{ mb: 2, justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {column.title}
          </Typography>
          <Typography color="text.secondary">{column.tasks.length}</Typography>
        </Stack>

        <SortableContext
          items={column.tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <Stack
            ref={setNodeRef}
            spacing={1.5}
            sx={{
              minHeight: 72,
              p: isOver ? 1 : 0,
              border: isOver ? 1 : 0,
              borderColor: "primary.main",
              borderRadius: 1,
            }}
          >
            {column.tasks.map((task) => (
              <SortableTask key={task.id} task={task} />
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={onAddTask}
              sx={{ justifyContent: "flex-start" }}
            >
              Add task
            </Button>
          </Stack>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

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
  const [moveTask] = useMoveTaskMutation();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(String(active.id));
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);
    if (!over || !boardId || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceColumn = board.columns.find((column) =>
      column.tasks.some((task) => task.id === activeId),
    );
    const destinationColumn = board.columns.find(
      (column) =>
        column.id === overId.replace("column-", "") ||
        column.tasks.some((task) => task.id === overId),
    );

    if (!sourceColumn || !destinationColumn) return;
    if (activeId === overId && sourceColumn.id === destinationColumn.id) return;

    const sourceTaskIds = sourceColumn.tasks
      .filter((task) => task.id !== activeId)
      .map((task) => task.id);
    const destinationTaskIds = [...destinationColumn.tasks]
      .filter((task) => task.id !== activeId)
      .map((task) => task.id);
    const insertAt =
      overId.startsWith("column-")
        ? destinationTaskIds.length
        : destinationTaskIds.indexOf(overId);
    destinationTaskIds.splice(
      insertAt < 0 ? destinationTaskIds.length : insertAt,
      0,
      activeId,
    );
    const orderedTaskIds =
      sourceColumn.id === destinationColumn.id
        ? destinationTaskIds
        : sourceTaskIds;

    try {
      await moveTask({
        boardId,
        taskId: activeId,
        sourceColumnId: sourceColumn.id,
        destinationColumnId: destinationColumn.id,
        sourceTaskIds: orderedTaskIds,
        destinationTaskIds,
      }).unwrap();
    } catch {
      setFormError("Unable to move the task.");
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={() => setActiveTaskId(null)}
        onDragEnd={handleDragEnd}
      >
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
            <TaskColumn
              key={column.id}
              column={column}
              onAddTask={() => {
                setTaskColumnId(column.id);
                setTaskTitle("");
                setFormError("");
              }}
            />
          ))}
        </Box>
        <DragOverlay>
          {activeTaskId ? (
            <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography>
                  {board.columns
                    .flatMap((column) => column.tasks)
                    .find((task) => task.id === activeTaskId)?.title}
                </Typography>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

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
