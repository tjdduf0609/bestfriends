type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full
        rounded-xl
        border
        border-border
        bg-surface
        p-4
        text-card-muted
        outline-none
        focus:ring-2
        focus:ring-primary-soft
        ${className}
      `}
      {...props}
    />
  );
}