import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon: LucideIcon;
  title: string;
  body: string;
}

export default function TrustBadge({ icon: Icon, title, body }: TrustBadgeProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-gyg-bg border border-gyg-border flex items-center justify-center">
        <Icon className="w-4 h-4 text-gyg-navy" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gyg-text">{title}</p>
        <p className="text-xs text-gyg-muted">{body}</p>
      </div>
    </div>
  );
}
