import React, { useState, useMemo } from "react";
import {
  Coins,
  Calculator,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface ZakatCalculatorPanelProps {
  lang?: string;
}

export const ZakatCalculatorPanel: React.FC<ZakatCalculatorPanelProps> = ({ lang = "ar" }) => {
  const isAr = lang === "ar";

  // Financial inputs
  const [currency, setCurrency] = useState<string>("KWD");
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(24); // Estimated KWD / gram 24k
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0.32); // Estimated KWD / gram silver
  const [nisabStandard, setNisabStandard] = useState<"gold" | "silver">("gold");

  // Assets
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [bankSavings, setBankSavings] = useState<number>(0);
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [businessMerchandise, setBusinessMerchandise] = useState<number>(0);
  const [sharesAndInvestments, setSharesAndInvestments] = useState<number>(0);

  // Deductibles
  const [immediateDebts, setImmediateDebts] = useState<number>(0);

  // Calculations
  const goldValue = useMemo(() => goldGrams * goldPricePerGram, [goldGrams, goldPricePerGram]);
  const silverValue = useMemo(
    () => silverGrams * silverPricePerGram,
    [silverGrams, silverPricePerGram],
  );

  const totalZakatableAssets = useMemo(() => {
    return (
      (cashInHand || 0) +
      (bankSavings || 0) +
      goldValue +
      silverValue +
      (businessMerchandise || 0) +
      (sharesAndInvestments || 0)
    );
  }, [cashInHand, bankSavings, goldValue, silverValue, businessMerchandise, sharesAndInvestments]);

  const netZakatableWealth = useMemo(() => {
    return Math.max(0, totalZakatableAssets - (immediateDebts || 0));
  }, [totalZakatableAssets, immediateDebts]);

  // Nisab thresholds: 85g gold or 595g silver
  const goldNisabValue = useMemo(() => 85 * goldPricePerGram, [goldPricePerGram]);
  const silverNisabValue = useMemo(() => 595 * silverPricePerGram, [silverPricePerGram]);
  const currentNisabValue = nisabStandard === "gold" ? goldNisabValue : silverNisabValue;

  const isNisabReached = netZakatableWealth >= currentNisabValue;
  const zakatDue = isNisabReached ? netZakatableWealth * 0.025 : 0;

  // The 8 Quranic Recipient Categories from Surah At-Tawbah: 60
  const zakatRecipients = [
    {
      id: "fuqara",
      titleAr: "١. الفقراء",
      titleEn: "1. Al-Fuqara (The Poor)",
      descAr: "من لا يجدون كفايتهم الأساسية من مأكل وملبس ومسكن، ولا يملكون نصف ما يكفيهم.",
      descEn:
        "Those who do not have enough means to cover even half of their basic food, clothing, and shelter.",
    },
    {
      id: "masakin",
      titleAr: "٢. المساكين",
      titleEn: "2. Al-Masakin (The Needy)",
      descAr: "من يملكون نصف كفايتهم أو أكثر ولكنها لا تسد جميع حاجاتهم الضرورية.",
      descEn: "Those who have some income but not enough to cover essential livelihood needs.",
    },
    {
      id: "amilin",
      titleAr: "٣. العاملون عليها",
      titleEn: "3. Al-Amilina Alayha (Zakat Administrators)",
      descAr:
        "الجباة والموزعون والمحاسبون القائمون على جمع وتوزيع الزكاة بإذن الحاكم أو المؤسسة المعتمدة.",
      descEn: "Authorized collectors and administrators appointed to gather and distribute Zakat.",
    },
    {
      id: "muallafah",
      titleAr: "٤. المؤلفة قلوبهم",
      titleEn: "4. Al-Mu'allafatu Qulubuhum (Those Inclined)",
      descAr: "الذين يُرجى إسلامهم أو تثبيت إيمانهم أو دفع شرهم وكسب نصرتهم للإسلام والمسلمين.",
      descEn:
        "Those whose hearts are to be softened or reconciled towards Islam and communal harmony.",
    },
    {
      id: "riqab",
      titleAr: "٥. في الرقاب",
      titleEn: "5. Fir-Riqab (Liberation of Captives)",
      descAr: "تحرير الأسرى والمستضعفين ومساعدة المكاتبين والعمال المقهورين على فكاك رقابهم.",
      descEn: "Freeing captives, slaves, or heavily bonded exploited workers seeking freedom.",
    },
    {
      id: "gharimin",
      titleAr: "٦. الغارمون",
      titleEn: "6. Al-Gharimin (The Debt-Laden)",
      descAr: "من تحملوا ديوناً مشروعة لعلاج أو إصلاح ذات البين أو حاجة ملحة وعجزوا عن سدادها.",
      descEn:
        "People overwhelmed by legitimate debts for medical care, reconciliation, or basic survival with no means to pay.",
    },
    {
      id: "sabilillah",
      titleAr: "٧. في سبيل الله",
      titleEn: "7. Fi Sabilillah (In the Cause of Allah)",
      descAr:
        "الجهاد المشروع والدفاع عن الأمة، وإعلاء كلمة الله، ودعم طلب العلم الشرعي وطباعة المصاحف ونشر الدين.",
      descEn:
        "Legitimate defense, supporting sincere Islamic scholarship, printing authentic Quran copies, and spreading divine knowledge.",
    },
    {
      id: "ibn_sabil",
      titleAr: "٨. ابن السبيل",
      titleEn: "8. Ibn As-Sabil (The Stranded Traveler)",
      descAr:
        "المسافر المنقطع عن ماله وبلده، فيُعطى ما يبلغه إلى مقصده أو بلده ولو كان غنياً في وطنه.",
      descEn:
        "The traveler cut off from their funds and stranded away from home, given enough to reach their destination.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-teal-950/15 to-transparent p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Coins className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {isAr ? "حاسبة الزكاة الشرعية الذكية" : "Comprehensive Smart Zakat Calculator"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? "احسب زكاة مالك بدقة وسهولة وفق النصاب الشرعي (٢.٥٪) واطّلع على مصارف الزكاة الثمانية المذكورة في القرآن الكريم."
                : "Calculate your mandatory annual Zakat with exact Nisab precision (2.5%) and explore the eight Quranic recipient categories."}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-1.5 text-xs">
            <span className="px-2 text-muted-foreground">{isAr ? "العملة:" : "Currency:"}</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-lg bg-surface-1 px-2.5 py-1 text-xs font-bold text-foreground border border-border outline-none cursor-pointer"
            >
              <option value="KWD">د.ك (KWD)</option>
              <option value="SAR">ر.س (SAR)</option>
              <option value="AED">د.إ (AED)</option>
              <option value="QAR">ر.ق (QAR)</option>
              <option value="USD">$ (USD)</option>
              <option value="EUR">€ (EUR)</option>
              <option value="TRY">₺ (TRY)</option>
              <option value="PKR">Rs (PKR)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left / Input Section (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          {/* Nisab Reference Settings */}
          <div className="surface-card rounded-2xl border border-border p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-emerald-500" />
                <span>
                  {isAr ? "معيار النصاب والأسعار الحالية" : "Nisab Standard & Unit Prices"}
                </span>
              </h3>
              <div className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setNisabStandard("gold")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    nisabStandard === "gold"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "نصاب الذهب (٨٥غ)" : "Gold (85g)"}
                </button>
                <button
                  type="button"
                  onClick={() => setNisabStandard("silver")}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all ${
                    nisabStandard === "silver"
                      ? "bg-slate-400 text-slate-950 font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isAr ? "نصاب الفضة (٥٩٥غ)" : "Silver (595g)"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  {isAr
                    ? `سعر غرام الذهب عيار ٢٤ (${currency})`
                    : `Gold 24k Price / gram (${currency})`}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={goldPricePerGram}
                  onChange={(e) => setGoldPricePerGram(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-foreground focus:border-emerald-500 outline-none"
                />
                <span className="text-[10px] text-muted-foreground">
                  {isAr
                    ? `نصاب الذهب: ${(85 * goldPricePerGram).toLocaleString()} ${currency}`
                    : `Nisab: ${(85 * goldPricePerGram).toLocaleString()} ${currency}`}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  {isAr ? `سعر غرام الفضة (${currency})` : `Silver Price / gram (${currency})`}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={silverPricePerGram}
                  onChange={(e) => setSilverPricePerGram(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-foreground focus:border-emerald-500 outline-none"
                />
                <span className="text-[10px] text-muted-foreground">
                  {isAr
                    ? `نصاب الفضة: ${(595 * silverPricePerGram).toLocaleString()} ${currency}`
                    : `Nisab: ${(595 * silverPricePerGram).toLocaleString()} ${currency}`}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Inputs */}
          <div className="surface-card rounded-2xl border border-border p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Coins className="size-4 text-emerald-500" />
              <span>
                {isAr
                  ? "الأموال الزكوية التي حال عليها الحول"
                  : "Zakatable Assets (Held 1 Hijri Year)"}
              </span>
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "السيولة النقدية في اليد" : "Cash in Hand"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashInHand || ""}
                  placeholder="0"
                  onChange={(e) => setCashInHand(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "الودائع والحسابات البنكية" : "Bank Accounts & Savings"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={bankSavings || ""}
                  placeholder="0"
                  onChange={(e) => setBankSavings(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "الذهب المدخر (بالغرام)" : "Gold Savings (in grams)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={goldGrams || ""}
                    placeholder="0"
                    onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                  />
                  <span className="absolute end-3 top-2.5 text-xs text-muted-foreground">غرام</span>
                </div>
                {goldGrams > 0 && (
                  <span className="text-[10px] text-amber-500 font-medium">
                    = {goldValue.toLocaleString()} {currency}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "الفضة المدخرة (بالغرام)" : "Silver Savings (in grams)"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={silverGrams || ""}
                    placeholder="0"
                    onChange={(e) => setSilverGrams(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                  />
                  <span className="absolute end-3 top-2.5 text-xs text-muted-foreground">غرام</span>
                </div>
                {silverGrams > 0 && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    = {silverValue.toLocaleString()} {currency}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "عروض التجارة والبضائع" : "Business Merchandise / Inventory"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessMerchandise || ""}
                  placeholder="0"
                  onChange={(e) => setBusinessMerchandise(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  {isAr ? "الأسهم والصناديق الاستثمارية" : "Stocks & Investment Shares"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={sharesAndInvestments || ""}
                  placeholder="0"
                  onChange={(e) => setSharesAndInvestments(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Deductibles */}
          <div className="surface-card rounded-2xl border border-border p-4 sm:p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="size-4 text-rose-500" />
              <span>
                {isAr
                  ? "الخصوم والديون العاجلة المستحقة السداد"
                  : "Deductible Immediate Liabilities"}
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "تُخصم الديون والالتزامات المالية التي حان موعد سدادها الفعلي قبل إخراج الزكاة."
                : "Deduct short-term debts and dues that must be settled immediately before calculating Zakat."}
            </p>
            <input
              type="number"
              min="0"
              value={immediateDebts || ""}
              placeholder="0"
              onChange={(e) => setImmediateDebts(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-foreground focus:border-rose-500 outline-none"
            />
          </div>
        </div>

        {/* Right / Calculation Result & Summary (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          <div className="surface-card sticky top-20 rounded-2xl border-2 border-emerald-500/30 bg-surface-1 p-5 sm:p-6 space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isAr ? "ملخص الحساب الشرعي" : "Zakat Calculation Summary"}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                2.5% (١/٤٠)
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isAr ? "إجمالي الأصول الزكوية:" : "Total Assets:"}
                </span>
                <span className="font-bold text-foreground">
                  {totalZakatableAssets.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {isAr ? "الديون المخصومة:" : "Deductible Debts:"}
                </span>
                <span className="font-bold text-rose-500">
                  -{immediateDebts.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-2 font-semibold">
                <span className="text-foreground">
                  {isAr ? "صافي الوعاء الزكوي:" : "Net Zakatable Wealth:"}
                </span>
                <span className="text-sm font-bold text-foreground">
                  {netZakatableWealth.toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{isAr ? "حد النصاب المعتمد:" : "Selected Nisab Threshold:"}</span>
                <span>
                  {currentNisabValue.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Nisab Status Card */}
            <div
              className={`rounded-xl border p-4 space-y-2 text-center ${
                isNisabReached
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm">
                {isNisabReached ? (
                  <>
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    <span>
                      {isAr ? "بلغ النصاب الشرعي (تجب الزكاة)" : "Nisab Reached (Zakat is Due)"}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-4 shrink-0 text-amber-500" />
                    <span>
                      {isAr ? "لم يبلغ النصاب (لا تجب الزكاة)" : "Below Nisab (No Zakat Due)"}
                    </span>
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isNisabReached
                  ? isAr
                    ? "إذا حال على هذا المال حول قمري كامل (عام هجري)، فيجب إخراج ربع العشر (٢.٥٪)."
                    : "If this wealth has been in your possession for one complete lunar year, 2.5% is mandatory."
                  : isAr
                    ? "المال أقل من النصاب الشرعي المطلوب، ولا زكاة فيه إلا إذا رغبت في التصدق تطوعاً."
                    : "Your net wealth is below the minimum threshold. Zakat is not mandatory, but voluntary Sadaqah is beloved."}
              </p>
            </div>

            {/* Final Zakat Due */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center space-y-1">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {isAr ? "مقدار الزكاة الواجب إخراجها" : "Total Zakat Payable"}
              </span>
              <div className="font-display text-3xl font-extrabold text-foreground">
                {zakatDue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                <span className="text-sm font-bold text-emerald-500">{currency}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-3 text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>{isAr ? "بركة الزكاة في القرآن الكريم" : "Blessing of Zakat"}</span>
              </div>
              <p className="italic">
                {isAr
                  ? "«خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ وَتُزَكِّيهِم بِهَا وَصَلِّ عَلَيْهِمْ ۖ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ» [التوبة: ١٠٣]"
                  : "“Take from their wealth a charity by which you purify them and cause them increase...” [At-Tawbah: 103]"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The 8 Quranic Recipient Categories */}
      <div className="surface-card rounded-2xl border border-border p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-emerald-500" />
            <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
              {isAr
                ? "مصارف الزكاة الثمانية الشرعية (سورة التوبة: آية ٦٠)"
                : "The Eight Quranic Recipients of Zakat (At-Tawbah: 60)"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isAr
              ? "﴿إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ وَالْعَامِلِينَ عَلَيْهَا وَالْمُؤَلَّفَةِ قُلُوبُهُمْ وَفِي الرِّقَابِ وَالْغَارِمِينَ وَفِي سَبِيلِ اللَّهِ وَابْنِ السَّبِيلِ ۖ فَرِيضَةً مِّنَ اللَّهِ ۗ وَاللَّهُ عَلِيمٌ حَكِيمٌ﴾"
              : "“Zakah expenditures are only for the poor and for the needy and for those employed to collect [them] and for bringing hearts together and for freeing captives and for those in debt and for the cause of Allah and for the [stranded] traveler - an obligation [imposed] by Allah. And Allah is Knowing and Wise.”"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {zakatRecipients.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-border bg-surface-2 p-3.5 space-y-1.5 transition-colors hover:border-emerald-500/40"
            >
              <h4 className="font-bold text-xs text-foreground">
                {isAr ? cat.titleAr : cat.titleEn}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {isAr ? cat.descAr : cat.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
