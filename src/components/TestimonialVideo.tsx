"use client";
import { useRef, useState } from "react";
import { Play, Quote } from "lucide-react";
import { trackEvent, trackVideoPlay } from "@/lib/analytics";

const VIDEO_URL =
  "https://res.cloudinary.com/jzmvisx4/video/upload/v1784334648/f8612e1dab88f9fc9d638d614a86a702_jknnlz.mp4";
/** Lightweight poster — Cloudinary transformation, not the full MP4 */
const POSTER_URL =
  "https://res.cloudinary.com/jzmvisx4/video/upload/so_0,w_720,q_auto,f_jpg/v1784334648/f8612e1dab88f9fc9d638d614a86a702_jknnlz.jpg";

export default function TestimonialVideo() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const milestonesRef = useRef(new Set<number>());
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setActivated(true);
    // Play after src mounts
    requestAnimationFrame(() => {
      void videoRef.current?.play();
    });
  };

  const onVideoPlay = () => {
    setPlaying(true);
    if (!startedRef.current) {
      startedRef.current = true;
      trackVideoPlay("client_testimonial");
    }
  };

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video?.duration) return;
    const percent = Math.round((video.currentTime / video.duration) * 100);
    [25, 50, 75].forEach((milestone) => {
      if (percent >= milestone && !milestonesRef.current.has(milestone)) {
        milestonesRef.current.add(milestone);
        trackEvent(`video_${milestone}` as "video_25" | "video_50" | "video_75", {
          video_title: "client_testimonial",
        });
      }
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-[#F8FAFC] overflow-hidden" ref={ref}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div>
          <span className="badge-light mb-4 inline-flex items-center gap-1.5">
            <Quote className="w-3.5 h-3.5" /> WHAT CLINICS SAY
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#00283C] tracking-tight mt-4 mb-3">
            Hear It <span className="gradient-heading">From a Real Client</span>
          </h2>
          <p className="text-gray-600 mb-4 max-w-xl mx-auto">
            No script, no actors — just a clinic telling you what changed after working with us.
          </p>
          <div className="flex items-center justify-center gap-1.5 mb-10">
            <span className="text-amber-500 text-base tracking-tight" aria-hidden="true">
              ★★★★★
            </span>
            <span className="text-gray-600 text-xs font-semibold">Verified client story</span>
          </div>
        </div>

        <div className="relative max-w-xl mx-auto">
          <div
            className="absolute -inset-10 rounded-full pointer-events-none opacity-[0.14]"
            style={{ background: "radial-gradient(circle, #00B4D8, transparent 70%)", filter: "blur(60px)" }}
          />

          <div
            className="relative rounded-[28px] p-[3px]"
            style={{ background: "linear-gradient(135deg, #00283C, #0077A8, #00B4D8)" }}
          >
            <div className="relative rounded-[26px] overflow-hidden bg-black shadow-2xl h-[420px] sm:h-[480px] flex items-center justify-center">
              {!activated ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={POSTER_URL}
                    alt=""
                    width={720}
                    height={1280}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/35" />
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label="Play testimonial video"
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/20 group"
                  >
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider">
                      Real Client Story
                    </span>
                    <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white/95 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-[#00283C] ml-1" fill="#00283C" />
                    </span>
                  </button>
                </>
              ) : (
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  controls={playing}
                  playsInline
                  autoPlay
                  preload="none"
                  onPlay={onVideoPlay}
                  onPause={() => setPlaying(false)}
                  onTimeUpdate={onTimeUpdate}
                  onEnded={() =>
                    trackEvent("video_complete", { video_title: "client_testimonial" })
                  }
                  className="relative h-full w-auto max-w-full block shadow-xl"
                  poster={POSTER_URL}
                >
                  <track kind="captions" srcLang="en" label="English" src="/captions/testimonial-en.vtt" />
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
