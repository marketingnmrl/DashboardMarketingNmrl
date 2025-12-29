import { NextRequest, NextResponse } from "next/server";

// N8N Webhook URL (server-side, no CORS issues)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "";

export async function POST(request: NextRequest) {
    try {
        console.log("🔗 N8N URL:", N8N_WEBHOOK_URL);

        if (!N8N_WEBHOOK_URL) {
            return NextResponse.json(
                { error: "Webhook URL não configurada" },
                { status: 500 }
            );
        }

        const body = await request.json();
        console.log("📤 Enviando para N8N:", JSON.stringify(body).slice(0, 200));

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        console.log("📥 Resposta N8N:", response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Erro N8N:", errorText);
            return NextResponse.json(
                { error: `Erro do N8N: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log("✅ Dados recebidos:", JSON.stringify(data).slice(0, 200));
        return NextResponse.json(data);
    } catch (error) {
        console.error("Erro no proxy AI:", error);
        return NextResponse.json(
            { error: "Erro ao conectar com o agente IA" },
            { status: 500 }
        );
    }
}
