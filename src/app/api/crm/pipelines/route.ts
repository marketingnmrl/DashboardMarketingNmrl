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
 * GET /api/crm/pipelines
 * List all pipelines for the authenticated user
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

        // Get pipelines with stages
        const { data: pipelines, error } = await supabase
            .from("crm_pipelines")
            .select(`
                id,
                name,
                created_at,
                crm_pipeline_stages (
                    id,
                    name,
                    color,
                    order_index
                )
            `)
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching pipelines:", error);
            return NextResponse.json(
                { error: "Failed to fetch pipelines" },
                { status: 500 }
            );
        }

        // Format response
        const formattedPipelines = (pipelines || []).map(p => ({
            id: p.id,
            name: p.name,
            created_at: p.created_at,
            stages: (p.crm_pipeline_stages || [])
                .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
                .map((s: { id: string; name: string; color: string }) => ({
                    id: s.id,
                    name: s.name,
                    color: s.color
                }))
        }));

        return NextResponse.json({
            pipelines: formattedPipelines,
            total: formattedPipelines.length
        });

    } catch (error) {
        console.error("Pipelines API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
