// llmTypes.ts
export type LLMStreamHandler = (
    prompt: string,
    apiKey: string,
    onChunk: (partial: string) => void,
    model?: string
) => Promise<void>;

export interface ProviderEntry {
    name: string;
    model: string;
    url: string;
    handler: (prompt: string, apiKey: string, model?: string) => Promise<string[]>;
    stream?: LLMStreamHandler; // optional streaming handler
}
