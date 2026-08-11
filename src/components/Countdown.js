"use client";

import { useEffect, useRef, useState } from "react";

/** Launch target: 1 October 2026, local midnight */
export const LAUNCH_AT = new Date(2026, 9, 1).getTime();

function splitRemaining(now) {
  if (now == null) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const ms = Math.max(0, LAUNCH_AT - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

function Digit({ value, label, withColon }) {
  const [glitching, setGlitching] = useState(false);
  const prev = useRef(null);
  const text = String(value).padStart(2, "0");

  useEffect(() => {
    if (prev.current !== null && prev.current !== value) {
      setGlitching(true);
      const id = setTimeout(() => setGlitching(false), 420);
      return () => clearTimeout(id);
    }
    prev.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline">
        <span
          data-text={text}
          className={`countdown-digit relative inline-block font-display tabular-nums uppercase leading-none text-[clamp(34px,11vw,120px)] ${
            glitching ? "glitch-active" : ""
          }`}
        >
          {text}
        </span>
        {withColon ? (
          <span className="countdown-sep ml-1 sm:ml-4 text-[clamp(22px,7vw,72px)] leading-none select-none">
            :
          </span>
        ) : null}
      </div>
      <span className="font-label-sm text-label-sm text-signal-green/80 uppercase tracking-[0.3em]">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ labels }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = splitRemaining(now);

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-7 md:gap-10 w-full">
      <Digit value={remaining.days} label={labels.days} withColon />
      <Digit value={remaining.hours} label={labels.hours} withColon />
      <Digit value={remaining.minutes} label={labels.minutes} withColon />
      <Digit value={remaining.seconds} label={labels.seconds} />
    </div>
  );
}
