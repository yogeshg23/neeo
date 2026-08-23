import { memo, useState, type ComponentProps } from "react";
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
import { motion } from "framer-motion";
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
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

import {
  useCreateColumnMutation,
  useCreateTaskMutation,
  useDeleteBoardMutation,
  useGetBoardQuery,
  useMoveColumnsMutation,
  useMoveTaskMutation,
  useUpdateBoardMutation,
} from "../../features/boards/api/boardsApi";
import {
  getPositionBetween,
  getRebalancedPositions,
  type PositionUpdate,
} from "../../features/tasks/utils/position";

const SortableTask = memo(function SortableTask({ task }: { task: { id: string; title: string } }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <motion.div
      layout="position"
      transition={{ layout: { duration: 0.16, ease: "easeOut" } }}
    >
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
    </motion.div>
  );
});

const TaskColumn = memo(function TaskColumn({
  column,
  onAddTask,
  isAddingTask,
  taskTitle,
  isCreatingTask,
  onTaskTitleChange,
  onCreateTask,
  onCancelTask,
  dragHandleProps,
}: {
  column: { id: string; title: string; tasks: Array<{ id: string; title: string }> };
  onAddTask: () => void;
  isAddingTask: boolean;
  taskTitle: string;
  isCreatingTask: boolean;
  onTaskTitleChange: (value: string) => void;
  onCreateTask: () => void;
  onCancelTask: () => void;
  dragHandleProps?: Record<string, unknown>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `tasks-${column.id}` });

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          {...dragHandleProps}
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
            {isAddingTask ? (
              <Stack spacing={1}>
                <TextField
                  value={taskTitle}
                  onChange={(event) => onTaskTitleChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onCreateTask();
                    }
                    if (event.key === "Escape") onCancelTask();
                  }}
                  placeholder="Enter a task title..."
                  autoFocus
                  fullWidth
                  size="small"
                  disabled={isCreatingTask}
                />
                <Stack direction="row" spacing={1}>
                  <IconButton
                    color="success"
                    onClick={onCreateTask}
                    disabled={isCreatingTask}
                    aria-label="Confirm task title"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={onCancelTask}
                    disabled={isCreatingTask}
                    aria-label="Cancel task creation"
                  >
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Stack>
            ) : (
              <Button
                startIcon={<AddIcon />}
                onClick={onAddTask}
                sx={{ justifyContent: "flex-start" }}
              >
                Add task
              </Button>
            )}
          </Stack>
        </SortableContext>
      </CardContent>
    </Card>
  );
});

const SortableColumn = memo(function SortableColumn(props: ComponentProps<typeof TaskColumn>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `column-${props.column.id}` });

  return (
    <motion.div
      ref={setNodeRef}
      layout="position"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TaskColumn
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </motion.div>
  );
});

