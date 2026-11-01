import fs from 'node:fs';
import path from 'node:path';

function createSimplePDF(title, subtitle, contentLines) {
  const textStreams = [
    'BT',
    '/F1 22 Tf',
    '50 740 Td',
    `(${title}) Tj`,
    '/F1 14 Tf',
    '0 -30 Td',
    `(${subtitle}) Tj`,
    '/F1 11 Tf',
    '0 -25 Td',
    '(------------------------------------------------------------------------------------------) Tj',
    '0 -20 Td',
  ];

  for (const line of contentLines) {
    const safeLine = line.replace(/[\(\)\\]/g, '');
    textStreams.push(`(${safeLine}) Tj`);
    textStreams.push('0 -18 Td');
  }

  textStreams.push('ET');
  const streamContent = textStreams.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${streamLength} >>
stream
${streamContent}
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000302 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

const dir = path.join(process.cwd(), 'public', 'sample-notes');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const files = [
  {
    name: 'dsa-complete-handwritten-notes.pdf',
    title: 'BTECHBUDDY - Data Structures & Algorithms',
    subtitle: 'Unit 1 to 5 Comprehensive Topper Handwritten Notes',
    lines: [
      'Subject: CS201 | Branch: CSE / IT / AIML | 3rd Semester',
      'Topics Covered:',
      '1. Asymptotic Notations: Big-O, Big-Omega, Big-Theta Definitions',
      '2. Linear Data Structures: Arrays, Singly/Doubly/Circular Linked Lists',
      '3. Stacks & Queues: Array implementation, Infix to Postfix conversion',
      '4. Trees: Binary Tree traversals (Inorder, Preorder, Postorder, Level-order)',
      '5. Balanced Trees: AVL Rotations (LL, RR, LR, RL) with balance factor',
      '6. Graphs: BFS, DFS, Dijkstra Shortest Path, Prim and Kruskal MST',
      '7. Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence (LCS)',
      '',
      'Key Exam Tips: Always state the base condition in recursive routines.',
      'BTECHBUDDY verified study resource. Visit https://btechbuddy.in for video lectures.',
    ],
  },
  {
    name: 'dsa-pyq-solved-papers.pdf',
    title: 'BTECHBUDDY - DSA Previous Year Solved Papers',
    subtitle: 'Semester Exam Solved Question Bank (2020 - 2024)',
    lines: [
      'University: AKTU, RTU, VTU, GGSIPU Standard Curriculum',
      'Section A: 2-Marks Short Answer Questions Solved',
      'Q1: Define Balance Factor of an AVL tree node. Ans: Height(Left) - Height(Right)',
      'Q2: Differentiate between Stack and Queue. Ans: LIFO vs FIFO principle.',
      'Section B: 7-Marks Long Answer Questions with Full Stepwise Derivation',
      'Q3: Construct AVL tree for keys: 10, 20, 30, 40, 50, 25 with rotational diagrams.',
      'Q4: Write iterative algorithm to reverse a singly linked list in O(n) time and O(1) space.',
      'Section C: 10-Marks Code Implementations and Complexities',
      'Q5: Trace Dijkstra Algorithm on a 6-node weighted graph step by step.',
      '',
      'Verified by University Gold Medalists. BTECHBUDDY Academic Team.',
    ],
  },
  {
    name: 'dbms-normalization-cheat-sheet.pdf',
    title: 'BTECHBUDDY - DBMS Normalization Cheat Sheet',
    subtitle: 'Rapid Revision Guide: Functional Dependencies to BCNF',
    lines: [
      'Subject: CS301 | Database Management Systems | 5th Semester',
      'Summary of Normal Forms:',
      '1. 1NF: Atomic values only. No repeating groups or multi-valued attributes.',
      '2. 2NF: Must be in 1NF + No Partial Dependency (All non-prime attributes fully dependent on candidate key).',
      '3. 3NF: Must be in 2NF + No Transitive Dependency (X -> Y where X is super key or Y is prime attribute).',
      '4. BCNF: Strictest form: For every functional dependency X -> Y, X MUST be a Super Key.',
      '',
      'Armstrongs Axioms: Reflexivity, Augmentation, Transitivity.',
      'Closure of Attribute Set: Algorithm to determine candidate keys in 30 seconds.',
      'ACID Properties: Atomicity, Consistency, Isolation, Durability with recovery logs.',
      '',
      'Created for BTECHBUDDY students. Free downloadable copy.',
    ],
  },
  {
    name: 'os-process-deadlocks-notes.pdf',
    title: 'BTECHBUDDY - Operating Systems Revision Notes',
    subtitle: 'Process Synchronization, Scheduling & Deadlocks',
    lines: [
      'Subject: CS204 | Operating Systems | 4th Semester',
      '1. CPU Scheduling: FCFS, SJF (Preemptive/Non-preemptive), Round Robin with Gantt charts.',
      '2. Critical Section Problem: Mutual Exclusion, Progress, Bounded Waiting conditions.',
      '3. Semaphores: Wait (P) and Signal (V) atomic primitives, Producer-Consumer problem.',
      '4. Deadlock 4 Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
      '5. Bankers Algorithm: Safety algorithm and Resource Request algorithm example with Need matrix.',
      '6. Memory Management: Paging, Page tables, TLB hit ratio calculation, Page Replacement (FIFO, LRU, Optimal).',
      '',
      'BTECHBUDDY High-Yield Engineering Notes.',
    ],
  },
  {
    name: 'maths1-solved-pyqs.pdf',
    title: 'BTECHBUDDY - Engineering Mathematics - I',
    subtitle: 'Solved University Examination Papers',
    lines: [
      'Subject: MA101 | 1st Year Common to All Engineering Branches',
      'Unit 1: Matrices - Rank of Matrix, Cayley-Hamilton Theorem, Eigenvalues & Eigenvectors.',
      'Unit 2: Differential Calculus - Successive differentiation, Leibnitz theorem, Maclaurin and Taylor series.',
      'Unit 3: Multivariable Calculus - Partial derivatives, Euler theorem for homogeneous functions, Jacobians.',
      'Unit 4: Multiple Integrals - Double and Triple integrals, Change of order of integration, Beta and Gamma functions.',
      'Unit 5: Vector Calculus - Gradient, Divergence, Curl, Gauss Divergence Theorem, Stokes Theorem.',
      '',
      'Step-by-step solved questions with formulas highlighted for scoring 90%+ in semester exams.',
      'BTECHBUDDY: Your Engineering Journey, Simplified.',
    ],
  },
];

for (const file of files) {
  const filePath = path.join(dir, file.name);
  const pdfBuffer = createSimplePDF(file.title, file.subtitle, file.lines);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log(`Generated sample PDF: ${file.name}`);
}

console.log('All sample PDFs generated successfully!');
