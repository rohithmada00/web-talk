import { summarize, answerTheQuestion } from "./groqService.js";

const actions = {
    search: (query) => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        chrome.tabs.update({ url: searchUrl });
    },

    navigate: (url) => {
        const finalUrl = url.startsWith("http") ? url : `https://${url}`;
        chrome.tabs.update({ url: finalUrl });
    },

    summarize_page: async (summary) => {
        console.log("Summarizing current page... (To be implemented)");
        // update summary

        // fetch context and prompt llm 
        try {
            let context = await actions.fetch_page_html();
            const response = await summarize(context);

            if (!response) {
                summary = "Summary could not be fetched";
            } else {
                summary = response;
            }
        }
        catch (e) {
            summary = "Summary could not be fetched";
            console.log("summarize_page: ", e)
            
        }


        // TODO: update UI
        console.log("Page Summary", summary);

        return summary;

    },

    ask_question: async (question) => {
        console.log("Answering question about the page:", question);

        // fetch context and prompt llm 
        try {
            let pageHtml = await actions.fetch_page_html();
            var context = `Question: ${question}, Page HTML: ${pageHtml}`
            const response = await answerTheQuestion(context);

            if (!response) {
                question = "Answer could not be fetched";
            } else {
                question = response;
            }
        }
        catch (e) {
            question = "Cannot be answered"
            console.log("qa_error: ", e)
        }


        // TODO: update UI
        console.log("Answer", question);

        return question;

    },

    need_context: (request) => request,

    fetch_page_html: async () => {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs?.[0];
                if (!tab || !tab.id) {
                    reject("No active tab found.");
                    return;
                }

                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => document.body.innerText
                }, (results) => {
                    if (chrome.runtime.lastError) {
                        console.warn("Chrome script error:", chrome.runtime.lastError.message);
                        reject("Script injection failed.");
                    } else if (!results?.[0]?.result) {
                        reject("No result from injected script.");
                    } else {
                        resolve(results[0].result);
                    }
                });
            });
        });
    }

};

export async function dataToAction(actionType, data) {
    const handler = actions[actionType];
    if (!handler) {
        console.warn(`Unknown action: "${actionType}"`);
        return;
    }

    try {
        return await handler(data);
    } catch (error) {
        console.error(`Failed to execute "${actionType}":`, error);
    }
}
