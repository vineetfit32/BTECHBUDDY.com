import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
  console.log("🌱 Seeding BTECHBUDDY database...");

  // 1. Password Hashes
  const adminHash = await bcrypt.hash("Admin@12345", 10);
  const studentHash = await bcrypt.hash("Student@12345", 10);
  const instructorHash = await bcrypt.hash("Instructor@12345", 10);

  // 2. Super Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@btechbuddy.in" },
    update: {},
    create: {
      name: "Admin BTechBuddy",
      email: "admin@btechbuddy.in",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      college: "BTechBuddy HQ",
      branch: "CSE",
    },
  });

  // 3. Demo Instructor
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@btechbuddy.in" },
    update: {},
    create: {
      name: "Prof. Rajesh Sharma",
      email: "instructor@btechbuddy.in",
      passwordHash: instructorHash,
      role: "INSTRUCTOR",
      college: "IIT Delhi Alum",
      branch: "CSE",
    },
  });

  // 4. Demo Student
  const student = await prisma.user.upsert({
    where: { email: "student@btechbuddy.in" },
    update: {},
    create: {
      name: "Aman Verma",
      email: "student@btechbuddy.in",
      passwordHash: studentHash,
      role: "STUDENT",
      college: "AKTU Affiliated Institute",
      branch: "CSE",
      semester: 3,
    },
  });

  console.log("✅ Users seeded:", { admin: admin.email, instructor: instructor.email, student: student.email });

  // 5. Academic Years
  const yearsData = [
    { yearNumber: 1, title: "1st Year", description: "Common Engineering Sciences, Maths & Basics of Programming", order: 1 },
    { yearNumber: 2, title: "2nd Year", description: "Core Departmental Concepts, Data Structures & System Foundations", order: 2 },
    { yearNumber: 3, title: "3rd Year", description: "Advanced Subjects, Networks, DBMS, System Design & Internship Prep", order: 3 },
    { yearNumber: 4, title: "4th Year", description: "Electives, AI, Cloud, Placements & Major Capstone Projects", order: 4 },
  ];

  const years: Record<number, any> = {};
  for (const y of yearsData) {
    years[y.yearNumber] = await prisma.academicYear.upsert({
      where: { yearNumber: y.yearNumber },
      update: y,
      create: y,
    });
  }

  // 6. Semesters (1 to 8)
  const semesters: Record<number, any> = {};
  for (let s = 1; s <= 8; s++) {
    const yearNumber = Math.ceil(s / 2);
    semesters[s] = await prisma.semester.upsert({
      where: { semesterNumber: s },
      update: { title: `Semester ${s}`, academicYearId: years[yearNumber].id },
      create: {
        semesterNumber: s,
        title: `Semester ${s}`,
        academicYearId: years[yearNumber].id,
      },
    });
  }

  // 7. Branches
  const branchesData = [
    { code: "CSE", name: "Computer Science & Engineering", slug: "computer-science-engineering", icon: "Code", description: "Software development, algorithms, system architecture and AI.", order: 1, isFeatured: true },
    { code: "IT", name: "Information Technology", slug: "information-technology", icon: "Cpu", description: "Information systems, networking, databases, and enterprise tech.", order: 2, isFeatured: true },
    { code: "AIML", name: "Artificial Intelligence & Machine Learning", slug: "ai-machine-learning", icon: "Bot", description: "Deep learning, neural networks, computer vision, and NLP.", order: 3, isFeatured: true },
    { code: "DS", name: "Data Science", slug: "data-science", icon: "BarChart3", description: "Big data analytics, statistics, predictive modeling, and business insights.", order: 4, isFeatured: true },
    { code: "ECE", name: "Electronics & Communication Engineering", slug: "electronics-communication", icon: "Radio", description: "Microprocessors, VLSI design, signal processing, and IoT.", order: 5, isFeatured: true },
    { code: "EE", name: "Electrical Engineering", slug: "electrical-engineering", icon: "Zap", description: "Power systems, electrical machines, control systems, and renewable energy.", order: 6, isFeatured: false },
    { code: "ME", name: "Mechanical Engineering", slug: "mechanical-engineering", icon: "Cog", description: "Thermodynamics, fluid mechanics, CAD/CAM, and robotics.", order: 7, isFeatured: false },
    { code: "CE", name: "Civil Engineering", slug: "civil-engineering", icon: "Building2", description: "Structural analysis, geotechnical engineering, construction tech.", order: 8, isFeatured: false },
  ];

  const branches: Record<string, any> = {};
  for (const b of branchesData) {
    branches[b.code] = await prisma.branch.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
  }

  // 8. Subjects
  const subjectsData = [
    // 1st Year (Common)
    { code: "MA101", name: "Engineering Mathematics - I", slug: "engineering-mathematics-1", credits: 4, semesterId: semesters[1].id, branchId: branches["CSE"].id, order: 1, isFeatured: true, syllabus: "Matrices, Differential Calculus, Vector Calculus, Multiple Integrals" },
    { code: "CS101", name: "Programming for Problem Solving (C)", slug: "programming-in-c", credits: 4, semesterId: semesters[1].id, branchId: branches["CSE"].id, order: 2, isFeatured: true, syllabus: "Variables, Conditionals, Loops, Arrays, Pointers, Structures, File I/O" },
    { code: "PH101", name: "Engineering Physics", slug: "engineering-physics", credits: 4, semesterId: semesters[1].id, branchId: branches["CSE"].id, order: 3, isFeatured: false, syllabus: "Quantum Mechanics, Wave Optics, Fiber Optics, Lasers, Nanomaterials" },
    
    // 2nd Year
    { code: "CS201", name: "Data Structures & Algorithms", slug: "data-structures-and-algorithms", credits: 4, semesterId: semesters[3].id, branchId: branches["CSE"].id, order: 1, isFeatured: true, syllabus: "Arrays, Linked Lists, Stacks, Queues, Trees, Graphs, Hashing, Dynamic Programming" },
    { code: "CS202", name: "Object Oriented Programming (Java/C++)", slug: "object-oriented-programming", credits: 4, semesterId: semesters[3].id, branchId: branches["CSE"].id, order: 2, isFeatured: true, syllabus: "Classes, Objects, Inheritance, Polymorphism, Encapsulation, Exception Handling, Collections" },
    { code: "CS204", name: "Operating Systems", slug: "operating-systems", credits: 4, semesterId: semesters[4].id, branchId: branches["CSE"].id, order: 1, isFeatured: true, syllabus: "Process Management, CPU Scheduling, Threads, Deadlocks, Memory Management, Virtual Memory, File Systems" },
    { code: "CS203", name: "Computer Organization & Architecture", slug: "computer-organization-architecture", credits: 4, semesterId: semesters[4].id, branchId: branches["CSE"].id, order: 2, isFeatured: false, syllabus: "Instruction Set, Pipelining, ALU Design, Cache Memory, Memory Hierarchy, Bus Architecture" },
    
    // 3rd Year
    { code: "CS301", name: "Database Management Systems (DBMS)", slug: "database-management-systems", credits: 4, semesterId: semesters[5].id, branchId: branches["CSE"].id, order: 1, isFeatured: true, syllabus: "ER Model, Relational Algebra, SQL, Normalization (1NF to BCNF), Transactions, Concurrency Control, Indexing" },
    { code: "CS302", name: "Computer Networks", slug: "computer-networks", credits: 4, semesterId: semesters[5].id, branchId: branches["CSE"].id, order: 2, isFeatured: true, syllabus: "OSI & TCP/IP Models, Physical Layer, Data Link Layer, Network Layer (IP/Routing), Transport Layer (TCP/UDP), Application Layer" },
    { code: "CS303", name: "Theory of Computation & Automata", slug: "theory-of-computation", credits: 4, semesterId: semesters[6].id, branchId: branches["CSE"].id, order: 1, isFeatured: false, syllabus: "DFA, NFA, Regular Expressions, Context-Free Grammars, Pushdown Automata, Turing Machines, Decidability" },
    { code: "CS304", name: "Design & Analysis of Algorithms", slug: "design-analysis-of-algorithms", credits: 4, semesterId: semesters[6].id, branchId: branches["CSE"].id, order: 2, isFeatured: true, syllabus: "Asymptotic Notation, Divide & Conquer, Greedy Algorithms, Dynamic Programming, Backtracking, Branch & Bound, NP-Completeness" },
    
    // 4th Year
    { code: "CS401", name: "Artificial Intelligence & Machine Learning", slug: "artificial-intelligence-machine-learning", credits: 4, semesterId: semesters[7].id, branchId: branches["CSE"].id, order: 1, isFeatured: true, syllabus: "Search Algorithms, Knowledge Representation, Supervised & Unsupervised Learning, Neural Networks, Deep Learning" },
    { code: "CS402", name: "Cloud Computing & DevOps", slug: "cloud-computing-devops", credits: 3, semesterId: semesters[7].id, branchId: branches["CSE"].id, order: 2, isFeatured: true, syllabus: "Virtualization, AWS/GCP, Docker, Kubernetes, CI/CD Pipelines, Infrastructure as Code" },
  ];

  const subjects: Record<string, any> = {};
  for (const s of subjectsData) {
    subjects[s.code] = await prisma.subject.upsert({
      where: { code: s.code },
      update: s,
      create: s,
    });
  }

  // 9. Syllabus Units for DSA (CS201)
  const dsaUnitsData = [
    { unitNumber: 1, title: "Unit 1: Arrays, Recursion & Linked Lists", description: "Asymptotic analysis, Singly & Doubly Linked Lists, Circular Lists, Two-pointer algorithms.", order: 1 },
    { unitNumber: 2, title: "Unit 2: Stacks, Queues & Deques", description: "Array & Linked List representation, Infix to Postfix conversion, Monotonic stacks, Circular queues.", order: 2 },
    { unitNumber: 3, title: "Unit 3: Trees, BST & Heap", description: "Binary Trees, Traversals (Pre, In, Post, Level), Binary Search Trees, AVL Trees, Min/Max Heap.", order: 3 },
    { unitNumber: 4, title: "Unit 4: Graphs & Shortest Path Algorithms", description: "Adjacency matrix & list, BFS, DFS, Dijkstra's algorithm, Bellman-Ford, Prim's and Kruskal's MST.", order: 4 },
    { unitNumber: 5, title: "Unit 5: Searching, Sorting & Dynamic Programming", description: "Quick Sort, Merge Sort, Binary Search, 0/1 Knapsack, Longest Common Subsequence.", order: 5 },
  ];

  const dsaUnits: any[] = [];
  for (const u of dsaUnitsData) {
    const createdUnit = await prisma.syllabusUnit.create({
      data: {
        ...u,
        subjectId: subjects["CS201"].id,
      },
    });
    dsaUnits.push(createdUnit);
  }

  // Units for DBMS (CS301)
  const dbmsUnitsData = [
    { unitNumber: 1, title: "Unit 1: Database Architecture & ER Model", description: "Three-schema architecture, Data independence, Entity-Relationship diagrams.", order: 1 },
    { unitNumber: 2, title: "Unit 2: Relational Model & SQL", description: "Relational algebra, DDL/DML, Complex joins, Subqueries, Views and Triggers.", order: 2 },
    { unitNumber: 3, title: "Unit 3: Normalization & Functional Dependencies", description: "1NF, 2NF, 3NF, BCNF, Lossless decomposition, Dependency preservation.", order: 3 },
    { unitNumber: 4, title: "Unit 4: Transactions & Concurrency Control", description: "ACID properties, Serializability, Two-Phase Locking (2PL), Deadlocks.", order: 4 },
    { unitNumber: 5, title: "Unit 5: Indexing & Storage Engine", description: "B-Trees, B+ Trees, Hashing techniques, Query optimization basics.", order: 5 },
  ];

  for (const u of dbmsUnitsData) {
    await prisma.syllabusUnit.create({
      data: {
        ...u,
        subjectId: subjects["CS301"].id,
      },
    });
  }

  // 10. Sample Notes (Handwritten & Topper style)
  const notesData = [
    {
      title: "Complete DSA Handwritten Notes (Unit 1 to 5)",
      description: "Comprehensive handwritten notes by university topper covering full Data Structures syllabus with diagrams and code examples.",
      fileUrl: "/sample-notes/dsa-complete-handwritten-notes.pdf",
      fileSize: "4.8 MB",
      fileType: "PDF",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[0].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[3].id,
      academicYearId: years[2].id,
      downloadCount: 1420,
      viewCount: 3890,
      isFeatured: true,
      isPYQ: false,
      tags: "DSA, Handwritten, Trees, Graphs, Topper Notes",
    },
    {
      title: "Data Structures Previous Year Question Papers (2020-2024)",
      description: "Solved previous year semester examination question papers with detailed marking schemes and model answers.",
      fileUrl: "/sample-notes/dsa-pyq-solved-papers.pdf",
      fileSize: "3.2 MB",
      fileType: "PDF",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[1].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[3].id,
      academicYearId: years[2].id,
      downloadCount: 980,
      viewCount: 2450,
      isFeatured: true,
      isPYQ: true,
      yearPYQ: "2023-24",
      tags: "PYQ, Solved Papers, Semester Exams, AKTU, RTU, VTU",
    },
    {
      title: "DBMS Master Formula & Normalization Cheat Sheet",
      description: "Quick revision formula sheet for Functional Dependencies, Normal Forms (1NF-BCNF) and SQL queries.",
      fileUrl: "/sample-notes/dbms-normalization-cheat-sheet.pdf",
      fileSize: "1.9 MB",
      fileType: "PDF",
      subjectId: subjects["CS301"].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[5].id,
      academicYearId: years[3].id,
      downloadCount: 860,
      viewCount: 2100,
      isFeatured: true,
      isPYQ: false,
      tags: "DBMS, Normalization, SQL, CheatSheet",
    },
    {
      title: "Operating Systems Process & Deadlock Rapid Revision",
      description: "Crisp notes for semester exam night preparation: CPU scheduling algorithms, Semaphore implementation, Banker's Algorithm.",
      fileUrl: "/sample-notes/os-process-deadlocks-notes.pdf",
      fileSize: "2.4 MB",
      fileType: "PDF",
      subjectId: subjects["CS204"].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[4].id,
      academicYearId: years[2].id,
      downloadCount: 1120,
      viewCount: 2750,
      isFeatured: false,
      isPYQ: false,
      tags: "OS, CPU Scheduling, Deadlocks, Banker Algorithm",
    },
    {
      title: "Engineering Mathematics - I Solved PYQs (All Units)",
      description: "Matrix Cayley-Hamilton theorem, Maxima-Minima, Taylor series and Double Integrals with stepwise solutions.",
      fileUrl: "/sample-notes/maths1-solved-pyqs.pdf",
      fileSize: "5.1 MB",
      fileType: "PDF",
      subjectId: subjects["MA101"].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[1].id,
      academicYearId: years[1].id,
      downloadCount: 2300,
      viewCount: 5600,
      isFeatured: true,
      isPYQ: true,
      yearPYQ: "2023-24",
      tags: "Maths, 1st Year, Solved PYQ, Matrices",
    },
  ];

  for (const n of notesData) {
    await prisma.note.create({ data: n });
  }

  // 11. Featured Course
  const course = await prisma.course.create({
    data: {
      title: "Complete B.Tech DSA & Placement Mastery 2026",
      slug: "complete-btech-dsa-mastery",
      description: "From basic C++/Java arrays to advanced Dynamic Programming, Graph algorithms, and LeetCode top 150 questions designed specifically for B.Tech semester exams and product company placements.",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      instructorId: instructor.id,
      branchId: branches["CSE"].id,
      semesterId: semesters[3].id,
      academicYearId: years[2].id,
      subjectId: subjects["CS201"].id,
      level: "Intermediate",
      durationHours: 48,
      price: 0,
      isPublished: true,
      isFeatured: true,
    },
  });

  // Enroll demo student in the course
  await prisma.courseEnrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      progressPercent: 42,
    },
  });

  // 12. Video Lectures
  const videosData = [
    {
      title: "Lec 01: Introduction to Data Structures & Space-Time Complexity",
      description: "Understanding Big O, Omega, Theta notations, best, average, and worst-case analysis with real code benchmarks.",
      videoUrl: "https://www.youtube.com/watch?v=RBSGKlAnoiM",
      videoProvider: "YOUTUBE",
      duration: "42:15",
      durationSec: 2535,
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[0].id,
      courseId: course.id,
      order: 1,
      isPublished: true,
      isFree: true,
    },
    {
      title: "Lec 02: Singly & Doubly Linked Lists Deep Dive",
      description: "Memory layout, node pointers, insertion at head/tail, reversal algorithm, detecting cycle using Floyd's Tortoise and Hare.",
      videoUrl: "https://www.youtube.com/watch?v=F8AbOfQwl1c",
      videoProvider: "YOUTUBE",
      duration: "55:30",
      durationSec: 3330,
      thumbnail: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[0].id,
      courseId: course.id,
      order: 2,
      isPublished: true,
      isFree: true,
    },
    {
      title: "Lec 03: Binary Search Trees & Balanced AVL Trees",
      description: "BST insertion, deletion with 3 cases, finding in-order predecessor, LL/RR/LR/RL rotations in AVL trees.",
      videoUrl: "https://www.youtube.com/watch?v=cySVml6e_Fc",
      videoProvider: "YOUTUBE",
      duration: "48:10",
      durationSec: 2890,
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[2].id,
      courseId: course.id,
      order: 3,
      isPublished: true,
      isFree: true,
    },
    {
      title: "Lec 04: Graph Traversals BFS & DFS Explained Visually",
      description: "Graph representation using adjacency lists, BFS queue mechanism, DFS recursion tree, cycle detection in directed graphs.",
      videoUrl: "https://www.youtube.com/watch?v=pcKY4hjDrxk",
      videoProvider: "YOUTUBE",
      duration: "60:00",
      durationSec: 3600,
      thumbnail: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop&q=80",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[3].id,
      courseId: course.id,
      order: 4,
      isPublished: true,
      isFree: true,
    },
  ];

  const createdVideos = [];
  for (const v of videosData) {
    const cv = await prisma.videoLecture.create({ data: v });
    createdVideos.push(cv);
  }

  // Record video progress for demo student
  await prisma.videoProgress.create({
    data: {
      userId: student.id,
      videoId: createdVideos[0].id,
      watchedSeconds: 2100,
      totalSeconds: 2535,
      isCompleted: true,
    },
  });

  // 13. Live Classes
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(18, 0, 0, 0); // 6:00 PM IST tomorrow

  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  dayAfter.setHours(19, 30, 0, 0); // 7:30 PM IST day after tomorrow

  await prisma.liveClass.create({
    data: {
      title: "Live Doubt Clearing: Graph Algorithms & Dynamic Programming",
      description: "Live interactive problem-solving session for B.Tech 2nd & 3rd Year students. We will code Dijkstra and 0/1 Knapsack live and solve previous year university exam questions.",
      instructorId: instructor.id,
      subjectId: subjects["CS201"].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[3].id,
      scheduledAt: tomorrow,
      durationMinutes: 90,
      meetingUrl: "https://meet.jit.si/BTechBuddy_DSA_LiveDoubt_Session",
      status: "SCHEDULED",
    },
  });

  await prisma.liveClass.create({
    data: {
      title: "DBMS Normalization Masterclass (1NF to BCNF in 60 Mins)",
      description: "Learn how to decompose any relation step-by-step and identify candidate keys in 30 seconds for university exams.",
      instructorId: instructor.id,
      subjectId: subjects["CS301"].id,
      branchId: branches["CSE"].id,
      semesterId: semesters[5].id,
      scheduledAt: dayAfter,
      durationMinutes: 60,
      meetingUrl: "https://meet.jit.si/BTechBuddy_DBMS_Masterclass",
      status: "SCHEDULED",
    },
  });

  // 14. Practice Quizzes
  const quiz = await prisma.quiz.create({
    data: {
      title: "DSA Diagnostic Test: Arrays, Stacks, Queues & Trees",
      description: "Test your fundamental understanding of linear and non-linear data structures. Negative marking of 0.25 marks applies for incorrect answers.",
      subjectId: subjects["CS201"].id,
      unitId: dsaUnits[0].id,
      durationMinutes: 15,
      totalMarks: 5,
      passingMarks: 3,
      negativeMarkingRate: 0.25,
      isPublished: true,
    },
  });

  const questionsData = [
    {
      questionText: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL Tree) with n nodes?",
      marks: 1,
      explanation: "In an AVL tree or balanced BST, the height is strictly bounded by O(log n). Therefore, search, insertion, and deletion all take O(log n) time in the worst case.",
      options: [
        { optionText: "O(1)", isCorrect: false },
        { optionText: "O(log n)", isCorrect: true },
        { optionText: "O(n)", isCorrect: false },
        { optionText: "O(n log n)", isCorrect: false },
      ],
    },
    {
      questionText: "Which data structure is primarily utilized in Breadth First Search (BFS) graph traversal?",
      marks: 1,
      explanation: "BFS explores vertices level by level, obeying First-In-First-Out (FIFO) discipline which is implemented using a Queue. DFS uses a Stack/Recursion.",
      options: [
        { optionText: "Stack", isCorrect: false },
        { optionText: "Queue", isCorrect: true },
        { optionText: "Priority Queue", isCorrect: false },
        { optionText: "Hash Map", isCorrect: false },
      ],
    },
    {
      questionText: "What is the minimum number of queues required to implement a Stack?",
      marks: 1,
      explanation: "To implement a LIFO Stack using FIFO Queues, we need a minimum of 2 queues (either making push costly or pop costly).",
      options: [
        { optionText: "1", isCorrect: false },
        { optionText: "2", isCorrect: true },
        { optionText: "3", isCorrect: false },
        { optionText: "Cannot be implemented", isCorrect: false },
      ],
    },
    {
      questionText: "Given a singly linked list with a pointer pointing to the head, what is the time complexity to insert a node at the very beginning of the list?",
      marks: 1,
      explanation: "Inserting at the head requires allocating a new node, setting its next pointer to head, and updating head. This requires constant time O(1).",
      options: [
        { optionText: "O(1)", isCorrect: true },
        { optionText: "O(n)", isCorrect: false },
        { optionText: "O(log n)", isCorrect: false },
        { optionText: "O(n²)", isCorrect: false },
      ],
    },
    {
      questionText: "Which of the following sorting algorithms is NOT an in-place sorting algorithm?",
      marks: 1,
      explanation: "Standard Merge Sort requires O(n) auxiliary space to merge two sorted subarrays. Quick Sort, Heap Sort, and Bubble Sort are in-place.",
      options: [
        { optionText: "Quick Sort", isCorrect: false },
        { optionText: "Merge Sort", isCorrect: true },
        { optionText: "Heap Sort", isCorrect: false },
        { optionText: "Insertion Sort", isCorrect: false },
      ],
    },
  ];

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const createdQ = await prisma.quizQuestion.create({
      data: {
        quizId: quiz.id,
        questionText: q.questionText,
        marks: q.marks,
        explanation: q.explanation,
        order: i + 1,
      },
    });

    for (const opt of q.options) {
      await prisma.quizOption.create({
        data: {
          questionId: createdQ.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        },
      });
    }
  }

  // 15. Announcements
  await prisma.announcement.create({
    data: {
      title: "🚀 Welcome to BTECHBUDDY: Your Engineering Journey, Simplified!",
      content: "We are thrilled to launch the all-new BTECHBUDDY platform for B.Tech students across India. Access verified university topper notes, curated video playlists, live classes, and practice tests designed for your semester exams and placement success.",
      type: "GENERAL",
      priority: "HIGH",
    },
  });

  await prisma.announcement.create({
    data: {
      title: "📢 Mid-Semester Examination PYQ Question Bank Released",
      content: "Complete solved previous 5-year question papers for 2nd and 3rd-year CSE/IT students are now available in the Notes & Study Materials section.",
      type: "EXAM",
      priority: "NORMAL",
      branchId: branches["CSE"].id,
    },
  });

  // 16. Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: "SITE_NAME" },
    update: { value: "BTECHBUDDY" },
    create: { key: "SITE_NAME", value: "BTECHBUDDY", description: "Main platform title" },
  });

  await prisma.platformSetting.upsert({
    where: { key: "TAGLINE" },
    update: { value: "Your Engineering Journey, Simplified." },
    create: { key: "TAGLINE", value: "Your Engineering Journey, Simplified.", description: "Platform Tagline" },
  });

  await prisma.platformSetting.upsert({
    where: { key: "CONTACT_EMAIL" },
    update: { value: "support@btechbuddy.in" },
    create: { key: "CONTACT_EMAIL", value: "support@btechbuddy.in", description: "Support contact email" },
  });

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
