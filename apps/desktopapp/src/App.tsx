import { DesktopRail } from "./desktop/DesktopRail";
import { SignalBrowser } from "./desktop/SignalBrowser";
import { SignalDetailColumn } from "./desktop/SignalDetailColumn";
import { useVicinaDesktopBoard } from "./desktop/useVicinaDesktopBoard";

export default function App() {
  const board = useVicinaDesktopBoard();

  return (
    <main className="desktop-shell">
      <DesktopRail actions={board.actions} importInputRef={board.refs.importInputRef} state={board.state} />
      <SignalBrowser actions={board.actions} state={board.state} />
      <SignalDetailColumn actions={board.actions} state={board.state} />
    </main>
  );
}
