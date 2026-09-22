import useSWR from 'swr';
import { 
  RangeValue, 
  AlertsSummary, 
  TrendData, 
  AttackMethod, 
  TopVictim, 
  TopRisk, 
  CasesStats, 
  MitreTactic, 
  AgentHealth, 
  BoardReport, 
  Incident,
  ApiResponse
} from '../types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useExecutiveData(range: RangeValue) {
  // Alerts
  const { data: alertsRes, error: alertsErr, isValidating: alertsLoading, mutate: mutateAlerts } = useSWR<ApiResponse<AlertsSummary>>(`/api/soc/alerts-by-severity?range=${range}`, fetcher);
  
  // Alerts Prev (for delta calculation)
  const prevRange = range; // The original code just used the same string, but we pass offset=1
  const { data: alertsPrevRes, error: alertsPrevErr, isValidating: alertsPrevLoading, mutate: mutateAlertsPrev } = useSWR<ApiResponse<AlertsSummary>>(`/api/soc/alerts-by-severity?range=${prevRange}&offset=1`, fetcher);

  // Trends
  const { data: trendRes, error: trendErr, isValidating: trendLoading, mutate: mutateTrend } = useSWR<ApiResponse<TrendData[]>>(`/api/soc/alerts-trend?range=${range}`, fetcher);

  // Attack Methods
  const { data: attackMethodsRes, error: attackMethodsErr, isValidating: attackMethodsLoading, mutate: mutateAttackMethods } = useSWR<ApiResponse<AttackMethod[]>>(`/api/soc/attack-methods?range=${range}`, fetcher);

  // Top Victims
  const { data: topVictimsRes, error: topVictimsErr, isValidating: topVictimsLoading, mutate: mutateTopVictims } = useSWR<ApiResponse<TopVictim[]>>(`/api/soc/top-victims?range=${range}`, fetcher);

  // Top Risks
  const { data: topRisksRes, error: topRisksErr, isValidating: topRisksLoading, mutate: mutateTopRisks } = useSWR<ApiResponse<TopRisk[]>>(`/api/executive/top-risks?range=${range}`, fetcher);

  // Heatmap Data (Assuming it returns any[] for react-simple-maps)
  const { data: heatmapRes, error: heatmapErr, isValidating: heatmapLoading, mutate: mutateHeatmap } = useSWR<ApiResponse<any[]>>(`/api/executive/attack-heatmap?range=${range}`, fetcher);

  // Cases Stats
  const { data: casesStatsRes, error: casesStatsErr, isValidating: casesStatsLoading, mutate: mutateCasesStats } = useSWR<ApiResponse<CasesStats>>(`/api/soc/cases/stats?range=${range}`, fetcher);

  // Mitre Tactics
  const { data: mitreTacticsRes, error: mitreTacticsErr, isValidating: mitreTacticsLoading, mutate: mutateMitreTactics } = useSWR<ApiResponse<MitreTactic[]>>(`/api/executive/mitre-tactics?limit=8&range=${range}`, fetcher);

  // --- Range-independent data ---

  // Agent Health
  const { data: agentHealthRes, error: agentHealthErr, isValidating: agentHealthLoading, mutate: mutateAgentHealth } = useSWR<ApiResponse<AgentHealth>>('/api/executive/agent-health', fetcher);

  // Recent Incidents
  const { data: incidentsRes, error: incidentsErr, isValidating: incidentsLoading, mutate: mutateIncidents } = useSWR<ApiResponse<Incident[]>>('/api/soc/recent-incidents', fetcher);

  // AI Summary
  const { data: aiSummaryRes, error: aiSummaryErr, isValidating: aiSummaryLoading, mutate: mutateAiSummary } = useSWR<ApiResponse<string[]>>('/api/ai/executive-summary', fetcher);

  // Board Report
  const { data: boardReportRes, error: boardReportErr, isValidating: boardReportLoading, mutate: mutateBoardReport } = useSWR<ApiResponse<BoardReport>>('/api/executive/board-report', fetcher);

  const refreshAll = () => {
    mutateAlerts();
    mutateAlertsPrev();
    mutateTrend();
    mutateAttackMethods();
    mutateTopVictims();
    mutateTopRisks();
    mutateHeatmap();
    mutateCasesStats();
    mutateMitreTactics();
    mutateAgentHealth();
    mutateIncidents();
    mutateAiSummary();
    mutateBoardReport();
  };

  const isRefreshing = 
    alertsLoading || alertsPrevLoading || trendLoading || attackMethodsLoading ||
    topVictimsLoading || topRisksLoading || heatmapLoading || casesStatsLoading ||
    mitreTacticsLoading || agentHealthLoading || incidentsLoading || aiSummaryLoading || boardReportLoading;

  return {
    alerts: alertsRes?.status === 'ok' ? alertsRes.data : null,
    alertsPrev: alertsPrevRes?.status === 'ok' ? alertsPrevRes.data : null,
    trend: trendRes?.status === 'ok' ? trendRes.data : [],
    attackMethods: attackMethodsRes?.status === 'ok' ? attackMethodsRes.data : null,
    topVictims: topVictimsRes?.status === 'ok' ? topVictimsRes.data : null,
    topRisks: topRisksRes?.status === 'ok' ? topRisksRes.data : null,
    heatmapData: heatmapRes?.status === 'ok' ? heatmapRes.data : null,
    casesStats: casesStatsRes?.status === 'ok' ? casesStatsRes.data : null,
    mitreTactics: mitreTacticsRes?.status === 'ok' ? mitreTacticsRes.data : null,
    agentHealth: agentHealthRes?.status === 'ok' ? agentHealthRes.data : null,
    incidents: incidentsRes?.status === 'ok' ? incidentsRes.data : null,
    aiSummary: aiSummaryRes?.status === 'ok' ? aiSummaryRes.data : null,
    boardReport: boardReportRes?.status === 'ok' ? boardReportRes.data : null,
    
    isRefreshing,
    refreshAll
  };
}
