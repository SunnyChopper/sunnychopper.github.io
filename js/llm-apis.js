// Secret Keys: Will later be moved to a backend API

const OPENAI_GPT_4O = 'gpt-4o';
const OPENAI_GPT_4O_MINI = 'gpt-4o-mini';
const ANTHROPIC_CLAUDE_3_5_SONNET = 'claude-3-5-sonnet-20240620';
const GEMINI_1_5_PRO = 'gemini-1.5-pro';
const GEMINI_1_5_FLASH = 'gemini-1.5-flash';

const OPENAI_MODELS = [OPENAI_GPT_4O, OPENAI_GPT_4O_MINI];
const ANTHROPIC_MODELS = [ANTHROPIC_CLAUDE_3_5_SONNET];
const GEMINI_MODELS = [GEMINI_1_5_PRO, GEMINI_1_5_FLASH];

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
function getGeminiApiUrl(model) {
    const apiVersion = model === GEMINI_1_5_FLASH ? 'v1beta' : 'v1';
    return `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;
}

const MAX_OUTPUT_TOKENS = 4096;

/**
 * Calls the OpenAI API
 * @param {string} model - The model to use
 * @param {string} systemPrompt - The system prompt
 * @param {string} userPrompt - The user prompt
 * @param {boolean} jsonMode - Whether to return the response in JSON mode
 * @returns {Promise<Object>} - The response from the API
 */
async function callOpenAI(model, systemPrompt, userPrompt, jsonMode = false) {
    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            max_tokens: MAX_OUTPUT_TOKENS,
            response_format: jsonMode ? { type: 'json_object' } : { type: 'text' }
        })
    });
    
    const jsonResponse = await response.json();

    try {
        return jsonResponse.choices[0].message.content;
    } catch (error) {
        console.error('Error parsing OpenAI response:', error);
        return null;
    }
}

/**
 * Calls the Anthropic API
 * @param {string} model - The model to use
 * @param {string} systemPrompt - The system prompt
 * @param {string} userPrompt - The user prompt
 * @param {boolean} jsonMode - Whether to return the response in JSON mode
 * @returns {Promise<Object>} - The response from the API
 */
async function callAnthropic(model, systemPrompt, userPrompt, jsonMode = false) {
    try {
        const response = await fetch(ANTHROPIC_API_URL, {
            method: 'POST',
        headers: {
            'content-type': 'application/json',
            'anthropic-version': '2023-06-01',
            'x-api-key': ANTHROPIC_API_KEY,
            "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
            model,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            max_tokens: MAX_OUTPUT_TOKENS,
            // Note: Anthropic doesn't have a built-in JSON mode, so we add it to the system prompt
            ...(jsonMode && { system: systemPrompt + " Please respond in valid JSON format." })
        })
    });
        const jsonResponse = await response.json();
        return jsonResponse.content[0].text;
    } catch (error) {
        console.error('Error calling Anthropic API:', error);
        return null;
    }
}

/**
 * Calls the Google Gemini API
 * @param {string} model - The model to use
 * @param {string} systemPrompt - The system prompt
 * @param {string} userPrompt - The user prompt
 * @param {boolean} jsonMode - Whether to return the response in JSON mode
 * @returns {Promise<Object>} - The response from the API
 */
async function callGemini(model, systemPrompt, userPrompt, jsonMode = false) {
    let geminiResponse;
    try {
        geminiResponse = await fetch(getGeminiApiUrl(model), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: userPrompt }]
                }
            ],
            systemInstruction: {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            generationConfig: {
                temperature: 1,
                topK: 64,
                topP: 0.95,
                maxOutputTokens: MAX_OUTPUT_TOKENS,
                responseMimeType: jsonMode ? 'application/json' : 'text/plain'
            }
            })
        });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return null;
    }

    const jsonResponse = await geminiResponse.json();
    
    try {
        return jsonResponse.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return null;
    }
}