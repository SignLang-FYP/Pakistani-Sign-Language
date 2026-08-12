"use client";

import { useRouter } from "next/navigation";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  backHref = "/home",
  actions,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-[var(--border)] pb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="muted text-[13px] font-medium hover:text-[var(--text)]"
          >
            ← Back
          </button>

          {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}

          <h1 className="page-title mt-2">{title}</h1>

          {description && (
            <p className="lede mt-3 max-w-2xl">{description}</p>
          )}
        </div>

        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
    </header>
  );
}
