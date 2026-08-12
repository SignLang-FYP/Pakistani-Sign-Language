"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  FaBookOpen,
  FaClipboardCheck,
  FaUserCog,
  FaChartLine,
  FaVideo,
  FaGamepad,
  FaBrain,
  FaPalette,
  FaGithub,
  FaLinkedin,
  FaGlobe,
  FaEnvelope,
  FaGraduationCap,
  FaUniversity,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import { auth } from "@/lib/firebase";
import AuthGuard from "@/components/common/AuthGuard";
import FeatureCard from "@/components/home/FeatureCard";
import TeamCard, { type TeamMember } from "@/components/home/TeamCard";

const features = [
  {
    title: "Learning",
    subtitle: "Practise PSL lessons step by step.",
    href: "/learning",
    icon: FaBookOpen,
  },
  {
    title: "Evaluation",
    subtitle: "Test your performance with AI feedback.",
    href: "/evaluation",
    icon: FaClipboardCheck,
  },
  {
    title: "Progress",
    subtitle: "Track completed lessons and tests.",
    href: "/progress",
    icon: FaChartLine,
  },
  {
    title: "Video Tutorials",
    subtitle: "Short lessons for different sign categories.",
    href: "/tutorials",
    icon: FaVideo,
  },
  {
    title: "Runway",
    subtitle: "An endless flash-card game with score tracking.",
    href: "/runway",
    icon: FaGamepad,
  },
  {
    title: "Cognitive Analysis",
    subtitle: "Insights from gameplay and learning performance.",
    href: "/cognitive-analysis",
    icon: FaBrain,
  },
  {
    title: "Colour Theory",
    subtitle: "Choose a comfortable accent for the interface.",
    href: "/color-theory",
    icon: FaPalette,
  },
  {
    title: "Profile",
    subtitle: "Manage your account information.",
    href: "/profile",
    icon: FaUserCog,
  },
] satisfies {
  title: string;
  subtitle: string;
  href: string;
  icon: IconType;
}[];

const teamMembers: TeamMember[] = [
  {
    name: "Uzair Ahmad",
    role: "Project Lead",
    image: "/images/team/uzair.png",
    links: [
      { label: "Website", href: "https://uzairahmad.vercel.app", icon: FaGlobe },
      {
        label: "GitHub",
        href: "https://github.com/uzairtheahmad",
        icon: FaGithub,
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/in/uzairtheahmad",
        icon: FaLinkedin,
      },
      { label: "Email", href: "mailto:uzairkbrr@gmail.com", icon: FaEnvelope },
    ],
  },
  {
    name: "Saad Kabeer",
    role: "Project Developer",
    image: "/images/team/member1.png",
    links: [
      { label: "GitHub", href: "https://github.com/saadkabeer", icon: FaGithub },
      {
        label: "Email",
        href: "mailto:syedsaadkabeer@gmail.com",
        icon: FaEnvelope,
      },
    ],
  },
  {
    name: "Sanaullah",
    role: "Project Developer",
    image: "/images/team/member2.png",
    links: [
      {
        label: "Website",
        href: "https://sanaullah04.github.io/",
        icon: FaGlobe,
      },
      {
        label: "GitHub",
        href: "https://github.com/SanaUllah04",
        icon: FaGithub,
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/in/sanaullah-cs",
        icon: FaLinkedin,
      },
      {
        label: "Email",
        href: "mailto:sanaullahofficial04@gmail.com",
        icon: FaEnvelope,
      },
    ],
  },
  {
    name: "Dr. Muhammad Amin",
    role: "Project Supervisor",
    image: "/images/team/supervisor.jpg",
    links: [
      {
        label: "Faculty Profile",
        href: "https://pwr.nu.edu.pk/faculty-profile/?id=4564",
        icon: FaUniversity,
      },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com/citations?user=Eni7wG4AAAAJ&hl=en",
        icon: FaGraduationCap,
      },
      {
        label: "Email",
        href: "mailto:muhammad.amin@nu.edu.pk",
        icon: FaEnvelope,
      },
    ],
  },
];

export default function HomePage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
            <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
              SignLang
            </span>

            <button onClick={handleLogout} className="btn btn-sm">
              Log out
            </button>
          </div>

          <section className="pt-16">
            <p className="eyebrow">Pakistan Sign Language</p>
            <h1 className="page-title mt-3 max-w-2xl">
              Learn, practise and be understood.
            </h1>
            <p className="lede mt-4 max-w-xl">
              Structured lessons, real-time hand tracking and AI feedback —
              built to make PSL accessible to everyone.
            </p>
          </section>

          <section className="pt-14">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <FeatureCard key={feature.href} {...feature} />
              ))}
            </div>
          </section>

          <section className="pt-24">
            <p className="eyebrow">About</p>
            <h2 className="section-title mt-2">The project</h2>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <p className="lede">
                SignLang is an interactive platform designed to make Pakistan
                Sign Language accessible to everyone. Through structured
                lessons, AI-powered feedback and real-time evaluation, learners
                build fluency at their own pace. Developed as a Final Year
                Project.
              </p>

              <p className="lede">
                It was initiated in collaboration with the{" "}
                <span className="font-medium text-[var(--text)]">
                  Special Education Complex Hayatabad
                </span>
                , an institute supporting students with speech impairments,
                which provides a structured environment for developing
                communication skills through specialised teaching methods.
              </p>
            </div>
          </section>

          <section className="pt-24">
            <p className="eyebrow">Team</p>
            <h2 className="section-title mt-2">The people behind it</h2>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <TeamCard key={member.name} member={member} />
              ))}
            </div>
          </section>

          <footer className="mt-24 border-t border-[var(--border)] pt-8">
            <p className="faint text-[13px]">
              SignLang uses your camera to recognise signs. Video is processed
              on your device and never uploaded.{" "}
              <Link
                href="/privacy"
                className="font-medium text-[var(--text)] underline underline-offset-4"
              >
                Privacy &amp; data use
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}
