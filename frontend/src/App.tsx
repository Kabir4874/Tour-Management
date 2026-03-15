import { Outlet } from "react-router";
import CommonLayout from "./components/layout/CommonLayout";

export function App() {
  return (
    <CommonLayout>
      <Outlet />
    </CommonLayout>
  );
}

export default App;
