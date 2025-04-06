import { providers } from "./providers";

async function streamResponse(
    providerName: string,
    prompt: string,
    apiKey: string,
    onChunk: (chunk: string) => void
) {
    const provider = providers[providerName];
    if (!provider?.stream) {
        throw new Error("Streaming not supported for this provider.");
    }
    await provider.stream(prompt, apiKey, onChunk);
}
