const actions = {
    search: (query) => {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        chrome.tabs.update({ url: searchUrl });
    },

    navigate: (url) => {
        const finalUrl = url.startsWith("http") ? url : `https://${url}`;
        chrome.tabs.update({ url: finalUrl });
    },

    summarize_page: () => {
        console.log("Summarizing current page... (To be implemented)");
        // TODO: implement logic
    },

    ask_question: (question) => {
        console.log("Answering question about the page:", question);
        // TODO: implement logic
    }

    // need_context: () => {
    //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //         chrome.scripting.executeScript({
    //             target: { tabId: tabs[0].id },
    //             func: () => document.documentElement.outerHTML
    //         }, (results) => {
    //             const html = results[0].result;
    //             console.log("📄 Full page HTML:", html);
    //         });
    //     });
    // }
};

export function dataToAction(actionType, data) {
    const handler = actions[actionType];
    if (!handler) {
        console.warn(`Unknown action: "${actionType}"`);
        return;
    }

    try {
        handler(data);
    } catch (error) {
        console.error(`Failed to execute "${actionType}":`, error);
    }
}
