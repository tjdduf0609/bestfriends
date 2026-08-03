type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      className={`
        w-full
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