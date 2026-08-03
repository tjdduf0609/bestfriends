type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={`
        h-32
        w-full
        resize-none
        rounded-xl
        border
        border-gray-200
        bg-white
        p-4
        outline-none
        focus:ring-2
        focus:ring-gray-200
        ${className}
      `}
      {...props}
    />
  );
}