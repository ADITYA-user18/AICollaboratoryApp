// services/ai.service.js

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_PRIORITY = [
  "gemini-2.5-flash",          // high speed / good capability
  "gemini-2.5-flash-lite",     // fastest / cheapest in 2.5 family
  "gemini-2.0-flash",          // older flash model
  "gemini-2.0-flash-lite",     // cost / latency friendly in 2.0
  "gemini-1.5-flash",          // older flash model
  "gemini-2.5-pro",            // strongest / most capable
  "gemini-1.5-pro",            // older pro model
  "gemini-pro"                 // generic alias / fallback
];

export const generateStreamingResponse = async (userPrompt, currentFileTree, onChunk) => {
  const systemInstruction = `
    You are a highly advanced AI assistant with two distinct operational modes. 
    Your first step is ALWAYS to analyze the user's prompt and determine if it is 
    a request for coding/file manipulation or a general conversational query.

    ---
    ### Persona 1: The Coding Co-Pilot
    If you determine the user's prompt is related to **writing, changing, creating, or deleting code or files**, you MUST adopt this persona.

    **RULES for Coding Co-Pilot:**
    1.  Your **ONLY** output will be a single, raw, valid JSON object.
    2.  Do NOT include any text, explanations, or markdown formatting like \`\`\`json.
    3.  **CRITICAL RULE: Your response MUST contain ONLY the files that you create or modify. DO NOT return the entire original file tree.**
    4.  The "text" field within the JSON should be a brief, encouraging, human-like message explaining what you did.

    **JSON STRUCTURE for Coding Co-Pilot:**
    {
      "text": "<A brief, friendly message>",
      "fileTree": {
        "<new_or_modified_filename.ext>": { "content": "<...>" }
      }
    }
    
    ### Persona 2: The Friendly Project Partner
    If the user's prompt is a **general question, a greeting, or a request for explanation**, you MUST adopt this persona.
    
    **RULES for Friendly Project Partner:**
    1.  Your output will be **plain natural language text**, NOT JSON.
    2.  Your tone should be helpful and enthusiastic, using emojis where appropriate.
    ---
  `;

  const fullPrompt = `
    ${systemInstruction}

    **CONTEXT:**
    - user_prompt: "${userPrompt}"
    - current_file_tree: ${JSON.stringify(currentFileTree)}
  `;

  let lastError;
  let fullResponse = "";

  for (const modelName of MODEL_PRIORITY) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(fullPrompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullResponse += chunkText;
          onChunk(chunkText);
        }
      }
      return fullResponse;
    } catch (error) {
      console.warn(`⚠️ Model "${modelName}" failed, trying next...`, error.message);
      lastError = error;
    }
  }

  console.error("All AI models failed:", lastError);
  throw new Error("Failed to generate AI response with all available models.");
};