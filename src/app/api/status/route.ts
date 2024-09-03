export const dynamic = 'force-dynamic'; 
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { z } from "zod";

const replicate = new Replicate()
const fluxModel = process.env.FLUX_MODEL || "flux_schnell"

export async function GET(req: NextRequest) {
    const idSchema = z.string()
    try {
        const id = idSchema.parse(req.nextUrl.searchParams.get("id"))
        const latest = await replicate.predictions.get(id)
        return NextResponse.json({
            success: true,
            data: {
                id,
                status: latest.status,
                output: fluxModel === "flux-pro" ? latest.output : latest.output?.[0]
            }
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, error: error }, { status: 400 })
    }
}

