type PageHeaderProps = {
  emoji: string;
  title: string;
  description: string;
};

export default function PageHeader({ emoji, title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-card-muted">
        {emoji} {title}
      </h1>

      <p className="mt-2 text-card-muted">{description}</p>
    </div>
  );
}