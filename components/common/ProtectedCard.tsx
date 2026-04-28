type ProtectedCardProps = {
  title: string;
  subtitle: string;
  locked?: boolean;
  completed?: boolean;
  onClick: () => void;
};

export default function ProtectedCard({
  title,
  subtitle,
  locked = false,
  completed = false,
  onClick,
}: ProtectedCardProps) {
  return (
    <div
      onClick={() => {
        if (!locked) onClick();
      }}
      className={`rounded-2xl p-6 text-white shadow-xl transition ${
        locked
          ? "cursor-not-allowed bg-white/30"
          : "cursor-pointer hover:scale-[1.02]"
      }`}
      style={
        !locked
          ? {
              background: `linear-gradient(to bottom right, var(--theme-from), var(--theme-via))`,
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{title}</h3>
        <span className="text-sm font-semibold">
          {completed ? "✓" : locked ? "🔒" : ""}
        </span>
      </div>

      <p className="mt-2 text-white/90">{subtitle}</p>
    </div>
  );
}