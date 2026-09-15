"use client";

import { useCallback, useRef } from "react";
import MapPreview from "./MapPreview";

export default function GeoExplorerPage({ initialLocale, initialSource }) {
  const betaRef = useRef(null);
  const mapRef = useRef(null);

  const scrollToBeta = useCallback(() => {
    betaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const scrollToMap = useCallback(() => {
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F2F4] text-[#121214] selection:bg-[#6F9A12]/20">
      {/* Header — matches DesignBrandHeader */}
      <header className="sticky top-0 z-30 bg-[#F2F2F4]/85 backdrop-blur-xl border-b border-[#C8C8CE]/50 supports-[backdrop-filter]:bg-[#F2F2F4]/70">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand-logo.png"
              alt="GeoExplorer"
              width={36}
              height={36}
              className="w-9 h-9 rounded-[9px] object-cover border border-[#6F9A12]/30 shadow-sm"
              style={{ borderRadius: 9 }}
            />
            <span className="text-[15px] font-bold tracking-tight text-[#121214]">GeoExplorer</span>
            <span className="hidden sm:inline-flex items-center ml-2 px-2.5 py-1 rounded-full bg-[#EEF4DD] border border-[#DDE8B8] text-[11px] font-bold tracking-wide text-[#4A6B0A] uppercase">
              Beta • TestFlight
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B6B73]">
            <button onClick={scrollToMap} className="hover:text-[#121214] transition">
              Mapa
            </button>
            <button onClick={scrollToBeta} className="hover:text-[#121214] transition">
              Betatesty
            </button>
            <a
              href="mailto:hello@geoexplorer.app"
              className="hover:text-[#121214] transition inline-flex items-center gap-1"
            >
              Kontakt
              <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://testflight.apple.com/join/U5CPEY7B"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-full bg-[#121214] hover:bg-black text-white text-[13px] font-semibold transition"
            >
              Dołącz do bety
            </a>
            <a
              href="https://testflight.apple.com/join/U5CPEY7B"
              target="_blank"
              rel="noreferrer"
              className="sm:hidden w-9 h-9 rounded-full bg-[#121214] text-white flex items-center justify-center"
              aria-label="Dołącz do betatestów"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pt-10 sm:pt-14 md:pt-16 pb-8 sm:pb-10">
        <div className="max-w-[760px] mx-auto text-center">
          {/* App icon hero — tactical crate */}
          <div className="mx-auto mb-6 w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(18,18,20,0.12),0_2px_8px_rgba(18,18,20,0.08)] border border-[#C8C8CE]/40 bg-white">
            <img
              src="/app-icon.png"
              alt="GeoExplorer — ikona aplikacji"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* badge — tactical */}
          <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border border-[#C8C8CE]/70 shadow-sm text-xs font-medium text-[#121214]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#6F9A12] text-black/85 text-[11px] font-bold tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-black/70 animate-pulse" />
              Nowość
            </span>
            <span className="hidden sm:inline">Jedna mapa — wszystkie sposoby odkrywania</span>
            <span className="sm:hidden">Wszystko na jednej mapie</span>
          </div>

          <h1 className="mt-6 text-[32px] sm:text-[42px] md:text-[52px] font-[700] tracking-[-0.03em] leading-[0.96] text-[#121214]">
            Jedna mapa zamiast pięciu aplikacji do odkrywania okolicy
          </h1>

          <p className="mt-5 text-[16px] sm:text-[18px] leading-relaxed text-[#6B6B73] max-w-[640px] mx-auto text-balance">
            GeoExplorer łączy kesze, questy, lokalne kolekcje rzeźb, krakowskie parki i inne rzeczy w mieście do odkrycia — na jednej mapie.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://testflight.apple.com/join/U5CPEY7B"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[16px] bg-[#6F9A12] hover:bg-[#5F850F] text-[#0F1206] text-[15px] font-bold shadow-[0_8px_20px_rgba(111,154,18,0.28)] transition"
            >
              Dołącz do betatestów
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
            <button
              onClick={scrollToMap}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[16px] bg-white border border-[#C8C8CE] hover:border-[#B8BCC4] hover:bg-[#F7F7F8] text-[#121214] text-[15px] font-semibold transition"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Zobacz podgląd mapy
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#9AA0A6]">
            <span>Bezpłatnie</span>
            <span className="w-1 h-1 rounded-full bg-[#C8C8CE]" />
            <span>TestFlight</span>
            <span className="w-1 h-1 rounded-full bg-[#C8C8CE]" />
            <span>2 minuty</span>
          </div>
        </div>
      </section>

      {/* Map - central */}
      <section ref={mapRef} className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-8 sm:pb-12 scroll-mt-20">
        <MapPreview />
      </section>

      {/* Beta — minimalist */}
      <section ref={betaRef} className="mx-auto max-w-[640px] px-4 sm:px-6 pb-16 sm:pb-20 scroll-mt-20">
        <div className="text-center py-10 sm:py-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#C8C8CE]/50 text-xs font-medium text-[#6B6B73]">
            <span className="w-2 h-2 rounded-full bg-[#6F9A12]" />
            Beta • TestFlight
          </div>
          <h2 className="mt-5 text-[24px] sm:text-[28px] font-bold tracking-tight text-[#121214]">
            Dołącz do betatestów
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6B6B73] text-balance">
            Jedno kliknięcie. TestFlight zainstaluje GeoExplorer na Twoim iPhonie.
          </p>
          <a
            href="https://testflight.apple.com/join/U5CPEY7B"
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-[#6F9A12] hover:bg-[#5F850F] text-[#0F1206] text-[15px] font-bold transition"
          >
            <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            Dołącz przez TestFlight
          </a>
          <p className="mt-3 text-xs text-[#9AA0A6]">iOS 16+ • 30+ odkrywców już testuje</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#C8C8CE]/40 bg-[#F7F7F8]/60">
        <div className="mx-auto max-w-[1120px] px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/brand-logo.png"
              alt="GeoExplorer"
              width={28}
              height={28}
              className="w-7 h-7 rounded-[7px] object-cover border border-[#6F9A12]/20"
            />
            <div className="text-sm">
              <div className="font-bold text-[#121214] leading-none">GeoExplorer</div>
              <div className="text-xs text-[#9AA0A6]">© {new Date().getFullYear()} GeoExplorer • Jedna mapa. Wiele przygód.</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-[#6B6B73]">
            <a href="mailto:hello@geoexplorer.app" className="hover:text-[#121214] transition">
              hello@geoexplorer.app
            </a>
            <span className="w-1 h-1 rounded-full bg-[#C8C8CE]" />
            <span>Warszawa • Polska</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
