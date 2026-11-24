import React, { useState, useEffect, useMemo } from "react";
import {
  calculateDailyPrayerTimes,
  VERIFIED_PRAYER_CITIES,
  PRAYER_CALCULATION_METHODS,
  type PrayerTimeCity,
  type PrayerCalculationMethodKey,
  type PrayerTimesResult,
} from "@/data/islamic-center";
import { toArabicIndicDigits } from "@/lib/quran";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  Clock,
  Compass,
  MapPin,
  Calendar,
  Settings,
  Navigation,
  Sun,
  Sunrise,
  Sunset,
  Moon,
} from "lucide-react";

interface PrayerTimesCardProps {
  lang?: string;
}

export const PrayerTimesCard: React.FC<PrayerTimesCardProps> = ({ lang = "ar" }) => {
  const [selectedCityId, setSelectedCityId] = useState<string>("sa_makkah");
  const [selectedMethod, setSelectedMethod] = useState<PrayerCalculationMethodKey>("makkah");
  const [customCoords, setCustomCoords] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Update clock every second for live countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    return (
      VERIFIED_PRAYER_CITIES.find((c) => c.id === selectedCityId) ?? VERIFIED_PRAYER_CITIES[0]!
    );
  }, [selectedCityId, customCoords, selectedMethod]);

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
            name: "موقعي الحالي",
          });
        },
        (err) => {
          console.warn("Geolocation denied or unavailable:", err);
        },
      );
    }
  };

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

  return (
    <div className="w-full flex flex-col gap-6" dir="rtl">
      {/* City & Method Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* City Picker */}
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="space-y-0.5">
            <div className="text-[10px] text-stone-500 font-bold uppercase">المدينة / الدولة</div>
            <ModernSelect
              value={customCoords ? "custom" : selectedCityId}
              onValueChange={(val) => {
                if (val === "custom") {
                  handleUseGeolocation();
                } else {
                  setCustomCoords(null);
                  setSelectedCityId(val);
                }
              }}
              ariaLabel="تحديد المدينة لمواقيت الصلاة"
              size="sm"
              className="w-52"
              options={[
                ...(customCoords ? [{ value: "custom", label: "موقعي الجغرافي الحالي" }] : []),
                ...VERIFIED_PRAYER_CITIES.map((c) => ({
                  value: c.id,
                  label: `${c.nameAr} (${c.countryAr})`,
                })),
              ]}
            />
          </div>

          <button
            onClick={handleUseGeolocation}
            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-emerald-600 transition-colors"
            title="تحديد الموقع الجغرافي تلقائياً"
            aria-label="تحديد الموقع عبر الجي بي إس"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Calculation Method Picker */}
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-stone-400 shrink-0" />
          <div className="space-y-0.5">
            <div className="text-[10px] text-stone-500 font-bold uppercase">
              طريقة الحساب الفلكي
            </div>
            <ModernSelect
              value={selectedMethod}
              onValueChange={(val) => setSelectedMethod(val as PrayerCalculationMethodKey)}
              ariaLabel="تحديد طريقة حساب مواقيت الصلاة"
              size="sm"
              className="w-56"
              options={Object.entries(PRAYER_CALCULATION_METHODS).map(([k, m]) => ({
                value: k,
                label: m.nameAr,
              }))}
            />
          </div>
        </div>

        {/* 7-Day Schedule Button */}
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
          aria-label="عرض جدول مواقيت الأسبوع"
        >
          <Calendar className="w-4 h-4 text-stone-500" />
          <span>جدول ٧ أيام</span>
        </button>
      </div>

      {/* Hero Countdown to Next Prayer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-6 text-white shadow-lg border border-emerald-600/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>الصلاة القادمة</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif">
              صلاة {prayerTimes.nextPrayer.nameAr}
            </h3>
            <p className="text-xs text-emerald-100/80">
              يحين وقت الأذان عند الساعة {prayerTimes.nextPrayer.time} بحسب التوقيت المحلي لمدينة{" "}
              {activeCity.nameAr}
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center sm:items-end gap-1 shrink-0">
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-widest text-amber-300 drop-shadow">
              {formatRemainingMs(prayerTimes.nextPrayer.remainingMs)}
            </div>
            <div className="text-[11px] text-emerald-200">
              متبقي حتى رفع أذان {prayerTimes.nextPrayer.nameAr}
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
              className={`p-4 rounded-xl border transition-all text-center flex flex-col items-center justify-between gap-2.5 ${
                isNext
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/30"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-[11px] font-bold ${
                    isNext ? "text-emerald-700 dark:text-emerald-300" : "text-stone-500"
                  }`}
                >
                  {p.nameAr}
                </span>
                <Icon className={`w-4 h-4 ${isNext ? "text-emerald-600" : "text-stone-400"}`} />
              </div>

              <div className="text-xl sm:text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
                {p.time}
              </div>

              <div className="w-full text-center">
                {isNext ? (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    القادمة
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-mono">{p.nameEn}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 7-Days Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
              <div className="font-bold text-sm text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>جدول مواقيت الصلاة للأيام السبعة القادمة — {activeCity.nameAr}</span>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-x-auto p-4">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-500 font-bold">
                    <th className="py-2.5 px-3 text-right">اليوم والتاريخ</th>
                    <th className="py-2.5 px-2">الفجر</th>
                    <th className="py-2.5 px-2">الشروق</th>
                    <th className="py-2.5 px-2">الظهر</th>
                    <th className="py-2.5 px-2">العصر</th>
                    <th className="py-2.5 px-2">المغرب</th>
                    <th className="py-2.5 px-2">العشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono">
                  {sevenDaysSchedule.map((item, idx) => {
                    const isToday = idx === 0;
                    return (
                      <tr
                        key={idx}
                        className={
                          isToday
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 font-bold text-emerald-950 dark:text-emerald-200"
                            : "text-stone-700 dark:text-stone-300"
                        }
                      >
                        <td className="py-2.5 px-3 text-right font-sans font-semibold">
                          {item.date.toLocaleDateString("ar-SA", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                          {isToday && " (اليوم)"}
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

            <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-center text-[11px] text-stone-500">
              حسابات فلكية شمسية دقيقة وفق إحداثيات خط العرض {activeCity.latitude}° وخط الطول{" "}
              {activeCity.longitude}°
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
