import { AppShell } from "./components/common";
import useAuthListener from "./hooks/useAuthListener";

export default function RootLayout() {
  useAuthListener();
  return (
    <div className="page">
      <AppShell />
    </div>
  );
}
