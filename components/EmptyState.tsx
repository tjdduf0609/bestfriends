type EmptyStateProps = {
  emoji?: string;
  title: string;
  description?: string;
};


export default function EmptyState({
  emoji = "📭",
  title,
  description,
}: EmptyStateProps) {

  return (
    <div
      className="
        rounded-xl
        border
        border-gray-200
        bg-white
        p-8
        text-center
      "
    >

      <div className="text-4xl">
        {emoji}
      </div>


      <h3 className="mt-4 font-bold">
        {title}
      </h3>


      {description && (
        <p className="mt-2 text-sm text-gray-500">
          {description}
        </p>
      )}

    </div>
  );
}