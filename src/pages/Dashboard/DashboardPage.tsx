import { useGetBoardsQuery } from "../../features/boards/api/boardsApi";

export default function DashboardPage() {
  const {
    data: boards,
    isLoading,
    isError,
    error,
  } = useGetBoardsQuery();

  console.log("Boards data:", boards);
  if (isLoading) {
    return <div>Loading boards...</div>;
  }

  if (isError) {
    console.error(error);

    return <div>Failed to load boards.</div>;
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