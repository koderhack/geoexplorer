"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import geoData from "@/data/geoPoints.json";
import "leaflet/dist/leaflet.css";

const TYPE_META = {
  // real app categoryColorHex + systemImage mapping
  krasnal: { label: "Krasnale", color: "#7BB8D9", bg: "#E8F2F8", icon: "crown", pill: "KRASNAL" },
  bebok:   { label: "Beboki",   color: "#F4A261", bg: "#FFF0DC", icon: "visibility", pill: "BEBOK" },
  smok:    { label: "Smoki",    color: "#FF6B61", bg: "#FDE8E6", icon: "local_fire_department", pill: "SMOK" },
  kesz:    { label: "Kesze",    color: "#6F9A12", bg: "#EEF4DD", icon: "inventory_2", pill: "KESZ" },
};

const FILTERS = [
  { id: "all", label: "Wszystko" },
  { id: "krasnal", label: "Krasnale" },
  { id: "bebok", label: "Beboki" },
  { id: "smok", label: "Smoki" },
  { id: "kesz", label: "Kesze" },
];

// 1 miasto przybliżone — Wrocław (krasnale) jako domyślny widok
const DEFAULT_CENTER = [51.1098, 17.0302];
const DEFAULT_ZOOM = 14;

export default function MapPreview() {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);

  const points = useMemo(() => {
    if (active === "all") return geoData.points;
    return geoData.points.filter((p) => p.type === active);
  }, [active]);

  // init leaflet
  useEffect(() => {
    let L;
    let map;

    const init = async () => {
      L = await import("leaflet");
      // fix icon path issues
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;

      if (!mapElRef.current || mapRef.current) return;

      // ograniczone do Wrocławia — nie da się przewinąć poza miasto
      const wroclawBounds = L.latLngBounds(
        L.latLng(50.98, 16.85),
        L.latLng(51.22, 17.20)
      );
      map = L.map(mapElRef.current, {
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 12,
        maxZoom: 19,
        maxBounds: wroclawBounds,
        maxBoundsViscosity: 1.0,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        // keep tap for mobile
        tap: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.control.attribution({ position: "bottomright", prefix: false }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // start na 1 mieście — bez fitBounds na wszystkie punkty
      // (wcześniej rozciągało na całą Polskę południową). Teraz stały widok Wrocław.

      setReady(true);
    };

    init();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // markers
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let L;
    let cancelled = false;

    const render = async () => {
      L = await import("leaflet");

      // clear old
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const keszIconForType = (t) => {
        switch (t) {
          case "Traditional": return "inventory_2";
          case "Multi": return "route";
          case "Quiz": return "help";
          case "Mystery": return "help";
          case "Other": return "category";
          case "Webcam": return "videocam";
          case "Virtual": return "visibility";
          case "Event": return "event";
          case "Earthcache": return "public";
          case "Letterbox": return "mail";
          case "Wherigo": return "sports_esports";
          default: return "location_on";
        }
      };
      points.forEach((p) => {
        const meta = TYPE_META[p.type] || TYPE_META.kesz;
        const isSel = selected?.id === p.id;
        const isLight = p.type === "krasnal" || p.type === "bebok";
        const iconColor = isLight ? "rgba(18,18,20,0.88)" : "white";
        const iconName = p.type === "kesz" ? keszIconForType(p.cacheType) : meta.icon;
        const bg = meta.color;
        const icon = L.divIcon({
          className: "",
          html: `<div style="
            width:${isSel ? 34 : 28}px;height:${isSel ? 34 : 28}px;
            background:${bg};
            border:2px solid white;
            border-radius:999px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 10px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06);
            ${isSel ? 'transform:scale(1.08); box-shadow:0 0 0 3px '+bg+'33, 0 4px 14px rgba(0,0,0,0.22);' : ''}
          "><span class="material-symbols-outlined" style="font-size:${isSel ? 18 : 16}px;color:${iconColor};font-variation-settings:'FILL' 1;">${iconName}</span></div>`,
          iconSize: [isSel ? 34 : 28, isSel ? 34 : 28],
          iconAnchor: [isSel ? 17 : 14, isSel ? 17 : 14],
        });

        const m = L.marker([p.lat, p.lng], { icon }).addTo(mapRef.current);
        m.on("click", () => setSelected(p));
        markersRef.current.push(m);
      });

      // if selected not in filtered, clear
      if (selected && !points.find((x) => x.id === selected.id)) setSelected(null);
    };

    render();
    return () => { cancelled = true; };
  }, [points, ready, selected]);

  // fly to selected
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.flyTo([selected.lat, selected.lng], Math.max(mapRef.current.getZoom(), 11), { duration: 0.6 });
  }, [selected?.id]);

  return (
    <div className="w-full max-w-[1120px] mx-auto">
      <div className="rounded-[20px] bg-white border border-[#C8C8CE]/60 overflow-hidden shadow-[0_10px_30px_rgba(18,18,20,0.06)]">
        {/* header — minimal pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#C8C8CE]/30">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#6B6B73]">
              <span className="w-2 h-2 rounded-full bg-[#6F9A12] animate-pulse" />
              Mapa
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActive(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition ${
                    active === f.id
                      ? "bg-[#6F9A12] text-black border-[#6F9A12]"
                      : "bg-white text-[#121214] border-[#C8C8CE] hover:bg-[#F7F7F8]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <span className="hidden md:inline text-xs text-[#9AA0A6]">
            {points.length} punktów • Wrocław
          </span>
        </div>

        {/* map */}
        <div className="relative">
          <div ref={mapElRef} className="h-[380px] sm:h-[460px] md:h-[520px] w-full bg-[#F2F2F4] z-0" />

          {/* selected card — jak w apce: MapCachePreviewCard dla keszy, CollectionStopMapCard dla krasnali/beboków/smoków */}
          {selected && (
            <div className="absolute left-3 right-3 sm:left-4 sm:right-auto sm:w-[380px] bottom-3 sm:bottom-4 z-[400] popup-anim">
              <div className="bg-white rounded-[16px] border border-[#C8C8CE]/70 shadow-[0_12px_32px_rgba(18,18,20,0.14)] overflow-hidden">
                <div className="p-4">
                  {selected.type === "kesz" ? (
                    <>
                      {/* CACHE — MapCachePreviewCard */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6F9A12] text-black/85 text-[10px] font-bold tracking-wide uppercase leading-none">
                              CACHE
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0A6]" />
                            <span className="text-[11px] font-semibold tracking-wide text-[#6B6B73] font-mono">
                              {(selected.code || selected.id).toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-2 font-bold text-[16px] leading-tight text-[#121214] line-clamp-2">{selected.name}</div>
                          <div className="mt-1 text-[12px] leading-relaxed text-[#6B6B73]">
                            {selected.cacheType || "Traditional"} • {selected.city} • OP
                          </div>
                        </div>
                        <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-[#F2F2F4] flex items-center justify-center text-[#9AA0A6] shrink-0">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">bar_chart</span> D
                          </div>
                          <div className="mt-1 text-[13px] font-bold text-[#121214]">{selected.difficulty ?? "—"}</div>
                        </div>
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">landscape</span> T
                          </div>
                          <div className="mt-1 text-[13px] font-bold text-[#121214]">{selected.terrain ?? "—"}</div>
                        </div>
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">inventory_2</span> Rozm.
                          </div>
                          <div className="mt-1 text-[12px] font-bold text-[#121214] capitalize">{selected.size2 || "—"}</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            const idx = points.findIndex((p) => p.id === selected.id);
                            const nxt = points[(idx + 1) % points.length];
                            if (nxt) setSelected(nxt);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-[#6F9A12] text-black/85 text-[14px] font-bold hover:bg-[#5F850F] transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">stylus</span>
                          Zobacz kesza
                        </button>
                        <button onClick={() => setSelected(null)} className="w-11 h-11 rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/60 flex items-center justify-center text-[#121214] hover:bg-white">
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* COLLECTION — CollectionStopMapCard */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#6F9A12] text-black/85 text-[10px] font-bold tracking-wide uppercase leading-none">
                              {TYPE_META[selected.type].pill}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#9AA0A6]" />
                            <span className="text-[11px] font-semibold tracking-wide text-[#6B6B73] font-mono truncate max-w-[90px]">
                              {selected.id.slice(0, 12).toUpperCase()}
                            </span>
                          </div>
                          <div className="mt-2 font-bold text-[16px] leading-tight text-[#121214] line-clamp-2">{selected.name}</div>
                          <div className="mt-1 text-[12px] leading-relaxed text-[#6B6B73]">{selected.city} • {selected.note}</div>
                        </div>
                        <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full hover:bg-[#F2F2F4] flex items-center justify-center text-[#9AA0A6] shrink-0">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73]">Kolekcja</div>
                          <div className="mt-1 text-[12px] font-bold text-[#121214] truncate">{TYPE_META[selected.type].label}</div>
                        </div>
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73]">Miasto</div>
                          <div className="mt-1 text-[12px] font-bold text-[#121214] truncate">{selected.city}</div>
                        </div>
                        <div className="rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/30 px-3 py-2">
                          <div className="text-[10px] font-semibold tracking-wide uppercase text-[#6B6B73]">Status</div>
                          <div className="mt-1 text-[12px] font-bold text-[#6F9A12]">Do odkrycia</div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2.5">
                        <button
                          onClick={() => {
                            const idx = points.findIndex((p) => p.id === selected.id);
                            const nxt = points[(idx + 1) % points.length];
                            if (nxt) setSelected(nxt);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-[#6F9A12] text-black/85 text-[14px] font-bold hover:bg-[#5F850F] transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">explore</span>
                          Zobacz na mapie
                        </button>
                        <button onClick={() => setSelected(null)} className="w-11 h-11 rounded-[12px] bg-[#F7F7F8] border border-[#C8C8CE]/60 flex items-center justify-center text-[#121214] hover:bg-white">
                          <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="h-1 bg-[#F2F2F4] flex">
                  {Object.keys(TYPE_META).map((k) => (
                    <div key={k} className="flex-1 h-full" style={{ background: k === selected.type ? TYPE_META[k].color : "transparent" }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-5 py-3 bg-[#F7F7F8]/60 border-t border-[#C8C8CE]/30 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6B73]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6F9A12]" /> 1223 krasnale + 150 keszy OC · demo Wrocław
          </span>
          <span className="text-[#9AA0A6]">© OpenStreetMap</span>
        </div>
      </div>

      {/* legend minimal */}
      <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
        {Object.entries(TYPE_META).map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[#6B6B73]">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" style={{ background: v.color }} />
            {v.label}
          </span>
        ))}
        <span className="text-[#9AA0A6] hidden sm:inline">• kliknij punkt, by zobaczyć szczegóły</span>
      </div>
    </div>
  );
}
