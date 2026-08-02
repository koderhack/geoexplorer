"use client";

import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n";

export default function LocaleSwitcher({ locale, onLocaleChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-signal-green">
        language
      </span>
      <select
        aria-label="Language / Język"
        value={locale}
        onChange={(event) => onLocaleChange(event.target.value)}
        className="bg-surface-container-low border border-outline-variant text-signal-green font-label-sm text-label-sm px-2 py-1 focus:outline-none focus:border-signal-green transition-colors cursor-pointer"
      >
        {SUPPORTED_LOCALES.map((lang) => (
          <option
            key={lang}
            value={lang}
            className="bg-surface text-on-surface"
          >
            {LOCALE_LABELS[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}
