async function callApi(prompt) {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ',
            },
            body: JSON.stringify({
                model: 'gemma2-9b-it',
                messages: [
                    { role: 'system', content: 'You are a helpful browser assistant.' },
                    { role: 'user', content: prompt }
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



export async function decideAction(transcript) {
    return callApi(decideActionPrompt(transcript));
}

export async function summarize(context) {
    return callApi(summarize_prompt(context));
}

export async function answerTheQuestion(context) {
    return callApi(qa_prompt(context));

}


// prompt function
function decideActionPrompt(user_transcript) {
    const prompt = `
            You are a browser assistant. Based on the user's command, decide what action to take and respond with an action and its associated data.

            The available actions are:
            1. "search" - Use this for general search action, return what to search in google to get an apt browse result.
            2. "navigate" - Use this to navigate to a website. Return a complete URL for that website".
            3. "summarize_page" - Use this to summarize the page. If you don't have the HTML/text content of the page yet, return this:
            {
            "action": "summarize_page",
            "data": "NEED_CONTEXT"
            }
            4. "ask_question" - If the user asks a question about the current page, and you know nothing about it, return this:
            {
            "action": "ask_question",
            "data": User question here
            }
            
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

function summarize_prompt(context) {
    const prompt = `
    You are a helpful assistant. Summarize the following webpage content clearly and concisely. Focus only on the meaningful information and ignore repetitive navigation links, ads, headers, or irrelevant data.
    Here is the content of the webpage:
    """ 
    ${context} 
    """
    Provide a short summary in under 100 words. 
    
    `

    return prompt;
}

function qa_prompt(context) {
    const prompt = `
    You are a browser assistant. Answer the question based on the content in the HTML provided. Be concise, clear and complete
    Here is the content of the webpage:
    """ 
    ${context} 
    """
    Provide the answer in under 100 words. 
    
    `

    return prompt;
}


// parse api response
function parseLLMResponse(raw) {
    try {
        const cleaned = raw
            .replace(/```json/i, "")
            .replace(/```/, "")
            .trim();

        // Only extract the first { ... } JSON block
        const jsonMatch = cleaned.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {return JSON.parse(jsonMatch[0]);}
        else{return raw}
    } catch (e) {
        console.error(" Failed to parse LLM response:", e);
        return null;
    }
}
