"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = new Date(2026, 8, 1).getTime();

function timeParts(now) {
  if (now == null) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = Math.max(0, TARGET - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

const pad2 = (value) => String(value).padStart(2, "0");

function Unit({ value, label, withColon }) {
  const [burst, setBurst] = useState(false);
  const prev = useRef(null);
  const text = pad2(value);

  useEffect(() => {
    if (prev.current !== null && prev.current !== value) {
      setBurst(true);
      const timer = setTimeout(() => setBurst(false), 420);
      return () => clearTimeout(timer);
    }
    prev.current = value;
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-baseline">
        <span
          data-text={text}
          className={`countdown-digit relative inline-block font-display tabular-nums uppercase leading-none text-[clamp(34px,11vw,120px)] ${
            burst ? "glitch-active" : ""
          }`}
        >
          {text}
        </span>
        {withColon && (
          <span className="countdown-sep ml-1 sm:ml-4 text-[clamp(22px,7vw,72px)] leading-none select-none">
            :
          </span>
        )}
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
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = timeParts(now);

  return (
    <div className="flex items-start justify-center gap-3 sm:gap-7 md:gap-10 w-full">
      <Unit value={parts.days} label={labels.days} withColon />
      <Unit value={parts.hours} label={labels.hours} withColon />
      <Unit value={parts.minutes} label={labels.minutes} withColon />
      <Unit value={parts.seconds} label={labels.seconds} />
    </div>
  );
}