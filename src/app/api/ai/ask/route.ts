import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { enforceRateLimits, getClientIp } from "@/lib/rate-limit";
import { answerFromContext } from "@/lib/ai/local";
import { formatContext, retrieveChunks } from "@/lib/ai/retrieve";
import { text, parseJson, z } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const limited = enforceRateLimits([
      { key: `ai:${user?.id ?? getClientIp(req)}`, limit: user ? 30 : 8, windowMs: 10 * 60_000 },
    ]);
    if (limited) return limited;
    const parsed = await parseJson(req, z.object({ prompt: text(4000, "Question"), subjectId: z.string().max(64).optional() }));
    if (parsed.error) return parsed.error;
    const { prompt } = parsed.data;

    // RULE-BASED CONCEPT RETRIEVAL (Acts as high-precision fallback or augment)
    const lowerPrompt = prompt.toLowerCase();
    let instantConcept = null;

    if (lowerPrompt.includes("big o") || lowerPrompt.includes("asymptotic")) {
      instantConcept = {
        title: "Asymptotic Notations (Big O, Omega, Theta)",
        subject: "Data Structures & Algorithms (CS201)",
        unit: "Unit 1: Introduction & Complexity",
        explanation:
          "1. Big O (O): Represents the asymptotic upper bound. f(n) <= c * g(n) for all n >= n0. It denotes the worst-case time complexity.\n2. Big Omega (Ω): Represents the asymptotic lower bound. f(n) >= c * g(n) for all n >= n0. It denotes the best-case.\n3. Big Theta (Θ): Represents the tight bound. c1 * g(n) <= f(n) <= c2 * g(n) for all n >= n0.",
        pyqAppeared: "5 times in AKTU / RTU past papers (10 Marks).",
      };
    } else if (lowerPrompt.includes("deadlock") || lowerPrompt.includes("banker")) {
      instantConcept = {
        title: "Deadlocks & Coffman Conditions",
        subject: "Operating Systems (CS205)",
        unit: "Unit 3: Deadlock Avoidance",
        explanation:
          "A deadlock requires all 4 Coffman conditions simultaneously:\n1. Mutual Exclusion: At least one non-shareable resource.\n2. Hold and Wait: A process holds resources while requesting new ones.\n3. No Preemption: Resources cannot be forcibly taken.\n4. Circular Wait: P0 waits for P1, P1 waits for P2... Pn waits for P0.\nBanker's Algorithm uses Available, Max, Allocation, and Need matrices to verify safety.",
        pyqAppeared: "Repeated in 2024, 2023, 2022 end-term papers.",
      };
    } else if (lowerPrompt.includes("normal") || lowerPrompt.includes("bcnf") || lowerPrompt.includes("1nf")) {
      instantConcept = {
        title: "Database Normalization (1NF to BCNF)",
        subject: "Database Management Systems (CS301)",
        unit: "Unit 2: Relational Design & Normalization",
        explanation:
          "Normalization reduces redundancy and anomalies:\n- 1NF: Attribute values must be atomic (no multi-valued attributes).\n- 2NF: In 1NF + no partial dependency (non-prime attributes fully dependent on candidate key).\n- 3NF: In 2NF + no transitive dependency (X -> Y requires X is super key or Y is prime).\n- BCNF: Stricter 3NF where for every X -> Y, X MUST be a super key.",
        pyqAppeared: "6 times in past university papers (10 Marks).",
      };
    } else if (lowerPrompt.includes("tree") || lowerPrompt.includes("avl") || lowerPrompt.includes("rotation")) {
      instantConcept = {
        title: "AVL Tree & Self-Balancing Rotations",
        subject: "Data Structures & Algorithms (CS201)",
        unit: "Unit 3: Trees & Binary Search Trees",
        explanation:
          "Balance Factor = Height(Left Subtree) - Height(Right Subtree). Must be in {-1, 0, 1}.\nFour Rotations:\n1. LL Rotation: Right rotation at unbalanced node.\n2. RR Rotation: Left rotation at unbalanced node.\n3. LR Rotation: Left rotate left child, then Right rotate node.\n4. RL Rotation: Right rotate right child, then Left rotate node.",
        pyqAppeared: "4 times in past university papers (10 Marks).",
      };
    }

    const chunks = await retrieveChunks(prompt).catch((error) => {
      console.error("Retrieval failed:", error);
      return [];
    });
    const cached = instantConcept
      ? `${instantConcept.title}\n${instantConcept.subject} • ${instantConcept.unit}\n${instantConcept.explanation}`
      : "";
    const answer = await answerFromContext(prompt, [cached, formatContext(chunks)].filter(Boolean).join("\n\n"));

    return NextResponse.json({
      configured: Boolean(answer),
      provider: "local",
      answer: answer ?? instantConcept?.explanation ?? null,
      instantAnswer: instantConcept,
      sources: chunks.map((chunk) => ({ title: chunk.title, url: chunk.url })),
      message: answer
        ? undefined
        : "The local model is offline. Showing matches from BTECHBUDDY notes only. Start Ollama with docker compose --profile ai up -d.",
    });
  } catch (error) {
    console.error("Error in AI Copilot:", error);
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 });
  }
}
