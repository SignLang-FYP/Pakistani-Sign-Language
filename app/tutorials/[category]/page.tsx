"use client";

import { useParams } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import PageHeader from "@/components/common/PageHeader";

const tutorialVideos: Record<
  string,
  { title: string; videoPath: string }[]
> = {
  english: [
    { title: "English Alphabet A", videoPath: "/videos/english/video1.mp4" },
    { title: "English Alphabet B", videoPath: "/videos/english/video2.mp4" },
    { title: "English Alphabet C", videoPath: "/videos/english/video3.mp4" },
    { title: "English Alphabet D", videoPath: "/videos/english/video4.mp4" },
    { title: "English Alphabet E", videoPath: "/videos/english/video5.mp4" },
    { title: "English Alphabet F", videoPath: "/videos/english/video6.mp4" },
    { title: "English Alphabet G", videoPath: "/videos/english/video7.mp4" },
    { title: "English Alphabet H", videoPath: "/videos/english/video8.mp4" },
    { title: "English Alphabet I", videoPath: "/videos/english/video9.mp4" },
    { title: "English Alphabet J", videoPath: "/videos/english/video10.mp4" },
    { title: "English Alphabet K", videoPath: "/videos/english/video11.mp4" },
    { title: "English Alphabet L", videoPath: "/videos/english/video12.mp4" },
    { title: "English Alphabet M", videoPath: "/videos/english/video13.mp4" },
    { title: "English Alphabet N", videoPath: "/videos/english/video14.mp4" },
    { title: "English Alphabet O", videoPath: "/videos/english/video15.mp4" },
    { title: "English Alphabet P", videoPath: "/videos/english/video16.mp4" },
    { title: "English Alphabet Q", videoPath: "/videos/english/video17.mp4" },
    { title: "English Alphabet R", videoPath: "/videos/english/video18.mp4" },
    { title: "English Alphabet S", videoPath: "/videos/english/video19.mp4" },
    { title: "English Alphabet T", videoPath: "/videos/english/video20.mp4" },
    { title: "English Alphabet U", videoPath: "/videos/english/video21.mp4" },
    { title: "English Alphabet V", videoPath: "/videos/english/video22.mp4" },
    { title: "English Alphabet W", videoPath: "/videos/english/video23.mp4" },
    { title: "English Alphabet X", videoPath: "/videos/english/video24.mp4" },
    { title: "English Alphabet Y", videoPath: "/videos/english/video25.mp4" },
    { title: "English Alphabet Z", videoPath: "/videos/english/video26.mp4" },

  ],
  urdu: [
    { title: "ا", videoPath: "/videos/urdu/video1.mp4" },
    { title: "ب", videoPath: "/videos/urdu/video2.mp4" },
    { title: "پ", videoPath: "/videos/urdu/video3.mp4" },
    { title: "ت", videoPath: "/videos/urdu/video4.mp4" },
    { title: "ث", videoPath: "/videos/urdu/video5.mp4" },
    { title: "ج", videoPath: "/videos/urdu/video6.mp4" },
    { title: "چ", videoPath: "/videos/urdu/video7.mp4" },
    { title: "ح", videoPath: "/videos/urdu/video8.mp4" },
    { title: "خ", videoPath: "/videos/urdu/video9.mp4" },
    { title: "د", videoPath: "/videos/urdu/video10.mp4" },
    { title: "ڈ", videoPath: "/videos/urdu/video11.mp4" },
    { title: "ذ", videoPath: "/videos/urdu/video12.mp4" },
    { title: "ر", videoPath: "/videos/urdu/video13.mp4" },
    { title: "ڑ", videoPath: "/videos/urdu/video14.mp4" },
    { title: "ز", videoPath: "/videos/urdu/video15.mp4" },
    { title: "ژ", videoPath: "/videos/urdu/video16.mp4" },
    { title: "س", videoPath: "/videos/urdu/video17.mp4" },
    { title: "ش", videoPath: "/videos/urdu/video18.mp4" },
    { title: "ص", videoPath: "/videos/urdu/video19.mp4" },
    { title: "ض", videoPath: "/videos/urdu/video20.mp4" },
    { title: "ط", videoPath: "/videos/urdu/video21.mp4" },
    { title: "ظ", videoPath: "/videos/urdu/video22.mp4" },
    { title: "ع", videoPath: "/videos/urdu/video23.mp4" },
    { title: "غ", videoPath: "/videos/urdu/video24.mp4" },
    { title: "ف", videoPath: "/videos/urdu/video25.mp4" },
    { title: "ق", videoPath: "/videos/urdu/video26.mp4" },
    { title: "ک", videoPath: "/videos/urdu/video27.mp4" },
    { title: "گ", videoPath: "/videos/urdu/video28.mp4" },
    { title: "ل", videoPath: "/videos/urdu/video29.mp4" },
    { title: "م", videoPath: "/videos/urdu/video30.mp4" },
    { title: "ن", videoPath: "/videos/urdu/video31.mp4" },
    { title: "و", videoPath: "/videos/urdu/video32.mp4" },
    { title: "ھ", videoPath: "/videos/urdu/video33.mp4" },
    { title: "ء", videoPath: "/videos/urdu/video34.mp4" },
    { title: "ی", videoPath: "/videos/urdu/video35.mp4" },
    { title: "ے", videoPath: "/videos/urdu/video36.mp4" },

  ],
  fruits: [
    { title: "Apricot", videoPath: "/videos/fruits/video1.mp4" },
    { title: "Blueberry", videoPath: "/videos/fruits/video2.mp4" },
    { title: "Watermelon", videoPath: "/videos/fruits/video3.mp4" },
    { title: "Tomato", videoPath: "/videos/fruits/video4.mp4" },
    { title: "Sugar Cane", videoPath: "/videos/fruits/video5.mp4" },
    { title: "Strawberry", videoPath: "/videos/fruits/video6.mp4" },
    { title: "Pomegranate", videoPath: "/videos/fruits/video7.mp4" },


  ],
  geography: [
    { title: "Pakistan", videoPath: "/videos/geography/Pakistan.mp4" },
    { title: "Turkey", videoPath: "/videos/geography/Turkey.mp4" },
    { title: "Spain", videoPath: "/videos/geography/Spain.mp4" },
    { title: "Saudi Arabia", videoPath: "/videos/geography/Saudi-Arabia.mp4" },
    { title: "New Zealand", videoPath: "/videos/geography/New-Zealand.mp4" },
    { title: "Russia", videoPath: "/videos/geography/Russia.mp4" },
  ],
  birds: [
    { title: "Woodpecker", videoPath: "/videos/birds/Woodpecker.mp4" },
    { title: "Sparrow", videoPath: "/videos/birds/Sparrow.mp4" },
    { title: "Vulture", videoPath: "/videos/birds/Vulture.mp4" },
    { title: "Parrot", videoPath: "/videos/birds/Parrot .mp4" },
    { title: "Peacock", videoPath: "/videos/birds/Peacock.mp4" },
    { title: "Seagull", videoPath: "/videos/birds/Seagull.mp4" },
  ],
  colors: [
    { title: "Sky Blue", videoPath: "/videos/colors/video1.mp4" },
    { title: "Brown", videoPath: "/videos/colors/video2.mp4" },
    { title: "Green", videoPath: "/videos/colors/video3.mp4" },
    { title: "Orange", videoPath: "/videos/colors/video4.mp4" },
    { title: "White", videoPath: "/videos/colors/video5.mp4" },
    { title: "Red", videoPath: "/videos/colors/video6.mp4" },




  ],
};

export default function TutorialCategoryPage() {
  const params = useParams();
  const category = String(params.category);

  const videos = tutorialVideos[category] || [];

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow="Tutorials"
            title={`${category.charAt(0).toUpperCase()}${category.slice(1)}`}
            description={
              videos.length > 0
                ? `${videos.length} ${videos.length === 1 ? "video" : "videos"} in this category.`
                : undefined
            }
            backHref="/tutorials"
          />

          {videos.length === 0 ? (
            <div className="card-muted mt-10 text-center">
              <p className="muted">No videos added yet for this category.</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, index) => (
                <figure key={index} className="card">
                  <video
                    controls
                    preload="metadata"
                    className="h-[190px] w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] object-cover"
                  >
                    <source src={video.videoPath} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  <figcaption className="mt-4 text-[15px] font-medium">
                    {video.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
