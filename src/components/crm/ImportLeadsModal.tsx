"use client";

import { useState, useRef } from "react";
import { useLeads } from "@/hooks/useLeads";
import type { CreateLeadInput, CRMPipelineStage } from "@/types/crm";

interface ImportLeadsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    stages: CRMPipelineStage[];
    pipelineId: string;
}

export function ImportLeadsModal({
    isOpen,
    onClose,
    onSuccess,
    stages,
    pipelineId
}: ImportLeadsModalProps) {
    const { importLeads } = useLeads({ pipelineId });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedStageId, setSelectedStageId] = useState<string>(stages[0]?.id || "");
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<CreateLeadInput[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successCount, setSuccessCount] = useState<number | null>(null);

    const downloadTemplate = () => {
        const headers = ["name", "email", "phone", "company", "deal_value", "origin"];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" +
            "Exemplo Cliente,cliente@exemplo.com,11999999999,Empresa Exemplo,1500.00,Indicação";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_importacao_leads.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const parseCSV = async (file: File) => {
        setIsParsing(true);
        setError(null);
        setPreviewData([]);

        try {
            const text = await file.text();
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");

            if (lines.length < 2) {
                throw new Error("O arquivo CSV parece estar vazio ou sem dados.");
            }

            const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase().replace(/"/g, ""));
            const requiredField = "name";

            if (!headers.includes(requiredField)) {
                throw new Error(`A coluna obrigatória "${requiredField}" não foi encontrada.`);
            }

            const parsedLeads: CreateLeadInput[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(/[;,]/).map(v => v.trim().replace(/"/g, ""));

                if (values.length < headers.length) continue; // Skip malformed lines

                const lead: any = { pipeline_id: pipelineId };

                headers.forEach((header, index) => {
                    const value = values[index];
                    if (!value) return;

                    if (header === "name") lead.name = value;
                    else if (header === "email") lead.email = value;
                    else if (header === "phone") lead.phone = value;
                    else if (header === "company") lead.company = value;
                    else if (header === "deal_value") lead.deal_value = parseFloat(value.replace(",", "."));
                    else if (header === "origin") lead.origin = value;
                });

                if (lead.name) {
                    parsedLeads.push(lead);
                }
            }

            if (parsedLeads.length === 0) {
                throw new Error("Nenhum lead válido encontrado para importação.");
            }

            setPreviewData(parsedLeads);
        } catch (err) {
            console.error("CSV Parse Error:", err);
            setError(err instanceof Error ? err.message : "Erro ao processar arquivo CSV");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } finally {
            setIsParsing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!selectedStageId || previewData.length === 0) return;

        setIsImporting(true);
        try {
            const success = await importLeads(previewData, selectedStageId);
            if (success) {
                setSuccessCount(previewData.length);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    // Reset state
                    setFile(null);
                    setPreviewData([]);
                    setSuccessCount(null);
                }, 1500);
            } else {
                setError("Erro ao importar leads. Tente novamente.");
            }
        } catch (err) {
            setError("Erro inesperado na importação.");
        } finally {
            setIsImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-[#19069E]">Importar Leads via CSV</h3>
                        <p className="text-sm text-gray-500">Adicione múltiplos leads de uma vez à sua pipeline.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {successCount !== null ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-3xl">check</span>
                            </div>
                            <h4 className="text-2xl font-bold text-gray-800">Sucesso!</h4>
                            <p className="text-gray-600">{successCount} leads foram importados corretamente.</p>
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Download Template */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-blue-800 mb-1">1. Baixe o modelo CSV</h4>
                                    <p className="text-sm text-blue-600">Use nosso modelo padrão para garantir que os dados sejam lidos corretamente.</p>
                                </div>
                                <button
                                    onClick={downloadTemplate}
                                    className="px-4 py-2 bg-white text-blue-700 text-sm font-bold border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Baixar Modelo
                                </button>
                            </div>

                            {/* Step 2: Upload */}
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">2. Selecione o arquivo CSV</h4>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#19069E] hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">upload_file</span>
                                        <span className="font-bold text-gray-700">{file ? file.name : "Clique para selecionar o arquivo"}</span>
                                        <span className="text-xs text-gray-500 mt-1">Apenas arquivos .csv</span>
                                    </label>
                                </div>
                                {error && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">error</span>
                                        {error}
                                    </p>
                                )}
                            </div>

                            {/* Step 3: Destination Stage */}
                            {previewData.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">3. Escolha a etapa de destino</h4>
                                    <select
                                        value={selectedStageId}
                                        onChange={(e) => setSelectedStageId(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#19069E]/20 focus:border-[#19069E] bg-white"
                                    >
                                        {stages.map(stage => (
                                            <option key={stage.id} value={stage.id}>{stage.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Preview Table */}
                            {previewData.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-2">Pré-visualização ({previewData.length} leads)</h4>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-2">Nome</th>
                                                    <th className="px-4 py-2">Email</th>
                                                    <th className="px-4 py-2">Telefone</th>
                                                    <th className="px-4 py-2">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {previewData.slice(0, 5).map((lead, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{lead.name}</td>
                                                        <td className="px-4 py-2 text-gray-500">{lead.email || "-"}</td>
                                                        <td className="px-4 py-2 text-gray-500">{lead.phone || "-"}</td>
                                                        <td className="px-4 py-2 text-gray-500">
                                                            {lead.deal_value ? `R$ ${lead.deal_value}` : "-"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 5 && (
                                            <div className="bg-gray-50 px-4 py-2 text-xs text-center text-gray-500 border-t border-gray-200">
                                                ...e mais {previewData.length - 5} leads
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {successCount === null && (
                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={isImporting || !file || previewData.length === 0}
                            className="px-6 py-2.5 bg-[#19069E] text-white font-bold rounded-xl hover:bg-[#12047a] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                        >
                            {isImporting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                    Importar {previewData.length > 0 ? `${previewData.length} Leads` : ""}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
