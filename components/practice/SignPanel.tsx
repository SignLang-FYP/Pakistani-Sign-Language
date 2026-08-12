type SignPanelProps = {
  name: string;
  meaning?: string;
  imagePath?: string;
  /** Seconds remaining, for timed tests. */
  timeLeft?: number;
};

export default function SignPanel({
  name,
  meaning,
  imagePath,
  timeLeft,
}: SignPanelProps) {
  return (
    <section className="card">
      {imagePath && (
        <div className="h-72 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)]">
          <img
            src={imagePath}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <p className="eyebrow mt-6">Sign to perform</p>
      <h2 className="mt-2 text-3xl">{name}</h2>

      {meaning && <p className="lede mt-3">{meaning}</p>}

      {typeof timeLeft === "number" && (
        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <p className="stat-value tabular-nums">{timeLeft}s</p>
          <p className="stat-label">Time remaining</p>
        </div>
      )}
    </section>
  );
}
