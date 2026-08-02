"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ShaderBackground from "./ShaderBackground";
import LocaleSwitcher from "./LocaleSwitcher";
import {
  SUPPORTED_LOCALES,
  geoToLocale,
  setLocaleCookie,
  translate,
} from "@/lib/i18n";

const CRATE_IMAGE_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC2kF_TVOtWZRH6lIS8YKEidSCcALRkG_ubsQiEKUPsxPTF6mNOBHgBSSCzmYa702NP9fUw5WF3IXm_n14Xjij7QWPwsu5cxeoBRrhIm4DIIf6domifO6zUPSE1mGz3EmB8WIUzGL0U4fj20nCPWNNw3wEuE1qjH36kWqj2_jvNGco4K5_iB11vJpg4ydGNlu_PiGJzSq-MQG6nR40cgfmSNULsebPt7gHVTXihd7lMqzJzr6tokOH4fgJjIMAickerpA";

// Newsletter: Web3Forms (darmowe, bez serwera) > Google Sheets > lokalne API
const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

function getNewsletterEndpoint() {
  if (WEB3FORMS_ACCESS_KEY) return WEB3FORMS_ENDPOINT;
  return process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT || "/api/subscribe";
}

export default function GeoExplorerPage({ initialLocale, initialSource }) {
  const [locale, setLocale] = useState(initialLocale);
  const localeRef = useRef(initialLocale);
  const sourceRef = useRef(initialSource);
  const [formState, setFormState] = useState("idle"); // idle | sending | success | error
  const [email, setEmail] = useState("");
  const logoRef = useRef(null);
  const rootRef = useRef(null);

  const t = useCallback((key) => translate(locale, key), [locale]);

  const applyLocale = useCallback((nextLocale, source) => {
    setLocale(nextLocale);
    localeRef.current = nextLocale;
    sourceRef.current = source;
    setLocaleCookie(nextLocale, source);
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLocale;
    }
  }, []);

  // Keep <html lang> in sync on first render
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // --- Geo-localization detection (only for auto-detected visitors) ---
  useEffect(() => {
    if (sourceRef.current !== "auto") return;

    let cancelled = false;

    const fallbackToNavigator = () => {
      if (cancelled) return;
      const navLang =
        (typeof navigator !== "undefined" && navigator.language) || "en";
      const base = navLang.slice(0, 2).toLowerCase();
      if (SUPPORTED_LOCALES.includes(base) && base !== localeRef.current) {
        applyLocale(base, "auto");
      }
    };

    const detectByIp = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 2500);
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (!response.ok) {
          fallbackToNavigator();
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        const detected = geoToLocale(data?.country_code);
        if (detected && detected !== localeRef.current) {
          applyLocale(detected, "auto");
        } else {
          fallbackToNavigator();
        }
      } catch {
        fallbackToNavigator();
      }
    };

    detectByIp();
    return () => {
      cancelled = true;
    };
  }, [applyLocale]);

  // --- System boot sequence (staggered entrance) ---
  useEffect(() => {
    const targetIds = [
      "logo",
      "coming-soon",
      "crate-display",
      "newsletter-module",
    ];
    targetIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .forEach((element, index) => {
        setTimeout(() => {
          element.classList.remove("boot-hidden");
          element.classList.add("boot-anim");
        }, index * 400);
      });
  }, []);

  // --- Random glitch effect (strong, on logo + tagline, double bursts) ---
  useEffect(() => {
    let timeoutId;

    const triggerGlitch = () => {
      const targets = ["logo", "coming-soon"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);
      if (targets.length) {
        const element = targets[Math.floor(Math.random() * targets.length)];
        const burstCount = Math.random() > 0.55 ? 2 : 1;
        for (let i = 0; i < burstCount; i += 1) {
          setTimeout(() => {
            element.classList.add("glitch-active");
            setTimeout(() => {
              element.classList.remove("glitch-active");
            }, 220 + Math.random() * 280);
          }, i * 260);
        }
      }
      timeoutId = setTimeout(triggerGlitch, 1200 + Math.random() * 3200);
    };

    timeoutId = setTimeout(triggerGlitch, 1500);
    return () => clearTimeout(timeoutId);
  }, []);

  // --- Random signal drop-out (whole UI flicker) ---
  useEffect(() => {
    const root = rootRef.current;
    let timeoutId;

    const signalDrop = () => {
      if (root) {
        root.classList.add("signal-drop");
        setTimeout(() => {
          root.classList.remove("signal-drop");
        }, 240);
      }
      timeoutId = setTimeout(signalDrop, 8000 + Math.random() * 12000);
    };

    timeoutId = setTimeout(signalDrop, 4500 + Math.random() * 5000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (formState === "sending") return;

    setFormState("sending");

    // Timeout: zapobiega "zawieszonemu" przyciskowi, gdy sieć nie odpowiada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const payload = WEB3FORMS_ACCESS_KEY
        ? { access_key: WEB3FORMS_ACCESS_KEY, email, locale, source: "page" }
        : { email, locale, source: "page" };

      const response = await fetch(getNewsletterEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      let success = response.ok;
      if (data && typeof data.success === "boolean") {
        success = data.success;
      }
      setFormState(success ? "success" : "error");
    } catch {
      setFormState("error");
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return (
    <div
      ref={rootRef}
      className="bg-surface text-on-surface min-h-screen w-full relative flex flex-col crt-flicker selection:bg-signal-green selection:text-surface-deep"
    >
      {/* Animated Shader Background */}
      <ShaderBackground />
      <div className="absolute inset-0 z-0 bg-surface/80" />

      {/* Scanlines Overlay */}
      <div className="absolute inset-0 z-50 scanlines opacity-40" />

      {/* Minimal language switcher */}
      <div className="absolute bottom-margin right-margin z-40 opacity-60 hover:opacity-100 transition-opacity">
        <LocaleSwitcher locale={locale} onLocaleChange={applyLocale} />
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center p-margin max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center mb-8">
          <h1
            ref={logoRef}
            id="logo"
            data-text="GeoExplorer"
            className="font-headline-lg text-[40px] md:text-[56px] uppercase tracking-widest leading-none mb-2 text-on-background relative inline-block boot-hidden"
          >
            GeoExplorer
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-signal-green opacity-50" />
            <p
              id="coming-soon"
              data-text={t("comingSoon")}
              className="font-data-lg text-data-lg uppercase tracking-[0.2em] text-signal-green drop-shadow-[0_0_8px_rgba(164,198,57,0.4)] crt-flicker-low boot-hidden relative"
            >
              {t("comingSoon")}
              <span className="blink-cursor ml-1">▊</span>
            </p>
            <div className="h-px w-8 bg-signal-green opacity-50" />
          </div>
        </div>

        {/* Center: Expedition Crate */}
        <div
          id="crate-display"
          className="flex items-center justify-center w-full max-w-[280px] sm:max-w-sm md:max-w-md p-6 relative boot-hidden"
        >
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[150%] h-[150%] rounded-full blur-[60px] animate-pulse opacity-60"
              style={{
                background:
                  "radial-gradient(circle, rgba(188, 203, 185, 0.8) 0%, rgba(164, 198, 57, 0.3) 40%, transparent 70%)",
              }}
            />
          </div>
          <img
            alt={t("crateAlt")}
            src={CRATE_IMAGE_URL}
            className="w-full h-auto filter drop-shadow-[0_0_30px_rgba(164,198,57,0.5)] sepia-[0.3] hue-rotate-[-30deg] saturate-50 opacity-90 transition-all duration-1000 crt-flicker-low relative z-10"
          />
        </div>

        {/* Newsletter Module */}
        <div
          id="newsletter-module"
          className="w-full max-w-md mt-8 bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant p-6 relative boot-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-signal-green" />
          {formState === "success" ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="material-symbols-outlined text-[32px] text-signal-green">
                check_circle
              </span>
              <p className="font-data-lg text-data-lg text-signal-green tracking-widest">
                {t("successTitle")}
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {t("successSub")}
              </p>
            </div>
          ) : (
            <>
              <label className="block font-label-sm text-label-sm text-signal-green mb-4 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">
                  terminal
                </span>
                {t("newsletterTitle")}
              </label>
              <form className="flex flex-col gap-4 group" onSubmit={handleSubmit}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-signal-green font-label-sm opacity-50">
                    &gt;
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full bg-surface-deep border border-outline-variant text-on-surface font-body-md text-body-md pl-8 pr-4 py-3 focus:outline-none focus:border-signal-green focus:ring-1 focus:ring-signal-green transition-colors placeholder:text-outline-variant rounded-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={formState === "sending"}
                  className="w-full bg-signal-green text-surface-deep font-data-lg text-data-lg py-3 hover:bg-primary transition-colors border border-signal-green uppercase flex justify-center items-center gap-2 group-hover:drop-shadow-[0_0_8px_rgba(164,198,57,0.5)] disabled:opacity-60 disabled:cursor-wait"
                >
                  {formState === "sending" ? t("subscribeSending") : t("submit")}
                  <span className="material-symbols-outlined text-[20px]">
                    arrow_forward
                  </span>
                </button>
              </form>
              <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant opacity-60 mt-4">
                <span className="w-2 h-2 bg-signal-green rounded-full animate-pulse" />
                <span className="tracking-widest">{t("connection")}</span>
              </div>
              {formState === "error" && (
                <div className="flex items-center gap-2 font-label-sm text-label-sm text-error mt-3">
                  <span className="material-symbols-outlined text-[14px]">
                    error
                  </span>
                  <span>{t("subscribeError")}</span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
