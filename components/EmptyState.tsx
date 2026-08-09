import { LucideIcon, Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
};

export default function EmptyState({ icon: Icon = Inbox, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <Icon className="mx-auto h-10 w-10 text-primary" strokeWidth={1.5} />
      <h3 className="mt-4 font-bold text-card-muted">{title}</h3>
      {description && <p className="mt-2 text-sm text-card-muted">{description}</p>}
    </div>
  );
}