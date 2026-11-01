import React from "react";
import Link from "next/link";
import { BookOpen, FileText, ArrowRight, Layers, HelpCircle } from "lucide-react";
import Badge from "./Badge";

interface SubjectCardProps {
  id: string;
  name: string;
  code: string;
  branchName?: string;
  semesterNumber?: number;
  credits?: number;
  unitsCount?: number;
  notesCount?: number;
  className?: string;
}

export default function SubjectCard({
  id,
  name,
  code,
  branchName,
  semesterNumber,
  credits,
  unitsCount,
  notesCount,
  className = "",
}: SubjectCardProps) {
  return (
    <div
      className={`bento p-5 flex flex-col justify-between group hover:-translate-y-1 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="mono" size="sm">
            {code}
          </Badge>
          {credits && (
            <span className="text-[11px] font-mono text-ink-3 font-semibold">
              {credits} Credits
            </span>
          )}
        </div>

        <h3 className="font-bold text-base text-ink group-hover:text-primary-violet transition-colors line-clamp-2 mb-2">
          {name}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3 mb-4">
          {branchName && <span>{branchName}</span>}
          {semesterNumber && (
            <>
              <span>•</span>
              <span>Semester {semesterNumber}</span>
            </>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-line flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-ink-3">
          {unitsCount !== undefined && (
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-ink-3" />
              {unitsCount} Units
            </span>
          )}
          {notesCount !== undefined && (
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-ink-3" />
              {notesCount} Notes
            </span>
          )}
        </div>

        <Link
          href={`/subjects/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary-violet group-hover:translate-x-0.5 transition-transform"
        >
          Explore <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
