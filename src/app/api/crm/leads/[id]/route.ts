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

async function authenticateRequest(request: NextRequest, supabase: SupabaseClient) {
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
        return { error: "Missing X-API-Key header", status: 401 };
    }

    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    const { data: apiKeyRecord, error: keyError } = await supabase
        .from("crm_api_keys")
        .select("user_id")
        .eq("key_hash", keyHash)
        .single();

    if (keyError || !apiKeyRecord) {
        return { error: "Invalid API key", status: 401 };
    }

    return { userId: apiKeyRecord.user_id };
}

/**
 * GET /api/crm/leads/[id]
 * Get a specific lead by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const auth = await authenticateRequest(request, supabase);
        if ("error" in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;

        const { data: lead, error } = await supabase
            .from("crm_leads")
            .select(`
                *,
                crm_pipeline_stages!current_stage_id (
                    id,
                    name,
                    color
                )
            `)
            .eq("id", id)
            .eq("user_id", auth.userId)
            .single();

        if (error || !lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        return NextResponse.json({ lead });

    } catch (error) {
        console.error("Get lead error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

/**
 * PATCH /api/crm/leads/[id]
 * Update a lead
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const auth = await authenticateRequest(request, supabase);
        if ("error" in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status });
        }

        const { id } = await params;
        const body = await request.json();

        // Allowed fields to update
        const allowedFields = ["name", "email", "phone", "company", "custom_fields"];
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        updateData.updated_at = new Date().toISOString();

        const { data: lead, error } = await supabase
            .from("crm_leads")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", auth.userId)
            .select()
            .single();

        if (error || !lead) {
            return NextResponse.json({ error: "Lead not found or update failed" }, { status: 404 });
        }

        return NextResponse.json({ lead, message: "Lead updated successfully" });

    } catch (error) {
        console.error("Update lead error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
