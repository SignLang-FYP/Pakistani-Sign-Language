"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { FaBookOpen, FaClipboardCheck, FaUserCog, FaChartLine, FaVideo, FaGamepad, FaBrain, FaPalette } from "react-icons/fa";
import { auth } from "@/lib/firebase";
import SignLangBrand from "@/components/brand/SignLangBrand";
import AuthGuard from "@/components/common/AuthGuard";
import FeatureCard from "@/components/home/FeatureCard";
import { useAppTheme } from "@/components/theme/useAppTheme";

export default function HomePage() {
  const router = useRouter();
  const theme = useAppTheme();

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <AuthGuard>
<div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="rounded-xl bg-white px-6 py-3 font-bold text-[var(--theme-main)] shadow-md"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <SignLangBrand />

            <div className="mt-12 w-full">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <FeatureCard
                  title="Learning"
                  subtitle="Practice PSL lessons step by step."
                  href="/learning"
                  icon={FaBookOpen}
                />
                <FeatureCard
                  title="Evaluation"
                  subtitle="Test your PSL performance with AI feedback."
                  href="/evaluation"
                  icon={FaClipboardCheck}
                />
                <FeatureCard
                  title="Profile Management"
                  subtitle="Manage your account information."
                  href="/profile"
                  icon={FaUserCog}
                />
                <FeatureCard
                  title="Progress"
                  subtitle="Track completed lessons and tests."
                  href="/progress"
                  icon={FaChartLine}
                />

                <FeatureCard
                  title="Video Tutorials"
                  subtitle="Watch short lessons for different sign categories."
                  href="/tutorials"
                  icon={FaVideo}
                  />

                    <FeatureCard
                    title="Runway"
                    subtitle="Play an endless sign-learning game with flash cards and score tracking."
                    href="/runway"
                    icon={FaGamepad}
                  />

                  <FeatureCard
                    title="Cognitive Analysis"
                    subtitle="View dashboard insights from gameplay and learning performance."
                    href="/cognitive-analysis"
                    icon={FaBrain}
                  />

                  <FeatureCard
  title="Color Theory"
  subtitle="Choose a comfortable theme for the learning experience."
  href="/color-theory"
  icon={FaPalette}
/>
              </div>
            </div>

            <section className="mt-20 w-full rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
              <h2 className="text-center text-3xl font-bold text-white">
                About SignLang
              </h2>
              <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-8 text-white/95">
                This project was initiated in collaboration with the <b>"Special Education 
                Complex Hayatabad"</b>, an educational institute focused on supporting students 
                with speech impairments. The institute provides a structured learning environment 
                tailored to help students develop communication skills through 
                specialized teaching methods and assistive approaches.</p>
                <p className="mx-auto mt-6 max-w-4xl text-center text-lg leading-8 text-white/95">
                <b>"SignLang"</b> is an interactive web platform designed to make Pakistan
                Sign Language accessible to everyone. Through structured lessons,
                AI-powered feedback, and real-time evaluation, learners can build
                fluency in PSL at their own pace. Developed as a Final Year Project.
              </p>
            </section>

            <section className="mt-16 w-full rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md text-black">
              <h2 className="text-center text-3xl font-bold text-white">
                Meet the Team
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <img
                  src="/images/team/member1.png"
                  alt="Member 1"
                  className="h-40 w-40 rounded-full object-cover shadow-lg"
                  />
                  <h3 className="mt-4 text-2xl font-bold text-black">Saad Kabeer</h3>
                  <p className="mt-1 text-black/90">Project Developer</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <img
  src="/images/team/member2.png"
  alt="Member 2"
  className="h-40 w-40 rounded-full object-cover shadow-lg"
/>
                  <h3 className="mt-4 text-2xl font-bold text-black">Sanaullah</h3>
                  <p className="mt-1 text-black/90">Project Developer</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <img
  src="/images/team/supervisor.jpg"
  alt="Supervisor"
  className="h-40 w-40 rounded-full object-cover shadow-lg"
/>
                  <h3 className="mt-4 text-2xl font-bold text-black">Dr. Muhammad Amin</h3>
                  <p className="mt-1 text-black/90">Project Supervisor</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}