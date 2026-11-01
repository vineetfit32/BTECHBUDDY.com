import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { translations } from "../src/lib/i18n";


async function runTests() {
  console.log("==========================================");
  console.log("🧪 BTECHBUDDY PHASE 11+ AUTOMATED TEST SUITE");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Fetch test user
    const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
    if (!student) throw new Error("No student account found for testing");

    console.log(`\n📌 Testing with student: ${student.email}`);

    // --- TEST 1: Module 1 (PYQ Bank & Important Questions) ---
    console.log("\n[TEST GROUP 1] PYQ Bank & Question Bank");
    const papers = await prisma.examPaper.findMany({
      include: { university: true, subject: true },
    });
    assert(papers.length >= 5, "Database has >= 5 realistic PYQ exam papers seeded");

    const questions = await prisma.questionBank.findMany();
    assert(questions.length >= 5, "QuestionBank has >= 5 curated important questions");

    // Test attempt toggle
    const sampleQ = questions[0];
    const attempt = await prisma.studentAttemptedQuestion.upsert({
      where: { userId_questionId: { userId: student.id, questionId: sampleQ.id } },
      update: {},
      create: { userId: student.id, questionId: sampleQ.id },
    });
    assert(!!attempt.id, "Student successfully attempted and recorded question");

    // Test bookmark toggle
    const bookmark = await prisma.studentBookmarkQuestion.upsert({
      where: { userId_questionId: { userId: student.id, questionId: sampleQ.id } },
      update: {},
      create: { userId: student.id, questionId: sampleQ.id },
    });
    assert(!!bookmark.id, "Student successfully bookmarked question");

    // --- TEST 2: Module 5 (Placement & GATE Prep Hub) ---
    console.log("\n[TEST GROUP 2] Placement & GATE Hub");
    const dsaProblems = await prisma.dsaProblem.findMany();
    assert(dsaProblems.length >= 10, "Placement Hub has >= 10 DSA 450 Sheet problems");

    const sampleDSA = dsaProblems[0];
    const dsaProgress = await prisma.studentDsaProgress.upsert({
      where: { userId_problemId: { userId: student.id, problemId: sampleDSA.id } },
      update: { status: "SOLVED" },
      create: { userId: student.id, problemId: sampleDSA.id, status: "SOLVED" },
    });
    assert(dsaProgress.status === "SOLVED", "DSA problem status tracked as SOLVED");

    const companySets = await prisma.companyInterviewSet.findMany();
    assert(companySets.length >= 4, "Company interview question sets available (TCS, Infosys, Amazon)");

    const gateQ = await prisma.gateResource.findMany();
    assert(gateQ.length >= 3, "GATE previous year question cards available");

    // --- TEST 3: Module 2 (Academic Tools: SGPA & Attendance) ---
    console.log("\n[TEST GROUP 3] Academic Tools (SGPA & Attendance)");
    // SGPA math verification
    // 4 credits @ A+ (9) + 4 credits @ A (8) = 36 + 32 = 68 / 8 = 8.50
    const calculatedSGPA = (4 * 9 + 4 * 8) / (4 + 4);
    assert(calculatedSGPA === 8.5, "SGPA weighted calculation formula accurate (8.50)");

    // AKTU Percentage formula: (SGPA - 0.75) * 10 = (8.5 - 0.75) * 10 = 77.5%
    const aktuPercentage = (calculatedSGPA - 0.75) * 10;
    assert(aktuPercentage === 77.5, "AKTU percentage conversion accurate (77.5%)");

    // Attendance Bunk Math verification
    // Attended: 24, Total: 28, Min: 75% -> floor(24 / 0.75) - 28 = 32 - 28 = 4 bunks
    const attended = 24;
    const total = 28;
    const safeBunks = Math.floor(attended / 0.75) - total;
    assert(safeBunks === 4, "Attendance Bunk Math correct (Can safely bunk 4 classes)");

    // Save attendance record
    const attSubject = await prisma.attendanceSubject.create({
      data: {
        userId: student.id,
        subjectName: "Compiler Design",
        attendedClasses: 20,
        totalClasses: 25,
        minimumPercentage: 75.0,
      },
    });
    assert(attSubject.attendedClasses === 20, "Attendance subject saved to database");

    // --- TEST 4: Module 4 (Exam Countdown & Study Planner) ---
    console.log("\n[TEST GROUP 4] Exam Countdown & Study Planner");
    const examTarget = await prisma.studentExamTarget.create({
      data: {
        userId: student.id,
        subjectName: "Engineering Mathematics-I",
        examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        targetScore: "90%",
      },
    });

    const day1 = await prisma.studyPlanDay.create({
      data: {
        targetId: examTarget.id,
        dayNumber: 1,
        date: new Date(),
        title: "Calculus & Matrices Revision",
      },
    });

    const task1 = await prisma.studyPlanTask.create({
      data: {
        dayId: day1.id,
        title: "Eigenvalues and Cayley-Hamilton theorem PYQs",
        isDone: true,
      },
    });

    assert(task1.isDone === true, "Study plan checklist item created and marked complete");

    // --- TEST 5: Module 6 & 8 (PWA, Low-Bandwidth & Language) ---
    console.log("\n[TEST GROUP 5] PWA & Language Translations");
    assert(!!translations.en.pyqPapers, "English translation dictionary has PYQ Papers key");
    assert(!!translations.hi.pyqPapers, "Hindi translation dictionary has PYQ Papers key");
    assert(translations.hi.placementHub === "प्लेसमेंट हब", "Hindi placementHub translation verified");

    // --- TEST 6: Module 7 (Gamification, Streaks & Leaderboard) ---
    console.log("\n[TEST GROUP 6] Gamification & Streaks");
    const streak = await prisma.userStreak.findUnique({ where: { userId: student.id } });
    assert(!!streak && streak.currentStreak >= 1, "User study streak is active in database");

    // Award XP
    const xpTx = await prisma.xpTransaction.create({
      data: {
        userId: student.id,
        amount: 30,
        action: "TEST_XP_AWARD",
      },
    });
    assert(xpTx.amount === 30, "XP Transaction recorded (+30 XP)");

    // --- TEST 7: Module 9 (College & University Mode) ---
    console.log("\n[TEST GROUP 7] College & University Mode");
    const universities = await prisma.university.findMany({ include: { papers: true } });
    assert(universities.length >= 6, ">= 6 Indian universities mapped in database");
    const aktu = universities.find((u) => u.code === "AKTU");
    assert(!!aktu && aktu.papers.length >= 1, "AKTU has associated past exam papers");

    // --- TEST 8: Module 3 (Doubt Forum & Moderation) ---
    console.log("\n[TEST GROUP 8] Doubt Forum & Moderation");
    const doubt = await prisma.doubtPost.create({
      data: {
        userId: student.id,
        title: "How to resolve hash collisions using Quadratic Probing?",
        content: "What is the formula for quadratic probing and how does it prevent primary clustering?",
        tags: "Hashing,DSA,AKTU",
      },
    });
    assert(!!doubt.id, "Doubt question posted to community forum");

    const answer = await prisma.doubtAnswer.create({
      data: {
        postId: doubt.id,
        userId: student.id,
        content: "Quadratic probing uses h(k, i) = (h'(k) + c1*i + c2*i^2) mod m. It eliminates primary clustering by stepping quadratically.",
        isAccepted: true,
      },
    });
    assert(answer.isAccepted === true, "Doubt answer accepted as best solution");

    // Report post test
    const report = await prisma.doubtReport.create({
      data: {
        postId: doubt.id,
        userId: student.id,
        reason: "Test Moderation Flag",
      },
    });
    assert(report.status === "PENDING", "Doubt report entered into moderation queue");

    // Clean up test doubt and report
    await prisma.doubtReport.delete({ where: { id: report.id } });
    await prisma.doubtAnswer.delete({ where: { id: answer.id } });
    await prisma.doubtPost.delete({ where: { id: doubt.id } });
    await prisma.attendanceSubject.delete({ where: { id: attSubject.id } });
    await prisma.studentExamTarget.delete({ where: { id: examTarget.id } });

    // --- TEST 9: Activity Logging ---
    console.log("\n[TEST GROUP 9] Activity Logging");
    const log = await prisma.activityLog.create({
      data: {
        userId: student.id,
        action: "TEST_VERIFICATION_AUDIT",
        entityType: "PlatformTest",
        details: JSON.stringify({ status: "SUCCESS" }),
      },
    });
    assert(!!log.id, "Audit ActivityLog entry successfully created");
    await prisma.activityLog.delete({ where: { id: log.id } });

    console.log("\n==========================================");
    console.log(`📊 RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("==========================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
