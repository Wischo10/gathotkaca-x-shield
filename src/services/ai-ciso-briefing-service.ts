import "server-only";
import { env } from "@/lib/env";
import { getCisoMetrics } from "@/services/ciso-service";
import { getComplianceOverview } from "@/services/compliance-service";
import { getThreatIntelligenceOverview } from "@/services/threat-intel";
import type { AiCisoBriefing, AiCisoBriefingItem, AiCisoGenerationMode, AiCisoNormalizedFact } from "@/types/ai-briefing";

export class AiBriefingError extends Error {
  constructor(public readonly code: "not_configured" | "unavailable" | "invalid_output") { super(code); }
}

type FactId = `F${number}`;
type NormalizedFact = AiCisoNormalizedFact & { id: FactId };

function configured() {
  try { return { url: env.ollama.url(), model: env.ollama.model() }; }
  catch { throw new AiBriefingError("not_configured"); }
}
function finite(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
function numbers(text: string) { return text.match(/\b\d+(?:\.\d+)?\b/g) ?? []; }
function forbidden(text: string) {
  return /\b(?:risk score|business impact|financial impact|attack capabilit(?:y|ies)|organizational maturity|incident caus(?:e|ed|ality)|remediation (?:is |was |has been )?(?:complete|completed|successful)|compromised assets?|lateral movement|critical security posture|malware families detected)\b/i.test(text);
}
function sameIds(a: string[], b: string[]) { return a.length === b.length && new Set(a).size === a.length && a.every(id => b.includes(id)); }
function supportedNumbers(text: string, ids: string[], facts: Map<string, NormalizedFact>) {
  const allowed = new Set(ids.flatMap(id => numbers(facts.get(id)?.text ?? "")));
  return numbers(text).every(value => allowed.has(value));
}
function modelItem(value: unknown): value is AiCisoBriefingItem {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return Object.keys(item).length === 2 && typeof item.text === "string" && item.text.trim().length > 0
    && item.text.length <= 2000 && Array.isArray(item.factIds) && item.factIds.length > 0
    && item.factIds.every(id => typeof id === "string");
}
function observation(value: unknown, facts: Map<string, NormalizedFact>): AiCisoBriefingItem | null {
  if (!modelItem(value) || value.factIds.length !== 1 || forbidden(value.text)) return null;
  const fact = facts.get(value.factIds[0]);
  return fact && value.text.trim() === fact.text && supportedNumbers(value.text, value.factIds, facts)
    ? { text: fact.text, factIds: [fact.id] } : null;
}
function action(value: unknown, allowed: AiCisoBriefingItem[], facts: Map<string, NormalizedFact>): AiCisoBriefingItem | null {
  if (!modelItem(value) || forbidden(value.text) || !value.factIds.every(id => facts.has(id)) || !supportedNumbers(value.text, value.factIds, facts)) return null;
  const match = allowed.find(item => item.text === value.text.trim() && sameIds(item.factIds, value.factIds));
  return match ? { text: match.text, factIds: [...match.factIds] } : null;
}
function executiveSummary(value: unknown, facts: NormalizedFact[]) {
  if (typeof value !== "string" || !value.trim() || value.length > 4000 || forbidden(value)) return null;
  let remaining = value.trim();
  const used = new Set<string>();
  while (remaining) {
    const fact = facts.find(item => !used.has(item.id) && remaining.startsWith(item.text));
    if (!fact) return null;
    used.add(fact.id);
    remaining = remaining.slice(fact.text.length).trimStart();
  }
  return used.size > 0 && supportedNumbers(value, [...used], new Map(facts.map(f => [f.id, f]))) ? value.trim() : null;
}
function add(facts: NormalizedFact[], id: FactId, key: string, value: unknown, unit: "count" | "percent", source: string, text: string) {
  if (finite(value)) facts.push({ id, key, value, unit, source, text });
}

export async function generateAiCisoBriefing(): Promise<AiCisoBriefing> {
  const { url, model } = configured();
  const [metrics, compliance, threatIntel] = await Promise.all([getCisoMetrics(), getComplianceOverview(), getThreatIntelligenceOverview()]);
  const facts: NormalizedFact[] = [];
  const sourceAvailability: Record<string, boolean> = {};
  const active = metrics.activeIncidents.value;
  sourceAvailability.activeIncidents = metrics.activeIncidents.availability?.status === "available" && finite(active);
  if (sourceAvailability.activeIncidents) add(facts, "F1", "active_incidents", active, "count", "activeIncidents", `Active incidents: ${active}.`);
  const critical = metrics.criticalVulnerabilities.value;
  sourceAvailability.criticalVulnerabilities = metrics.criticalVulnerabilities.availability?.status === "available" && finite(critical);
  if (sourceAvailability.criticalVulnerabilities) add(facts, "F2", "critical_vulnerabilities", critical, "count", "criticalVulnerabilities", `Critical vulnerabilities: ${critical}.`);
  const sla = metrics.vulnerabilitySlaOverview ?? metrics.vulnerabilitySla;
  sourceAvailability.vulnerabilitySla = sla.available;
  if (sla.available) {
    add(facts, "F3", "critical_vulnerabilities_overdue", sla.overdue, "count", "vulnerabilitySla", `Critical vulnerabilities overdue: ${sla.overdue}.`);
    add(facts, "F4", "critical_vulnerabilities_due_soon", sla.dueSoon, "count", "vulnerabilitySla", `Critical vulnerabilities due soon: ${sla.dueSoon}.`);
    add(facts, "F5", "critical_vulnerabilities_compliant", sla.compliant, "count", "vulnerabilitySla", `Critical vulnerabilities compliant: ${sla.compliant}.`);
  }
  const mitre = compliance.frameworks.find(item => item.metricKind === "telemetry_observation" && item.code === "MITRE-ATTACK");
  sourceAvailability.mitreObservedBreadth = !!mitre && finite(mitre.score) && finite(mitre.passedControls);
  if (sourceAvailability.mitreObservedBreadth && mitre) {
    add(facts, "F6", "mitre_observed_breadth", mitre.score, "percent", "mitreObservedBreadth", `MITRE ATT&CK observed breadth: ${mitre.score}%. This is a telemetry observation, not a compliance score.`);
    add(facts, "F7", "mitre_observed_techniques", mitre.passedControls, "count", "mitreObservedBreadth", `MITRE ATT&CK observed techniques: ${mitre.passedControls}.`);
  }
  sourceAvailability.threatIntelligence = threatIntel.availability !== "unavailable" && threatIntel.kpis !== null;
  if (sourceAvailability.threatIntelligence && threatIntel.kpis) {
    const freshness = threatIntel.availability === "cached"
      ? ` Fresh cached source collected at ${threatIntel.observedAt}.` : "";
    add(facts, "F8", "threat_intel_iocs", threatIntel.kpis.totalIocs, "count", "threatIntelligence", `External threat-intelligence IOCs: ${threatIntel.kpis.totalIocs}. These are external feed observations, not local detections.${freshness}`);
    add(facts, "F9", "malware_families", threatIntel.kpis.malwareCampaignsCount, "count", "threatIntelligence", `External threat-intelligence malware families: ${threatIntel.kpis.malwareCampaignsCount}. These are external feed observations, not local detections.${freshness}`);
    add(facts, "F10", "c2_botnet_indicators", threatIntel.kpis.c2BotnetCount, "count", "threatIntelligence", `External threat-intelligence C2 or botnet infrastructure indicators: ${threatIntel.kpis.c2BotnetCount}. These are external feed observations, not local detections.${freshness}`);
    add(facts, "F11", "high_confidence_iocs", threatIntel.kpis.highConfidenceCount, "count", "threatIntelligence", `External threat-intelligence high-confidence IOCs: ${threatIntel.kpis.highConfidenceCount}. These are external feed observations, not local detections.${freshness}`);
    add(facts, "F12", "malicious_ips", threatIntel.kpis.maliciousIpsCount, "count", "threatIntelligence", `External threat-intelligence malicious IPs: ${threatIntel.kpis.maliciousIpsCount}. These are external feed observations, not local detections.${freshness}`);
  }
  if (facts.length === 0) throw new AiBriefingError("unavailable");

  const factMap = new Map(facts.map(fact => [fact.id, fact]));
  const has = (id: FactId) => factMap.has(id);
  const allowedActions: AiCisoBriefingItem[] = [];
  if (has("F1")) allowedActions.push({ text: "Review and prioritize the active incidents reported by the incident source.", factIds: ["F1"] });
  if (has("F2") && has("F3")) allowedActions.push({ text: "Prioritize review of critical vulnerabilities using the reported overdue population.", factIds: ["F2", "F3"] });
  else if (has("F2")) allowedActions.push({ text: "Prioritize review of the reported critical vulnerabilities.", factIds: ["F2"] });
  if (has("F4")) allowedActions.push({ text: "Review critical vulnerabilities reported as due soon before their SLA deadline.", factIds: ["F4"] });
  if (has("F6") && has("F7")) allowedActions.push({ text: "Review the telemetry behind MITRE ATT&CK observed breadth without treating it as a compliance result.", factIds: ["F6", "F7"] });
  const threatIds = (["F8", "F9", "F10", "F11", "F12"] as FactId[]).filter(has);
  if (threatIds.length) allowedActions.push({ text: "Compare relevant external threat-intelligence observations with local telemetry before drawing conclusions about organizational exposure.", factIds: threatIds });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/api/chat`, {
      method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, stream: false, think: false, options: { temperature: 0, num_predict: 600 },
        format: { type: "object", additionalProperties: false, required: ["executiveSummary", "keyObservations", "priorityActions"], properties: {
          executiveSummary: { type: "string" },
          keyObservations: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["text", "factIds"], properties: { text: { type: "string" }, factIds: { type: "array", minItems: 1, items: { type: "string", enum: facts.map(f => f.id) } } } } },
          priorityActions: { type: "array", maxItems: 4, items: { type: "object", additionalProperties: false, required: ["text", "factIds"], properties: { text: { type: "string" }, factIds: { type: "array", minItems: 1, items: { type: "string", enum: facts.map(f => f.id) } } } } },
        } }, messages: [
          { role: "system", content: "Produce a strictly grounded CISO briefing with at most 4 key observations and at most 4 priority actions. Use only supplied normalized facts. For executiveSummary, copy one or more fact text values exactly, separated by one space. For each key observation, copy exactly one fact text and cite only its single ID. For priority actions, select exact entries from allowedActions, preserving text and factIds. Do not infer, interpret, correlate, invent numbers, or add claims. Return only the required JSON." },
          { role: "user", content: JSON.stringify({ normalizedFacts: facts, allowedActions }) },
        ] }),
    });
    if (!response.ok) throw new AiBriefingError("unavailable");
    const result = await response.json() as { message?: { content?: string } };
    if (typeof result.message?.content !== "string") throw new AiBriefingError("invalid_output");
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(result.message.content) as Record<string, unknown>; } catch { throw new AiBriefingError("invalid_output"); }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new AiBriefingError("invalid_output");
    let generationMode: AiCisoGenerationMode = "ollama_grounded";
    let summary = executiveSummary(parsed.executiveSummary, facts);
    if (!summary) { summary = facts.slice(0, 3).map(f => f.text).join(" "); generationMode = "grounded_factual_summary"; }
    const keyObservations = Array.isArray(parsed.keyObservations) ? parsed.keyObservations.map(v => observation(v, factMap)).filter((v): v is AiCisoBriefingItem => v !== null) : [];
    const priorityActions = Array.isArray(parsed.priorityActions) ? parsed.priorityActions.map(v => action(v, allowedActions, factMap)).filter((v): v is AiCisoBriefingItem => v !== null) : [];
    if (!summary || !keyObservations.length || !priorityActions.length) throw new AiBriefingError("invalid_output");
    return { executiveSummary: summary, keyObservations, priorityActions, generatedAt: new Date().toISOString(), model, generationMode, sourceAvailability, normalizedFacts: facts };
  } catch (error) {
    if (error instanceof AiBriefingError) throw error;
    throw new AiBriefingError("unavailable");
  } finally { clearTimeout(timeout); }
}
