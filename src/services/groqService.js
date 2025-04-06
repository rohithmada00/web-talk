export async function decideAction(text) {
    console.log(text)

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer <GROQ_API_KEY_HERE>',
            },
            body: JSON.stringify({
                model: 'gemma2-9b-it',
                messages: [
                    { role: 'system', content: 'You are a helpful browser assistant.' },
                    { role: 'user', content: make_prompt(text) }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        const data = await response.json();

        // log the entire response data to check its structure
        console.log('API Response:', data);

        // check if the response contains choices and handle empty or invalid responses
        if (data.choices && data.choices.length > 0) {
            const action = data.choices[0].message.content.trim();

            try {
                return parseLLMResponse(action);
            } catch (e) {
                console.error("Failed to parse LLM response:", e);
            }
        } else {
            console.error('No choices returned from the API');
            //return { action: 'error', data: 'No valid response from OpenAI' };
            console.log('error')
        }

    } catch (error) {
        console.error('Error occurred during API call:', error);
        return { action: 'error', data: 'API request failed' };
    }
}


// prompt function

function make_prompt(user_transcript) {
    const prompt = `
            You are a browser assistant. Based on the user's command, decide what action to take and respond with an action and its associated data.

            The available actions are:
            1. "search" - Use this for general search action, return what to search in google to get an apt browse result.
            2. "navigate" - Use this to navigate to a website. Return a complete URL for that website".
            3. "summarize_page" - If the user asks to summarize the current webpage, such as "Summarize this page" or "What is this page about?".
            4. "ask_question" - If the user asks a specific question about the content of the page, such as "What is the title of this page?" or "What is this page about?".

            If the user's command does not clearly match any of the above actions, default to a "search" action using the most relevant keywords from the command.

            Here is the user's command: ${user_transcript}

            Reply with the action to perform in the following format:
            {
            "action": "action_name", 
            "data": "data_to_use"
            }
        `;

    return prompt;
}


// parse api response
function parseLLMResponse(raw) {
    try {
        // Remove Markdown code block markers
        const cleaned = raw
            .replace(/```json/i, '')  // remove starting ```json
            .replace(/```/, '')       // remove ending ```
            .trim();

        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (err) {
        console.error(" Failed to parse LLM response:", err);
        return null;
    }
}