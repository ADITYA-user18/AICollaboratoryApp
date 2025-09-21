// controllers/codeController.js
import { compileCode } from "../services/codeservice.js";

export const runCode = async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body; // use 'language' not 'language_id'
    const result = await compileCode(source_code, language, stdin);
    res.json(result);
  } catch (err) {
    console.error("runCode error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
