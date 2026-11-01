export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_RULES = [
  { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (p: string) => p.length >= PASSWORD_MIN_LENGTH },
  { id: "letter", label: "Contains a letter", test: (p: string) => /[A-Za-z]/.test(p) },
  { id: "number", label: "Contains a number", test: (p: string) => /\d/.test(p) },
] as const;

const COMMON_PASSWORDS = new Set([
  "password1",
  "password123",
  "12345678a",
  "qwerty123",
  "abc12345",
  "btechbuddy1",
  "iloveyou1",
  "admin1234",
]);

export function validatePassword(password: string): string | null {
  if (typeof password !== "string") return "Password is required.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) return `Password must satisfy: ${rule.label.toLowerCase()}.`;
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return "This password is too common. Choose another.";
  return null;
}
