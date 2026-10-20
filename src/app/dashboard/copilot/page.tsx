"use client";

import React, { useState } from "react";
import { useSidebarToggle } from "@/components/layout/SidebarToggle";
import { CopilotHeader } from "@/components/copilot/CopilotHeader";
import { ChatAssistantModal } from "@/components/copilot/ChatAssistantModal";
import { AiKpiCard } from "@/components/copilot/AiKpiCard";
import { AiAnalysisSummaryCard } from "@/components/copilot/AiAnalysisSummaryCard";
import { TopAlertCategoriesCard } from "@/components/copilot/TopAlertCategoriesCard";
import { AiConfidenceDistributionCard } from "@/components/copilot/AiConfidenceDistributionCard";
import { RecentAiAlertAnalysisCard } from "@/components/copilot/RecentAiAlertAnalysisCard";
import { AiRecommendedNextStepsCard } from "@/components/copilot/AiRecommendedNextStepsCard";
import { AiAssistantCard } from "@/components/copilot/AiAssistantCard";
import { IncidentSummarizationWorkspace } from "@/components/copilot/IncidentSummarizationWorkspace";
import { IocAnalysisWorkspace } from "@/components/copilot/IocAnalysisWorkspace";
import { InvestigationAssistantWorkspace } from "@/components/copilot/InvestigationAssistantWorkspace";
import { RecommendationsWorkspace } from "@/components/copilot/RecommendationsWorkspace";
import { AI_KPI_CARDS } from "@/services/ai-copilot-demo-provider";

const COPILOT_TABS = [
  "AI Alert Analysis",
  "Incident Summarization",
  "IOC Analysis",
  "Investigation Assistant",
  "Recommendation",
  "AI Assistant",
] as const;

type CopilotTab = (typeof COPILOT_TABS)[number];

function getTabIcon(tab: CopilotTab) {
  switch (tab) {
    case "AI Alert Analysis":
      return <span className="text-purple-500 text-sm">✨</span>;
    case "Incident Summarization":
      return (
        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "IOC Analysis":
      return (
        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "Investigation Assistant":
      return (
        <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case "Recommendation":
      return (
        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "AI Assistant":
      return <span className="text-blue-500 text-sm">🤖</span>;
  }
}

export default function CopilotPage() {
  const openSidebar = useSidebarToggle();
  const [activeTab, setActiveTab] = useState<CopilotTab>("Recommendation");
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <CopilotHeader
        onMenuClick={openSidebar}
        onOpenChatModal={() => setIsChatModalOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        {/* Top Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5 overflow-x-auto lg:overflow-x-visible gap-2 sm:gap-3 md:gap-4 lg:gap-5 no-scrollbar">
          {COPILOT_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 sm:px-2.5 text-xs sm:text-sm font-medium whitespace-nowrap inline-flex items-center gap-1.5 transition-colors relative shrink-0 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                {getTabIcon(tab)}
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: AI Alert Analysis */}
        {activeTab === "AI Alert Analysis" && (
          <div className="space-y-4">
            {/* KPI Row (5 Cards in 1 Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
              {AI_KPI_CARDS.map((metric) => (
                <AiKpiCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* Main Analytics Row (3 Equal-Height Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              <div className="h-full">
                <AiAnalysisSummaryCard />
              </div>
              <div className="h-full">
                <TopAlertCategoriesCard />
              </div>
              <div className="h-full">
                <AiConfidenceDistributionCard />
              </div>
            </div>

            {/* Bottom Row (3 Equal-Height Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
              <div className="h-full">
                <RecentAiAlertAnalysisCard />
              </div>
              <div className="h-full">
                <AiRecommendedNextStepsCard />
              </div>
              <div className="h-full">
                <AiAssistantCard />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Incident Summarization */}
        {activeTab === "Incident Summarization" && (
          <IncidentSummarizationWorkspace />
        )}

        {/* Tab 3: IOC Analysis */}
        {activeTab === "IOC Analysis" && <IocAnalysisWorkspace />}

        {/* Tab 4: Investigation Assistant */}
        {activeTab === "Investigation Assistant" && (
          <InvestigationAssistantWorkspace />
        )}

        {/* Tab 5: Recommendation */}
        {activeTab === "Recommendation" && <RecommendationsWorkspace />}

        {/* Tab 6: AI Assistant Dedicated View */}
        {activeTab === "AI Assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-8 flex h-full min-w-0 flex-col rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  ✨
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Interactive AI Cyber Copilot Workspace
                  </h2>
                  <p className="text-xs text-slate-500">
                    Engage the AI model directly on security incidents, correlated telemetry, and MITRE ATT&CK mapping
                  </p>
                </div>
              </div>

              <div className="my-3 flex-1 space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  You can query alerts, request summaries of active cases, look up external IOC reputation scores, or generate remediation instructions tailored to your infrastructure.
                </p>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Capabilities enabled:
                  </div>
                  <ul className="mt-2 list-disc pl-4 space-y-1.5">
                    <li>Multi-source IOC verification via AbuseIPDB & Wazuh Telemetry</li>
                    <li>Automated alert triage & confidence rating</li>
                    <li>Guided containment & remediation playbooks</li>
                    <li>Natural language log inquiry</li>
                  </ul>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-100 pt-2 text-right dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400">
                  Ready to assist • 24/7 autonomous copilot runtime
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 h-full min-h-[500px]">
              <AiAssistantCard />
            </div>
          </div>
        )}
      </main>

      {/* Global AI Chat Assistant Modal */}
      <ChatAssistantModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </>
  );
}
