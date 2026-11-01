import "dotenv/config";
import { prisma } from "../src/lib/prisma";


async function seedPhase11() {
  console.log("🚀 Starting Phase 11+ Seeding...");

  // 1. Universities
  const universitiesData = [
    {
      code: "AKTU",
      name: "Dr. A.P.J. Abdul Kalam Technical University",
      slug: "aktu",
      state: "Uttar Pradesh",
      website: "https://aktu.ac.in",
      isPopular: true,
    },
    {
      code: "RTU",
      name: "Rajasthan Technical University",
      slug: "rtu",
      state: "Rajasthan",
      website: "https://rtu.ac.in",
      isPopular: true,
    },
    {
      code: "VTU",
      name: "Visvesvaraya Technological University",
      slug: "vtu",
      state: "Karnataka",
      website: "https://vtu.ac.in",
      isPopular: true,
    },
    {
      code: "SPPU",
      name: "Savitribai Phule Pune University",
      slug: "sppu",
      state: "Maharashtra",
      website: "http://unipune.ac.in",
      isPopular: true,
    },
    {
      code: "GTU",
      name: "Gujarat Technological University",
      slug: "gtu",
      state: "Gujarat",
      website: "https://gtu.ac.in",
      isPopular: true,
    },
    {
      code: "MAKAUT",
      name: "Maulana Abul Kalam Azad University of Technology",
      slug: "makaut",
      state: "West Bengal",
      website: "https://makautwb.ac.in",
      isPopular: false,
    },
    {
      code: "JNTUH",
      name: "Jawaharlal Nehru Technological University Hyderabad",
      slug: "jntuh",
      state: "Telangana",
      website: "https://jntuh.ac.in",
      isPopular: true,
    },
    {
      code: "IPU",
      name: "Guru Gobind Singh Indraprastha University",
      slug: "ipu",
      state: "Delhi NCR",
      website: "http://ipu.ac.in",
      isPopular: true,
    },
  ];

  const universities: Record<string, any> = {};
  for (const u of universitiesData) {
    universities[u.code] = await prisma.university.upsert({
      where: { code: u.code },
      update: u,
      create: u,
    });
  }
  console.log(`✅ Seeded ${Object.keys(universities).length} Universities`);

  // Fetch subjects, branches, semesters from existing DB
  const subjects = await prisma.subject.findMany({ include: { units: true } });
  const branches = await prisma.branch.findMany();
  const semesters = await prisma.semester.findMany();

  const cseBranch = branches.find((b) => b.code === "CSE") || branches[0];
  const dsaSubject = subjects.find((s) => s.code === "CS201") || subjects[0];
  const osSubject = subjects.find((s) => s.code === "CS205") || subjects[1] || subjects[0];
  const dbmsSubject = subjects.find((s) => s.code === "CS301") || subjects[2] || subjects[0];
  const mathSubject = subjects.find((s) => s.code === "MA101") || subjects[3] || subjects[0];

  // 2. Exam Papers (PYQs)
  const papersData = [
    {
      universityId: universities["AKTU"].id,
      branchId: cseBranch.id,
      subjectId: dsaSubject.id,
      semesterId: dsaSubject.semesterId,
      examYear: "2024",
      examType: "END_TERM",
      title: "Data Structures & Algorithms End-Term Paper 2024 (AKTU)",
      pdfUrl: "/sample-notes/unit1-sample.pdf",
      fileSize: "1.9 MB",
      downloadCount: 342,
    },
    {
      universityId: universities["AKTU"].id,
      branchId: cseBranch.id,
      subjectId: dsaSubject.id,
      semesterId: dsaSubject.semesterId,
      examYear: "2023",
      examType: "END_TERM",
      title: "Data Structures & Algorithms End-Term Paper 2023 (AKTU)",
      pdfUrl: "/sample-notes/unit1-sample.pdf",
      fileSize: "1.7 MB",
      downloadCount: 512,
    },
    {
      universityId: universities["AKTU"].id,
      branchId: cseBranch.id,
      subjectId: dsaSubject.id,
      semesterId: dsaSubject.semesterId,
      examYear: "2022",
      examType: "END_TERM",
      title: "Data Structures & Algorithms End-Term Paper 2022 (AKTU)",
      pdfUrl: "/sample-notes/unit1-sample.pdf",
      fileSize: "2.1 MB",
      downloadCount: 680,
    },
    {
      universityId: universities["RTU"].id,
      branchId: cseBranch.id,
      subjectId: osSubject.id,
      semesterId: osSubject.semesterId,
      examYear: "2024",
      examType: "END_TERM",
      title: "Operating Systems Main Exam Paper 2024 (RTU)",
      pdfUrl: "/sample-notes/unit2-sample.pdf",
      fileSize: "1.5 MB",
      downloadCount: 220,
    },
    {
      universityId: universities["VTU"].id,
      branchId: cseBranch.id,
      subjectId: dbmsSubject.id,
      semesterId: dbmsSubject.semesterId,
      examYear: "2024",
      examType: "END_TERM",
      title: "Database Management Systems Semester Exam 2024 (VTU)",
      pdfUrl: "/sample-notes/unit3-sample.pdf",
      fileSize: "2.4 MB",
      downloadCount: 415,
    },
    {
      universityId: universities["AKTU"].id,
      branchId: cseBranch.id,
      subjectId: mathSubject.id,
      semesterId: mathSubject.semesterId,
      examYear: "2024",
      examType: "MID_TERM",
      title: "Engineering Mathematics-I Mid-Term Sessional 2024 (AKTU)",
      pdfUrl: "/sample-notes/unit4-sample.pdf",
      fileSize: "1.3 MB",
      downloadCount: 198,
    },
  ];

  const createdPapers = [];
  for (const p of papersData) {
    const paper = await prisma.examPaper.create({ data: p });
    createdPapers.push(paper);
  }
  console.log(`✅ Seeded ${createdPapers.length} PYQ Exam Papers`);

  // 3. Question Bank with Frequency & Importance
  const dsaUnits = dsaSubject.units;
  const unit1 = dsaUnits[0]?.id;
  const unit2 = dsaUnits[1]?.id || unit1;
  const unit3 = dsaUnits[2]?.id || unit1;

  const questionsData = [
    {
      paperId: createdPapers[0].id,
      subjectId: dsaSubject.id,
      unitId: unit1,
      topicTag: "Asymptotic Notation",
      questionText: "Define Big O, Omega, and Theta notations. Prove that 3n^2 + 5n + 7 is O(n^2).",
      marks: 10,
      difficulty: "EASY",
      frequencyCount: 5,
      isImportant: true,
      solutionText: "Big O represents upper bound: f(n) <= c * g(n) for n >= n0. For 3n^2 + 5n + 7 <= 3n^2 + 5n^2 + 7n^2 = 15n^2 for n >= 1. Hence c = 15, n0 = 1, proof holds.",
    },
    {
      paperId: createdPapers[0].id,
      subjectId: dsaSubject.id,
      unitId: unit1,
      topicTag: "Stack Applications",
      questionText: "Explain the algorithm to convert an Infix expression to Postfix using a Stack with a complete trace on (A + B) * (C - D).",
      marks: 10,
      difficulty: "MEDIUM",
      frequencyCount: 6,
      isImportant: true,
      solutionText: "1. Scan from left to right. 2. Operands go straight to output. 3. Operators pushed onto stack respecting precedence. 4. Parentheses handle scoping.",
    },
    {
      paperId: createdPapers[1].id,
      subjectId: dsaSubject.id,
      unitId: unit2,
      topicTag: "AVL Trees",
      questionText: "What is an AVL Tree? Explain LL, RR, LR, and RL rotations with diagrams and balance factor calculations.",
      marks: 10,
      difficulty: "HARD",
      frequencyCount: 4,
      isImportant: true,
      solutionText: "An AVL tree is a self-balancing binary search tree where the difference between heights of left and right subtrees (Balance Factor) cannot be more than 1 for all nodes.",
    },
    {
      paperId: createdPapers[1].id,
      subjectId: dsaSubject.id,
      unitId: unit2,
      topicTag: "Binary Search Tree",
      questionText: "Write recursive C/Java functions for Inorder, Preorder, and Postorder tree traversals and state their time complexity.",
      marks: 5,
      difficulty: "EASY",
      frequencyCount: 4,
      isImportant: true,
      solutionText: "Time complexity for all three traversals is O(N) where N is number of nodes, since each node is visited exactly once.",
    },
    {
      paperId: createdPapers[2].id,
      subjectId: dsaSubject.id,
      unitId: unit3,
      topicTag: "Graph Algorithms",
      questionText: "Differentiate between BFS and DFS. Write Dijkstra's algorithm for finding shortest paths in a weighted directed graph.",
      marks: 10,
      difficulty: "HARD",
      frequencyCount: 5,
      isImportant: true,
      solutionText: "BFS uses a Queue (FIFO) and visits level-by-level; DFS uses a Stack (LIFO) or recursion. Dijkstra's algorithm uses a greedy approach with priority queue in O((V + E) log V).",
    },
    {
      paperId: createdPapers[3].id,
      subjectId: osSubject.id,
      unitId: osSubject.units[0]?.id,
      topicTag: "Deadlock Prevention",
      questionText: "State the four necessary conditions for Deadlock. Explain Banker's Algorithm for deadlock avoidance with Safety algorithm steps.",
      marks: 10,
      difficulty: "HARD",
      frequencyCount: 5,
      isImportant: true,
      solutionText: "Four Coffman conditions: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. Banker's Algorithm tests for safety state using Available, Max, Allocation, and Need matrices.",
    },
    {
      paperId: createdPapers[4].id,
      subjectId: dbmsSubject.id,
      unitId: dbmsSubject.units[0]?.id,
      topicTag: "Normalization",
      questionText: "Explain 1NF, 2NF, 3NF, and BCNF with suitable relational examples and functional dependencies.",
      marks: 10,
      difficulty: "MEDIUM",
      frequencyCount: 6,
      isImportant: true,
      solutionText: "1NF: Atomic values. 2NF: 1NF + no partial dependency. 3NF: 2NF + no transitive dependency. BCNF: For every functional dependency X -> Y, X must be a super key.",
    },
  ];

  for (const q of questionsData) {
    await prisma.questionBank.create({ data: q });
  }
  console.log(`✅ Seeded ${questionsData.length} Important Questions in QuestionBank`);

  // 4. DSA 450 Sheet Problems
  const dsaProblemsData = [
    {
      title: "Two Sum",
      category: "Arrays",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/two-sum/",
      companies: "TCS,Infosys,Amazon,Google",
      order: 1,
      hints: "Use a Hash Map to store complement (target - num) with its index.",
    },
    {
      title: "Best Time to Buy and Sell Stock",
      category: "Arrays",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      companies: "TCS,Wipro,Amazon",
      order: 2,
      hints: "Track the minimum price seen so far and maximum profit achievable.",
    },
    {
      title: "Maximum Subarray (Kadane's Algorithm)",
      category: "Arrays",
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/maximum-subarray/",
      companies: "Microsoft,Amazon,TCS",
      order: 3,
      hints: "Maintain currentSum = max(num, currentSum + num) and maxSoFar.",
    },
    {
      title: "Merge Intervals",
      category: "Arrays",
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/merge-intervals/",
      companies: "Amazon,Google,Infosys",
      order: 4,
      hints: "Sort by start time. Check if current interval overlaps with previous.",
    },
    {
      title: "Reverse a Linked List",
      category: "Linked Lists",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/reverse-linked-list/",
      companies: "TCS,Cognizant,Amazon",
      order: 5,
      hints: "Iteratively update next, curr.next = prev, prev = curr, curr = next.",
    },
    {
      title: "Detect Cycle in a Linked List (Floyd's)",
      category: "Linked Lists",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/linked-list-cycle/",
      companies: "Microsoft,Amazon,Infosys",
      order: 6,
      hints: "Slow and fast pointers. If slow == fast, cycle exists.",
    },
    {
      title: "Valid Parentheses",
      category: "Strings",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/valid-parentheses/",
      companies: "TCS,Wipro,Infosys,Amazon",
      order: 7,
      hints: "Use a Stack. Push opening brackets; match on closing brackets.",
    },
    {
      title: "Longest Substring Without Repeating Characters",
      category: "Strings",
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      companies: "Amazon,Google,Microsoft",
      order: 8,
      hints: "Sliding window with two pointers and a character index map.",
    },
    {
      title: "Lowest Common Ancestor in Binary Tree",
      category: "Trees",
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
      companies: "Amazon,Microsoft,Infosys",
      order: 9,
      hints: "Recursive DFS: if root is p or q return root; check left and right subtrees.",
    },
    {
      title: "Climbing Stairs (Fibonacci DP)",
      category: "Dynamic Programming",
      difficulty: "EASY",
      leetcodeUrl: "https://leetcode.com/problems/climbing-stairs/",
      companies: "TCS,Wipro,Infosys",
      order: 10,
      hints: "dp[i] = dp[i-1] + dp[i-2]. Can optimize space to O(1).",
    },
    {
      title: "0/1 Knapsack Problem",
      category: "Dynamic Programming",
      difficulty: "MEDIUM",
      gfgUrl: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/",
      companies: "Amazon,Flipkart,TCS",
      order: 11,
      hints: "For each item: include or exclude. dp[w] = max(dp[w], val[i] + dp[w - wt[i]]).",
    },
    {
      title: "Number of Islands",
      category: "Graphs",
      difficulty: "MEDIUM",
      leetcodeUrl: "https://leetcode.com/problems/number-of-islands/",
      companies: "Amazon,Google,Microsoft",
      order: 12,
      hints: "Traverse 2D grid. When '1' found, trigger BFS/DFS to sink connected land.",
    },
  ];

  for (const p of dsaProblemsData) {
    await prisma.dsaProblem.create({ data: p });
  }
  console.log(`✅ Seeded ${dsaProblemsData.length} Placement DSA Sheet Problems`);

  // 5. Company Interview Sets
  const companySetsData = [
    {
      companyName: "TCS",
      roundType: "ONLINE_ASSESSMENT",
      role: "Ninja & Digital",
      year: "2024",
      question: "TCS NQT Coding Question: Find the sum of all elements in array which are divisible by both 3 and 5, excluding duplicate values.",
      answer: "Use an unordered_set (C++) or HashSet (Java) to eliminate duplicates. Loop and check if (num % 15 == 0). Sum matching values in O(N) time and O(N) space.",
      tags: "Arrays,Hashing,TCS NQT",
    },
    {
      companyName: "TCS",
      roundType: "TECHNICAL_INTERVIEW",
      role: "Digital",
      year: "2024",
      question: "Explain the difference between Overloading and Overriding in OOP with Java examples. Can we override a static method?",
      answer: "Overloading is compile-time polymorphism (same name, different arguments in same class). Overriding is run-time polymorphism (subclass overrides parent method with same signature). Static methods CANNOT be overridden because they are resolved at compile-time (method hiding).",
      tags: "Java,OOP,Polymorphism",
    },
    {
      companyName: "Infosys",
      roundType: "ONLINE_ASSESSMENT",
      role: "Specialist Programmer (SP)",
      year: "2024",
      question: "Given a graph of N nodes, find the minimum weight to connect all nodes (Minimum Spanning Tree) with K pre-built edges.",
      answer: "Kruskal's algorithm with Disjoint Set Union (DSU). Union the pre-built edges first without adding to total weight. Then sort remaining edges and apply greedy pick.",
      tags: "Graphs,DSU,Kruskal,Infosys SP",
    },
    {
      companyName: "Amazon",
      roundType: "TECHNICAL_INTERVIEW",
      role: "SDE-1",
      year: "2024",
      question: "Design an LRU (Least Recently Used) Cache with get(key) and put(key, value) operations both in O(1) time complexity.",
      answer: "Combine a Hash Map with a Doubly Linked List. The Hash Map provides O(1) key lookup pointing to DLL nodes. The DLL maintains recentness: head is most recently used, tail is least recently used.",
      tags: "Data Structures,Design,Amazon SDE",
    },
    {
      companyName: "Wipro",
      roundType: "ONLINE_ASSESSMENT",
      role: "Elite NTH",
      year: "2024",
      question: "Check whether two strings are anagrams of each other without sorting.",
      answer: "Use a frequency array of size 26. Increment frequency for characters in string 1, decrement for string 2. If all counts return 0, they are anagrams. Time: O(N), Space: O(1).",
      tags: "Strings,Hash Table,Wipro",
    },
  ];

  for (const c of companySetsData) {
    await prisma.companyInterviewSet.create({ data: c });
  }
  console.log(`✅ Seeded ${companySetsData.length} Company Interview Question Sets`);

  // 6. GATE Exam Resources
  const gateData = [
    {
      subjectId: dsaSubject.id,
      year: "2024",
      marks: 2,
      topic: "Algorithms & Time Complexity",
      question: "Consider the recurrence relation T(n) = 2T(n/2) + n log n with T(1) = 1. What is the asymptotic time complexity?",
      optionsJson: JSON.stringify(["O(n log n)", "O(n log^2 n)", "O(n^2)", "O(n)"]),
      answer: "O(n log^2 n)",
      explanation: "Using Master Theorem (Extended Case 2): a=2, b=2. f(n) = n log n. n^(log_b a) = n^1 = n. Since f(n) = Theta(n * log^1 n), T(n) = Theta(n * log^(k+1) n) = Theta(n log^2 n).",
    },
    {
      subjectId: osSubject.id,
      year: "2023",
      marks: 2,
      topic: "Virtual Memory & Paging",
      question: "A system uses 32-bit virtual addresses and 4 KB page size. If page table entries are 4 bytes each, what is the size of a single-level page table?",
      optionsJson: JSON.stringify(["1 MB", "4 MB", "8 MB", "16 MB"]),
      answer: "4 MB",
      explanation: "Number of pages = 2^32 / 2^12 = 2^20 pages. Size of page table = 2^20 * 4 bytes = 4 * 1024 * 1024 bytes = 4 MB.",
    },
    {
      subjectId: dbmsSubject.id,
      year: "2024",
      marks: 1,
      topic: "SQL & Relational Algebra",
      question: "Which of the following relational algebra operations is NOT commutative?",
      optionsJson: JSON.stringify(["Natural Join", "Cartesian Product", "Set Difference (-)", "Intersection"]),
      answer: "Set Difference (-)",
      explanation: "Set difference (R - S) is not equal to (S - R). Union, intersection, and joins are commutative.",
    },
  ];

  for (const g of gateData) {
    await prisma.gateResource.create({ data: g });
  }
  console.log(`✅ Seeded ${gateData.length} GATE Questions`);

  // 7. Initialize streaks for existing users
  const users = await prisma.user.findMany();
  for (const u of users) {
    await prisma.userStreak.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        currentStreak: 3,
        longestStreak: 5,
        freezesLeft: 2,
      },
    });

    // Seed sample badges
    await prisma.userBadge.upsert({
      where: { userId_badgeCode: { userId: u.id, badgeCode: "FIRST_STEP" } },
      update: {},
      create: {
        userId: u.id,
        badgeCode: "FIRST_STEP",
      },
    });
  }
  console.log(`✅ Initialized Streaks and Badges for ${users.length} users`);

  console.log("🎉 Phase 11+ Seeding Completed Successfully!");
}

seedPhase11()
  .catch((e) => {
    console.error("Error seeding Phase 11+:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
