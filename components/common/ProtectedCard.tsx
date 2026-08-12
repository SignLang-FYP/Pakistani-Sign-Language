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
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className="card-interactive"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg">{title}</h3>

        {completed && <span className="tag tag-accent">Completed</span>}
        {locked && <span className="tag">Locked</span>}
      </div>

      <p className="muted mt-1.5 text-[14.5px] leading-relaxed">{subtitle}</p>
    </button>
  );
}
