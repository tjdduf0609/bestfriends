type EmptyStateProps = {
  emoji?: string;
  title: string;
  description?: string;
};

export default function EmptyState({ emoji = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <div className="text-4xl">{emoji}</div>

      <h3 className="mt-4 font-bold text-text">{title}</h3>

      {description && <p className="mt-2 text-sm text-text-muted">{description}</p>}
    </div>
  );
}