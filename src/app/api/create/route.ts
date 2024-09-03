import { getWebsiteData } from "@/lib/getWebsiteData";
import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { z } from "zod";

const replicate = new Replicate()
const promptPrefix = "Based on this content, create a vibrant and dynamic digital illustration for social media promotion. Use a bright and bold color palette. Incorporate abstract elements such as geometric shapes, dots, and lines to add energy and movement. Include symbols. The overall style should be modern, playful, and eye-catching with a mix of flat and pop art elements, and colorful."
const fluxModel = process.env.FLUX_MODEL || "flux_schnell"

export async function POST(req: NextRequest) {
    const schema = z.object({
        url: z.string().url()
    })

    try {
        const reqBody = schema.parse(await req.json())
        const websiteContent = await getWebsiteData(reqBody.url)
        //reffer to https://replicate.com/black-forest-labs/flux-pro/api/schema
        const prediction = await replicate.predictions.create({
            model: "black-forest-labs/" + fluxModel,
            input: {
                prompt: `${promptPrefix} - "${websiteContent}"`
            },
        })
        return NextResponse.json({
            success: true,
            data: {
                id: prediction.id,
                status: prediction.status
            }
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, error: error }, { status: 400 })
    }
}

