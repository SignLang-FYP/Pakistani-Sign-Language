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
    <Link
      href={href}
      className="rounded-2xl p-6 text-white shadow-xl transition hover:scale-[1.02]"
      style={{
        background:
          "linear-gradient(to bottom right, var(--theme-from), var(--theme-via))",
      }}
    >
      <div className="mb-4 text-4xl">
        <Icon />
      </div>

      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-2 text-white/90">{subtitle}</p>
    </Link>
  );
}