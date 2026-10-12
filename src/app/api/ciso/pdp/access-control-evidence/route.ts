import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getPdpAccessControlCandidateEvidence } from "@/services/pdp-access-control-evidence-service";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){if(!await getSessionFromRequest(request))return NextResponse.json({error:"Authentication required."},{status:401});return NextResponse.json({status:"ok",data:await getPdpAccessControlCandidateEvidence()},{headers:{"Cache-Control":"no-store"}});}
