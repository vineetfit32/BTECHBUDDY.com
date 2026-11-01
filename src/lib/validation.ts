import { NextResponse } from "next/server";
import { z, type ZodType } from "zod";
import { validatePassword } from "./password-policy";

type ParseResult<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse };

function badRequest(issues: z.core.$ZodIssue[]) {
  return NextResponse.json(
    {
      error: issues[0]?.message ?? "Invalid request",
      issues: issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    },
    { status: 400 }
  );
}

export async function parseJson<T extends ZodType>(req: Request, schema: T): Promise<ParseResult<z.infer<T>>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { error: NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }) };
  }
  const result = schema.safeParse(raw);
  if (!result.success) return { error: badRequest(result.error.issues) };
  return { data: result.data };
}

/** Like parseJson, but an empty body is treated as `{}`. */
export async function parseOptionalJson<T extends ZodType>(req: Request, schema: T): Promise<ParseResult<z.infer<T>>> {
  const raw = await req.text();
  let value: unknown = {};
  if (raw.trim()) {
    try {
      value = JSON.parse(raw);
    } catch {
      return { error: NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }) };
    }
  }
  const result = schema.safeParse(value);
  if (!result.success) return { error: badRequest(result.error.issues) };
  return { data: result.data };
}

export function parseQuery<T extends ZodType>(req: Request, schema: T): ParseResult<z.infer<T>> {
  const params = Object.fromEntries(new URL(req.url).searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) return { error: badRequest(result.error.issues) };
  return { data: result.data };
}

export const id = z.string().trim().min(1, "Missing id").max(64);
export const optionalId = z.preprocess((v) => (v === "" || v === null ? undefined : v), id.optional());
export const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254));
export const password = z.string().superRefine((value, ctx) => {
  const problem = validatePassword(value);
  if (problem) ctx.addIssue({ code: "custom", message: problem });
});
export const text = (max: number, label = "Field") =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);
export const optionalText = (max: number) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().trim().max(max).optional());
export const optionalInt = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined ? undefined : v), z.coerce.number().int().min(min).max(max).optional());
/** Only files we host ourselves, never arbitrary external URLs. */
export const ownedFileUrl = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z
    .string()
    .max(600)
    .regex(/^\/(api\/files|sample-notes|placeholders|uploads)\/[A-Za-z0-9._\-/%]+$/, "Files must be uploaded to BTECHBUDDY")
    .optional()
);
export const boolish = z.preprocess((v) => (v === "true" ? true : v === "false" ? false : v), z.boolean());
export const pageQuery = {
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

export { z };
