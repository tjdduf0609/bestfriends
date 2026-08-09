type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        h-32
        w-full
        resize-none
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