import { FileText, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "@/lib/manifest/types";

/** Premium PDF preview card — opens the document in a new tab. */
export default function PdfCard({
  item,
  className,
}: {
  item: MediaItem;
  className?: string;
}) {
  return (
    <a
      href={item.src}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-steel-400/25 bg-gradient-to-br from-surface-2 to-ink p-6 transition-colors duration-500 hover:border-champagne/50",
        className
      )}
      aria-label={`Open PDF: ${item.title}`}
    >
      <div className="flex items-start justify-between">
        <FileText className="h-7 w-7 text-champagne" aria-hidden />
        <ArrowUpRight className="h-5 w-5 text-haze/60 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-champagne" aria-hidden />
      </div>
      <div className="mt-10">
        <p className="font-display text-[0.6rem] uppercase tracking-[0.3em] text-haze/60">
          PDF Document
        </p>
        <p className="mt-2 font-display text-sm text-mist-300 line-clamp-2">
          {item.title}
        </p>
      </div>
    </a>
  );
}
