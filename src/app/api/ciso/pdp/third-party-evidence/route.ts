import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/get-session";
import { getPdpThirdPartyProcessingCandidateEvidence } from "@/services/pdp-third-party-evidence-service";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){if(!await getSessionFromRequest(request))return NextResponse.json({error:"Authentication required."},{status:401});return NextResponse.json({status:"ok",data:await getPdpThirdPartyProcessingCandidateEvidence()},{headers:{"Cache-Control":"no-store"}});}
