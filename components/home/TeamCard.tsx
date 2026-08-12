import type { IconType } from "react-icons";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  links: { label: string; href: string; icon: IconType }[];
};

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="card flex h-full flex-col">
      <img
        src={member.image}
        alt={member.name}
        className="h-16 w-16 rounded-full border border-[var(--border)] object-cover"
      />

      <h3 className="mt-5 text-[17px] leading-snug">{member.name}</h3>
      <p className="muted mt-1 text-[13.5px]">{member.role}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {member.links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            aria-label={`${member.name} — ${link.label}`}
            className="icon-link"
          >
            <link.icon aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}
