type PageHeaderProps = {
  emoji: string;
  title: string;
  description: string;
};

export default function PageHeader({ emoji, title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-text">
        {emoji} {title}
      </h1>

      <p className="mt-2 text-text-muted">{description}</p>
    </div>
  );
}