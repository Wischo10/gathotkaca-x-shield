import { PlaybookKPIs } from "./PlaybookKPIs";
import { PlaybooksLibrary } from "./PlaybooksLibrary";
import { PlaybookSidebar } from "./PlaybookSidebar";
import { PlaybookMonitor } from "./PlaybookMonitor";
import { PlaybookTypes } from "./PlaybookTypes";

export function PlaybooksView() {
  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-200px)]">
      {/* Top Row: KPIs */}
      <PlaybookKPIs />

      {/* Middle Row: Library & Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-[400px]">
        <PlaybooksLibrary />
        <PlaybookSidebar />
      </div>

      {/* Bottom Row: Monitor & Types */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <PlaybookMonitor />
        <PlaybookTypes />
      </div>
    </div>
  );
}
