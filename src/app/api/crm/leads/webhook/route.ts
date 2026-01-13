import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase with service role for API access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
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

        // Update last_used_at
        await supabase
            .from("crm_api_keys")
            .update({ last_used_at: new Date().toISOString() })
            .eq("key_hash", keyHash);

        const userId = apiKeyRecord.user_id;

        // Parse request body
        const body = await request.json();
        const {
            pipeline_id,
            stage_id,
            name,
            email,
            phone,
            company,
            origin = "webhook",
            utm_source,
            utm_medium,
            utm_campaign,
            utm_content,
            utm_term,
            custom_fields = {}
        } = body;

        // Validate required fields
        if (!pipeline_id) {
            return NextResponse.json(
                { error: "pipeline_id is required" },
                { status: 400 }
            );
        }

        if (!name) {
            return NextResponse.json(
                { error: "name is required" },
                { status: 400 }
            );
        }

        // Verify pipeline belongs to user
        const { data: pipeline, error: pipelineError } = await supabase
            .from("crm_pipelines")
            .select("id")
            .eq("id", pipeline_id)
            .eq("user_id", userId)
            .single();

        if (pipelineError || !pipeline) {
            return NextResponse.json(
                { error: "Pipeline not found or access denied" },
                { status: 404 }
            );
        }

        // Get stage ID (use provided or first stage of pipeline)
        let targetStageId = stage_id;
        if (!targetStageId) {
            const { data: stages } = await supabase
                .from("crm_pipeline_stages")
                .select("id")
                .eq("pipeline_id", pipeline_id)
                .order("order_index", { ascending: true })
                .limit(1);

            if (stages && stages.length > 0) {
                targetStageId = stages[0].id;
            }
        }

        // Check for duplicate by email (optional - can be removed if duplicates are OK)
        if (email) {
            const { data: existingLead } = await supabase
                .from("crm_leads")
                .select("id")
                .eq("user_id", userId)
                .eq("email", email)
                .eq("pipeline_id", pipeline_id)
                .single();

            if (existingLead) {
                // Update existing lead instead of creating duplicate
                await supabase
                    .from("crm_leads")
                    .update({
                        name,
                        phone: phone || undefined,
                        company: company || undefined,
                        custom_fields: {
                            ...existingLead,
                            ...custom_fields
                        },
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", existingLead.id);

                return NextResponse.json({
                    lead_id: existingLead.id,
                    status: "updated",
                    message: "Lead already exists, updated with new data"
                });
            }
        }

        // Create the lead
        const { data: lead, error: leadError } = await supabase
            .from("crm_leads")
            .insert({
                user_id: userId,
                pipeline_id,
                current_stage_id: targetStageId,
                name,
                email: email || null,
                phone: phone || null,
                company: company || null,
                origin,
                utm_source: utm_source || null,
                utm_medium: utm_medium || null,
                utm_campaign: utm_campaign || null,
                utm_content: utm_content || null,
                utm_term: utm_term || null,
                custom_fields
            })
            .select("id")
            .single();

        if (leadError) {
            console.error("Error creating lead:", leadError);
            return NextResponse.json(
                { error: "Failed to create lead" },
                { status: 500 }
            );
        }

        // Record initial stage in history
        if (targetStageId) {
            await supabase
                .from("crm_lead_stage_history")
                .insert({
                    lead_id: lead.id,
                    from_stage_id: null,
                    to_stage_id: targetStageId,
                    moved_by: "webhook"
                });
        }

        return NextResponse.json({
            lead_id: lead.id,
            status: "created",
            message: "Lead created successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET endpoint to test the webhook
export async function GET() {
    return NextResponse.json({
        message: "CRM Lead Webhook API",
        usage: {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": "your-api-key"
            },
            body: {
                pipeline_id: "uuid (required)",
                stage_id: "uuid (optional, uses first stage if not provided)",
                name: "string (required)",
                email: "string (optional)",
                phone: "string (optional)",
                company: "string (optional)",
                origin: "organic | paid | manual | webhook (default: webhook)",
                utm_source: "string (optional)",
                utm_medium: "string (optional)",
                utm_campaign: "string (optional)",
                utm_content: "string (optional)",
                utm_term: "string (optional)",
                custom_fields: "object (optional)"
            }
        }
    });
}
