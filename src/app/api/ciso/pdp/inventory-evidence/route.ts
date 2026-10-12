import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getPdpInventoryCandidateEvidence } from "@/services/pdp-inventory-evidence-service";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){if(!await getSessionFromRequest(request))return NextResponse.json({error:"Authentication required."},{status:401});return NextResponse.json({status:"ok",data:await getPdpInventoryCandidateEvidence()},{headers:{"Cache-Control":"no-store"}});}
