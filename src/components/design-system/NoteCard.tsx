import React from "react";
import { FileText, Download, Eye, Sparkles } from "lucide-react";
import Badge from "./Badge";

interface NoteCardProps {
  id: string;
  title: string;
  subjectName?: string;
  subjectCode?: string;
  unitNumber?: number;
  fileSize?: string;
  downloadCount?: number;
  isPYQ?: boolean;
  yearPYQ?: string | null;
  onPreview?: () => void;
  onDownload?: () => void;
  downloadUrl?: string;
  className?: string;
}

export default function NoteCard({
  id,
  title,
  subjectName,
  subjectCode,
  unitNumber,
  fileSize = "1.5 MB",
  downloadCount = 0,
  isPYQ = false,
  yearPYQ,
  onPreview,
  onDownload,
  downloadUrl,
  className = "",
}: NoteCardProps) {
  return (
    <div
      className={`desk-card rounded-2xl p-5 flex flex-col justify-between group transition-all ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {subjectCode && (
              <Badge variant="mono" size="sm">
                {subjectCode}
              </Badge>
            )}
            {unitNumber && (
              <span className="text-[11px] font-semibold text-ink-3">
                Unit {unitNumber}
              </span>
            )}
          </div>

          {isPYQ ? (
            <Badge variant="warning" size="sm">
              PYQ {yearPYQ || ""}
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Verified PDF
            </Badge>
          )}
        </div>

        <h3 className="font-bold text-sm sm:text-base text-ink group-hover:text-primary-violet transition-colors line-clamp-2 mb-2">
          {title}
        </h3>

        {subjectName && (
          <p className="text-xs text-ink-3 truncate mb-4">
            {subjectName}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-line space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-3">
          <span>{fileSize}</span>
          <span>{downloadCount} downloads</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onPreview && (
            <button
              onClick={onPreview}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary-violet-subtle hover:bg-primary-violet/20 text-primary-violet font-bold text-xs transition"
            >
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          )}

          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          ) : (
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
