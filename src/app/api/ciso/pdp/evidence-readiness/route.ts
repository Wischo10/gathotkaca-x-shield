import { NextRequest,NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getPdpEvidenceReadinessMatrix } from "@/services/pdp-evidence-readiness-service";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){if(!await getSessionFromRequest(request))return NextResponse.json({error:"Authentication required."},{status:401});try{return NextResponse.json({status:"ok",data:await getPdpEvidenceReadinessMatrix()},{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"UU PDP evidence readiness unavailable."},{status:503});}}
