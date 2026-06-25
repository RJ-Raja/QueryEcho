export const generateSQL = async (naturalLanguagePrompt, dbEngine, schema) => {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("Groq API key is missing. Please add it to your .env file.");
    }

    // 1. UPDATED SYSTEM PROMPT: Demanding a strict JSON response
    const systemPrompt = `You are an expert SQL developer. 
    Generate a highly optimized, strict ${dbEngine} compatible SQL query based on the user's request.
    
    Here is the database schema you must use: 
    ${JSON.stringify(schema)}
    
    Rules:
    1. You MUST respond ONLY with a valid JSON object. Do not include markdown (like \`\`\`json).
    2. The JSON object must have exactly two keys: "query" and "explanation".
    3. "query" must contain ONLY the valid SQL code, with no markdown styling.
    4. "explanation" must be a concise, 1-2 sentence explanation of what the query does.
    5. Only use the tables and columns provided in the schema.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', 
            response_format: { type: "json_object" }, // Forces Llama 3 to output raw JSON
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: naturalLanguagePrompt }
            ],
            temperature: 0.1, 
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content.trim();
    
    // 2. PARSE AND RETURN: We parse the AI's string into a real JavaScript object
    try {
        const parsedResponse = JSON.parse(rawContent);
        return parsedResponse; // Returns { query: "...", explanation: "..." }
    } catch (e) {
        console.error("AI returned malformed JSON:", rawContent);
        throw new Error("AI failed to format response correctly. Please try again.");
    }
};