// services/codeService.js
import axios from "axios";

const JUDGE0_URL =
  "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// ✅ Add language map here
const languageMap = {
  cpp: 54,        // C++ (GCC 9.2.0)
  c: 50,          // C (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
  python: 71,     // Python (3.8.1)
  javascript: 63, // Node.js (12.14.0)
};

export const compileCode = async (source_code, language, stdin = "") => {
  try {
    const language_id = languageMap[language] || parseInt(language, 10);
    if (!language_id) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const res = await axios.post(
      JUDGE0_URL,
      { source_code, language_id, stdin },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
        },
      }
    );

    // 🔹 Forward full Judge0 response (status included)
    return res.data;
  } catch (err) {
    console.error("Judge0 API error:", err.response?.data || err.message);
    throw new Error("Error connecting to Judge0 API");
  }
};
