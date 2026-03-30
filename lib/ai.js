const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParseJSON(raw, fallback) {
  try {
    const cleaned = (raw || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const ob = cleaned.indexOf("{");
    const ab = cleaned.indexOf("[");

    let start = -1, end = -1;

    if (ob !== -1 && (ab === -1 || ob < ab)) {
      start = ob;
      end = cleaned.lastIndexOf("}") + 1;
    } else if (ab !== -1) {
      start = ab;
      end = cleaned.lastIndexOf("]") + 1;
    }

    if (start === -1 || end <= start) return fallback;

    const parsed = JSON.parse(cleaned.slice(start, end));
    if (!parsed || typeof parsed !== "object") return fallback;

    return parsed;
  } catch (e) {
    return fallback;
  }
}

async function runPrompt(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: 1500,
  });

  const text = response.choices?.[0]?.message?.content || "";
  return safeParseJSON(text, null);
}

module.exports = { runPrompt, safeParseJSON };
