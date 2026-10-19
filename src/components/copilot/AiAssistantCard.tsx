"use client";

import React, { useState } from "react";
import {
  SUGGESTED_ASSISTANT_QUESTIONS,
  DEMO_ASSISTANT_CONVERSATION,
  DETERMINISTIC_QUERY_RESPONSES,
  type SuggestedQuestion,
} from "@/services/ai-copilot-demo-provider";

interface AiAssistantCardProps {
  isRealData?: boolean;
}

export function AiAssistantCard({ isRealData = false }: AiAssistantCardProps) {
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "assistant" | "user"; message: string; timestamp: string }>
  >(DEMO_ASSISTANT_CONVERSATION);
  const [inputValue, setInputValue] = useState("");

  const handleSend = (textToSend?: string) => {
    const query = (textToSend ?? inputValue).trim();
    if (!query) return;

    const timeStr = "Just now";
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      message: query,
      timestamp: timeStr,
    };

    // Find deterministic response or fallback
    const matchedResponse =
      DETERMINISTIC_QUERY_RESPONSES[query] ||
      `Analysis for "${query}": Correlated logs indicate no immediate anomalies detected outside baseline parameters. Would you like to review relevant telemetry or trigger an IOC scan?`;

    const assistantMsg = {
      id: `ai-${Date.now() + 1}`,
      sender: "assistant" as const,
      message: matchedResponse,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
            ✨
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              AI Assistant
            </h2>
            <p className="text-[11px] text-slate-400">
              Conversational security analyst
            </p>
          </div>
        </div>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          DEMO AI
        </span>
      </div>

      {/* Suggested Questions Quick Prompts */}
      <div className="pt-2 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Suggested Questions:
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {SUGGESTED_ASSISTANT_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSend(q.query)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-left text-[11px] text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
            >
              {q.query}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="my-2 flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200/80 bg-white text-slate-700 shadow-2xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {msg.message}
            </div>
            <span className="mt-0.5 px-1 text-[9px] text-slate-400">
              {msg.timestamp}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Chat Input Form */}
      <div className="mt-auto pt-1">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about alerts, incidents, or threats..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white transition-opacity disabled:opacity-40 hover:bg-blue-700"
            title="Send inquiry"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
