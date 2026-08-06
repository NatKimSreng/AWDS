import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkText?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  href,
  linkText,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-gyg-navy tracking-tight">{title}</h2>
        {subtitle && <p className="text-gyg-muted mt-1.5 text-sm md:text-base">{subtitle}</p>}
      </div>
      {href && linkText && (
        <Link
          href={href}
          className="text-sm font-semibold text-gyg-navy hover:text-gyg-blue transition flex items-center gap-1 shrink-0"
        >
          {linkText} <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
