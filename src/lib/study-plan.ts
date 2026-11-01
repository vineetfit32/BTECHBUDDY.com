export interface PlannedDay {
  dayNumber: number;
  date: Date;
  title: string;
  description: string;
  tasks: string[];
}

export function buildPlan(subjectName: string, examDate: Date, totalUnits: number, today = new Date()): PlannedDay[] {
  const diffDays = Math.max(1, Math.ceil((examDate.getTime() - today.getTime()) / 86_400_000));
  const planDays = Math.min(diffDays, 14);
  return Array.from({ length: planDays }, (_, i) => {
    const day = i + 1;
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    let title: string;
    let tasks: string[];
    if (day <= totalUnits && day < planDays) {
      title = `Unit ${day} Intensive Study`;
      tasks = [
        `Read Unit ${day} comprehensive theory and lecture notes`,
        `Solve 3 high-frequency PYQs from Unit ${day}`,
        `Review formula summary and definitions`,
      ];
    } else if (day === planDays) {
      title = "Final Mock Test & Formula Memorization";
      tasks = ["Attempt full 3-hour previous year paper", "Formula speed test review", "Get restful sleep before exam day"];
    } else {
      title = "Comprehensive Revision & Speed Practice";
      tasks = ["Revise marked bookmarks from earlier units", "Practice 5-mark and 10-mark repeated exam questions"];
    }
    return { dayNumber: day, date, title, description: `Strategic preparation milestone for ${subjectName}`, tasks };
  });
}
