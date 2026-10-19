"use client";

import React, { useState } from "react";
import { SUGGESTED_ASSISTANT_QUESTIONS, DETERMINISTIC_QUERY_RESPONSES } from "@/services/ai-copilot-demo-provider";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatAssistantModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Array<{ id: string; sender: "user" | "assistant"; text: string; time: string }>>([
    {
      id: "m0",
      sender: "assistant",
      text: "Hello! I am your AI Cyber Security Copilot. Ask me any question regarding active alerts, incident timelines, IOC telemetry, or response playbooks.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query) return;

    const time = "Just now";
    const userMsg = { id: `u-${Date.now()}`, sender: "user" as const, text: query, time };

    const response =
      DETERMINISTIC_QUERY_RESPONSES[query] ||
      `Analysis for "${query}": Correlated signals in the last 7 days show isolated baseline activities. No urgent risk escalation identified. You can review IOCs or query specific asset hostnames for granular timelines.`;

    const aiMsg = { id: `a-${Date.now() + 1}`, sender: "assistant" as const, text: response, time };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[600px] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Cyber Security Copilot Chat
                </h3>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  DEMO AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                AI investigation assistant & security advisor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-2 dark:border-slate-800/60 dark:bg-slate-950/30">
          <div className="text-[10px] font-medium text-slate-400">Quick prompts:</div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {SUGGESTED_ASSISTANT_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q.id}
                onClick={() => handleSend(q.query)}
                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {q.query}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200/80 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                {m.text}
              </div>
              <span className="mt-1 px-1 text-[9px] text-slate-400">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 p-3.5 dark:border-slate-800">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about alerts, incidents, or threats..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-12 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
