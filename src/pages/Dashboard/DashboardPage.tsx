import { useBoards } from "../../features/boards/hooks/useBoards";

export default function DashboardPage() {
  const { boards, isLoading, error } = useBoards();

  console.log("Boards data:", boards);
  if (isLoading) {
    return <div>Loading boards...</div>;
  }

  if (error) {
    console.error(error);

    return <div>Failed to load boards: {error.message}</div>;
  }

  return (
    <div>
      <h1>FlowBoard</h1>

      <h2>Boards</h2>

      {boards?.length === 0 ? (
        <p>No boards found.</p>
      ) : (
        <ul>
          {boards?.map((board) => (
            <li key={board.id}>
              {board.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}