import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint to analyze expense claim
app.post("/api/check-claim", async (req, res) => {
  try {
    const { situation, policy } = req.body;
    if (!situation) {
      return res.status(400).json({ error: "Situation description is required." });
    }

    const ai = getAIClient();
    
    const systemInstruction = `You are ClaimCheck, a highly accurate and professional expense claim advisor for Malaysian employees. Your job is to analyze the company expense policy and the employee's situation, then provide an immediate, clear, and honest ruling.

Rules for your response:
- Absolutely NO emojis are allowed anywhere in your JSON response. Use clean, plain text and proper formatting.
- Always respond in JSON format with these exact fields: verdict, verdict_type, claimable_amount, explanation, policy_clause, documents_needed, pro_tip
- verdict_type must be exactly one of: "approved", "rejected", "partial", "unclear"
- verdict must be a short clean phrase corresponding to verdict_type WITHOUT any emojis:
  - approved -> "Yes, you can claim!"
  - rejected -> "Sorry, cannot claim"
  - partial -> "Partially claimable"
  - unclear -> "Need more info — check with HR"
- explanation must be 2-3 sentences in friendly Malaysian English — like a helpful colleague explaining it, not a lawyer. Can use casual phrases like "basically", "just make sure", "no worries". No emojis.
- policy_clause is the exact text from the policy that supports this ruling. If no direct clause, say "No specific clause found — recommend checking with HR"
- documents_needed is an array of strings representing files/receipts to submit.
- pro_tip is one practical, highly relevant tip in plain language.
- claimable_amount is a string like "Full amount", "Up to RM50", "50% of total", or "None"
- If the policy is empty or too vague, still give your best answer based on common Malaysian corporate practices and clearly state that the policy was not provided.
- Never use legal jargon. Never be harsh. If the answer is no, be polite and helpful.
- Respond ONLY with the raw JSON object. Do not wrap in markdown blocks, do not include any text before or after the JSON.`;

    const prompt = `Employee situation: ${situation}

Company expense policy: ${policy || "(No policy provided)"}

Please check if this expense is claimable based on the policy above.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1, // extremely low temperature for maximum speed, accuracy, and deterministic results
        maxOutputTokens: 600, // restricts unnecessary generation length to speed up API response
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              description: "A short clean phrase matching the verdict_type, e.g. 'Yes, you can claim!', 'Sorry, cannot claim', 'Partially claimable', or 'Need more info — check with HR'",
            },
            verdict_type: {
              type: Type.STRING,
              description: "Must be exactly one of: 'approved', 'rejected', 'partial', 'unclear'",
            },
            claimable_amount: {
              type: Type.STRING,
              description: "String describing the amount, e.g., 'Full amount', 'Up to RM50', '50% of total', 'None', etc.",
            },
            explanation: {
              type: Type.STRING,
              description: "2-3 sentences in friendly Malaysian English explaining the ruling.",
            },
            policy_clause: {
              type: Type.STRING,
              description: "The exact text or section of the policy, or 'No specific clause found — recommend checking with HR' if none exists.",
            },
            documents_needed: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of needed supporting documents, e.g. ['Receipt', 'Invoice', 'Email approval']",
            },
            pro_tip: {
              type: Type.STRING,
              description: "One practical tip relevant to this claim.",
            },
          },
          required: [
            "verdict",
            "verdict_type",
            "claimable_amount",
            "explanation",
            "policy_clause",
            "documents_needed",
            "pro_tip",
          ],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const parsed = JSON.parse(responseText.trim());
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in check-claim API:", error);
    return res.status(500).json({ error: error.message || "Something went wrong" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
