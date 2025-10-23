import { useRoutes } from "react-router-dom";
import RouterBackend from "./routers/RouterBackend";

function App() {
  const element = useRoutes([...RouterBackend]);
  return element;
}

export default App;
