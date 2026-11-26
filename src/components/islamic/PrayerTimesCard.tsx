import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  calculateDailyPrayerTimes,
  VERIFIED_PRAYER_CITIES,
  PRAYER_CALCULATION_METHODS,
  PRAYER_COUNTRIES,
  type PrayerTimeCity,
  type PrayerCalculationMethodKey,
  type PrayerTimesResult,
} from "@/data/islamic-center";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Clock,
  MapPin,
  Calendar,
  Settings,
  Navigation,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Volume2,
  VolumeX,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface PrayerTimesCardProps {
  lang?: string;
  className?: string;
}

const STORAGE_COUNTRY_KEY = "btc_prayer_selected_country_v2";
const STORAGE_CITY_KEY = "btc_prayer_selected_city_v2";
const ADHAN_AUDIO_URL = "https://cdn.islamic.network/adhan/makkah.mp3";

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({
  lang = "ar",
  className = "",
}) => {
  const isAr = lang === "ar";

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => {
    if (typeof window === "undefined") return "KW";
    try {
      const saved = window.localStorage.getItem(STORAGE_COUNTRY_KEY);
      if (saved && (saved === "KW" || saved === "EG" || saved === "SA" || saved === "ALL")) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return "KW";
  });

  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    if (typeof window === "undefined") return "kw_kuwait";
    try {
      const saved = window.localStorage.getItem(STORAGE_CITY_KEY);
      if (saved && VERIFIED_PRAYER_CITIES.some((c) => c.id === saved)) {
        return saved;
      }
    } catch {
      // Ignore
    }
    return "kw_kuwait";
  });

  const [selectedMethod, setSelectedMethod] = useState<PrayerCalculationMethodKey>(() => {
    return selectedCountryCode === "EG"
      ? "egypt"
      : selectedCountryCode === "KW"
        ? "kuwait"
        : selectedCountryCode === "SA"
          ? "makkah"
          : "kuwait";
  });

  const [customCoords, setCustomCoords] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);

  const [now, setNow] = useState<Date>(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [isPlayingAdhan, setIsPlayingAdhan] = useState<boolean>(false);
  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);

  // Update clock every second for live countdown and auto-renewal
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist selections
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_COUNTRY_KEY, selectedCountryCode);
      window.localStorage.setItem(STORAGE_CITY_KEY, selectedCityId);
    } catch {
      // Ignore storage errors
    }
  }, [selectedCountryCode, selectedCityId]);

  // Handle Country switch
  const handleSelectCountry = (code: string) => {
    setCustomCoords(null);
    setSelectedCountryCode(code);
    const countryMeta = PRAYER_COUNTRIES.find((c) => c.countryCode === code);
    if (countryMeta) {
      setSelectedCityId(countryMeta.defaultCityId);
      setSelectedMethod(countryMeta.defaultMethod);
    } else {
      setSelectedCityId("kw_kuwait");
      setSelectedMethod("kuwait");
    }
  };

  const filteredCities = useMemo(() => {
    if (selectedCountryCode === "ALL") {
      return VERIFIED_PRAYER_CITIES;
    }
    return VERIFIED_PRAYER_CITIES.filter((c) => c.countryCode === selectedCountryCode);
  }, [selectedCountryCode]);

  const activeCity: PrayerTimeCity = useMemo(() => {
    if (customCoords) {
      return {
        id: "custom",
        nameEn: customCoords.name,
        nameAr: customCoords.name,
        countryEn: "Custom Location",
        countryAr: "موقع جغرافي مخصص",
        countryCode: "XX",
        latitude: customCoords.lat,
        longitude: customCoords.lng,
        timezone: -new Date().getTimezoneOffset() / 60,
        defaultMethod: selectedMethod,
      };
    }
    const found = VERIFIED_PRAYER_CITIES.find((c) => c.id === selectedCityId);
    if (found) return found;
    return filteredCities[0] ?? VERIFIED_PRAYER_CITIES[0]!;
  }, [selectedCityId, customCoords, selectedMethod, filteredCities]);

  const prayerTimes: PrayerTimesResult = useMemo(() => {
    return calculateDailyPrayerTimes(now, activeCity, selectedMethod);
  }, [now, activeCity, selectedMethod]);

  // Request browser geolocation
  const handleUseGeolocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: isAr ? "موقعي الجغرافي الحالي" : "Current Location",
          });
        },
        (err) => {
          console.warn("Geolocation denied or unavailable:", err);
        },
      );
    }
  };

  const handleToggleAdhanAudio = () => {
    if (isPlayingAdhan) {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
        adhanAudioRef.current.currentTime = 0;
      }
      setIsPlayingAdhan(false);
    } else {
      if (!adhanAudioRef.current) {
        adhanAudioRef.current = new Audio(ADHAN_AUDIO_URL);
        adhanAudioRef.current.addEventListener("ended", () => setIsPlayingAdhan(false));
      }
      adhanAudioRef.current
        .play()
        .then(() => setIsPlayingAdhan(true))
        .catch(() => setIsPlayingAdhan(false));
    }
  };

  useEffect(() => {
    return () => {
      if (adhanAudioRef.current) {
        adhanAudioRef.current.pause();
      }
    };
  }, []);

  // 7-day schedule generation
  const sevenDaysSchedule = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const res = calculateDailyPrayerTimes(d, activeCity, selectedMethod);
      list.push({ date: d, times: res });
    }
    return list;
  }, [now, activeCity, selectedMethod]);

  const prayerCards = [
    { key: "fajr", nameAr: "الفجر", nameEn: "Fajr", time: prayerTimes.fajr, icon: Moon },
    {
      key: "sunrise",
      nameAr: "الشروق",
      nameEn: "Sunrise",
      time: prayerTimes.sunrise,
      icon: Sunrise,
    },
    { key: "dhuhr", nameAr: "الظهر", nameEn: "Dhuhr", time: prayerTimes.dhuhr, icon: Sun },
    { key: "asr", nameAr: "العصر", nameEn: "Asr", time: prayerTimes.asr, icon: Sun },
    {
      key: "maghrib",
      nameAr: "المغرب",
      nameEn: "Maghrib",
      time: prayerTimes.maghrib,
      icon: Sunset,
    },
    { key: "isha", nameAr: "العشاء", nameEn: "Isha", time: prayerTimes.isha, icon: Moon },
  ];

  const formatRemainingMs = (ms: number) => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const activeMethodMeta = PRAYER_CALCULATION_METHODS[selectedMethod];

  return (
    <div
      className={`w-full flex flex-col gap-5 ${className}`}
      dir={isAr ? "rtl" : "ltr"}
      data-testid="prayer-times-card"
    >
      {/* Country Selector Segment */}
      <div className="rounded-2xl border border-border/80 bg-surface/90 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              <MapPin className="size-4" />
            </span>
            <span className="text-xs font-bold text-foreground">
              {isAr
                ? "اختر الدولة لحساب مواقيت الصلاة المعتمدة:"
                : "Select Country for Verified Prayer Times:"}
            </span>
          </div>

          <div
            role="group"
            aria-label={isAr ? "اختيار الدولة" : "Country Selection"}
            className="flex flex-wrap items-center gap-1.5"
          >
            {PRAYER_COUNTRIES.map((cty) => {
              const isSelected = selectedCountryCode === cty.countryCode && !customCoords;
              return (
                <button
                  key={cty.countryCode}
                  type="button"
                  data-testid={`prayer-country-btn-${cty.countryCode.toLowerCase()}`}
                  onClick={() => handleSelectCountry(cty.countryCode)}
                  aria-pressed={isSelected}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-surface-2 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800"
                  }`}
                >
                  <span aria-hidden="true">{cty.flag}</span>
                  <span>{isAr ? cty.nameAr : cty.nameEn}</span>
                </button>
              );
            })}

            <button
              type="button"
              data-testid="prayer-gps-btn"
              onClick={handleUseGeolocation}
              aria-pressed={Boolean(customCoords)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                customCoords
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-surface-2 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800"
              }`}
              title={isAr ? "تحديد موقعي الجغرافي الحالي" : "Use current GPS location"}
            >
              <Navigation className="size-3.5" />
              <span>{isAr ? "موقعي الحالي" : "GPS"}</span>
            </button>
          </div>
        </div>

        {/* City & Method Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* City Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {isAr ? "المدينة:" : "City:"}
              </span>
              <ModernSelect
                data-testid="prayer-city-select"
                value={customCoords ? "custom" : selectedCityId}
                onValueChange={(val) => {
                  if (val === "custom") {
                    handleUseGeolocation();
                  } else {
                    setCustomCoords(null);
                    setSelectedCityId(val);
                  }
                }}
                ariaLabel={isAr ? "تحديد المدينة لمواقيت الصلاة" : "Select City"}
                size="sm"
                className="w-56"
                options={[
                  ...(customCoords
                    ? [
                        {
                          value: "custom",
                          label: isAr ? "موقعي الجغرافي الحالي" : "My Current Location",
                        },
                      ]
                    : []),
                  ...filteredCities.map((c) => ({
                    value: c.id,
                    label: isAr ? `${c.nameAr} (${c.countryAr})` : `${c.nameEn} (${c.countryEn})`,
                  })),
                ]}
              />
            </div>

            {/* Calculation Method Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Settings className="size-3 text-stone-400" />
                <span>{isAr ? "الحساب الفلكي:" : "Method:"}</span>
              </span>
              <ModernSelect
                value={selectedMethod}
                onValueChange={(val) => setSelectedMethod(val as PrayerCalculationMethodKey)}
                ariaLabel={isAr ? "تحديد طريقة حساب مواقيت الصلاة" : "Calculation Method"}
                size="sm"
                className="w-64"
                options={Object.entries(PRAYER_CALCULATION_METHODS).map(([k, m]) => ({
                  value: k,
                  label: isAr ? m.nameAr : m.nameEn,
                }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Adhan Audio Button */}
            <button
              type="button"
              data-testid="prayer-play-adhan-btn"
              onClick={handleToggleAdhanAudio}
              className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                isPlayingAdhan
                  ? "bg-amber-600 text-white animate-pulse"
                  : "bg-surface-2 hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200"
              }`}
              title={isAr ? "الاستماع لصوت الأذان المبارك" : "Play Adhan audio"}
            >
              {isPlayingAdhan ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              <span>
                {isPlayingAdhan
                  ? isAr
                    ? "إيقاف الأذان"
                    : "Stop Adhan"
                  : isAr
                    ? "سماع الأذان"
                    : "Play Adhan"}
              </span>
            </button>

            {/* 7-Day Schedule Button */}
            <button
              type="button"
              data-testid="prayer-schedule-btn"
              onClick={() => setShowScheduleModal(true)}
              className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-stone-200/80 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              aria-label={isAr ? "عرض جدول مواقيت الأسبوع" : "Weekly prayer schedule"}
            >
              <Calendar className="size-3.5 text-stone-500" />
              <span>{isAr ? "جدول ٧ أيام" : "7-Day Schedule"}</span>
            </button>
          </div>
        </div>

        {/* Verified Authority Badge */}
        <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="size-3.5 shrink-0" />
          <span>
            {isAr
              ? `معيار الحساب: ${activeMethodMeta?.descriptionAr ?? activeMethodMeta?.nameAr}`
              : `Authority: ${activeMethodMeta?.descriptionEn ?? activeMethodMeta?.nameEn}`}
          </span>
        </div>
      </div>

      {/* Hero Countdown to Next Prayer */}
      <div
        data-testid="prayer-hero-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 text-white shadow-md border border-emerald-600/30"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold border border-emerald-500/30">
              <Clock className="size-3.5" />
              <span>{isAr ? "الصلاة القادمة" : "Next Prayer"}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              {isAr
                ? `صلاة ${prayerTimes.nextPrayer.nameAr}`
                : `${prayerTimes.nextPrayer.nameEn} Prayer`}
            </h3>
            <p className="text-xs text-emerald-100/90">
              {isAr
                ? `يحين وقت الأذان عند الساعة ${prayerTimes.nextPrayer.time} بحسب التوقيت المحلي لمدينة ${activeCity.nameAr}`
                : `Adhan is due at ${prayerTimes.nextPrayer.time} according to ${activeCity.nameEn} local time`}
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
            <div
              data-testid="prayer-countdown-clock"
              className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-amber-300 drop-shadow"
            >
              {formatRemainingMs(prayerTimes.nextPrayer.remainingMs)}
            </div>
            <div className="text-[11px] text-emerald-200">
              {isAr
                ? `متبقي حتى رفع أذان ${prayerTimes.nextPrayer.nameAr}`
                : `Remaining until ${prayerTimes.nextPrayer.nameEn}`}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Prayers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {prayerCards.map((p) => {
          const isNext = prayerTimes.nextPrayer.nameKey === p.key;
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              data-testid={`prayer-cell-${p.key}`}
              className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between gap-2.5 ${
                isNext
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/30"
                  : "bg-surface border-border"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[11px] font-bold ${
                    isNext ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                  }`}
                >
                  {isAr ? p.nameAr : p.nameEn}
                </span>
                <Icon className={`size-4 ${isNext ? "text-emerald-600" : "text-stone-400"}`} />
              </div>

              <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
                {p.time}
              </div>

              <div className="w-full text-center">
                {isNext ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {isAr ? "القادمة" : "Next"}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {isAr ? p.nameEn : p.nameAr}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Days Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-2">
              <div className="font-bold text-sm text-foreground flex items-center gap-2">
                <Calendar className="size-5 text-emerald-600" />
                <span>
                  {isAr
                    ? `جدول مواقيت الصلاة للأيام السبعة القادمة — ${activeCity.nameAr}`
                    : `7-Day Prayer Schedule — ${activeCity.nameEn}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-2.5 px-3 text-start">
                      {isAr ? "اليوم والتاريخ" : "Day & Date"}
                    </th>
                    <th className="py-2.5 px-2">{isAr ? "الفجر" : "Fajr"}</th>
                    <th className="py-2.5 px-2">{isAr ? "الشروق" : "Sunrise"}</th>
                    <th className="py-2.5 px-2">{isAr ? "الظهر" : "Dhuhr"}</th>
                    <th className="py-2.5 px-2">{isAr ? "العصر" : "Asr"}</th>
                    <th className="py-2.5 px-2">{isAr ? "المغرب" : "Maghrib"}</th>
                    <th className="py-2.5 px-2">{isAr ? "العشاء" : "Isha"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  {sevenDaysSchedule.map((item, idx) => {
                    const isToday = idx === 0;
                    return (
                      <tr
                        key={idx}
                        className={
                          isToday
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 font-bold text-emerald-950 dark:text-emerald-200"
                            : "text-foreground"
                        }
                      >
                        <td className="py-2.5 px-3 text-start font-sans font-semibold">
                          {item.date.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {isToday && (isAr ? " (اليوم)" : " (Today)")}
                        </td>
                        <td className="py-2.5 px-2">{item.times.fajr}</td>
                        <td className="py-2.5 px-2 text-stone-400">{item.times.sunrise}</td>
                        <td className="py-2.5 px-2">{item.times.dhuhr}</td>
                        <td className="py-2.5 px-2">{item.times.asr}</td>
                        <td className="py-2.5 px-2">{item.times.maghrib}</td>
                        <td className="py-2.5 px-2">{item.times.isha}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-border bg-surface-2 text-center text-[11px] text-muted-foreground">
              {isAr
                ? `حسابات فلكية شمسية دقيقة وفق إحداثيات خط العرض ${activeCity.latitude}° وخط الطول ${activeCity.longitude}° — تتجدد تلقائياً`
                : `Accurate astronomical calculations based on Lat ${activeCity.latitude}°, Lng ${activeCity.longitude}° — auto-updating continuously`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
