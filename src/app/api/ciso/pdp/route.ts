import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/get-session";
import { getPdpBaseline } from "@/services/pdp-service";

export const dynamic = "force-dynamic";
const unavailable = () => NextResponse.json({ code:"pdp_storage_unavailable", error:"UU PDP baseline storage unavailable. Check DATABASE_URL and migration 009." },{status:503});
const text = (v:unknown) => typeof v === "string" && v.trim() && v.length<=10000 ? v.trim() : null;
const date = (v:unknown) => v===null || v==="" ? null : typeof v==="string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined;
const tri = (v:unknown) => ["yes","no","not_recorded"].includes(String(v)) ? String(v) : null;
const inventoryStatus = (v:unknown) => ["draft","active","retired"].includes(String(v)) ? String(v) : null;
const uuid = (v:unknown) => v===null||v==="" ? null : typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) ? v : undefined;
const evidenceTypes=["Policy","SOP / Procedure","Configuration","System Record","Audit / Review Record","Contract / Agreement","Approval","Report","Screenshot / Export Reference","Other"];
const evidenceType=(v:unknown)=>typeof v==="string"&&evidenceTypes.includes(v)?v:null;
const timestamp=(v:unknown)=>typeof v==="string"&&v.length<=64&&Number.isFinite(Date.parse(v))?v:null;
async function actor(request:NextRequest){ const session=await getSessionFromRequest(request); if(!session)return null; if(!["admin","ciso"].includes(session.role))return null; return session.email.trim().toLowerCase()||session.id; }

export async function GET(request:NextRequest){ if(!await getSessionFromRequest(request))return NextResponse.json({error:"Authentication required."},{status:401}); try{return NextResponse.json({status:"ok",data:await getPdpBaseline()},{headers:{"Cache-Control":"no-store"}});}catch{return unavailable();} }

