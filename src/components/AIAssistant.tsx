"use client";

import { useState, useRef, useEffect } from "react";
import { useMetrics } from "@/contexts/MetricsContext";

// N8N Webhook URL - Configure this in environment variables
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || "";

interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
}

interface AIResponse {
    pontos_positivos?: string[];
    alertas?: string[];
    recomendacoes?: string[];
    resumo?: string;
    resposta?: string;
}

export default function AIAssistant() {
    const { metrics } = useMetrics();
    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const formatAIResponse = (data: AIResponse | any): string => {
        // Handle different response formats from N8N

        // If it's a string directly
        if (typeof data === "string") {
            return data;
        }

        // If N8N returns { output: "..." }
        if (data.output) {
            return data.output;
        }

        // If N8N returns { text: "..." }
        if (data.text) {
            return data.text;
        }

        // If N8N returns { response: "..." }
        if (data.response) {
            return data.response;
        }

        // If N8N returns { message: "..." }
        if (data.message) {
            return data.message;
        }

        // Structured format
        let response = "";

        if (data.resumo) {
            response += data.resumo + "\n\n";
        }

        if (data.resposta) {
            response += data.resposta + "\n\n";
        }

        if (data.pontos_positivos && data.pontos_positivos.length > 0) {
            response += "✅ **Pontos Positivos:**\n";
            data.pontos_positivos.forEach((p: string) => response += `• ${p}\n`);
            response += "\n";
        }

        if (data.alertas && data.alertas.length > 0) {
            response += "⚠️ **Atenção:**\n";
            data.alertas.forEach((a: string) => response += `• ${a}\n`);
            response += "\n";
        }

        if (data.recomendacoes && data.recomendacoes.length > 0) {
            response += "💡 **Recomendações:**\n";
            data.recomendacoes.forEach((r: string) => response += `• ${r}\n`);
        }

        // If still empty, try to stringify the whole response
        if (!response.trim()) {
            try {
                return JSON.stringify(data, null, 2);
            } catch {
                return "Resposta recebida do agente.";
            }
        }

        return response.trim();
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    timestamp: new Date().toISOString(),
                    mensagem: content.trim(),
                    pagina: metrics?.pagina || "Dashboard",
                    periodo: metrics?.periodo || "Não especificado",
                    contexto: JSON.stringify(metrics, null, 2),
                }),
            });

            if (!res.ok) throw new Error(`Erro: ${res.status}`);

            const data = await res.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: formatAIResponse(data),
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "system",
                content: err instanceof Error ? err.message : "Erro ao processar mensagem",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const analyzeCurrentPage = () => {
        if (!metrics) {
            sendMessage("Analise as métricas desta página.");
            return;
        }

        const prompt = `Analise as métricas da página "${metrics.pagina}" e me dê um diagnóstico completo com pontos positivos, alertas e recomendações.`;
        sendMessage(prompt);
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (messages.length === 0) {
            // Welcome message
            const welcomeMessage: Message = {
                id: "welcome",
                role: "assistant",
                content: `Olá! Sou o assistente de análise do Marketing Na Moral. 🚀\n\nPosso te ajudar a:\n• Analisar métricas da página atual\n• Identificar oportunidades de melhoria\n• Sugerir otimizações para suas campanhas\n\nClique em "Analisar Página" ou me faça uma pergunta!`,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(inputValue);
        }
    };

    const panelClasses = isFullscreen
        ? "fixed inset-0 z-50"
        : "fixed bottom-24 right-6 z-50 w-[420px] h-[600px] max-h-[80vh]";

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#19069E] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                    title="Assistente IA"
                >
                    <span className="material-symbols-outlined text-[28px] text-[#C2DF0C] group-hover:rotate-12 transition-transform">
                        auto_awesome
                    </span>
                </button>
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className={`${panelClasses} flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200`}>
                    {/* Header */}
                    <div className="bg-[#19069E] px-4 py-3 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px] text-[#C2DF0C]">
                                    auto_awesome
                                </span>
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Assistente IA</h3>
                                <p className="text-blue-200 text-xs">{metrics?.pagina || "Dashboard"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Fullscreen Toggle */}
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                                title={isFullscreen ? "Minimizar" : "Tela cheia"}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {isFullscreen ? "close_fullscreen" : "open_in_full"}
                                </span>
                            </button>
                            {/* Close */}
                            <button
                                onClick={() => { setIsOpen(false); setIsFullscreen(false); }}
                                className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === "user"
                                        ? "bg-[#19069E] text-white rounded-br-md"
                                        : message.role === "system"
                                            ? "bg-red-100 text-red-700 border border-red-200"
                                            : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-[10px] mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"
                                        }`}>
                                        {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-[#19069E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                            <span className="w-2 h-2 bg-[#19069E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                            <span className="w-2 h-2 bg-[#19069E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                        </div>
                                        <span className="text-xs text-gray-500">Analisando...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0">
                        <button
                            onClick={analyzeCurrentPage}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C2DF0C] hover:bg-[#B0CC0B] text-[#19069E] text-xs font-bold rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[14px]">analytics</span>
                            Analisar Página
                        </button>
                        <button
                            onClick={() => sendMessage("Quais são os principais problemas nas minhas campanhas?")}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
                        >
                            Problemas
                        </button>
                        <button
                            onClick={() => sendMessage("Dê sugestões para melhorar meu ROI")}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap transition-colors disabled:opacity-50"
                        >
                            Melhorar ROI
                        </button>
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Faça uma pergunta sobre suas métricas..."
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#19069E] focus:border-transparent text-sm resize-none"
                                    rows={1}
                                    disabled={isLoading}
                                />
                            </div>
                            <button
                                onClick={() => sendMessage(inputValue)}
                                disabled={isLoading || !inputValue.trim()}
                                className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#19069E] hover:bg-[#12047A] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
