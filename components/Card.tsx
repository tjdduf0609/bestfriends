type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-border
        bg-surface
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}