const BoardPage = memo(function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    data: board,
    isLoading,
    error,
  } = useGetBoardQuery(boardId ?? "", { skip: !boardId });
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [createColumn, { isLoading: isCreatingColumn }] = useCreateColumnMutation();
  const [moveColumns] = useMoveColumnsMutation();
  const [updateBoard, { isLoading: isUpdatingBoard }] = useUpdateBoardMutation();
  const [deleteBoard, { isLoading: isDeletingBoard }] = useDeleteBoardMutation();
  const [moveTask] = useMoveTaskMutation();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [taskColumnId, setTaskColumnId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [isColumnComposerOpen, setIsColumnComposerOpen] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddTask = async (): Promise<boolean> => {
    if (!boardId || !taskColumnId || !taskTitle.trim()) {
      setFormError("Enter a task title.");
      return false;
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
      return true;
    } catch {
      setFormError("Unable to create the task.");
      return false;
    }
  };

  const handleAddColumn = async (): Promise<boolean> => {
    if (!boardId || !columnTitle.trim()) {
      setFormError("Enter a column title.");
      return false;
    }

    try {
      await createColumn({
        boardId,
        title: columnTitle,
        position: board?.columns.length ?? 0,
      }).unwrap();
      setColumnTitle("");
      setIsColumnComposerOpen(false);
      setFormError("");
      return true;
    } catch {
      setFormError("Unable to create the column.");
      return false;
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
    const activeId = String(active.id);
    if (activeId.startsWith("column-")) {
      setActiveColumnId(activeId.slice("column-".length));
    } else {
      setActiveTaskId(activeId);
    }
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);
    setActiveColumnId(null);
    if (!over || !boardId || !board) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("column-")) {
      const sourceColumnId = activeId.slice("column-".length);
      const destinationColumnId = overId.startsWith("column-")
        ? overId.slice("column-".length)
        : board.columns.find((column) =>
            column.tasks.some((task) => task.id === overId),
          )?.id;
      const sourceColumn = board.columns.find(
        (column) => column.id === sourceColumnId,
      );
      const destinationColumn = board.columns.find(
        (column) => column.id === destinationColumnId,
      );

      if (!sourceColumn || !destinationColumn || sourceColumnId === destinationColumnId) {
        return;
      }

      const orderedColumns = board.columns.filter(
        (column) => column.id !== sourceColumnId,
      );
      const destinationIndex = orderedColumns.findIndex(
        (column) => column.id === destinationColumnId,
      );
      if (destinationIndex < 0) return;
      orderedColumns.splice(destinationIndex, 0, sourceColumn);

      const previousColumn = orderedColumns[destinationIndex - 1];
      const nextColumn = orderedColumns[destinationIndex + 1];
      const newPosition = getPositionBetween(
        previousColumn?.position,
        nextColumn?.position,
      );
      const columnPositions = newPosition === null
        ? getRebalancedPositions(orderedColumns.map((column) => column.id))
        : orderedColumns.map((column) => ({
            id: column.id,
            position:
              column.id === sourceColumnId ? newPosition : column.position,
          }));

      try {
        await moveColumns({ boardId, columnPositions }).unwrap();
      } catch {
        setFormError("Unable to move the column.");
      }
      return;
    }

    const sourceColumn = board.columns.find((column) =>
      column.tasks.some((task) => task.id === activeId),
    );
    const destinationColumn = board.columns.find(
      (column) =>
        column.id ===
          (overId.startsWith("tasks-")
            ? overId.slice("tasks-".length)
            : overId.replace("column-", "")) ||
        column.tasks.some((task) => task.id === overId),
    );

    if (!sourceColumn || !destinationColumn) return;
    if (activeId === overId && sourceColumn.id === destinationColumn.id) return;

    const sourceTasks = sourceColumn.tasks.filter((task) => task.id !== activeId);
    const destinationTasks = destinationColumn.tasks.filter(
      (task) => task.id !== activeId,
    );
    const insertAt =
      overId.startsWith("column-")
        || overId.startsWith("tasks-")
        ? destinationTasks.length
        : Math.max(destinationTasks.findIndex((task) => task.id === overId), 0);
    const activeTask = sourceColumn.tasks.find((task) => task.id === activeId);
    if (!activeTask) return;

    destinationTasks.splice(insertAt, 0, activeTask);
    const previousTask = destinationTasks[insertAt - 1];
    const nextTask = destinationTasks[insertAt + 1];
    const newPosition = getPositionBetween(
      previousTask?.position,
      nextTask?.position,
    );
    const destinationTaskPositions: PositionUpdate[] = newPosition === null
      ? getRebalancedPositions(destinationTasks.map((task) => task.id))
      : destinationTasks.map((task) => ({
          id: task.id,
          position: task.id === activeId ? newPosition : task.position,
        }));
    const sourceTaskPositions: PositionUpdate[] =
      sourceColumn.id === destinationColumn.id
        ? destinationTaskPositions
        : sourceTasks.map((task) => ({ id: task.id, position: task.position }));

    try {
      await moveTask({
        boardId,
        taskId: activeId,
        sourceColumnId: sourceColumn.id,
        destinationColumnId: destinationColumn.id,
        sourceTaskPositions,
        destinationTaskPositions,
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
        onDragCancel={() => {
          setActiveTaskId(null);
          setActiveColumnId(null);
        }}
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
            <SortableColumn
              key={column.id}
              column={column}
              isAddingTask={taskColumnId === column.id}
              taskTitle={taskTitle}
              isCreatingTask={isCreatingTask}
              onTaskTitleChange={setTaskTitle}
              onCreateTask={() => void handleAddTask()}
              onCancelTask={() => {
                setTaskColumnId(null);
                setTaskTitle("");
                setFormError("");
              }}
              onAddTask={() => {
                setTaskColumnId(column.id);
                setTaskTitle("");
                setFormError("");
              }}
            />
          ))}
          {isColumnComposerOpen ? (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <TextField
                    value={columnTitle}
                    onChange={(event) => setColumnTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleAddColumn();
                      }
                      if (event.key === "Escape") {
                        setIsColumnComposerOpen(false);
                        setColumnTitle("");
                      }
                    }}
                    placeholder="Enter column title..."
                    autoFocus
                    fullWidth
                    size="small"
                    disabled={isCreatingColumn}
                  />
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      color="success"
                      onClick={() => void handleAddColumn()}
                      disabled={isCreatingColumn}
                      aria-label="Confirm column title"
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setIsColumnComposerOpen(false);
                        setColumnTitle("");
                      }}
                      disabled={isCreatingColumn}
                      aria-label="Cancel column creation"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setIsColumnComposerOpen(true);
                setColumnTitle("");
                setFormError("");
              }}
              sx={{ minHeight: 100, justifyContent: "flex-start" }}
            >
              Add column
            </Button>
          )}
        </Box>
        <DragOverlay>
          {activeColumnId ? (
            <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography sx={{ fontWeight: 700 }}>
                  {board.columns.find((column) => column.id === activeColumnId)?.title}
                </Typography>
              </CardContent>
            </Card>
          ) : activeTaskId ? (
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
});

export default BoardPage;
