export const APP_NAME = "BTECHBUDDY";
export const APP_TAGLINE = "Your Engineering Journey, Simplified.";

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const BRANCHES_DEF = [
  { code: "CSE", name: "Computer Science & Engineering", icon: "Code", color: "from-blue-600 to-brand" },
  { code: "IT", name: "Information Technology", icon: "Cpu", color: "from-accent to-blue-600" },
  { code: "AIML", name: "Artificial Intelligence & ML", icon: "Bot", color: "from-brand to-brand" },
  { code: "DS", name: "Data Science", icon: "BarChart3", color: "from-brand to-brand" },
  { code: "ECE", name: "Electronics & Communication", icon: "Radio", color: "from-ok to-teal-600" },
  { code: "EE", name: "Electrical Engineering", icon: "Zap", color: "from-warn to-warn" },
  { code: "ME", name: "Mechanical Engineering", icon: "Cog", color: "from-orange-600 to-danger" },
  { code: "CE", name: "Civil Engineering", icon: "Building2", color: "from-stone-600 to-zinc-600" },
];

export const ACADEMIC_YEARS = [
  { year: 1, title: "1st Year", subtitle: "Common Engineering Foundation", sems: [1, 2] },
  { year: 2, title: "2nd Year", subtitle: "Core Department Fundamentals", sems: [3, 4] },
  { year: 3, title: "3rd Year", subtitle: "Advanced Specialization & Placements", sems: [5, 6] },
  { year: 4, title: "4th Year", subtitle: "Industry Projects, Electives & GATE", sems: [7, 8] },
];
