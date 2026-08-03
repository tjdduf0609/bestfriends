type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full
        rounded-xl
        py-4
        font-bold
        transition
        active:scale-[0.98]

        ${
          variant === "primary"
            ? "bg-black text-white"
            : "border border-gray-200 bg-white"
        }
      `}
    >
      {children}
    </button>
  );
}