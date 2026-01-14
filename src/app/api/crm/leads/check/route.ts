import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabaseAdmin(): SupabaseClient | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        return null;
    }

    return createClient(url, key);
}

/**
 * GET /api/crm/leads/check?email=xxx
 * Check if a lead exists by email
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        if (!supabase) {
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Get API key from header
        const apiKey = request.headers.get("X-API-Key");

        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing X-API-Key header" },
                { status: 401 }
            );
        }

        // Hash the API key to compare with stored hash
        const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

        // Find the API key and get the user
        const { data: apiKeyRecord, error: keyError } = await supabase
            .from("crm_api_keys")
            .select("user_id")
            .eq("key_hash", keyHash)
            .single();

        if (keyError || !apiKeyRecord) {
            return NextResponse.json(
                { error: "Invalid API key" },
                { status: 401 }
            );
        }

        const userId = apiKeyRecord.user_id;

        // Get email from query params
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");
        const pipelineId = searchParams.get("pipeline_id");

        if (!email) {
            return NextResponse.json(
                { error: "email query parameter is required" },
                { status: 400 }
            );
        }

        // Build query
        let query = supabase
            .from("crm_leads")
            .select("id, name, email, pipeline_id, current_stage_id, created_at")
            .eq("user_id", userId)
            .eq("email", email);

        // Optionally filter by pipeline
        if (pipelineId) {
            query = query.eq("pipeline_id", pipelineId);
        }

        const { data: leads, error } = await query;

        if (error) {
            console.error("Error checking lead:", error);
            return NextResponse.json(
                { error: "Failed to check lead" },
                { status: 500 }
            );
        }

        if (leads && leads.length > 0) {
            return NextResponse.json({
                exists: true,
                lead: leads[0],
                total_matches: leads.length
            });
        }

        return NextResponse.json({
            exists: false,
            lead: null
        });

    } catch (error) {
        console.error("Check lead error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
