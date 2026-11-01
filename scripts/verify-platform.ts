import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";


async function runTests() {
  console.log("=========================================");
  console.log("🧪 BTECHBUDDY AUTOMATED VERIFICATION SUITE");
  console.log("=========================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Database Connectivity & Core Taxonomy
  const branchCount = await prisma.branch.count();
  assert(branchCount >= 8, `Branch taxonomy seeded (Found ${branchCount} branches)`);

  const yearCount = await prisma.academicYear.count();
  assert(yearCount === 4, `All 4 B.Tech academic years present (Found ${yearCount})`);

  const semCount = await prisma.semester.count();
  assert(semCount === 8, `All 8 B.Tech semesters present (Found ${semCount})`);

  const subjectCount = await prisma.subject.count();
  assert(subjectCount >= 10, `Academic subjects present (Found ${subjectCount} subjects)`);

  // 2. Authentication & Role Permissions
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminUser = adminEmail
    ? await prisma.user.findUnique({ where: { email: adminEmail } })
    : await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  assert(adminUser !== null, "Super Admin user exists");
  assert(adminUser?.role === "SUPER_ADMIN", "Super Admin role correctly configured");

  const studentUser = await prisma.user.findUnique({ where: { email: "student@btechbuddy.in" } });
  assert(studentUser !== null, "Demo Student user exists");
  assert(studentUser?.role === "STUDENT", "Student role correctly configured");

  // Verify password hash
  if (adminUser) {
    if (process.env.ADMIN_PASSWORD) {
      const isMatch = await bcrypt.compare(process.env.ADMIN_PASSWORD, adminUser.passwordHash);
      assert(isMatch, "Admin password matches ADMIN_PASSWORD");
    }
  }

  // 3. Notes & PDF Management
  const notesCount = await prisma.note.count();
  assert(notesCount >= 5, `Study notes present (Found ${notesCount} notes)`);

  const sampleNote = await prisma.note.findFirst();
  assert(sampleNote !== null && sampleNote.fileUrl.endsWith(".pdf"), "Notes file URL points to PDF document");

  // 4. Video Lectures & Progress Tracking
  const videoCount = await prisma.videoLecture.count();
  assert(videoCount >= 4, `Recorded video lectures present (Found ${videoCount} videos)`);

  const progressCount = await prisma.videoProgress.count();
  assert(progressCount >= 1, `Video watch progress tracking works (Found ${progressCount} records)`);

  // 5. Live Classes Scheduling
  const liveCount = await prisma.liveClass.count();
  assert(liveCount >= 2, `Live interactive classes present (Found ${liveCount} classes)`);

  // 6. Online Quizzes & Server-side Scoring Security
  const quiz = await prisma.quiz.findFirst({
    include: { questions: { include: { options: true } } },
  });
  assert(quiz !== null, "Practice quiz exists");
  assert(quiz!.questions.length >= 5, `Quiz questions populated (${quiz?.questions.length} questions)`);

  // Verify that questions have correct answers flagged in DB
  const q1 = quiz!.questions[0];
  const hasCorrect = q1.options.some((o) => o.isCorrect);
  assert(hasCorrect, "Quiz question options contain verified answer flags");

  console.log("\n=========================================");
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log("=========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
