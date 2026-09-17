import "server-only";
import { getDb } from "@/lib/db";
import type { PdpInventoryCandidateEvidence, PdpInventoryEvidenceControl, PdpInventoryEvidenceMetric } from "@/types/pdp";

export type InventoryEvidenceCounts={total:number;latest:string|null;categories:number;owners:number;purposes:number;locations:number;storageLocations:number;crossBorderStates:number;retention:number;lawfulBasis:number;sharingStates:number;linkedThirdParties:number};
const controlField:Record<PdpInventoryEvidenceControl,keyof Pick<InventoryEvidenceCounts,"categories"|"owners"|"purposes"|"locations"|"retention"|"lawfulBasis"|"sharingStates"|"linkedThirdParties">>={"PDP-DG-01":"categories","PDP-DG-02":"categories","PDP-DG-03":"owners","PDP-DG-04":"purposes","PDP-DG-06":"retention","PDP-DG-07":"locations","PDP-PC-02":"lawfulBasis","PDP-PC-05":"sharingStates","PDP-PC-06":"linkedThirdParties"};
const controls=Object.keys(controlField) as PdpInventoryEvidenceControl[];

export function deriveInventoryEvidence(counts:InventoryEvidenceCounts):Record<PdpInventoryEvidenceControl,PdpInventoryEvidenceMetric>{
  return Object.fromEntries(controls.map(control=>{const recorded=control==="PDP-DG-01"?counts.total:counts[controlField[control]];const readiness=counts.total===0?"awaiting_organizational_data":recorded===counts.total?"candidate_evidence_available":"incomplete_evidence";return [control,{recorded,missing:counts.total-recorded,readiness}]})) as Record<PdpInventoryEvidenceControl,PdpInventoryEvidenceMetric>;
}

const unavailableControls=()=>Object.fromEntries(controls.map(control=>[control,{recorded:null,missing:null,readiness:"unavailable"}])) as Record<PdpInventoryEvidenceControl,PdpInventoryEvidenceMetric>;

export async function getPdpInventoryCandidateEvidence():Promise<PdpInventoryCandidateEvidence>{
  try {
    const result=await getDb().query<Record<string,string|Date|null>>(`SELECT COUNT(*) AS total,MAX(updated_at) AS latest,COUNT(*) FILTER (WHERE personal_data_category IS NOT NULL AND length(btrim(personal_data_category))>0) AS categories,COUNT(*) FILTER (WHERE data_owner IS NOT NULL AND length(btrim(data_owner))>0) AS owners,COUNT(*) FILTER (WHERE processing_purpose IS NOT NULL AND length(btrim(processing_purpose))>0) AS purposes,COUNT(*) FILTER (WHERE processing_location IS NOT NULL AND length(btrim(processing_location))>0) AS locations,COUNT(*) FILTER (WHERE storage_location IS NOT NULL AND length(btrim(storage_location))>0) AS storage_locations,COUNT(*) FILTER (WHERE cross_border_transfer IN ('yes','no')) AS cross_border_states,COUNT(*) FILTER (WHERE retention IS NOT NULL AND length(btrim(retention))>0) AS retention,COUNT(*) FILTER (WHERE lawful_basis IS NOT NULL AND length(btrim(lawful_basis))>0) AS lawful_basis,COUNT(*) FILTER (WHERE shared_with_third_parties IN ('yes','no')) AS sharing_states,COUNT(*) FILTER (WHERE third_party_id IS NOT NULL) AS linked_third_parties FROM pdp_data_inventory`);
    const row=result.rows[0];
    const number=(key:string)=>Number(row?.[key]);
    const counts:InventoryEvidenceCounts={total:number("total"),latest:row?.latest?new Date(row.latest).toISOString():null,categories:number("categories"),owners:number("owners"),purposes:number("purposes"),locations:number("locations"),storageLocations:number("storage_locations"),crossBorderStates:number("cross_border_states"),retention:number("retention"),lawfulBasis:number("lawful_basis"),sharingStates:number("sharing_states"),linkedThirdParties:number("linked_third_parties")};
    if(Object.entries(counts).some(([key,value])=>key!=="latest"&&(!Number.isInteger(value)||Number(value)<0||Number(value)>counts.total)))throw new Error("Invalid inventory aggregate");
    return {source:"pdp_data_inventory",status:"available",generatedAt:new Date().toISOString(),totalProcessingActivities:counts.total,latestInventoryUpdateAt:counts.latest,controls:deriveInventoryEvidence(counts),supportingCounts:{storageLocation:counts.storageLocations,crossBorderState:counts.crossBorderStates,linkedThirdParties:counts.linkedThirdParties}};
  } catch {
    return {source:"pdp_data_inventory",status:"unavailable",generatedAt:new Date().toISOString(),totalProcessingActivities:null,latestInventoryUpdateAt:null,controls:unavailableControls(),supportingCounts:{storageLocation:null,crossBorderState:null,linkedThirdParties:null}};
  }
}
