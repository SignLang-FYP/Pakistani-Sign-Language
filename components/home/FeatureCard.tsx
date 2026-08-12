import Link from "next/link";
import { IconType } from "react-icons";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  href: string;
  icon: IconType;
};

export default function FeatureCard({
  title,
  subtitle,
  href,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <Link href={href} className="card-interactive group">
      <div
        className="text-xl text-[var(--accent)]"
        aria-hidden="true"
      >
        <Icon />
      </div>

      <h3 className="mt-4 text-lg">{title}</h3>
      <p className="muted mt-1.5 text-[14.5px] leading-relaxed">{subtitle}</p>
    </Link>
  );
}
