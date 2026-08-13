"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Play, Quote, Star, BadgeCheck } from "lucide-react";
import { trackEvent, trackVideoPlay } from "@/lib/analytics";

const VIDEO_URL =
  "https://res.cloudinary.com/jzmvisx4/video/upload/v1784334648/f8612e1dab88f9fc9d638d614a86a702_jknnlz.mp4";
/** Lightweight poster — Cloudinary transformation, not the full MP4 */
const POSTER_URL =
  "https://res.cloudinary.com/jzmvisx4/video/upload/so_0,w_720,q_auto,f_jpg/v1784334648/f8612e1dab88f9fc9d638d614a86a702_jknnlz.jpg";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function TestimonialVideo() {
  const ref = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startedRef = useRef(false);
  const milestonesRef = useRef(new Set<number>());
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion || isMobile ? [0, 0] : [16, -16]
  );

  const handlePlay = () => {
    setActivated(true);
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
    <section
      ref={ref}
      id="client-story"
      className="testimonial-section relative overflow-x-clip py-16 lg:py-24"
    >
      <div aria-hidden className="testimonial-bg absolute inset-0" />
      <motion.div
        aria-hidden
        className="testimonial-glow testimonial-glow--a absolute"
        style={{ y: glowY }}
      />
      <motion.div
        aria-hidden
        className="testimonial-glow testimonial-glow--b absolute"
        style={{ y: glowY }}
      />
      <div aria-hidden className="testimonial-grid absolute inset-0" />
      <div aria-hidden className="testimonial-dots absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: easeOut }}
          className="testimonial-badge mb-4 inline-flex items-center gap-2"
        >
          <Quote className="h-3.5 w-3.5" strokeWidth={2} />
          WHAT CLINICS SAY
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
          className="mt-4 mb-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl"
        >
          Hear It{" "}
          <span className="testimonial-heading-accent">From a Real Client</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.14, ease: easeOut }}
          className="mx-auto mb-5 max-w-xl text-base leading-relaxed text-[#8eb4c4]"
        >
          No script, no actors — just a clinic telling you what changed after
          working with us.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.2, ease: easeOut }}
          className="mb-10 flex items-center justify-center gap-2.5"
        >
          <span className="testimonial-stars" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4"
                fill="currentColor"
                strokeWidth={0}
              />
            ))}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8eb4c4]">
            <BadgeCheck className="h-3.5 w-3.5 text-[#00B4D8]" strokeWidth={2.2} />
            Verified client story
          </span>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: reduceMotion ? 0 : 28,
            scale: reduceMotion ? 1 : 0.97,
          }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.75, delay: 0.26, ease: easeOut }}
          className="relative mx-auto max-w-xl"
        >
          <div aria-hidden className="testimonial-frame-glow absolute" />

          <div className="testimonial-frame relative">
            <div className="testimonial-frame-inner relative flex h-[420px] items-center justify-center overflow-hidden sm:h-[480px]">
              {!activated ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={POSTER_URL}
                    alt=""
                    width={720}
                    height={1280}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="testimonial-poster-overlay absolute inset-0" />
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label="Play testimonial video"
                    className="testimonial-play-hit absolute inset-0 flex items-center justify-center group"
                  >
                    <span className="testimonial-story-chip absolute left-4 top-4 inline-flex items-center gap-1.5">
                      <span className="testimonial-live-dot" />
                      Real Client Story
                    </span>
                    <span className="testimonial-play-btn relative flex h-20 w-20 items-center justify-center">
                      <span aria-hidden className="testimonial-play-ring" />
                      <Play
                        className="relative z-[1] ml-1 h-8 w-8 text-[#00283C]"
                        fill="#00283C"
                        strokeWidth={0}
                      />
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
                    trackEvent("video_complete", {
                      video_title: "client_testimonial",
                    })
                  }
                  className="relative block h-full w-auto max-w-full shadow-xl"
                  poster={POSTER_URL}
                >
                  <track
                    kind="captions"
                    srcLang="en"
                    label="English"
                    src="/captions/testimonial-en.vtt"
                  />
                </video>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
