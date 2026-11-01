import { describe, expect, it } from "vitest";
import { liveRole } from "@/lib/live-access";

const lecture = { instructorId: "tutor-1" };

describe("liveRole", () => {
  it("lets the assigned tutor publish", () => {
    expect(liveRole({ id: "tutor-1", role: "INSTRUCTOR" }, lecture)).toBe("host");
  });

  it("lets students and admins watch only", () => {
    expect(liveRole({ id: "student-1", role: "STUDENT" }, lecture)).toBe("viewer");
    expect(liveRole({ id: "admin-1", role: "ADMIN" }, lecture)).toBe("viewer");
    expect(liveRole({ id: "root-1", role: "SUPER_ADMIN" }, lecture)).toBe("viewer");
  });

  it("keeps other tutors out of a class they were not assigned", () => {
    expect(liveRole({ id: "tutor-2", role: "INSTRUCTOR" }, lecture)).toBe("denied");
  });

  it("does not treat an admin as the host unless they are the assigned tutor", () => {
    expect(liveRole({ id: "admin-1", role: "SUPER_ADMIN" }, { instructorId: null })).toBe("viewer");
  });
});
