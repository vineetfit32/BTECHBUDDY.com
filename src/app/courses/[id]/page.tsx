import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  BookOpen,
  Clock,
  CheckCircle,
  Video,
  FileText,
  User,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      instructor: true,
      subject: true,
      branch: true,
      videos: { where: { isPublished: true }, orderBy: { order: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    notFound();
  }

  let isEnrolled = false;
  if (user && course) {
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = Boolean(enrollment);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Courses
        </Link>
      </div>

      {/* Hero Course Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {course.level} Level
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {course.durationHours} Hours Total
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.description}
            </p>

            {course.instructor && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {course.instructor.name[0]}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Course Instructor</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {course.instructor.name}
                  </div>
                  <div className="text-[11px] text-slate-500">{course.instructor.college}</div>
                </div>
              </div>
            )}
          </div>

          {/* Curriculum breakdown */}
          <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-500" />
              Course Lectures & Curriculum ({course.videos.length} Lectures)
            </h2>

            <div className="space-y-2">
              {course.videos.map((vid, idx) => (
                <div
                  key={vid.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{vid.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>{vid.duration}</span>
                    <Link
                      href={`/videos/${vid.id}`}
                      className="px-3 py-1 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Watch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrollment Side Box */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-700/80 shadow-xl space-y-6 sticky top-24">
            <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={course.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {course.price === 0 ? "Free Enrollment" : `₹${course.price}`}
              </div>
              <span className="text-xs text-slate-400">{course._count.enrollments} Students</span>
            </div>

            {isEnrolled ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-300">
                  <CheckCircle className="w-4 h-4" /> You are enrolled in this track
                </div>
                <Link
                  href="/student/dashboard"
                  className="block w-full text-center py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
                >
                  Go to Student Dashboard →
                </Link>
              </div>
            ) : (
              <Link
                href="/register"
                className="block w-full text-center py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Enroll in Track Free
              </Link>
            )}

            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Full lifetime access
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Downloadable unit revision notes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Solved previous exam papers
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Placement coding interview tests
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
