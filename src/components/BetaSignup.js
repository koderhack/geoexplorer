"use client";

import { useState } from "react";

export default function BetaSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!isValidEmail(email)) {
      setErrorMsg("Podaj poprawny adres e-mail.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setStatus("loading");

    try {
      const web3Key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;
      const customEndpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;

      let ok = false;

      if (web3Key) {
        const formData = new FormData();
        formData.append("access_key", web3Key);
        formData.append("email", email.trim().toLowerCase());
        formData.append("name", name.trim());
        formData.append("subject", "GeoExplorer — nowy zapis na betatesty");
        formData.append("from_name", "GeoExplorer Beta");
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        ok = !!data.success;
        if (!ok) throw new Error(data.message || "web3forms_error");
        try {
          await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), locale: "pl", source: "beta" }),
          });
        } catch {}
      } else if (customEndpoint) {
        const res = await fetch(customEndpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), locale: "pl", source: "beta" }),
        });
        const text = await res.text();
        try {
          const j = JSON.parse(text);
          ok = !!j.ok;
          if (!ok) throw new Error(j.error || "endpoint_error");
        } catch {
          ok = res.ok;
          if (!ok) throw new Error("endpoint_error");
        }
      } else {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase(), name: name.trim(), locale: "pl", source: "beta" }),
        });
        const data = await res.json().catch(() => ({}));
        ok = res.ok && data.ok !== false;
        if (!ok) throw new Error(data.error || "local_error");
      }

      if (ok) {
        setStatus("success");
        setEmail("");
        setName("");
      } else {
        throw new Error("unknown");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Coś poszło nie tak. Spróbuj ponownie za chwilę.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[16px] border border-[#C8E6A0] bg-[#F3F7E6] p-6 sm:p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#6F9A12] flex items-center justify-center text-white mb-4">
          <span className="material-symbols-outlined text-[26px]">check</span>
        </div>
        <h3 className="text-[18px] font-bold text-[#121214]">Jesteś na liście!</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[#4A5560] max-w-md mx-auto">
          Dziękujemy za zgłoszenie. Wyślemy Ci zaproszenie do TestFlight, gdy tylko otworzymy kolejną turę betatestów.
          Sprawdź skrzynkę (również spam) — damy znać w ciągu kilku dni.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-[#4A6B0A] hover:text-[#3A5710] underline underline-offset-4"
        >
          Zapisz kolejną osobę
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`bg-white rounded-[16px] border border-[#C8C8CE]/70 p-5 sm:p-6 shadow-sm ${shake ? "shake border-red-300" : ""}`}>
      <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr_auto] sm:items-end">
        <div className="sm:col-span-1">
          <label htmlFor="beta-email" className="block text-xs font-bold tracking-wide text-[#121214] uppercase mb-2">
            Adres e-mail <span className="text-red-500">*</span>
          </label>
          <input
            id="beta-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="w-full h-11 px-4 rounded-full border border-[#C8C8CE] bg-white text-[15px] placeholder:text-[#9AA0A6] focus:outline-none focus:border-[#6F9A12] focus:ring-4 focus:ring-[#6F9A12]/15 transition"
          />
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="beta-name" className="block text-xs font-bold tracking-wide text-[#121214] uppercase mb-2">
            Imię <span className="text-[#9AA0A6] font-normal normal-case tracking-normal">(opcjonalnie)</span>
          </label>
          <input
            id="beta-name"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ania"
            className="w-full h-11 px-4 rounded-full border border-[#C8C8CE] bg-white text-[15px] placeholder:text-[#9AA0A6] focus:outline-none focus:border-[#6F9A12] focus:ring-4 focus:ring-[#6F9A12]/15 transition"
          />
        </div>

        <div className="sm:col-span-1 sm:w-auto">
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-[#6F9A12] hover:bg-[#5F850F] disabled:opacity-60 disabled:cursor-wait text-[#0F1206] text-[14px] font-bold transition whitespace-nowrap shadow-sm"
          >
            {status === "loading" ? (
              <>
                <span className="w-4 h-4 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                Wysyłanie…
              </>
            ) : (
              <>
                Dołącz do betatestów
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-[20px]">
        {status === "error" && errorMsg ? (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMsg}
          </p>
        ) : (
          <p className="text-xs leading-relaxed text-[#9AA0A6]">
            Zapisujesz się na listę betatesterów. Wyślemy tylko zaproszenie do TestFlight — bez spamu. W każdej chwili możesz się wypisać.
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[#6B6B73] border-t border-[#F2F2F4] pt-4">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-full bg-[#F7F7F8] border border-[#C8C8CE]/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#6B6B73]">shield</span>
          </span>
          TestFlight • iOS
        </span>
        <span className="hidden sm:inline text-[#C8C8CE]">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-full bg-[#F7F7F8] border border-[#C8C8CE]/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#6B6B73]">mail</span>
          </span>
          Potwierdzenie na e-mail
        </span>
        <span className="hidden sm:inline text-[#C8C8CE]">•</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-7 h-7 rounded-full bg-[#F7F7F8] border border-[#C8C8CE]/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#6B6B73]">group</span>
          </span>
          Limit miejsc w turze
        </span>
      </div>
    </form>
  );
}
