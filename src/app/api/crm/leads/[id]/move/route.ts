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
 * POST /api/crm/leads/[id]/move
 * Move a lead to a different stage
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Authenticate
        const apiKey = request.headers.get("X-API-Key");
        if (!apiKey) {
            return NextResponse.json({ error: "Missing X-API-Key header" }, { status: 401 });
        }

        const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
        const { data: apiKeyRecord, error: keyError } = await supabase
            .from("crm_api_keys")
            .select("user_id")
            .eq("key_hash", keyHash)
            .single();

        if (keyError || !apiKeyRecord) {
            return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }

        const userId = apiKeyRecord.user_id;
        const { id: leadId } = await params;
        const body = await request.json();
        const { stage_id } = body;

        if (!stage_id) {
            return NextResponse.json({ error: "stage_id is required" }, { status: 400 });
        }

        // Get current lead
        const { data: lead, error: leadError } = await supabase
            .from("crm_leads")
            .select("id, current_stage_id, pipeline_id")
            .eq("id", leadId)
            .eq("user_id", userId)
            .single();

        if (leadError || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Verify new stage belongs to same pipeline
        const { data: stage, error: stageError } = await supabase
            .from("crm_pipeline_stages")
            .select("id, name")
            .eq("id", stage_id)
            .eq("pipeline_id", lead.pipeline_id)
            .single();

        if (stageError || !stage) {
            return NextResponse.json({ error: "Stage not found in this pipeline" }, { status: 404 });
        }

        const fromStageId = lead.current_stage_id;

        // Update lead
        const { error: updateError } = await supabase
            .from("crm_leads")
            .update({
                current_stage_id: stage_id,
                updated_at: new Date().toISOString()
            })
            .eq("id", leadId);

        if (updateError) {
            return NextResponse.json({ error: "Failed to move lead" }, { status: 500 });
        }

        // Record in history
        await supabase
            .from("crm_lead_stage_history")
            .insert({
                lead_id: leadId,
                from_stage_id: fromStageId,
                to_stage_id: stage_id,
                moved_by: "api"
            });

        return NextResponse.json({
            success: true,
            lead_id: leadId,
            from_stage_id: fromStageId,
            to_stage_id: stage_id,
            stage_name: stage.name,
            message: `Lead moved to ${stage.name}`
        });

    } catch (error) {
        console.error("Move lead error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
