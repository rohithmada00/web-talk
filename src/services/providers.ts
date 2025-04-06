import { ProviderEntry } from "./llmTypes";

export const providers: Record<string, ProviderEntry> = {
    chatgpt: {
        name: "chatgpt",
        model: "gpt-4",
        url: "https://api.openai.com/v1/chat/completions",
        handler: async (prompt, apiKey, model = "gpt-4") => {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                }),
            });

            const data = await res.json();
            return data.choices.map((c: any) => c.message.content);
        },

        stream: async (prompt, apiKey, onChunk, model = "gpt-4") => {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    stream: true,
                    temperature: 0.7,
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            if (!reader) throw new Error("Streaming not supported.");

            let full = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n").filter(line => line.trim() !== "");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const json = line.replace("data: ", "");
                        if (json === "[DONE]") break;

                        try {
                            const parsed = JSON.parse(json);
                            const token = parsed.choices?.[0]?.delta?.content;
                            if (token) {
                                full += token;
                                onChunk(token);
                            }
                        } catch (e) {
                            console.error("Failed to parse chunk:", line);
                        }
                    }
                }
            }
        }
    }
};
