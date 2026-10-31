import { hashPassword, signJWT, verifyJWT, verifyPassword } from "../src/lib/auth";

async function testAuth() {
  console.log("Testing Auth Engine...");
  const pwd = "TestPassword@123";
  const hash = await hashPassword(pwd);
  const isValid = await verifyPassword(pwd, hash);
  if (!isValid) throw new Error("Password verification failed");

  const token = await signJWT({ id: "user-123", email: "test@btechbuddy.in", role: "STUDENT", name: "Test Student" });
  const payload = await verifyJWT(token);
  if (!payload || payload.id !== "user-123") throw new Error("JWT token verification failed");

  console.log("✅ Auth Engine (bcryptjs + jose JWT) verified successfully!");
}

testAuth().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
