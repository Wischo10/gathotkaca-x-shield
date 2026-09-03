import { Panel } from "@/components/ui/Panel";
import { InvestigationCase } from "@/types/soc";
import { useState } from "react";
import { SessionUser } from "@/lib/auth";
import { MoreVertical } from "lucide-react";

export interface Note {
  id: string;
  author: string;
  content: string;
  time: string;
  role?: string;
  isLatest?: boolean;
}

interface CaseNoteProps {
  investigationCase: InvestigationCase | null;
  user: SessionUser | null;
  savedNotes: Note[];
  onAddNote: (note: Note) => void;
}

export function CaseNote({ investigationCase, user, savedNotes, onAddNote }: CaseNoteProps) {
  const [note, setNote] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleSave = () => {
    if (!note.trim()) return;
    
    const newNote: Note = {
      id: Math.random().toString(36).substring(7),
      author: user?.fullName || 'Fandi Junerry',
      role: 'SOC Analyst',
      content: note,
      time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
      isLatest: true
    };
    
    onAddNote(newNote);
    setNote("");
  };

  const allNotes = [...savedNotes, {
    id: "sys-1",
    author: "System",
    content: "Alert assigned to Fandi Junerry",
    time: "May 18, 2025 10:32 AM",
    isLatest: false
  }];

  const getInitials = (name: string) => {
    if (name === "System") return "S";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2);
  };

  return (
    <Panel title="Case Notes" className="h-[400px] flex flex-col">
      <div className="p-4 flex flex-col flex-1 overflow-hidden">
        <div className="relative mb-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note..."
            className="w-full h-[52px] p-3 pl-4 pr-12 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-blue resize-none shadow-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {allNotes.map((n, i) => (
            <div key={n.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-700">
                {n.author === "System" ? (
                  <span className="text-xs font-semibold text-slate-500">SYS</span>
                ) : (
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Fandi&backgroundColor=transparent" alt="avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{n.author}</span>
                    {n.role && <span className="text-slate-500 text-xs">({n.role})</span>}
                    {i === 0 && (
                      <span className="bg-brand-blue text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Latest</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 whitespace-nowrap">{n.time}</span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words">{n.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-3 text-right mt-2">
          <button className="text-sm font-medium text-brand-blue hover:text-brand-blue/80 inline-flex items-center gap-1">
            View all notes <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </Panel>
  );
}
