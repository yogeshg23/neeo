import AppRouter from "./app/router/AppRouter";
import { memo } from "react";

const App = memo(function App() {
  return <AppRouter />;
});

export default App;