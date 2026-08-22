import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel rounded-2xl px-6 py-14 sm:py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-luxury-gold/10 text-luxury-gold flex items-center justify-center mx-auto mb-5">
        <Icon size={24} />
      </div>
      <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/45 text-sm font-light leading-relaxed max-w-sm mx-auto">
        {message}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
