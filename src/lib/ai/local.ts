import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { embed, generateText } from "ai";

const baseURL = () => process.env.LLM_BASE_URL ?? "http://127.0.0.1:11434/v1";

function provider() {
  return createOpenAICompatible({ name: "local", baseURL: baseURL() });
}

export function chatModelName() {
  return process.env.LLM_MODEL ?? "qwen3:8b";
}

export function embedModelName() {
  return process.env.EMBED_MODEL ?? "nomic-embed-text";
}

export async function embedText(value: string): Promise<number[] | null> {
  try {
    const result = await embed({
      model: provider().embeddingModel(embedModelName()),
      value,
    });
    return result.embedding;
  } catch (error) {
    console.warn("Local embedding model is unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

export async function answerFromContext(prompt: string, context: string): Promise<string | null> {
  try {
    const result = await generateText({
      model: provider().chatModel(chatModelName()),
      system:
        "You are Buddy, the BTECHBUDDY study partner for Indian B.Tech students. Answer only from the supplied notes and PYQs. If they do not cover the question, say so and give the closest syllabus point. Use short steps, formulas, and the subject unit when it is present. Do not invent citations.",
      prompt: `Notes and past papers:\n${context || "(none retrieved)"}\n\nStudent question:\n${prompt}`,
    });
    return result.text.trim() || null;
  } catch (error) {
    console.warn("Local chat model is unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}