export async function POST(request:NextRequest){
  const assessedBy=await actor(request); if(!assessedBy)return NextResponse.json({error:"Admin or CISO authentication required."},{status:403});
  if(!env.database.url())return unavailable();
  const origin=request.headers.get("origin"); if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Cross-origin writes are not allowed."},{status:403});
  let body:any; try{body=await request.json();}catch{return NextResponse.json({error:"Invalid JSON payload."},{status:400});}
  if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"Invalid payload."},{status:400});
  const db=getDb();
  try{
    if(body.action==="assess_control"){
      const controlId=text(body.controlId), status={compliant:"passed",partial:"partial",non_compliant:"failed"}[body.status as string], rationale=text(body.rationale), notes=text(body.notes);
      if(!controlId||!status||!rationale)return NextResponse.json({error:"Control, explicit assessment status, and rationale are required."},{status:400});
      const result=await db.query(`INSERT INTO compliance_assessments(framework_id,control_id,status,evidence,notes,assessed_by,source) SELECT 'uu-pdp',id,$2,$3,$4,$5,'manual' FROM compliance_controls WHERE id=$1 AND framework_id='uu-pdp' RETURNING id`,[controlId,status,rationale,notes,assessedBy]);
      if(!result.rows[0])return NextResponse.json({error:"UU PDP control not found."},{status:404});
    } else if(body.action==="add_evidence"){
      const values=[text(body.controlId),text(body.title),evidenceType(body.evidenceType),text(body.description),text(body.referenceLocation),text(body.owner),timestamp(body.collectedAt),text(body.notes)];
      if([0,1,2,4,5,6].some(i=>!values[i]))return NextResponse.json({error:"Provide a control, title, controlled evidence type, reference, owner, and valid evidence date."},{status:400});
      const result=await db.query(`INSERT INTO compliance_evidence(control_id,title,evidence_type,description,reference_location,owner,collected_at,notes,created_by,updated_by,review_status) SELECT id,$2,$3,$4,$5,$6,$7::timestamptz,$8,$9,$9,'registered' FROM compliance_controls WHERE id=$1 AND framework_id='uu-pdp' RETURNING id`,[...values,assessedBy]); if(!result.rows[0])return NextResponse.json({error:"UU PDP control not found."},{status:404});
    } else if(body.action==="update_evidence"){
      const values=[uuid(body.evidenceId),text(body.title),evidenceType(body.evidenceType),text(body.description),text(body.referenceLocation),text(body.owner),timestamp(body.collectedAt),text(body.notes)];
      if(!values[0]||[1,2,4,5,6].some(i=>!values[i]))return NextResponse.json({error:"Select evidence and provide valid registry metadata."},{status:400});
      const result=await db.query(`UPDATE compliance_evidence e SET title=$2,evidence_type=$3,description=$4,reference_location=$5,owner=$6,collected_at=$7::timestamptz,notes=$8,updated_by=$9,updated_at=NOW() FROM compliance_controls c WHERE e.id=$1 AND c.id=e.control_id AND c.framework_id='uu-pdp' RETURNING e.id`,[...values,assessedBy]);if(!result.rows[0])return NextResponse.json({error:"UU PDP evidence not found."},{status:404});
    } else if(body.action==="review_evidence"){
      const id=uuid(body.evidenceId),status=["pending_review","verified","rejected"].includes(body.reviewStatus)?body.reviewStatus:null,reviewNotes=text(body.reviewNotes);
      if(!id||!status||(status!=="pending_review"&&!reviewNotes))return NextResponse.json({error:"Select evidence, a review decision, and notes for verified or rejected evidence."},{status:400});
      const result=await db.query(`UPDATE compliance_evidence e SET review_status=$2,reviewed_by=CASE WHEN $2 IN ('verified','rejected') THEN $3 ELSE NULL END,reviewed_at=CASE WHEN $2 IN ('verified','rejected') THEN NOW() ELSE NULL END,review_notes=$4,updated_by=$3,updated_at=NOW() FROM compliance_controls c WHERE e.id=$1 AND c.id=e.control_id AND c.framework_id='uu-pdp' RETURNING e.id`,[id,status,assessedBy,reviewNotes]);if(!result.rows[0])return NextResponse.json({error:"UU PDP evidence not found."},{status:404});
    } else if(body.action==="add_finding"){
      const due=date(body.dueDate), severity=["Low","Medium","High","Critical"].includes(body.severity)?body.severity:null, status=["Open","In Progress","Resolved","Accepted"].includes(body.status)?body.status:null;
      const evidenceId=uuid(body.evidenceId);const values=[text(body.controlId),text(body.title),text(body.description),severity,status,text(body.owner)]; if(values.some(v=>!v)||due===undefined||evidenceId===undefined)return NextResponse.json({error:"Complete valid finding fields."},{status:400});
      const result=await db.query(`INSERT INTO compliance_findings(control_id,evidence_id,title,description,severity,status,owner,due_date,created_by) SELECT c.id,e.id,$2,$3,$4,$5,$6,$7,$8 FROM compliance_controls c LEFT JOIN compliance_evidence e ON e.id=$9 AND e.control_id=c.id WHERE c.id=$1 AND c.framework_id='uu-pdp' AND ($9::uuid IS NULL OR e.id IS NOT NULL) RETURNING id`,[...values,due,assessedBy,evidenceId]); if(!result.rows[0])return NextResponse.json({error:"UU PDP control or related evidence not found."},{status:404});
    } else if(body.action==="add_remediation"){
      const target=date(body.targetDate), status=["Planned","In Progress","Completed"].includes(body.status)?body.status:null; const values=[text(body.findingId),text(body.remediationAction),text(body.owner),status]; if(values.some(v=>!v)||target===undefined)return NextResponse.json({error:"Complete valid remediation fields."},{status:400});
      const result=await db.query(`INSERT INTO compliance_remediations(finding_id,action,owner,status,target_date,completed_at,notes,created_by) SELECT f.id,$2,$3,$4,$5,CASE WHEN $4='Completed' THEN NOW() ELSE NULL END,$6,$7 FROM compliance_findings f JOIN compliance_controls c ON c.id=f.control_id WHERE f.id=$1 AND c.framework_id='uu-pdp' RETURNING id`,[...values,target,text(body.notes),assessedBy]); if(!result.rows[0])return NextResponse.json({error:"UU PDP finding not found."},{status:404});
    } else if(body.action==="update_remediation"){
      const id=text(body.remediationId), action=text(body.remediationAction), owner=text(body.owner), target=date(body.targetDate), status=["Planned","In Progress","Completed"].includes(body.status)?body.status:null; if(!id||!action||!owner||!status||target===undefined)return NextResponse.json({error:"Select a remediation and complete its required fields."},{status:400});
      const result=await db.query(`UPDATE compliance_remediations r SET action=$2,owner=$3,status=$4,target_date=$5,completed_at=CASE WHEN $4='Completed' THEN COALESCE(r.completed_at,NOW()) ELSE NULL END,notes=$6,updated_at=NOW() FROM compliance_findings f,compliance_controls c WHERE r.id=$1 AND f.id=r.finding_id AND c.id=f.control_id AND c.framework_id='uu-pdp' RETURNING r.id`,[id,action,owner,status,target,text(body.notes)]); if(!result.rows[0])return NextResponse.json({error:"UU PDP remediation not found."},{status:404});
    } else if(body.action==="add_inventory"){
      const thirdPartyId=uuid(body.thirdPartyId),nextReview=date(body.nextReviewAt),states=[tri(body.sensitiveDataStatus),tri(body.crossBorderTransfer),tri(body.sharedWithThirdParties)],status=inventoryStatus(body.recordStatus);
      if(!text(body.dataAsset)||thirdPartyId===undefined||nextReview===undefined||states.some(v=>!v)||!status)return NextResponse.json({error:"Provide an activity name and valid explicit record states."},{status:400});
      const values=[text(body.dataAsset),text(body.description),text(body.businessUnit),text(body.personalDataCategory),text(body.dataSubjectCategories),states[0],text(body.dataOwner),text(body.processingPurpose),text(body.lawfulBasis),text(body.personalDataSource),text(body.dataFlowReference),text(body.retention),text(body.deletionApproach),text(body.processingLocation),text(body.storageLocation),states[1],text(body.transferDestination),states[2],thirdPartyId,text(body.dataHubEntityId),status,nextReview];
      await db.query(`INSERT INTO pdp_data_inventory(data_asset,description,business_unit,personal_data_category,data_subject_categories,sensitive_data_status,data_owner,processing_purpose,lawful_basis,personal_data_source,data_flow_reference,retention,deletion_approach,processing_location,storage_location,cross_border_transfer,transfer_destination,shared_with_third_parties,third_party_id,data_hub_entity_id,record_status,next_review_at,created_by,updated_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$23)`,[...values,assessedBy]);
    } else if(body.action==="update_inventory"){
      const id=uuid(body.inventoryId),thirdPartyId=uuid(body.thirdPartyId),nextReview=date(body.nextReviewAt),states=[tri(body.sensitiveDataStatus),tri(body.crossBorderTransfer),tri(body.sharedWithThirdParties)],status=inventoryStatus(body.recordStatus);
      if(!id||!text(body.dataAsset)||thirdPartyId===undefined||nextReview===undefined||states.some(v=>!v)||!status)return NextResponse.json({error:"Select an inventory record and provide valid explicit record states."},{status:400});
      const values=[text(body.dataAsset),text(body.description),text(body.businessUnit),text(body.personalDataCategory),text(body.dataSubjectCategories),states[0],text(body.dataOwner),text(body.processingPurpose),text(body.lawfulBasis),text(body.personalDataSource),text(body.dataFlowReference),text(body.retention),text(body.deletionApproach),text(body.processingLocation),text(body.storageLocation),states[1],text(body.transferDestination),states[2],thirdPartyId,status,nextReview];
      const result=await db.query(`UPDATE pdp_data_inventory SET data_asset=$2,description=$3,business_unit=$4,personal_data_category=$5,data_subject_categories=$6,sensitive_data_status=$7,data_owner=$8,processing_purpose=$9,lawful_basis=$10,personal_data_source=$11,data_flow_reference=$12,retention=$13,deletion_approach=$14,processing_location=$15,storage_location=$16,cross_border_transfer=$17,transfer_destination=$18,shared_with_third_parties=$19,third_party_id=$20,record_status=$21,next_review_at=$22,updated_at=NOW(),updated_by=$23 WHERE id=$1 RETURNING id`,[id,...values,assessedBy]); if(!result.rows[0])return NextResponse.json({error:"Data inventory record not found."},{status:404});
    } else if(body.action==="add_breach"){
      if(body.explicitlyClassifiedPersonalData!==true&&body.explicitlyClassifiedPersonalData!=="true")return NextResponse.json({error:"Explicit personal-data breach classification is required."},{status:400});
      const response=["Open","Investigating","Contained","Resolved"].includes(body.responseStatus)?body.responseStatus:null, notification=["Not Assessed","Not Required","Pending","Notified"].includes(body.notificationStatus)?body.notificationStatus:null;
      const values=[text(body.title),text(body.timeline),text(body.impact),text(body.affectedData),text(body.affectedSubjects),response,notification]; if(values.some(v=>!v))return NextResponse.json({error:"Complete verified personal-data breach fields."},{status:400});
      await db.query(`INSERT INTO pdp_breaches(title,explicitly_classified_personal_data,timeline,impact,affected_data,affected_subjects,response_status,notification_status,occurred_at,detected_at,created_by) VALUES($1,true,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[...values,text(body.occurredAt),text(body.detectedAt),assessedBy]);
    } else return NextResponse.json({error:"Unsupported PDP action."},{status:400});
    return NextResponse.json({status:"ok",data:await getPdpBaseline()},{status:201});
  }catch{return unavailable();}
}
